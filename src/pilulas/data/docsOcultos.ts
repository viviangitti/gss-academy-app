// DOCUMENTO QUE SAI DE CARTAZ — sem esperar por mim.
//
// Os 20 PDFs oficiais da Ramasa viajam DENTRO do app: são estáveis, abrem
// offline e não gastam Firestore. O preço disso é que a gerência não conseguia
// tirar nenhum deles do ar — o Painel só oferecia a lixeira para o que tinha
// sido subido pelo app, e nada tinha sido. Na prática o botão "remover" existia
// para uma lista vazia.
//
// Isso importa mais do que parece no automotivo: a carta comercial vence todo
// dia 2, o comunicado é substituído, e documento vencido no ar é vendedor
// prometendo condição que a loja não pratica mais. Quem descobre isso é a
// gerência, num sábado, e ela não pode depender de mim para agir.
//
// Como funciona: um documento por marca, com a lista de ids escondidos.
//
//     elevaDocsOcultos/{brand} = { ids: ['guia-jaecoo-7-my27', ...] }
//
// Esconder NÃO apaga. O PDF continua publicado no app e volta a aparecer com um
// clique — é a diferença entre uma decisão reversível e uma perda de material
// oficial. Para os que a própria gerência subiu, a lixeira continua sendo a
// certa: lá o arquivo é dela, e apagar libera espaço no Firestore.
import { useSyncExternalStore } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { BrandId } from './brands';

const COL = 'elevaDocsOcultos';
const CKEY = 'wp_docs_ocultos';

// ---- avisa a tela quando a lista muda ----
let version = 0;
const listeners = new Set<() => void>();
function emit() {
  version += 1;
  listeners.forEach((l) => l());
}
export function useDocsOcultos(): number {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => version,
  );
}

// ---- cache local: a tela de Documentos abre offline, e precisa abrir CERTA ----
type Mapa = Record<string, string[]>;
function lerCache(): Mapa {
  try { return JSON.parse(localStorage.getItem(CKEY) || '{}'); } catch { return {}; }
}
function gravarCache(m: Mapa) {
  try { localStorage.setItem(CKEY, JSON.stringify(m)); } catch { /* cheio */ }
  emit();
}

export function ocultosDaMarca(brand: BrandId): string[] {
  return lerCache()[brand] || [];
}

export function estaOculto(brand: BrandId, id: string): boolean {
  return ocultosDaMarca(brand).includes(id);
}

export async function carregarOcultos(brand: BrandId): Promise<void> {
  if (!db) return;
  try {
    const d = await getDoc(doc(db, COL, brand));
    const ids = (d.exists() ? (d.data() as { ids?: string[] }).ids : []) || [];
    gravarCache({ ...lerCache(), [brand]: ids });
  } catch {
    /* offline: fica o que já estava no cache */
  }
}

/**
 * Liga e desliga a visibilidade de um documento que veio no app.
 *
 * Grava a lista inteira em vez de arrayUnion/arrayRemove de propósito: são
 * poucos ids, o documento é minúsculo, e assim o cache local e a nuvem contam
 * exatamente a mesma história — sem estado intermediário para a gerência ver.
 */
export async function alternarOculto(brand: BrandId, id: string): Promise<void> {
  const atuais = ocultosDaMarca(brand);
  const novos = atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id];
  gravarCache({ ...lerCache(), [brand]: novos });
  if (!db) return;
  await setDoc(doc(db, COL, brand), { ids: novos }, { merge: true }).catch(() => {
    // Falhou na nuvem: devolve o cache pro que era, senão a gerência acha que
    // tirou do ar e o time continua vendo.
    gravarCache({ ...lerCache(), [brand]: atuais });
    throw new Error('nuvem');
  });
}
