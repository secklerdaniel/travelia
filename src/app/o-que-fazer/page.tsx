import Link from "next/link";

import Footer from "@/components/Footer";

import { CIDADE_FIXA } from "@/config/limites";
import ExperienciaForm from "@/components/ExperienciaForm";

/**
 * Planejamento de viagem com IA.
 *
 * O card de clima chega aqui com `?cidade=curitiba,br`, entao o destino ja vem
 * preenchido - quem veio de la nao redigita o que acabou de buscar.
 */
export default async function OQueFazer({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>;
}) {
  const { cidade } = await searchParams;

  // "curitiba,br" -> cidade "Curitiba", UF "BR"
  const [bruta = "", uf = ""] = (CIDADE_FIXA ?? cidade ?? "").split(",");
  const cidadeInicial = bruta
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm text-white/45 underline decoration-dotted underline-offset-4 transition hover:text-white"
      >
        ← Voltar para o clima
      </Link>

      <header className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.34em] text-white/35">
          Clima Web
        </p>
        <h1 className="font-display mt-1.5 text-4xl font-light tracking-tight sm:text-5xl">
          O que fazer aqui
        </h1>
        <p className="mt-2.5 max-w-md text-sm leading-relaxed text-white/50">
          Inicie abaixo o planejamento da sua próxima viagem com a ajuda da nossa
          IA.
        </p>
      </header>

        <ExperienciaForm
          cidadeInicial={cidadeInicial}
          ufInicial={uf.trim().toUpperCase()}
        />
      </div>

      {/* Fora do container, igual a home: o rodape e a faixa ocupam a tela. */}
      <Footer />
    </main>
  );
}
