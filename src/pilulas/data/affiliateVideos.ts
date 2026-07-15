// Vídeos por tipo de afiliado (geral x profissional da saúde), por produto.
// - MP4: reutiliza o mecanismo de vídeo do store (IndexedDB), com uma CHAVE
//   composta `av:<produto>:<tipo>` — não precisa mexer no store.
// - Reel do Instagram: guardado aqui num mapa em localStorage (público = URL,
//   funciona entre aparelhos; o MP4, como todo vídeo do app, fica no aparelho).
import type { AffiliateType } from '../AuthContext';

// Chave do MP4 no store (IndexedDB) para um produto + tipo de afiliado.
export function affiliateVideoKey(productId: string, type: AffiliateType): string {
  return `av:${productId}:${type}`;
}

const RKEY = 'wp_affiliate_reels';

function readReels(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(RKEY) || '{}');
  } catch {
    return {};
  }
}

export function getAffiliateReel(productId: string, type: AffiliateType): string | undefined {
  const url = readReels()[`${productId}:${type}`];
  return url && url.trim() ? url : undefined;
}

export function setAffiliateReel(productId: string, type: AffiliateType, url: string): void {
  const m = readReels();
  const k = `${productId}:${type}`;
  if (url.trim()) m[k] = url.trim();
  else delete m[k];
  try {
    localStorage.setItem(RKEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export const AFFILIATE_TYPES: { id: AffiliateType; label: string }[] = [
  { id: 'geral', label: 'Afiliado geral' },
  { id: 'saude', label: 'Profissional da saúde' },
];
