// Rastreamento local de "quem vê mais" — base da competição.
// Sem backend ainda: guarda no localStorage. Quando houver Firebase,
// é só trocar a fonte (mesma interface) e o ranking vira multi-vendedora real.

const KEY = 'wp_stats_v1';
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
    const raw = localStorage.getItem(KEY);
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
    localStorage.setItem(KEY, JSON.stringify(s));
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
  if (!s.perProduct[dayKey]) {
    s.perProduct[dayKey] = 1;
    s.weekViews += 1;
    s.totalViews += 1;
    s.weekPoints += POINTS_PER_PILL;
  }

  s.lastDay = day;
  save(s);
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

  if (!s.perMission[missionId]) {
    s.perMission[missionId] = 1;
    s.weekMissions += 1;
    s.totalMissions = (s.totalMissions || 0) + 1;
    s.weekPoints += points;
  }

  s.lastDay = day;
  save(s);
  return s;
}

export function isMissionDone(missionId: string): boolean {
  return !!getStats().perMission[missionId];
}

// Quiz da pílula: acertou tudo = "domina o produto". Pontua 1x por produto (permanente).
export function recordQuizPass(productId: string): Stats {
  const s = getStats();
  if (!s.perQuiz[productId]) {
    s.perQuiz[productId] = 1;
    s.weekPoints += POINTS_PER_QUIZ;
  }
  save(s);
  return s;
}

export function isQuizDone(productId: string): boolean {
  return !!getStats().perQuiz[productId];
}
