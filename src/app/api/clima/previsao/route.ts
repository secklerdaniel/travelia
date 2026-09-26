import { NextResponse } from "next/server";

import { buscarClimaPorCoordenadas } from "@/lib/openweather";
import { buscarPrevisao } from "@/lib/previsao";

export const dynamic = "force-dynamic";

/**
 * GET /api/clima/previsao?lat=&lon=&temp=
 *
 * Medicao de AGORA mais a faixa das proximas horas. Separada do
 * POST /api/clima porque nao passa pela trava de 2 horas: aquela trava protege
 * as chamadas pagas da OpenAI, e estas duas consultas sao so a OpenWeather -
 * saem de graca e o dado envelhece rapido demais para valer cache.
 *
 * A medicao vem junto porque o card abria com o numero da ULTIMA CONSULTA, que
 * pode ser de dias atras. Quem chega no site espera o clima de agora sem
 * precisar clicar em nada - e essa expectativa nao pode custar uma chamada de
 * IA a cada visita.
 *
 * A chave nunca chega ao navegador; por isso a rota existe.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const bruta = searchParams.get("temp");
  const temp = bruta !== null && bruta !== "" ? Number(bruta) : null;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ erro: "Coordenadas invalidas." }, { status: 400 });
  }

  try {
    // A medicao entra no calculo dos extremos do dia, entao vem primeiro. Se
    // ela falhar, a faixa ainda sai: o card so perde o refresh dos numeros.
    const agora = await buscarClimaPorCoordenadas(lat, lon).catch(() => null);

    const previsao = await buscarPrevisao(
      lat,
      lon,
      agora?.main?.temp ?? (Number.isFinite(temp as number) ? (temp as number) : null),
    );

    return NextResponse.json({
      previsao,
      agora: agora
        ? {
            temp: agora.main?.temp ?? null,
            sensacao: agora.main?.feels_like ?? null,
            umidade: agora.main?.humidity ?? null,
            condicaoId: agora.weather?.[0]?.id ?? null,
            icone: agora.weather?.[0]?.icon ?? null,
            descricao: agora.weather?.[0]?.description ?? null,
            medidoEm: agora.dt ?? null,
          }
        : null,
    });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro inesperado." },
      { status: 502 },
    );
  }
}
