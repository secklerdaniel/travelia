"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import AudioPlayer from "./AudioPlayer";
import SkyScene from "./SkyScene";
import SunArc from "./SunArc";
import { MOSTRAR_BOTAO_DELETAR } from "@/config/limites";
import { dataHoraLocal, grau } from "@/lib/format";
import { getWeatherBackground } from "@/lib/weather/getWeatherBackground";
import { gradienteCeu, temaDoClima } from "@/lib/weather-theme";
import type { Clima } from "@/lib/types";
import type { Previsao } from "@/lib/previsao";

/** Medicao de agora, buscada ao abrir o card - ver a rota /api/clima/previsao. */
type Agora = {
  temp: number | null;
  sensacao: number | null;
  umidade: number | null;
  condicaoId: number | null;
  icone: string | null;
  descricao: string | null;
  medidoEm: number | null;
};

type Props = {
  clima: Clima;
  onAtualizar: () => void;
  onDeletar: () => void;
  ocupado: boolean;
};

/**
 * Camada CSS de precipitacao por tema.
 *
 * Chuva e garoa ficaram sem efeito de proposito: os riscos diagonais caindo
 * atras do texto cansam a vista - o fundo do card ja e foto de chuva, o clima
 * fica claro sem a animacao por cima.
 */
const PRECIPITACAO: Record<string, string> = {
  chuva: "",
  garoa: "",
  neve: "efeito-neve",
  nenhuma: "",
};

/**
 * Hora no relogio da cidade consultada, nunca no de quem esta olhando.
 *
 * Sem zero a esquerda: "2h" le mais rapido que "02h" numa faixa que a pessoa
 * percorre de relance. O alinhamento nao sofre porque cada coluna tem largura
 * fixa e o conteudo e centralizado.
 */
function horaLocal(epoch: number, offset: number) {
  const d = new Date((epoch + offset) * 1000);
  return `${d.getUTCHours()}h`;
}

/**
 * Faixa das proximas horas.
 *
 * Passo de 3 horas, que e o que o plano gratuito da OpenWeather entrega - o
 * rotulo diz isso para ninguem ler os buracos como falha. Rola na horizontal
 * com encaixe, entao no celular a coluna sempre para inteira na borda.
 */
function FaixaHoras({ previsao }: { previsao: Previsao }) {
  if (!previsao.pontos.length) return null;

  return (
    <section className="vidro vidro-tema rounded-2xl px-3 pb-3 pt-2.5 sm:px-4">
      <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-white/40">
        Próximas horas
        <span className="mx-1.5 text-white/20">·</span>
        de 3 em 3
      </p>

      <div className="faixa-horas flex gap-1 overflow-x-auto">
        {previsao.pontos.map((p) => {
          const tema = temaDoClima(p.condicaoId, p.icone);
          return (
            <div
              key={p.epoch}
              className="flex w-[52px] shrink-0 snap-start flex-col items-center gap-1.5 rounded-xl py-1"
            >
              <span className="font-mono text-[10px] leading-none tabular-nums text-white/45">
                {horaLocal(p.epoch, previsao.offset)}
              </span>
              <span aria-hidden="true" className="text-[15px] leading-none">
                {tema.emoji}
              </span>
              <span className="font-mono text-[15px] font-medium leading-none tabular-nums">
                {Math.round(p.temp)}°
              </span>
              {/* Chuva so aparece quando ha o que avisar: 20% de chance em
                  todas as colunas viraria ruido e ninguem leria mais. */}
              <span className="text-[9px] leading-none text-white/40">
                {p.chuva >= 0.2 ? `${Math.round(p.chuva * 100)}%` : " "}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* Centralização do rótulo e valor */
function Medida({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <p className="text-[10px] uppercase leading-none tracking-[0.12em] text-white/40">
        {rotulo}
      </p>
      <p className="mt-2 font-mono text-[20px] font-medium leading-none tabular-nums sm:text-[22px]">
        {valor}
      </p>
    </div>
  );
}

export default function WeatherCard({
  clima,
  onAtualizar,
  onDeletar,
  ocupado,
}: Props) {
  const tz = clima.timezone_offset;
  const [copiado, setCopiado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [textoAberto, setTextoAberto] = useState(false);

  const [previsao, setPrevisao] = useState<Previsao | null>(null);
  const [agora, setAgora] = useState<Agora | null>(null);
  const [fotoQuebrada, setFotoQuebrada] = useState(false);

  // Buscada no cliente, nao junto da previsao gravada: e de graca e envelhece
  // rapido. Falha em silencio - sem ela o card continua inteiro.
  useEffect(() => {
    if (clima.lat == null || clima.lon == null) return;
    let vivo = true;

    const url =
      `/api/clima/previsao?lat=${clima.lat}&lon=${clima.lon}` +
      (clima.temp != null ? `&temp=${clima.temp}` : "");

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!vivo) return;
        if (j?.previsao) setPrevisao(j.previsao as Previsao);
        if (j?.agora) setAgora(j.agora as Agora);
      })
      .catch(() => {});

    return () => {
      vivo = false;
    };
  }, [clima.lat, clima.lon, clima.temp]);

  // Enquanto a previsao nao chega, valem os campos da medicao atual. Eles nao
  // sao a maxima e a minima do DIA - sao a variacao observada dentro da area
  // da cidade naquele instante -, entao a previsao os substitui assim que
  // responde.
  /**
   * Numeros da tela: a medicao de agora vence a salva no banco.
   *
   * A linha do banco e do momento em que ALGUEM consultou - pode ser de dias
   * atras. Quem chega no site espera o clima de agora sem clicar em nada, e
   * essa busca e de graca (so OpenWeather), diferente da analise e do audio,
   * que sao pagos e continuam presos a trava de 2 horas.
   */
  const temp = agora?.temp ?? clima.temp;
  const sensacao = agora?.sensacao ?? clima.sensacao_termica;
  const umidade = agora?.umidade ?? clima.umidade;
  const descricao = agora?.descricao ?? clima.condicao_descricao;
  const medidoEm = agora?.medidoEm ?? clima.medido_em;

  // O tema tambem acompanha: com a condicao salva, um card consultado ao meio
  // dia continuaria com foto de sol as 22h.
  const tema = temaDoClima(
    agora?.condicaoId ?? clima.condicao_id,
    agora?.icone ?? clima.condicao_icone,
  );

  const maxima = previsao?.hoje?.max ?? clima.temp_max;
  const minima = previsao?.hoje?.min ?? clima.temp_min;
  const registrada = getWeatherBackground(clima.condicao_id, clima.condicao_icone);
  const foto = fotoQuebrada ? null : registrada;

  async function compartilhar() {
    if (gerando) return;
    setGerando(true);
    try {
      const resposta = await fetch(
        `/api/clima/story?id=${encodeURIComponent(clima.id)}`,
      );
      if (!resposta.ok) throw new Error(await resposta.text());

      const blob = await resposta.blob();
      const nomeArquivo = `clima-${clima.nome
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}.png`;
      const arquivo = new File([blob], nomeArquivo, { type: "image/png" });

      if (navigator.canShare?.({ files: [arquivo] })) {
        try {
          await navigator.share({
            files: [arquivo],
            title: `Clima em ${clima.nome}`,
          });
          return;
        } catch {
          // Fallback
        }
      }

      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = nomeArquivo;
      link.click();
      URL.revokeObjectURL(href);

      setCopiado(true);
      setTimeout(() => setCopiado(false), 2400);
    } catch {
      setCopiado(false);
    } finally {
      setGerando(false);
    }
  }

  return (
    <article
      className="cartao relative isolate overflow-hidden rounded-[28px] text-white"
      style={
        {
          background: gradienteCeu(tema),
          // disponibiliza a cor do clima para o CSS das superficies e icones
          "--destaque": tema.destaque,
        } as React.CSSProperties
      }
    >
      {foto ? (
        <>
          <Image
            src={foto}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover object-center"
            onError={() => setFotoQuebrada(true)}
          />
          <div
            className="absolute inset-0 mix-blend-soft-light"
            style={{ background: gradienteCeu(tema), opacity: 0.45 }}
            aria-hidden="true"
          />
        </>
      ) : (
        <SkyScene tema={tema} id={clima.id.slice(0, 8)} />
      )}

      {PRECIPITACAO[tema.cena.precipitacao] && (
        <div
          className={`efeito ${PRECIPITACAO[tema.cena.precipitacao]}`}
          aria-hidden="true"
        />
      )}
      {tema.cena.raio && <div className="efeito efeito-relampago" aria-hidden="true" />}
      <div className={foto ? "veu veu-foto" : "veu"} aria-hidden="true" />
      <div className="grao" aria-hidden="true" />
      <div className="brilho" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-5 p-6 sm:gap-6 sm:p-8">
        {/* No celular a chamada ocupa a linha inteira, abaixo do nome.
            Dividindo a mesma linha, ela roubava a largura do titulo e "Belo
            Horizonte" virava "Belo Hori…" - e o nome da cidade e o primeiro
            dado do card. */}
        <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="font-display truncate text-[28px] font-medium leading-tight tracking-tight sm:text-[36px]">
              {clima.nome}
            </h2>
            <p className="mt-0.5 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.14em] text-white/50 sm:text-[12px]">
              {clima.pais ?? "—"}
              <span className="mx-1.5 text-white/25">·</span>
              {dataHoraLocal(medidoEm, tz)}
            </p>
          </div>

          <Link
            href={`/o-que-fazer?cidade=${encodeURIComponent(clima.city_query)}`}
            aria-label="O que fazer aqui"
            className="btn-seta btn-seta-limao group w-full shrink-0 justify-center rounded-full border py-2.5 pl-4 pr-2 text-sm font-semibold sm:mt-0.5 sm:w-auto sm:py-2"
          >
            {/* O rotulo aparece tambem no celular: este botao e o destino do
                app, e um icone sozinho nao diz para onde leva. */}
            <span>O que fazer aqui</span>
            <span className="btn-seta-ico">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </header>

        {/* Faixa principal. O respiro vertical entre as medidas e proposital:
            elas eram o ponto mais comprimido do card. */}
        <div className="grid min-h-[168px] grid-cols-12 items-center gap-1 py-1 sm:min-h-[184px]">
          <div className="col-span-6 flex flex-col items-center justify-center text-center">
            <div className="font-display flex items-start justify-center text-[72px] font-extralight leading-none tracking-tighter sm:text-[84px]">
              <span>{Math.round(temp ?? 0)}</span>
              <span className="text-[28px] font-thin sm:text-[32px]">°</span>
            </div>
            <p className="mt-2.5 text-[13px] font-medium capitalize leading-tight text-white/90 sm:text-[15px]">
              {descricao ?? "—"}
            </p>
          </div>

          <div className="col-span-3 flex h-full flex-col items-center justify-evenly border-l border-white/12 px-1 text-center">
            <Medida rotulo="Máx" valor={grau(maxima)} />
            <Medida rotulo="Mín" valor={grau(minima)} />
          </div>

          <div className="col-span-3 flex h-full flex-col items-center justify-evenly border-l border-white/12 px-1 text-center">
            <Medida rotulo="Sensação" valor={grau(sensacao)} />
            <Medida
              rotulo="Umidade"
              valor={umidade == null ? "--" : `${umidade}%`}
            />
          </div>
        </div>

        <div className="vidro vidro-tema rounded-2xl px-4 pb-2 pt-3 sm:px-5">
          <SunArc
            nascer={clima.nascer_do_sol}
            por={clima.por_do_sol}
            agora={clima.medido_em}
            offset={tz}
            destaque={tema.destaque}
            id={clima.id.slice(0, 8)}
          />
        </div>

        {previsao && <FaixaHoras previsao={previsao} />}

        {/* Faixa fina: o botao de play ja diz o que e, entao o rotulo
            "Previsão narrada" saiu - era uma linha inteira gasta para nomear
            algo obvio. */}
        {(clima.analise_texto || clima.audio_url) && (
          <section className="vidro vidro-tema rounded-2xl px-3.5 py-3 sm:px-4">
            {clima.audio_url ? (
              <AudioPlayer src={clima.audio_url} destaque={tema.destaque} />
            ) : (
              <p className="text-xs text-white/45">
                Áudio indisponível para esta consulta.
              </p>
            )}

            {clima.analise_texto && (
              <div className={`acc mt-3 border-t border-white/12 pt-3 ${textoAberto ? "open" : ""}`}>
                <button
                  type="button"
                  onClick={() => setTextoAberto((v) => !v)}
                  aria-expanded={textoAberto}
                  className="flex w-full cursor-pointer items-center justify-between text-left text-xs font-medium text-white/60 transition hover:text-white/90"
                >
                  {textoAberto ? "Ocultar o texto" : "Ler o texto"}
                  <span aria-hidden="true" className="text-sm leading-none">
                    {textoAberto ? "−" : "+"}
                  </span>
                </button>

                {/* O div interno precisa existir: o padding tem que ficar
                    DENTRO do que e recortado, senao ele sobra como um vao
                    visivel mesmo com o acordeao fechado. */}
                <div className="acc-corpo">
                  <div>
                    <p className="pt-3 text-[14px] leading-relaxed text-white/80">
                      {clima.analise_texto}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="flex items-center justify-between border-t border-white/12 pt-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void compartilhar()}
              disabled={gerando || ocupado}
              className="btn-acao"
              aria-label="Gerar imagem da previsão para stories"
            >
              {gerando ? (
                <>
                  <span className="girando inline-block">◌</span> Gerando
                </>
              ) : copiado ? (
                "Imagem salva!"
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2.5"
                      y="1.5"
                      width="11"
                      height="13"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <circle cx="8" cy="6" r="1.6" fill="currentColor" />
                    <path
                      d="M3 12l3-3 2.5 2.5L11 9l2 2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Baixar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onAtualizar}
              disabled={ocupado}
              className="btn-acao"
            >
              <span className={ocupado ? "girando inline-block" : "inline-block"}>
                ↻
              </span>{" "}
              {ocupado ? "Atualizando" : "Atualizar"}
            </button>
            {MOSTRAR_BOTAO_DELETAR && (
              <button
                type="button"
                onClick={onDeletar}
                disabled={ocupado}
                className="btn-acao btn-acao-perigo"
                aria-label="Deletar previsão"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2.5 4h11M6 4V2.5h4V4M4 4l.6 9.5h6.8L12 4M6.5 6.8v4M9.5 6.8v4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </footer>
      </div>
    </article>
  );
}