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
  byRole: string;
  at?: Date;
}

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

/** Lê as objeções registradas de uma marca (uso do gestor). */
export async function fetchObjections(brand: BrandId): Promise<TeamObjection[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'elevaObjections'), where('brand', '==', brand));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => {
        const x = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          brand: x.brand as BrandId,
          productId: String(x.productId || ''),
          productName: String(x.productName || ''),
          text: String(x.text || ''),
          answer: String(x.answer || ''),
          byName: String(x.byName || '') || String(x.byEmail || '').split('@')[0] || 'Alguém',
          byRole: String(x.byRole || ''),
          at: (x.createdAt as { toDate?: () => Date })?.toDate?.(),
        } as TeamObjection;
      })
      .sort((a, b) => (b.at?.getTime() || 0) - (a.at?.getTime() || 0));
  } catch {
    return [];
  }
}
