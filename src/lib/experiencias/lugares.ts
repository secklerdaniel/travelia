import type { TipoExperiencia } from "@/config/experiencias";

/**
 * Busca de locais REAIS no OpenStreetMap.
 *
 * A IA nao tem base de dados de estabelecimentos - quando perguntada por
 * endereco e telefone, ela gera algo plausivel. Aqui o caminho e invertido:
 * o app traz uma lista de lugares que existem, com endereco e telefone vindos
 * do OSM, e a IA so escolhe entre eles e explica a escolha.
 *
 * Nominatim e Overpass sao abertos e nao pedem chave. Em troca exigem
 * User-Agent identificando a aplicacao e tem limite de uso.
 */

const UA = "TravelIA/1.0 (app de clima e recomendacao de viagem)";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const OVERPASS = "https://overpass-api.de/api/interpreter";

export type LugarReal = {
  nome: string;
  endereco: string | null;
  telefone: string | null;
  site: string | null;
  /** Rotulo legivel do tipo, para a IA entender o que e o lugar. */
  categoria: string;
  lat: number;
  lon: number;
};

/**
 * Filtros do Overpass por tipo de experiencia.
 *
 * Cada linha vira uma clausula da busca. Manter por extenso (em vez de montar
 * dinamicamente) deixa claro o que cada tipo de turismo traz.
 */
const FILTROS: Record<TipoExperiencia, string[]> = {
  "Turismo de lazer": [
    '["tourism"~"attraction|theme_park|zoo|aquarium|water_park|picnic_site"]',
    '["leisure"~"park|garden|water_park"]',
  ],
  "Turismo cultural": [
    '["tourism"~"museum|gallery|artwork|attraction"]',
    '["amenity"~"theatre|arts_centre|library"]',
    '["historic"]',
  ],
  "Turismo de aventura": [
    '["tourism"~"viewpoint|attraction|wilderness_hut"]',
    '["leisure"~"nature_reserve|sports_centre|horse_riding"]',
    '["sport"~"climbing|canoe|paragliding|rafting"]',
    '["natural"~"peak|waterfall|cave_entrance"]',
  ],
  "Turismo religioso": [
    '["amenity"="place_of_worship"]',
    '["historic"~"church|monastery|wayside_shrine"]',
  ],
  "Turismo de negócios": [
    '["amenity"~"conference_centre|exhibition_centre"]',
    '["tourism"~"hotel"]',
    '["office"]',
  ],
  // Cobre os 5 pilares de uma vez: restaurante e bar (cozinha internacional,
  // regional, alta gastronomia), vinicola e cervejaria (enogastronomia),
  // mercado e boteco (comida de rua).
  "Turismo Gastronômico": [
    '["amenity"~"restaurant|cafe|bar|pub|fast_food|food_court|ice_cream|marketplace"]',
    '["shop"~"bakery|deli|wine|cheese|coffee|confectionery|greengrocer"]',
    '["craft"~"winery|brewery|distillery|caterer"]',
    '["tourism"~"wine_cellar"]',
  ],
};

type ElementoOverpass = {
  tags?: Record<string, string>;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
};

/** Monta o endereco a partir das tags addr:* do OSM. */
function montarEndereco(tags: Record<string, string>): string | null {
  const rua = tags["addr:street"];
  const numero = tags["addr:housenumber"];
  const bairro = tags["addr:suburb"] ?? tags["addr:neighbourhood"];
  const cidade = tags["addr:city"];
  const cep = tags["addr:postcode"];

  const partes = [
    rua ? (numero ? `${rua}, ${numero}` : rua) : null,
    bairro,
    cidade,
    cep,
  ].filter(Boolean);

  return partes.length ? partes.join(" - ") : null;
}

/** Rotulo legivel a partir das tags, para a IA saber o que e o lugar. */
function categoriaDe(tags: Record<string, string>): string {
  const chaves = ["tourism", "leisure", "amenity", "historic", "natural", "sport"];
  for (const chave of chaves) {
    if (tags[chave]) return `${chave}=${tags[chave]}`;
  }
  return "ponto de interesse";
}

/** Coordenadas e caixa delimitadora da cidade. */
async function localizarCidade(
  cidade: string,
  uf: string,
): Promise<[number, number, number, number] | null> {
  const url = new URL(NOMINATIM);
  url.searchParams.set("city", cidade);
  if (uf) url.searchParams.set("state", uf);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const resposta = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(15_000),
  });
  if (!resposta.ok) return null;

  const lista = (await resposta.json()) as {
    boundingbox?: [string, string, string, string];
  }[];
  const caixa = lista?.[0]?.boundingbox;
  if (!caixa) return null;

  // Nominatim devolve [sul, norte, oeste, leste]; Overpass quer a mesma ordem
  const [sul, norte, oeste, leste] = caixa.map(Number);
  return [sul, oeste, norte, leste];
}

/**
 * Lugares reais da cidade para o tipo de experiencia escolhido.
 *
 * Devolve lista vazia (nunca lanca) se o OSM nao responder ou nao tiver dados:
 * quem chama decide o que fazer sem o apoio da base.
 */
export async function buscarLugaresReais(
  cidade: string,
  uf: string,
  experiencia: TipoExperiencia,
  limite = 40,
): Promise<LugarReal[]> {
  try {
    const caixa = await localizarCidade(cidade, uf);
    if (!caixa) return [];

    const bbox = caixa.join(",");
    const clausulas = FILTROS[experiencia]
      .flatMap((filtro) => [
        `node${filtro}["name"](${bbox});`,
        `way${filtro}["name"](${bbox});`,
      ])
      .join("");

    const consulta = `[out:json][timeout:25];(${clausulas});out center tags ${limite * 3};`;

    const resposta = await fetch(OVERPASS, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": UA,
      },
      body: `data=${encodeURIComponent(consulta)}`,
      signal: AbortSignal.timeout(30_000),
    });
    if (!resposta.ok) return [];

    const { elements } = (await resposta.json()) as { elements?: ElementoOverpass[] };
    if (!Array.isArray(elements)) return [];

    const vistos = new Set<string>();
    const lugares: LugarReal[] = [];

    for (const el of elements) {
      const tags = el.tags;
      const nome = tags?.name?.trim();
      if (!tags || !nome) continue;

      const chave = nome.toLowerCase();
      if (vistos.has(chave)) continue;
      vistos.add(chave);

      const ponto = el.center ?? { lat: el.lat, lon: el.lon };
      if (typeof ponto.lat !== "number" || typeof ponto.lon !== "number") continue;

      lugares.push({
        nome,
        endereco: montarEndereco(tags),
        telefone: tags.phone ?? tags["contact:phone"] ?? null,
        site: tags.website ?? tags["contact:website"] ?? null,
        categoria: categoriaDe(tags),
        lat: ponto.lat,
        lon: ponto.lon,
      });
    }

    // lugares com endereco na frente: sao os mais uteis para quem vai ate la
    lugares.sort((a, b) => Number(!!b.endereco) - Number(!!a.endereco));
    return lugares.slice(0, limite);
  } catch {
    return [];
  }
}

/** Link de busca no Maps - usado quando nao temos endereco confiavel. */
export function linkMaps(nome: string, cidade: string, uf: string): string {
  const termo = [nome, cidade, uf].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(termo)}`;
}
