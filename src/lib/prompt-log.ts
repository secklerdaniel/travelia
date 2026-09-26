/**
 * Formata a conversa enviada ao modelo para o historico.
 *
 * O que importa auditar nao e so a pergunta do usuario: o comportamento da IA
 * vem das INSTRUCOES do sistema. Guardar so a ultima mensagem esconde
 * justamente a parte que voce ajusta quando a resposta sai errada.
 *
 * O formato e texto puro com marcadores de papel - le direto na tela do
 * painel, sem precisar de visualizador de JSON.
 */

export type Mensagem = {
  role: "system" | "user" | "assistant";
  content: string;
};

const TITULOS: Record<Mensagem["role"], string> = {
  system: "SISTEMA",
  user: "USUÁRIO",
  assistant: "ASSISTENTE",
};

export function formatarPrompt(mensagens: Mensagem[]): string {
  return mensagens
    .map((m) => `───── ${TITULOS[m.role]} ─────\n${m.content}`)
    .join("\n\n");
}
