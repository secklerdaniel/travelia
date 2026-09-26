/**
 * Opcoes do formulario de recomendacao de experiencias.
 *
 * Fonte unica: o formulario monta os campos a partir daqui e o prompt valida a
 * escolha contra as mesmas listas, entao nao existe opcao na tela que a IA nao
 * conheca (nem o contrario).
 */

export const TIPOS_EXPERIENCIA = [
  "Turismo de lazer",
  "Turismo cultural",
  "Turismo de aventura",
  "Turismo religioso",
  "Turismo de negócios",
  "Turismo Gastronômico",
] as const;

/**
 * Pilares do turismo gastronomico.
 *
 * So entram em cena quando a experiencia escolhida e a gastronomica: para
 * turismo religioso ou de negocios a pergunta nao faria sentido.
 *
 * As descricoes vao junto no prompt - e o que impede a IA de confundir
 * "Regional" com "Cozinha Internacional" ou tratar boteco como alta
 * gastronomia.
 */
export const PILARES_GASTRONOMICOS = [
  {
    nome: "Cozinha Internacional",
    descricao:
      "Restaurantes e experiências focados na culinária autêntica de outros países e culturas (italiana, japonesa, mexicana, francesa, uruguaia).",
  },
  {
    nome: "Enogastronomia",
    descricao:
      "Harmonização e produção de bebidas: vinícolas, rotas de vinho, destilarias, cervejarias artesanais e cafés especiais.",
  },
  {
    nome: "Regional",
    descricao:
      "Gastronomia de raiz: pratos típicos locais, culinária ancestral e casas que valorizam ingredientes, produtores e a identidade cultural do destino.",
  },
  {
    nome: "Comida de Rua / Botequim / Mercado",
    descricao:
      "Experiências populares, autênticas e informais de sociabilidade: feiras, food trucks, bancas de rua, mercados públicos e botecos tradicionais de balcão e petisco.",
  },
  {
    nome: "Alta Gastronomia",
    descricao:
      "Fine dining: menus degustação de múltiplos passos, restaurantes assinados por chefs renomados e casas premiadas (Guia Michelin, 50 Best).",
  },
] as const;

export const EXPERIENCIA_GASTRONOMICA = "Turismo Gastronômico";

export const TIPOS_COMPANHIA = [
  "Sozinho",
  "Casal",
  "Família com filhos pequenos",
  "Família com filhos adolescentes",
  "Grupo de amigos",
  "Excursão de escola",
] as const;

/** Icone de cada opcao, usado nos cards do wizard. */
export const ICONES: Readonly<Record<string, string>> = {
  "Turismo de lazer": "🏖️",
  "Turismo cultural": "🎭",
  "Turismo de aventura": "🧗",
  "Turismo religioso": "⛪",
  "Turismo de negócios": "💼",
  "Turismo Gastronômico": "🍽️",

  "Cozinha Internacional": "🌍",
  Enogastronomia: "🍷",
  Regional: "🥘",
  "Comida de Rua / Botequim / Mercado": "🍢",
  "Alta Gastronomia": "⭐",

  Sozinho: "🧍",
  Casal: "💑",
  "Família com filhos pequenos": "👶",
  "Família com filhos adolescentes": "🧑‍🎓",
  "Grupo de amigos": "🎉",
  "Excursão de escola": "🚌",
};

export type TipoExperiencia = (typeof TIPOS_EXPERIENCIA)[number];
export type TipoCompanhia = (typeof TIPOS_COMPANHIA)[number];

export type PedidoExperiencia = {
  /** Cidade que a pessoa quer conhecer - o parametro mais importante. */
  destinoCidade: string;
  destinoUf: string;
  experiencia: TipoExperiencia;
  /** Pilar gastronomico. So preenchido quando a experiencia e a gastronomica. */
  pilar: string | null;
  companhia: TipoCompanhia;
  /**
   * Quantas pessoas no total. Sem isso a IA chuta o tamanho do grupo, e o
   * preco de ingresso para um casal nao tem relacao com o de uma familia de
   * seis - o que muda tambem o que cabe na verba.
   */
  pessoas: number;
  /** Verba total em reais. */
  verba: number;
};

export type Recomendacao = {
  nome: string;
  /** Por que casa com o que a pessoa pediu, em topicos. */
  porque: string[];
  /** Pilar gastronomico a que a recomendacao pertence, quando se aplica. */
  pilar: string | null;
  /**
   * Endereco, telefone e site vem do OpenStreetMap quando `verificado` e true.
   * Quando e false, ficam nulos de proposito: a IA nao tem base de
   * estabelecimentos e inventaria dados plausiveis mas falsos.
   */
  endereco: string | null;
  telefone: string | null;
  site: string | null;
  /** Nome e contato conferidos numa base real, nao gerados pela IA. */
  verificado: boolean;
  /** Busca no Maps - unica pista de localizacao quando nao ha endereco. */
  mapsUrl: string;
  /** Estimativa de quanto custa, para comparar com a verba. */
  custoEstimado: string | null;
};
