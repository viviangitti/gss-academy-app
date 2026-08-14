// Objeções da PONTA: o balconista/promotor/afiliado registra objeções reais que
// ele (ou o cliente/paciente) levantou e que ainda não estão na pílula. Vira um
// "ponto de contato" — o gestor vê no painel o que o mercado pergunta de verdade.
//
// Coleção: elevaObjections/{auto}. Qualquer pessoa logada cria; só gestor lê a
// lista (ver firestore.eleva.rules).
import { collection, addDoc, doc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
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
  answer: string;   // como a PESSOA respondeu na hora (o que ela contou)
  byName: string;
  byEmail: string;
  byRole: string;
  at?: Date;
  /** A resposta oficial que o gestor escreveu. É o que volta pro time. */
  resposta?: string;
  /** Publicada = todo o time vê dentro do produto. Só o gestor liga isso. */
  publicada?: boolean;
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
    resposta: String(x.resposta || '') || undefined,
    publicada: x.publicada === true,
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
 * que chegou (ela vê o que mandou, com data).
 *
 * Filtra por byEmail NO SERVIDOR, não no navegador. Antes a consulta era por
 * productId e o filtro por e-mail acontecia aqui — o que fazia o Firestore
 * mandar pro aparelho dela a objeção de TODOS os colegas daquele produto.
 * Objeção é texto livre e pode conter relato de cliente; ninguém precisa ver a
 * do outro. O productId é filtrado aqui (evita índice composto).
 */
export async function fetchMyObjections(productId: string, email?: string): Promise<TeamObjection[]> {
  if (!db || !email) return [];
  try {
    const q = query(collection(db, 'elevaObjections'), where('byEmail', '==', email));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => toObjection(d.id, d.data() as Record<string, unknown>))
      .filter((o) => o.productId === productId)
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

/**
 * O gestor responde e publica — é o que fecha o ciclo.
 *
 * Sem isto, a objeção que o vendedor traz da rua morre no painel: ele registra,
 * o gestor lê, e o time nunca fica sabendo. Com isto, a resposta volta pra
 * dentro do produto e o próximo vendedor que ouvir a mesma frase já acha pronto.
 */
export async function responderObjecao(id: string, resposta: string, publicar: boolean): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'elevaObjections', id), {
    resposta: resposta.trim(),
    publicada: publicar && !!resposta.trim(),
    respondidaEm: serverTimestamp(),
  });
}

/**
 * As objeções que o gestor já respondeu e publicou, para o time inteiro ver
 * dentro do produto. Todo mundo logado lê estas — e SÓ estas: a objeção que
 * ninguém revisou continua visível apenas para quem escreveu e para o gestor.
 */
export async function fetchPublicadas(brand: BrandId): Promise<TeamObjection[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'elevaObjections'),
      where('brand', '==', brand),
      where('publicada', '==', true),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toObjection(d.id, d.data() as Record<string, unknown>)).sort(maisNovoPrimeiro);
  } catch {
    return [];
  }
}
