import { NextResponse } from "next/server";

import { buscarCidades } from "@/lib/cidades";

/** GET /api/cidades?q=gram -> ate 8 municipios que casam com o termo. */
export async function GET(req: Request) {
  const termo = new URL(req.url).searchParams.get("q") ?? "";

  try {
    return NextResponse.json({ cidades: await buscarCidades(termo) });
  } catch {
    // Autocomplete e conveniencia: se o IBGE cair, a busca manual continua.
    return NextResponse.json({ cidades: [] });
  }
}
