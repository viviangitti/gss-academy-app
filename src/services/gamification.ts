import { loadData, saveData, KEYS } from './storage';
import type { GamePoints } from '../types';

const POINT_VALUES: Record<string, number> = {
  'checklist_completa': 10,
  'treino_objecao': 20,
  'registro_reuniao': 15,
  'uso_diario': 5,
  'ritual_completo': 10,
};

const LEVELS = [
  { level: 1, min: 0, title: 'Iniciante' },
  { level: 2, min: 51, title: 'Vendedor' },
  { level: 3, min: 151, title: 'Especialista' },
  { level: 4, min: 351, title: 'Mestre' },
  { level: 5, min: 701, title: 'Lenda' },
];

function getDefaultPoints(): GamePoints {
  return { total: 0, streak: 0, lastActiveDate: '', history: [] };
}

export function getPoints(): GamePoints {
  return loadData<GamePoints>(KEYS.GAME_POINTS, getDefaultPoints());
}

export function addPoints(action: string): GamePoints {
  const points = getPoints();
  const value = POINT_VALUES[action] || 0;
  if (!value) return points;

  const today = new Date().toISOString().split('T')[0];

  // Update streak
  if (points.lastActiveDate) {
    const lastDate = new Date(points.lastActiveDate);
    const todayDate = new Date(today);
    const diff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      points.streak += 1;
    } else if (diff > 1) {
      points.streak = 1;
    }
  } else {
    points.streak = 1;
  }

  points.total += value;
  points.lastActiveDate = today;
  points.history.push({ action, points: value, date: today });

  // Keep only last 100 entries
  if (points.history.length > 100) {
    points.history = points.history.slice(-100);
  }

  saveData(KEYS.GAME_POINTS, points);
  return points;
}

export function checkDailyLogin(): GamePoints {
  const points = getPoints();
  const today = new Date().toISOString().split('T')[0];

  if (points.lastActiveDate !== today) {
    return addPoints('uso_diario');
  }
  return points;
}

export function getLevel(total: number): { level: number; title: string; nextLevel: number; progress: number } {
  let current = LEVELS[0];
  let next = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (total >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }

  const range = next.min - current.min;
  const progress = range > 0 ? Math.min(((total - current.min) / range) * 100, 100) : 100;

  return {
    level: current.level,
    title: current.title,
    nextLevel: next.min,
    progress,
  };
}

export { LEVELS };
