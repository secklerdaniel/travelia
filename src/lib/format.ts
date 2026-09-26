/**
 * Formatacao de datas no fuso da CIDADE consultada.
 *
 * A OpenWeather manda instantes em epoch UTC e, separado, o offset da cidade
 * em segundos (`timezone`). Somando os dois e lendo com os getters UTC, a data
 * sai na hora local de la - independente do fuso de quem esta olhando a tela.
 */

const doisDigitos = (n: number) => String(n).padStart(2, "0");

/** Ex.: "11/08 06:35" */
export function dataHoraLocal(
  iso: string | number | null | undefined,
  offsetSegundos: number | null | undefined,
): string {
  if (iso === null || iso === undefined) return "--/-- --:--";
  const base = typeof iso === "number" ? iso * 1000 : new Date(iso).getTime();
  if (Number.isNaN(base)) return "--/-- --:--";

  const d = new Date(base + (offsetSegundos ?? 0) * 1000);
  return (
    `${doisDigitos(d.getUTCDate())}/${doisDigitos(d.getUTCMonth() + 1)} ` +
    `${doisDigitos(d.getUTCHours())}:${doisDigitos(d.getUTCMinutes())}`
  );
}

/**
 * Duracao em milissegundos -> texto curto. Ex.: "1h 13min", "47 min".
 *
 * Usado para dizer quando a proxima consulta libera. Um horario absoluto
 * ("libera as 16:40") obrigaria a pessoa a fazer a conta; o tempo restante
 * ela le direto.
 */
export function tempoRestante(ms: number): string {
  const minutos = Math.max(1, Math.ceil(ms / 60_000));
  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`;
}

export type PeriodoDoDia = {
  /** Hora local da cidade, 0-23. */
  hora: number;
  /** "madrugada" | "manha" | "tarde" | "noite" */
  nome: "madrugada" | "manha" | "tarde" | "noite";
  /** Saudacao correspondente em pt-BR. */
  saudacao: string;
};

/**
 * Periodo do dia NA CIDADE consultada.
 *
 * Sem isto a IA cumprimenta com "Bom dia" as onze da noite: o modelo nao tem
 * como saber a hora, e o horario da medicao so existe como epoch no payload.
 */
export function periodoDoDia(
  iso: string | number | null | undefined,
  offsetSegundos: number | null | undefined,
): PeriodoDoDia {
  const base =
    typeof iso === "number" ? iso * 1000 : iso ? new Date(iso).getTime() : NaN;
  const hora = Number.isNaN(base)
    ? 12
    : new Date(base + (offsetSegundos ?? 0) * 1000).getUTCHours();

  if (hora < 5) return { hora, nome: "madrugada", saudacao: "Boa noite" };
  if (hora < 12) return { hora, nome: "manha", saudacao: "Bom dia" };
  if (hora < 18) return { hora, nome: "tarde", saudacao: "Boa tarde" };
  return { hora, nome: "noite", saudacao: "Boa noite" };
}

/** Arredonda para inteiro e adiciona o grau. Ex.: 17.4 -> "17o" */
export function grau(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "--º";
  return `${Math.round(valor)}º`;
}

/**
 * "canela,brasil" -> "Canela, Brasil" (so para mensagens de erro e titulos).
 *
 * A normalizacao de BUSCA nao mora aqui: ela vive em
 * `src/lib/search/normalizeCitySearch.ts`, modulo unico do assunto.
 */
export function humanizarCidade(entrada: string): string {
  return entrada
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(", ");
}
