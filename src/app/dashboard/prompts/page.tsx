import Link from "next/link";

import Footer from "@/components/Footer";

import EditorPrompts from "@/components/dashboard/EditorPrompts";
import { listarPrompts } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Prompts — TravelIA",
  description: "Edição dos prompts enviados à IA.",
};

export default async function PaginaPrompts() {
  const prompts = await listarPrompts();

  return (
    <div className="tema-claro">
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-display text-3xl font-light tracking-tight sm:text-4xl">
            Travel<span className="font-serif">I</span>A
          </div>
          <h1 className="font-display mt-1.5 text-4xl font-light tracking-tight sm:text-5xl">
            Prompts
          </h1>
          <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-[var(--tinta-fraca)]">
            O que é enviado à IA em cada parte do app. Alterações valem na
            próxima consulta, sem precisar de deploy.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-[var(--linha)] bg-black/4 px-4 py-2 text-sm transition hover:border-[rgba(69,61,63,0.35)] hover:bg-black/8"
        >
          ← Painel
        </Link>
      </header>

      <EditorPrompts inicial={prompts} />

      <p className="mt-6 text-xs leading-relaxed text-[var(--tinta-fraca)]">
        O banco guarda apenas o que foi editado. Um prompt marcado como
        “padrão” está lendo o texto do código — por isso o app continua
        funcionando mesmo com a tabela vazia, e “Restaurar padrão” apenas apaga
        a edição.
      </p>
      <Footer tema="claro" />
      </main>
    </div>
  );
}
