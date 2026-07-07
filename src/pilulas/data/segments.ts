// Segmentos de canal — como o FABRICANTE enxerga a rede: ele não conhece os
// mil vendedores pelo nome, conhece por canal (farmácia, quiosque, revenda...).
// O vendedor entra já etiquetado pelo link/QR de convite do gestor.

export type SegmentId = 'farmacia' | 'quiosque' | 'revenda' | 'loja';

export interface Segment {
  id: SegmentId;
  label: string;
}

export const SEGMENTS: Segment[] = [
  { id: 'farmacia', label: 'Farmácia (balcão)' },
  { id: 'quiosque', label: 'Quiosque' },
  { id: 'revenda', label: 'Revenda autônoma' },
  { id: 'loja', label: 'Loja / PDV' },
];

export function segmentLabel(id?: string): string {
  return SEGMENTS.find((s) => s.id === id)?.label || 'Todos os canais';
}

// Etiqueta do convite fica no aparelho até o cadastro acontecer.
const KEY = 'wp_segment';

export function stageSegmentFromUrl() {
  try {
    const c = new URLSearchParams(window.location.search).get('convite');
    if (c && SEGMENTS.some((s) => s.id === c)) localStorage.setItem(KEY, c);
  } catch { /* ignore */ }
}

export function mySegment(): SegmentId | undefined {
  try {
    const v = localStorage.getItem(KEY);
    return SEGMENTS.some((s) => s.id === v) ? (v as SegmentId) : undefined;
  } catch {
    return undefined;
  }
}
