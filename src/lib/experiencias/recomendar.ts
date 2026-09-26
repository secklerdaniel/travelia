import {
  EXPERIENCIA_GASTRONOMICA,
  PILARES_GASTRONOMICOS,
  TIPOS_COMPANHIA,
  TIPOS_EXPERIENCIA,
  type PedidoExperiencia,
  type Recomendacao,
} from "@/config/experiencias";
import { ANCORAR_EM_BASE_REAL } from "@/config/limites";
import { formatarPrompt } from "../prompt-log";
import { obterPrompt, promptPreenchido } from "../prompts";
import { buscarLugaresReais, linkMaps, type LugarReal } from "./lugares";

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Pedido em primeira pessoa, no formato do app original.
 * A localizacao abre e fecha a frase de proposito - repeti-la e o que segura
 * o modelo na cidade certa.
 */
function montarPedido(pedido: PedidoExperiencia, destino: string) {
  const grupo =
    pedido.pessoas === 1 ? "estou sozinho" : `somos ${pedido.pessoas} pessoas`;

  return [
    `Olá. Minha localização é ${destino} e tenho um orçamento total de`,
    `${brl(pedido.verba)}.`,
    `Estou procurando vivenciar uma experiência do tipo ${pedido.experiencia}` +
      (pedido.pilar ? `, no pilar ${pedido.pilar},` : ","),
    `estou viajando ${pedido.companhia.toLowerCase()} e ${grupo}.`,
    `Você pode me dar 3 boas recomendações para eu escolher`,
    `e que estejam na minha localização ${destino}?`,
  ].join(" ");
}

/**
 * Ultima conversa enviada ao modelo, para o historico.
 *
 * Guardada num modulo assim porque as tres mensagens sao montadas dentro de
 * `chamarOpenAI` e precisam chegar ate quem registra a consulta, sem obrigar
 * cada caminho a carregar o prompt de volta pela mao.
 */
let ultimoPrompt = "";

export function promptDaUltimaChamada(): string {
  return ultimoPrompt;
}

async function chamarOpenAI(treinamento: string, pergunta: string) {
  const chave = process.env.OPENAI_API_KEY;
  if (!chave) throw new Error("OPENAI_API_KEY nao configurada.");

  const confirmacao = await obterPrompt("roteiro_confirmacao");

  ultimoPrompt = formatarPrompt([
    { role: "user", content: treinamento },
    { role: "assistant", content: confirmacao },
    { role: "user", content: pergunta },
  ]);

  const resposta = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${chave}`,
    },
    body: JSON.stringify({
      // Modelo proprio, separado do usado na analise do clima: aqui a resposta
      // afirma fatos sobre lugares reais, e o modelo pequeno erra endereco e
      // finge que atracoes da regiao ficam dentro da cidade.
      model: process.env.OPENAI_MODEL_RECOMENDACOES || "gpt-4o",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "user", content: treinamento },
        { role: "assistant", content: confirmacao },
        { role: "user", content: pergunta },
      ],
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(`OpenAI respondeu ${resposta.status}: ${detalhe.slice(0, 300)}`);
  }

  const json = await resposta.json();
  try {
    return JSON.parse(json?.choices?.[0]?.message?.content ?? "");
  } catch {
    throw new Error("A IA devolveu uma resposta fora do formato esperado.");
  }
}

/**
 * Tres recomendacoes de experiencia para a cidade escolhida.
 *
 * Com lugares reais do OpenStreetMap disponiveis, a IA escolhe pelo INDICE da
 * lista e o app preenche nome, endereco e telefone a partir do registro real -
 * assim ela nao tem como inventar contato. Sem base, ela sugere livremente,
 * mas os campos de contato ficam nulos e o card mostra busca no Maps.
 */
export async function recomendarExperiencias(
  pedido: PedidoExperiencia,
): Promise<{
  recomendacoes: Recomendacao[];
  verificado: boolean;
  /** Mensagem enviada ao modelo, guardada no historico de consultas. */
  prompt: string;
  modelo: string;
}> {
  const destino = [pedido.destinoCidade, pedido.destinoUf].filter(Boolean).join(", ");
  const usuario = montarPedido(pedido, destino);

  const modelo = process.env.OPENAI_MODEL_RECOMENDACOES || "gpt-4o";

  if (ANCORAR_EM_BASE_REAL) {
    const lugares = await buscarLugaresReais(
      pedido.destinoCidade,
      pedido.destinoUf,
      pedido.experiencia,
    );
    if (lugares.length >= 3) {
      const recomendacoes = await escolherEntreReais(pedido, usuario, lugares);
      return {
        recomendacoes,
        verificado: true,
        prompt: promptDaUltimaChamada(),
        modelo,
      };
    }
  }

  const recomendacoes = await sugerirLivre(pedido, usuario, destino);
  return {
    recomendacoes,
    verificado: false,
    prompt: promptDaUltimaChamada(),
    modelo,
  };
}

/** Caminho principal: a IA so escolhe indices de uma lista que existe. */
async function escolherEntreReais(
  pedido: PedidoExperiencia,
  usuario: string,
  lugares: LugarReal[],
): Promise<Recomendacao[]> {
  const catalogo = lugares
    .map((l, i) => `${i}. ${l.nome} [${l.categoria}]${l.endereco ? ` - ${l.endereco}` : ""}`)
    .join("\n");

  const treinamento = [
    "Voce e o TravelBot, agente de recomendacao de experiencias de viagem.",
    "Abaixo esta a lista de locais que REALMENTE existem na cidade do usuario.",
    "Escolha exatamente 3 dela, pelo indice, que melhor atendam ao pedido -",
    "considerando o tipo de experiencia, a companhia e a verba.",
    "Escolha 3 indices DIFERENTES, de lugares distintos.",
    "NAO invente locais. NAO use nada que nao esteja na lista.",
    "NAO escreva endereco nem telefone: o aplicativo preenche isso sozinho.",
    "",
    "Responda SOMENTE com JSON valido:",
    `{"escolhas":[{"indice":0,"porque":["",""],"custoEstimado":""}]}`,
    "- porque: 2 a 3 topicos curtos ligando o local ao que a pessoa pediu",
    "- custoEstimado: faixa de preco em reais para o grupo informado",
    "",
    "LOCAIS DISPONIVEIS:",
    catalogo,
    "",
    "Faz sentido? Alguma duvida antes de eu passar para os usuarios do meu app?",
  ].join("\n");

  const bruto = await chamarOpenAI(treinamento, usuario);
  const escolhas = (bruto as { escolhas?: unknown })?.escolhas;
  if (!Array.isArray(escolhas) || escolhas.length === 0) {
    throw new Error("A IA nao devolveu nenhuma recomendacao.");
  }

  const usados = new Set<number>();
  const recomendacoes: Recomendacao[] = [];

  for (const item of escolhas) {
    const e = (item ?? {}) as Record<string, unknown>;
    const indice = Number(e.indice);
    const lugar = lugares[indice];
    // indice fora da lista ou repetido: descarta em vez de inventar substituto
    if (!lugar || usados.has(indice)) continue;
    usados.add(indice);

    recomendacoes.push({
      nome: lugar.nome,
      porque: topicos(e.porque),
      pilar: limpar(e.pilar),
      endereco: lugar.endereco,
      telefone: lugar.telefone,
      site: lugar.site,
      verificado: true,
      mapsUrl: linkMaps(lugar.nome, pedido.destinoCidade, pedido.destinoUf),
      custoEstimado: limpar(e.custoEstimado),
    });
    if (recomendacoes.length === 3) break;
  }

  if (recomendacoes.length === 0) {
    throw new Error("A IA nao escolheu nenhum local valido da lista.");
  }
  return recomendacoes;
}

/**
 * Caminho padrao: a IA recomenda do proprio conhecimento.
 *
 * Estrutura herdada do app original - treinamento como turno do usuario,
 * confirmacao do assistente, e so entao o pedido.
 */
/**
 * Bloco extra de treinamento para turismo gastronomico.
 *
 * Vazio para os outros tipos: carregar as definicoes dos 5 pilares numa
 * consulta de turismo religioso so gastaria contexto e arriscaria contaminar
 * a resposta.
 */
async function treinamentoGastronomico(
  pedido: PedidoExperiencia,
): Promise<string[]> {
  if (pedido.experiencia !== EXPERIENCIA_GASTRONOMICA) return [];

  const texto = await promptPreenchido("roteiro_gastronomia", {
    pilares: PILARES_GASTRONOMICOS.map(
      (p, i) => `${i + 1}. ${p.nome}: ${p.descricao}`,
    ).join("\n"),
    pilarEscolhido: pedido.pilar
      ? `O usuário escolheu o pilar "${pedido.pilar}". As 3 recomendações devem pertencer a ele.`
      : "O usuário não escolheu um pilar: cubra pilares diferentes entre si.",
  });

  return ["", texto];
}

async function sugerirLivre(
  pedido: PedidoExperiencia,
  usuario: string,
  destino: string,
): Promise<Recomendacao[]> {
  // Treinamento vindo do painel (ou do padrao de fabrica), com o bloco
  // gastronomico acrescentado so quando a experiencia pede.
  const treinamento = [
    await obterPrompt("roteiro_treinamento"),
    ...(await treinamentoGastronomico(pedido)),
  ].join("\n");

  const bruto = await chamarOpenAI(treinamento, usuario);
  const lista = (bruto as { recomendacoes?: unknown })?.recomendacoes;
  if (!Array.isArray(lista) || lista.length === 0) {
    throw new Error("A IA nao devolveu nenhuma recomendacao.");
  }
  void destino;

  return lista.slice(0, 3).map((item) => {
    const r = (item ?? {}) as Record<string, unknown>;
    const nome = limpar(r.nome) ?? "Sem nome";
    return {
      nome,
      porque: topicos(r.porque),
      pilar: limpar(r.pilar),
      endereco: limpar(r.endereco),
      telefone: limpar(r.telefone),
      site: limpar(r.site),
      verificado: false,
      mapsUrl: linkMaps(nome, pedido.destinoCidade, pedido.destinoUf),
      custoEstimado: limpar(r.custoEstimado),
    };
  });
}

function limpar(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const texto = valor.trim();
  if (!texto || texto.toLowerCase() === "null" || texto === "-") return null;
  return texto;
}

function topicos(valor: unknown): string[] {
  const bruto = Array.isArray(valor) ? valor : [valor];
  return bruto.map(limpar).filter((t): t is string => t !== null);
}

/** Valida o que veio do formulario antes de gastar uma chamada de IA. */
export function validarPedido(corpo: unknown): PedidoExperiencia | string {
  const c = (corpo ?? {}) as Record<string, unknown>;
  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const destinoCidade = texto(c.destinoCidade);
  if (!destinoCidade) return "Informe a cidade que voce quer conhecer.";

  const experiencia = texto(c.experiencia);
  const companhia = texto(c.companhia);

  if (!TIPOS_EXPERIENCIA.includes(experiencia as never)) {
    return "Escolha um tipo de experiencia.";
  }
  if (!TIPOS_COMPANHIA.includes(companhia as never)) {
    return "Escolha com quem voce vai viajar.";
  }

  const pessoas = Math.round(Number(c.pessoas));
  if (!Number.isFinite(pessoas) || pessoas < 1 || pessoas > 60) {
    return "Informe quantas pessoas vao viajar.";
  }

  const verba = Number(c.verba);
  if (!Number.isFinite(verba) || verba <= 0) {
    return "Informe uma verba maior que zero.";
  }

  // O pilar so vale para a experiencia gastronomica; nos demais e ignorado
  // mesmo que venha preenchido.
  const pilarBruto = texto(c.pilar);
  const pilar =
    experiencia === EXPERIENCIA_GASTRONOMICA &&
    PILARES_GASTRONOMICOS.some((p) => p.nome === pilarBruto)
      ? pilarBruto
      : null;

  return {
    destinoCidade,
    destinoUf: texto(c.destinoUf),
    experiencia: experiencia as PedidoExperiencia["experiencia"],
    pilar,
    companhia: companhia as PedidoExperiencia["companhia"],
    pessoas,
    verba,
  };
}
