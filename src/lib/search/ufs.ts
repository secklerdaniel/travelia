/**
 * Estados brasileiros: sigla -> nome por extenso.
 *
 * Existe por causa de um detalhe da OpenWeather: no geocoding dela o sufixo de
 * duas letras e lido como CODIGO DE PAIS (o campo de estado so vale para os
 * EUA). Metade das siglas brasileiras colide com um pais de verdade - RS e a
 * Servia, BA e a Bosnia, PE e o Peru, ES e a Espanha - entao "Porto Alegre,RS"
 * era procurado na Servia e voltava vazio.
 *
 * Com esta tabela a busca troca a UF por ",BR" e depois escolhe, entre as
 * homonimas, a que esta no estado pedido.
 */
export const UFS: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

/** Nome por extenso da UF, ou `null` se a sigla nao for de um estado. */
export function nomeDoEstado(sigla: string): string | null {
  return UFS[sigla.toUpperCase()] ?? null;
}
