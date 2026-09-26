import { db } from "./db";

/**
 * Percepcao termica local: como o tempo de agora se compara ao dos dias
 * anteriores NA MESMA CIDADE.
 *
 * O numero absoluto engana. Vinte e dois graus e manha amena em Gramado e
 * friagem em Fortaleza, e nenhuma lista de girias resolve isso - quem entrega
 * a reacao certa e a mudanca: "ontem eu tava de bermuda".
 *
 * A fonte e o proprio historico do app (`clima_consultas`), que ja guarda a
 * temperatura de cada consulta. Sem API nova, sem chave, sem cache para
 * invalidar - e o mesmo dado que vira relatorio para a secretaria.
 *
 * Nunca lanca: sem historico suficiente devolve `null` e a previsao sai como
 * antes. E enriquecimento, nao requisito.
 */

/** Diferenca minima para valer a pena comentar, em graus. */
const DIFERENCA_NOTAVEL = 3;

/**
 * Janelas de comparacao, em horas atras.
 *
 * Ancoradas em multiplos de 24 para cair na MESMA FAIXA DE HORARIO dos dias
 * anteriores: comparar a manha de hoje com a tarde de ontem produziria uma
 * queda de temperatura que so existe no relogio.
 *
 * Vao ate cinco dias porque o gargalo nao e a idade do dado, e a chance de
 * existir alguma leitura na faixa certa - numa cidade consultada uma vez por
 * semana, exigir "ontem" significa nunca comparar. Os vaos entre as janelas
 * sao intencionais: leitura fora deles e de outro horario do dia.
 */
const JANELAS: Array<[number, number]> = [
  [20, 28],
  [44, 52],
  [68, 76],
  [92, 100],
  [116, 124],
];

/** Quanto o app olha para tras; cobre a ultima janela com folga. */
const HORAS_DE_HISTORICO = 126;

type Leitura = { temp: number; horasAtras: number };

function dentroDeJanela(horas: number): boolean {
  return JANELAS.some(([ini, fim]) => horas >= ini && horas <= fim);
}

/**
 * Frase da comparacao, em ordem direta.
 *
 * O sentido vem depois do sujeito e em caixa alta ("hoje esta 4 graus MAIS
 * QUENTE"): na primeira versao o numero vinha antes e o sentido entre
 * parenteses, e o modelo trocou aquecimento por friagem no texto final.
 */
function comoSente(delta: number): string {
  return delta > 0 ? "MAIS QUENTE" : "MAIS FRIO";
}

/**
 * Linha de comparacao para o boletim, ou `null` quando nao ha o que dizer.
 *
 * Entra como DADO na mensagem do usuario, junto de umidade e vento - nao como
 * instrucao. A regra de como reagir vive no prompt, que e editavel no painel.
 */
export async function variacaoRecente(
  cityQuery: string,
  tempAtual: number | null | undefined,
): Promise<string | null> {
  if (typeof tempAtual !== "number" || !cityQuery) return null;

  try {
    const agora = Date.now();
    const desde = new Date(
      agora - HORAS_DE_HISTORICO * 60 * 60 * 1000,
    ).toISOString();
    // As ultimas horas ficam de fora: com a trava de 2 horas, a consulta mais
    // recente e praticamente a mesma medicao - comparar daria sempre zero.
    const ate = new Date(agora - 3 * 60 * 60 * 1000).toISOString();

    const linhas = (await db().query(
      `select temp, criado_em from clima_consultas
        where tipo = 'clima' and city_query = $1 and temp is not null
          and criado_em >= $2 and criado_em <= $3
        order by criado_em desc limit 200`,
      [cityQuery, desde, ate],
    )) as { temp: string | number; criado_em: string | Date }[];

    const leituras: Leitura[] = linhas
      .map((l) => ({
        temp: Number(l.temp),
        horasAtras: (agora - new Date(l.criado_em).getTime()) / 3_600_000,
      }))
      .filter((l) => Number.isFinite(l.temp) && dentroDeJanela(l.horasAtras));

    if (leituras.length === 0) return null;

    // Ontem na mesma hora e a comparacao que a pessoa realmente faz.
    const ontem = leituras
      .filter((l) => l.horasAtras <= 28)
      .sort((a, b) => Math.abs(a.horasAtras - 24) - Math.abs(b.horasAtras - 24))[0];

    if (ontem) {
      const delta = tempAtual - ontem.temp;
      if (Math.abs(delta) < DIFERENCA_NOTAVEL) return null;
      return (
        `Ontem nesta mesma hora fazia ${ontem.temp.toFixed(0)}C. ` +
        `Hoje esta ${Math.abs(delta).toFixed(0)} graus ${comoSente(delta)} que ontem.`
      );
    }

    // Sem leitura de ontem, a media dos dias anteriores ainda diz se o dia
    // fugiu do padrao recente da cidade.
    const media =
      leituras.reduce((soma, l) => soma + l.temp, 0) / leituras.length;
    const delta = tempAtual - media;
    if (Math.abs(delta) < DIFERENCA_NOTAVEL) return null;

    return (
      `Nos ultimos dias, nesta faixa de horario, a cidade vinha marcando ` +
      `${media.toFixed(0)}C. Hoje esta ${Math.abs(delta).toFixed(0)} graus ` +
      `${comoSente(delta)} que esses dias.`
    );
  } catch (e) {
    console.error("[percepcao] sem comparacao com os dias anteriores:", e);
    return null;
  }
}
