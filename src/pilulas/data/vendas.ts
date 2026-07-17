// Venda declarada pela ponta — o único jeito de enxergar a venda de BALCÃO.
//
// A venda do balconista acontece no balcão: nunca passa pelo site, então o
// rastreio de link (UTM) jamais captura. Aqui a pessoa declara o que vendeu e
// informa o número do cupom/NF.
//
// DECISÃO (LGPD): NÃO guardamos foto do cupom. Cupom de farmácia mostra o que a
// cliente comprou — isso é dado sensível de saúde, a categoria mais protegida da
// lei. O número do cupom dá rastreabilidade (dá pra conferir no sistema da
// farmácia) sem guardar dado de terceiro.
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';

export type VendaStatus = 'pendente' | 'aprovada' | 'recusada';

export interface Venda {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  brand: string;
  productId: string;
  productName: string;
  qty: number;
  cupom: string; // número do cupom/NF — sem imagem, de propósito
  status: VendaStatus;
  at: string; // ISO — quando foi declarada
}

export interface NovaVenda {
  brand: string;
  role: string;
  name: string;
  productId: string;
  productName: string;
  qty: number;
  cupom: string;
}

/** Declara uma venda. Entra sempre como pendente — quem aprova é o gestor. */
export async function registrarVenda(v: NovaVenda): Promise<void> {
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) throw new Error('sem sessão');
  await addDoc(collection(db, 'elevaSales'), {
    uid,
    name: v.name || auth?.currentUser?.displayName || '',
    email: auth?.currentUser?.email || '',
    role: v.role,
    brand: v.brand,
    productId: v.productId,
    productName: v.productName,
    qty: v.qty,
    cupom: v.cupom.trim(),
    status: 'pendente' as VendaStatus,
    at: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

function toVenda(id: string, x: Record<string, unknown>): Venda {
  const st = x.status;
  return {
    id,
    uid: String(x.uid || ''),
    name: String(x.name || '') || String(x.email || '').split('@')[0] || 'Sem nome',
    email: String(x.email || ''),
    role: String(x.role || ''),
    brand: String(x.brand || ''),
    productId: String(x.productId || ''),
    productName: String(x.productName || ''),
    qty: Number(x.qty) || 0,
    cupom: String(x.cupom || ''),
    status: st === 'aprovada' || st === 'recusada' ? st : 'pendente',
    at: String(x.at || ''),
  };
}

/** Todas as vendas da marca — só o gestor consegue ler (ver regras). */
export async function fetchVendas(brand: string): Promise<Venda[]> {
  if (!db) return [];
  const q = query(collection(db, 'elevaSales'), where('brand', '==', brand), orderBy('at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toVenda(d.id, d.data()));
}

/** As minhas vendas (a pessoa vê o que declarou e em que pé está). */
export async function fetchMinhasVendas(): Promise<Venda[]> {
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return [];
  const q = query(collection(db, 'elevaSales'), where('uid', '==', uid), orderBy('at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toVenda(d.id, d.data()));
}

/** Gestor aprova ou recusa. */
export async function decidirVenda(id: string, status: 'aprovada' | 'recusada'): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'elevaSales', id), { status, decidedAt: serverTimestamp() });
}

/** Quem vende mais — só conta o que o gestor aprovou. */
export function rankVendedores(vendas: Venda[]): { name: string; role: string; qty: number; vendas: number }[] {
  const m = new Map<string, { name: string; role: string; qty: number; vendas: number }>();
  for (const v of vendas) {
    if (v.status !== 'aprovada') continue;
    const cur = m.get(v.uid) || { name: v.name, role: v.role, qty: 0, vendas: 0 };
    cur.qty += v.qty;
    cur.vendas += 1;
    m.set(v.uid, cur);
  }
  return [...m.values()].sort((a, b) => b.qty - a.qty);
}
