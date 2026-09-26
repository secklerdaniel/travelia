import { normalizeForCompare } from "./search/normalizeCitySearch";

/**
 * Sugestoes de cidade enquanto a pessoa digita.
 *
 * A fonte e o IBGE: 5.571 municipios brasileiros, sem chave e sem cota. O
 * geocoding da OpenWeather nao serve aqui porque so faz busca exata - "gramad"
 * volta vazio e "gram" acha uma vila na Dinamarca.
 *
 * Cobertura e so do Brasil. Cidade de fora continua funcionando na busca, o
 * usuario apenas digita o nome inteiro sem ver sugestao.
 */

const IBGE = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";

export type Cidade = { nome: string; uf: string };

type Municipio = Cidade & {
  /** Nome normalizado, para casar sem depender de acento ou caixa. */
  busca: string;
};

type RespostaIbge = {
  nome?: string;
  microrregiao?: { mesorregiao?: { UF?: { sigla?: string } } };
  "regiao-imediata"?: { "regiao-intermediaria"?: { UF?: { sigla?: string } } };
};

let cache: Promise<Municipio[]> | null = null;

/** A sigla do estado vem por dois caminhos conforme a versao do registro. */
function siglaUf(m: RespostaIbge): string | null {
  return (
    m.microrregiao?.mesorregiao?.UF?.sigla ??
    m["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla ??
    null
  );
}

async function carregar(): Promise<Municipio[]> {
  // A lista muda raramente; um dia de cache evita baixar 2,4 MB a cada frio.
  const resposta = await fetch(IBGE, { next: { revalidate: 86_400 } });
  if (!resposta.ok) throw new Error(`IBGE respondeu ${resposta.status}.`);

  const bruto = (await resposta.json()) as RespostaIbge[];

  return bruto
    .map((m) => {
      const nome = m.nome?.trim();
      const uf = siglaUf(m);
      if (!nome || !uf) return null;
      return { nome, uf, busca: normalizeForCompare(nome) };
    })
    .filter((m): m is Municipio => m !== null);
}

function municipios(): Promise<Municipio[]> {
  cache ??= carregar().catch((e) => {
    cache = null; // deixa a proxima chamada tentar de novo
    throw e;
  });
  return cache;
}

/**
 * Municipios que casam com o termo digitado.
 *
 * Quem comeca com o termo vem primeiro: digitando "gram" o esperado e
 * "Gramado" no topo, nao "Nova Gramado" so porque contem o trecho.
 */
export async function buscarCidades(
  termo: string,
  limite = 8,
): Promise<Cidade[]> {
  const alvo = normalizeForCompare(termo);
  if (alvo.length < 2) return [];

  const lista = await municipios();
  const comecam: Municipio[] = [];
  const contem: Municipio[] = [];

  for (const m of lista) {
    if (m.busca.startsWith(alvo)) comecam.push(m);
    else if (m.busca.includes(alvo)) contem.push(m);

    // ja ha material suficiente para preencher a lista com os melhores
    if (comecam.length >= limite) break;
  }

  const ordenar = (a: Municipio, b: Municipio) =>
    a.nome.length - b.nome.length || a.nome.localeCompare(b.nome, "pt-BR");

  return [...comecam.sort(ordenar), ...contem.sort(ordenar)]
    .slice(0, limite)
    .map(({ nome, uf }) => ({ nome, uf }));
}
