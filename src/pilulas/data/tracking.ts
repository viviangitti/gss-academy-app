// Rastreamento de "quem vê mais" — base da competição.
// localStorage é a verdade do app (offline, instantâneo); statsSync manda uma
// cópia agregada pro Firestore pra alimentar o Sistema de Gestão.
import { hojeEmBrasilia, mesEmBrasilia } from './diaAtual';
import { syncStats, type ElevaEventType } from './statsSync';
import { valorDoEvento } from './valores';
import { avisarCarimbo } from './carimbo';

// Progresso é POR CONTA, não por aparelho. Antes havia uma chave só: quem
// entrasse depois no mesmo celular herdava as pílulas, os pontos e a ofensiva
// de quem tinha usado antes — uma conta nova já abria com tudo "feito".
const KEY_LEGADO = 'wp_stats_v1';
const KEY_DONO = 'wp_stats_dono';
let conta: string | null = null;

function KEY(): string {
  return conta ? `wp_stats_v1:${conta}` : 'wp_stats_v1:anon';
}

// Chamado assim que o app sabe quem está logado (ver AuthContext).
export function setStatsAccount(id: string | null): void {
  const novo = id ? id.trim().toLowerCase() : null;
  if (novo === conta) return;
  conta = novo;
  if (!novo) return;
  try {
    // Migração de uma vez só: o progresso que já estava neste aparelho pertence
    // à PRIMEIRA conta que entrar depois desta mudança. Da segunda em diante,
    // cada conta começa do zero — que é o certo.
    const dono = localStorage.getItem(KEY_DONO);
    if (!dono) {
      localStorage.setItem(KEY_DONO, novo);
      const legado = localStorage.getItem(KEY_LEGADO);
      if (legado && !localStorage.getItem(KEY())) localStorage.setItem(KEY(), legado);
    }
  } catch { /* modo anônimo / storage cheio */ }
}
export const POINTS_PER_PILL = 10;
export const POINTS_PER_QUIZ = 30;
export const WEEKLY_GOAL = 10; // pílulas/semana

/**
 * O TRABALHO PONTUA — com teto por dia.
 *
 * Consultar objeção, copiar o script da jornada, abrir o documento e mandar o
 * one-page não valiam nada. O placar media só estudo, e estudo satura: quem
 * viu tudo em setembro não tinha como pontuar em outubro a não ser
 * reassistindo o que já sabia.
 *
 * O teto é o que impede isto de virar alvo. Sem ele, quem atende mal e
 * consulta vinte vezes passa na frente de quem estudou e já sabe responder —
 * exatamente o incentivo invertido que a regra antiga queria evitar quando
 * decidiu não pontuar nada.
 */
export const POINTS_PER_WORK = 2;
export const WORK_DAILY_CAP = 10;

/** As ações que contam como trabalho (as outras só servem para medir uso). */
const TRABALHO = new Set<ElevaEventType>([
  'objecao', 'onepage', 'doc_open', 'acessorio', 'jornada_script', 'jornada_onepage',
]);

export interface Stats {
  week: string; // id da semana vigente
  weekViews: number; // pílulas assistidas no MÊS (o nome é herança; o período é weekId, que é mensal)
  weekPoints: number; // pontos na semana
  weekMissions: number; // missões de conteúdo concluídas na semana
  totalViews: number; // histórico total
  totalMissions: number; // posts de creator no total (cumulativo — base dos níveis)
  streak: number; // dias seguidos abrindo o app
  lastDay: string | null; // AAAA-MM-DD da última visualização
  perProduct: Record<string, number>;
  perMission: Record<string, number>; // missões já concluídas (não repontuam)
  /**
   * Produtos dominados no quiz. O VALOR é o carimbo do conteúdo na hora do
   * acerto (`conteudoEm` do produto, ou 1 para os registros antigos): quando a
   * marca atualiza a ficha, o quiz daquele carro volta a valer. É assim que o
   * placar renova sem fábrica de quiz — quem renova é a carta do mês.
   */
  perQuiz: Record<string, number | string>;
  /** Pontos de trabalho ganhos hoje, para respeitar o teto diário. */
  trabalhoDia?: { dia: string; pontos: number };
  /**
   * OS VALORES PRATICADOS NO MÊS (só Ramasa — ver data/valores.ts).
   *
   * Conta VEZES, não pontos: cada ação que carimba um valor soma 1. Não criei
   * uma moeda nova de propósito — o app já tem pontos, e inventar uma segunda
   * economia para a cultura faria as duas competirem na cabeça de quem vende.
   */
  perValor?: Record<string, number>;
  /**
   * OS DESAFIOS JÁ TENTADOS, por período ("semana:2026-S40", "mes:2026-10").
   *
   * Guarda a tentativa mesmo quando a pessoa não passa — é isso que fecha o
   * desafio até virar o período. Sem registrar a reprovação, bastaria sair e
   * voltar pra ter a prova de novo, e aí o desafio deixaria de medir preparo.
   */
  desafios?: Record<string, { acertos: number; de: number; passou: boolean }>;
}

// O DIA É O DE BRASÍLIA, NÃO O DE LONDRES.
//
// Isto aqui era `toISOString().slice(0,10)`, que é UTC: das 21h em diante o app
// já estava no dia seguinte. Quem assistia uma pílula às 20h e voltava às 21h30
// via a ofensiva zerada — a marca tinha sido gravada no dia de amanhã.
function today(): string {
  return hojeEmBrasilia();
}

function weekId(d = new Date()): string {
  // Período do ranking = MÊS (os campos week* guardam o placar do mês vigente).
  return mesEmBrasilia(d);
}

function fresh(): Stats {
  return {
    week: weekId(),
    weekViews: 0,
    weekPoints: 0,
    weekMissions: 0,
    totalViews: 0,
    totalMissions: 0,
    streak: 0,
    lastDay: null,
    perProduct: {},
    perMission: {},
    perQuiz: {},
    perValor: {},
    desafios: {},
  };
}

export function getStats(): Stats {
  try {
    const raw = localStorage.getItem(KEY());
    if (!raw) return fresh();
    const s = JSON.parse(raw) as Stats;
    // virou a semana? zera o placar semanal, mantém histórico e ofensiva
    if (s.week !== weekId()) {
      s.week = weekId();
      s.weekViews = 0;
      s.weekPoints = 0;
      s.weekMissions = 0;
      s.perMission = {};
      // os valores são do MÊS: viraram o mês, recomeçam do zero
      s.perValor = {};
    }
    return { ...fresh(), ...s };
  } catch {
    return fresh();
  }
}

function save(s: Stats) {
  try {
    localStorage.setItem(KEY(), JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

// Registra uma pílula assistida. Conta 1x por produto por dia (evita farm de pontos).
export function recordView(productId: string): Stats {
  const s = getStats();
  const day = today();

  // ofensiva (streak)
  if (s.lastDay !== day) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    s.streak = s.lastDay === yesterday ? s.streak + 1 : 1;
  }

  // PONTUA UMA VEZ POR CARRO, NÃO UMA VEZ POR DIA.
  //
  // A regra antiga dava 10 pontos toda vez que a pessoa reabria o mesmo carro
  // num dia novo. Com dez carros, dava para fazer 100 pontos por dia sem
  // aprender nada — e, do segundo mês em diante, era o único jeito de pontuar,
  // porque o quiz só valia uma vez na vida. O placar media repetição.
  //
  // A abertura continua sendo registrada todo dia (é ela que alimenta a
  // ofensiva, a missão do mês e o "já viu"); o que não se repete é o PONTO.
  const dayKey = `${productId}@${day}`;
  const jaPontuou = Object.keys(s.perProduct).some((k) => k === productId || k.startsWith(`${productId}@`));
  let isNew = false;
  if (!s.perProduct[dayKey]) {
    s.perProduct[dayKey] = 1;
    s.weekViews += 1;
    s.totalViews += 1;
    if (!jaPontuou) s.weekPoints += POINTS_PER_PILL;
    isNew = true;
  }

  s.lastDay = day;
  save(s);
  if (isNew) {
    // O carimbo do valor acompanha o PONTO, não a abertura da tela: quem
    // reabre o mesmo carro no mesmo dia não pratica "melhoria contínua" de novo.
    carimbarEvento('pill_view');
    syncStats(s, { type: 'pill_view', id: productId, points: jaPontuou ? 0 : POINTS_PER_PILL });
  }
  return s;
}

// Ações que NÃO valem ponto: só servem pra saber o que o time usa de verdade.
//
// Ficam fora do placar de propósito. Assistir ao vídeo, abrir um documento ou
// mandar o one-page são o trabalho acontecendo — se pontuassem, viraria alvo,
// e o número deixaria de medir o que a gente quer medir.
const KEY_USO = 'wp_uso_dia';

/**
 * Conta uma vez por dia por item. O vendedor que abre a mesma objeção cinco
 * vezes com cinco clientes é a mesma informação repetida cinco vezes — e cada
 * repetição custaria uma escrita no Firestore e uma linha no relatório.
 */
function primeiraVezHoje(chave: string): boolean {
  const dia = today();
  try {
    const bruto = localStorage.getItem(KEY_USO);
    const guardado = bruto ? (JSON.parse(bruto) as { dia: string; feitos: string[] }) : null;
    const feitos = new Set(guardado?.dia === dia ? guardado.feitos : []);
    if (feitos.has(chave)) return false;
    feitos.add(chave);
    localStorage.setItem(KEY_USO, JSON.stringify({ dia, feitos: [...feitos] }));
    return true;
  } catch {
    return true; // sem storage (modo anônimo): registra e segue
  }
}

export function registraUso(type: ElevaEventType, id: string): void {
  if (!primeiraVezHoje(`${type}:${id}`)) return;
  carimbarEvento(type);

  // O TRABALHO PONTUA ATÉ O TETO DO DIA.
  //
  // Ficava tudo em zero de propósito — "se pontuasse, viraria alvo". A razão
  // era boa e continua valendo: por isso o teto. Até ele, o placar reconhece
  // quem está atendendo; passado ele, consultar mais não rende mais nada, e
  // quem atende mal não ultrapassa quem estudou.
  const s = getStats();
  let pontos = 0;
  if (TRABALHO.has(type)) {
    const hoje = today();
    const dia = s.trabalhoDia?.dia === hoje ? s.trabalhoDia : { dia: hoje, pontos: 0 };
    const cabe = Math.max(0, WORK_DAILY_CAP - dia.pontos);
    pontos = Math.min(POINTS_PER_WORK, cabe);
    if (pontos) {
      dia.pontos += pontos;
      s.trabalhoDia = dia;
      s.weekPoints += pontos;
      save(s);
    }
  }
  syncStats(s, { type, id, points: pontos });
}

/**
 * CARIMBA O VALOR DA AÇÃO (só Ramasa — ver data/valores.ts).
 *
 * Guarda a contagem do mês e avisa a tela, que mostra o selo por três
 * segundos. O carimbo é por AÇÃO, não por dia: quem estuda três carros pratica
 * "melhoria contínua" três vezes, e é isso que o Painel soma.
 */
export function carimbarValor(valorId: string): void {
  const s = getStats();
  s.perValor = { ...(s.perValor || {}), [valorId]: (s.perValor?.[valorId] || 0) + 1 };
  save(s);
  avisarCarimbo(valorId);
}

/** O mesmo carimbo, a partir do tipo de evento que o app já registra. */
export function carimbarEvento(type: ElevaEventType): void {
  const v = valorDoEvento(type);
  if (v) carimbarValor(v.id);
}

// Registra uma missão de creator concluída ("postei"). Pontua 1x por missão.
export function recordMission(missionId: string, points: number): Stats {
  const s = getStats();
  const day = today();

  if (s.lastDay !== day) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    s.streak = s.lastDay === yesterday ? s.streak + 1 : 1;
  }

  let isNew = false;
  if (!s.perMission[missionId]) {
    s.perMission[missionId] = 1;
    s.weekMissions += 1;
    s.totalMissions = (s.totalMissions || 0) + 1;
    s.weekPoints += points;
    isNew = true;
  }

  s.lastDay = day;
  save(s);
  if (isNew) syncStats(s, { type: 'mission_done', id: missionId, points });
  return s;
}

export function isMissionDone(missionId: string): boolean {
  return !!getStats().perMission[missionId];
}

// Quiz da pílula: acertou tudo = "domina o produto". Pontua 1x por produto (permanente).
export function recordQuizPass(productId: string, conteudoEm?: string): Stats {
  const s = getStats();
  // O CARIMBO DO CONTEÚDO.
  //
  // O quiz valia uma vez na vida: do segundo mês em diante não havia como
  // pontuar nele, e o placar sobrava para a pílula reassistida. Agora o acerto
  // guarda QUAL versão do conteúdo foi acertada. Quando a marca atualiza a
  // ficha — carta nova, versão nova, número corrigido —, o quiz daquele carro
  // volta a valer. Quem renova o placar é a carta do mês, não uma fábrica de
  // quiz. Sem `conteudoEm`, o comportamento é o de antes: pontua uma vez.
  const carimbo = conteudoEm || 1;
  let isNew = false;
  if (s.perQuiz[productId] !== carimbo) {
    s.perQuiz[productId] = carimbo;
    s.weekPoints += POINTS_PER_QUIZ;
    isNew = true;
  }
  save(s);
  if (isNew) {
    carimbarEvento('quiz_pass');
    syncStats(s, { type: 'quiz_pass', id: productId, points: POINTS_PER_QUIZ });
  }
  return s;
}

/**
 * Já dominou ESTA versão do conteúdo?
 *
 * Com `conteudoEm`, um quiz acertado na ficha antiga volta a aparecer como
 * pendente quando a marca publica a nova — é o mesmo carro, mas não é mais o
 * mesmo conteúdo.
 */
export function isQuizDone(productId: string, conteudoEm?: string): boolean {
  const feito = getStats().perQuiz[productId];
  if (!feito) return false;
  return feito === (conteudoEm || 1);
}

/**
 * JÁ PASSOU ALGUMA VEZ NESTE QUIZ? — para DESTRANCAR, não para pontuar.
 *
 * `isQuizDone` responde "acertou a versão de agora?", e é a pergunta certa para
 * o ponto: conteúdo novo, ponto novo. Mas ela é a pergunta ERRADA para o
 * cadeado dos níveis 2, 3 e 4.
 *
 * Quando o Jaecoo 5 foi carimbado, as duas coisas andavam juntas — e cinco
 * pessoas que já tinham aberto os quatro níveis viram os três de cima voltarem
 * a ter cadeado. Ganhar a chance de pontuar de novo é um presente; perder o
 * acesso a um conteúdo que já era seu é um castigo, e ninguém pediu o segundo
 * ao aceitar o primeiro. Pior: é o vendedor no meio do atendimento que descobre.
 *
 * Então são duas perguntas diferentes, e cada uma tem a sua função: o quiz
 * reabre para valer ponto, e o que já foi aberto fica aberto.
 */
export function quizJaPassou(productId: string): boolean {
  return !!getStats().perQuiz[productId];
}

/**
 * O resultado do desafio da semana ou da prova do mês.
 *
 * Grava SEMPRE, passando ou não: a tentativa é o que fecha o desafio até o
 * período virar. Os pontos só entram quando a pessoa atinge o mínimo — e entram
 * uma vez só, porque a chave do período já estará ocupada na próxima chamada.
 */
export function recordDesafio(
  chave: string,
  acertos: number,
  de: number,
  minimo: number,
  pontos: number,
): Stats {
  const s = getStats();
  if (!s.desafios) s.desafios = {};
  if (s.desafios[chave]) return s; // já tentou neste período
  const passou = acertos >= minimo;
  s.desafios[chave] = { acertos, de, passou };
  if (passou) s.weekPoints += pontos;
  save(s);
  syncStats(s, {
    type: passou ? 'desafio_pass' : 'desafio_fail',
    id: chave,
    points: passou ? pontos : 0,
  });
  return s;
}

/** Já tentou o desafio deste período? */
export function desafioFeito(chave: string): { acertos: number; de: number; passou: boolean } | null {
  return getStats().desafios?.[chave] || null;
}
