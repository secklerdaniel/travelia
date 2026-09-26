import type { TemaClima } from "@/lib/weather-theme";

/**
 * Cena ilustrada do topo do card: astro + nuvens + estrelas, em SVG.
 *
 * A precipitacao (chuva/neve/raio) fica por conta das camadas CSS em
 * globals.css - sao muitos elementos repetidos e sai mais barato animar com
 * background do que com centenas de nos SVG.
 *
 * O `id` entra nos ids internos do SVG porque dois cards na mesma pagina
 * compartilhariam os mesmos gradientes/filtros se os ids colidissem.
 */
export default function SkyScene({ tema, id }: { tema: TemaClima; id: string }) {
  const { cena } = tema;
  const u = (nome: string) => `${nome}-${id}`;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={u("brilho")}>
          <stop offset="0%" stopColor={cena.astroCor[0]} stopOpacity="0.95" />
          <stop offset="35%" stopColor={cena.astroCor[1]} stopOpacity="0.45" />
          <stop offset="100%" stopColor={cena.astroCor[1]} stopOpacity="0" />
        </radialGradient>

        <radialGradient id={u("nucleo")}>
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor={cena.astroCor[0]} />
          <stop offset="100%" stopColor={cena.astroCor[1]} />
        </radialGradient>

        {/* recorte da lua: um circulo deslocado come a borda e cria a fase */}
        <mask id={u("fase")}>
          <rect width="400" height="260" fill="#000" />
          <circle cx="312" cy="66" r="30" fill="#fff" />
          <circle cx="296" cy="54" r="26" fill="#000" />
        </mask>

        <filter id={u("suave")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* ---------- estrelas ---------- */}
      {cena.estrelas && (
        <g fill="#ffffff">
          {[
            [38, 42, 1.5, 0],
            [92, 26, 1.1, 0.8],
            [148, 58, 1.7, 1.6],
            [206, 30, 1.2, 0.4],
            [252, 72, 1.4, 2.2],
            [64, 92, 1.1, 1.2],
            [178, 100, 1.3, 2.8],
            [350, 118, 1.5, 0.6],
            [22, 128, 1.2, 1.9],
            [122, 132, 1, 2.5],
          ].map(([cx, cy, r, atraso], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              className="cintilar"
              style={{ animationDelay: `${atraso}s` }}
            />
          ))}
        </g>
      )}

      {/* ---------- astro ---------- */}
      {cena.astro && (
        <g className="astro">
          <circle cx="312" cy="66" r="96" fill={`url(#${u("brilho")})`} />
          {cena.astro === "sol" ? (
            <circle cx="312" cy="66" r="34" fill={`url(#${u("nucleo")})`} />
          ) : (
            <g mask={`url(#${u("fase")})`}>
              <circle cx="312" cy="66" r="30" fill={`url(#${u("nucleo")})`} />
              <g fill={cena.astroCor[1]} opacity="0.35">
                <circle cx="320" cy="58" r="5" />
                <circle cx="308" cy="76" r="3.5" />
                <circle cx="326" cy="76" r="2.5" />
              </g>
            </g>
          )}
        </g>
      )}

      {/* ---------- nuvens ---------- */}
      {cena.nuvens >= 1 && (
        <g
          fill={cena.nuvemCor}
          opacity="0.2"
          filter={`url(#${u("suave")})`}
          className="deriva-lenta"
        >
          <Nuvem x={40} y={150} escala={1.5} />
          <Nuvem x={300} y={175} escala={1.2} />
        </g>
      )}
      {cena.nuvens >= 2 && (
        <g fill={cena.nuvemCor} opacity="0.42" className="deriva-media">
          <Nuvem x={250} y={92} escala={1.15} />
          <Nuvem x={95} y={118} escala={0.85} />
        </g>
      )}
      {cena.nuvens >= 3 && (
        <g fill={cena.nuvemCor} opacity="0.72" className="deriva-rapida">
          <Nuvem x={168} y={64} escala={1.35} />
          <Nuvem x={352} y={112} escala={0.95} />
        </g>
      )}
    </svg>
  );
}

/** Nuvem montada com circulos sobrepostos - mais organica que um path fechado. */
function Nuvem({ x, y, escala }: { x: number; y: number; escala: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <ellipse cx="0" cy="8" rx="46" ry="13" />
      <circle cx="-20" cy="2" r="15" />
      <circle cx="0" cy="-6" r="21" />
      <circle cx="22" cy="1" r="16" />
    </g>
  );
}
