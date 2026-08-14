// Espelha no Firestore o que a pessoa faz no Eleva (pílulas, quiz, missões).
//
// Por quê: tracking.ts guarda tudo em localStorage — ótimo pro app (offline,
// instantâneo), mas invisível pro Sistema de Gestão. Aqui mandamos uma cópia
// AGREGADA pro servidor, sem travar a UI (falha silenciosa = app segue igual).
//
// Coleção: elevaStats/{uid} — 1 doc por pessoa, com agregados + eventos recentes.
// Nada de dado sensível: só o que a pessoa fez dentro do app.
import { doc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import type { Stats } from './tracking';

export type ElevaEventType = 'pill_view' | 'quiz_pass' | 'mission_done';

const MAX_EVENTS = 200; // corta o array pra não estourar o limite de 1MB do doc

interface SyncMeta {
  brand?: string;
  role?: string;
  name?: string;
  /**
   * A pessoa já preencheu o contato que sai no material do cliente?
   *
   * Vai junto com os stats de propósito: a regra do Firestore deixa o gestor
   * ler elevaStats do time, mas NÃO deixa ler o perfil de ninguém (e nem deve —
   * lá tem dado pessoal). Assim a gerência consegue ver quem ainda não montou
   * o cartão, sem ver o telefone de ninguém.
   */
  cartaoPronto?: boolean;
}

let meta: SyncMeta = {};

/** Chamado pelo app quando sabe marca/papel/nome (ver PilulasApp). */
export function setStatsMeta(m: SyncMeta): void {
  meta = { ...meta, ...m };
}

/**
 * Manda o agregado + o evento novo pro Firestore.
 * Best-effort: qualquer erro é engolido — o app nunca quebra por causa disso.
 */
export function syncStats(stats: Stats, event: { type: ElevaEventType; id: string; points: number }): void {
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return;

  const payload = {
    uid,
    name: meta.name || auth?.currentUser?.displayName || '',
    email: auth?.currentUser?.email || '',
    role: meta.role || '',
    brand: meta.brand || '',
    cartaoPronto: meta.cartaoPronto === true,
    totals: {
      views: stats.totalViews,
      missions: stats.totalMissions,
      quizPassed: Object.keys(stats.perQuiz).length,
      streak: stats.streak,
    },
    month: {
      id: stats.week, // tracking.ts usa mês como período do ranking
      views: stats.weekViews,
      points: stats.weekPoints,
      missions: stats.weekMissions,
    },
    lastActiveAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    events: arrayUnion({
      type: event.type,
      id: event.id,
      points: event.points,
      at: new Date().toISOString(), // serverTimestamp() não funciona dentro de array
    }),
  };

  setDoc(doc(db, 'elevaStats', uid), payload, { merge: true }).catch(() => {
    /* offline ou sem permissão: ignora, o localStorage continua sendo a verdade do app */
  });
}

/** Poda o array de eventos quando fica grande (chamado no boot do app). */
export function trimEvents(events: unknown[]): unknown[] {
  return events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events;
}
