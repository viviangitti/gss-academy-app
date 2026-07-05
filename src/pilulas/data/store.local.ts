// Store do app — junta o conteúdo "de fábrica" (seed) com o que o GESTOR cria
// no Painel. Persiste em localStorage. Quando houver Firebase, troca-se só a fonte.
import { useSyncExternalStore } from 'react';
import { PRODUCTS, type Product } from './products';
import { SEED_OFFERS, type Offer } from './offers';
import { CALENDAR, TRENDS, type CalendarDay, type Trend } from './creatorContent';
import type { BrandId } from './brands';

const PKEY = 'wp_custom_products';
const OKEY = 'wp_custom_offers';
const CALKEY = 'wp_custom_calendar';
const TRKEY = 'wp_custom_trends';

// Vídeos ficam só em memória na sessão (object URLs não sobrevivem a reload).
const videoUrls = new Map<string, string>();

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
// Permite o gestor editar campos (ex.: prova social) até de produtos "de fábrica".
export function setProductIG(id: string, instagramUrl: string) {
  const ov = readOverrides();
  ov[id] = { ...(ov[id] || {}), instagramUrl: instagramUrl.trim() || undefined };
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
  if (video) videoUrls.set(p.id, URL.createObjectURL(video));
  emit();
}
export function getVideoUrl(id: string): string | undefined {
  return videoUrls.get(id);
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

// ---- Recado da marca (comunicação do gestor pro time) ----
const RECKEY = 'wp_recado';
export function getRecado(brandId: BrandId): string {
  try {
    const m = JSON.parse(localStorage.getItem(RECKEY) || '{}');
    return m[brandId] || '';
  } catch {
    return '';
  }
}
export function setRecado(brandId: BrandId, text: string) {
  try {
    const m = JSON.parse(localStorage.getItem(RECKEY) || '{}');
    m[brandId] = text;
    localStorage.setItem(RECKEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
  emit();
}

// Hook: re-renderiza quando o store muda.
// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): number {
  return useSyncExternalStore(subscribe, () => version);
}
