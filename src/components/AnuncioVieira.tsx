"use client";

import { useEffect, useState } from "react";

/**
 * Anuncio da Vieira & Associados Imobiliaria.
 *
 * NAO e faixa cruzada da casa: e anuncio de CLIENTE, com formulario que grava
 * no Vila Ads. Por isso nao entra no carrossel nem na matriz do LEIA-ME das
 * faixas — ele tem CTA proprio e coleta contato.
 *
 * Por que aqui: o TravelIA e vendido para Gramado e quem abre a previsao da
 * cidade esta planejando ir. E o mesmo raciocinio que justifica a faixa do
 * Gramaldo aqui — publico de Gramado, nao publico generico.
 *
 * O contato vai para https://vila-ads.vercel.app/api/lead levando gclid e
 * utm_* quando existirem, para o corretor saber de onde veio cada pessoa.
 */

const API = "https://vila-ads.vercel.app/api/lead";

/** Identifica esta origem no painel do corretor. */
const ORIGEM = { utm_source: "travelia", utm_medium: "anuncio", utm_campaign: "TravelIA - Gramado" };

const RASTREIO = ["gclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export default function AnuncioVieira() {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [rastreio, setRastreio] = useState<Record<string, string>>({});

  // Se a pessoa chegou ao TravelIA por um anuncio, aproveita a origem dela.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const achado: Record<string, string> = {};
    for (const chave of RASTREIO) {
      const valor = params.get(chave);
      if (valor) achado[chave] = valor;
    }
    setRastreio(achado);
  }, []);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);

    const dados = Object.fromEntries(new FormData(evento.currentTarget).entries());

    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ORIGEM,
          ...dados,
          ...rastreio,
          page_url: window.location.href,
        }),
      });
      const resposta = (await r.json()) as { ok?: boolean; erro?: string };
      if (resposta.ok) setPronto(true);
      else setErro(resposta.erro ?? "Não consegui enviar. Tente de novo.");
    } catch {
      setErro("Falha de conexão. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="anuncioVieira" aria-labelledby="anuncio-vieira-titulo">
      <span className="marcaAnuncio">Publicidade</span>

      <div className="anuncioTopo">
        <div>
          <p className="anuncianteVieira">Vieira &amp; Associados Imobiliária</p>
          <h2 id="anuncio-vieira-titulo">Sua casa na serra, não só o fim de semana.</h2>
          <p className="anuncioTexto">
            Casas e coberturas de alto padrão em Gramado e Canela, em condomínio fechado e
            com vista para o vale. Fale com quem mora aqui.
          </p>
        </div>

        {!aberto && !pronto && (
          <button type="button" className="anuncioCta" onClick={() => setAberto(true)}>
            Quero conhecer imóveis
          </button>
        )}
      </div>

      {pronto && (
        <p className="anuncioOk">
          Recebido. A Vieira &amp; Associados entra em contato pelo WhatsApp.
        </p>
      )}

      {aberto && !pronto && (
        <form className="anuncioForm" onSubmit={enviar}>
          <label>
            <span>Nome</span>
            <input name="nome" required autoComplete="name" placeholder="Seu nome" />
          </label>
          <label>
            <span>WhatsApp</span>
            <input
              name="telefone"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="(54) 99999-9999"
            />
          </label>
          <label>
            <span>O que procura</span>
            <select name="interesse" defaultValue="Casa em Gramado">
              <option>Casa em Gramado</option>
              <option>Casa em Canela</option>
              <option>Cobertura em Gramado</option>
              <option>Terreno na serra</option>
            </select>
          </label>

          {erro && (
            <p className="anuncioErro" role="alert">
              {erro}
            </p>
          )}

          <button type="submit" className="anuncioCta" disabled={enviando}>
            {enviando ? "Enviando…" : "Falar com o corretor"}
          </button>

          <p className="anuncioAviso">
            Seus dados vão para a Vieira &amp; Associados Imobiliária, não para o TravelIA.
          </p>
        </form>
      )}

      <style jsx>{`
        .anuncioVieira {
          position: relative;
          max-width: 640px;
          margin: 24px auto 0;
          padding: 22px 24px 20px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          color: #12161d;
          text-align: left;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
        }
        /* obrigatório sinalizar que é publicidade, e não conteúdo do TravelIA */
        .marcaAnuncio {
          position: absolute;
          top: 10px;
          right: 14px;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8a92a6;
        }
        .anuncioTopo {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
        }
        .anuncianteVieira {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #15803d;
        }
        h2 {
          margin: 0 0 8px;
          font-size: 20px;
          line-height: 1.25;
          letter-spacing: -0.01em;
        }
        .anuncioTexto {
          margin: 0;
          max-width: 46ch;
          font-size: 14px;
          line-height: 1.55;
          color: #4b5567;
        }
        .anuncioCta {
          flex: none;
          background: #15803d;
          color: #fff;
          border: 0;
          border-radius: 10px;
          padding: 12px 20px;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .anuncioCta:hover {
          background: #126b34;
        }
        .anuncioCta:disabled {
          opacity: 0.6;
          cursor: progress;
        }
        .anuncioForm {
          display: grid;
          gap: 12px;
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }
        .anuncioForm label {
          display: grid;
          gap: 5px;
        }
        .anuncioForm span {
          font-size: 12px;
          color: #67718a;
        }
        .anuncioForm input,
        .anuncioForm select {
          width: 100%;
          padding: 11px 13px;
          font: inherit;
          font-size: 15px;
          color: #12161d;
          background: #fff;
          border: 1px solid #d8dde6;
          border-radius: 9px;
        }
        .anuncioForm input:focus,
        .anuncioForm select:focus {
          outline: 2px solid #15803d;
          outline-offset: 1px;
        }
        .anuncioErro {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #a01c1c;
        }
        .anuncioAviso {
          margin: 0;
          font-size: 11px;
          line-height: 1.5;
          color: #8a92a6;
        }
        .anuncioOk {
          margin: 16px 0 0;
          padding: 14px 16px;
          background: #eaf7ef;
          border: 1px solid #bfe3cc;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #15803d;
        }
        @media (max-width: 560px) {
          .anuncioCta {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
