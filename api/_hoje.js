// QUE DIA É HOJE — um lugar só, para todas as portas de IA.
//
// Um modelo não tem relógio. Sem esta linha ele responde pela memória de
// treino, que é de outro ano: lê "válida de 03/09 a 02/10" e não sabe dizer se
// vale agora, lê "1ª quinzena" e não sabe se já acabou.
//
// Vive fora do _coach.js porque o coach carrega o método inteiro junto, e
// endpoints pequenos (proxy, análise de mensagem) só precisam da data.
export const FUSO = 'America/Sao_Paulo';

/** "terça-feira, 29 de setembro de 2026", sempre no horário de Brasília. */
export function hojeNoBrasil(quando = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }).format(quando);
}

/**
 * "dd/mm" em Brasília, a partir de um carimbo de tempo. Devolve vazio quando o
 * carimbo não existe ou não é número — conversa gravada antes de existir
 * carimbo entra sem marca, e isso é melhor que entrar com marca errada.
 */
export function diaCurto(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return '';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit' }).format(new Date(n));
}

/** A frase pronta, para o endpoint que só precisa avisar o dia. */
export function linhaDeHoje() {
  return `Hoje é ${hojeNoBrasil()} (horário de Brasília). Use ESTA data para qualquer conta de prazo, validade, quinzena ou "ontem/amanhã" — nunca a sua memória de treino, e nunca chute o ano.`;
}
