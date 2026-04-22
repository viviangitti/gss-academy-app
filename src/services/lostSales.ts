import { loadData, saveData } from './storage';

const KEY = 'gss_lost_sales';

export type LostReason =
  | 'preco'
  | 'concorrente'
  | 'timing'
  | 'sem_orcamento'
  | 'sem_decisao'
  | 'relacionamento'
  | 'produto'
  | 'outro';

export type LostStage = 'prospeccao' | 'proposta' | 'negociacao' | 'fechamento';

export interface LostSale {
  id: string;
  date: string; // ISO
  opportunity: string; // nome da oportunidade (não do cliente)
  value: number;
  reason: LostReason;
  stage: LostStage;
  notes: string;
  learning: string; // o que faria diferente
}

export const REASON_LABELS: Record<LostReason, string> = {
  preco: 'Preço / concorrente mais barato',
  concorrente: 'Concorrente venceu',
  timing: 'Timing errado',
  sem_orcamento: 'Sem orçamento',
  sem_decisao: 'Sem decisão / travou',
  relacionamento: 'Relacionamento fraco',
  produto: 'Produto não se encaixou',
  outro: 'Outro motivo',
};

export const STAGE_LABELS: Record<LostStage, string> = {
  prospeccao: 'Prospecção',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechamento: 'Fechamento',
};

export const REASON_OBJECTION_LINK: Partial<Record<LostReason, string>> = {
  preco: '/objecoes',
  concorrente: '/objecoes',
  sem_orcamento: '/objecoes',
  sem_decisao: '/objecoes',
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getLostSales(): LostSale[] {
  return loadData<LostSale[]>(KEY, []);
}

export function addLostSale(data: Omit<LostSale, 'id' | 'date'>): LostSale {
  const all = getLostSales();
  const entry: LostSale = { ...data, id: generateId(), date: new Date().toISOString() };
  saveData(KEY, [entry, ...all]);
  return entry;
}

export function removeLostSale(id: string) {
  saveData(KEY, getLostSales().filter(s => s.id !== id));
}

export interface LostStats {
  total: number;
  totalValue: number;
  topReason: LostReason | null;
  topStage: LostStage | null;
  byReason: Record<string, number>;
  byStage: Record<string, number>;
}

export function getLostStats(): LostStats {
  const all = getLostSales();
  if (!all.length) return { total: 0, totalValue: 0, topReason: null, topStage: null, byReason: {}, byStage: {} };

  const byReason: Record<string, number> = {};
  const byStage: Record<string, number> = {};
  let totalValue = 0;

  for (const s of all) {
    byReason[s.reason] = (byReason[s.reason] || 0) + 1;
    byStage[s.stage] = (byStage[s.stage] || 0) + 1;
    totalValue += s.value;
  }

  const topReason = Object.entries(byReason).sort((a, b) => b[1] - a[1])[0]?.[0] as LostReason;
  const topStage = Object.entries(byStage).sort((a, b) => b[1] - a[1])[0]?.[0] as LostStage;

  return { total: all.length, totalValue, topReason, topStage, byReason, byStage };
}
