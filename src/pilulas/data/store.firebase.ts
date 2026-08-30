// Store do Eleva com FIREBASE (Firestore + Storage). Ativa só com
// VITE_ELEVA_BACKEND=firebase (senão o app usa store.local.ts). NÃO aplicado à
// produção ainda — precisa deploy das regras (docs/eleva-firebase.md) e teste.
//
// Estrutura: elevaBrands/{brandId}/elevaProducts/{id} e .../elevaOffers/{id}
// Vídeos: Storage em elevaBrands/{brandId}/videos/{productId}.mp4
import { useSyncExternalStore } from 'react';
import { collectionGroup, doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { PRODUCTS, type Product } from './products';
import { SEED_OFFERS, type Offer } from './offers';
import { CALENDAR, TRENDS, type CalendarDay, type Trend } from './creatorContent';
import type { BrandId } from './brands';

let productsCache: Product[] = [];
let offersCache: Offer[] = [];
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

let started = false;
function start() {
  if (started || !db) return;
  started = true;
  onSnapshot(collectionGroup(db, 'elevaProducts'), (snap) => {
    productsCache = snap.docs.map((d) => d.data() as Product);
    emit();
  });
  onSnapshot(collectionGroup(db, 'elevaOffers'), (snap) => {
    offersCache = snap.docs.map((d) => d.data() as Offer);
    emit();
  });
}

// ---- Produtos ----
export function allProducts(): Product[] {
  start();
  return [...productsCache, ...PRODUCTS];
}
export function findProduct(id: string): Product | undefined {
  return allProducts().find((p) => p.id === id);
}
export async function setProductIG(id: string, instagramUrl: string) {
  if (!db) return;
  const clean = instagramUrl.trim().split('?')[0].trim();
  await setDoc(doc(db, 'elevaOverrides', id), { instagramUrl: clean || null }, { merge: true });
}
// Devolve se chegou na nuvem — paridade com o store local, que a tela usa
// pra não dizer "o time já vê" quando o cadastro ficou no aparelho.
export async function addProduct(p: Product, video?: File | null): Promise<boolean> {
  if (!db) return false;
  let videoUrl = p.videoUrl ?? null;
  if (video && storage) {
    const r = ref(storage, `elevaBrands/${p.brand}/videos/${p.id}.mp4`);
    await uploadBytes(r, video);
    videoUrl = await getDownloadURL(r);
  }
  await setDoc(doc(db, 'elevaBrands', p.brand, 'elevaProducts', p.id), {
    ...p,
    videoUrl,
    createdAt: serverTimestamp(),
  });
  return true;
}
// No modo Firebase o vídeo vem em product.videoUrl (URL do Storage).
export function getVideoUrl(_id: string): string | undefined {
  return undefined;
}
export function hasVideo(_id: string): boolean {
  return false;
}
export function getVideoObjectUrl(_id: string): string | undefined {
  return undefined;
}
export function ensureVideoLoaded(_id: string) {
  /* No Firebase o vídeo é servido direto da URL do Storage (product.videoUrl). */
}
export async function setProductVideo(id: string, file: File) {
  if (!db || !storage) return;
  const r = ref(storage, `elevaOverrides/${id}/video.mp4`);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  await setDoc(doc(db, 'elevaOverrides', id), { videoUrl: url }, { merge: true });
}
export function clearProductVideo(_id: string) {
  /* noop no Firebase por enquanto */
}
// Foto de capa — paridade (por enquanto stub; com Storage ligado vira upload).
export function hasImage(_id: string): boolean {
  return false;
}
export function getProductImageUrl(_id: string): string | undefined {
  return undefined;
}
export function ensureImageLoaded(_id: string) {
  /* no Firebase a capa vem de product.imageUrl */
}
export async function setProductImage(id: string, file: File) {
  if (!db || !storage) return;
  const r = ref(storage, `elevaOverrides/${id}/capa`);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  await setDoc(doc(db, 'elevaOverrides', id), { imageUrl: url }, { merge: true });
}
export function clearProductImage(_id: string) {
  /* noop no Firebase por enquanto */
}

// ---- Ofertas ----
export function allOffers(): Offer[] {
  start();
  return [...offersCache, ...SEED_OFFERS];
}
export async function addOffer(o: Offer) {
  if (!db) return;
  const id = 'o-' + Math.random().toString(36).slice(2, 10);
  await setDoc(doc(db, 'elevaBrands', o.brand, 'elevaOffers', id), {
    ...o,
    createdAt: serverTimestamp(),
  });
}

// ---- Calendário ----
export function allCalendar(brandId: BrandId): CalendarDay[] {
  return CALENDAR.filter((c) => !c.brand || c.brand === brandId);
}
export async function addCalendar(item: CalendarDay) {
  if (!db) return;
  const id = 'c-' + Math.random().toString(36).slice(2, 10);
  await setDoc(doc(db, 'elevaBrands', item.brand!, 'elevaCalendar', id), { ...item, createdAt: serverTimestamp() });
}

// ---- Tendências ----
export function allTrends(brandId: BrandId): Trend[] {
  return TRENDS.filter((t) => !t.brand || t.brand === brandId);
}
export async function addTrend(item: Trend) {
  if (!db) return;
  await setDoc(doc(db, 'elevaBrands', item.brand!, 'elevaTrends', item.id), { ...item, createdAt: serverTimestamp() });
}

// ---- Recado da marca (por segmento; 'todos' = rede inteira) ----
const recadoCache: Record<string, Record<string, string>> = {};
export function getRecado(brandId: BrandId, segment?: string): string {
  const m = recadoCache[brandId] || {};
  return (segment && m[segment]) || m.todos || '';
}
export function getRecadoFor(brandId: BrandId, target: string): string {
  return (recadoCache[brandId] || {})[target] || '';
}
export async function setRecado(brandId: BrandId, text: string, target = 'todos') {
  const m = recadoCache[brandId] || (recadoCache[brandId] = {});
  if (text) m[target] = text;
  else delete m[target];
  emit();
  if (!db) return;
  await setDoc(doc(db, 'elevaBrands', brandId), { recados: { [target]: text || null } }, { merge: true });
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): number {
  return useSyncExternalStore(subscribe, () => version);
}

/** Paridade com o store local: no Firebase as telas já ouvem os snapshots. */
export function avisarMudanca() { /* noop */ }
