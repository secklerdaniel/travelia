/**
 * Codigos de condicao da OpenWeather -> categoria visual do app.
 *
 * Este e o UNICO arquivo do projeto que conhece os numeros da OpenWeather.
 * Qualquer parte do app que precise reagir a condicao do tempo deve consumir
 * `WeatherCategory`, nunca comparar `weather.id` diretamente.
 *
 * Referencia: https://openweathermap.org/weather-conditions
 */

export const WEATHER_CATEGORIES = [
  "thunderstorm",
  "drizzle",
  "lightRain",
  "moderateRain",
  "heavyRain",
  "freezingRain",
  "showerRain",
  "snow",
  "mist",
  "clear",
  "fewClouds",
  "scatteredClouds",
  "brokenClouds",
  "overcast",
] as const;

export type WeatherCategory = (typeof WEATHER_CATEGORIES)[number];

/** Usada quando o `weather.id` nao existe no mapa. */
export const DEFAULT_WEATHER_CATEGORY: WeatherCategory = "clear";

/**
 * Faixas de id, inclusivas nas duas pontas.
 *
 * Declarar por faixa (e derivar o mapa) mantem estes numeros num lugar so e
 * espelha a tabela da OpenWeather - incluir id a id abriria espaco para
 * esquecer um codigo ao revisar.
 */
const WEATHER_CODE_RANGES: readonly (readonly [number, number, WeatherCategory])[] = [
  [200, 232, "thunderstorm"],
  [300, 321, "drizzle"],
  [500, 500, "lightRain"],
  [501, 501, "moderateRain"],
  [502, 504, "heavyRain"],
  [511, 511, "freezingRain"],
  [520, 531, "showerRain"],
  [600, 622, "snow"],
  [701, 781, "mist"],
  [800, 800, "clear"],
  [801, 801, "fewClouds"],
  [802, 802, "scatteredClouds"],
  [803, 803, "brokenClouds"],
  [804, 804, "overcast"],
];

function buildCodeMap(): Record<number, WeatherCategory> {
  const mapa: Record<number, WeatherCategory> = {};
  for (const [inicio, fim, categoria] of WEATHER_CODE_RANGES) {
    for (let id = inicio; id <= fim; id++) mapa[id] = categoria;
  }
  return mapa;
}

/** `weather.id` -> categoria visual. Consulta O(1), sem logica de faixa. */
export const WEATHER_CODE_MAP: Readonly<Record<number, WeatherCategory>> =
  Object.freeze(buildCodeMap());

/**
 * Categoria de um `weather.id`.
 * Id desconhecido, nulo ou invalido cai em `clear` - nunca lanca erro.
 */
export function weatherCategoryFromId(
  weatherId: number | null | undefined,
): WeatherCategory {
  if (typeof weatherId !== "number" || !Number.isFinite(weatherId)) {
    return DEFAULT_WEATHER_CATEGORY;
  }
  return WEATHER_CODE_MAP[weatherId] ?? DEFAULT_WEATHER_CATEGORY;
}
