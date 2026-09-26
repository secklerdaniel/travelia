import type { OpenWeatherResponse } from "./types";

const BASE = "https://api.openweathermap.org/data/2.5/weather";

export class ClimaError extends Error {
  status: number;
  constructor(mensagem: string, status = 500) {
    super(mensagem);
    this.status = status;
  }
}

/**
 * Consulta a OpenWeather por coordenadas, em pt_BR e graus Celsius.
 *
 * As coordenadas vem da Geocoding API (`buscarLocalidade`). Buscar por lat/lon
 * em vez de por texto elimina a ambiguidade entre cidades de mesmo nome.
 */
export async function buscarClimaPorCoordenadas(
  lat: number,
  lon: number,
): Promise<OpenWeatherResponse> {
  const chave = process.env.OPENWEATHER_API_KEY;
  if (!chave) {
    throw new ClimaError("OPENWEATHER_API_KEY nao configurada no .env.local", 500);
  }

  const url = new URL(BASE);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("appid", chave);
  url.searchParams.set("lang", "pt_BR");
  url.searchParams.set("units", "metric");

  const resposta = await fetch(url, { cache: "no-store" });

  if (resposta.status === 401) {
    throw new ClimaError("Chave da OpenWeather invalida ou ainda nao ativada.", 401);
  }
  if (!resposta.ok) {
    throw new ClimaError(`OpenWeather respondeu ${resposta.status}.`, 502);
  }

  return (await resposta.json()) as OpenWeatherResponse;
}

/**
 * Converte o payload da OpenWeather nas colunas da tabela `clima`.
 *
 * O NOME vem da Geocoding API, nao do endpoint de clima: consultado por
 * lat/lon, o endpoint de clima devolve o nome da estacao meteorologica mais
 * proxima ("Haymarket") em vez do da cidade ("Sydney"). Quem resolve
 * localidade e o geocoding - as medicoes e que vem do clima.
 */
export function paraLinhaClima(
  dados: OpenWeatherResponse,
  cityQuery: string,
  localidade?: { nome: string; pais: string | null; lat: number; lon: number },
) {
  const condicao = dados.weather?.[0];
  const emIso = (epoch: number | undefined | null) =>
    epoch ? new Date(epoch * 1000).toISOString() : null;

  return {
    city_query: cityQuery,
    city_id: dados.id ?? null,
    nome: localidade?.nome ?? dados.name,
    pais: localidade?.pais ?? dados.sys?.country ?? null,
    lat: localidade?.lat ?? dados.coord?.lat ?? null,
    lon: localidade?.lon ?? dados.coord?.lon ?? null,

    temp: dados.main?.temp ?? null,
    sensacao_termica: dados.main?.feels_like ?? null,
    temp_min: dados.main?.temp_min ?? null,
    temp_max: dados.main?.temp_max ?? null,
    pressao: dados.main?.pressure ?? null,
    umidade: dados.main?.humidity ?? null,
    visibilidade: dados.visibility ?? null,

    vento_velocidade: dados.wind?.speed ?? null,
    vento_graus: dados.wind?.deg ?? null,
    vento_rajada: dados.wind?.gust ?? null,
    nuvens: dados.clouds?.all ?? null,

    condicao_id: condicao?.id ?? null,
    condicao_principal: condicao?.main ?? null,
    condicao_descricao: condicao?.description ?? null,
    condicao_icone: condicao?.icon ?? null,

    nascer_do_sol: emIso(dados.sys?.sunrise),
    por_do_sol: emIso(dados.sys?.sunset),
    timezone_offset: dados.timezone ?? 0,
    medido_em: emIso(dados.dt),

    raw: dados,
  };
}
