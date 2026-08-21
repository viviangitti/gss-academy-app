// OS DESTAQUES DO CARRO, ESCRITOS PELO TIME.
//
// A pergunta que originou isto: "depois que eles responderem, dá pra atualizar
// as pílulas automaticamente?". Dá — com UM TOQUE do gestor, não sozinho.
//
// Por que não sozinho: o destaque não fica só na tela do vendedor. Ele entra no
// one-page que vai PRO CLIENTE, em imagem e PDF, e que o cliente encaminha pra
// família. Se alguém escrever um consumo errado ou prometer o que a loja não
// cumpre, isso vira documento circulando com o nome da concessionária. Um toque
// de conferência é barato; desmentir um PDF já enviado, não.
//
// O que este arquivo faz: guarda a lista de destaques que a gerência montou a
// partir das respostas do time, por carro. Quando existe, ela SUBSTITUI a lista
// escrita no código — na tela do produto e no material do cliente. Some quando
// o gestor esvazia.
//
// Fica em Firestore (elevaDestaques/{produto}), com cache local pra abrir na
// hora no 4G do showroom. Leitura: quem está logado. Escrita: só gestor.
import { useSyncExternalStore } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

export interface DestaqueItem {
  titulo: string;
  prova?: string;
}

const COL = 'elevaDestaques';
const KEY = 'wp_destaques_time';

// ---- avisa a tela quando a lista muda ----
let version = 0;
const listeners = new Set<() => void>();
function emit() {
  version += 1;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}
export function useDestaquesTime(): number {
  return useSyncExternalStore(subscribe, () => version);
}

type Mapa = Record<string, DestaqueItem[]>;

function lerCache(): Mapa {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
function gravarCache(m: Mapa) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* cheio */ }
  emit();
}

/** O que a gerência montou pra este carro. Vazio = usa o que está no código. */
export function destaquesDoTime(productId: string): DestaqueItem[] {
  return lerCache()[productId] || [];
}

export async function carregarDestaques(productId: string): Promise<DestaqueItem[]> {
  if (!db) return destaquesDoTime(productId);
  try {
    const snap = await getDoc(doc(db, COL, productId));
    const itens = snap.exists() ? ((snap.data().itens as DestaqueItem[]) || []) : [];
    const m = lerCache();
    m[productId] = itens;
    gravarCache(m);
    return itens;
  } catch {
    return destaquesDoTime(productId);
  }
}

/**
 * Grava a lista do carro. Só gestor consegue (regra do Firestore).
 *
 * Cinco é o teto porque é o que cabe no one-page sem virar letra miúda — e
 * porque lista longa não é destaque, é catálogo.
 */
export async function salvarDestaques(productId: string, itens: DestaqueItem[]): Promise<void> {
  const limpos = itens
    .map((i) => ({ titulo: i.titulo.trim().slice(0, 90), prova: i.prova?.trim().slice(0, 120) || '' }))
    .filter((i) => i.titulo)
    .slice(0, 5);
  const m = lerCache();
  m[productId] = limpos;
  gravarCache(m);
  if (!db) return;
  await setDoc(doc(db, COL, productId), { itens: limpos, atualizadoEm: serverTimestamp() });
}
