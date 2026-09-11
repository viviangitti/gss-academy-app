// O LEMBRETE DA CAMPANHA DA CASA na tela inicial.
//
// A campanha mora na aba Condições, e ninguém abre a aba Condições pra lembrar
// de uma meta. Em 11/09/2026 a Vivian viu o Tira-dúvida avisar sozinho que a
// 1ª quinzena fechava na segunda, e pediu o mesmo aviso pro time inteiro — sem
// ninguém precisar perguntar.
//
// Duas camadas: uma faixa que fica enquanto houver disputa aberta, e um pop-up
// que só aparece na reta final (3 dias ou menos), uma vez por dia. Pop-up todo
// dia desde o dia 1 vira paisagem em uma semana — e aí nem o da reta final é lido.
import type { BrandId } from './brands';
import { condicoesDaMarca, estaVencida, type Condicao, type Disputa } from './condicoes';
import { diasRestantes } from './campanha';

export const RETA_FINAL = 3;

export interface LembreteCampanha {
  condicao: Condicao;
  disputa: Disputa;
  /** Dias até o fim da disputa. 0 = último dia. */
  dias: number;
}

/** A disputa aberta mais perto de acabar, entre as campanhas no ar desta marca. */
export function lembreteCampanha(brand: BrandId, hoje = new Date()): LembreteCampanha | null {
  let melhor: LembreteCampanha | null = null;
  for (const c of condicoesDaMarca(brand)) {
    if (c.categoria !== 'campanha' || estaVencida(c, hoje) || !c.disputas?.length) continue;
    for (const d of c.disputas) {
      if (!d.ate || !d.nome) continue;
      const dias = diasRestantes(d.ate, hoje);
      if (dias < 0) continue;
      if (!melhor || dias < melhor.dias) melhor = { condicao: c, disputa: d, dias };
    }
  }
  return melhor;
}

const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** "14/09" */
export function diaMes(ate: string): string {
  const [, m, d] = ate.split('-');
  return `${d}/${m}`;
}

/** "hoje" / "amanhã" / "segunda" / "em 28/09" — dia da semana só quando é esta semana. */
export function quando(l: LembreteCampanha): string {
  if (l.dias === 0) return 'hoje';
  if (l.dias === 1) return 'amanhã';
  if (l.dias <= 6) {
    const [y, m, d] = l.disputa.ate.split('-').map(Number);
    return SEMANA[new Date(y, m - 1, d).getDay()];
  }
  return `em ${diaMes(l.disputa.ate)}`;
}

/** Primeira letra maiúscula e ponto no fim. */
export function frase(s: string): string {
  const t = s.trim();
  if (!t) return '';
  const f = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(f) ? f : f + '.';
}

// ---- o pop-up aparece uma vez por dia, por disputa ----
function chaveDoDia(l: LembreteCampanha, hoje = new Date()): string {
  const dia = `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`;
  return `wp_camp_pop:${l.condicao.id}:${l.disputa.ate}:${dia}`;
}

export function mostrarPopupHoje(l: LembreteCampanha | null, hoje = new Date()): boolean {
  if (!l || l.dias > RETA_FINAL) return false;
  try { return !localStorage.getItem(chaveDoDia(l, hoje)); } catch { return false; }
}

export function dispensarPopupHoje(l: LembreteCampanha, hoje = new Date()): void {
  try { localStorage.setItem(chaveDoDia(l, hoje), '1'); } catch { /* sem armazenamento: volta a aparecer */ }
}
