"use client";

import { useEffect, useRef } from "react";

/**
 * Carrossel de faixas dos outros apps da casa.
 *
 * Porte do `carrossel.html` de `apps/manifesto/faixas/` para React, seguindo a
 * decisao de COPIAR e nao compartilhar (ver `faixa-cruzada.md`): a faixa herda
 * o tema do anfitriao, e um embed serviria a mesma cor para todo mundo.
 *
 * Anfitriao: TravelIA. Rodape escuro, entao `data-tema="claro"`.
 *
 * Quem NAO esta aqui, e por que:
 * - TravelIA: e o proprio site.
 * - Mantis: a matriz do LEIA-ME nao permite - e B2B pago, e quem esta
 *   decidindo assinatura nao deve ser puxado para app de consumo.
 */

const ORIGEM = "travelia";

/** 6 segundos: tempo de ler a frase inteira sem a faixa virar enquanto le. */
const INTERVALO = 6000;

type Faixa = {
  /** Slug em `faixa_apps` no Supabase - a FK do clique recusa o que nao existe. */
  destino: string;
  href: string;
  icone: string;
  nome: string;
  frase: string;
  acao: string;
};

const FAIXAS: Faixa[] = [
  {
    destino: "mochila",
    href: "https://mochila-seckler.vercel.app/",
    icone: "🎒",
    nome: "Mochila de Emergência",
    frase: "seu kit tem item vencido — o app avisa 30 dias antes",
    acao: "Conferir validade",
  },
  {
    destino: "comparaevs",
    href: "https://www.comparaevs.com.br/",
    icone: "⚡",
    nome: "ComparaEVs",
    frase: "quanto custa rodar 100 km de elétrico, pelo dado do INMETRO",
    acao: "Comparar modelos",
  },
  {
    // O arquivo da casa traz `gramaldo`, mas em `faixa_apps` o slug cadastrado
    // e `sala-do-empreendedor`. Vale o do banco: com o outro, a chave
    // estrangeira recusaria o clique e a faixa nao mediria nada.
    destino: "sala-do-empreendedor",
    href: "https://gramaldo26.vercel.app/",
    icone: "🏛️",
    nome: "Gramaldo",
    frase: "Quer empreender em Gramado? A gente te ajuda!",
    acao: "Tirar uma dúvida",
  },
];

export default function FaixaCarrossel() {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const car = caixa.current;
    if (!car) return;

    const faixas = Array.from(car.querySelectorAll<HTMLAnchorElement>(".faixa"));
    if (faixas.length === 0) return;

    // UTM montado a partir da origem: um lugar so para errar.
    faixas.forEach((f) => {
      const base = f.getAttribute("href")?.split("?")[0] ?? "";
      f.setAttribute(
        "href",
        `${base}?utm_source=${encodeURIComponent(ORIGEM)}` +
          "&utm_medium=faixa&utm_content=carrossel",
      );
    });

    // Embaralha. Sem isso o primeiro da lista leva sempre o primeiro olhar, e a
    // troca de trafego entre os apps nasce torta.
    for (let i = faixas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [faixas[i], faixas[j]] = [faixas[j], faixas[i]];
    }

    function mostrar(n: number) {
      faixas.forEach((f, k) => {
        const ativa = k === n;
        f.classList.toggle("is-ativa", ativa);
        f.setAttribute("aria-hidden", ativa ? "false" : "true");
        // Link invisivel nao pode ser alcancado por Tab.
        f.setAttribute("tabindex", ativa ? "0" : "-1");
      });
    }

    car.classList.add("pronto");
    let atual = 0;
    mostrar(0);

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | null = null;
    let sobMouse = false;
    let naTela = true;
    let abaAtiva = true;

    const podeRodar = () =>
      faixas.length > 1 && !semMovimento.matches && !sobMouse && naTela && abaAtiva;

    const parar = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const ligar = () => {
      parar();
      if (!podeRodar()) return;
      timer = setInterval(() => {
        atual = (atual + 1) % faixas.length;
        mostrar(atual);
      }, INTERVALO);
    };

    // Pausar sob o mouse e sob o foco impede o pior bug de carrossel: a faixa
    // trocar no instante em que a pessoa vai clicar nela.
    const entrou = () => {
      sobMouse = true;
      parar();
    };
    const saiu = () => {
      sobMouse = false;
      ligar();
    };
    const trocouAba = () => {
      abaAtiva = !document.hidden;
      ligar();
    };

    car.addEventListener("mouseenter", entrou);
    car.addEventListener("mouseleave", saiu);
    car.addEventListener("focusin", entrou);
    car.addEventListener("focusout", saiu);
    document.addEventListener("visibilitychange", trocouAba);
    semMovimento.addEventListener("change", ligar);

    // A faixa mora no rodape. Rodar enquanto ninguem rolou ate la so gasta
    // slide a toa - quando a pessoa chega, ja passou metade dos apps.
    let observador: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      naTela = false;
      observador = new IntersectionObserver(
        (entradas) => {
          naTela = entradas[0].isIntersecting;
          ligar();
        },
        { threshold: 0.5 },
      );
      observador.observe(car);
    } else {
      ligar();
    }

    return () => {
      parar();
      observador?.disconnect();
      car.removeEventListener("mouseenter", entrou);
      car.removeEventListener("mouseleave", saiu);
      car.removeEventListener("focusin", entrou);
      car.removeEventListener("focusout", saiu);
      document.removeEventListener("visibilitychange", trocouAba);
      semMovimento.removeEventListener("change", ligar);
    };
  }, []);

  /**
   * Clique no Supabase, com a chave PUBLICA.
   *
   * Sem `NEXT_PUBLIC_SUPABASE_ANON_KEY` o carrossel roda igual e so nao conta -
   * medicao nunca pode atrapalhar a navegacao. A service_role NAO serve aqui:
   * ela ignora RLS e nao pode ir para o navegador.
   */
  function registrarClique(destino: string) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return;

    fetch(`${url}/rest/v1/rpc/registrar_clique_faixa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
      body: JSON.stringify({ p_origem: ORIGEM, p_destino: destino }),
      keepalive: true,
    }).catch(() => {
      /* medicao nunca atrapalha a navegacao */
    });
  }

  return (
    <div
      ref={caixa}
      className="faixa-carrossel"
      data-tema="claro"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Outros apps da Seckler Digital"
    >
      {FAIXAS.map((f) => (
        <a
          key={f.destino}
          className="faixa"
          data-destino={f.destino}
          href={f.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => registrarClique(f.destino)}
        >
          <span className="faixa-icone" aria-hidden="true">
            {f.icone}
          </span>
          <span className="faixa-texto">
            <span className="faixa-nome">{f.nome}</span>
            <span className="faixa-frase">{f.frase}</span>
          </span>
          <span className="faixa-pilula">
            {f.acao} <span aria-hidden="true">&rarr;</span>
          </span>
        </a>
      ))}
    </div>
  );
}
