import { dataHoraLocal } from "@/lib/format";

type Props = {
  /** ISO do nascer do sol. */
  nascer: string | null;
  /** ISO do por do sol. */
  por: string | null;
  /** ISO do momento da medicao - e onde o marcador fica. */
  agora: string | null;
  offset: number | null;
  destaque: string;
  id: string;
};

const L = 100; // pathLength normalizado, para o dasharray virar porcentagem

/**
 * Arco do dia: onde o sol esta entre o nascer e o por.
 *
 * O marcador usa o horario da MEDICAO (campo `dt` da OpenWeather), nao o
 * relogio de quem esta olhando - assim o desenho bate com a temperatura
 * mostrada no card.
 */
export default function SunArc({
  nascer,
  por,
  agora,
  offset,
  destaque,
  id,
}: Props) {
  const t0 = nascer ? new Date(nascer).getTime() : null;
  const t1 = por ? new Date(por).getTime() : null;
  const t = agora ? new Date(agora).getTime() : null;

  // fracao do dia ja percorrida, presa entre 0 e 1
  let progresso = 0.5;
  let ehDia = true;
  if (t0 !== null && t1 !== null && t !== null && t1 > t0) {
    const bruto = (t - t0) / (t1 - t0);
    ehDia = bruto >= 0 && bruto <= 1;
    progresso = Math.min(1, Math.max(0, bruto));
  }

  // ponto sobre a semicircunferencia: t=0 na esquerda, t=1 na direita
  const cx = 110;
  const r = 100;
  const base = 104;
  const angulo = Math.PI * progresso;
  const px = cx - r * Math.cos(angulo);
  const py = base - r * Math.sin(angulo);

  const arco = `M ${cx - r} ${base} A ${r} ${r} 0 0 1 ${cx + r} ${base}`;

  return (
    <div className="flex items-end gap-3 sm:gap-4">
      <div className="shrink-0 text-left">
        <p className="text-[9px] uppercase leading-none tracking-[0.12em] opacity-60 sm:text-[10px]">
          Nascer
        </p>
        <p className="mt-1 font-mono text-[13px] font-medium tabular-nums sm:text-sm">
          {dataHoraLocal(nascer, offset).slice(6)}
        </p>
      </div>

      <svg
        viewBox="0 0 220 118"
        className="h-[54px] min-w-0 flex-1 sm:h-[62px]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`arco-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={destaque} stopOpacity="0.25" />
            <stop offset="50%" stopColor={destaque} stopOpacity="1" />
            <stop offset="100%" stopColor={destaque} stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* trilho completo */}
        <path
          d={arco}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="2"
          strokeDasharray="1 5"
          strokeLinecap="round"
        />

        {/* trecho ja percorrido */}
        <path
          d={arco}
          fill="none"
          stroke={`url(#arco-${id})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={L}
          strokeDasharray={`${progresso * L} ${L}`}
        />

        {/* linha do horizonte */}
        <line
          x1="4"
          y1={base}
          x2="216"
          y2={base}
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1"
        />

        {/* marcador */}
        <circle cx={px} cy={py} r="11" fill={destaque} opacity="0.22" />
        <circle
          cx={px}
          cy={py}
          r="5"
          fill={ehDia ? destaque : "currentColor"}
          fillOpacity={ehDia ? 1 : 0.45}
        />
      </svg>

      <div className="shrink-0 text-right">
        <p className="text-[9px] uppercase leading-none tracking-[0.12em] opacity-60 sm:text-[10px]">
          Pôr do sol
        </p>
        <p className="mt-1 font-mono text-[13px] font-medium tabular-nums sm:text-sm">
          {dataHoraLocal(por, offset).slice(6)}
        </p>
      </div>
    </div>
  );
}
