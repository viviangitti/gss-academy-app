// Meta mensal e histórico de vendas registradas

export interface Sale {
  id: string;
  amount: number;
  client: string;
  date: string; // ISO
  notes?: string;
}

export interface GoalStats {
  goal: number;
  monthTotal: number;
  monthCount: number;
  progress: number; // 0-100
  daysLeft: number;
  pace: 'atras' | 'no_ritmo' | 'adiantado' | 'sem_meta';
  dailyTarget: number; // quanto precisa por dia para bater
}

const SALES_KEY = 'gss_sales';

function monthPrefix(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getSales(): Sale[] {
  try {
    const raw = localStorage.getItem(SALES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSale(amount: number, client: string, notes?: string): Sale {
  const sale: Sale = {
    id: generateId(),
    amount,
    client,
    notes,
    date: new Date().toISOString(),
  };
  const sales = getSales();
  sales.push(sale);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  return sale;
}

export function removeSale(id: string): void {
  const sales = getSales().filter(s => s.id !== id);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

export function getCurrentMonthSales(): Sale[] {
  const prefix = monthPrefix();
  return getSales().filter(s => s.date.startsWith(prefix));
}

export function getStats(goal: number): GoalStats {
  const monthSales = getCurrentMonthSales();
  const monthTotal = monthSales.reduce((sum, s) => sum + s.amount, 0);
  const progress = goal > 0 ? Math.min((monthTotal / goal) * 100, 100) : 0;

  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.max(0, lastDay.getDate() - now.getDate());

  const remaining = Math.max(0, goal - monthTotal);
  const dailyTarget = daysLeft > 0 ? remaining / daysLeft : remaining;

  let pace: GoalStats['pace'] = 'sem_meta';
  if (goal > 0) {
    const dayOfMonth = now.getDate();
    const totalDays = lastDay.getDate();
    const expectedProgress = (dayOfMonth / totalDays) * 100;
    if (progress >= expectedProgress + 5) pace = 'adiantado';
    else if (progress >= expectedProgress - 10) pace = 'no_ritmo';
    else pace = 'atras';
  }

  return {
    goal,
    monthTotal,
    monthCount: monthSales.length,
    progress,
    daysLeft,
    pace,
    dailyTarget,
  };
}

// Agrupa vendas por dia do mês atual para gráfico
export function getDailyAccumulation(): { day: number; accumulated: number }[] {
  const sales = getCurrentMonthSales().sort((a, b) => a.date.localeCompare(b.date));
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const todayDay = now.getDate();

  const result: { day: number; accumulated: number }[] = [];
  let acc = 0;
  let saleIdx = 0;

  for (let d = 1; d <= Math.min(todayDay, lastDay); d++) {
    while (saleIdx < sales.length) {
      const saleDay = new Date(sales[saleIdx].date).getDate();
      if (saleDay <= d) {
        acc += sales[saleIdx].amount;
        saleIdx++;
      } else break;
    }
    result.push({ day: d, accumulated: acc });
  }

  return result;
}
