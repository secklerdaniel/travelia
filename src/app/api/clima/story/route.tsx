import { ImageResponse } from "next/og";

import { dataHoraLocal, grau } from "@/lib/format";
import { buscarPrevisao, type Previsao } from "@/lib/previsao";
import { carregarFontes } from "@/lib/story/fonts";
import { db } from "@/lib/db";
import type { Clima } from "@/lib/types";
import { getWeatherBackground } from "@/lib/weather/getWeatherBackground";
import { gradienteCeu, temaDoClima } from "@/lib/weather-theme";

// O next/og precisa rodar no runtime edge: no runtime nodejs (Next 16 no
// Windows) o binario nativo de rasterizacao derruba o worker sem resposta.
// O supabase-js funciona aqui porque e todo baseado em fetch.
export const runtime = "edge";
export const dynamic = "force-dynamic";

/** Formato de story do Instagram. */
const LARGURA = 1080;
const ALTURA = 1920;

/** A interface do Instagram cobre topo e rodape; o conteudo fica entre eles. */
const MARGEM_TOPO = 300;
const MARGEM_RODAPE = 260;
const MARGEM_LATERAL = 88;

/**
 * Verde limao da chamada para o roteiro.
 *
 * Unica cor do story que NAO segue o tema do clima: ela precisa ser sempre a
 * mesma para o olho reconhecer o botao de um story para o outro, e vence tanto
 * o ceu claro quanto a foto noturna.
 */
const LIMAO = "#a3e635";
const TINTA_LIMAO = "#132003";

/** O texto da analise nao cabe inteiro num story sem virar parede. */
const LIMITE_TEXTO = 108;

function encurtar(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  const corte = texto.slice(0, limite);
  const ultimoEspaco = corte.lastIndexOf(" ");
  const cortado = corte.slice(0, ultimoEspaco > 0 ? ultimoEspaco : limite);
  // tira pontuacao no fim para nao virar "conta...…"
  return `${cortado.trimEnd().replace(/[.,;:!?…]+$/, "")}…`;
}

/** Hora no relogio da cidade, sem zero a esquerda - igual a faixa do card. */
function horaLocal(epoch: number, offset: number): string {
  return `${new Date((epoch + offset) * 1000).getUTCHours()}h`;
}

/**
 * GET /api/clima/story?id=<uuid>
 *
 * PNG 1080x1920 da previsao, pronto para os stories.
 *
 * A imagem e desenhada do zero em vez de capturada da tela: o card usa
 * `backdrop-filter` e `mix-blend-mode`, que nenhuma biblioteca de screenshot
 * de DOM renderiza. Alem disso, story e um formato diferente do card - pede
 * tipografia maior e respiro nas bordas.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response("Informe o id da previsao.", { status: 400 });
  }

  const clima = ((await db().query(
    `select * from clima_cidades where id = $1`,
    [id],
  )) as unknown as Clima[])[0];

  if (!clima) return new Response("Previsao nao encontrada.", { status: 404 });
  const tema = temaDoClima(clima.condicao_id, clima.condicao_icone);
  const tz = clima.timezone_offset;

  // A foto de fundo pode nao existir ainda; sem ela o gradiente do tema segura
  // a imagem sozinho, entao a checagem evita um story quebrado.
  const caminho = getWeatherBackground(clima.condicao_id, clima.condicao_icone);
  const fotoUrl = new URL(caminho, url.origin).toString();
  const temFoto = await fetch(fotoUrl, { method: "HEAD" })
    .then((r) => r.ok)
    .catch(() => false);

  const fontes = await carregarFontes();

  // Previsao das proximas horas: vem da OpenWeather na hora, como no card.
  // Nao e gravada no banco porque envelhece rapido; se falhar, a faixa some da
  // imagem e o resto do story sai igual.
  let previsao: Previsao | null = null;
  if (clima.lat !== null && clima.lon !== null) {
    previsao = await buscarPrevisao(clima.lat, clima.lon, clima.temp).catch(
      (e) => {
        console.error("[story] sem faixa de horas:", e);
        return null;
      },
    );
  }
  const proximas = previsao?.pontos.slice(0, 6) ?? [];
  const offsetPrevisao = previsao?.offset ?? tz ?? 0;
  // Sem chuva em nenhuma coluna, a linha inteira sai: reservar o espaco
  // deixaria uma faixa vazia no meio da imagem.
  const temChuva = proximas.some((p) => p.chuva >= 0.2);

  const rotulo = {
    fontSize: 26,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.55)",
    fontWeight: 500 as const,
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: LARGURA,
          height: ALTURA,
          display: "flex",
          position: "relative",
          background: gradienteCeu(tema),
          fontFamily: "Outfit",
          color: "#ffffff",
        }}
      >
        {temFoto && (
          <img
            src={fotoUrl}
            width={LARGURA}
            height={ALTURA}
            style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
          />
        )}

        {/* veu: garante contraste do texto sobre qualquer foto */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: LARGURA,
            height: ALTURA,
            background:
              "linear-gradient(180deg, rgba(6,10,20,0.45) 0%, rgba(6,10,20,0.12) 26%, rgba(6,10,20,0.72) 66%, rgba(6,10,20,0.94) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: LARGURA,
            height: ALTURA,
            padding: `${MARGEM_TOPO}px ${MARGEM_LATERAL}px ${MARGEM_RODAPE}px`,
          }}
        >
          {/* ---------- marca ---------- */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: tema.destaque,
                marginRight: 16,
              }}
            />
            <div style={rotulo}>CLIMA WEB</div>
          </div>

          {/* ---------- cidade ---------- */}
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: -2,
              marginTop: 26,
            }}
          >
            {clima.nome}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 500,
              color: "rgba(255,255,255,0.6)",
              marginTop: 10,
            }}
          >
            {[clima.pais, dataHoraLocal(clima.medido_em, tz)]
              .filter(Boolean)
              .join("  ·  ")}
          </div>

          <div style={{ display: "flex", flex: 1 }} />

          {/* ---------- temperatura ---------- */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ display: "flex", fontSize: 250, fontWeight: 200, lineHeight: 0.85 }}>
              {Math.round(clima.temp ?? 0)}
            </div>
            <div style={{ display: "flex", fontSize: 92, fontWeight: 200, marginTop: 12 }}>
              °
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 500,
              marginTop: 26,
              textTransform: "capitalize",
            }}
          >
            {clima.condicao_descricao ?? "—"}
          </div>

          {/* ---------- medidas ---------- */}
          <div style={{ display: "flex", marginTop: 44 }}>
            {[
              ["MÁX", grau(clima.temp_max)],
              ["MÍN", grau(clima.temp_min)],
              ["SENSAÇÃO", grau(clima.sensacao_termica)],
              ["UMIDADE", clima.umidade === null ? "--" : `${clima.umidade}%`],
            ].map(([nome, valor], i) => (
              <div key={nome} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <div
                    style={{
                      width: 1,
                      height: 52,
                      background: "rgba(255,255,255,0.22)",
                      marginLeft: 30,
                      marginRight: 30,
                    }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ ...rotulo, fontSize: 22, letterSpacing: 2 }}>{nome}</div>
                  <div style={{ display: "flex", fontSize: 44, fontWeight: 500, marginTop: 6 }}>
                    {valor}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- sol ---------- */}
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 500,
              color: "rgba(255,255,255,0.68)",
              marginTop: 40,
            }}
          >
            {`Nascer ${dataHoraLocal(clima.nascer_do_sol, tz).slice(6)}   ·   Pôr do sol ${dataHoraLocal(clima.por_do_sol, tz).slice(6)}`}
          </div>

          {/* ---------- proximas horas ---------- */}
          {proximas.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 34,
                padding: "24px 30px 26px",
                borderRadius: 34,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <div style={{ ...rotulo, fontSize: 22, letterSpacing: 2 }}>
                PRÓXIMAS HORAS · DE 3 EM 3
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 18,
                }}
              >
                {proximas.map((ponto) => (
                  <div
                    key={ponto.epoch}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: 128,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        fontSize: 26,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      {horaLocal(ponto.epoch, offsetPrevisao)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        fontSize: 46,
                        fontWeight: 500,
                        marginTop: 12,
                      }}
                    >
                      {Math.round(ponto.temp)}°
                    </div>
                    {temChuva && (
                      <div
                        style={{
                          display: "flex",
                          fontSize: 22,
                          fontWeight: 500,
                          marginTop: 10,
                          color:
                            ponto.chuva >= 0.2
                              ? tema.destaque
                              : "rgba(255,255,255,0)",
                        }}
                      >
                        {ponto.chuva >= 0.2
                          ? `${Math.round(ponto.chuva * 100)}%`
                          : "0"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- analise ---------- */}
          {clima.analise_texto && (
            <div style={{ display: "flex", marginTop: 38 }}>
              <div
                style={{
                  width: 5,
                  background: tema.destaque,
                  borderRadius: 999,
                  marginRight: 28,
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: 34,
                  fontWeight: 500,
                  lineHeight: 1.42,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {encurtar(clima.analise_texto, LIMITE_TEXTO)}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flex: 1 }} />

          {/* ---------- chamada para o roteiro ----------

              O clima e a porta de entrada; o roteiro e o produto. Num story
              o botao nao pode ser clicado, entao ele vem solido, na cor do
              tema, com o endereco logo abaixo - quem ve precisa saber para
              onde ir sem ter o link. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 40,
              padding: "32px 48px",
              borderRadius: 999,
              background: LIMAO,
              color: TINTA_LIMAO,
            }}
          >
            <div style={{ display: "flex", fontSize: 48, fontWeight: 600 }}>
              O que fazer aqui
            </div>
            <svg
              width="44"
              height="44"
              viewBox="0 0 16 16"
              fill="none"
              style={{ marginLeft: 20 }}
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke={TINTA_LIMAO}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* ---------- rodape ---------- */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 30,
              paddingTop: 30,
              borderTop: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div style={{ ...rotulo, fontSize: 27, letterSpacing: 1 }}>
              Previsão narrada por IA
            </div>
            <div style={{ ...rotulo, fontSize: 27, letterSpacing: 0, color: "rgba(255,255,255,0.75)" }}>
              {url.host}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: LARGURA,
      height: ALTURA,
      fonts: fontes,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
