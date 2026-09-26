import { weatherCategoryFromId, type WeatherCategory } from "@/config/weather-codes";
import { weatherPeriodFromIcon } from "./weather/getWeatherBackground";

/**
 * Identidade visual do card (cores, cena ilustrada, emoji).
 *
 * A condicao chega aqui ja traduzida em `WeatherCategory` - os numeros da
 * OpenWeather vivem so em `src/config/weather-codes.ts`.
 *
 * Todos os ceus sao escuros o suficiente para texto branco, e o card ainda
 * aplica um veu escuro na metade de baixo. Assim a legibilidade nunca depende
 * da condicao do tempo.
 */

export type TemaNome =
  | "tempestade"
  | "chuva"
  | "garoa"
  | "neve"
  | "neblina"
  | "limpo-dia"
  | "limpo-noite"
  | "nuvens-dia"
  | "nuvens-noite";

export type Precipitacao = "nenhuma" | "chuva" | "garoa" | "neve";

export type TemaClima = {
  nome: TemaNome;
  /** Tres paradas do gradiente do ceu, de cima para baixo. */
  ceu: [string, string, string];
  /** Cor de destaque: botao de play, waveform, arco do sol. */
  destaque: string;
  /** Emoji usado nos chips da lista de cidades. */
  emoji: string;
  /** Como desenhar a cena em SVG. */
  cena: {
    astro: "sol" | "lua" | null;
    /** [nucleo, brilho] do sol ou da lua. */
    astroCor: [string, string];
    estrelas: boolean;
    /** Quantas camadas de nuvem desenhar. */
    nuvens: 0 | 1 | 2 | 3;
    nuvemCor: string;
    precipitacao: Precipitacao;
    raio: boolean;
  };
};

const TEMAS: Record<TemaNome, TemaClima> = {
  "limpo-dia": {
    nome: "limpo-dia",
    ceu: ["#1273cc", "#3ba7e8", "#8fd0f2"],
    destaque: "#ffd27a",
    emoji: "☀️",
    cena: {
      astro: "sol",
      astroCor: ["#fff4d6", "#ffc85e"],
      estrelas: false,
      nuvens: 0,
      nuvemCor: "#ffffff",
      precipitacao: "nenhuma",
      raio: false,
    },
  },
  "limpo-noite": {
    nome: "limpo-noite",
    ceu: ["#050a1f", "#101c47", "#26326d"],
    destaque: "#9db4ff",
    emoji: "🌙",
    cena: {
      astro: "lua",
      astroCor: ["#f4f6ff", "#aab8ff"],
      estrelas: true,
      nuvens: 0,
      nuvemCor: "#ffffff",
      precipitacao: "nenhuma",
      raio: false,
    },
  },
  "nuvens-dia": {
    nome: "nuvens-dia",
    ceu: ["#41668e", "#6f90b0", "#a3bacd"],
    destaque: "#e6f2fb",
    emoji: "☁️",
    cena: {
      astro: "sol",
      astroCor: ["#fdf3dd", "#e8c78a"],
      estrelas: false,
      nuvens: 3,
      nuvemCor: "#f2f7fb",
      precipitacao: "nenhuma",
      raio: false,
    },
  },
  "nuvens-noite": {
    nome: "nuvens-noite",
    ceu: ["#0e1524", "#1c2740", "#313d5a"],
    destaque: "#9fb6d6",
    emoji: "☁️",
    cena: {
      astro: "lua",
      astroCor: ["#eef2fb", "#9fb0d8"],
      estrelas: true,
      nuvens: 3,
      nuvemCor: "#c6d4e6",
      precipitacao: "nenhuma",
      raio: false,
    },
  },
  chuva: {
    nome: "chuva",
    ceu: ["#17324a", "#2c5674", "#48789b"],
    destaque: "#7fd4f5",
    emoji: "🌧️",
    cena: {
      astro: null,
      astroCor: ["#ffffff", "#ffffff"],
      estrelas: false,
      nuvens: 3,
      nuvemCor: "#b9cfe0",
      precipitacao: "chuva",
      raio: false,
    },
  },
  garoa: {
    nome: "garoa",
    ceu: ["#2d4f64", "#4f7a92", "#7aa0b4"],
    destaque: "#aee0ee",
    emoji: "🌦️",
    cena: {
      astro: null,
      astroCor: ["#ffffff", "#ffffff"],
      estrelas: false,
      nuvens: 2,
      nuvemCor: "#cfe2ec",
      precipitacao: "garoa",
      raio: false,
    },
  },
  tempestade: {
    nome: "tempestade",
    ceu: ["#100e26", "#211c47", "#372f6b"],
    destaque: "#bda9ff",
    emoji: "⛈️",
    cena: {
      astro: null,
      astroCor: ["#ffffff", "#ffffff"],
      estrelas: false,
      nuvens: 3,
      nuvemCor: "#8f96c4",
      precipitacao: "chuva",
      raio: true,
    },
  },
  neve: {
    nome: "neve",
    ceu: ["#3f6184", "#7a99b6", "#b9cfe1"],
    destaque: "#e8f3fc",
    emoji: "❄️",
    cena: {
      astro: null,
      astroCor: ["#ffffff", "#ffffff"],
      estrelas: false,
      nuvens: 2,
      nuvemCor: "#eef5fb",
      precipitacao: "neve",
      raio: false,
    },
  },
  neblina: {
    nome: "neblina",
    ceu: ["#3f444e", "#666c77", "#949aa4"],
    destaque: "#dfe4ea",
    emoji: "🌫️",
    cena: {
      astro: null,
      astroCor: ["#ffffff", "#ffffff"],
      estrelas: false,
      nuvens: 3,
      nuvemCor: "#d6dce4",
      precipitacao: "nenhuma",
      raio: false,
    },
  },
};

/**
 * Categoria -> tema. Categorias que mudam de cara entre dia e noite declaram
 * os dois nomes; as demais valem para qualquer horario (chuva forte e chuva
 * forte de dia ou de madrugada).
 */
const TEMA_POR_CATEGORIA: Record<
  WeatherCategory,
  TemaNome | { dia: TemaNome; noite: TemaNome }
> = {
  thunderstorm: "tempestade",
  drizzle: "garoa",
  lightRain: "chuva",
  moderateRain: "chuva",
  heavyRain: "chuva",
  freezingRain: "chuva",
  showerRain: "chuva",
  snow: "neve",
  mist: "neblina",
  clear: { dia: "limpo-dia", noite: "limpo-noite" },
  fewClouds: { dia: "nuvens-dia", noite: "nuvens-noite" },
  scatteredClouds: { dia: "nuvens-dia", noite: "nuvens-noite" },
  brokenClouds: { dia: "nuvens-dia", noite: "nuvens-noite" },
  overcast: { dia: "nuvens-dia", noite: "nuvens-noite" },
};

export function temaDoClima(
  condicaoId: number | null | undefined,
  icone: string | null | undefined,
): TemaClima {
  const alvo = TEMA_POR_CATEGORIA[weatherCategoryFromId(condicaoId)];
  if (typeof alvo === "string") return TEMAS[alvo];

  const noite = weatherPeriodFromIcon(icone) === "night";
  return TEMAS[noite ? alvo.noite : alvo.dia];
}

/** Gradiente CSS do ceu, de cima para baixo. */
export function gradienteCeu(tema: TemaClima): string {
  return `linear-gradient(180deg, ${tema.ceu[0]} 0%, ${tema.ceu[1]} 52%, ${tema.ceu[2]} 100%)`;
}
