import { normalizeForCompare } from "./search/normalizeCitySearch";
import { nomeDoEstado } from "./search/ufs";
import { db } from "./db";

/**
 * Guia de regionalidade: girias, vestuario e fonetica de cada cidade/regiao.
 *
 * A tabela `regional_guides` e curada a mao. Antes dela o prompt pedia ao
 * modelo que "usasse as girias do lugar", e ele inventava - misturava sotaques,
 * repetia o mesmo bordao em cidades diferentes e as vezes citava termo que
 * ninguem fala. Agora o vocabulario chega pronto e o modelo so precisa
 * encaixa-lo no texto.
 *
 * Como nos prompts, o padrao de fabrica sustenta o app: banco fora do ar,
 * cidade sem linha cadastrada ou coluna vazia caem no texto generico e a
 * previsao sai do mesmo jeito.
 */

export const TABELA_GUIAS = "regional_guides";

export type GuiaRegional = {
  /** Rotulo da linha encontrada ("Porto Alegre / RS"); null quando e o padrao. */
  local: string | null;
  /** Ja em texto separado por virgula, pronto para o marcador do prompt. */
  girias: string;
  vestuario: string;
  foneticaTts: string;
  /**
   * Voz da OpenAI escolhida para a regiao.
   *
   * `null` cai no OPENAI_TTS_VOICE do ambiente - a voz e preferencia, nao
   * requisito: uma linha nova sem essa coluna preenchida continua narrando.
   */
  voz: string | null;
};

export const GUIA_PADRAO: GuiaRegional = {
  local: null,
  girias: "expressões e gírias típicas locais",
  vestuario: "roupa adequada para a temperatura atual",
  foneticaTts: "Sotaque natural, ritmo conversacional e boa dicção da região.",
  voz: null,
};

/** Colunas lidas da tabela; `voz_tts_id` e opcional por regiao. */
const COLUNAS =
  "local, girias_locais, dica_vestuario, tracos_foneticos_tts, voz_tts_id";

/** Colunas so das linhas regionais - ausentes em banco que nao migrou ainda. */
const COLUNAS_REGIAO = `${COLUNAS}, cidades_cobertas`;

type LinhaGuia = {
  local: string;
  girias_locais: string[] | null;
  dica_vestuario: string[] | null;
  tracos_foneticos_tts: string | null;
  voz_tts_id: string | null;
  cidades_cobertas?: string[] | null;
};

/**
 * Nome da cidade sem o resto do rotulo.
 *
 * Serve para os dois lados da comparacao: o app manda "Porto Alegre, BR" e a
 * tabela guarda "Porto Alegre / RS" ou "São Paulo / SP (Capital)".
 */
function apenasCidade(rotulo: string): string {
  return rotulo.split(/[,/(]/)[0].trim();
}

/**
 * UF declarada no rotulo.
 *
 * Procura qualquer sigla de estado solta no texto, nao so depois da barra:
 * "Porto Alegre / RS" e "Interior de SP" precisam funcionar do mesmo jeito.
 */
function ufDoRotulo(rotulo: string): string | null {
  const siglas = rotulo.toUpperCase().match(/\b[A-Z]{2}\b/g) ?? [];
  return siglas.find((s) => nomeDoEstado(s)) ?? null;
}

function texto(lista: string[] | null | undefined, padrao: string): string {
  const limpa = (lista ?? []).map((i) => i.trim()).filter(Boolean);
  return limpa.length ? limpa.join(", ") : padrao;
}

function paraGuia(linha: LinhaGuia): GuiaRegional {
  return {
    local: linha.local,
    girias: texto(linha.girias_locais, GUIA_PADRAO.girias),
    vestuario: texto(linha.dica_vestuario, GUIA_PADRAO.vestuario),
    foneticaTts:
      linha.tracos_foneticos_tts?.trim() || GUIA_PADRAO.foneticaTts,
    voz: linha.voz_tts_id?.trim() || null,
  };
}

/**
 * Melhor linha entre as candidatas.
 *
 * A UF e criterio de exclusao, nao so de desempate: existe Salvador na Bahia e
 * Salvador no Rio Grande do Sul, e narrar o gaucho com "meu rei" e sotaque
 * baiano seria pior do que nao ter guia nenhum.
 */
function escolher(
  linhas: LinhaGuia[],
  cidade: string,
  uf: string | null,
): LinhaGuia | null {
  const alvo = normalizeForCompare(cidade);

  const possiveis = linhas.filter((l) => {
    const ufDaLinha = ufDoRotulo(l.local);
    return !(uf && ufDaLinha && ufDaLinha !== uf);
  });
  if (possiveis.length === 0) return null;

  const mesmoNome = possiveis.filter(
    (l) => normalizeForCompare(apenasCidade(l.local)) === alvo,
  );
  const finalistas = mesmoNome.length ? mesmoNome : possiveis;

  return (
    (uf && finalistas.find((l) => ufDoRotulo(l.local) === uf)) ||
    finalistas[0]
  );
}

/**
 * Guia regional para uma cidade sem linha propria.
 *
 * Duas formas de cobertura, nesta ordem:
 *
 * 1. `cidades_cobertas` - a regiao lista quem ela atende. E o que separa
 *    Guaruja de Campinas: as duas sao do interior do mapa administrativo, mas
 *    uma e praia e a outra nao. Sem essa lista, o litoral paulista recebia
 *    botina e jaqueta de couro.
 * 2. `abrangencia = 'estado'` - o curinga, para quem nao esta em lista
 *    nenhuma ("Interior de SP" cobrindo o resto do estado).
 *
 * Consulta separada de proposito: colunas ausentes no banco morrem aqui e o
 * guia da cidade continua funcionando como antes.
 */
async function guiaDaRegiao(
  uf: string,
  cidade: string,
): Promise<LinhaGuia | null> {
  try {
    // Banco sem a coluna de cobertura ainda responde: perde a lista de cidades
    // e mantem o curinga. Degradar assim vale mais que desligar a regiao
    // inteira enquanto a migracao nao roda.
    const consultar = (colunas: string) =>
      db().query(
        `select ${colunas} from regional_guides where abrangencia = 'estado' limit 50`,
        [],
      ) as unknown as Promise<LinhaGuia[]>;

    // Banco sem a coluna de cobertura ainda responde: perde a lista de cidades
    // e mantem o curinga.
    const data = await consultar(COLUNAS_REGIAO).catch((e) => {
      console.error("[regionalidade] sem cobertura por cidade:", e);
      return consultar(COLUNAS);
    });

    const doEstado = data.filter(
      (l) => ufDoRotulo(l.local) === uf,
    );
    const alvo = normalizeForCompare(cidade);

    const cobre = doEstado.find((l) =>
      (l.cidades_cobertas ?? []).some((c) => normalizeForCompare(c) === alvo),
    );
    if (cobre) return cobre;

    // Sobrou o curinga: o que nao lista cidade nenhuma vale para o estado todo.
    return doEstado.find((l) => !l.cidades_cobertas?.length) ?? null;
  } catch (e) {
    console.error("[regionalidade] sem guia regional:", e);
    return null;
  }
}

/** Todas as linhas, para comparar sem acento quando o `ilike` nao acha nada. */
async function todasAsLinhas(): Promise<LinhaGuia[]> {
  return (await db().query(
    `select ${COLUNAS} from regional_guides limit 500`,
    [],
  )) as unknown as LinhaGuia[];
}

/**
 * Guia da cidade consultada, ou o padrao generico.
 *
 * @param local Como o app chama a cidade ("Porto Alegre, BR").
 * @param uf    Sigla do estado, quando o geocoding souber - desempata homonimas.
 */
export async function buscarGuiaRegional(
  local: string,
  uf?: string | null,
): Promise<GuiaRegional> {
  const cidade = apenasCidade(local).replace(/[%_*]/g, " ").trim();
  if (!cidade) return GUIA_PADRAO;

  // So sigla serve para comparar: o geocoding reserva as vezes devolve o nome
  // do estado por extenso, e "Rio Grande do Sul" nunca casaria com "/ RS".
  const sigla = uf && /^[A-Za-z]{2}$/.test(uf) ? uf.toUpperCase() : null;

  try {
    const data = (await db().query(
      `select ${COLUNAS} from regional_guides where local ilike $1 limit 20`,
      [`%${cidade}%`],
    )) as unknown as LinhaGuia[];

    // O `ilike` do Postgres distingue acento: "Sao Paulo" vindo do geocoding
    // nao casa com "São Paulo / SP" na tabela. Se a busca direta nao trouxe
    // nada, a comparacao sem acento acontece aqui.
    let linhas = data;
    if (linhas.length === 0) {
      const alvo = normalizeForCompare(cidade);
      linhas = (await todasAsLinhas()).filter((l) =>
        normalizeForCompare(l.local).includes(alvo),
      );
    }

    const escolhida = escolher(linhas, cidade, sigla);
    if (escolhida) return paraGuia(escolhida);

    // Sem guia da cidade: o da regiao e melhor que o generico. Uma cidade do
    // interior paulista soa mais como o interior do que como lugar nenhum.
    if (sigla) {
      const regiao = await guiaDaRegiao(sigla, cidade);
      if (regiao) return paraGuia(regiao);
    }

    return GUIA_PADRAO;
  } catch (e) {
    console.error("[regionalidade] usando guia padrao:", e);
    return GUIA_PADRAO;
  }
}
