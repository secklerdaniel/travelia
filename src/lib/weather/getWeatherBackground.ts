import {
  WEATHER_BACKGROUNDS,
  type DayPeriod,
} from "@/config/weather-backgrounds";
import { weatherCategoryFromId } from "@/config/weather-codes";

/**
 * Dia ou noite a partir do `weather.icon` da OpenWeather.
 *
 * O icone vem no formato "04d" / "04n": o sufixo e a unica informacao de
 * periodo que a resposta de clima atual carrega sem precisar comparar o
 * horario com o nascer e o por do sol.
 *
 * Icone ausente, vazio ou fora do formato assume "day".
 */
export function weatherPeriodFromIcon(icon?: string | null): DayPeriod {
  if (typeof icon !== "string") return "day";
  return icon.trim().toLowerCase().endsWith("n") ? "night" : "day";
}

/**
 * Caminho do background para uma condicao da OpenWeather.
 *
 * A categoria vem do `weather.id` (nunca do `description`, que muda com o
 * idioma da requisicao) e o periodo vem do sufixo do `weather.icon`.
 *
 * Nunca lanca: id desconhecido cai em `clear`, icone invalido cai em `day`.
 *
 * @example
 * getWeatherBackground(800, "01d") // "/weather/clear/day.webp"
 * getWeatherBackground(500, "10n") // "/weather/light-rain/night.webp"
 * getWeatherBackground(621, "13n") // "/weather/snow/night.webp"
 */
export function getWeatherBackground(
  weatherId: number | null | undefined,
  icon?: string | null,
): string {
  const categoria = weatherCategoryFromId(weatherId);
  const periodo = weatherPeriodFromIcon(icon);
  return WEATHER_BACKGROUNDS[categoria][periodo];
}
