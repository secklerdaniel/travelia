import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/clima/audio/<id> -> o mp3 da narracao daquela cidade.
 *
 * O audio mora na propria linha (`clima_cidades.audio_mp3`) em vez de um
 * bucket: sao poucos arquivos pequenos, um por cidade, e guardar no banco
 * elimina o servico de storage, os caminhos e a limpeza de orfaos - apagar a
 * previsao apaga o audio junto.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const linha = (
    (await db().query(
      `select encode(audio_mp3, 'base64') as b64 from clima_cidades
        where id = $1 and audio_mp3 is not null`,
      [id],
    )) as unknown as { b64: string }[]
  )[0];

  if (!linha) return new Response("Audio nao encontrado.", { status: 404 });

  return new Response(Buffer.from(linha.b64, "base64"), {
    headers: {
      "Content-Type": "audio/mpeg",
      // A URL carrega timestamp; o conteudo daquele endereco nunca muda.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
