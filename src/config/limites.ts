/**
 * Limites de uso do app.
 *
 * Cada previsao dispara uma chamada de texto e uma de audio na OpenAI. Sem
 * trava, clicar "Atualizar" varias vezes queima credito sem entregar nada novo:
 * a temperatura mal muda em minutos e a analise sai praticamente igual.
 */

/**
 * Intervalo minimo entre consultas completas da mesma cidade, em horas.
 *
 * Cada consulta refaz tudo: clima, analise e audio. Duas horas e o intervalo
 * em que a previsao realmente muda - abaixo disso o usuario pagaria uma
 * chamada de IA para receber praticamente o mesmo texto.
 *
 * Use 0 para desligar a trava (testes, ambiente local).
 */
export const HORAS_ENTRE_CONSULTAS = 2;

/**
 * Mostrar o botao de deletar no card.
 *
 * Escondido enquanto nao existe nocao de usuario: a lista e global, entao
 * deletar apaga a linha do banco e o mp3 do Storage para todo mundo que abrir
 * o app - nao so para quem clicou.
 *
 * A rota `DELETE /api/clima` continua funcionando; e so a interface que nao
 * oferece o botao.
 */
export const MOSTRAR_BOTAO_DELETAR = true;

/**
 * Ancorar as recomendacoes numa lista real do OpenStreetMap.
 *
 * Ligado, a IA so escolhe entre lugares que existem e o app preenche endereco
 * e telefone a partir do registro - contato garantido, mas as escolhas ficam
 * limitadas ao que o OSM tem catalogado, que no Brasil costuma privilegiar
 * pontos obscuros em vez dos famosos.
 *
 * Desligado (padrao), a IA sugere de conhecimento proprio. Com um modelo
 * grande isso traz os lugares que a pessoa realmente quer ver.
 */
export const ANCORAR_EM_BASE_REAL = false;

/**
 * Cidade unica do app.
 *
 * Com um valor aqui, o campo de busca some da tela e tudo - previsao e roteiro
 * - fica fixo nesta cidade. `null` devolve a busca e volta a mostrar todas as
 * cidades salvas.
 *
 * As rotas e o autocomplete continuam funcionando para qualquer cidade: e so a
 * interface que para de oferecer a escolha.
 */
// O `as string | null` impede o TypeScript de estreitar a constante para o tipo
// literal do valor: sem ele, com `null` aqui, todo `if (CIDADE_FIXA)` do
// projeto viraria codigo morto aos olhos do compilador.
export const CIDADE_FIXA = null as string | null;

/** Nome da cidade fixa sem o estado, para comparar com o que vem do banco. */
export const NOME_CIDADE_FIXA = CIDADE_FIXA?.split(",")[0]?.trim() ?? null;
