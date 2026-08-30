// O QUE A GERÊNCIA CADASTRA PRECISA CHEGAR NO TIME.
//
// O cadastro de produto vivia só no localStorage: a gerente cadastrava um
// acessório, via na tela dela, e o time nunca recebia. Pior, ninguém via erro
// — parecia que tinha funcionado.
//
// Aqui ele vai pro Firestore, do mesmo jeito que os documentos e as condições
// comerciais. É JSON pequeno (uns 2 KB por produto), então cabe folgado num
// documento e não precisa de partição nem de Storage pago.
//
// O que NÃO passa por aqui: vídeo e foto de capa. Vídeo tem dezenas de MB e
// depende do Storage; foto ainda mora no IndexedDB do aparelho. Enquanto for
// assim, a tela avisa — mentir que subiu é pior que dizer que não dá.
import { collection, deleteDoc, doc, getDocs, query, setDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Product } from './products';
import type { BrandId } from './brands';

const COL = 'elevaProdutos';
const CACHE = 'wp_produtos_nuvem';

/** Cache local: o catálogo abre na hora, sem esperar a rede do showroom. */
function lerCache(): Product[] {
  try { return JSON.parse(localStorage.getItem(CACHE) || '[]'); } catch { return []; }
}
function gravarCache(lista: Product[]) {
  try { localStorage.setItem(CACHE, JSON.stringify(lista)); } catch { /* cheio */ }
}

export function produtosNuvem(brand?: BrandId): Product[] {
  const todos = lerCache();
  return brand ? todos.filter((p) => p.brand === brand) : todos;
}

let carregando = false;

/** Busca o que a gerência cadastrou. Silencioso: sem rede, fica o cache. */
export async function carregarProdutosNuvem(brand: BrandId, aoTerminar?: () => void): Promise<void> {
  if (!db || carregando) return;
  carregando = true;
  try {
    const snap = await getDocs(query(collection(db, COL), where('brand', '==', brand)));
    const vindos = snap.docs.map((d) => d.data().produto as Product).filter(Boolean);
    const outras = lerCache().filter((p) => p.brand !== brand);
    gravarCache([...vindos, ...outras]);
    aoTerminar?.();
  } catch {
    /* offline ou sem permissão: fica o cache */
  } finally {
    carregando = false;
  }
}

/**
 * Publica o produto pra todo mundo. Só gestor consegue (regra do Firestore).
 *
 * O documento guarda o produto inteiro num campo só. Não é a forma mais
 * elegante de modelar, mas é a que não quebra quando o formato do produto
 * mudar — e ele muda toda semana.
 */
export async function publicarProduto(p: Product): Promise<void> {
  const lista = lerCache().filter((x) => x.id !== p.id);
  gravarCache([p, ...lista]);
  if (!db) throw new Error('sem conexão');
  await setDoc(doc(db, COL, p.id), {
    brand: p.brand,
    produto: p,
    publicadoEm: serverTimestamp(),
  });
}

export async function apagarProdutoNuvem(id: string): Promise<void> {
  gravarCache(lerCache().filter((p) => p.id !== id));
  if (!db) return;
  await deleteDoc(doc(db, COL, id)).catch(() => {});
}
