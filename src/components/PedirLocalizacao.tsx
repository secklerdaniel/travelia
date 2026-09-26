"use client";

import { useEffect, useState } from "react";

import { lerOrigem, marcarRecusa, pedirOrigem, recusou, type Origem } from "@/lib/origem";

/**
 * Convite para compartilhar a cidade de origem.
 *
 * Opcional e discreto de proposito: a consulta funciona igual sem isso. O
 * texto diz para que serve - pedir localizacao sem explicar o porque e o
 * caminho mais curto para a pessoa negar.
 *
 * Some depois de aceitar ou recusar, e nao volta a aparecer.
 */
export default function PedirLocalizacao() {
  const [estado, setEstado] = useState<"oculto" | "convite" | "pedindo" | "pronto">(
    "oculto",
  );
  const [origem, setOrigem] = useState<Origem | null>(null);

  // Só depois da montagem: localStorage não existe no servidor.
  useEffect(() => {
    const salva = lerOrigem();
    if (salva) {
      setOrigem(salva);
      setEstado("pronto");
      return;
    }
    if (!recusou()) setEstado("convite");
  }, []);

  if (estado === "oculto") return null;

  if (estado === "pronto" && origem) {
    return (
      <p className="mt-4 flex items-center gap-2 text-xs text-white/35">
        <span aria-hidden="true">📍</span>
        Consultando de {origem.cidade}
        {origem.uf ? `, ${origem.uf}` : ""}
      </p>
    );
  }

  // Sem texto explicativo na tela: o porque vive no tooltip de cada botao. O
  // paragrafo ocupava tres linhas para dizer o que o rotulo do botao ja diz, e
  // no celular era o pior bloco da pagina.
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={estado === "pedindo"}
        title="Compartilha só o município, nunca o endereço. Serve para o destino saber de onde vem o interesse."
        onClick={async () => {
          setEstado("pedindo");
          const nova = await pedirOrigem();
          if (nova) {
            setOrigem(nova);
            setEstado("pronto");
          } else {
            // recusa no navegador ou falha: nao insiste
            marcarRecusa();
            setEstado("oculto");
          }
        }}
        className="cursor-pointer rounded-full border border-white/12 bg-white/5 px-3.5 py-2 text-xs text-white/60 transition hover:border-white/25 hover:bg-white/10 hover:text-white/90 disabled:opacity-50"
      >
        <span aria-hidden="true" className="mr-1.5">
          📍
        </span>
        {estado === "pedindo" ? "Localizando..." : "Compartilhar localização"}
      </button>

      <button
        type="button"
        title="Fecha o convite e não pergunta de novo neste navegador."
        onClick={() => {
          marcarRecusa();
          setEstado("oculto");
        }}
        className="cursor-pointer rounded-full px-3 py-2 text-xs text-white/35 transition hover:text-white/70"
      >
        Agora não
      </button>
    </div>
  );
}
