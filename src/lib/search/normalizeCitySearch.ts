import { CITY_ALIASES } from "@/config/city-aliases";

/**
 * Normalizacao da entrada de busca de cidade.
 *
 * Modulo unico: nenhum componente deve normalizar cidade por conta propria.
 *
 * O resultado serve APENAS para consultar a OpenWeather. O nome exibido no app
 * vem sempre da resposta da API, nunca daqui.
 */

/** Marcas de acentuacao geradas pelo normalize("NFD"). */
const ACENTOS = new RegExp("[\\u0300-\\u036f]", "g");

/** Ficam em minuscula no meio do nome: "Rio de Janeiro", "Vitoria da Conquista". */
const PARTICULAS = new Set([
  "de", "da", "do", "das", "dos", "e",
  "del", "la", "las", "el", "los",
  "di", "du", "van", "von", "of", "the",
]);

/**
 * Forma canonica de comparacao: sem acento, minuscula, sem espaco sobrando.
 * E a chave usada no CITY_ALIASES e no `city_query` do banco.
 *
 * "  SÃO   PAULO " -> "sao paulo"
 */
export function normalizeForCompare(input: string): string {
  return input
    .normalize("NFD")
    .replace(ACENTOS, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(texto: string): string {
  return texto
    .split(" ")
    .map((palavra, i) =>
      i > 0 && PARTICULAS.has(palavra)
        ? palavra
        : palavra.charAt(0).toUpperCase() + palavra.slice(1),
    )
    .join(" ");
}

/**
 * Prepara o termo digitado para a Geocoding API.
 *
 * 1. normaliza (trim, minuscula, sem acento, espacos colapsados);
 * 2. troca por um alias explicito, se houver;
 * 3. senao, devolve a propria entrada normalizada em Title Case.
 *
 * Sufixos de estado/pais sao preservados: com 2 letras viram maiusculas
 * ("br" -> "BR"), o resto vai para Title Case.
 *
 * Cidade fora do CITY_ALIASES continua funcionando - vai normalizada direto
 * para a API, que resolve a maioria dos nomes em portugues sozinha.
 *
 * @example
 * normalizeCitySearch("Tóquio")      // "Tokyo"  (alias? nao: a API resolve, vira "Toquio")
 * normalizeCitySearch("sidnei")      // "Sydney" (alias)
 * normalizeCitySearch("São Paulo")   // "Sao Paulo"
 * normalizeCitySearch(" toquio ,jp") // "Toquio,JP"
 */
export function normalizeCitySearch(input: string): string {
  if (typeof input !== "string") return "";

  const partes = normalizeForCompare(input)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (partes.length === 0) return "";

  const [cidade, ...sufixos] = partes;
  const canonica = CITY_ALIASES[cidade] ?? titleCase(cidade);

  return [
    canonica,
    ...sufixos.map((s) => (s.length === 2 ? s.toUpperCase() : titleCase(s))),
  ].join(",");
}

/**
 * Chave de deduplicacao da tabela `clima`.
 *
 * Sai da localidade JA RESOLVIDA pela OpenWeather, nunca do texto digitado:
 * "toquio", "Tóquio" e "TOKYO" chegam ao mesmo lugar, entao precisam cair na
 * mesma linha. Se a chave viesse da entrada, cada grafia criaria um card.
 *
 * O pais entra na chave porque existem homonimas em paises diferentes
 * (Santiago no Chile e Santiago em Cuba sao cidades distintas).
 */
export function localityStorageKey(
  nome: string,
  pais: string | null,
): string {
  const cidade = normalizeForCompare(nome);
  return pais ? `${cidade},${pais.toLowerCase()}` : cidade;
}
