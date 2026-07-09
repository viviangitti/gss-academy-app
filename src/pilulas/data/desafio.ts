// Desafio coletivo da rede (estilo Rallyware): uma meta que TODO MUNDO soma junto.
// Sem backend ainda, o total da rede é uma simulação (base que cresce no mês) + a sua
// parte real. Quando o Firebase estiver ligado, o total vira a soma real das vendedoras.
import { getStats } from './tracking';

export interface Desafio {
  meta: number; // pílulas assistidas pela rede
  atual: number; // total coletivo (base simulada + sua parte real)
  minhaParte: number; // quanto VOCÊ somou no mês
  pct: number;
  faltam: number;
  premio: string;
  demo: boolean; // true = número da rede é exemplo (sem backend)
}

export function getDesafio(): Desafio {
  const stats = getStats();
  const meta = 500;
  // Base coletiva determinística: sobe ao longo do mês pra dar sensação de rede viva.
  const day = new Date().getDate(); // 1..31
  const base = Math.min(meta - 30, 150 + day * 9);
  const minhaParte = stats.weekViews;
  const atual = Math.min(meta, base + minhaParte);
  const pct = Math.min(100, Math.round((atual / meta) * 100));
  const faltam = Math.max(0, meta - atual);
  return {
    meta,
    atual,
    minhaParte,
    pct,
    faltam,
    premio: 'Rede toda desbloqueia o kit de amostras do lançamento',
    demo: true,
  };
}
