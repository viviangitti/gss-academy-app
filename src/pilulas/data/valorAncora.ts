// A ÂNCORA DO VALOR DA SEMANA.
//
// O valor gira sozinho desde sempre — isso nunca foi o problema. O problema é
// que ele girava ancorado em NADA: o índice saía de `semanaDoAno % 9`, ou
// seja, do número da semana no calendário mundial. Qual valor cai em qual
// semana era coincidência aritmética, não o calendário de cultura da casa.
//
// Em 15/10/2026 a Ramasa avisou pelo WhatsApp: "precisa atualizar o valor da
// semana, estamos em ser firmes e discordar". O app mostrava "Altos padrões".
// Os dois estavam certos do seu jeito — o app seguia a conta dele, a casa
// seguia a dela — e não havia como aproximar um do outro sem mexer no código
// e publicar de novo. Um recado de WhatsApp virava tarefa de programador.
//
// Com a âncora, a gerência diz UMA vez em que valor a casa está. A rotação
// continua automática a partir dali, toda segunda, e ninguém precisa voltar.
//
// E ancorar numa DATA, em vez do número da semana do ano, conserta de quebra
// um defeito silencioso: `semanaDoAno % 9` pula um valor em toda virada de
// ano. Em 2026 a semana 53 dá índice 8 e a semana 1 de 2027 dá índice 1 — o
// índice 0 ("Foco em resultados") não aparece na virada. Contando semanas
// desde a âncora isso não acontece: a fila anda de um em um, sempre.
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { BrandId } from './brands';

export interface Ancora {
  /** O id do valor que estava valendo na semana de `desde`. */
  valorId: string;
  /** Segunda-feira da semana em que esse valor valeu (aaaa-mm-dd). */
  desde: string;
  /** Quem publicou, para o Painel poder dizer de quem veio. */
  por?: string;
  em?: string;
}

const chaveLocal = (brand: BrandId) => `wp_valor_ancora:${brand}`;

/** Lê do aparelho primeiro: a tela abre sem esperar a rede. */
export function ancoraLocal(brand: BrandId): Ancora | null {
  try {
    const raw = localStorage.getItem(chaveLocal(brand));
    return raw ? (JSON.parse(raw) as Ancora) : null;
  } catch {
    return null;
  }
}

export async function carregarAncora(brand: BrandId): Promise<Ancora | null> {
  if (!db) return ancoraLocal(brand);
  try {
    const snap = await getDoc(doc(db, 'elevaBrands', brand, 'elevaConfig', 'valorDaSemana'));
    const d = snap.exists() ? (snap.data() as Ancora) : null;
    if (d?.valorId && d?.desde) {
      try { localStorage.setItem(chaveLocal(brand), JSON.stringify(d)); } catch { /* ignore */ }
      return d;
    }
    return null;
  } catch {
    // Sem rede, vale o que já estava no aparelho — melhor o valor de ontem
    // que nenhum valor.
    return ancoraLocal(brand);
  }
}

export async function publicarAncora(brand: BrandId, a: Ancora): Promise<void> {
  try { localStorage.setItem(chaveLocal(brand), JSON.stringify(a)); } catch { /* ignore */ }
  if (!db) return;
  await setDoc(doc(db, 'elevaBrands', brand, 'elevaConfig', 'valorDaSemana'), a, { merge: true });
}

/** A segunda-feira da semana de `d`, em aaaa-mm-dd. */
export function segundaDaSemana(d = new Date()): string {
  const q = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  q.setDate(q.getDate() - ((q.getDay() || 7) - 1));
  return `${q.getFullYear()}-${String(q.getMonth() + 1).padStart(2, '0')}-${String(q.getDate()).padStart(2, '0')}`;
}

/** Quantas semanas inteiras separam duas segundas-feiras. Pode dar negativo. */
export function semanasEntre(deISO: string, ate = new Date()): number {
  const a = new Date(`${deISO}T12:00:00`);
  const b = new Date(`${segundaDaSemana(ate)}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / (7 * 86400000));
}

// O HOOK QUE AS TELAS USAM.
//
// Abre com o que está no aparelho (instantâneo) e troca sozinho quando a
// nuvem responde. Sem isso a tela piscaria o valor errado por um segundo a
// cada abertura, que é pior do que não ter âncora nenhuma.
import { useEffect, useState } from 'react';

export function useAncora(brand: BrandId): Ancora | null {
  const [a, setA] = useState<Ancora | null>(() => ancoraLocal(brand));
  useEffect(() => {
    let vivo = true;
    setA(ancoraLocal(brand));
    carregarAncora(brand).then((x) => { if (vivo && x) setA(x); }).catch(() => {});
    return () => { vivo = false; };
  }, [brand]);
  return a;
}
