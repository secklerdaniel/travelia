import { NextResponse } from "next/server";

import { listarPrompts, restaurarPrompt, salvarPrompt } from "@/lib/prompts";

export const dynamic = "force-dynamic";

/** GET /api/prompts -> todos os prompts, com o texto em uso e o de fabrica. */
export async function GET() {
  try {
    return NextResponse.json({ prompts: await listarPrompts() });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro inesperado." },
      { status: 500 },
    );
  }
}

/** PUT /api/prompts  { chave, conteudo, editadoPor? } */
export async function PUT(req: Request) {
  let corpo: { chave?: string; conteudo?: string; editadoPor?: string };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Corpo invalido." }, { status: 400 });
  }

  if (!corpo.chave || typeof corpo.conteudo !== "string") {
    return NextResponse.json(
      { erro: "Informe a chave e o conteudo." },
      { status: 400 },
    );
  }

  const r = await salvarPrompt(corpo.chave, corpo.conteudo, corpo.editadoPor);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: 400 });

  return NextResponse.json({ prompts: await listarPrompts() });
}

/**
 * DELETE /api/prompts?chave=clima_analise
 *
 * Nao apaga o prompt - apaga a EDICAO. O app volta ao texto de fabrica, que
 * vive no codigo. Por isso nao existe risco de ficar sem prompt nenhum.
 */
export async function DELETE(req: Request) {
  const chave = new URL(req.url).searchParams.get("chave");
  if (!chave) {
    return NextResponse.json({ erro: "Informe a chave." }, { status: 400 });
  }

  const r = await restaurarPrompt(chave);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: 400 });

  return NextResponse.json({ prompts: await listarPrompts() });
}
