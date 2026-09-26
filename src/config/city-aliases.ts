/**
 * Aliases de busca de cidade.
 *
 * A Geocoding API da OpenWeather ja entende a maioria dos nomes em portugues
 * ("toquio", "londres", "pequim", "moscou", "cidade do cabo"...), entao este
 * dicionario NAO e uma tabela de traducao - ele existe so para os casos em que
 * a API erra ou nao encontra.
 *
 * Cada entrada abaixo foi verificada contra a API: sem o alias, a busca falha
 * ou devolve o lugar errado.
 *
 * COMO DECIDIR SE UM ALIAS E NECESSARIO
 *   1. consulte  /geo/1.0/direct?q=<termo>&limit=1
 *   2. so adicione se o resultado vier vazio ou apontar para outro lugar
 *   3. confirme que o valor do alias resolve para a cidade certa
 *
 * Traducao automatica esta fora de questao: "Vitoria" (ES) viraria "Victory",
 * "Salvador" viraria "Savior" e "Natal" viraria "Christmas".
 *
 * Chave: entrada normalizada (minuscula, sem acento, espacos colapsados).
 * Valor: termo que a OpenWeather resolve corretamente.
 */
export const CITY_ALIASES: Readonly<Record<string, string>> = {
  // a API devolve "Descartes (FR)" para "haia", e "Hague" cai num vilarejo dos EUA
  haia: "The Hague",

  // "bombaim" existe como cidade em Sao Tome e Principe e ganha a disputa
  bombaim: "Mumbai",

  // sem resultado na Geocoding API
  helsinque: "Helsinki",
  dublim: "Dublin",
  bangcoc: "Bangkok",

  // grafia errada comum ("sidney", com y, a API ja resolve sozinha)
  sidnei: "Sydney",
};
