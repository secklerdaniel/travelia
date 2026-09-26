export type OpenWeatherResponse = {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  base?: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility?: number;
  wind?: { speed?: number; deg?: number; gust?: number };
  clouds?: { all?: number };
  dt: number;
  sys?: {
    type?: number;
    id?: number;
    country?: string;
    sunrise?: number;
    sunset?: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number | string;
};

/** Uma linha da tabela `clima` no Supabase. */
export type Clima = {
  id: string;
  city_query: string;
  city_id: number | null;
  nome: string;
  pais: string | null;
  lat: number | null;
  lon: number | null;
  temp: number | null;
  sensacao_termica: number | null;
  temp_min: number | null;
  temp_max: number | null;
  pressao: number | null;
  umidade: number | null;
  visibilidade: number | null;
  vento_velocidade: number | null;
  vento_graus: number | null;
  vento_rajada: number | null;
  nuvens: number | null;
  condicao_id: number | null;
  condicao_principal: string | null;
  condicao_descricao: string | null;
  condicao_icone: string | null;
  nascer_do_sol: string | null;
  por_do_sol: string | null;
  timezone_offset: number | null;
  medido_em: string | null;
  raw: OpenWeatherResponse;
  analise_texto: string | null;
  audio_url: string | null;
  audio_path: string | null;
  criado_em: string;
  atualizado_em: string;
};

/** O que a API devolve junto com a linha: avisos de etapas que falharam. */
export type ClimaResposta = {
  clima: Clima;
  avisos: string[];
};
