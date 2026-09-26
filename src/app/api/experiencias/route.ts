import { NextResponse } from "next/server";

import { registrarConsulta } from "@/lib/consultas";
import { recomendarExperiencias, validarPedido } from "@/lib/experiencias/recomendar";
import { obterVisitante } from "@/lib/visitante";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** POST /api/experiencias -> 3 recomendacoes para a cidade e o perfil informados. */
export async function POST(req: Request) {
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisicao invalido." }, { status: 400 });
  }

  const pedido = validarPedido(corpo);
  if (typeof pedido === "string") {
    return NextResponse.json({ erro: pedido }, { status: 400 });
  }

  const comecou = Date.now();
  const visitante = await obterVisitante();
  const origem = (corpo as { origem?: {
    cidade?: string; uf?: string | null; pais?: string | null;
    lat?: number; lon?: number;
  } })?.origem ?? null;

  /** Campos do pedido que se repetem nos dois caminhos do registro. */
  const contexto = {
    tipo: "roteiro" as const,
    visitante,
    cidade: pedido.destinoCidade,
    uf: pedido.destinoUf || null,
    termoDigitado: pedido.destinoCidade,
    origemCidade: origem?.cidade ?? null,
    origemUf: origem?.uf ?? null,
    origemPais: origem?.pais ?? null,
    origemLat: origem?.lat ?? null,
    origemLon: origem?.lon ?? null,
    experiencia: pedido.experiencia,
    pilar: pedido.pilar,
    companhia: pedido.companhia,
    pessoas: pedido.pessoas,
    verba: pedido.verba,
  };

  try {
    const { recomendacoes, verificado, prompt, modelo } =
      await recomendarExperiencias(pedido);

    // Historico. Guarda a resposta inteira: e o que permite auditar depois
    // se uma recomendacao foi boa, sem precisar refazer a chamada.
    await registrarConsulta({
      ...contexto,
      modelo,
      prompt,
      resposta: { recomendacoes, verificado },
      duracaoMs: Date.now() - comecou,
    });

    return NextResponse.json({ recomendacoes, verificado });
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : "Erro inesperado.";

    await registrarConsulta({
      ...contexto,
      sucesso: false,
      erro: mensagem,
      duracaoMs: Date.now() - comecou,
    });

    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
