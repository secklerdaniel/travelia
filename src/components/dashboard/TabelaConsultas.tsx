"use client";

import { Fragment, useMemo, useState } from "react";

import type { ConsultaLinha } from "@/lib/dashboard";

/**
 * Ultimas consultas com o prompt enviado a IA + filtros avançados.
 *
 * O prompt fica recolhido: e um bloco de texto que ocuparia a tela inteira em
 * cada linha e so interessa quando a pessoa vai auditar uma consulta
 * especifica.
 */

const dataHora = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const origem = (l: ConsultaLinha) => {
  if (!l.origem_cidade) return "—";
  const complemento =
    l.origem_pais && l.origem_pais !== "BR" ? l.origem_pais : l.origem_uf;
  return complemento ? `${l.origem_cidade}, ${complemento}` : l.origem_cidade;
};

const POR_PAGINA = 15;

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const MESES: { valor: string; rotulo: string }[] = [
  { valor: "", rotulo: "Todos os meses" },
  { valor: "2026-06", rotulo: "Junho 2026" },
  { valor: "2026-07", rotulo: "Julho 2026" },
  { valor: "2026-08", rotulo: "Agosto 2026" },
];

type StatusFiltro = "" | "ok" | "erro";

function unicos(
  linhas: ConsultaLinha[],
  campo: keyof ConsultaLinha,
): string[] {
  const set = new Set<string>();
  for (const l of linhas) {
    const v = l[campo];
    if (v != null && String(v).trim()) set.add(String(v));
  }
  return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

const selectCls =
  "rounded-full border border-[var(--linha)] bg-black/4 px-3 py-1.5 text-xs outline-none transition focus:border-[rgba(69,61,63,0.35)] focus:bg-black/6 text-[var(--tinta)] max-w-full";

export default function TabelaConsultas({ linhas }: { linhas: ConsultaLinha[] }) {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(0);
  const [aberta, setAberta] = useState<string | null>(null);
  const [avancado, setAvancado] = useState(false);

  // filtros avançados
  const [mes, setMes] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [companhia, setCompanhia] = useState("");
  const [origemCid, setOrigemCid] = useState("");
  const [modelo, setModelo] = useState("");
  const [status, setStatus] = useState<StatusFiltro>("");
  const [soComPrompt, setSoComPrompt] = useState(false);

  const opcoes = useMemo(
    () => ({
      experiencias: unicos(linhas, "experiencia"),
      companhias: unicos(linhas, "companhia"),
      origens: unicos(linhas, "origem_cidade"),
      modelos: unicos(linhas, "modelo"),
    }),
    [linhas],
  );

  const filtrosAtivos = useMemo(() => {
    let n = 0;
    if (mes) n++;
    if (experiencia) n++;
    if (companhia) n++;
    if (origemCid) n++;
    if (modelo) n++;
    if (status) n++;
    if (soComPrompt) n++;
    return n;
  }, [mes, experiencia, companhia, origemCid, modelo, status, soComPrompt]);

  const limparFiltros = () => {
    setMes("");
    setExperiencia("");
    setCompanhia("");
    setOrigemCid("");
    setModelo("");
    setStatus("");
    setSoComPrompt(false);
    setBusca("");
    setPagina(0);
  };

  const visiveis = useMemo(() => {
    const alvo = semAcento(busca.trim());
    return linhas.filter((l) => {
      if (mes) {
        const iso = l.criado_em?.slice(0, 7) ?? "";
        if (iso !== mes) return false;
      }
      if (experiencia && l.experiencia !== experiencia) return false;
      if (companhia && l.companhia !== companhia) return false;
      if (origemCid && l.origem_cidade !== origemCid) return false;
      if (modelo && l.modelo !== modelo) return false;
      if (status === "ok" && l.sucesso === false) return false;
      if (status === "erro" && l.sucesso !== false) return false;
      if (soComPrompt && !l.prompt) return false;

      if (!alvo) return true;
      return semAcento(
        [
          l.origem_cidade,
          l.origem_uf,
          l.origem_pais,
          l.experiencia,
          l.pilar,
          l.companhia,
          l.modelo,
          l.prompt,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(alvo);
    });
  }, [
    linhas,
    busca,
    mes,
    experiencia,
    companhia,
    origemCid,
    modelo,
    status,
    soComPrompt,
  ]);

  const totalPaginas = Math.max(1, Math.ceil(visiveis.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const daPagina = visiveis.slice(
    paginaAtual * POR_PAGINA,
    (paginaAtual + 1) * POR_PAGINA,
  );

  const setFiltro = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPagina(0);
  };

  return (
    <div>
      {/* barra de busca + toggle avançado */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(0);
          }}
          placeholder="Buscar em origem, experiência, companhia, prompt..."
          aria-label="Buscar nas consultas"
          className="min-w-0 flex-1 rounded-full border border-[var(--linha)] bg-black/4 px-4 py-1.5 text-xs outline-none transition placeholder:text-[var(--tinta-fraca)] focus:border-[rgba(69,61,63,0.35)] focus:bg-black/6 sm:max-w-xs"
        />
        <button
          type="button"
          onClick={() => setAvancado((v) => !v)}
          aria-expanded={avancado}
          className="rounded-full border border-[var(--linha)] bg-black/4 px-3 py-1.5 text-xs transition hover:border-[rgba(69,61,63,0.35)] hover:bg-black/8"
        >
          Filtros avançados
          {filtrosAtivos > 0 && (
            <span className="ml-1.5 inline-grid h-4 min-w-4 place-items-center rounded-full bg-[var(--tinta-forte,#453d3f)] px-1 text-[10px] font-medium text-white">
              {filtrosAtivos}
            </span>
          )}
          <span className="ml-1 text-[var(--tinta-fraca)]" aria-hidden>
            {avancado ? "▴" : "▾"}
          </span>
        </button>
        {(filtrosAtivos > 0 || busca) && (
          <button
            type="button"
            onClick={limparFiltros}
            className="rounded-full border border-transparent px-2 py-1.5 text-xs text-[var(--tinta-fraca)] underline-offset-2 transition hover:underline"
          >
            Limpar
          </button>
        )}
      </div>

      {/* painel avançado */}
      {avancado && (
        <div className="mb-4 grid gap-3 rounded-2xl border border-[var(--linha)] bg-black/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--tinta-fraca)]">
              Mês
            </span>
            <select
              value={mes}
              onChange={(e) => setFiltro(setMes)(e.target.value)}
              className={selectCls}
            >
              {MESES.map((m) => (
                <option key={m.valor || "all"} value={m.valor}>
                  {m.rotulo}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--tinta-fraca)]">
              Experiência
            </span>
            <select
              value={experiencia}
              onChange={(e) => setFiltro(setExperiencia)(e.target.value)}
              className={selectCls}
            >
              <option value="">Todas</option>
              {opcoes.experiencias.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--tinta-fraca)]">
              Companhia
            </span>
            <select
              value={companhia}
              onChange={(e) => setFiltro(setCompanhia)(e.target.value)}
              className={selectCls}
            >
              <option value="">Todas</option>
              {opcoes.companhias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--tinta-fraca)]">
              Origem
            </span>
            <select
              value={origemCid}
              onChange={(e) => setFiltro(setOrigemCid)(e.target.value)}
              className={selectCls}
            >
              <option value="">Todas</option>
              {opcoes.origens.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--tinta-fraca)]">
              Modelo
            </span>
            <select
              value={modelo}
              onChange={(e) => setFiltro(setModelo)(e.target.value)}
              className={selectCls}
            >
              <option value="">Todos</option>
              {opcoes.modelos.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--tinta-fraca)]">
              Status
            </span>
            <select
              value={status}
              onChange={(e) =>
                setFiltro(setStatus)(e.target.value as StatusFiltro)
              }
              className={selectCls}
            >
              <option value="">Todos</option>
              <option value="ok">Sucesso</option>
              <option value="erro">Com erro</option>
            </select>
          </label>

          <label className="flex cursor-pointer items-center gap-2 self-end pb-1.5 text-xs text-[var(--tinta)]">
            <input
              type="checkbox"
              checked={soComPrompt}
              onChange={(e) => {
                setSoComPrompt(e.target.checked);
                setPagina(0);
              }}
              className="rounded border-[var(--linha)]"
            />
            Só com prompt
          </label>
        </div>
      )}

      {/* chips dos filtros ativos */}
      {filtrosAtivos > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {mes && (
            <Chip
              rotulo={MESES.find((m) => m.valor === mes)?.rotulo ?? mes}
              onRemove={() => setFiltro(setMes)("")}
            />
          )}
          {experiencia && (
            <Chip rotulo={experiencia} onRemove={() => setFiltro(setExperiencia)("")} />
          )}
          {companhia && (
            <Chip rotulo={companhia} onRemove={() => setFiltro(setCompanhia)("")} />
          )}
          {origemCid && (
            <Chip rotulo={origemCid} onRemove={() => setFiltro(setOrigemCid)("")} />
          )}
          {modelo && (
            <Chip rotulo={modelo} onRemove={() => setFiltro(setModelo)("")} />
          )}
          {status && (
            <Chip
              rotulo={status === "ok" ? "Sucesso" : "Com erro"}
              onRemove={() => setFiltro(setStatus)("")}
            />
          )}
          {soComPrompt && (
            <Chip rotulo="Com prompt" onRemove={() => { setSoComPrompt(false); setPagina(0); }} />
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--linha)] text-left">
              {["Quando", "Origem", "Contexto", ""].map((h) => (
                <th
                  key={h}
                  className="pb-2.5 pr-3 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--tinta-fraca)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daPagina.map((l) => {
              const expandida = aberta === l.id;
              return (
                <Fragment key={l.id}>
                  <tr className="border-b border-[var(--linha)] transition hover:bg-black/3">
                    <td className="py-2.5 pr-3 font-mono text-xs tabular-nums text-[var(--tinta)]">
                      {dataHora(l.criado_em)}
                    </td>
                    <td className="max-w-[160px] truncate py-2.5 pr-3 text-[var(--tinta)]">
                      {origem(l)}
                    </td>
                    <td className="max-w-[220px] truncate py-2.5 pr-3 text-[var(--tinta-fraca)]">
                      {[l.experiencia, l.pilar, l.companhia]
                        .filter(Boolean)
                        .join(" · ")}
                    </td>
                    <td className="py-2.5 text-right">
                      {l.prompt && (
                        <button
                          type="button"
                          onClick={() => setAberta(expandida ? null : l.id)}
                          aria-expanded={expandida}
                          className="rounded-full border border-[var(--linha)] px-2.5 py-1 text-[11px] text-[var(--tinta-fraca)] transition hover:border-[rgba(69,61,63,0.35)] hover:text-[var(--tinta-forte)]"
                        >
                          {expandida ? "fechar" : "prompt"}
                        </button>
                      )}
                    </td>
                  </tr>

                  {expandida && l.prompt && (
                    <tr>
                      <td colSpan={4} className="pb-4">
                        <pre className="whitespace-pre-wrap break-words rounded-xl border border-[var(--linha)] bg-black/5 p-4 font-mono text-xs leading-relaxed text-[var(--tinta)]">
                          {l.prompt}
                        </pre>
                        {l.modelo && (
                          <p className="mt-1.5 text-[11px] text-[var(--tinta-fraca)]">
                            modelo: {l.modelo}
                            {l.duracao_ms
                              ? ` · ${(l.duracao_ms / 1000).toFixed(1)}s`
                              : ""}
                            {!l.sucesso && l.erro ? ` · erro: ${l.erro}` : ""}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {visiveis.length === 0 && (
        <p className="py-10 text-center text-sm text-[var(--tinta-fraca)]">
          Nenhuma consulta encontrada
          {filtrosAtivos > 0 || busca ? " com esses filtros." : "."}
        </p>
      )}

      {visiveis.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[var(--tinta-fraca)]">
            {paginaAtual * POR_PAGINA + 1}–
            {Math.min((paginaAtual + 1) * POR_PAGINA, visiveis.length)} de{" "}
            {visiveis.length}
            {visiveis.length !== linhas.length && (
              <span className="text-[var(--tinta-fraca)]">
                {" "}
                (filtrado de {linhas.length})
              </span>
            )}
          </span>

          {totalPaginas > 1 && (
            <div className="flex items-center gap-1.5">
              <BotaoPagina
                rotulo="Anterior"
                simbolo="‹"
                onClick={() => setPagina(paginaAtual - 1)}
                desabilitado={paginaAtual === 0}
              />
              <span className="px-2 font-mono text-xs tabular-nums text-[var(--tinta-fraca)]">
                {paginaAtual + 1} / {totalPaginas}
              </span>
              <BotaoPagina
                rotulo="Próxima"
                simbolo="›"
                onClick={() => setPagina(paginaAtual + 1)}
                desabilitado={paginaAtual >= totalPaginas - 1}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({
  rotulo,
  onRemove,
}: {
  rotulo: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--linha)] bg-black/4 px-2.5 py-0.5 text-[11px] text-[var(--tinta)] transition hover:border-[rgba(69,61,63,0.35)] hover:bg-black/8"
      title="Remover filtro"
    >
      {rotulo}
      <span aria-hidden className="text-[var(--tinta-fraca)]">
        ×
      </span>
    </button>
  );
}

function BotaoPagina({
  rotulo,
  simbolo,
  onClick,
  desabilitado,
}: {
  rotulo: string;
  simbolo: string;
  onClick: () => void;
  desabilitado: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      aria-label={rotulo}
      className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--linha)] bg-black/4 text-sm transition hover:border-[rgba(69,61,63,0.35)] hover:bg-black/8 disabled:cursor-not-allowed disabled:opacity-25"
    >
      {simbolo}
    </button>
  );
}