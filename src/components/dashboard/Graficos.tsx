"use client";

import { useState } from "react";

import type { Fatia } from "@/lib/dashboard";

/**
 * Graficos do painel, no estilo Chartist: SVG puro, traco fino, ponto cheio no
 * vertice, grade pontilhada e rotulo direto sobre a fatia.
 *
 * Sem biblioteca - estas formas custam poucas linhas de SVG, e somar centenas
 * de KB de dependencia por causa de quatro graficos nao se paga.
 *
 * As cores (--serie-1 a --serie-5) sao as do proprio Chartist, validadas em
 * globals.css contra o fundo bege. Elas identificam SERIE, nunca grandeza.
 */

const fmt = (n: number) => n.toLocaleString("pt-BR");

// =====================================================================
// Linha com pontos - series ao longo do tempo
// =====================================================================

type SerieLinha = { nome: string; cor: string; valores: number[] };

export function GraficoLinha({
  rotulos,
  series,
  altura = 210,
}: {
  rotulos: string[];
  series: SerieLinha[];
  altura?: number;
}) {
  const [ativo, setAtivo] = useState<number | null>(null);

  const L = 44; // espaco do eixo Y
  const R = 12;
  const T = 12;
  const B = 26;
  const W = 640;
  const H = altura;

  const maximo = Math.max(1, ...series.flatMap((s) => s.valores));
  // teto redondo: o eixo termina em 25, nao em 23
  const teto = Math.ceil(maximo / 5) * 5 || 5;
  const passos = 4;

  const x = (i: number) =>
    rotulos.length === 1
      ? L + (W - L - R) / 2
      : L + (i * (W - L - R)) / (rotulos.length - 1);
  const y = (v: number) => T + (1 - v / teto) * (H - T - B);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        {Array.from({ length: passos + 1 }, (_, i) => {
          const v = (teto / passos) * i;
          return (
            <g key={i}>
              <line
                x1={L}
                y1={y(v)}
                x2={W - R}
                y2={y(v)}
                stroke="var(--linha)"
                strokeDasharray="2 4"
              />
              <text
                x={L - 10}
                y={y(v) + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--tinta-fraca)"
              >
                {v}
              </text>
            </g>
          );
        })}

        {ativo !== null && (
          <line
            x1={x(ativo)}
            y1={T}
            x2={x(ativo)}
            y2={H - B}
            stroke="var(--linha)"
          />
        )}

        {series.map((s) => (
          <g key={s.nome}>
            <polyline
              points={s.valores.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none"
              stroke={s.cor}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.valores.map((v, i) => (
              <circle
                key={i}
                cx={x(i)}
                cy={y(v)}
                r={ativo === i ? 5.5 : 4}
                fill={s.cor}
                stroke="var(--fundo-painel)"
                strokeWidth="2"
              />
            ))}
          </g>
        ))}

        {rotulos.map((r, i) => (
          <text
            key={r}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="11"
            fill="var(--tinta-fraca)"
          >
            {r}
          </text>
        ))}

        {/* areas de captura maiores que os pontos, para o hover nao exigir mira */}
        {rotulos.map((r, i) => (
          <rect
            key={`hit-${r}`}
            x={x(i) - (W - L - R) / (rotulos.length * 2)}
            y={0}
            width={(W - L - R) / rotulos.length}
            height={H}
            fill="transparent"
            onMouseEnter={() => setAtivo(i)}
            onMouseLeave={() => setAtivo(null)}
          />
        ))}
      </svg>

      <div className="mt-3 flex min-h-[20px] flex-wrap items-center gap-4">
        {series.map((s) => (
          <span
            key={s.nome}
            className="flex items-center gap-2 text-xs text-[var(--tinta)]"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: s.cor }}
            />
            {s.nome}
            {ativo !== null && (
              <strong className="font-mono tabular-nums text-[var(--tinta-forte)]">
                {fmt(s.valores[ativo] ?? 0)}
              </strong>
            )}
          </span>
        ))}
        {ativo !== null && (
          <span className="text-xs text-[var(--tinta-fraca)]">
            em {rotulos[ativo]}
          </span>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Rosca e pizza
// =====================================================================

/** Fatias -> caminhos SVG. Raio interno 0 devolve pizza. */
function fatias(dados: Fatia[], raio: number, raioInterno: number) {
  const total = dados.reduce((s, d) => s + d.valor, 0) || 1;
  let angulo = -Math.PI / 2; // comeca no topo

  return dados.map((d) => {
    const arco = (d.valor / total) * Math.PI * 2;
    const fim = angulo + arco;
    const grande = arco > Math.PI ? 1 : 0;

    const p = (r: number, a: number) =>
      `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;

    const caminho = raioInterno
      ? `M ${p(raio, angulo)} A ${raio} ${raio} 0 ${grande} 1 ${p(raio, fim)} L ${p(raioInterno, fim)} A ${raioInterno} ${raioInterno} 0 ${grande} 0 ${p(raioInterno, angulo)} Z`
      : `M 0,0 L ${p(raio, angulo)} A ${raio} ${raio} 0 ${grande} 1 ${p(raio, fim)} Z`;

    const meio = angulo + arco / 2;
    angulo = fim;

    return {
      ...d,
      caminho,
      pct: d.valor / total,
      rotuloX: (raio + 20) * Math.cos(meio),
      rotuloY: (raio + 20) * Math.sin(meio),
      ancora: (Math.cos(meio) > 0.1
        ? "start"
        : Math.cos(meio) < -0.1
          ? "end"
          : "middle") as "start" | "end" | "middle",
    };
  });
}

export function Rosca({
  dados,
  cores,
  centro,
  legendaCentro,
}: {
  dados: Fatia[];
  cores: string[];
  centro?: string;
  legendaCentro?: string;
}) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const partes = fatias(dados, 78, 52);
  const total = dados.reduce((s, d) => s + d.valor, 0);

  if (!total) {
    return <p className="py-8 text-sm text-[var(--tinta-fraca)]">Sem dados.</p>;
  }

  return (
    <div>
      <svg viewBox="-100 -100 200 200" className="mx-auto w-full max-w-[220px]">
        {partes.map((p, i) => (
          <path
            key={p.rotulo}
            d={p.caminho}
            fill={cores[i % cores.length]}
            stroke="var(--fundo-painel)"
            strokeWidth="2"
            opacity={ativo === null || ativo === i ? 1 : 0.35}
            onMouseEnter={() => setAtivo(i)}
            onMouseLeave={() => setAtivo(null)}
          />
        ))}
        {centro && (
          <>
            <text
              textAnchor="middle"
              y={legendaCentro ? 2 : 8}
              fontSize="24"
              fill="var(--tinta-forte)"
            >
              {ativo === null ? centro : `${Math.round(partes[ativo].pct * 100)}%`}
            </text>
            {legendaCentro && (
              <text
                textAnchor="middle"
                y={20}
                fontSize="9"
                fill="var(--tinta-fraca)"
              >
                {ativo === null ? legendaCentro : partes[ativo].rotulo}
              </text>
            )}
          </>
        )}
      </svg>

      <ul className="mt-5 flex flex-col gap-2">
        {partes.map((p, i) => (
          <li
            key={p.rotulo}
            className="flex items-center gap-2.5 text-sm"
            onMouseEnter={() => setAtivo(i)}
            onMouseLeave={() => setAtivo(null)}
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: cores[i % cores.length] }}
            />
            <span className="truncate text-[var(--tinta)]">{p.rotulo}</span>
            <span className="ml-auto shrink-0 font-mono tabular-nums text-[var(--tinta)]">
              {fmt(p.valor)}
              <span className="ml-1.5 text-xs text-[var(--tinta-fraca)]">
                {Math.round(p.pct * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Pizza({ dados, cores }: { dados: Fatia[]; cores: string[] }) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const partes = fatias(dados, 72, 0);
  const total = dados.reduce((s, d) => s + d.valor, 0);

  if (!total) {
    return <p className="py-8 text-sm text-[var(--tinta-fraca)]">Sem dados.</p>;
  }

  return (
    <svg viewBox="-150 -105 300 210" className="w-full">
      {partes.map((p, i) => (
        <path
          key={p.rotulo}
          d={p.caminho}
          fill={cores[i % cores.length]}
          stroke="var(--fundo-painel)"
          strokeWidth="2"
          opacity={ativo === null || ativo === i ? 1 : 0.35}
          onMouseEnter={() => setAtivo(i)}
          onMouseLeave={() => setAtivo(null)}
        />
      ))}
      {/* rotulo direto so nas fatias que cabem - abaixo de 7% os textos colidem */}
      {partes.map((p) =>
        p.pct >= 0.07 ? (
          <text
            key={`r-${p.rotulo}`}
            x={p.rotuloX}
            y={p.rotuloY}
            textAnchor={p.ancora}
            dominantBaseline="middle"
            fontSize="11"
            fill="var(--tinta)"
          >
            {p.rotulo}
          </text>
        ) : null,
      )}
    </svg>
  );
}

// =====================================================================
// Barras finas - distribuicao por hora ou dia
// =====================================================================

export function BarrasFinas({
  dados,
  sufixo = "",
}: {
  dados: Fatia[];
  sufixo?: string;
}) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const maximo = Math.max(1, ...dados.map((d) => d.valor));

  return (
    <div className="flex items-end gap-[3px]" style={{ height: 120 }}>
      {dados.map((d, i) => (
        <div
          key={d.rotulo}
          className="relative flex h-full flex-1 flex-col justify-end"
          onMouseEnter={() => setAtivo(i)}
          onMouseLeave={() => setAtivo(null)}
        >
          {ativo === i && (
            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 flex -translate-x-1/2 flex-col gap-0.5 whitespace-nowrap rounded-xl border border-[var(--linha)] bg-[var(--fundo-painel)] px-3 py-2 text-xs shadow-lg">
              <strong>
                {d.rotulo}
                {sufixo}
              </strong>
              <span className="text-[var(--tinta-fraca)]">
                {fmt(d.valor)} consultas
              </span>
            </div>
          )}
          <div
            className="w-full rounded-t-[3px] transition-opacity"
            style={{
              height: `${Math.max(2, (d.valor / maximo) * 100)}%`,
              background: "var(--serie-1)",
              opacity: ativo === null || ativo === i ? 1 : 0.4,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function EixoHoras({ dados }: { dados: Fatia[] }) {
  return (
    <div className="mt-2 flex gap-[3px]">
      {dados.map((d, i) => (
        <span
          key={d.rotulo}
          className="flex-1 text-center text-[10px] tabular-nums text-[var(--tinta-fraca)]"
        >
          {i % 3 === 0 ? d.rotulo : ""}
        </span>
      ))}
    </div>
  );
}

// =====================================================================
// Lista de barras horizontais - rankings com rotulo comprido
// =====================================================================

export function ListaDeBarras({
  dados,
  cor = "var(--serie-1)",
  vazio = "Sem dados no período.",
}: {
  dados: Fatia[];
  cor?: string;
  vazio?: string;
}) {
  if (dados.length === 0) {
    return <p className="py-6 text-sm text-[var(--tinta-fraca)]">{vazio}</p>;
  }

  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  const total = dados.reduce((s, d) => s + d.valor, 0);

  return (
    <ul className="flex flex-col gap-3">
      {dados.map((d) => (
        <li key={d.rotulo}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-[var(--tinta)]">{d.rotulo}</span>
            <span className="shrink-0 font-mono text-sm tabular-nums text-[var(--tinta)]">
              {fmt(d.valor)}
              <span className="ml-1.5 text-xs text-[var(--tinta-fraca)]">
                {Math.round((d.valor / total) * 100)}%
              </span>
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(69,61,63,0.1)]">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${(d.valor / maximo) * 100}%`, background: cor }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
