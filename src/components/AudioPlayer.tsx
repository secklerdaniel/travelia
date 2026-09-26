"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  src: string;
  destaque: string;
};

function tempo(segundos: number): string {
  if (!Number.isFinite(segundos)) return "0:00";
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * 48 barras nao cabiam num card de 375px: com a largura minima de cada uma
 * mais os vaos, a waveform passava do container e empurrava o relogio para
 * fora. 32 sobra espaco e o desenho continua legivel.
 */
const BARRAS = 32;

/**
 * Alturas da waveform derivadas da URL do mp3.
 *
 * Ler as amplitudes reais exigiria baixar e decodificar o arquivo inteiro antes
 * de mostrar qualquer coisa. Como o desenho aqui e decorativo, um gerador
 * deterministico a partir da URL da o mesmo efeito: estavel entre renders,
 * diferente para cada audio.
 */
function alturas(src: string): number[] {
  let semente = 0;
  for (let i = 0; i < src.length; i++) {
    semente = (semente * 31 + src.charCodeAt(i)) >>> 0;
  }
  return Array.from({ length: BARRAS }, (_, i) => {
    semente = (semente * 1664525 + 1013904223) >>> 0;
    const ruido = (semente >>> 16) / 65535;
    // envelope: barras do meio mais altas, pontas mais baixas
    const envelope = Math.sin((Math.PI * (i + 0.5)) / BARRAS) ** 0.6;
    return 0.22 + ruido * 0.78 * envelope;
  });
}

export default function AudioPlayer({ src, destaque }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tocando, setTocando] = useState(false);
  const [posicao, setPosicao] = useState(0);
  const [duracao, setDuracao] = useState(0);

  const barras = useMemo(() => alturas(src), [src]);

  // Ao trocar de cidade (ou atualizar a previsao) o mp3 muda: volta pro inicio.
  useEffect(() => {
    setTocando(false);
    setPosicao(0);
    setDuracao(0);
    audioRef.current?.load();
  }, [src]);

  function alternar() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }

  /** Clique na waveform pula para aquele ponto do audio. */
  function buscar(evento: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duracao) return;
    const caixa = evento.currentTarget.getBoundingClientRect();
    const fracao = (evento.clientX - caixa.left) / caixa.width;
    const alvo = Math.min(duracao, Math.max(0, fracao * duracao));
    audio.currentTime = alvo;
    setPosicao(alvo);
  }

  const progresso = duracao > 0 ? posicao / duracao : 0;

  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      <button
        type="button"
        onClick={alternar}
        aria-label={tocando ? "Pausar previsao" : "Ouvir previsao"}
        className="btn-play grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full"
        style={{ background: destaque, color: "#0b1020" }}
      >
        {tocando ? (
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="3.5" height="12" rx="1.2" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1.2" />
          </svg>
        ) : (
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="currentColor"
            style={{ marginLeft: 2 }}
          >
            <path d="M4 2.5v11a.75.75 0 0 0 1.14.64l9-5.5a.75.75 0 0 0 0-1.28l-9-5.5A.75.75 0 0 0 4 2.5Z" />
          </svg>
        )}
      </button>

      <div
        onClick={buscar}
        role="slider"
        tabIndex={0}
        aria-label="Posicao do audio"
        aria-valuemin={0}
        aria-valuemax={Math.round(duracao)}
        aria-valuenow={Math.round(posicao)}
        onKeyDown={(e) => {
          const audio = audioRef.current;
          if (!audio) return;
          if (e.key === "ArrowRight") audio.currentTime += 5;
          if (e.key === "ArrowLeft") audio.currentTime -= 5;
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            alternar();
          }
        }}
        className="flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-[2px] overflow-hidden outline-none"
      >
        {barras.map((altura, i) => {
          const passou = i / BARRAS < progresso;
          return (
            <span
              key={i}
              className="onda flex-1 rounded-full"
              style={{
                height: `${Math.round(altura * 100)}%`,
                background: passou ? destaque : "currentColor",
                opacity: passou ? 1 : 0.28,
                animationDelay: `${(i % 12) * 90}ms`,
                animationPlayState: tocando ? "running" : "paused",
              }}
            />
          );
        })}
      </div>

      <span className="shrink-0 font-mono text-xs tabular-nums opacity-65">
        {tempo(duracao - posicao)}
      </span>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        onEnded={() => {
          setTocando(false);
          setPosicao(0);
        }}
        onTimeUpdate={(e) => setPosicao(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuracao(e.currentTarget.duration)}
      />
    </div>
  );
}
