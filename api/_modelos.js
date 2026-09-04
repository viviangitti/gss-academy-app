// OS MODELOS DO GEMINI — pinados, e num lugar só.
//
// POR QUE PINADO: os apelidos terminados em "-latest" (gemini-flash-latest,
// gemini-flash-lite-latest) NÃO são um modelo. São um ponteiro que o Google
// move quando quer, e quando ele move — ou quando aquela geração fica
// congestionada — todo mundo que aponta pra lá cai junto. Já aconteceu duas
// vezes aqui.
//
// Medido em 04/09/2026, com a chave do Eleva:
//
//   gemini-flash-lite-latest   1 de 5 · e a que passou levou 124 SEGUNDOS
//   gemini-flash-latest        5 de 5 · ~7s
//   gemini-2.5-flash-lite      4 de 4 · ~0,4s
//   gemini-2.5-flash           4 de 4 · ~0,5s
//
// POR QUE NUM LUGAR SÓ: o apelido quebrado estava escrito em oito arquivos
// diferentes. Um ponteiro ruim derrubava a IA de vendas, o coach e o
// role-play ao mesmo tempo, e o conserto era caçar oito lugares.
//
// REGRA: não trocar de versão por novidade. Só troque quando ESTE modelo
// parar de responder, e medindo antes — não porque saiu um número maior.

/** O que responde a pergunta. Rápido e barato, é o que roda o dia todo. */
export const MODELO_RAPIDO = 'gemini-2.5-flash-lite';

/** A reserva, quando o rápido engasga. Mesma geração, de propósito. */
export const MODELO_RESERVA = 'gemini-2.5-flash';

/** A fila, na ordem em que é tentada. */
export const MODELOS = [MODELO_RAPIDO, MODELO_RESERVA];
