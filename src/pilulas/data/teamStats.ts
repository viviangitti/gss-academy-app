// Painel do gestor com dado REAL — lê os elevaStats de todo mundo e agrega.
//
// Antes o painel mostrava número inventado ("34 vendedoras", "+38%"). Isso vem
// do que cada pessoa grava em elevaStats/{uid} (ver statsSync.ts).
//
// O mês a mês sai do array `events` (últimos 200 por pessoa, cada um com data) —
// o agregado `month` só guarda o mês corrente, então histórico só existe ali.
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

export interface TeamEvent {
  type: 'pill_view' | 'quiz_pass' | 'mission_done';
  id: string;
  points: number;
  at: string; // ISO
}

export interface TeamPerson {
  uid: string;
  name: string;
  email: string;
  role: string;
  totals: { views: number; missions: number; quizPassed: number; streak: number };
  month: { id: string; views: number; points: number; missions: number };
  events: TeamEvent[];
  lastActiveAt?: Date;
}

export interface MonthBucket {
  id: string; // "2026-7"
  label: string; // "jul"
  views: number;
  quiz: number;
  posts: number;
  people: number; // quantas pessoas ativas no mês
}

export interface TeamReport {
  people: TeamPerson[];
  byRole: { role: string; total: number; ativos: number }[]; // ativos = mexeram no mês corrente
  months: MonthBucket[]; // do mais antigo pro mais novo
  topProducts: { id: string; views: number }[];
  ranking: { name: string; role: string; points: number; views: number; quiz: number }[];
  semUso: TeamPerson[]; // cadastrou e nunca assistiu nada
}

const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function monthId(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}
function monthLabel(id: string): string {
  const [, m] = id.split('-');
  return MES[Number(m) - 1] || id;
}

export function currentMonthId(): string {
  return monthId(new Date());
}

// Últimos N meses, do mais antigo pro mais novo.
function lastMonthIds(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(monthId(x));
  }
  return out;
}

export async function fetchTeam(brand: string): Promise<TeamPerson[]> {
  if (!db) return [];
  const q = query(collection(db, 'elevaStats'), where('brand', '==', brand));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const x = d.data() as Record<string, unknown>;
    const t = (x.totals || {}) as TeamPerson['totals'];
    const m = (x.month || {}) as TeamPerson['month'];
    return {
      uid: String(x.uid || d.id),
      name: String(x.name || '') || String(x.email || '').split('@')[0] || 'Sem nome',
      email: String(x.email || ''),
      role: String(x.role || ''),
      totals: { views: t.views || 0, missions: t.missions || 0, quizPassed: t.quizPassed || 0, streak: t.streak || 0 },
      month: { id: String(m.id || ''), views: m.views || 0, points: m.points || 0, missions: m.missions || 0 },
      events: Array.isArray(x.events) ? (x.events as TeamEvent[]) : [],
      lastActiveAt: (x.lastActiveAt as { toDate?: () => Date })?.toDate?.(),
    };
  });
}

// allowedIds: ids dos produtos DESTA marca. Quando informado, eventos de
// produto/quiz de OUTRA marca são ignorados — o painel da Sorocaps nunca conta
// atividade da Meraki (uma gestora que navega nas duas marcas grava tudo no
// mesmo doc; é aqui que separamos por marca na hora de exibir).
export function buildReport(people: TeamPerson[], allowedIds?: Set<string>, months = 4): TeamReport {
  const now = currentMonthId();

  // --- por papel ---
  const roles = new Map<string, { total: number; ativos: number }>();
  for (const p of people) {
    const r = p.role || 'sem papel';
    const cur = roles.get(r) || { total: 0, ativos: 0 };
    cur.total += 1;
    if (p.month.id === now && (p.month.views > 0 || p.month.missions > 0)) cur.ativos += 1;
    roles.set(r, cur);
  }

  // --- mês a mês (dos eventos, que têm data) ---
  const ids = lastMonthIds(months);
  const buckets = new Map<string, MonthBucket & { uids: Set<string> }>();
  for (const id of ids) {
    buckets.set(id, { id, label: monthLabel(id), views: 0, quiz: 0, posts: 0, people: 0, uids: new Set() });
  }
  const prodViews = new Map<string, number>();
  for (const p of people) {
    for (const e of p.events) {
      const d = new Date(e.at);
      if (Number.isNaN(d.getTime())) continue;
      const b = buckets.get(monthId(d));
      if (!b) continue;
      // Evento de produto/quiz de outra marca não entra no painel desta marca.
      const isProdEvent = e.type === 'pill_view' || e.type === 'quiz_pass';
      if (allowedIds && isProdEvent && !allowedIds.has(e.id)) continue;
      b.uids.add(p.uid);
      if (e.type === 'pill_view') {
        b.views += 1;
        prodViews.set(e.id, (prodViews.get(e.id) || 0) + 1);
      } else if (e.type === 'quiz_pass') b.quiz += 1;
      else if (e.type === 'mission_done') b.posts += 1;
    }
  }
  const monthsOut: MonthBucket[] = ids.map((id) => {
    const b = buckets.get(id)!;
    return { id: b.id, label: b.label, views: b.views, quiz: b.quiz, posts: b.posts, people: b.uids.size };
  });

  // --- ranking do mês corrente ---
  const ranking = people
    .filter((p) => p.month.id === now && p.month.points > 0)
    .map((p) => ({
      name: p.name,
      role: p.role,
      points: p.month.points,
      views: p.month.views,
      quiz: p.totals.quizPassed,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 8);

  const topProducts = [...prodViews.entries()]
    .map(([id, views]) => ({ id, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Quem se cadastrou e nunca assistiu nada — o dado mais acionável do painel.
  const semUso = people.filter((p) => p.totals.views === 0);

  return {
    people,
    byRole: [...roles.entries()].map(([role, v]) => ({ role, ...v })).sort((a, b) => b.total - a.total),
    months: monthsOut,
    topProducts,
    ranking,
    semUso,
  };
}
