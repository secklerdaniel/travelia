"use client";

/**
 * Cidade de origem do visitante, guardada no navegador.
 *
 * Perguntada uma vez e reaproveitada nas consultas seguintes: pedir permissao
 * de localizacao a cada busca seria intrusivo, e a cidade de onde a pessoa
 * consulta nao muda entre uma pergunta e outra.
 *
 * Tambem guardamos a RECUSA - sem isso o banner voltaria a aparecer para quem
 * ja disse nao.
 */

const CHAVE = "travelia_origem";
const CHAVE_RECUSA = "travelia_origem_recusada";

export type Origem = {
  cidade: string;
  uf: string | null;
  pais: string | null;
  lat: number;
  lon: number;
};

export function lerOrigem(): Origem | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Origem) : null;
  } catch {
    return null;
  }
}

export function gravarOrigem(origem: Origem): void {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(origem));
    window.localStorage.removeItem(CHAVE_RECUSA);
  } catch {
    /* modo privado ou cota cheia: segue sem guardar */
  }
}

export function recusou(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CHAVE_RECUSA) === "1";
}

export function marcarRecusa(): void {
  try {
    window.localStorage.setItem(CHAVE_RECUSA, "1");
  } catch {
    /* ignora */
  }
}

/**
 * Pede a posicao ao navegador e resolve a cidade no servidor.
 *
 * Devolve `null` em qualquer negativa - permissao recusada, GPS indisponivel,
 * tempo esgotado. Nenhum desses casos e erro: a localizacao e opcional.
 */
export async function pedirOrigem(): Promise<Origem | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  const posicao = await new Promise<GeolocationPosition | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      () => resolve(null),
      { timeout: 12_000, maximumAge: 600_000, enableHighAccuracy: false },
    );
  });

  if (!posicao) return null;

  try {
    const r = await fetch("/api/origem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: posicao.coords.latitude,
        lon: posicao.coords.longitude,
      }),
    });
    if (!r.ok) return null;

    const { origem } = (await r.json()) as { origem: Origem };
    gravarOrigem(origem);
    return origem;
  } catch {
    return null;
  }
}
