import Link from "next/link";

import Footer from "@/components/Footer";
import TabelaConsultas from "@/components/dashboard/TabelaConsultas";
import { carregarDashboard } from "@/lib/dashboard";

import ObservatorioCharts from "./ObservatorioCharts";
import "./responsivo.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inteligência de Dados — TravelIA",
  description:
    "Inteligência de Dados: perfil de quem pede roteiro e prompts enviados à IA.",
};

const pct = (n: number) => `${Math.round(n * 100)}%`;
const brl = (n: number) =>
  n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
const num = (n: number, d = 0) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

/**
 * Inteligência de Dados
 *
 * Visual do protótipo Chartist (handoff) + dados reais de carregarDashboard()
 * e TabelaConsultas (ConsultaLinha).
 *
 * O backend atual agrega sobretudo ROTEIROS. Blocos de clima do protótipo
 * (temperatura, condições) ficam de fora até esses campos existirem nos
 * agregados.
 */
export default async function ObservatorioPage() {
  const d = await carregarDashboard();

  const porMes = d.porMes.map((m) => ({
    mes: m.mes,
    roteiro: m.roteiro,
    clima: "clima" in m ? Number((m as { clima?: number }).clima) : 0,
  }));

  const porHora = (d.porHora ?? []).map((h) => ({
    rotulo: h.rotulo,
    valor: h.valor,
  }));

  const experiencias = (d.experiencias ?? []).map((e) => ({
    rotulo: e.rotulo,
    valor: e.valor,
  }));

  const companhias = (d.companhias ?? []).map((c) => ({
    rotulo: c.rotulo,
    valor: c.valor,
  }));

  const origens = (d.origens ?? []).map((o) => ({
    rotulo: o.rotulo,
    valor: o.valor,
  }));

  const topOrigem = origens[0]?.rotulo;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f5f2",
        color: "#453d3f",
        fontFamily: "'Archivo', Helvetica, Arial, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <header
        className="dash-topo"
        style={{
          background: "#453d3f",
          color: "#fdfcfa",
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderBottom: "5px solid #d70206",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 760,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#c9bfb8",
            }}
          >
            Secretaria de Turismo · Gramado, RS
          </span>
          <h1
            className="dash-titulo"
            style={{
              margin: 0,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Inteligência de Dados
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.5,
              color: "#d8d0ca",
            }}
          >
            O que as pessoas perguntam antes de viajar para a cidade: perfil de
            quem pede roteiro e os prompts enviados à IA.
          </p>
        </div>
        <div
          className="dash-topo-lado"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#c9bfb8",
            }}
          >
            TravelIA
          </span>
          <div
            className="dash-topo-acoes"
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
            }}
          >
            <Link
              href="/dashboard/prompts"
              style={{
                fontSize: 12,
                color: "#c9bfb8",
                textDecoration: "none",
                border: "1px solid #6a5f61",
                padding: "6px 12px",
                borderRadius: 3,
              }}
            >
              Prompts
            </Link>
            <Link
              href="/"
              style={{
                fontSize: 12,
                color: "#c9bfb8",
                textDecoration: "none",
                border: "1px solid #6a5f61",
                padding: "6px 12px",
                borderRadius: 3,
              }}
            >
              ← Voltar ao app
            </Link>
          </div>
        </div>
      </header>

      <main
        className="dash-corpo"
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 36,
        }}
      >
        <section
          className="dash-kpis"
          style={{
            display: "grid",
            gap: 1,
            background: "#e6e1da",
            border: "1px solid #e6e1da",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Kpi
            rotulo="Roteiros pedidos"
            valor={num(d.porTipo.roteiro)}
            hint="o que interessa à secretaria"
            destaque
          />
          <Kpi
            rotulo="Visitantes únicos"
            valor={num(d.visitantes)}
            hint={topOrigem ? `maior origem: ${topOrigem}` : "—"}
          />
          <Kpi
            rotulo="Pessoas por grupo"
            valor={d.pessoasMedia != null ? num(d.pessoasMedia, 1) : "—"}
            hint="média declarada nos pedidos"
          />
          <Kpi
            rotulo="Verba média"
            valor={d.verbaMedia != null ? brl(d.verbaMedia) : "—"}
            hint="entre quem informou orçamento"
          />
          <Kpi
            rotulo="Com origem"
            valor={d.total ? pct(d.comOrigem / d.total) : "—"}
            hint="consultas que compartilharam localização"
          />
          <Kpi
            rotulo="Total de consultas"
            valor={d.total != null ? num(d.total) : "—"}
            hint="base do painel (após filtros do backend)"
          />
        </section>

        <Card
          titulo="Demanda por mês"
          apoio="Pedidos de roteiro registrados"
          legenda={
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: "#d70206",
                }}
              />
              Roteiro
            </span>
          }
        >
          <div id="ch-volume" style={{ height: 270, width: "100%" }} />
        </Card>

        <section
          className="dash-duo"
          style={{
            display: "grid",
            gap: 24,
          }}
        >
          <Card
            titulo="Em que horário consultam"
            apoio="Faixa horária das consultas"
          >
            <div id="ch-horas" style={{ height: 250, width: "100%" }} />
          </Card>
          <Card
            titulo="De onde parte o interesse"
            apoio={
              d.total
                ? `${pct(d.comOrigem / d.total)} compartilharam a localização`
                : "Cidade de origem"
            }
          >
            <div id="ch-origem" style={{ height: 250, width: "100%" }} />
          </Card>
        </section>

        <div
          className="dash-secao-titulo"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            borderTop: "1px solid #e6e1da",
            paddingTop: 30,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Pedidos de roteiro
          </h2>
          <span style={{ fontSize: 13, color: "#86797d" }}>
            Experiência, companhia e perfil de quem pede sugestão
          </span>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          <Card
            titulo="Experiências procuradas"
            apoio="Pedidos por tipo de turismo"
          >
            <div id="ch-exp" style={{ height: 240, width: "100%" }} />
          </Card>
          <Card titulo="Composição do grupo" apoio="Com quem o visitante viaja">
            <div id="ch-comp" style={{ height: 240, width: "100%" }} />
          </Card>
          {(d.pilares?.length ?? 0) > 0 && (
            <Card
              titulo="Pilar gastronômico"
              apoio="Quando a escolha é gastronomia"
            >
              <div id="ch-verba" style={{ height: 240, width: "100%" }} />
            </Card>
          )}
        </section>

        <ObservatorioCharts
          porMes={porMes}
          porHora={porHora}
          experiencias={experiencias}
          companhias={companhias}
          origens={origens}
          verbaPorExp={(d.pilares ?? []).map((p) => ({
            rotulo: p.rotulo,
            valor: p.valor,
          }))}
        />

        <section
          className="dash-cartao-tabela"
          style={{
            background: "#fff",
            border: "1px solid #e6e1da",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Últimas consultas
            </h2>
            <span
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 11,
                color: "#86797d",
              }}
            >
              Clique em “prompt” para auditar
            </span>
          </div>
          <TabelaConsultas linhas={d.ultimas} />
        </section>

        <Footer tema="claro" />
      </main>
    </div>
  );
}

function Kpi({
  rotulo,
  valor,
  hint,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  hint?: string;
  destaque?: boolean;
}) {
  return (
    <div
      className="dash-kpi"
      style={{
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#86797d",
        }}
      >
        {rotulo}
      </span>
      <span
        style={{
          fontSize: 34,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: destaque ? "#d70206" : undefined,
        }}
      >
        {valor}
      </span>
      {hint && (
        <span style={{ fontSize: 12, color: "#86797d" }}>{hint}</span>
      )}
    </div>
  );
}

function Card({
  titulo,
  apoio,
  legenda,
  children,
}: {
  titulo: string;
  apoio?: string;
  legenda?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="dash-cartao"
      style={{
        background: "#fff",
        border: "1px solid #e6e1da",
        borderRadius: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 22,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            {titulo}
          </h2>
          {apoio && (
            <p style={{ margin: 0, fontSize: 13, color: "#86797d" }}>{apoio}</p>
          )}
        </div>
        {legenda && (
          <div
            style={{ display: "flex", gap: 20, fontSize: 12, color: "#453d3f" }}
          >
            {legenda}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}