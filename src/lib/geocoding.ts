import { ClimaError } from "./openweather";
import { normalizeForCompare } from "./search/normalizeCitySearch";
import { nomeDoEstado } from "./search/ufs";

const GOOGLE = "https://maps.googleapis.com/maps/api/geocode/json";
const OPENWEATHER = "https://api.openweathermap.org/geo/1.0/direct";

export type Localidade = {
  /** Nome da cidade - fonte de verdade para o que aparece na tela. */
  nome: string;
  /** Sigla do pais ("BR", "GB"). */
  pais: string | null;
  /** Sigla do estado/provincia ("RS", "SP"), quando existe. */
  estado: string | null;
  lat: number;
  lon: number;
  /** Endereco completo formatado, so no Google. */
  enderecoCompleto: string | null;
};

/** A chave foi cadastrada com este nome; o alias em maiusculas e tolerancia. */
function chaveGoogle(): string | undefined {
  return (
    process.env.Google_Geocode_API_key ?? process.env.GOOGLE_GEOCODE_API_KEY
  );
}

type ComponenteGoogle = {
  long_name: string;
  short_name: string;
  types: string[];
};

type ResultadoGoogle = {
  address_components?: ComponenteGoogle[];
  formatted_address?: string;
  geometry?: { location?: { lat: number; lng: number } };
};

/** Primeiro componente que casa com o tipo pedido. */
function componente(
  componentes: ComponenteGoogle[],
  tipo: string,
  curto = false,
): string | null {
  const achado = componentes.find((c) => c.types.includes(tipo));
  if (!achado) return null;
  return curto ? achado.short_name : achado.long_name;
}

function paraLocalidade(resultado: ResultadoGoogle): Localidade | null {
  const local = resultado.geometry?.location;
  if (!local) return null;

  const componentes = resultado.address_components ?? [];

  // A cidade aparece em tipos diferentes conforme o pais: "locality" na maior
  // parte, "postal_town" no Reino Unido, e nivel administrativo quando o lugar
  // nao tem municipio proprio.
  const nome =
    componente(componentes, "locality") ??
    componente(componentes, "postal_town") ??
    componente(componentes, "administrative_area_level_2") ??
    componente(componentes, "administrative_area_level_1");

  if (!nome) return null;

  return {
    nome,
    pais: componente(componentes, "country", true),
    estado: componente(componentes, "administrative_area_level_1", true),
    lat: local.lat,
    lon: local.lng,
    enderecoCompleto: resultado.formatted_address ?? null,
  };
}

/** Texto -> coordenadas, pelo Google. `null` quando a chave nao esta configurada. */
async function pelaGoogle(consulta: string): Promise<Localidade | null> {
  const chave = chaveGoogle();
  if (!chave) return null;

  const url = new URL(GOOGLE);
  url.searchParams.set("address", consulta);
  url.searchParams.set("key", chave);
  url.searchParams.set("language", "pt-BR");

  const resposta = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!resposta.ok) return null;

  const dados = (await resposta.json()) as {
    status?: string;
    results?: ResultadoGoogle[];
  };

  // ZERO_RESULTS e resposta legitima: a cidade nao existe, nao adianta tentar
  // outro servico. Os demais erros (chave invalida, cota) caem no reserva.
  if (dados.status === "ZERO_RESULTS") {
    throw new ClimaError(
      `Nao encontrei "${consulta}". Tente incluir o estado ou o pais, como "Gramado,RS".`,
      404,
    );
  }
  if (dados.status !== "OK") return null;

  return paraLocalidade(dados.results?.[0] ?? {});
}

type ResultadoOW = {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
};

async function consultarOpenWeather(
  termo: string,
  limite: number,
): Promise<ResultadoOW[]> {
  const chave = process.env.OPENWEATHER_API_KEY;
  if (!chave) {
    throw new ClimaError("OPENWEATHER_API_KEY nao configurada no .env.local", 500);
  }

  const url = new URL(OPENWEATHER);
  url.searchParams.set("q", termo);
  url.searchParams.set("limit", String(limite));
  url.searchParams.set("appid", chave);

  const resposta = await fetch(url, { cache: "no-store" });

  if (resposta.status === 401) {
    throw new ClimaError("Chave da OpenWeather invalida ou ainda nao ativada.", 401);
  }
  if (!resposta.ok) {
    throw new ClimaError(`Geocoding respondeu ${resposta.status}.`, 502);
  }

  const lista = (await resposta.json()) as ResultadoOW[];
  return Array.isArray(lista) ? lista : [];
}

/**
 * Reserva: geocoding da propria OpenWeather, usado se o Google falhar.
 *
 * Com sufixo de UF a busca vai como ",BR" e o estado e usado para escolher
 * entre as homonimas - ver `ufs.ts` para o porque. Sem isso "Porto Alegre,RS"
 * era procurado na Servia, e "Gramado,SP" traria o Gramado gaucho.
 */
async function pelaOpenWeather(consulta: string): Promise<Localidade | null> {
  const partes = consulta.split(",").map((p) => p.trim()).filter(Boolean);
  const sufixo = partes.length > 1 ? partes[partes.length - 1] : null;
  const estado = sufixo ? nomeDoEstado(sufixo) : null;
  const uf = sufixo?.toUpperCase() ?? null;

  if (estado && uf) {
    const cidade = partes.slice(0, -1).join(",");
    const lista = await consultarOpenWeather(`${cidade},BR`, 10);
    const alvo = normalizeForCompare(estado);
    const noEstado = lista.find(
      (r) => normalizeForCompare(r.state ?? "") === alvo,
    );

    // Devolve a sigla no lugar do nome por extenso: e o formato que o Google
    // manda e o que o painel espera na coluna de UF.
    if (noEstado) {
      return {
        nome: noEstado.name,
        pais: noEstado.country ?? null,
        estado: uf,
        lat: noEstado.lat,
        lon: noEstado.lon,
        enderecoCompleto: null,
      };
    }
    // Nenhuma no estado pedido: a sigla pode ser mesmo de pais ("Novi Sad,RS"),
    // entao a busca literal ainda tem chance. Escolher outra homonima aqui
    // seria mostrar o clima de uma cidade que a pessoa nao pediu.
  }

  const achado = (await consultarOpenWeather(consulta, 1))[0];
  if (!achado) return null;

  return {
    nome: achado.name,
    pais: achado.country ?? null,
    estado: achado.state ?? null,
    lat: achado.lat,
    lon: achado.lon,
    enderecoCompleto: null,
  };
}

/**
 * Ultima reserva: busca direta no OpenStreetMap.
 *
 * De graca e sem chave, e entende "Porto Alegre, Rio Grande do Sul, Brasil" -
 * cobre os municipios pequenos que a OpenWeather nao tem catalogados. Fica por
 * ultimo porque a politica do Nominatim pede uso leve.
 */
async function pelaNominatim(consulta: string): Promise<Localidade | null> {
  const partes = consulta.split(",").map((p) => p.trim()).filter(Boolean);
  const sufixo = partes.length > 1 ? partes[partes.length - 1] : null;
  const estado = sufixo ? nomeDoEstado(sufixo) : null;

  const termo = estado
    ? `${partes.slice(0, -1).join(",")}, ${estado}, Brasil`
    : consulta;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", termo);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "pt-BR");

  try {
    const resposta = await fetch(url, {
      headers: { "User-Agent": "TravelIA/1.0 (app de clima e turismo)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!resposta.ok) return null;

    const lista = (await resposta.json()) as {
      name?: string;
      lat: string;
      lon: string;
      address?: Record<string, string>;
    }[];
    const achado = Array.isArray(lista) ? lista[0] : undefined;
    if (!achado) return null;

    const a = achado.address ?? {};
    const nome =
      achado.name || a.city || a.town || a.village || a.municipality;
    if (!nome) return null;

    return {
      nome,
      pais: a.country_code ? a.country_code.toUpperCase() : null,
      estado: sufixo && estado
        ? sufixo.toUpperCase()
        : (a["ISO3166-2-lvl4"]?.split("-")[1] ?? a.state ?? null),
      lat: Number(achado.lat),
      lon: Number(achado.lon),
      enderecoCompleto: null,
    };
  } catch {
    // rede fora ou tempo esgotado: quem chamou trata como "nao encontrei"
    return null;
  }
}

/**
 * Resolve um termo de busca em coordenadas.
 *
 * Tres tentativas, da mais precisa para a mais tolerante: Google (entende
 * "Gramado, RS" direto e desambigua homonimas), OpenWeather e OpenStreetMap.
 *
 * O encadeamento existe porque as duas primeiras dependem de conta: a chave do
 * Google para de responder se o faturamento do projeto e desativado, e a
 * OpenWeather nao tem municipio pequeno. Com o Nominatim no fim, a busca so
 * falha quando a cidade realmente nao existe.
 *
 * O termo ja deve chegar normalizado por `normalizeCitySearch`.
 */
export async function buscarLocalidade(consulta: string): Promise<Localidade> {
  try {
    const pelaG = await pelaGoogle(consulta);
    if (pelaG) return pelaG;
  } catch (e) {
    // ZERO_RESULTS ja e conclusivo: nao tenta as reservas
    if (e instanceof ClimaError && e.status === 404) throw e;
  }

  const pelaOW = await pelaOpenWeather(consulta);
  if (pelaOW) return pelaOW;

  const pelaOSM = await pelaNominatim(consulta);
  if (pelaOSM) return pelaOSM;

  throw new ClimaError(
    `Nao encontrei "${consulta}". Confira a grafia ou tente incluir o estado, como "Gramado,RS".`,
    404,
  );
}

/**
 * Coordenadas -> localidade (geocoding reverso).
 *
 * Serve para descobrir a cidade a partir da posicao do aparelho.
 */
export async function localidadePorCoordenadas(
  lat: number,
  lon: number,
): Promise<Localidade> {
  const chave = chaveGoogle();
  // Sem chave (ou com o Google recusando) o Nominatim resolve de graca.
  if (!chave) return reversoNominatim(lat, lon);

  const url = new URL(GOOGLE);
  url.searchParams.set("latlng", `${lat},${lon}`);
  url.searchParams.set("key", chave);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("result_type", "locality|postal_town|administrative_area_level_2");

  const resposta = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!resposta.ok) return reversoNominatim(lat, lon);

  const dados = (await resposta.json()) as {
    status?: string;
    results?: ResultadoGoogle[];
  };
  if (dados.status !== "OK") return reversoNominatim(lat, lon);

  return paraLocalidade(dados.results?.[0] ?? {}) ?? reversoNominatim(lat, lon);
}

/**
 * Reverso pelo OpenStreetMap - reserva quando o Google nao responde.
 *
 * A politica do Nominatim exige User-Agent identificando a aplicacao.
 */
async function reversoNominatim(lat: number, lon: number): Promise<Localidade> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("zoom", "10"); // nivel de cidade
  url.searchParams.set("accept-language", "pt-BR");

  const resposta = await fetch(url, {
    headers: { "User-Agent": "TravelIA/1.0 (app de clima e turismo)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!resposta.ok) {
    throw new ClimaError("Nao consegui identificar a cidade dessas coordenadas.", 502);
  }

  const j = (await resposta.json()) as {
    address?: Record<string, string>;
  };
  const a = j.address ?? {};
  const nome =
    a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? a.state;

  if (!nome) {
    throw new ClimaError("Nao consegui identificar a cidade dessas coordenadas.", 404);
  }

  return {
    nome,
    pais: a.country_code ? a.country_code.toUpperCase() : null,
    estado: a["ISO3166-2-lvl4"]?.split("-")[1] ?? a.state ?? null,
    lat,
    lon,
    enderecoCompleto: null,
  };
}
