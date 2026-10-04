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
 * Narra na ElevenLabs. Cobra 1 credito por caractere (~260 por previsao), e o
 * plano acaba rapido: quem chama cai para a OpenAI quando isto lanca.
 */
async function audioElevenLabs(texto: string, chave: string): Promise<Uint8Array> {
  const voz = process.env.voice_id;
  if (!voz) throw new Error("voice_id nao configurado");
  const modelo = process.env.modelId || "eleven_v4";

  const resposta = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voz}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": chave, "Content-Type": "application/json" },
      body: JSON.stringify({ text: texto, model_id: modelo, language_code: "pt" }),
    },
  );

  if (!resposta.ok) {
    const cru = await resposta.text().catch(() => "");
    throw new Error(`ElevenLabs respondeu ${resposta.status}: ${cru.slice(0, 200)}`);
  }
  return new Uint8Array(await resposta.arrayBuffer());
}

/**
 * Gera o mp3 da analise: ElevenLabs quando `ELEVENLABS_API_KEY` existe, OpenAI
 * como reserva (credito acabou, modelo errado, fora do ar).
 */
export async function gerarAudio(
  texto: string,
  local: string,
  guia: GuiaRegional = GUIA_PADRAO,
): Promise<Uint8Array> {
  const chaveEleven = process.env.ELEVENLABS_API_KEY;
  if (chaveEleven) {
    try {
      return await audioElevenLabs(texto, chaveEleven);
    } catch (e) {
      console.error("[tts] ElevenLabs falhou, narrando na OpenAI:", e);
    }
  }
  return audioOpenAI(texto, local, guia);
}

/**
 * Gera o mp3 da analise na OpenAI.
 *
 * O `gpt-4o-mini-tts` aceita `instructions`, um comando de direcao de voz. E por
 * ele que pedimos o sotaque da cidade - o texto ja vem escrito com as girias do
 * lugar, aqui a narracao acompanha o jeito de falar, com os tracos foneticos
 * que vieram do guia regional.
 */
async function audioOpenAI(
  texto: string,
  local: string,
  guia: GuiaRegional,
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
