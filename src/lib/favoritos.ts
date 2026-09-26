"use client";

import type { Recomendacao } from "@/config/experiencias";

/**
 * Favoritos do usuario, guardados no proprio navegador.
 *
 * Ficam no `localStorage` de proposito: sao a lista pessoal de quem esta
 * planejando a viagem, nao dado de negocio. Guardar no servidor exigiria login
 * - e o app nao tem - ou uma tabela sem dono, onde o favorito de um apareceria
 * para todos.
 *
 * Preco disso: some ao limpar o navegador e nao acompanha entre aparelhos.
 * E a troca certa enquanto nao existe conta de usuario.
 */

const CHAVE = "travelia_favoritos";

export type Favorito = Recomendacao & {
  cidade: string;
  salvoEm: string;
};

/** Identidade de um favorito: mesmo lugar na mesma cidade e o mesmo item. */
export function idFavorito(nome: string, cidade: string): string {
  return `${nome}::${cidade}`.toLowerCase();
}

export function lerFavoritos(): Favorito[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const lista = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? (lista as Favorito[]) : [];
  } catch {
    // json corrompido por edicao manual: comeca de novo em vez de quebrar
    return [];
  }
}

function gravar(lista: Favorito[]): Favorito[] {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    /* cota cheia ou modo privado: o favorito nao persiste, mas nada quebra */
  }
  return lista;
}

/** Adiciona se nao existe, remove se ja existe. Devolve a lista nova. */
export function alternarFavorito(
  item: Recomendacao,
  cidade: string,
): Favorito[] {
  const lista = lerFavoritos();
  const id = idFavorito(item.nome, cidade);
  const existente = lista.findIndex((f) => idFavorito(f.nome, f.cidade) === id);

  if (existente >= 0) {
    return gravar(lista.filter((_, i) => i !== existente));
  }
  return gravar([{ ...item, cidade, salvoEm: new Date().toISOString() }, ...lista]);
}

export function removerFavorito(nome: string, cidade: string): Favorito[] {
  const id = idFavorito(nome, cidade);
  return gravar(lerFavoritos().filter((f) => idFavorito(f.nome, f.cidade) !== id));
}

export function ehFavorito(
  lista: Favorito[],
  nome: string,
  cidade: string,
): boolean {
  const id = idFavorito(nome, cidade);
  return lista.some((f) => idFavorito(f.nome, f.cidade) === id);
}
