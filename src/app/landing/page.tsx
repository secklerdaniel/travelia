"use client";

export default function LandingTravelIA() {
  return (
    <main className="min-h-screen bg-[#0b0f19] text-[#e8edf7] antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0b0f19]/85 backdrop-blur-xl">
        {/* Logo a esquerda e nav a direita em qualquer largura. O nav era
            `absolute` no mobile, entao passava por cima do logo centralizado.
            No celular so o painel aparece: o WhatsApp continua na dobra final
            e no CTA do meio da pagina, e quem abre o link que mandamos ao
            secretario quer ver o painel, nao abrir conversa. */}
        <div className="mx-auto flex h-[68px] max-w-[1100px] items-center justify-between gap-3 px-6">
          <div className="font-display text-3xl font-light tracking-tight sm:text-4xl">
            Travel<span className="font-serif">I</span>A
          </div>
          <nav className="flex shrink-0 items-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex whitespace-nowrap rounded-full border border-white/12 px-3.5 py-1.5 text-[13px] font-medium text-white/80 transition hover:border-white/25 hover:bg-white/5 sm:px-4 sm:py-2 sm:text-sm"
            >
              Ver o painel
            </a>
            <a
              href="https://wa.me/5554981432889?text=Olá!%20Vi%20a%20proposta%20do%20TravelIA%20e%20quero%20conversar."
              className="hidden whitespace-nowrap rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 sm:inline-flex"
            >
              Falar no WhatsApp
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-36 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-[-20%] h-[800px] w-[800px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[820px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-sm font-medium text-sky-300">
            <span>✦</span> Inteligência de Demanda Turística
          </div>
          <h1 className="font-display text-4xl font-light tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.15]">
            Cada consulta do turista
            <br />
            <span className="bg-gradient-to-br from-sky-400 to-blue-500 bg-clip-text text-transparent">
              vira dado estratégico
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-lg leading-relaxed text-white/50">
            O TravelIA é um web app com IA que registra todas as interações dos
            visitantes. A Secretaria de Turismo passa a enxergar a demanda real
            em tempo real.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="/"
              className="rounded-xl bg-sky-500 px-7 py-3.5 font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Teste Agora
            </a>
            <a
              href="#preco"
              className="rounded-xl border border-white/12 px-7 py-3.5 font-semibold text-white/90 transition hover:border-white/25 hover:bg-white/5"
            >
              Ver proposta
            </a>
          </div>
        </div>
      </section>

      {/* O que entrega */}
      <section id="inteligencia" className="px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
              O que o TravelIA entrega
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/50">
              Inteligência de dados. Ponto.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "👤",
                title: "Perfil do turista",
                text: "Quem está buscando o destino: solo, casal, família com filhos, grupo de amigos ou excursão. Você sabe o perfil real da demanda.",
              },
              {
                icon: "🎯",
                title: "Tipo de experiência buscada",
                text: "Lazer, cultural, aventura, religioso, negócios ou gastronômico. Veja o que está em alta na semana ou no mês.",
              },
              {
                icon: "💰",
                title: "Faixa de orçamento",
                text: "Quanto o turista está disposto a gastar. Dado direto para o trade e para políticas públicas de incentivo.",
              },
              {
                icon: "📅",
                title: "Sazonalidade e picos",
                text: "Horários e dias de maior busca. Antecipe demanda e prepare a estrutura da cidade.",
              },
              {
                icon: "📍",
                title: "Origem da demanda",
                text: "De onde o visitante consulta — cidade e região. Entenda de onde vem o interesse pelo destino.",
              },
              {
                icon: "📊",
                title: "Painel para a Secretaria",
                text: "Dashboard com os principais indicadores de demanda. Decisões baseadas em dados reais de quem está planejando a viagem.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#141b2d] p-7 transition hover:border-white/20 hover:bg-[#1a2338]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-xl">
                  {item.icon}
                </div>
                <h3 className="mb-2.5 text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como os dados são gerados */}
      <section className="bg-[#0d1320] px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
              Como os dados são gerados
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/50">
              O turista usa o assistente. Cada passo fica registrado no banco.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "1",
                title: "Escolhe a cidade",
                text: "Informa o destino que quer conhecer.",
              },
              {
                n: "2",
                title: "Define o perfil",
                text: "Tipo de experiência, com quem viaja e quantas pessoas.",
              },
              {
                n: "3",
                title: "Informa o orçamento",
                text: "Coloca a verba disponível para a experiência.",
              },
              {
                n: "4",
                title: "Dado é armazenado",
                text: "Tudo fica no banco. A Secretaria enxerga a demanda real.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-2xl border border-white/10 bg-[#141b2d] p-7 text-center"
              >
                <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-slate-950">
                  {step.n}
                </div>
                <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-white/50">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por que a Secretaria ganha */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
              Por que a Secretaria ganha
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/50">
              Dados reais de demanda, sem pesquisa cara e sem atraso.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: "🧠",
                title: "Decisão baseada em dado real",
                text: "Não é opinião. É o que o turista está buscando agora, enquanto planeja a viagem.",
              },
              {
                icon: "⏱",
                title: "Resposta rápida",
                text: "Veja mudanças de interesse em dias, não em meses. Antecipe movimentos.",
              },
              {
                icon: "🏛",
                title: "Destino inteligente",
                text: "Posiciona a cidade como referência em turismo orientado por dados.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#141b2d] p-7 transition hover:border-white/20 hover:bg-[#1a2338]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-xl">
                  {item.icon}
                </div>
                <h3 className="mb-2.5 text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilita a decisão */}
      <section className="bg-[#0d1320] px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
              Feito para facilitar a decisão do secretário
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/50">
              Valor baixo, processo simples e aplicação imediata. Ideal para
              secretarias de turismo.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#141b2d] p-7">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-xl">
                📋
              </div>
              <h3 className="mb-3 text-lg font-semibold tracking-tight">
                Cabe em dispensa de licitação
              </h3>
              <p className="text-sm leading-relaxed text-white/50">
                Em 2026, a dispensa por valor para serviços e compras vai até
                R$ 65.492,11 (Lei 14.133/2021). Com R$ 9.800, o secretário de
                Turismo consegue autorizar a contratação de forma direta, sem
                depender de outras secretarias ou do prefeito na maioria dos
                casos. Processo enxuto: demanda + termo simplificado +
                autorização.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#141b2d] p-7">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-xl">
                🏛
              </div>
              <h3 className="mb-3 text-lg font-semibold tracking-tight">
                Produto ideal para secretarias de turismo
              </h3>
              <p className="text-sm leading-relaxed text-white/50">
                O TravelIA foi pensado para quem gerencia destino. Ele entrega
                inteligência de demanda real (perfil do turista, orçamento,
                tipo de experiência, sazonalidade) enquanto o visitante usa o
                assistente. Dados que ajudam a planejar, comunicar e priorizar
                ações.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-[#141b2d] p-7">
            <h3 className="mb-4 text-lg font-semibold tracking-tight">
              Onde a secretaria pode aplicar
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Site da prefeitura",
                  text: "Embutido ou link destacado na área de turismo.",
                },
                {
                  title: "Site da secretaria",
                  text: "Canal oficial de planejamento da viagem.",
                },
                {
                  title: "Bios de redes sociais",
                  text: "Instagram, Facebook e TikTok da cidade/secretaria.",
                },
                {
                  title: "Centros de atendimento",
                  text: "QR Code nos CATs e pontos de informação ao turista.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <p className="font-medium text-white/90">{item.title}</p>
                  <p className="mt-1 text-sm text-white/45">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Preço */}
      <section id="preco" className="bg-[#0d1320] px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
              Proposta direta
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/50">
              Valor único. Sem mensalidade.
            </p>
          </div>

          <div className="relative mx-auto max-w-[480px] rounded-[20px] border border-white/15 bg-gradient-to-b from-[#1a2338] to-[#141b2d] px-9 py-10 text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-950">
              Dispensa de licitação
            </div>

            <div className="mt-2 font-display text-5xl font-light tracking-tight">
              R$ 14.700
            </div>
            <p className="mt-1 text-sm text-white/50">
              pagamento único • implantação + licença de uso
            </p>

            <ul className="mt-8 space-y-0 text-left text-sm">
              {[
                "Licença de uso do TravelIA (web app completo)",
                "Implantação e configuração inicial",
                "Todas as consultas armazenadas no banco de dados",
                "Acesso à inteligência de demanda (perfil, orçamento, tipo de experiência, sazonalidade…)",
                "Painel com indicadores e filtros nas consultas",
                "Treinamento rápido da equipe",
                "Suporte inicial de 30 dias",
                "Código e acesso total ao sistema",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-white/10 py-2.5 last:border-0"
                >
                  <span className="mt-0.5 font-bold text-emerald-400">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="https://wa.me/5554981432889?text=Olá!%20Vi%20a%20proposta%20do%20TravelIA%20e%20quero%20conversar."
              className="mt-8 block w-full rounded-xl bg-sky-500 py-3.5 font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Quero essa proposta
            </a>

            <p className="mt-5 text-left text-xs leading-relaxed text-white/45">
              <strong className="text-white/70">Importante:</strong> Os créditos
              de consumo de IA (APIs) ficam por conta da Secretaria e podem ser
              adquiridos diretamente com os provedores. Você controla o gasto.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-[520px]">
          <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
            Pronto para ter inteligência de demanda em tempo real?
          </h2>
          <p className="mt-4 text-white/50">
            O valor cabe em dispensa de licitação. Você mesmo pode autorizar. Em
            poucos dias o sistema está no ar e os dados começam a chegar.
          </p>
          <a
            href="https://wa.me/5554981432889?text=Olá!%20Vi%20a%20proposta%20do%20TravelIA%20e%20quero%20conversar."
            className="mt-8 inline-block rounded-xl bg-sky-500 px-8 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Falar agora no WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40">
        Travel<span className="font-serif">I</span>A — Inteligência de
        Demanda Turística - 2026 | Desenvolvido por{" "}
        <a
          href="https://portfolio-daniel-seckler.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 underline-offset-2 transition hover:text-sky-400 hover:underline"
        >
          Seckler Digital
        </a>
      </footer>
    </main>
  );
}
