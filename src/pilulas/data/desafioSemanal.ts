// O DESAFIO DA SEMANA E A PROVA DO MÊS — as perguntas, não a meta da rede.
//
// NÃO CONFUNDIR com data/desafio.ts, que é o Desafio DA REDE: a meta coletiva
// de pílulas que aparece no Ranking. São coisas diferentes com nome parecido,
// e eu já apaguei um com o outro uma vez.
//
// O placar de outubro mostrou o limite do que havia: quem estuda os cinco
// carros ganha 50 pelas pílulas e 150 pelos quizzes, e acabou — do dia 10 em
// diante só resta o teto de 10 pontos por dia de atendimento. O mês inteiro
// sem nada novo pra aprender é o que faz o ranking virar presença.
//
// Daí o desafio: as perguntas já existem (98 distintas nos cinco carros, contra
// 3 que o app usava por carro), e o que faltava era um motivo pra voltar.
//
// DUAS REGRAS QUE NÃO SÃO DETALHE:
//
// 1. As perguntas são IGUAIS para o time inteiro naquela semana. Se cada um
//    sorteasse as suas, um pegaria as fáceis e outro as difíceis, e o prêmio do
//    mês premiaria sorte. A semente é a marca mais o período — todo aparelho
//    chega no mesmo resultado sozinho, sem precisar de servidor.
//
// 2. Uma tentativa por período. O quiz do carro continua de graça, tentando
//    quantas vezes quiser; mas o desafio vale ponto de verdade e é igual pra
//    todos. Se desse pra repetir até acertar, todo mundo tiraria 25 e o placar
//    não separaria ninguém. Quem não passa vê o que errou e em qual carro
//    estudar — a reprovação vira lista de estudo, e volta na semana seguinte.
import { hojeEmBrasilia, mesEmBrasilia } from './diaAtual';
import { poolDaMarca, semente, sortear, type Pergunta } from './perguntas';
import type { BrandId } from './brands';

export const PERGUNTAS_SEMANA = 5;
export const PERGUNTAS_MES = 10;
export const PONTOS_SEMANA = 25;
export const PONTOS_MES = 60;
/** Quantas precisa acertar. Não é tudo: 5 perguntas com nota cheia reprovaria
 *  quem sabe 4 das 5, e o desafio existe pra puxar pra cima, não pra filtrar. */
export const ACERTOS_SEMANA = 4;
export const ACERTOS_MES = 8;

export type TipoDesafio = 'semana' | 'mes';

/**
 * A semana, contada de segunda a domingo, no relógio de Brasília.
 *
 * Não uso `getWeek` de biblioteca nenhuma: o que importa é que o identificador
 * mude na segunda e seja o mesmo pra todo mundo. A âncora é 05/01/2026, uma
 * segunda-feira — a partir dela é só contar de sete em sete.
 */
export function semanaAtual(hoje = hojeEmBrasilia()): string {
  const [a, m, d] = hoje.split('-').map(Number);
  const dias = Math.floor(Date.UTC(a, m - 1, d) / 86400000);
  const ancora = Math.floor(Date.UTC(2026, 0, 5) / 86400000); // segunda-feira
  const n = Math.floor((dias - ancora) / 7);
  return `${a}-S${String(n + 1).padStart(2, '0')}`;
}

export function mesAtual(): string {
  return mesEmBrasilia();
}

export function periodoDe(tipo: TipoDesafio): string {
  return tipo === 'semana' ? semanaAtual() : mesAtual();
}

/** A chave que guarda a tentativa — é ela que fecha o desafio até virar. */
export function chaveDe(tipo: TipoDesafio, periodo = periodoDe(tipo)): string {
  return `${tipo}:${periodo}`;
}

export const pontosDe = (tipo: TipoDesafio): number =>
  (tipo === 'semana' ? PONTOS_SEMANA : PONTOS_MES);
export const quantasDe = (tipo: TipoDesafio): number =>
  (tipo === 'semana' ? PERGUNTAS_SEMANA : PERGUNTAS_MES);
export const minimoDe = (tipo: TipoDesafio): number =>
  (tipo === 'semana' ? ACERTOS_SEMANA : ACERTOS_MES);

/**
 * As perguntas do período — as mesmas para todo mundo da marca.
 *
 * Sorteia do pool inteiro e espalha entre os carros: cinco perguntas do mesmo
 * carro seriam uma segunda rodada do quiz dele, não um desafio da marca. A
 * regra é no máximo duas por carro enquanto houver carro de sobra.
 */
export function perguntasDo(tipo: TipoDesafio, brand: BrandId, role?: string): Pergunta[] {
  const periodo = periodoDe(tipo);
  const rnd = semente(`${brand}|${tipo}|${periodo}`);
  const pool = poolDaMarca(brand, rnd, role);
  if (!pool.length) return [];

  const quantas = quantasDe(tipo);
  const tetoPorCarro = Math.max(2, Math.ceil(quantas / 3));
  // As objeções são a maior parte do pool (39 das 98 na Ramasa), então sem teto
  // o desafio inteiro saía de objeção — cinco paredes de texto e nenhuma
  // pergunta de ficha ou de benefício. Metade é o limite.
  const tetoPorTipo = Math.ceil(quantas / 2);
  const escolhidas: Pergunta[] = [];
  const porCarro: Record<string, number> = {};
  const porTipo: Record<string, number> = {};
  const assuntos = new Set<string>();
  const ordem = sortear(pool, pool.length, rnd);
  // Três passadas, afrouxando: a primeira respeita carro E tipo; a segunda solta
  // o tipo; a terceira solta tudo menos o assunto repetido. Assim uma marca com
  // poucos carros ainda fecha a conta, e o desafio nunca repete a mesma pergunta.
  for (const [limCarro, limTipo] of [[tetoPorCarro, tetoPorTipo], [tetoPorCarro, Infinity], [Infinity, Infinity]] as const) {
    for (const p of ordem) {
      if (escolhidas.length >= quantas) break;
      if (assuntos.has(p.assunto)) continue;
      if ((porCarro[p.produto] || 0) >= limCarro) continue;
      if ((porTipo[p.tipo] || 0) >= limTipo) continue;
      escolhidas.push(p);
      assuntos.add(p.assunto);
      porCarro[p.produto] = (porCarro[p.produto] || 0) + 1;
      porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1;
    }
    if (escolhidas.length >= quantas) break;
  }
  return escolhidas;
}

/** Quantos dias faltam pro desafio da semana virar (domingo é o último). */
export function diasAteVirar(hoje = hojeEmBrasilia()): number {
  const [a, m, d] = hoje.split('-').map(Number);
  const dias = Math.floor(Date.UTC(a, m - 1, d) / 86400000);
  const ancora = Math.floor(Date.UTC(2026, 0, 5) / 86400000);
  return 7 - (((dias - ancora) % 7) + 7) % 7;
}
