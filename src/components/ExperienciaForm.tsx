"use client";

import { useEffect, useState } from "react";

import { CIDADE_FIXA } from "@/config/limites";
import {
  alternarFavorito,
  ehFavorito,
  lerFavoritos,
  type Favorito,
} from "@/lib/favoritos";
import { lerOrigem } from "@/lib/origem";
import {
  EXPERIENCIA_GASTRONOMICA,
  ICONES,
  PILARES_GASTRONOMICOS,
  TIPOS_COMPANHIA,
  TIPOS_EXPERIENCIA,
  type Recomendacao,
} from "@/config/experiencias";

type Props = {
  /** Cidade que veio do card de clima, se a pessoa chegou por ele. */
  cidadeInicial: string;
  ufInicial: string;
};

/**
 * Etapas do wizard.
 *
 * A do pilar so existe quando a experiencia escolhida e a gastronomica, entao
 * a sequencia e montada a partir do estado em vez de ser fixa - e o total do
 * contador acompanha.
 */
type Etapa = "cidade" | "experiencia" | "pilar" | "companhia" | "verba";

/**
 * Etapas que avancam sozinhas ao clicar.
 * A da companhia ficou de fora: ela tem o contador de pessoas embaixo do grid,
 * e avancar na hora do clique nao deixaria ajustar o numero.
 */
const ETAPAS_AUTO: Etapa[] = ["experiencia", "pilar"];

const PILARES = PILARES_GASTRONOMICOS.map((p) => p.nome);

/** Tempo entre escolher uma opcao e a tela avancar sozinha. */
const ATRASO_AVANCO = 260;

const campo =
  "w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-[15px] outline-none transition placeholder:text-white/25 focus:border-sky-400/50 focus:bg-white/10";

const rotulo = "mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-white/45";

export default function ExperienciaForm({ cidadeInicial, ufInicial }: Props) {
  const [passo, setPasso] = useState(0);
  const [destinoCidade, setDestinoCidade] = useState(cidadeInicial);
  const [destinoUf, setDestinoUf] = useState(ufInicial);
  const [experiencia, setExperiencia] = useState("");
  const [pilar, setPilar] = useState("");
  const [companhia, setCompanhia] = useState("");
  const [pessoas, setPessoas] = useState(2);
  const [verba, setVerba] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Recomendacao[] | null>(null);
  /** true = nomes e contatos vieram do OpenStreetMap, nao da IA. */
  const [verificado, setVerificado] = useState(false);

  const ehGastronomico = experiencia === EXPERIENCIA_GASTRONOMICA;

  // Com cidade fixa a primeira etapa some: perguntar o destino quando existe
  // um so nao e escolha, e uma formalidade.
  const etapas: Etapa[] = [
    ...(CIDADE_FIXA ? [] : (["cidade"] as Etapa[])),
    "experiencia",
    ...(ehGastronomico ? (["pilar"] as Etapa[]) : []),
    "companhia",
    "verba",
  ];
  const TOTAL = etapas.length;
  const etapa = etapas[Math.min(passo, TOTAL - 1)];

  const avancar = () => setPasso((p) => Math.min(p + 1, TOTAL - 1));
  const voltar = () => setPasso((p) => Math.max(p - 1, 0));

  /** Escolha em grid: marca e avanca sozinho, sem exigir um clique extra. */
  const escolher = (set: (v: string) => void) => (valor: string) => {
    set(valor);
    setTimeout(avancar, ATRASO_AVANCO);
  };

  /** Trocar de experiencia invalida o pilar escolhido para a anterior. */
  const escolherExperiencia = (valor: string) => {
    setExperiencia(valor);
    if (valor !== EXPERIENCIA_GASTRONOMICA) setPilar("");
    setTimeout(avancar, ATRASO_AVANCO);
  };

  function reiniciar() {
    setResultado(null);
    setErro(null);
    setPasso(0);
    setExperiencia("");
    setPilar("");
    setCompanhia("");
    setPessoas(2);
    setVerba("");
  }

  async function enviar() {
    if (carregando) return;
    setCarregando(true);
    setErro(null);

    try {
      const r = await fetch("/api/experiencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinoCidade,
          destinoUf,
          experiencia,
          pilar,
          companhia,
          pessoas,
          verba: Number(verba),
          origem: lerOrigem(),
        }),
      });
      const json = await r.json();

      if (!r.ok) {
        setErro(json?.erro ?? "Não consegui gerar as recomendações.");
        return;
      }
      setResultado(json.recomendacoes ?? []);
      setVerificado(!!json.verificado);
    } catch {
      setErro("Não consegui falar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  if (resultado) {
    return (
      <Resultado
        itens={resultado}
        destino={[destinoCidade, destinoUf].filter(Boolean).join(", ")}
        verificado={verificado}
        onReiniciar={reiniciar}
      />
    );
  }

  if (carregando) return <Carregando destino={destinoCidade} />;

  const podeAvancar: boolean = {
    cidade: destinoCidade.trim().length > 0,
    experiencia: experiencia !== "",
    pilar: pilar !== "",
    companhia: companhia !== "",
    verba: Number(verba) > 0,
  }[etapa];

  return (
    <div className="mt-8">
      {/* ---------- cabecalho do wizard ---------- */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={voltar}
          disabled={passo === 0}
          aria-label="Voltar uma etapa"
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-white/12 bg-white/6 transition hover:border-white/30 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-25"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-sky-400 transition-[width] duration-500 ease-out"
            style={{ width: `${((passo + 1) / TOTAL) * 100}%` }}
          />
        </div>

        <span className="shrink-0 font-mono text-xs tabular-nums text-white/40">
          {passo + 1}/{TOTAL}
        </span>
      </div>

      {/* ---------- etapa ---------- */}
      <div key={passo} className="passo mt-8">
        {etapa === "cidade" && (
          <Etapa
            titulo="Qual cidade você quer conhecer?"
            ajuda="É o parâmetro mais importante: tudo será recomendado aqui."
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={rotulo} htmlFor="destino-cidade">
                  Cidade
                </label>
                <input
                  id="destino-cidade"
                  autoFocus
                  value={destinoCidade}
                  onChange={(e) => setDestinoCidade(e.target.value)}
                  placeholder="Ex.: Gramado"
                  className={campo}
                />
              </div>
              <div className="w-24">
                <label className={rotulo} htmlFor="destino-uf">
                  UF
                </label>
                <input
                  id="destino-uf"
                  value={destinoUf}
                  onChange={(e) => setDestinoUf(e.target.value)}
                  placeholder="RS"
                  maxLength={4}
                  className={`${campo} uppercase`}
                />
              </div>
            </div>

          </Etapa>
        )}

        {etapa === "experiencia" && (
          <Etapa titulo="Que tipo de experiência?" ajuda="Escolha uma para continuar.">
            <Grade
              opcoes={TIPOS_EXPERIENCIA}
              valor={experiencia}
              onChange={escolherExperiencia}
            />
          </Etapa>
        )}

        {etapa === "pilar" && (
          <Etapa
            titulo="Que tipo de gastronomia?"
            ajuda="As sugestões serão filtradas dentro do pilar escolhido."
          >
            <div className="flex flex-col gap-2.5">
              {PILARES_GASTRONOMICOS.map((p, i) => {
                const ativo = pilar === p.nome;
                return (
                  <button
                    key={p.nome}
                    type="button"
                    onClick={() => escolher(setPilar)(p.nome)}
                    aria-pressed={ativo}
                    style={{ animationDelay: `${i * 55}ms` }}
                    className={`surgir cartao-opcao flex items-start gap-3.5 rounded-2xl border p-4 text-left transition duration-300 ${
                      ativo
                        ? "border-sky-400/70 bg-sky-400/15"
                        : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xl leading-none" aria-hidden="true">
                      {ICONES[p.nome] ?? "🍽️"}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-sm font-medium ${ativo ? "text-white" : "text-white/85"}`}
                      >
                        {p.nome}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-white/45">
                        {p.descricao}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Etapa>
        )}

        {etapa === "companhia" && (
          <Etapa titulo="Com quem você viaja?" ajuda="Muda tudo na recomendação.">
            <Grade
              opcoes={TIPOS_COMPANHIA}
              valor={companhia}
              onChange={setCompanhia}
            />

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Quantas pessoas?</p>
                <p className="mt-0.5 text-xs text-white/40">
                  Define o preço dos ingressos
                </p>
              </div>

              <div className="flex items-center gap-1">
                <BotaoContador
                  rotulo="Diminuir"
                  simbolo="−"
                  onClick={() => setPessoas((n) => Math.max(1, n - 1))}
                  desabilitado={pessoas <= 1}
                />
                <span className="w-10 text-center font-mono text-2xl font-medium tabular-nums">
                  {pessoas}
                </span>
                <BotaoContador
                  rotulo="Aumentar"
                  simbolo="+"
                  onClick={() => setPessoas((n) => Math.min(60, n + 1))}
                  desabilitado={pessoas >= 60}
                />
              </div>
            </div>
          </Etapa>
        )}

        {etapa === "verba" && (
          <Etapa titulo="Qual é a verba?" ajuda="Valor total da experiência, em reais.">
            <div className="relative">
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-white/35">
                R$
              </span>
              <input
                autoFocus
                type="number"
                min={1}
                step={50}
                value={verba}
                onChange={(e) => setVerba(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && podeAvancar && void enviar()}
                placeholder="1500"
                className="font-display w-full rounded-2xl border border-white/12 bg-white/6 py-5 pl-16 pr-5 text-3xl font-light outline-none transition placeholder:text-white/20 focus:border-sky-400/50 focus:bg-white/10"
              />
            </div>
          </Etapa>
        )}
      </div>

      {/* ---------- acao ----------
          As etapas de grid avancam sozinhas ao clicar, entao nao precisam de
          botao - ele so aparece onde a pessoa digita. */}
      {!ETAPAS_AUTO.includes(etapa) && (
        <button
          type="button"
          onClick={() => (etapa === "verba" ? void enviar() : avancar())}
          disabled={!podeAvancar}
          className="btn-proximo mt-8 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-sky-500 px-6 py-4 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {etapa === "verba" ? "Ver recomendações" : "Próximo"}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {erro && (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/12 px-4 py-3 text-sm text-red-200"
        >
          {erro}
        </p>
      )}
    </div>
  );
}

function BotaoContador({
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
      className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/6 text-xl leading-none transition hover:border-white/30 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-25"
    >
      {simbolo}
    </button>
  );
}

function Etapa({
  titulo,
  ajuda,
  children,
}: {
  titulo: string;
  ajuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium leading-snug sm:text-3xl">
        {titulo}
      </h2>
      {ajuda && <p className="mt-2 text-sm text-white/45">{ajuda}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Grade({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: readonly string[];
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {opcoes.map((opcao, i) => {
        const ativa = valor === opcao;
        return (
          <button
            key={opcao}
            type="button"
            onClick={() => onChange(opcao)}
            aria-pressed={ativa}
            style={{ animationDelay: `${i * 55}ms` }}
            className={`surgir cartao-opcao flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition duration-300 ${
              ativa
                ? "border-sky-400/70 bg-sky-400/15"
                : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {ICONES[opcao] ?? "✨"}
            </span>
            <span
              className={`text-sm leading-snug ${ativa ? "text-white" : "text-white/70"}`}
            >
              {opcao}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Carregando({ destino }: { destino: string }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="pulso grid h-16 w-16 place-items-center rounded-full border border-sky-400/30 bg-sky-400/10 text-2xl">
        🧭
      </div>
      <p className="font-display mt-6 text-xl font-medium">
        Montando seu roteiro
      </p>
      <p className="mt-1.5 text-sm text-white/45">
        Procurando as melhores experiências em {destino}...
      </p>
    </div>
  );
}

function Resultado({
  itens,
  destino,
  verificado,
  onReiniciar,
}: {
  itens: Recomendacao[];
  destino: string;
  verificado: boolean;
  onReiniciar: () => void;
}) {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);

  // Lido depois da montagem: localStorage nao existe no servidor, e ler no
  // primeiro render causaria divergencia de hidratacao.
  useEffect(() => setFavoritos(lerFavoritos()), []);

  return (
    <section className="mt-8">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
        Resultado
      </p>
      <h2 className="font-display mt-1.5 text-3xl font-light tracking-tight">
        {itens.length} {itens.length === 1 ? "experiência" : "experiências"} em{" "}
        {destino}
      </h2>

      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-white/45">
        <span aria-hidden="true">{verificado ? "✅" : "ℹ️"}</span>
        {verificado
          ? "Locais e contatos vindos do OpenStreetMap. A IA escolheu entre lugares que existem — ela não escreveu endereço nem telefone."
          : "Locais e contatos sugeridos pela IA. Confirme endereço e telefone no mapa antes de se deslocar."}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {itens.map((item, i) => (
          <article
            key={item.nome + i}
            className="surgir overflow-hidden rounded-2xl border border-white/12 bg-white/6"
            style={{ animationDelay: `${i * 110}ms` }}
          >
            <div className="p-5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-white/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl font-semibold leading-snug">
                  {item.nome}
                </h3>

                <button
                  type="button"
                  onClick={() => setFavoritos(alternarFavorito(item, destino))}
                  aria-pressed={ehFavorito(favoritos, item.nome, destino)}
                  aria-label={
                    ehFavorito(favoritos, item.nome, destino)
                      ? `Remover ${item.nome} dos favoritos`
                      : `Salvar ${item.nome} nos favoritos`
                  }
                  className="btn-favorito ml-auto shrink-0 self-start text-xl leading-none"
                >
                  {ehFavorito(favoritos, item.nome, destino) ? "♥" : "♡"}
                </button>
              </div>

              {item.pilar && (
                <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/12 px-3 py-1 text-[11px] font-medium text-sky-200">
                  <span aria-hidden="true">{ICONES[item.pilar] ?? "🍽️"}</span>
                  {item.pilar}
                </span>
              )}

              {item.porque.length > 0 && (
                <ul className="mt-3.5 flex flex-col gap-2">
                  {item.porque.map((linha, j) => (
                    <li
                      key={j}
                      className="flex gap-2.5 text-[15px] leading-relaxed text-white/80"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-sky-400/70"
                      />
                      {linha}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <dl className="flex flex-col gap-2 border-t border-white/10 bg-black/15 px-5 py-4 text-sm">
              {item.custoEstimado && (
                <Linha icone="💰" valor={item.custoEstimado} />
              )}
              {item.endereco && <Linha icone="📍" valor={item.endereco} />}
              {item.telefone && (
                <Linha
                  icone="📞"
                  valor={
                    <a
                      href={`tel:${item.telefone.replace(/[^\d+]/g, "")}`}
                      className="text-sky-300 transition hover:text-sky-200"
                    >
                      {item.telefone}
                    </a>
                  }
                />
              )}
              {item.site && (
                <Linha
                  icone="🔗"
                  valor={
                    <a
                      href={
                        item.site.startsWith("http")
                          ? item.site
                          : `https://${item.site}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-300 underline decoration-dotted underline-offset-4 transition hover:text-sky-200"
                    >
                      {item.site}
                    </a>
                  }
                />
              )}
              <Linha
                icone="🗺️"
                valor={
                  <a
                    href={item.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-300 underline decoration-dotted underline-offset-4 transition hover:text-sky-200"
                  >
                    {item.endereco ? "Ver no mapa" : "Buscar no Google Maps"}
                  </a>
                }
              />
            </dl>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={onReiniciar}
        className="mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 bg-white/6 px-6 py-3.5 font-medium transition hover:border-white/30 hover:bg-white/12"
      >
        ↻ Reiniciar
      </button>

      <p className="mt-4 text-center text-xs leading-relaxed text-white/30">
        Sugestões geradas por IA. Vale confirmar horário e preço com o local
        antes de ir.
      </p>
    </section>
  );
}

function Linha({ icone, valor }: { icone: string; valor: React.ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <span aria-hidden="true" className="shrink-0 opacity-70">
        {icone}
      </span>
      <dd className="text-white/85">{valor}</dd>
    </div>
  );
}
