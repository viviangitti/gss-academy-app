// Vídeo por PÚBLICO, em cada produto.
// O conteúdo do afiliado é diferente do do promotor, que é diferente do do
// balconista — então cada produto pode ter um vídeo por público. Quem não tiver
// vídeo do público dela cai no vídeo padrão do produto.
//
// - MP4: reutiliza o mecanismo de vídeo do store (IndexedDB) com uma CHAVE
//   composta `av:<produto>:<publico>` — não precisa mexer no store.
// - Reel do Instagram: guardado aqui num mapa em localStorage.
import type { Audience } from '../AuthContext';

// Chave do MP4 no store (IndexedDB) para um produto + público.
export function audienceVideoKey(productId: string, a: Audience): string {
  return `av:${productId}:${a}`;
}

const RKEY = 'wp_affiliate_reels';

function readReels(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(RKEY) || '{}');
  } catch {
    return {};
  }
}

export function getAudienceReel(productId: string, a: Audience): string | undefined {
  const url = readReels()[`${productId}:${a}`];
  return url && url.trim() ? url : undefined;
}

export function setAudienceReel(productId: string, a: Audience, url: string): void {
  const m = readReels();
  const k = `${productId}:${a}`;
  if (url.trim()) m[k] = url.trim();
  else delete m[k];
  try {
    localStorage.setItem(RKEY, JSON.stringify(m));
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
