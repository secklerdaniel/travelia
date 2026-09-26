import { db } from "./db";

/**
 * Agregacoes do dashboard.
 *
 * Traz as linhas e agrupa em memoria em vez de fazer uma query por grafico.
 * Na escala atual (centenas de consultas) isso e mais rapido que sete idas ao
 * banco, e mantem toda a logica de agrupamento num lugar so. Se um dia passar
 * de alguns milhares de linhas, o caminho e trocar por views materializadas no
 * Postgres - a assinatura destas funcoes nao muda.
 */

export type ConsultaLinha = {
  id: string;
  tipo: "clima" | "roteiro";
  visitante: string | null;
  cidade: string;
  uf: string | null;
  termo_digitado: string | null;
  origem_cidade: string | null;
  origem_uf: string | null;
  origem_pais: string | null;
  experiencia: string | null;
  pilar: string | null;
  companhia: string | null;
  pessoas: number | null;
  verba: number | null;
  condicao_id: number | null;
  condicao_descricao: string | null;
  temp: number | null;
  modelo: string | null;
  prompt: string | null;
  sucesso: boolean;
  erro: string | null;
  duracao_ms: number | null;
  criado_em: string;
};

export type Fatia = { rotulo: string; valor: number };

export type DadosDashboard = {
  total: number;
  visitantes: number;
  taxaSucesso: number;
  duracaoMediaMs: number;
  porTipo: { clima: number; roteiro: number };
  porMes: { mes: string; clima: number; roteiro: number }[];
  porHora: Fatia[];
  porDiaSemana: Fatia[];
  recorrencia: { umaVez: number; duasATres: number; quatroOuMais: number };
  experiencias: Fatia[];
  companhias: Fatia[];
  pilares: Fatia[];
  origens: Fatia[];
  comOrigem: number;
  verbaMedia: number;
  pessoasMedia: number;
  ultimas: ConsultaLinha[];
};

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Conta por chave e ordena do maior para o menor. Chave nula nao entra. */
function agrupar(
  linhas: ConsultaLinha[],
  chave: (l: ConsultaLinha) => string | null,
  limite?: number,
): Fatia[] {
  const mapa = new Map<string, number>();
  for (const l of linhas) {
    const k = chave(l);
    if (!k) continue;
    mapa.set(k, (mapa.get(k) ?? 0) + 1);
  }
  const lista = [...mapa.entries()]
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo, "pt-BR"));
  return limite ? lista.slice(0, limite) : lista;
}

const media = (nums: number[]) =>
  nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;

export async function carregarDashboard(): Promise<DadosDashboard> {
  const data = (await db()`
    select * from clima_consultas order by criado_em desc limit 5000
  `) as ConsultaLinha[];

  // O painel e sobre ROTEIROS. A previsao do tempo e a isca que traz a pessoa
  // ate o app - nao interessa a uma secretaria de turismo e so poluiria os
  // numeros, que ficariam dominados por quem so olhou a temperatura.
  const linhas = ((data ?? []) as ConsultaLinha[]).filter(
    (l) => l.tipo === "roteiro",
  );

  // ---------- meses, em ordem cronologica ----------
  const mapaMes = new Map<string, { clima: number; roteiro: number }>();
  for (const l of linhas) {
    const d = new Date(l.criado_em);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const atual = mapaMes.get(chave) ?? { clima: 0, roteiro: 0 };
    atual[l.tipo] += 1;
    mapaMes.set(chave, atual);
  }
  const porMes = [...mapaMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, v]) => ({
      mes: `${MESES[Number(chave.slice(5)) - 1]}/${chave.slice(2, 4)}`,
      ...v,
    }));

  // ---------- hora do dia: todas as 24, para o eixo nao ter buraco ----------
  const horas = new Array(24).fill(0);
  const dias = new Array(7).fill(0);
  for (const l of linhas) {
    const d = new Date(l.criado_em);
    horas[d.getHours()] += 1;
    dias[d.getDay()] += 1;
  }

  // ---------- recorrencia por visitante ----------
  const porVisitante = new Map<string, number>();
  for (const l of linhas) {
    if (!l.visitante) continue;
    porVisitante.set(l.visitante, (porVisitante.get(l.visitante) ?? 0) + 1);
  }
  const contagens = [...porVisitante.values()];

  const verbas = linhas
    .filter((l) => l.verba != null)
    .map((l) => l.verba as number);
  const pessoas = linhas
    .filter((l) => l.pessoas != null)
    .map((l) => l.pessoas as number);
  const duracoes = linhas
    .filter((l) => l.duracao_ms != null)
    .map((l) => l.duracao_ms as number);

  return {
    total: linhas.length,
    visitantes: porVisitante.size,
    taxaSucesso: linhas.length
      ? linhas.filter((l) => l.sucesso).length / linhas.length
      : 0,
    duracaoMediaMs: media(duracoes),
    porTipo: {
      clima: linhas.filter((l) => l.tipo === "clima").length,
      roteiro: linhas.filter((l) => l.tipo === "roteiro").length,
    },
    porMes,
    porHora: horas.map((valor, h) => ({
      rotulo: String(h).padStart(2, "0"),
      valor,
    })),
    porDiaSemana: dias.map((valor, i) => ({ rotulo: DIAS[i], valor })),
    recorrencia: {
      umaVez: contagens.filter((n) => n === 1).length,
      duasATres: contagens.filter((n) => n >= 2 && n <= 3).length,
      quatroOuMais: contagens.filter((n) => n >= 4).length,
    },
    experiencias: agrupar(linhas, (l) => l.experiencia),
    companhias: agrupar(linhas, (l) => l.companhia),
    pilares: agrupar(linhas, (l) => l.pilar),
    origens: agrupar(linhas, (l) =>
      l.origem_cidade
        ? [l.origem_cidade, l.origem_uf].filter(Boolean).join("/")
        : null,
    ),
    comOrigem: linhas.filter((l) => l.origem_cidade).length,
    verbaMedia: media(verbas),
    pessoasMedia: media(pessoas),
    ultimas: linhas.slice(0, 200),
  };
}
