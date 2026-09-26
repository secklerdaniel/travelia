import { db } from "./db";

/**
 * Registro do historico de consultas.
 *
 * Enquanto `clima_cidades` guarda o estado atual de cada cidade, aqui fica uma
 * linha por busca, nunca sobrescrita - e o que vira inteligencia de dados para
 * secretarias de turismo.
 *
 * A gravacao NUNCA pode derrubar a resposta ao usuario: se o Supabase estiver
 * fora, a pessoa tem que receber a previsao mesmo assim e perdemos apenas a
 * estatistica. Por isso todo erro aqui e engolido e apenas registrado no log.
 */

export type ConsultaRegistrada = {
  tipo: "clima" | "roteiro";
  visitante: string | null;

  cidade: string;
  uf?: string | null;
  pais?: string | null;
  lat?: number | null;
  lon?: number | null;
  cityQuery?: string | null;
  /** O que a pessoa digitou, antes de normalizar. */
  termoDigitado?: string | null;

  /** De onde a pessoa consulta. Opcional: so existe se ela autorizou. */
  origemCidade?: string | null;
  origemUf?: string | null;
  origemPais?: string | null;
  origemLat?: number | null;
  origemLon?: number | null;

  // contexto do roteiro
  experiencia?: string | null;
  pilar?: string | null;
  companhia?: string | null;
  pessoas?: number | null;
  verba?: number | null;

  // condicao do tempo
  condicaoId?: number | null;
  condicaoDescricao?: string | null;
  temp?: number | null;

  modelo?: string | null;
  prompt?: string | null;
  resposta?: unknown;

  sucesso?: boolean;
  erro?: string | null;
  duracaoMs?: number | null;
};

export async function registrarConsulta(c: ConsultaRegistrada): Promise<void> {
  try {
    await db().query(
      `insert into clima_consultas (
         tipo, visitante, cidade, uf, pais, lat, lon, city_query, termo_digitado,
         origem_cidade, origem_uf, origem_pais, origem_lat, origem_lon,
         experiencia, pilar, companhia, pessoas, verba,
         condicao_id, condicao_descricao, temp,
         modelo, prompt, resposta, sucesso, erro, duracao_ms
       ) values (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
         $15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25::jsonb,$26,$27,$28
       )`,
      [
        c.tipo,
        c.visitante,
        c.cidade,
        c.uf ?? null,
        c.pais ?? null,
        c.lat ?? null,
        c.lon ?? null,
        c.cityQuery ?? null,
        c.termoDigitado ?? null,
        c.origemCidade ?? null,
        c.origemUf ?? null,
        c.origemPais ?? null,
        c.origemLat ?? null,
        c.origemLon ?? null,
        c.experiencia ?? null,
        c.pilar ?? null,
        c.companhia ?? null,
        c.pessoas ?? null,
        c.verba ?? null,
        c.condicaoId ?? null,
        c.condicaoDescricao ?? null,
        c.temp ?? null,
        c.modelo ?? null,
        c.prompt ?? null,
        c.resposta === undefined || c.resposta === null
          ? null
          : JSON.stringify(c.resposta),
        c.sucesso ?? true,
        c.erro ?? null,
        c.duracaoMs ?? null,
      ],
    );
  } catch (e) {
    console.error("[consultas] falha ao registrar:", e);
  }
}
