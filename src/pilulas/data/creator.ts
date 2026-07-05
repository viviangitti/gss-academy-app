// Níveis de creator + mural de selos (o "joguinho" estilo Sociallis).
// Base: nº de POSTS (missões concluídas) e engajamento — não só assistir.
import { Star, Zap, Trophy, Flame, Award, type LucideIcon } from 'lucide-react';

export interface Level {
  name: string;
  min: number; // posts necessários
  color: string;
}

export const LEVELS: Level[] = [
  { name: 'Bronze', min: 0, color: '#b8763e' },
  { name: 'Prata', min: 5, color: '#9aa2ad' },
  { name: 'Ouro', min: 15, color: '#d4af37' },
];

export function creatorLevel(posts: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (posts >= LEVELS[i].min) idx = i;
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;
  const toNext = next ? next.min - posts : 0;
  const pct = next
    ? Math.min(100, Math.round(((posts - current.min) / (next.min - current.min)) * 100))
    : 100;
  return { current, next, toNext, pct };
}

interface AchStats { totalMissions: number; totalViews: number; streak: number }

export interface Achievement {
  id: string;
  label: string;
  Icon: LucideIcon;
  unlocked: (s: AchStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'estreante', label: 'Estreante', Icon: Star, unlocked: (s) => s.totalMissions >= 1 },
  { id: 'engajada', label: 'Engajada', Icon: Zap, unlocked: (s) => s.totalMissions >= 5 },
  { id: 'ouro', label: 'Creator Ouro', Icon: Trophy, unlocked: (s) => s.totalMissions >= 15 },
  { id: 'chama', label: 'Chama acesa', Icon: Flame, unlocked: (s) => s.streak >= 3 },
  { id: 'maratona', label: 'Maratona', Icon: Award, unlocked: (s) => s.totalViews >= 10 },
];
