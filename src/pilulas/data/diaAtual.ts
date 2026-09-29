// QUE DIA É HOJE, NO APARELHO — um dono só, e que percebe a virada.
//
// Dois defeitos moravam espalhados por aqui, e os dois já chegaram à tela:
//
// 1. O DIA ERA CALCULADO EM UTC. `new Date().toISOString().slice(0,10)` é o dia
//    de Londres: das 21h de Brasília em diante o app já estava no dia seguinte.
//    Quem assistia uma pílula às 20h e voltava às 21h30 encontrava a ofensiva
//    zerada, porque a marca gravada era do dia seguinte e o app procurava a do
//    dia seguinte do dia seguinte.
//
// 2. O DIA ERA LIDO UMA VEZ E CONGELAVA. Isto aqui é PWA: no celular do
//    vendedor a aba fica aberta por dias. O que foi calculado na abertura vale
//    até alguém fechar o app — e foi assim que o Tira-dúvida mandou pra IA a
//    memória montada no dia 25 e não avisou que a conversa era de outro dia.
//
// Aqui o dia tem um dono. Ele é de Brasília, e ele AVISA quando vira — nos
// mesmos ganchos que o main.tsx já usa pra procurar versão nova (voltar pro
// app, ganhar foco, e um relógio de um minuto para quem deixa o app aberto).
import { useSyncExternalStore } from 'react';

export const FUSO = 'America/Sao_Paulo';

/** "2026-09-29" — o dia de Brasília, que é o dia da loja. */
export function hojeEmBrasilia(quando: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(quando);
}

/** "2026-9" — o mês de Brasília, para os placares que zeram na virada. */
export function mesEmBrasilia(quando: Date = new Date()): string {
  const [ano, mes] = hojeEmBrasilia(quando).split('-');
  return `${Number(ano)}-${Number(mes)}`;
}

/** O número do dia (1..31) em Brasília — para as janelas do tipo "até o dia 5". */
export function diaDoMesEmBrasilia(quando: Date = new Date()): number {
  return Number(hojeEmBrasilia(quando).slice(8, 10));
}

let dia = hojeEmBrasilia();
const ouvintes = new Set<() => void>();

function conferir(): void {
  const agora = hojeEmBrasilia();
  if (agora === dia) return;
  dia = agora;
  ouvintes.forEach((f) => f());
}

let ligado = false;

/**
 * Liga a escuta da virada. Chamada uma vez, no arranque.
 *
 * Um minuto de intervalo é barato (uma comparação de string) e é o que faz a
 * virada da meia-noite acontecer para quem está com o app aberto — caso comum
 * no showroom, onde o aparelho fica ligado no balcão.
 */
export function escutarViradaDoDia(): void {
  if (ligado || typeof window === 'undefined') return;
  ligado = true;
  document.addEventListener('visibilitychange', conferir);
  window.addEventListener('focus', conferir);
  setInterval(conferir, 60 * 1000);
}

function assinar(f: () => void): () => void {
  ouvintes.add(f);
  return () => { ouvintes.delete(f); };
}

/**
 * O dia de hoje, que muda sozinho quando vira.
 *
 * Use nas dependências de todo useEffect/useMemo que calcula prazo, validade
 * ou "assistiu hoje": é isso que faz a tela se refazer na virada em vez de
 * repetir o dia em que foi aberta.
 */
export function useDiaAtual(): string {
  return useSyncExternalStore(assinar, () => dia, () => dia);
}
