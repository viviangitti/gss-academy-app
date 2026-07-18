// Vídeos por PÚBLICO (balconista / promotor / afiliado geral / afiliado saúde),
// por produto.
//
// - Reel do Instagram: guardado NA NUVEM (Firestore, doc elevaContent/audienceVideos)
//   com cache em localStorage. O gestor cola o link e TODO MUNDO vê, em qualquer
//   aparelho. As regras já garantem: logado lê, só gestor escreve.
// - MP4: continua no IndexedDB (chave `av:<produto>:<publico>`), ou seja, SÓ no
//   aparelho de quem subiu. Pra MP4 chegar nos outros falta o Firebase Storage.
import { useSyncExternalStore } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Audience } from '../AuthContext';
import { AFILIADO_LINE } from './products';
import { isBalcao, type BrandId } from './brands';

// Chave do MP4 no store (IndexedDB) para um produto + público.
export function audienceVideoKey(productId: string, a: Audience): string {
  return `av:${productId}:${a}`;
}

const RKEY = 'wp_affiliate_reels';
const COL = 'elevaContent';
const DOC = 'audienceVideos';

// ---- avisa a tela quando os links mudam (edição local ou chegada da nuvem) ----
let version = 0;
const listeners = new Set<() => void>();
function emit() {
  version += 1;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export function useAudienceReels(): number {
  return useSyncExternalStore(subscribe, () => version);
}

type ReelMap = Record<string, string>;

function readCache(): ReelMap {
  try {
    return JSON.parse(localStorage.getItem(RKEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(m: ReelMap) {
  try {
    localStorage.setItem(RKEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
  emit();
}

export function getAudienceReel(productId: string, a: Audience): string | undefined {
  const url = readCache()[`${productId}:${a}`];
  return url && url.trim() ? url : undefined;
}

export function setAudienceReel(productId: string, a: Audience, url: string): void {
  const m = readCache();
  const k = `${productId}:${a}`;
  if (url.trim()) m[k] = url.trim();
  else delete m[k];

  // 1) local primeiro: o gestor vê o efeito na hora, mesmo sem rede.
  writeCache(m);

  // 2) nuvem: é o que faz o link chegar no celular do time.
  // Sem merge de propósito — com merge, apagar um link aqui não apagaria lá.
  if (!db) return;
  setDoc(doc(db, COL, DOC), { reels: m, updatedAt: serverTimestamp() }).catch(() => {
    /* offline / sem permissão: fica o cache local e tenta na próxima edição */
  });
}

// Puxa os links da nuvem ao abrir o app. Se falhar (offline), fica o cache.
export async function loadAudienceReels(): Promise<void> {
  if (!db) return;
  try {
    const snap = await getDoc(doc(db, COL, DOC));
    if (!snap.exists()) return;
    const reels = snap.data()?.reels;
    if (reels && typeof reels === 'object') writeCache(reels as ReelMap);
  } catch {
    /* ignore */
  }
}

// Os públicos, na ordem que aparecem pro gestor.
export const AUDIENCES: { id: Audience; label: string }[] = [
  { id: 'balconista', label: 'Balconista' },
  { id: 'promotor', label: 'Promotor' },
  { id: 'afiliado-geral', label: 'Afiliado' },
  { id: 'afiliado-saude', label: 'Afiliado — profissional da saúde' },
];

// Quais públicos REALMENTE veem este produto — é o que o gestor precisa subir.
// O afiliado só enxerga a linha GLPEN (ver visibleProducts em products.ts), então
// pedir vídeo de afiliado pra Hyaluvita/Moviben seria trabalho jogado fora e um
// contador que nunca fecha.
export function audiencesForLine(line?: string, brandId?: BrandId): { id: Audience; label: string }[] {
  // Marca em modo balcão (ex.: Drogaria São Paulo) só tem balconista — não há
  // promotor nem afiliado ali. Manda mais que a linha.
  if (brandId && isBalcao(brandId)) return AUDIENCES.filter((a) => a.id === 'balconista');
  if (line === AFILIADO_LINE) return AUDIENCES;
  return AUDIENCES.filter((a) => a.id === 'balconista' || a.id === 'promotor');
}
