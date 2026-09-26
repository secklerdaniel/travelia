import { NextResponse } from "next/server";

import { HORAS_ENTRE_CONSULTAS } from "@/config/limites";
import { tempoRestante } from "@/lib/format";
import { buscarLocalidade } from "@/lib/geocoding";
import { gerarAnalise, gerarAnaliseFalada } from "@/lib/openai";
import {
  buscarClimaPorCoordenadas,
  ClimaError,
  paraLinhaClima,
} from "@/lib/openweather";
import {
  localityStorageKey,
  normalizeCitySearch,
} from "@/lib/search/normalizeCitySearch";
import { registrarConsulta } from "@/lib/consultas";
import { variacaoRecente } from "@/lib/percepcao";
import { buscarPrevisao } from "@/lib/previsao";
import { buscarGuiaRegional } from "@/lib/regionalidade";
import { db } from "@/lib/db";
import { gerarAudio } from "@/lib/tts";
import type { Clima } from "@/lib/types";
import { obterVisitante } from "@/lib/visitante";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function erro(mensagem: string, status = 500) {
  return NextResponse.json({ erro: mensagem }, { status });
}

/** GET /api/clima -> todas as previsoes salvas, mais recente primeiro. */
export async function GET() {
  try {
    const climas = (await db()`
      select * from clima_cidades order by atualizado_em desc
    `) as unknown as Clima[];
    return NextResponse.json({ climas });
  } catch (e) {
    return erro(e instanceof Error ? e.message : "Erro inesperado.", 500);
  }
}

/**
 * POST /api/clima  { cidade: "Canela,BR" }
 *
 * Fluxo: OpenWeather -> salva/atualiza no Supabase -> analise na OpenAI ->
 * audio na ElevenLabs -> salva texto e audio na mesma linha.
 *
 * Se a IA ou o TTS falharem, os dados do clima ja ficaram salvos e o problema
 * volta em `avisos` - o card aparece mesmo sem audio.
 */
type Origem = {
  cidade?: string;
  uf?: string | null;
  pais?: string | null;
  lat?: number;
  lon?: number;
};

export async function POST(req: Request) {
  let cidadeBruta = "";
  let origem: Origem | null = null;
  try {
    const body = await req.json();
    cidadeBruta = typeof body?.cidade === "string" ? body.cidade : "";
    origem = body?.origem ?? null;
  } catch {
    return erro("Corpo da requisicao invalido.", 400);
  }

  // Normalizacao so melhora a busca; o nome exibido vem sempre da OpenWeather.
  const consulta = normalizeCitySearch(cidadeBruta);
  if (!consulta) return erro("Digite o nome de uma cidade.", 400);

  const avisos: string[] = [];
  const comecou = Date.now();
  const visitante = await obterVisitante();

  try {
    // 1. Resolve o termo em coordenadas e busca o clima por lat/lon.
    //    A chave do banco so existe depois disto: ela sai da localidade
    //    resolvida, para toda grafia da mesma cidade cair na mesma linha.
    const localidade = await buscarLocalidade(consulta);
    const cityQuery = localityStorageKey(localidade.nome, localidade.pais);

    // 2. Linha atual desta cidade: serve para a trava diaria e para saber qual
    //    mp3 apagar depois que o novo subir.
    const anterior = ((await db().query(
      `select * from clima_cidades where city_query = $1`,
      [cityQuery],
    )) as unknown as Clima[])[0] as Clima | undefined;

    // 3. Trava por intervalo: cada consulta refaz clima + analise + audio, e
    //    duas horas e o tempo em que a previsao de fato muda. Checada ANTES
    //    do clima e das chamadas de IA - e o ponto do limite.
    if (anterior && HORAS_ENTRE_CONSULTAS > 0) {
      const linha = anterior as Clima;
      const janela = HORAS_ENTRE_CONSULTAS * 60 * 60 * 1000;
      const desde = Date.now() - new Date(linha.atualizado_em).getTime();

      if (desde < janela) {
        return NextResponse.json({
          clima: linha,
          avisos: [],
          bloqueada: true,
          mensagem:
            `${linha.nome} foi consultada há pouco. ` +
            `Nova consulta em ${tempoRestante(janela - desde)}.`,
        });
      }
    }

    const dados = await buscarClimaPorCoordenadas(localidade.lat, localidade.lon);

    // 3. Salva/atualiza todos os dados do clima
    // Colunas montadas a partir do proprio objeto: `paraLinhaClima` e a fonte
    // da verdade do formato, e listar 30 nomes aqui so criaria um segundo
    // lugar para esquecer de atualizar.
    const valores = paraLinhaClima(dados, cityQuery, localidade) as Record<
      string,
      unknown
    >;
    const colunas = Object.keys(valores);
    const marcadores = colunas.map(
      (c, i) => `$${i + 1}${c === "raw" ? "::jsonb" : ""}`,
    );
    const atualiza = colunas
      .filter((c) => c !== "city_query")
      .map((c) => `${c} = excluded.${c}`);

    const linha = ((await db().query(
      `insert into clima_cidades (${colunas.join(", ")})
       values (${marcadores.join(", ")})
       on conflict (city_query) do update
         set ${atualiza.join(", ")}, atualizado_em = now()
       returning *`,
      colunas.map((c) =>
        c === "raw" ? JSON.stringify(valores[c]) : valores[c],
      ),
    )) as unknown as Clima[])[0];

    if (!linha) return erro("Nao consegui salvar a previsao no banco.", 500);

    // 4. Analise descontraida com sotaque local (OpenAI)
    const local = [localidade.nome, localidade.pais].filter(Boolean).join(", ");

    // O guia regional e buscado UMA vez e serve aos dois prompts: o texto usa
    // as girias e o vestuario, a narracao usa os tracos foneticos. Buscar duas
    // vezes abriria espaco para o texto sair de uma cidade e a voz de outra.
    const guia = await buscarGuiaRegional(local, localidade.estado);

    // Percepcao local: o que mudou desde os dias anteriores nesta cidade.
    const comparativo = await variacaoRecente(cityQuery, dados.main?.temp);

    // As proximas horas entram no boletim para a analise falar do DIA. E de
    // graca (OpenWeather) e nao pode derrubar a previsao: falhou, segue sem.
    const previsao = await buscarPrevisao(
      localidade.lat,
      localidade.lon,
      dados.main?.temp,
    ).catch((e) => {
      console.error("[clima] analise sem as proximas horas:", e);
      return null;
    });

    let analise: string | null = null;
    let promptUsado: string | null = null;
    let modeloUsado: string | null = null;
    /** Bytes do mp3: vao para a propria linha, na coluna `audio_mp3`. */
    let mp3: Uint8Array | null = null;

    /**
     * Caminho de uma chamada so: o modelo de audio escreve e narra junto.
     *
     * Ligado por `OPENAI_AUDIO_MODEL` - variavel vazia mantem o pipeline de
     * dois passos. Falhou aqui, o codigo abaixo assume: a previsao nunca fica
     * sem texto por causa de um experimento de voz.
     */
    if (process.env.OPENAI_AUDIO_MODEL?.trim()) {
      try {
        const falada = await gerarAnaliseFalada(dados, local, guia, comparativo, previsao);
        analise = falada.texto;
        promptUsado = falada.prompt;
        modeloUsado = falada.modelo;
        mp3 = falada.audio;
      } catch (e) {
        avisos.push(
          `Modelo de audio falhou, usando texto + TTS: ${e instanceof Error ? e.message : e}`,
        );
        analise = null;
        mp3 = null;
      }
    }

    if (!analise) {
      try {
        const gerada = await gerarAnalise(dados, local, guia, comparativo, previsao);
        analise = gerada.texto;
        promptUsado = gerada.prompt;
        modeloUsado = gerada.modelo;
      } catch (e) {
        avisos.push(`Analise nao gerada: ${e instanceof Error ? e.message : e}`);
      }
    }

    // 5. Audio da analise (OpenAI TTS)
    if (analise && !mp3) {
      try {
        mp3 = await gerarAudio(analise, local, guia);
      } catch (e) {
        avisos.push(`Audio nao gerado: ${e instanceof Error ? e.message : e}`);
      }
    }

    // 6. Grava texto e audio na mesma linha
    let final = linha as Clima;
    if (analise || mp3) {
      try {
        // O timestamp na URL existe para o navegador nao servir o mp3 antigo
        // do cache quando a pessoa clica em "Atualizar".
        const atualizada = ((await db().query(
          `update clima_cidades
              set analise_texto = $2,
                  audio_mp3 = case when $3::text is null then audio_mp3
                                   else decode($3, 'base64') end,
                  audio_url = $4
            where id = $1
            returning *`,
          [
            linha.id,
            analise,
            mp3 ? Buffer.from(mp3).toString("base64") : null,
            mp3 ? `/api/clima/audio/${linha.id}?v=${Date.now()}` : null,
          ],
        )) as unknown as Clima[])[0];
        if (atualizada) final = atualizada;
      } catch (e) {
        avisos.push(
          `Texto/audio nao salvos: ${e instanceof Error ? e.message : e}`,
        );
      }
    }


    // 8. Historico. Fica por ultimo e nunca lanca: e estatistica, nao pode
    //    custar a resposta de quem esta esperando a previsao.
    await registrarConsulta({
      tipo: "clima",
      visitante,
      cidade: final.nome,
      uf: localidade.estado,
      pais: final.pais,
      lat: final.lat,
      lon: final.lon,
      cityQuery,
      termoDigitado: cidadeBruta,
      origemCidade: origem?.cidade ?? null,
      origemUf: origem?.uf ?? null,
      origemPais: origem?.pais ?? null,
      origemLat: origem?.lat ?? null,
      origemLon: origem?.lon ?? null,
      condicaoId: final.condicao_id,
      condicaoDescricao: final.condicao_descricao,
      temp: final.temp,
      modelo: modeloUsado,
      prompt: promptUsado,
      sucesso: avisos.length === 0,
      erro: avisos.length ? avisos.join(" | ") : null,
      duracaoMs: Date.now() - comecou,
    });

    return NextResponse.json({ clima: final, avisos });
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : "Erro inesperado.";

    // Consulta que falhou tambem e dado: mostra o que o publico procurou e
    // nao encontrou, que e onde o app precisa melhorar.
    await registrarConsulta({
      tipo: "clima",
      visitante,
      cidade: consulta,
      termoDigitado: cidadeBruta,
      sucesso: false,
      erro: mensagem,
      duracaoMs: Date.now() - comecou,
    });

    if (e instanceof ClimaError) return erro(e.message, e.status);
    return erro(mensagem, 500);
  }
}

/** DELETE /api/clima?id=<uuid> -> apaga a previsao e o mp3 dela. */
export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return erro("Informe o id da previsao.", 400);

  try {
    await db().query(`delete from clima_cidades where id = $1`, [id]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return erro(e instanceof Error ? e.message : "Erro inesperado.", 500);
  }
}
