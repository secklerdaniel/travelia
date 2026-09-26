"use client";

/**
 * Gráficos Chartist do Observatório, alimentados pelos agregados de
 * carregarDashboard() (dados reais).
 */

import { useEffect, useRef } from "react";

export type SerieBarra = { rotulo: string; valor: number };
export type SerieMes = { mes: string; roteiro: number; clima?: number };
export type SerieHora = { rotulo: string; valor: number };

type Props = {
  porMes: SerieMes[];
  porHora: SerieHora[];
  experiencias: SerieBarra[];
  companhias: SerieBarra[];
  origens: SerieBarra[];
  /** Verba média por experiência, se disponível; senão vazio */
  verbaPorExp?: SerieBarra[];
};

const CHARTIST_CSS = `
  .ct-label { fill:#86797d; color:#86797d; font-family:'IBM Plex Mono',monospace; font-size:10px; line-height:1.1; }
  .ct-grid { stroke:#e2ddd6; stroke-dasharray:none; }
  .ct-line { stroke-width:2.5px; }
  .ct-point { stroke-width:9px; stroke-linecap:round; }
  #ch-volume .ct-series-a .ct-line, #ch-volume .ct-series-a .ct-point { stroke:#d70206; }
  #ch-volume .ct-series-b .ct-line, #ch-volume .ct-series-b .ct-point { stroke:#0544d3; }
  #ch-horas .ct-bar { stroke:#453d3f; stroke-width:24px; }
  #ch-origem .ct-bar { stroke:#59922b; stroke-width:20px; }
  #ch-exp .ct-bar { stroke:#d70206; stroke-width:19px; }
  #ch-verba .ct-bar { stroke:#d17905; stroke-width:19px; }
  #ch-comp .ct-bar { stroke:#6b0392; stroke-width:19px; }
`;

function ensureAssets() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("chartist-cdn-css")) {
    const link = document.createElement("link");
    link.id = "chartist-cdn-css";
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/chartist@1.3.1/dist/index.css";
    document.head.appendChild(link);
  }
  if (!document.getElementById("chartist-custom-css")) {
    const style = document.createElement("style");
    style.id = "chartist-custom-css";
    style.textContent = CHARTIST_CSS;
    document.head.appendChild(style);
  }
  if (!document.getElementById("obs-fonts")) {
    const link = document.createElement("link");
    link.id = "obs-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }
}

export default function ObservatorioCharts({
  porMes,
  porHora,
  experiencias,
  companhias,
  origens,
  verbaPorExp = [],
}: Props) {
  const chartsRef = useRef<{ detach?: () => void }[]>([]);

  useEffect(() => {
    let cancelled = false;
    ensureAssets();

    (async () => {
      const ct = await import("chartist");
      if (cancelled) return;
      const { LineChart, BarChart, Interpolation } = ct;

      chartsRef.current.forEach((c) => {
        try {
          c.detach?.();
        } catch {
          /* ignore */
        }
      });
      chartsRef.current = [];

      const mk = (
        id: string,
        Ctor: new (el: Element, data: unknown, opts?: unknown) => {
          detach?: () => void;
          on?: (ev: string, fn: (d: unknown) => void) => void;
        },
        data: unknown,
        opts: unknown,
        tip?: (d: {
          type: string;
          index?: number;
          seriesIndex?: number;
          value: { x?: number; y?: number };
          element: { _node: Element };
        }) => string
      ) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = "";
        const c = new Ctor(el, data, opts || {});
        if (tip && c.on) {
          c.on("draw", (raw) => {
            const d = raw as Parameters<NonNullable<typeof tip>>[0];
            if (d.type === "bar" || d.type === "point" || d.type === "slice") {
              const n = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "title"
              );
              n.textContent = tip(d);
              d.element._node.appendChild(n);
            }
          });
        }
        chartsRef.current.push(c);
      };

      const eixoBase = {
        chartPadding: { top: 18, right: 22, bottom: 6, left: 0 },
        axisY: { onlyInteger: true, offset: 34 },
      };

      // Volume por mês (roteiros; clima se existir na série)
      const labelsMes = porMes.map((m) => m.mes);
      const serieRot = porMes.map((m) => m.roteiro);
      const serieClima = porMes.map((m) => m.clima ?? 0);
      const temClima = serieClima.some((v) => v > 0);
      const seriesVol = temClima ? [serieRot, serieClima] : [serieRot];
      mk(
        "ch-volume",
        LineChart as never,
        { labels: labelsMes, series: seriesVol },
        {
          ...eixoBase,
          fullWidth: true,
          low: 0,
          lineSmooth: Interpolation?.cardinal?.({ tension: 0.6 }),
          showArea: false,
        },
        (d) => {
          const nome =
            temClima && d.seriesIndex === 1 ? "Clima" : "Roteiro";
          return nome + ": " + d.value.y + " consultas";
        }
      );

      // Horas
      if (porHora.length) {
        mk(
          "ch-horas",
          BarChart as never,
          {
            labels: porHora.map((h) => h.rotulo),
            series: [porHora.map((h) => h.valor)],
          },
          { ...eixoBase, axisX: { showGrid: false } },
          (d) =>
            porHora[d.index ?? 0]?.rotulo +
            " — " +
            d.value.y +
            " consultas"
        );
      }

      // Barras horizontais: invertimos o array nós mesmos (maior em cima) e
      // NÃO usamos reverseData — com reverseData o d.index do tooltip fica
      // desalinhado da barra desenhada (tooltip de cima mostra o de baixo).
      const idxBar = (arrLen: number, i: number | undefined) =>
        Math.max(0, Math.min(arrLen - 1, i ?? 0));

      // Origem (já vem ordenada desc no backend; invertemos p/ topo = maior)
      const orig = [...origens.slice(0, 10)].reverse();
      if (orig.length) {
        mk(
          "ch-origem",
          BarChart as never,
          {
            labels: orig.map((o) => o.rotulo),
            series: [orig.map((o) => o.valor)],
          },
          {
            horizontalBars: true,
            chartPadding: { top: 8, right: 26, bottom: 6, left: 0 },
            axisX: { onlyInteger: true },
            axisY: { offset: 108, showGrid: false },
          },
          (d) => {
            const i = idxBar(orig.length, d.index);
            return orig[i]?.rotulo + ": " + d.value.x + " consultas";
          }
        );
      }

      // Experiências
      const exp = [...experiencias.slice(0, 10)]
        .map((e) => ({
          rotulo: e.rotulo.replace(/^Turismo\s+/i, ""),
          valor: e.valor,
        }))
        .reverse();
      if (exp.length) {
        mk(
          "ch-exp",
          BarChart as never,
          {
            labels: exp.map((e) => e.rotulo),
            series: [exp.map((e) => e.valor)],
          },
          {
            horizontalBars: true,
            chartPadding: { top: 8, right: 26, bottom: 6, left: 0 },
            axisX: { onlyInteger: true },
            axisY: { offset: 116, showGrid: false },
          },
          (d) => {
            const i = idxBar(exp.length, d.index);
            return exp[i]?.rotulo + ": " + d.value.x + " pedidos";
          }
        );
      }

      // Verba / pilares
      const verbas = [...verbaPorExp.slice(0, 10)].reverse();
      if (verbas.length) {
        mk(
          "ch-verba",
          BarChart as never,
          {
            labels: verbas.map((v) => v.rotulo.replace(/^Turismo\s+/i, "")),
            series: [verbas.map((v) => v.valor)],
          },
          {
            horizontalBars: true,
            chartPadding: { top: 8, right: 46, bottom: 6, left: 0 },
            axisX: {
              labelInterpolationFnc: (v: number) =>
                v >= 1000 ? v / 1000 + "k" : v,
            },
            axisY: { offset: 116, showGrid: false },
          },
          (d) => {
            const i = idxBar(verbas.length, d.index);
            const v = verbas[i]?.valor ?? 0;
            return (
              verbas[i]?.rotulo +
              ": R$ " +
              Math.round(v).toLocaleString("pt-BR")
            );
          }
        );
      }

      // Companhia
      const comp = [...companhias.slice(0, 10)]
        .map((c) => ({
          rotulo: c.rotulo.replace(/^Família com filhos\s+/i, "Filhos "),
          valor: c.valor,
        }))
        .reverse();
      if (comp.length) {
        mk(
          "ch-comp",
          BarChart as never,
          {
            labels: comp.map((c) => c.rotulo),
            series: [comp.map((c) => c.valor)],
          },
          {
            horizontalBars: true,
            chartPadding: { top: 8, right: 26, bottom: 6, left: 0 },
            axisX: { onlyInteger: true },
            axisY: { offset: 116, showGrid: false },
          },
          (d) => {
            const i = idxBar(comp.length, d.index);
            return comp[i]?.rotulo + ": " + d.value.x + " pedidos";
          }
        );
      }
    })();

    return () => {
      cancelled = true;
      chartsRef.current.forEach((c) => {
        try {
          c.detach?.();
        } catch {
          /* ignore */
        }
      });
    };
  }, [porMes, porHora, experiencias, companhias, origens, verbaPorExp]);

  return null; // só desenha nos divs #ch-* do layout pai
}