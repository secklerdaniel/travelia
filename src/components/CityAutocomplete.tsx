"use client";

import { useEffect, useRef, useState } from "react";

import type { Cidade } from "@/lib/cidades";

type Props = {
  valor: string;
  onChange: (v: string) => void;
  /** Chamado quando a pessoa escolhe da lista - ja vem "Gramado,RS". */
  onEscolher?: (cidade: Cidade) => void;
  placeholder?: string;
  desabilitado?: boolean;
  className?: string;
  "aria-label"?: string;
};

/** Espera antes de consultar: evita uma requisicao por tecla digitada. */
const DEBOUNCE = 180;

export default function CityAutocomplete({
  valor,
  onChange,
  onEscolher,
  placeholder,
  desabilitado,
  className = "",
  "aria-label": ariaLabel,
}: Props) {
  const [sugestoes, setSugestoes] = useState<Cidade[]>([]);
  const [aberto, setAberto] = useState(false);
  const [destacada, setDestacada] = useState(-1);

  const caixaRef = useRef<HTMLDivElement>(null);
  /** Marca quem originou a mudanca: escolha da lista nao dispara nova busca. */
  const ignorarProxima = useRef(false);

  useEffect(() => {
    if (ignorarProxima.current) {
      ignorarProxima.current = false;
      return;
    }

    const termo = valor.trim();
    if (termo.length < 2) {
      setSugestoes([]);
      setAberto(false);
      return;
    }

    const cancelar = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/cidades?q=${encodeURIComponent(termo)}`, {
          signal: cancelar.signal,
        });
        const json = await r.json();
        const lista: Cidade[] = json.cidades ?? [];
        setSugestoes(lista);
        setAberto(lista.length > 0);
        setDestacada(-1);
      } catch {
        /* requisicao cancelada ou rede fora: segue sem sugestao */
      }
    }, DEBOUNCE);

    return () => {
      clearTimeout(timer);
      cancelar.abort();
    };
  }, [valor]);

  // clique fora fecha a lista
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!caixaRef.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  function escolher(cidade: Cidade) {
    ignorarProxima.current = true;
    onChange(`${cidade.nome},${cidade.uf}`);
    onEscolher?.(cidade);
    setAberto(false);
    setSugestoes([]);
    setDestacada(-1);
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!aberto || sugestoes.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setDestacada((i) => (i + 1) % sugestoes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDestacada((i) => (i <= 0 ? sugestoes.length - 1 : i - 1));
    } else if (e.key === "Enter" && destacada >= 0) {
      // so intercepta o Enter se houver item destacado; senao o form envia
      e.preventDefault();
      escolher(sugestoes[destacada]);
    } else if (e.key === "Escape") {
      setAberto(false);
    }
  }

  return (
    <div ref={caixaRef} className="relative min-w-0 flex-1">
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={aoTeclar}
        onFocus={() => sugestoes.length > 0 && setAberto(true)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={desabilitado}
        autoComplete="off"
        role="combobox"
        aria-expanded={aberto}
        aria-autocomplete="list"
        aria-controls="lista-cidades"
        className={className}
      />

      {aberto && (
        <ul
          id="lista-cidades"
          role="listbox"
          className="lista-cidades absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/12 bg-slate-900/95 py-1.5 shadow-2xl backdrop-blur-xl"
        >
          {sugestoes.map((cidade, i) => (
            <li key={`${cidade.nome}-${cidade.uf}`} role="option" aria-selected={i === destacada}>
              <button
                type="button"
                onClick={() => escolher(cidade)}
                onMouseEnter={() => setDestacada(i)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[15px] transition ${
                  i === destacada ? "bg-white/12 text-white" : "text-white/75"
                }`}
              >
                <span className="truncate">{cidade.nome}</span>
                <span className="shrink-0 font-mono text-xs text-white/40">
                  {cidade.uf}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
