// Rastreamento de "quem vê mais" — base da competição.
// localStorage é a verdade do app (offline, instantâneo); statsSync manda uma
// cópia agregada pro Firestore pra alimentar o Sistema de Gestão.
import { syncStats } from './statsSync';

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

export interface Stats {
  week: string; // id da semana vigente
  weekViews: number; // pílulas assistidas na semana
  weekPoints: number; // pontos na semana
  weekMissions: number; // missões de conteúdo concluídas na semana
  totalViews: number; // histórico total
  totalMissions: number; // posts de creator no total (cumulativo — base dos níveis)
  streak: number; // dias seguidos abrindo o app
  lastDay: string | null; // AAAA-MM-DD da última visualização
  perProduct: Record<string, number>;
  perMission: Record<string, number>; // missões já concluídas (não repontuam)
  perQuiz: Record<string, number>; // produtos "dominados" no quiz (permanente, pontua 1x)
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekId(d = new Date()): string {
  // Período do ranking = MÊS (os campos week* guardam o placar do mês vigente).
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
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

  const dayKey = `${productId}@${day}`;
  let isNew = false;
  if (!s.perProduct[dayKey]) {
    s.perProduct[dayKey] = 1;
    s.weekViews += 1;
    s.totalViews += 1;
    s.weekPoints += POINTS_PER_PILL;
    isNew = true;
  }

  s.lastDay = day;
  save(s);
  if (isNew) syncStats(s, { type: 'pill_view', id: productId, points: POINTS_PER_PILL });
  return s;
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
export function recordQuizPass(productId: string): Stats {
  const s = getStats();
  let isNew = false;
  if (!s.perQuiz[productId]) {
    s.perQuiz[productId] = 1;
    s.weekPoints += POINTS_PER_QUIZ;
    isNew = true;
  }
  save(s);
  if (isNew) syncStats(s, { type: 'quiz_pass', id: productId, points: POINTS_PER_QUIZ });
  return s;
}

export function isQuizDone(productId: string): boolean {
  return !!getStats().perQuiz[productId];
}
