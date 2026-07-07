// Store do app — junta o conteúdo "de fábrica" (seed) com o que o GESTOR cria
// no Painel. Persiste em localStorage. Quando houver Firebase, troca-se só a fonte.
import { useSyncExternalStore } from 'react';
import { PRODUCTS, type Product } from './products';
import { SEED_OFFERS, type Offer } from './offers';
import { CALENDAR, TRENDS, type CalendarDay, type Trend } from './creatorContent';
import type { BrandId } from './brands';
import { putVideo, getVideo, removeVideo } from './videoStore';

const PKEY = 'wp_custom_products';
const OKEY = 'wp_custom_offers';
const CALKEY = 'wp_custom_calendar';
const TRKEY = 'wp_custom_trends';

// ---- Vídeos MP4 (persistem no IndexedDB; ver videoStore.ts) ----
// Índice em localStorage só pra saber, na hora (síncrono), quais produtos têm
// vídeo. O blob de verdade fica no IndexedDB e é carregado sob demanda.
const VIDKEY = 'wp_video_ids';
const loadedVideoUrls = new Map<string, string>(); // cache de object URLs já carregados
const loadingVideos = new Set<string>();

function videoIds(): string[] {
  try { return JSON.parse(localStorage.getItem(VIDKEY) || '[]'); } catch { return []; }
}
function addVideoId(id: string) {
  const ids = videoIds();
  if (!ids.includes(id)) { ids.push(id); try { localStorage.setItem(VIDKEY, JSON.stringify(ids)); } catch { /* ignore */ } }
}
function removeVideoId(id: string) {
  try { localStorage.setItem(VIDKEY, JSON.stringify(videoIds().filter((v) => v !== id))); } catch { /* ignore */ }
}

export function hasVideo(id: string): boolean {
  return videoIds().includes(id) || loadedVideoUrls.has(id);
}
export function getVideoObjectUrl(id: string): string | undefined {
  return loadedVideoUrls.get(id);
}
// Carrega o blob do IndexedDB e cria um object URL (assíncrono; avisa via emit).
export function ensureVideoLoaded(id: string) {
  if (loadedVideoUrls.has(id) || loadingVideos.has(id) || !videoIds().includes(id)) return;
  loadingVideos.add(id);
  getVideo(id).then((blob) => {
    loadingVideos.delete(id);
    if (blob) { loadedVideoUrls.set(id, URL.createObjectURL(blob)); emit(); }
  }).catch(() => { loadingVideos.delete(id); });
}
export function setProductVideo(id: string, file: File) {
  // Playback imediato: object URL do próprio arquivo; e persiste no IndexedDB.
  const prev = loadedVideoUrls.get(id);
  if (prev) URL.revokeObjectURL(prev);
  loadedVideoUrls.set(id, URL.createObjectURL(file));
  addVideoId(id);
  emit();
  putVideo(id, file).catch(() => { /* ignore */ });
}
export function clearProductVideo(id: string) {
  const prev = loadedVideoUrls.get(id);
  if (prev) { URL.revokeObjectURL(prev); loadedVideoUrls.delete(id); }
  removeVideoId(id);
  emit();
  removeVideo(id).catch(() => { /* ignore */ });
}

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

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

// ---- Produtos ----
const OVKEY = 'wp_product_overrides';
function readOverrides(): Record<string, Partial<Product>> {
  try {
    return JSON.parse(localStorage.getItem(OVKEY) || '{}');
  } catch {
    return {};
  }
}
// Permite o gestor editar o vídeo (reel do Instagram) até de produtos "de fábrica".
export function setProductIG(id: string, instagramUrl: string) {
  const ov = readOverrides();
  // Tira parâmetros de rastreio (?igsh=...) — o embed do Instagram quer o link limpo.
  const clean = instagramUrl.trim().split('?')[0].trim();
  ov[id] = { ...(ov[id] || {}), instagramUrl: clean || undefined };
  try {
    localStorage.setItem(OVKEY, JSON.stringify(ov));
  } catch {
    /* ignore */
  }
  emit();
}

export function customProducts(): Product[] {
  return read<Product>(PKEY);
}
export function allProducts(): Product[] {
  const ov = readOverrides();
  return [...customProducts(), ...PRODUCTS].map((p) => (ov[p.id] ? { ...p, ...ov[p.id] } : p));
}
export function findProduct(id: string): Product | undefined {
  return allProducts().find((p) => p.id === id);
}
export function addProduct(p: Product, video?: File | null) {
  const list = customProducts();
  list.unshift(p);
  try {
    localStorage.setItem(PKEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  if (video) setProductVideo(p.id, video);
  emit();
}
export function getVideoUrl(id: string): string | undefined {
  return loadedVideoUrls.get(id);
}

// ---- Ofertas ----
export function customOffers(): Offer[] {
  return read<Offer>(OKEY);
}
export function allOffers(): Offer[] {
  return [...customOffers(), ...SEED_OFFERS];
}
export function addOffer(o: Offer) {
  const list = customOffers();
  list.unshift(o);
  try {
    localStorage.setItem(OKEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  emit();
}

// ---- Calendário de conteúdo ----
export function allCalendar(brandId: BrandId): CalendarDay[] {
  return [...read<CalendarDay>(CALKEY).filter((c) => c.brand === brandId), ...CALENDAR];
}
export function addCalendar(item: CalendarDay) {
  const list = read<CalendarDay>(CALKEY);
  list.unshift(item);
  try { localStorage.setItem(CALKEY, JSON.stringify(list)); } catch { /* ignore */ }
  emit();
}

// ---- Tendências ----
export function allTrends(brandId: BrandId): Trend[] {
  return [...read<Trend>(TRKEY).filter((t) => t.brand === brandId), ...TRENDS];
}
export function addTrend(item: Trend) {
  const list = read<Trend>(TRKEY);
  list.unshift(item);
  try { localStorage.setItem(TRKEY, JSON.stringify(list)); } catch { /* ignore */ }
  emit();
}

// ---- Recado da marca (comunicação do gestor pra rede) ----
// Por SEGMENTO de canal: 'todos' vale pra rede inteira; 'farmacia' só pro balcão etc.
const RECKEY = 'wp_recado_v2';
type RecadoMap = Record<string, Record<string, string>>; // marca -> alvo -> texto
function readRecados(): RecadoMap {
  try {
    const m = JSON.parse(localStorage.getItem(RECKEY) || 'null');
    if (m) return m as RecadoMap;
  } catch { /* ignore */ }
  // migra o formato antigo (um texto por marca = 'todos')
  try {
    const old = JSON.parse(localStorage.getItem('wp_recado') || '{}');
    const out: RecadoMap = {};
    for (const [b, t] of Object.entries(old)) {
      if (typeof t === 'string' && t) out[b] = { todos: t };
    }
    return out;
  } catch {
    return {};
  }
}
// O que a vendedora vê: o recado do canal dela, senão o geral.
export function getRecado(brandId: BrandId, segment?: string): string {
  const m = readRecados()[brandId] || {};
  return (segment && m[segment]) || m.todos || '';
}
// O que o gestor edita: exatamente o alvo escolhido (sem fallback).
export function getRecadoFor(brandId: BrandId, target: string): string {
  return (readRecados()[brandId] || {})[target] || '';
}
export function setRecado(brandId: BrandId, text: string, target = 'todos') {
  const all = readRecados();
  const m = all[brandId] || (all[brandId] = {});
  if (text) m[target] = text;
  else delete m[target];
  try { localStorage.setItem(RECKEY, JSON.stringify(all)); } catch { /* ignore */ }
  emit();
}

// Hook: re-renderiza quando o store muda.
// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): number {
  return useSyncExternalStore(subscribe, () => version);
}
