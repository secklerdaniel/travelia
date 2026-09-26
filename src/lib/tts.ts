import { promptPreenchido } from "./prompts";
import { GUIA_PADRAO, type GuiaRegional } from "./regionalidade";

const ENDPOINT = "https://api.openai.com/v1/audio/speech";

/** Traduz o erro da OpenAI para algo acionavel na tela. */
async function mensagemDeErro(resposta: Response): Promise<string> {
  const cru = await resposta.text().catch(() => "");

  if (resposta.status === 401) {
    return "chave da OpenAI invalida ou sem permissao para audio.";
  }
  if (resposta.status === 429) {
    return "limite de uso da OpenAI atingido. Tente de novo em alguns instantes.";
  }
  return `OpenAI (audio) respondeu ${resposta.status}: ${cru.slice(0, 200)}`;
}

/**
 * Gera o mp3 da analise na OpenAI.
 *
 * O `gpt-4o-mini-tts` aceita `instructions`, um comando de direcao de voz. E por
 * ele que pedimos o sotaque da cidade - o texto ja vem escrito com as girias do
 * lugar, aqui a narracao acompanha o jeito de falar, com os tracos foneticos
 * que vieram do guia regional.
 */
export async function gerarAudio(
  texto: string,
  local: string,
  guia: GuiaRegional = GUIA_PADRAO,
): Promise<Uint8Array> {
  const chave = process.env.OPENAI_API_KEY;
  if (!chave) throw new Error("OPENAI_API_KEY nao configurada no .env.local");

  const modelo = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
  // A voz da regiao vence a do ambiente: `voz_tts_id` foi escolhida por perfil
  // regional, entao o padrao global so vale onde a linha nao definiu nada.
  const voz = guia.voz || process.env.OPENAI_TTS_VOICE || "coral";

  const instructions = await promptPreenchido("tts_narracao", {
    local,
    tracos_foneticos_tts: guia.foneticaTts,
  });

  const resposta = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chave}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelo,
      voice: voz,
      input: texto,
      instructions,
      response_format: "mp3",
    }),
  });

  if (!resposta.ok) throw new Error(await mensagemDeErro(resposta));

  return new Uint8Array(await resposta.arrayBuffer());
}
