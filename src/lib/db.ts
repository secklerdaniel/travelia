import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Conexao com o Neon.
 *
 * Driver HTTP: funciona no runtime edge (a rota do story roda la) sem pool
 * para gerenciar, e cada query e uma requisicao. Nao serve para transacao -
 * nenhuma query deste app precisa de uma.
 *
 * Inicializacao preguicosa porque a variavel nao existe no momento do build.
 */
let conexao: NeonQueryFunction<false, false> | null = null;

export function db(): NeonQueryFunction<false, false> {
  if (conexao) return conexao;

  const url = process.env.NEON_DATABASE_URL;
  if (!url) throw new Error("NEON_DATABASE_URL nao configurada no .env.local");

  conexao = neon(url);
  return conexao;
}
