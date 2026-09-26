"use client";

import { useState } from "react";

import type { PromptEmUso } from "@/lib/prompts";

/**
 * CRUD dos prompts da IA.
 *
 * "Restaurar" apaga a linha do banco em vez de gravar o texto de fabrica: o
 * padrao mora no codigo, entao ausencia de registro JA significa padrao. Assim
 * o prompt volta a acompanhar o codigo em deploys futuros, em vez de congelar
 * uma copia do texto de hoje.
 */
export default function EditorPrompts({ inicial }: { inicial: PromptEmUso[] }) {
  const [prompts, setPrompts] = useState(inicial);
  const [aberto, setAberto] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState<string | null>(null);

  function abrir(p: PromptEmUso) {
    setAberto(p.chave);
    setRascunho(p.conteudo);
    setErro(null);
    setSalvo(null);
  }

  async function enviar(metodo: "PUT" | "DELETE", chave: string) {
    setSalvando(true);
    setErro(null);
    try {
      const r = await fetch(
        metodo === "DELETE"
          ? `/api/prompts?chave=${encodeURIComponent(chave)}`
          : "/api/prompts",
        {
          method: metodo,
          headers: { "Content-Type": "application/json" },
          body:
            metodo === "PUT"
              ? JSON.stringify({ chave, conteudo: rascunho })
              : undefined,
        },
      );
      const json = await r.json();
      if (!r.ok) {
        setErro(json?.erro ?? "Não consegui salvar.");
        return;
      }

      const lista: PromptEmUso[] = json.prompts;
      setPrompts(lista);
      setSalvo(chave);
      setTimeout(() => setSalvo(null), 2500);

      // depois de restaurar, o textarea precisa mostrar o texto de fabrica
      const atualizado = lista.find((p) => p.chave === chave);
      if (atualizado) setRascunho(atualizado.conteudo);
    } catch {
      setErro("Não consegui falar com o servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {prompts.map((p) => {
        const expandido = aberto === p.chave;
        const alterado = expandido && rascunho !== p.conteudo;

        return (
          <section key={p.chave} className="painel rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base font-medium">{p.nome}</h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                      p.editado
                        ? "bg-amber-400/15 text-amber-200"
                        : "bg-[rgba(69,61,63,0.08)] text-[var(--tinta-fraca)]"
                    }`}
                  >
                    {p.editado ? "editado" : "padrão"}
                  </span>
                  {salvo === p.chave && (
                    <span className="text-[11px] text-emerald-300">salvo ✓</span>
                  )}
                </div>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--tinta-fraca)]">
                  {p.descricao}
                </p>
                <p className="mt-1.5 font-mono text-[11px] text-[var(--tinta-fraca)]">
                  {p.chave}
                  {p.atualizadoEm &&
                    ` · alterado em ${new Date(p.atualizadoEm).toLocaleString("pt-BR")}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => (expandido ? setAberto(null) : abrir(p))}
                className="shrink-0 rounded-full border border-[var(--linha)] bg-black/4 px-4 py-1.5 text-xs transition hover:border-[rgba(69,61,63,0.35)] hover:bg-black/8"
              >
                {expandido ? "fechar" : "editar"}
              </button>
            </div>

            {expandido && (
              <div className="mt-4">
                {p.variaveis.length > 0 && (
                  <p className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--tinta-fraca)]">
                    Marcadores disponíveis:
                    {p.variaveis.map((v) => (
                      <code
                        key={v}
                        className="rounded bg-[rgba(69,61,63,0.08)] px-1.5 py-0.5 font-mono text-[var(--tinta)]"
                      >
                        {`{{${v}}}`}
                      </code>
                    ))}
                  </p>
                )}

                <textarea
                  value={rascunho}
                  onChange={(e) => setRascunho(e.target.value)}
                  spellCheck={false}
                  rows={14}
                  className="w-full resize-y rounded-xl border border-[var(--linha)] bg-black/5 p-4 font-mono text-xs leading-relaxed text-[var(--tinta-forte)] outline-none transition focus:border-sky-400/50"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void enviar("PUT", p.chave)}
                    disabled={salvando || !alterado}
                    className="cursor-pointer rounded-full bg-sky-500 px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {salvando ? "Salvando..." : "Salvar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRascunho(p.conteudo)}
                    disabled={!alterado}
                    className="rounded-full border border-[var(--linha)] px-4 py-2 text-sm text-[var(--tinta)] transition hover:border-[rgba(69,61,63,0.35)] disabled:opacity-30"
                  >
                    Desfazer
                  </button>

                  {p.editado && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Restaurar "${p.nome}" ao padrão?`)) {
                          void enviar("DELETE", p.chave);
                        }
                      }}
                      disabled={salvando}
                      className="ml-auto rounded-full border border-red-400/30 bg-red-500/12 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/22"
                    >
                      Restaurar padrão
                    </button>
                  )}
                </div>

                {erro && (
                  <p
                    role="alert"
                    className="mt-3 rounded-xl border border-red-400/30 bg-red-500/12 px-3.5 py-2.5 text-xs text-red-200"
                  >
                    {erro}
                  </p>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
