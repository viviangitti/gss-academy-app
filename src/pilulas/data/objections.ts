// Objeções da PONTA: o balconista/promotor/afiliado registra objeções reais que
// ele (ou o cliente/paciente) levantou e que ainda não estão na pílula. Vira um
// "ponto de contato" — o gestor vê no painel o que o mercado pergunta de verdade.
//
// Coleção: elevaObjections/{auto}. Qualquer pessoa logada cria; só gestor lê a
// lista (ver firestore.eleva.rules).
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import type { BrandId } from './brands';

export interface ObjectionInput {
  brand: BrandId;
  productId: string;
  productName: string;
  text: string;   // a objeção que a pessoa ouviu
  answer?: string; // como ela respondeu / o que gostaria (opcional)
}

export interface TeamObjection {
  id: string;
  brand: BrandId;
  productId: string;
  productName: string;
  text: string;
  answer: string;
  byName: string;
  byEmail: string;
  byRole: string;
  at?: Date;
}

// Doc do Firestore -> objeto do app (usado nas duas leituras).
function toObjection(id: string, x: Record<string, unknown>): TeamObjection {
  return {
    id,
    brand: x.brand as BrandId,
    productId: String(x.productId || ''),
    productName: String(x.productName || ''),
    text: String(x.text || ''),
    answer: String(x.answer || ''),
    byEmail: String(x.byEmail || ''),
    byName: String(x.byName || '') || String(x.byEmail || '').split('@')[0] || 'Alguém',
    byRole: String(x.byRole || ''),
    at: (x.createdAt as { toDate?: () => Date })?.toDate?.(),
  };
}
const maisNovoPrimeiro = (a: TeamObjection, b: TeamObjection) =>
  (b.at?.getTime() || 0) - (a.at?.getTime() || 0);

/** Registra uma objeção nova. Best-effort: falha silenciosa não quebra o app. */
export async function submitObjection(
  o: ObjectionInput,
  by: { name?: string; role?: string },
): Promise<boolean> {
  if (!db || !o.text.trim()) return false;
  try {
    await addDoc(collection(db, 'elevaObjections'), {
      brand: o.brand,
      productId: o.productId,
      productName: o.productName,
      text: o.text.trim(),
      answer: (o.answer || '').trim(),
      byName: by.name || auth?.currentUser?.displayName || '',
      byEmail: auth?.currentUser?.email || '',
      byRole: by.role || '',
      createdAt: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
}

/** Histórico completo de objeções da marca, mais novas primeiro (uso do gestor). */
export async function fetchObjections(brand: BrandId): Promise<TeamObjection[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'elevaObjections'), where('brand', '==', brand));
    const snap = await getDocs(q);
    return snap.docs.map((d) => toObjection(d.id, d.data() as Record<string, unknown>)).sort(maisNovoPrimeiro);
  } catch {
    return [];
  }
}

/**
 * As objeções que ESTA pessoa já registrou neste produto — é a confirmação de
 * que chegou (ela vê o que mandou, com data). Filtro por e-mail no cliente pra
 * não precisar de índice composto no Firestore.
 */
export async function fetchMyObjections(productId: string, email?: string): Promise<TeamObjection[]> {
  if (!db || !email) return [];
  try {
    const q = query(collection(db, 'elevaObjections'), where('productId', '==', productId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => toObjection(d.id, d.data() as Record<string, unknown>))
      .filter((o) => o.byEmail && o.byEmail === email)
      .sort(maisNovoPrimeiro);
  } catch {
    return [];
  }
}

/** Data curta pt-BR (ex.: 21/07 14:30) — usada no histórico. */
export function objectionDate(d?: Date): string {
  if (!d) return '';
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
