"use client";

import { useCallback, useEffect, useState } from "react";

import { NOME_CIDADE_FIXA } from "@/config/limites";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import WeatherCard from "@/components/WeatherCard";
import { humanizarCidade } from "@/lib/format";
import { lerOrigem } from "@/lib/origem";
import type { Clima } from "@/lib/types";

/** Ordem alfabetica pelo nome da cidade, respeitando acentos do portugues. */
function emOrdem(lista: Clima[]): Clima[] {
  return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export default function Home() {
  const [entrada, setEntrada] = useState("");
  const [climas, setClimas] = useState<Clima[]>([]);
  /** id do card em operacao - so ele fica travado, os outros seguem usaveis. */
  const [ocupadoId, setOcupadoId] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);
  /** Mensagem da trava diaria: informativa, nao e erro. */
  const [nota, setNota] = useState<string | null>(null);
  /** Card que acabou de chegar - a pagina rola ate ele e o campo se limpa. */
  const [focoId, setFocoId] = useState<string | null>(null);

  const carregarSalvos = useCallback(async () => {
    try {
      const r = await fetch("/api/clima");
      const json = await r.json();
      if (!r.ok) {
        setErro(json?.erro ?? "Nao consegui ler as previsoes salvas.");
        return;
      }
      const todas: Clima[] = json.climas ?? [];
      // Com cidade fixa a lista mostra so ela, mesmo que o banco tenha outras
      // de buscas antigas.
      setClimas(
        emOrdem(
          NOME_CIDADE_FIXA
            ? todas.filter((c) => c.nome === NOME_CIDADE_FIXA)
            : todas,
        ),
      );
    } catch {
      setErro("Nao consegui falar com o servidor.");
    }
  }, []);

  useEffect(() => {
    void carregarSalvos();
  }, [carregarSalvos]);

  /**
   * Leva a pessoa ate a previsao que acabou de ficar pronta.
   *
   * Roda depois que o card ja esta na tela - o estado do card e o `focoId` sao
   * gravados no mesmo evento, entao o React pinta os dois juntos.
   */
  useEffect(() => {
    if (!focoId) return;

    const card = document.getElementById(`clima-${focoId}`);
    setFocoId(null);
    if (!card) return;

    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
  }, [focoId, climas]);

  /** Busca na OpenWeather, gera analise + audio e salva tudo. */
  async function consultar(cidade: string, idExistente?: string) {
    const alvo = cidade.trim();
    if (!alvo || buscando || ocupadoId) return;

    if (idExistente) setOcupadoId(idExistente);
    else setBuscando(true);
    setErro(null);
    setAvisos([]);
    setNota(null);

    try {
      const r = await fetch("/api/clima", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cidade: alvo, origem: lerOrigem() }),
      });
      const json = await r.json();

      if (!r.ok) {
        setErro(json?.erro ?? `Nao consegui buscar ${humanizarCidade(alvo)}.`);
        return;
      }

      const clima: Clima = json.clima;
      setAvisos(json.avisos ?? []);
      if (json.bloqueada) setNota(json.mensagem ?? null);

      setClimas((lista) =>
        emOrdem([clima, ...lista.filter((c) => c.id !== clima.id)]),
      );
      // Tambem rola quando a consulta veio travada pelo intervalo: o card
      // existe, e e ele que a pessoa pediu para ver.
      setFocoId(clima.id);
      if (!idExistente) setEntrada("");
    } catch {
      setErro("Nao consegui falar com o servidor.");
    } finally {
      setOcupadoId(null);
      setBuscando(false);
    }
  }

  async function deletar(clima: Clima) {
    if (ocupadoId || buscando) return;
    if (!window.confirm(`Apagar a previsao de ${clima.nome}?`)) return;

    setOcupadoId(clima.id);
    setErro(null);
    setAvisos([]);
    setNota(null);

    try {
      const r = await fetch(`/api/clima?id=${encodeURIComponent(clima.id)}`, {
        method: "DELETE",
      });
      const json = await r.json();

      if (!r.ok) {
        setErro(json?.erro ?? "Nao consegui deletar a previsao.");
        return;
      }
      setClimas((lista) => lista.filter((c) => c.id !== clima.id));
    } catch {
      setErro("Nao consegui falar com o servidor.");
    } finally {
      setOcupadoId(null);
    }
  }

  return (
    <main className="w-full">
      {/* Capa: identidade, busca e atalhos. A localizacao tambem entra por
          aqui, entao o convite avulso saiu da pagina. */}
      <Hero
        valor={entrada}
        onChange={setEntrada}
        onBuscar={(cidade) => void consultar(cidade)}
        buscando={buscando || !!ocupadoId}
        mensagem={
          buscando
            ? "Consultando o clima, escrevendo a análise e gravando o áudio..."
            : null
        }
      />

      <div className="mx-auto w-full max-w-2xl px-4 pb-10 sm:pb-14">
        {erro && (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/12 px-4 py-3 text-sm text-red-200"
          >
            {erro}
          </p>
        )}

        {nota && (
          <p className="mt-5 flex items-start gap-2.5 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white/70">
            <span aria-hidden="true">🕐</span>
            {nota}
          </p>
        )}

        {avisos.length > 0 && (
          <ul className="mt-5 space-y-1 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}

        {/* Todas as cidades salvas, sempre visiveis e em ordem alfabetica.
            O `scroll-mt` deixa uma folga acima do card quando a pagina rola
            ate ele - encostado no topo da janela fica sufocado. */}
        <div className="flex flex-col gap-5">
          {climas.map((clima) => (
            <div key={clima.id} id={`clima-${clima.id}`} className="scroll-mt-6">
              <WeatherCard
                clima={clima}
                ocupado={ocupadoId === clima.id}
                onAtualizar={() => void consultar(clima.city_query, clima.id)}
                onDeletar={() => void deletar(clima)}
              />
            </div>
          ))}
        </div>

        {climas.length === 0 && !buscando && !erro && (
          <p className="mt-10 text-center text-sm text-white/40">
            Nenhuma previsão salva ainda. Busque uma cidade para começar.
          </p>
        )}
      </div>

      {/* Fora do container: o rodape ocupa a largura da tela, e a faixa com
          ele. A assinatura se recentraliza sozinha la dentro. */}
      <Footer />
    </main>
  );
}
