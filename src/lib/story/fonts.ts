/**
 * Fontes para a imagem de story.
 *
 * O satori (motor do `next/og`) nao enxerga as fontes que o `next/font` injeta
 * no CSS - ele precisa dos bytes do arquivo. Buscamos do Google Fonts uma vez
 * por processo e guardamos em memoria.
 *
 * O User-Agent antigo e proposital: com o UA moderno o Google devolve woff2,
 * que o satori nao le. Com este, devolve woff.
 */

const UA_LEGADO =
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/9.0.0.0 Safari/537.36";

const FAMILIA = "Outfit";
const PESOS = [200, 500, 700] as const;

export type FonteStory = {
  name: string;
  data: ArrayBuffer;
  weight: (typeof PESOS)[number];
  style: "normal";
};

let cache: Promise<FonteStory[]> | null = null;

async function baixar(): Promise<FonteStory[]> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${FAMILIA}:wght@${PESOS.join(";")}`,
    { headers: { "User-Agent": UA_LEGADO } },
  ).then((r) => r.text());

  // cada @font-face traz o peso e a url do arquivo; casamos os dois por bloco
  const blocos = css.split("@font-face").slice(1);
  const encontrados = new Map<number, string>();

  for (const bloco of blocos) {
    const peso = Number(bloco.match(/font-weight:\s*(\d+)/)?.[1]);
    const url = bloco.match(/src:\s*url\((https:[^)]+)\)/)?.[1];
    if (peso && url && !encontrados.has(peso)) encontrados.set(peso, url);
  }

  const fontes = await Promise.all(
    PESOS.map(async (peso) => {
      const url = encontrados.get(peso);
      if (!url) throw new Error(`Fonte ${FAMILIA} ${peso} nao encontrada no CSS.`);
      return {
        name: FAMILIA,
        data: await fetch(url).then((r) => r.arrayBuffer()),
        weight: peso,
        style: "normal" as const,
      };
    }),
  );

  return fontes;
}

export function carregarFontes(): Promise<FonteStory[]> {
  // se a busca falhar, limpa o cache para a proxima chamada tentar de novo
  cache ??= baixar().catch((e) => {
    cache = null;
    throw e;
  });
  return cache;
}
