import { NextResponse } from "next/server";

import { localidadePorCoordenadas } from "@/lib/geocoding";

export const dynamic = "force-dynamic";

/**
 * POST /api/origem  { lat, lon } -> cidade de onde a pessoa esta consultando.
 *
 * O navegador manda o ponto exato; devolvemos e guardamos so a CIDADE, com as
 * coordenadas arredondadas a 2 casas (~1 km). O painel responde "de onde vem o
 * interesse por Gramado" - para isso a cidade basta, e o endereco de ninguem
 * precisa entrar no banco.
 */
export async function POST(req: Request) {
  let corpo: { lat?: number; lon?: number };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Corpo invalido." }, { status: 400 });
  }

  const lat = Number(corpo.lat);
  const lon = Number(corpo.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ erro: "Coordenadas invalidas." }, { status: 400 });
  }

  try {
    const local = await localidadePorCoordenadas(lat, lon);
    return NextResponse.json({
      origem: {
        cidade: local.nome,
        uf: local.estado,
        pais: local.pais,
        lat: Math.round(lat * 100) / 100,
        lon: Math.round(lon * 100) / 100,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro inesperado." },
      { status: 500 },
    );
  }
}
