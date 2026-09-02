// FOTO NA NUVEM.
//
// Por que existe: `setProductImage` guardava a foto só no IndexedDB do aparelho
// de quem subiu. A gerente subia a foto do acessório, via na tela dela, e o
// time inteiro continuava vendo o card vazio — igualzinho ao que acontecia com
// os vídeos antes de irem pra nuvem.
//
// Diferente do vídeo, foto cabe num documento só. O limite do Firestore é 1 MB
// por documento, e uma foto de catálogo redimensionada dá 150–400 KB. Então
// aqui não tem quebra em pedaços: reduz, comprime até caber com folga e grava
// de uma vez. Menos escrita, menos coisa pra dar errado.
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const COL = 'elevaImagens';
const IKEY = 'wp_imagens_nuvem';
/** Teto do base64. 700 KB deixa folga confortável para o limite de 1 MB do doc. */
const TETO_B64 = 700 * 1024;
const LADO_MAX = 1400;

interface FichaImagem {
  tipo: string;
  bytes: number;
  b64: string;
}

/** Índice em memória + cache no aparelho, pra tela não piscar a cada abertura. */
let indice: Record<string, { tipo: string; bytes: number }> = {};
const montadas = new Map<string, string>();

function lerCache(): Record<string, { tipo: string; bytes: number }> {
  try { return JSON.parse(localStorage.getItem(IKEY) || '{}'); } catch { return {}; }
}
function gravarCache() {
  try { localStorage.setItem(IKEY, JSON.stringify(indice)); } catch { /* storage cheio */ }
}

export function temImagemNuvem(chave: string): boolean {
  if (!Object.keys(indice).length) indice = lerCache();
  return !!indice[chave];
}

/** Só as chaves e os tamanhos — a foto em si só desce quando a tela pede. */
export async function carregarIndiceImagens(): Promise<void> {
  indice = lerCache();
  if (!db) return;
  try {
    const snap = await getDocs(collection(db, COL));
    const novo: typeof indice = {};
    snap.forEach((d) => {
      const v = d.data() as FichaImagem;
      novo[d.id] = { tipo: v.tipo, bytes: v.bytes };
    });
    indice = novo;
    gravarCache();
  } catch {
    /* offline ou sem permissão: fica com o que o aparelho já sabia */
  }
}

/**
 * Encolhe a foto até caber num documento.
 *
 * O celular do showroom tira foto de 4 MB. Subir isso inteiro gastaria banda de
 * quem vê e estouraria o limite do documento — e ninguém precisa de 4 MB para
 * um card de catálogo.
 */
async function encolhe(arquivo: File): Promise<{ b64: string; tipo: string; bytes: number }> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const l = Math.round(bitmap.width * escala);
  const a = Math.round(bitmap.height * escala);
  const tela = document.createElement('canvas');
  tela.width = l; tela.height = a;
  tela.getContext('2d')?.drawImage(bitmap, 0, 0, l, a);
  bitmap.close?.();

  // Vai baixando a qualidade só até caber. Começa alto porque foto de acessório
  // com compressão pesada demais vira borrão, e borrão ninguém oferece.
  for (const q of [0.85, 0.75, 0.65, 0.55, 0.45]) {
    const url = tela.toDataURL('image/jpeg', q);
    const b64 = url.slice(url.indexOf(',') + 1);
    if (b64.length <= TETO_B64) return { b64, tipo: 'image/jpeg', bytes: Math.round(b64.length * 0.75) };
  }
  throw new Error('não consegui deixar a foto pequena o bastante');
}

export async function enviarImagemNuvem(chave: string, arquivo: File): Promise<void> {
  if (!db) throw new Error('sem conexão com o servidor');
  const { b64, tipo, bytes } = await encolhe(arquivo);
  await setDoc(doc(db, COL, chave), { tipo, bytes, b64, enviadoEm: serverTimestamp() });
  indice[chave] = { tipo, bytes };
  gravarCache();
  montadas.set(chave, `data:${tipo};base64,${b64}`);
}

/** A foto já baixada nesta sessão, se houver. */
export function urlImagemPronta(chave: string): string | undefined {
  return montadas.get(chave);
}

export async function abrirImagemNuvem(chave: string): Promise<string | undefined> {
  const pronta = montadas.get(chave);
  if (pronta) return pronta;
  if (!db || !temImagemNuvem(chave)) return undefined;
  try {
    const snap = await getDoc(doc(db, COL, chave));
    const v = snap.data() as FichaImagem | undefined;
    if (!v?.b64) return undefined;
    const url = `data:${v.tipo};base64,${v.b64}`;
    montadas.set(chave, url);
    return url;
  } catch {
    return undefined;
  }
}

export async function apagarImagemNuvem(chave: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, COL, chave)).catch(() => { /* já não existia */ });
  delete indice[chave];
  gravarCache();
  montadas.delete(chave);
}
