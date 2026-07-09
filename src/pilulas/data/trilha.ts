// Trilha de formação (estilo Rallyware): os produtos da marca viram uma jornada.
// Cada produto é um passo. "Dominada" = passou no quiz; "Assistida" = viu a pílula.
// Quando domina TODOS, ganha o certificado da marca.
import { allProducts } from './store';
import { getStats } from './tracking';
import type { Product } from './products';

export type StepStatus = 'dominada' | 'assistida' | 'nova';

export interface TrilhaStep {
  product: Product;
  status: StepStatus;
  watched: boolean;
  mastered: boolean;
  index: number;
}

export interface TrilhaProgress {
  steps: TrilhaStep[];
  total: number;
  mastered: number; // quantos produtos dominados (quiz)
  watched: number; // quantos assistidos
  pct: number; // % por dominados
  complete: boolean; // dominou todos = certificado
  next: Product | null; // próximo passo (primeiro não-dominado)
}

function wasWatched(perProduct: Record<string, number>, productId: string): boolean {
  // as chaves são `${productId}@${dia}`; assistiu alguma vez = existe qualquer chave do produto
  return Object.keys(perProduct).some((k) => k.startsWith(productId + '@'));
}

export function getTrilha(brandId: string): TrilhaProgress {
  const stats = getStats();
  const products = allProducts().filter((p) => p.brand === brandId);
  const steps: TrilhaStep[] = products.map((p, index) => {
    const mastered = !!stats.perQuiz[p.id];
    const watched = mastered || wasWatched(stats.perProduct, p.id);
    const status: StepStatus = mastered ? 'dominada' : watched ? 'assistida' : 'nova';
    return { product: p, status, watched, mastered, index };
  });
  const total = steps.length;
  const mastered = steps.filter((s) => s.mastered).length;
  const watched = steps.filter((s) => s.watched).length;
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  const complete = total > 0 && mastered === total;
  const next = steps.find((s) => !s.mastered)?.product ?? null;
  return { steps, total, mastered, watched, pct, complete, next };
}

// Guarda a data em que a pessoa fechou a trilha (pro certificado ter data real).
function certKey(brandId: string): string {
  return `wp_cert_${brandId}`;
}

export function certDate(brandId: string): string | null {
  try {
    return localStorage.getItem(certKey(brandId));
  } catch {
    return null;
  }
}

// Chame quando a trilha estiver completa: carimba a data 1x e devolve.
export function ensureCertDate(brandId: string): string {
  const existing = certDate(brandId);
  if (existing) return existing;
  const today = new Date().toISOString().slice(0, 10);
  try {
    localStorage.setItem(certKey(brandId), today);
  } catch {
    /* ignore */
  }
  return today;
}

export function formatCertDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
