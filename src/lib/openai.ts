import { dataHoraLocal, grau, periodoDoDia } from "./format";
import { formatarPrompt } from "./prompt-log";
import { promptPreenchido } from "./prompts";
import type { Previsao } from "./previsao";
import { GUIA_PADRAO, type GuiaRegional } from "./regionalidade";
import type { OpenWeatherResponse } from "./types";

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

/**
 * Pede a OpenAI uma analise descontraida da previsao, escrita com o jeito de
 * falar de quem mora na cidade - girias e ritmo da regiao, sem virar caricatura.
 * O texto ja sai pronto para ser lido em voz alta pelo TTS.
 */
export type AnaliseGerada = {
  texto: string;
  /** Mensagem enviada ao modelo, guardada no historico de consultas. */
  prompt: string;
  modelo: string;
};

/** Analise mais o mp3, quando o modelo de audio escreve e narra de uma vez. */
export type AnaliseFalada = AnaliseGerada & { audio: Uint8Array };

type Mensagens = { instrucoes: string; resumo: string };

/**
 * O que vem pela frente, em uma linha.
 *
 * Sem isto a analise falava so do instante e envelhecia junto com ele: escrita
 * as 9h, as 11h ja estava velha. Com as proximas horas no boletim, o texto
 * passa a ser sobre o DIA - e um audio de duas horas atras continua verdadeiro.
 */
function linhaDaPrevisao(previsao: Previsao | null | undefined): string | null {
  const pontos = previsao?.pontos?.slice(0, 5) ?? [];
  if (pontos.length === 0) return null;

  const hora = (epoch: number) =>
    `${new Date((epoch + (previsao?.offset ?? 0)) * 1000).getUTCHours()}h`;

  const trechos = pontos.map((p) => {
    const chuva = p.chuva >= 0.3 ? `, ${Math.round(p.chuva * 100)}% de chuva` : "";
    return `${hora(p.epoch)} ${Math.round(p.temp)}C${chuva}`;
  });

  return `Proximas horas (de 3 em 3): ${trechos.join("; ")}`;
}

/**
 * Instrucao de sistema e boletim de dados - identicos nos dois caminhos.
 *
 * Ficam juntos aqui de proposito: se o caminho falado montasse o proprio
 * resumo, uma correcao no boletim passaria a valer so em metade do app.
 */
async function montarMensagens(
  dados: OpenWeatherResponse,
  local: string,
  guia: GuiaRegional,
  /** Comparacao com os dias anteriores; entra no boletim como mais um dado. */
  comparativo?: string | null,
  /** Faixa das proximas horas, para o texto falar do dia e nao do minuto. */
  previsao?: Previsao | null,
): Promise<Mensagens> {
  const tz = dados.timezone;

  const periodo = periodoDoDia(dados.dt, tz);
  const solNoCeu = !dados.weather?.[0]?.icon?.endsWith("n");
  const aFrente = linhaDaPrevisao(previsao);

  const resumo = [
    `Cidade: ${local}`,
    `Hora local agora: ${String(periodo.hora).padStart(2, "0")}h (${periodo.nome})`,
    `Saudacao correta para esta hora: "${periodo.saudacao}"`,
    `O sol ${solNoCeu ? "esta no ceu" : "ja se pos - esta escuro la fora"}`,
    `Condicao: ${dados.weather?.[0]?.description ?? "desconhecida"}`,
    `Temperatura atual: ${grau(dados.main?.temp)}`,
    `Sensacao termica: ${grau(dados.main?.feels_like)}`,
    `Maxima: ${grau(dados.main?.temp_max)} / Minima: ${grau(dados.main?.temp_min)}`,
    `Umidade: ${dados.main?.humidity ?? "?"}%`,
    `Vento: ${dados.wind?.speed ?? "?"} m/s`,
    `Nuvens: ${dados.clouds?.all ?? "?"}%`,
    `Nascer do sol: ${dataHoraLocal(dados.sys?.sunrise, tz)}`,
    `Por do sol: ${dataHoraLocal(dados.sys?.sunset, tz)}`,
    `Momento da medicao (hora local): ${dataHoraLocal(dados.dt, tz)}`,
    // Percepcao local: so aparece quando o historico tem com o que comparar.
    ...(comparativo ? [comparativo] : []),
    ...(aFrente ? [aFrente] : []),
  ].join("\n");

  // Vem do banco quando editado no painel; senao, do padrao de fabrica.
  const instrucoes = await promptPreenchido("clima_analise", {
    local,
    hora: String(periodo.hora).padStart(2, "0"),
    periodo: periodo.nome,
    saudacao: periodo.saudacao,
    girias_locais: guia.girias,
    dica_vestuario: guia.vestuario,
  });

  return { instrucoes, resumo };
}

export async function gerarAnalise(
  dados: OpenWeatherResponse,
  /** Nome da localidade vindo do geocoding - ver `paraLinhaClima`. */
  local: string,
  /** Girias e vestuario da regiao; sem guia, o texto generico de fabrica. */
  guia: GuiaRegional = GUIA_PADRAO,
  comparativo?: string | null,
  previsao?: Previsao | null,
): Promise<AnaliseGerada> {
  const chave = process.env.OPENAI_API_KEY;
  if (!chave) throw new Error("OPENAI_API_KEY nao configurada no .env.local");

  const modelo = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const { instrucoes, resumo } = await montarMensagens(
    dados,
    local,
    guia,
    comparativo,
    previsao,
  );

  const resposta = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${chave}`,
    },
    body: JSON.stringify({
      model: modelo,
      temperature: 0.9,
      max_tokens: 300,
      messages: [
        { role: "system", content: instrucoes },
        { role: "user", content: resumo },
      ],
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(`OpenAI respondeu ${resposta.status}: ${detalhe.slice(0, 300)}`);
  }

  const json = await resposta.json();
  const texto: string = json?.choices?.[0]?.message?.content?.trim() ?? "";
  if (!texto) throw new Error("OpenAI devolveu uma resposta vazia.");

  return {
    texto,
    // conversa completa, nao so a pergunta: as instrucoes do sistema sao o
    // que voce ajusta quando a analise sai errada
    prompt: formatarPrompt([
      { role: "system", content: instrucoes },
      { role: "user", content: resumo },
    ]),
    modelo,
  };
}

/**
 * Escreve e narra numa chamada so, com os modelos de audio (`gpt-audio-mini`).
 *
 * Vale pela pronuncia: quem conhece a giria e quem a fala e o mesmo modelo,
 * entao "tche", "bah" e "cacetinho" saem com o sotaque certo em vez de lidos
 * por um TTS que nunca viu a palavra.
 *
 * Ligado so quando `OPENAI_AUDIO_MODEL` existe. Qualquer falha aqui deve cair
 * no caminho de dois passos - e o que preserva a garantia antiga de que o card
 * aparece mesmo quando o audio nao sai.
 */
export async function gerarAnaliseFalada(
  dados: OpenWeatherResponse,
  local: string,
  guia: GuiaRegional = GUIA_PADRAO,
  comparativo?: string | null,
  previsao?: Previsao | null,
): Promise<AnaliseFalada> {
  const chave = process.env.OPENAI_API_KEY;
  if (!chave) throw new Error("OPENAI_API_KEY nao configurada no .env.local");

  const modelo = process.env.OPENAI_AUDIO_MODEL?.trim();
  if (!modelo) throw new Error("OPENAI_AUDIO_MODEL nao configurada.");

  // Mesma regra do TTS: a voz da regiao vence a do ambiente.
  const voz = guia.voz || process.env.OPENAI_TTS_VOICE || "coral";
  const { instrucoes, resumo } = await montarMensagens(
    dados,
    local,
    guia,
    comparativo,
    previsao,
  );

  // A direcao de voz e o mesmo prompt do TTS: continua editavel no painel, so
  // que aqui ela entra junto da instrucao de escrita, na mesma mensagem.
  const direcao = await promptPreenchido("tts_narracao", {
    local,
    tracos_foneticos_tts: guia.foneticaTts,
  });
  const sistema = `${instrucoes}\n\n${direcao}`;

  const resposta = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${chave}`,
    },
    body: JSON.stringify({
      model: modelo,
      modalities: ["text", "audio"],
      audio: { voice: voz, format: "mp3" },
      temperature: 0.9,
      messages: [
        { role: "system", content: sistema },
        { role: "user", content: resumo },
      ],
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(
      `OpenAI (audio) respondeu ${resposta.status}: ${detalhe.slice(0, 300)}`,
    );
  }

  const json = await resposta.json();
  const audio = json?.choices?.[0]?.message?.audio;
  // O texto do card e a transcricao do que foi falado, nao uma segunda geracao:
  // com dois textos diferentes, card e audio poderiam divergir.
  const texto: string = audio?.transcript?.trim() ?? "";
  const base64: string = audio?.data ?? "";

  if (!texto || !base64) {
    throw new Error("O modelo de audio nao devolveu texto e mp3.");
  }

  return {
    texto,
    audio: Uint8Array.from(Buffer.from(base64, "base64")),
    prompt: formatarPrompt([
      { role: "system", content: sistema },
      { role: "user", content: resumo },
    ]),
    modelo,
  };
}
