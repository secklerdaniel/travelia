"use client";

import { useState } from "react";

import CityAutocomplete from "@/components/CityAutocomplete";
import { CIDADE_FIXA } from "@/config/limites";
import { pedirOrigem } from "@/lib/origem";

/**
 * Foto da capa.
 *
 * O painel da direita e uma fotografia noturna coberta por veus escuros - o
 * mapa pontilhado e o cartao de vidro sao desenhados por cima. Para trocar a
 * imagem basta salvar o arquivo em `public/` e apontar aqui: o resto da capa
 * nao depende do arquivo.
 */
const FOTO_CAPA = "/fundos/noite-chuva-nublado.jpg";

type Props = {
  valor: string;
  onChange: (v: string) => void;
  /** Dispara a consulta - mesma funcao usada pelos cards. */
  onBuscar: (cidade: string) => void;
  buscando: boolean;
  /**
   * Andamento da consulta, ao lado do botao.
   *
   * Quem clica em "Ver previsao" espera resposta ali, nao no fim da pagina: a
   * consulta leva dezenas de segundos (clima + texto + audio) e sem retorno no
   * proprio botao a impressao e de que o clique nao pegou.
   */
  mensagem?: string | null;
};

export default function Hero({
  valor,
  onChange,
  onBuscar,
  buscando,
  mensagem,
}: Props) {
  const [localizando, setLocalizando] = useState(false);

  /**
   * Pede a posicao ao navegador e ja consulta a cidade encontrada.
   *
   * Recusa e falha caem no mesmo lugar: a capa segue utilizavel pelo campo de
   * busca, entao nao ha erro para mostrar.
   */
  async function usarLocalizacao() {
    if (localizando || buscando) return;
    setLocalizando(true);
    try {
      const origem = await pedirOrigem();
      if (origem) {
        const alvo = origem.uf ? `${origem.cidade},${origem.uf}` : origem.cidade;
        onChange(alvo);
        onBuscar(alvo);
      }
    } finally {
      setLocalizando(false);
    }
  }

  return (
    <section className="relative isolate overflow-hidden">
      {/* Coluna de texto. O `lg:pr-[48%]` reserva a faixa da direita para a
          foto, que no desktop e absoluta e sangra ate a borda da tela. */}
      <div className="mx-auto max-w-[1560px] px-6 pt-14 pb-10 sm:px-10 lg:pr-[48%] lg:pt-24 lg:pb-24">
        <p className="text-[13px] font-medium tracking-[0.42em] text-[#6f80ab] uppercase sm:text-sm">
          Clima Web
        </p>

        <h1 className="font-display mt-4 text-[clamp(3.4rem,10.5vw,7.4rem)] leading-[0.98] font-light tracking-tight text-[#f3f6fc]">
          Travel<span className="font-serif">I</span>A
        </h1>

        <p className="mt-4 bg-[linear-gradient(95deg,#38bdf8_0%,#4f7bf7_46%,#a855f7_100%)] bg-clip-text pb-[0.12em] text-[clamp(1.65rem,3.3vw,2.85rem)] leading-[1.22] font-semibold tracking-tight text-transparent">
          Decida melhor. Viaje com confiança.
        </p>

        <p className="mt-5 max-w-[30ch] text-[clamp(1rem,1.35vw,1.32rem)] leading-relaxed text-white/45">
          Previsão com sotaque e um pitada de humor. Descubra o clima e o que
          fazer na cidade.
        </p>

        {/* Tres promessas do produto */}
        <ul className="mt-9 flex flex-wrap items-center gap-x-9 gap-y-4">
          <Promessa
            cor="bg-violet-500/18 text-violet-300"
            rotulo="Previsão precisa"
            icone={<IconeChuva className="h-[22px] w-[22px]" />}
          />
          <Promessa
            cor="bg-emerald-500/14 text-emerald-300"
            rotulo="Dicas do que fazer"
            icone={<IconeMapa className="h-[22px] w-[22px]" />}
          />
          <Promessa
            cor="bg-amber-400/16 text-amber-300"
            rotulo="Toque de humor"
            icone={<IconeSorriso className="h-[22px] w-[22px]" />}
          />
        </ul>

        {/* Com uma cidade fixa o app cobre so ela: um campo que nao muda nada
            confunde, entao a busca e os atalhos saem da capa. */}
        {!CIDADE_FIXA && (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (valor.trim()) onBuscar(valor);
              }}
              className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-start"
            >
              {/* O `min-w` segura o campo quando a mensagem de andamento entra
                  na linha: sem ele o input encolhia para um terco da largura e
                  a capa dava um solavanco a cada clique. */}
              <div className="relative flex min-w-0 flex-1 sm:min-w-[300px] sm:max-w-[520px]">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-5 z-10 -translate-y-1/2 text-white/35"
                >
                  <IconePino className="h-[22px] w-[22px]" />
                </span>

                <CityAutocomplete
                  valor={valor}
                  onChange={onChange}
                  onEscolher={(cidade) => onBuscar(`${cidade.nome},${cidade.uf}`)}
                  placeholder="Para onde vamos?"
                  aria-label="Nome da cidade"
                  desabilitado={buscando}
                  className="h-[62px] w-full rounded-2xl border border-white/[0.09] bg-white/[0.03] pr-16 pl-[52px] text-[19px] outline-none transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06] disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => void usarLocalizacao()}
                  disabled={localizando || buscando}
                  title="Usar minha localização"
                  aria-label="Usar minha localização"
                  className="absolute top-1/2 right-2.5 z-10 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-violet-500/20 text-violet-300 transition hover:bg-violet-500/30 disabled:opacity-50"
                >
                  <IconeMira
                    className={`h-[21px] w-[21px] ${localizando ? "girando" : ""}`}
                  />
                </button>
              </div>

              {/* Botao e andamento no mesmo bloco: a mensagem nasce colada no
                  botao, sem empurrar o campo nem mudar a linha de cima. */}
              <div className="flex shrink-0 flex-col gap-2.5 sm:w-[240px]">
                <button
                  type="submit"
                  disabled={buscando || !valor.trim()}
                  className="inline-flex h-[62px] cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(100deg,#3b82f6_0%,#8b5cf6_60%,#a855f7_100%)] px-8 text-[19px] font-semibold text-white shadow-[0_18px_45px_-18px_rgba(129,90,246,0.95)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                >
                  <IconeLupa className="h-[21px] w-[21px]" />
                  {buscando ? "Consultando..." : "Ver previsão"}
                </button>

                {mensagem && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="flex items-start gap-2.5 text-[14px] leading-snug text-white/55"
                  >
                    <IconeGirando className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                    {mensagem}
                  </p>
                )}
              </div>
            </form>

            <button
              type="button"
              onClick={() => void usarLocalizacao()}
              disabled={localizando || buscando}
              className="mt-6 inline-flex cursor-pointer items-center gap-2.5 text-[15px] text-[#4d86f5] transition hover:text-[#7ba7fa] disabled:opacity-50"
            >
              <IconeMira className="h-[18px] w-[18px]" />
              {localizando ? "Localizando..." : "Usar minha localização"}
            </button>
          </>
        )}
      </div>

      <PainelVisual />
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Painel da direita: foto, mapa pontilhado, rota e cartao de vidro
   ------------------------------------------------------------------------- */

/**
 * So existe no desktop, onde a capa e de duas colunas.
 *
 * Empilhada no celular a foto virava uma faixa decorativa entre a busca e os
 * cards de previsao - competindo com a foto real do card logo abaixo, que essa
 * sim mostra a cidade consultada.
 */
function PainelVisual() {
  return (
    <div className="hidden overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[47%] lg:rounded-l-[40px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FOTO_CAPA}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-75"
      />

      {/* Veus: escurecem a foto o bastante para o mapa e o cartao lerem, e
          dissolvem a borda esquerda no fundo da pagina em vez de cortar reto. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#080b12_0%,rgba(8,11,18,0.72)_26%,rgba(8,11,18,0.18)_66%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,11,18,0.88)_0%,rgba(8,11,18,0.25)_38%,rgba(8,11,18,0.35)_100%)]" />

      <MapaRota />
      <CartaoClima />
    </div>
  );
}

/**
 * Mapa-mundi pontilhado com a rota tracejada e o marcador do destino.
 *
 * Os continentes vivem como faixas de colunas acesas por linha (grade de 60x24,
 * uma coluna a cada 6 graus de longitude). E o formato mais curto de guardar um
 * mapa nesta resolucao - qualquer traçado vetorial seria dezenas de vezes maior
 * para o mesmo desenho borrado de proposito.
 */
const CONTINENTES: Array<Array<[number, number]>> = [
  [[10, 20], [27, 31], [38, 56]],
  [[6, 22], [26, 32], [35, 57]],
  [[5, 24], [27, 31], [34, 58]],
  [[5, 25], [28, 30], [33, 58]],
  [[7, 25], [32, 58]],
  [[8, 24], [31, 57]],
  [[9, 23], [31, 56]],
  [[10, 22], [30, 54]],
  [[11, 21], [30, 54]],
  [[12, 18], [29, 48], [50, 53]],
  [[15, 22], [28, 43], [45, 47], [50, 53]],
  [[17, 24], [28, 38], [45, 46], [50, 54]],
  [[20, 26], [28, 36], [51, 55]],
  [[20, 27], [29, 36], [50, 56]],
  [[20, 28], [29, 36], [51, 57]],
  [[20, 27], [29, 35], [52, 56]],
  [[21, 27], [29, 35], [53, 58]],
  [[21, 26], [30, 35], [52, 58]],
  [[22, 26], [30, 34], [52, 58]],
  [[22, 25], [31, 33], [53, 57]],
  [[22, 24], [58, 59]],
  [[22, 24], [58, 59]],
  [[22, 23]],
  [[23, 23]],
];

function MapaRota() {
  return (
    <svg
      viewBox="0 0 600 300"
      aria-hidden="true"
      className="absolute inset-x-0 top-6 w-full [mask-image:linear-gradient(to_bottom,black_0%,black_46%,transparent_86%)]"
    >
      <g fill="#6d8cca" opacity="0.5">
        {CONTINENTES.flatMap((faixas, linha) =>
          faixas.flatMap(([inicio, fim]) =>
            Array.from({ length: fim - inicio + 1 }, (_, i) => {
              const coluna = inicio + i;
              return (
                <circle
                  key={`${linha}-${coluna}`}
                  cx={15 + coluna * 9.7}
                  cy={40 + linha * 9.7}
                  r={1.7}
                />
              );
            }),
          ),
        )}
      </g>

      {/* Rota ate o destino */}
      <path
        d="M96 208 C 214 104, 336 214, 470 74"
        fill="none"
        stroke="#7ba0f0"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="5 9"
        opacity="0.75"
      />

      {/* Marcador: o halo separa o pino da foto sem precisar de sombra */}
      <circle cx="478" cy="52" r="26" fill="#6366f1" opacity="0.16" />
      <path
        d="M478 26c-8.8 0-16 7.2-16 16 0 11.7 14.2 24.6 14.8 25.1a1.8 1.8 0 0 0 2.4 0c.6-.5 14.8-13.4 14.8-25.1 0-8.8-7.2-16-16-16z"
        fill="#5b5bf0"
      />
      <circle cx="478" cy="42" r="5.8" fill="#dfe6ff" />
    </svg>
  );
}

/** Cartao de vidro com a previsao da capa. */
function CartaoClima() {
  return (
    <div className="vidro absolute right-[12%] bottom-[32%] flex items-start gap-4 rounded-[26px] px-7 py-6">
      <IconeChuvaCheia className="mt-1 h-[58px] w-[58px] shrink-0" />

      <div className="text-center">
        <p className="font-display text-[58px] leading-none font-light tracking-tight text-white">
          18°
        </p>
        <p className="mt-2.5 text-[21px] font-medium text-[#5b9bf5]">Chuvoso</p>
        <p className="mt-1 text-[14.5px] text-white/55">Sensação 16°</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Pecas pequenas
   ------------------------------------------------------------------------- */

function Promessa({
  icone,
  rotulo,
  cor,
}: {
  icone: React.ReactNode;
  rotulo: string;
  cor: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ${cor}`}
      >
        {icone}
      </span>
      <span className="text-[16.5px] text-white/85">{rotulo}</span>
    </li>
  );
}

/* Icones em traço, no mesmo peso do resto da interface. */

function IconeChuva({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.5 15.5a4 4 0 0 0 .4-7.98A5.5 5.5 0 0 0 6.3 6.9 4 4 0 0 0 6.5 15.5" />
      <path d="M8 17.5 7 20M12 17.5 11 20M16 17.5 15 20" />
    </svg>
  );
}

function IconeMapa({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 4.5-5.4 2.2A1 1 0 0 0 3 7.6v11.6a1 1 0 0 0 1.4.9L9 18.2l6 2.3 5.4-2.2a1 1 0 0 0 .6-.9V5.8a1 1 0 0 0-1.4-.9L15 6.8z" />
      <path d="M9 4.5v13.7M15 6.8v13.7" />
    </svg>
  );
}

function IconeSorriso({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.2" />
      <path d="M8.4 14.2a4.4 4.4 0 0 0 7.2 0" />
      <path d="M9.2 9.4h.01M14.8 9.4h.01" strokeWidth="2.4" />
    </svg>
  );
}

function IconePino({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21.5s7-6.2 7-11.4a7 7 0 1 0-14 0c0 5.2 7 11.4 7 11.4z" />
      <circle cx="12" cy="10" r="2.7" />
    </svg>
  );
}

function IconeMira({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
      <path d="M12 1.8v3.4M12 18.8v3.4M22.2 12h-3.4M5.2 12H1.8" />
    </svg>
  );
}

function IconeLupa({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="7.2" />
      <path d="m16.2 16.2 4.4 4.4" />
    </svg>
  );
}

/** Anel girando, do lado da mensagem de andamento. */
function IconeGirando({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={`girando ${className}`}
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

/** Versao cheia do icone de chuva, para o cartao de vidro. */
function IconeChuvaCheia({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 26 26" className={className} aria-hidden="true">
      <path
        d="M7.2 17.6a4.9 4.9 0 0 1-.5-9.77 6.6 6.6 0 0 1 12.5-1.35 5.1 5.1 0 0 1-.6 11.12H7.2z"
        fill="#e9eefb"
      />
      <g stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round">
        <path d="M9 19.6 7.6 23.4M13.4 19.6 12 23.4M17.8 19.6 16.4 23.4" />
      </g>
    </svg>
  );
}
