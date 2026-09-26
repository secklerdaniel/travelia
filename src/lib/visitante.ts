import { cookies } from "next/headers";

/**
 * Identificador anonimo do navegador.
 *
 * Nao ha login nem dado pessoal: e um UUID sorteado na primeira visita e
 * guardado em cookie. Serve para uma pergunta que o dashboard precisa
 * responder e o total de consultas nao responde - "50 buscas por Gramado"
 * pode ser 50 pessoas interessadas ou uma pessoa indecisa, e as duas coisas
 * significam o oposto para uma secretaria de turismo.
 *
 * Gerado no SERVIDOR de proposito: nao depende de JavaScript no cliente, nao
 * pode ser lido nem forjado por script da pagina (`httpOnly`), e ja chega
 * pronto na primeira requisicao.
 *
 * Limites honestos: some se a pessoa limpar os cookies, e conta duas vezes
 * quem usa dois aparelhos. E uma aproximacao, nao um censo.
 */

const COOKIE = "travelia_visitante";
const UM_ANO = 60 * 60 * 24 * 365;

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * UUID do visitante, criando e gravando o cookie se ainda nao existir.
 *
 * Deve ser chamada de Route Handler ou Server Action - so ali o Next permite
 * escrever cookies.
 */
export async function obterVisitante(): Promise<string> {
  const armazenamento = await cookies();
  const atual = armazenamento.get(COOKIE)?.value;

  // valida o formato: cookie adulterado vira um id novo em vez de sujar a base
  if (atual && UUID_V4.test(atual)) return atual;

  const novo = crypto.randomUUID();
  armazenamento.set(COOKIE, novo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: UM_ANO,
  });

  return novo;
}
