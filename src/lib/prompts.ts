import { PADRAO_POR_CHAVE, PROMPTS_PADRAO } from "@/config/prompts-padrao";
import { db } from "./db";

/**
 * Prompts em uso: o que estiver salvo no banco, senao o padrao de fabrica.
 *
 * O fallback nao e detalhe de robustez, e o desenho: a tabela guarda apenas o
 * que foi editado. Banco fora do ar, linha apagada ou tabela vazia -> o app
 * segue com o texto do codigo. Nenhuma edicao ruim consegue derrubar a IA, e
 * "restaurar padrao" vira simplesmente apagar a linha.
 */

export const TABELA_PROMPTS = "clima_prompts";

export type PromptEmUso = {
  chave: string;
  nome: string;
  descricao: string;
  variaveis: string[];
  conteudo: string;
  /** false = usando o texto de fabrica. */
  editado: boolean;
  atualizadoEm: string | null;
  editadoPor: string | null;
  /** Para o painel oferecer "restaurar". */
  padrao: string;
};

type LinhaPrompt = {
  chave: string;
  conteudo: string;
  editado_por: string | null;
  atualizado_em: string;
};

/** Edicoes salvas, indexadas por chave. Nunca lanca: falha vira mapa vazio. */
async function edicoes(): Promise<Map<string, LinhaPrompt>> {
  try {
    const linhas = (await db()`select * from clima_prompts`) as LinhaPrompt[];
    return new Map(linhas.map((l) => [l.chave, l]));
  } catch (e) {
    console.error("[prompts] usando padrao de fabrica:", e);
    return new Map();
  }
}

/** Todos os prompts, para o painel. */
export async function listarPrompts(): Promise<PromptEmUso[]> {
  const salvos = await edicoes();

  return PROMPTS_PADRAO.map((p) => {
    const salvo = salvos.get(p.chave);
    return {
      chave: p.chave,
      nome: p.nome,
      descricao: p.descricao,
      variaveis: p.variaveis,
      conteudo: salvo?.conteudo ?? p.conteudo,
      editado: !!salvo,
      atualizadoEm: salvo?.atualizado_em ?? null,
      editadoPor: salvo?.editado_por ?? null,
      padrao: p.conteudo,
    };
  });
}

/** Conteudo de um prompt, pronto para uso. */
export async function obterPrompt(chave: string): Promise<string> {
  const padrao = PADRAO_POR_CHAVE.get(chave);
  if (!padrao) throw new Error(`Prompt desconhecido: ${chave}`);

  const salvos = await edicoes();
  return salvos.get(chave)?.conteudo ?? padrao.conteudo;
}

/**
 * Troca `{{marcador}}` pelos valores.
 *
 * Marcador sem valor correspondente e removido em vez de sair literal no
 * prompt - um `{{lcoal}}` digitado errado vira espaco, nao instrucao confusa
 * para o modelo.
 */
export function preencher(
  template: string,
  valores: Record<string, string | number>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, nome: string) => {
    const v = valores[nome];
    return v === undefined || v === null ? "" : String(v);
  });
}

/** Prompt do banco (ou padrao) ja preenchido. */
export async function promptPreenchido(
  chave: string,
  valores: Record<string, string | number> = {},
): Promise<string> {
  return preencher(await obterPrompt(chave), valores);
}

/** Marcadores usados no texto que nao estao na lista permitida. */
export function marcadoresInvalidos(
  conteudo: string,
  permitidos: string[],
): string[] {
  const usados = [...conteudo.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]);
  return [...new Set(usados.filter((u) => !permitidos.includes(u)))];
}

/** Salva a edicao. Passar o proprio padrao apaga a linha (restaura fabrica). */
export async function salvarPrompt(
  chave: string,
  conteudo: string,
  editadoPor?: string | null,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const padrao = PADRAO_POR_CHAVE.get(chave);
  if (!padrao) return { ok: false, erro: `Prompt desconhecido: ${chave}` };

  const texto = conteudo.trim();
  if (!texto) return { ok: false, erro: "O prompt nao pode ficar vazio." };

  const invalidos = marcadoresInvalidos(texto, padrao.variaveis);
  if (invalidos.length) {
    return {
      ok: false,
      erro:
        `Marcador desconhecido: ${invalidos.map((m) => `{{${m}}}`).join(", ")}. ` +
        `Disponiveis: ${padrao.variaveis.map((v) => `{{${v}}}`).join(", ") || "nenhum"}.`,
    };
  }

  // voltou a ser igual ao padrao: apaga em vez de guardar copia
  if (texto === padrao.conteudo.trim()) return restaurarPrompt(chave);

  try {
    await db().query(
      `insert into clima_prompts (chave, conteudo, editado_por)
       values ($1, $2, $3)
       on conflict (chave) do update
         set conteudo = excluded.conteudo,
             editado_por = excluded.editado_por,
             atualizado_em = now()`,
      [chave, texto, editadoPor ?? null],
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) };
  }
}

/** Apaga a edicao: o app volta a usar o texto de fabrica. */
export async function restaurarPrompt(
  chave: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await db().query(`delete from clima_prompts where chave = $1`, [chave]);
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) };
  }
}
