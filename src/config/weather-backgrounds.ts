import type { WeatherCategory } from "./weather-codes";

/** Versao da imagem: dia ou noite, decidida pelo sufixo do `weather.icon`. */
export type DayPeriod = "day" | "night";

export type WeatherBackground = Record<DayPeriod, string>;

/**
 * Caminhos dos backgrounds, servidos de `public/weather/`.
 *
 * Sao imagens verticais 9:16 mostrando SOMENTE o ceu - sem cidade, predio,
 * horizonte, montanha, pessoa, texto ou icone. Elas ficam atras de toda a
 * interface, entao qualquer elemento reconhecivel na foto brigaria com o
 * conteudo do card.
 *
 * Para trocar um fundo, substitua o arquivo; para adicionar uma categoria,
 * acrescente-a em `WEATHER_CATEGORIES` (weather-codes.ts) e o TypeScript vai
 * exigir a entrada correspondente aqui.
 */
export const WEATHER_BACKGROUNDS: Record<WeatherCategory, WeatherBackground> = {
  thunderstorm: {
    day: "/weather/thunderstorm/day.webp",
    night: "/weather/thunderstorm/night.webp",
  },
  drizzle: {
    day: "/weather/drizzle/day.webp",
    night: "/weather/drizzle/night.webp",
  },
  lightRain: {
    day: "/weather/light-rain/day.webp",
    night: "/weather/light-rain/night.webp",
  },
  moderateRain: {
    day: "/weather/moderate-rain/day.webp",
    night: "/weather/moderate-rain/night.webp",
  },
  heavyRain: {
    day: "/weather/heavy-rain/day.webp",
    night: "/weather/heavy-rain/night.webp",
  },
  freezingRain: {
    day: "/weather/freezing-rain/day.webp",
    night: "/weather/freezing-rain/night.webp",
  },
  showerRain: {
    day: "/weather/shower-rain/day.webp",
    night: "/weather/shower-rain/night.webp",
  },
  snow: {
    day: "/weather/snow/day.webp",
    night: "/weather/snow/night.webp",
  },
  mist: {
    day: "/weather/mist/day.webp",
    night: "/weather/mist/night.webp",
  },
  clear: {
    day: "/weather/clear/day.webp",
    night: "/weather/clear/night.webp",
  },
  fewClouds: {
    day: "/weather/few-clouds/day.webp",
    night: "/weather/few-clouds/night.webp",
  },
  scatteredClouds: {
    day: "/weather/scattered-clouds/day.webp",
    night: "/weather/scattered-clouds/night.webp",
  },
  brokenClouds: {
    day: "/weather/broken-clouds/day.webp",
    night: "/weather/broken-clouds/night.webp",
  },
  overcast: {
    day: "/weather/overcast/day.webp",
    night: "/weather/overcast/night.webp",
  },
};
