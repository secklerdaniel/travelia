import { ClimaError } from "./openweather";

/**
 * Previsao das proximas horas e do restante do dia.
 *
 * Endpoint `/data/2.5/forecast`: 5 dias em passos de 3 horas, 40 pontos, no
 * mesmo plano gratuito da chave que ja usamos. Passo de 1 hora existe so no
 * One Call 3.0, que exige cartao cadastrado - por isso a faixa do card anda de
 * 3 em 3 e o rotulo diz isso.
 *
 * Nao e gravado no banco de proposito. Previsao envelhece rapido, e a trava de
 * 2 horas do app existe para nao repetir as chamadas PAGAS (texto e audio da
 * OpenAI). Esta aqui nao custa nada, entao vale mais buscar na hora e mostrar
 * o dado fresco do que servir um retrato de duas horas atras.
 */

const BASE = "https://api.openweathermap.org/data/2.5/forecast";

/** Quantos passos de 3h a faixa mostra. 8 cobre as proximas 24 horas. */
const PASSOS = 8;

export type PontoPrevisao = {
  /** Segundos UTC, como a OpenWeather entrega. */
  epoch: number;
  temp: number;
  condicaoId: number;
  icone: string;
  /** Probabilidade de precipitacao, de 0 a 1. */
  chuva: number;
};

export type Previsao = {
  /** Fuso da cidade em segundos, para ler as horas no relogio de la. */
  offset: number;
  pontos: PontoPrevisao[];
  /** Extremos do restante do dia local. Null quando nao sobrou ponto hoje. */
  hoje: { min: number; max: number } | null;
};

type RespostaForecast = {
  list?: {
    dt: number;
    main?: { temp?: number };
    weather?: { id?: number; icon?: string }[];
    pop?: number;
  }[];
  city?: { timezone?: number };
};

/** Data no relogio da cidade, como AAAA-MM-DD. */
const diaLocal = (epoch: number, offset: number) =>
  new Date((epoch + offset) * 1000).toISOString().slice(0, 10);

/**
 * @param tempAtual temperatura medida agora, quando conhecida.
 *
 * Entra no calculo porque o forecast so olha para a FRENTE: consultando as 18h,
 * o pico das 15h ja passou e nao esta em ponto nenhum da lista. Incluir a
 * medicao atual evita anunciar uma maxima menor do que o termometro marca.
 */
export async function buscarPrevisao(
  lat: number,
  lon: number,
  tempAtual?: number | null,
): Promise<Previsao> {
  const chave = process.env.OPENWEATHER_API_KEY;
  if (!chave) {
    throw new ClimaError("OPENWEATHER_API_KEY nao configurada.", 500);
  }

  const url = new URL(BASE);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("appid", chave);
  url.searchParams.set("lang", "pt_BR");
  url.searchParams.set("units", "metric");

  const resposta = await fetch(url, { cache: "no-store" });
  if (!resposta.ok) {
    throw new ClimaError(`OpenWeather respondeu ${resposta.status}.`, 502);
  }

  const dados = (await resposta.json()) as RespostaForecast;
  const offset = dados.city?.timezone ?? 0;
  const lista = dados.list ?? [];

  const pontos: PontoPrevisao[] = lista.slice(0, PASSOS).map((p) => ({
    epoch: p.dt,
    temp: p.main?.temp ?? 0,
    condicaoId: p.weather?.[0]?.id ?? 800,
    icone: p.weather?.[0]?.icon ?? "01d",
    chuva: p.pop ?? 0,
  }));

  const hojeLocal = diaLocal(Math.floor(Date.now() / 1000), offset);
  const doDia = lista
    .filter((p) => diaLocal(p.dt, offset) === hojeLocal)
    .map((p) => p.main?.temp)
    .filter((t): t is number => typeof t === "number");

  if (typeof tempAtual === "number") doDia.push(tempAtual);

  return {
    offset,
    pontos,
    hoje: doDia.length
      ? { min: Math.min(...doDia), max: Math.max(...doDia) }
      : null,
  };
}
