// VÍDEO NA NUVEM, NO PLANO GRATUITO.
//
// O caminho óbvio seria o Firebase Storage — e é por isso que eu disse, errado,
// que precisaria de plano pago. Não precisa: o Firestore guarda 1 GiB de graça
// e já é onde os documentos moram. O que impede é o teto de 1 MB POR
// DOCUMENTO, e isso a gente resolve partindo o arquivo, exatamente como em
// docsUpload.ts — que hoje serve um PDF de 13,8 MB em 24 pedaços.
//
// A conta, com 27 acessórios a ~12 MB cada:
//   guardado ..... ~324 MB de 1 GiB          (32%)
//   leituras ..... 20 por reprodução; teto de 50 mil/dia
//   saída ........ 10 GiB/mês — centenas de reproduções
//
// O QUE ESTE CAMINHO NÃO FAZ: transmitir. O vídeo baixa inteiro antes de
// tocar, porque é remontado no navegador. Para 45 segundos é aceitável; para
// vídeo longo não seria, e aí sim valeria o Storage.
//
// O IndexedDB do aparelho vira CACHE: baixou uma vez, não baixa de novo.
import {
  collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { putVideo, getVideo, removeVideo } from './videoStore';

const COL = 'elevaVideos';
const PEDACOS = 'pedacos';
// 600 KB de arquivo viram ~800 KB depois de codificados. O teto é 1 MB.
const TAMANHO_PEDACO = 600 * 1024;

interface FichaVideo {
  bytes: number;
  pedacos: number;
  tipo: string;
}

/** Índice local do que existe na nuvem — leitura síncrona, que a tela precisa. */
const IKEY = 'wp_videos_nuvem';
function indice(): Record<string, FichaVideo> {
  try { return JSON.parse(localStorage.getItem(IKEY) || '{}'); } catch { return {}; }
}
function gravarIndice(i: Record<string, FichaVideo>) {
  try { localStorage.setItem(IKEY, JSON.stringify(i)); } catch { /* cheio */ }
}

export function temVideoNuvem(chave: string): boolean {
  return !!indice()[chave];
}

/** Atualiza o índice a partir da nuvem. Chamado quando o app abre. */
export async function carregarIndiceVideos(): Promise<void> {
  if (!db) return;
  try {
    const snap = await getDocs(collection(db, COL));
    const novo: Record<string, FichaVideo> = {};
    snap.docs.forEach((d) => {
      const x = d.data() as FichaVideo;
      if (x?.pedacos) novo[d.id] = { bytes: x.bytes, pedacos: x.pedacos, tipo: x.tipo };
    });
    gravarIndice(novo);
  } catch {
    /* offline: fica o índice de antes */
  }
}

// ------------------------------------------------------------------ envio ---

function paraBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = '';
  // Em blocos: passar centenas de milhares de argumentos de uma vez estoura a
  // pilha do navegador.
  const passo = 8192;
  for (let i = 0; i < bytes.length; i += passo) {
    s += String.fromCharCode(...bytes.subarray(i, i + passo));
  }
  return btoa(s);
}

/**
 * Manda o vídeo em pedaços. `aoProgredir` alimenta a barra — um arquivo de
 * 12 MB são 20 escritas, e sem barra a gerência acha que travou.
 *
 * Os pedaços vão ANTES da ficha: se a internet cair no meio, sobram pedaços
 * órfãos em vez de um vídeo que aparece na lista e não abre.
 */
export async function enviarVideoNuvem(
  chave: string,
  arquivo: File,
  aoProgredir?: (pct: number) => void,
): Promise<void> {
  if (!db) throw new Error('sem conexão');
  const buf = await arquivo.arrayBuffer();
  const total = Math.ceil(buf.byteLength / TAMANHO_PEDACO);

  for (let n = 0; n < total; n += 1) {
    const fatia = buf.slice(n * TAMANHO_PEDACO, (n + 1) * TAMANHO_PEDACO);
    await setDoc(doc(db, COL, chave, PEDACOS, String(n)), { n, b64: paraBase64(fatia) });
    aoProgredir?.(Math.round(((n + 1) / total) * 100));
  }

  const ficha: FichaVideo = { bytes: buf.byteLength, pedacos: total, tipo: arquivo.type || 'video/mp4' };
  await setDoc(doc(db, COL, chave), { ...ficha, enviadoEm: serverTimestamp() });

  const i = indice();
  i[chave] = ficha;
  gravarIndice(i);
  // Guarda no aparelho de quem subiu também: ele acabou de ter o arquivo na
  // mão, não faz sentido baixar de novo pra assistir.
  await putVideo(chave, new Blob([buf], { type: ficha.tipo })).catch(() => {});
}

// ---------------------------------------------------------------- leitura ---

const montados = new Map<string, string>();

export function urlPronta(chave: string): string | undefined {
  return montados.get(chave);
}

/**
 * Devolve um endereço que o <video> abre. Usa o cache do aparelho quando
 * existe; senão remonta da nuvem e guarda pra próxima.
 */
export async function abrirVideoNuvem(
  chave: string,
  aoProgredir?: (pct: number) => void,
): Promise<string | undefined> {
  const pronto = montados.get(chave);
  if (pronto) return pronto;

  const local = await getVideo(chave).catch(() => undefined);
  if (local) {
    const url = URL.createObjectURL(local);
    montados.set(chave, url);
    return url;
  }

  const ficha = indice()[chave];
  if (!db || !ficha) return undefined;

  const snap = await getDocs(query(collection(db, COL, chave, PEDACOS), orderBy('n')));
  const ordenados = snap.docs
    .map((x) => x.data() as { n: number; b64: string })
    .sort((a, b) => a.n - b.n);
  if (ordenados.length !== ficha.pedacos) throw new Error('vídeo incompleto');

  const partes: string[] = [];
  ordenados.forEach((p, i) => {
    partes.push(p.b64);
    aoProgredir?.(Math.round(((i + 1) / ordenados.length) * 100));
  });

  const bin = atob(partes.join(''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: ficha.tipo });
  await putVideo(chave, blob).catch(() => {});
  const url = URL.createObjectURL(blob);
  montados.set(chave, url);
  return url;
}

export async function apagarVideoNuvem(chave: string): Promise<void> {
  const ficha = indice()[chave];
  const i = indice();
  delete i[chave];
  gravarIndice(i);
  montados.delete(chave);
  await removeVideo(chave).catch(() => {});
  if (!db) return;
  // A ficha primeiro: some da lista na hora, mesmo se apagar os pedaços demorar.
  await deleteDoc(doc(db, COL, chave)).catch(() => {});
  for (let n = 0; n < (ficha?.pedacos || 0); n += 1) {
    await deleteDoc(doc(db, COL, chave, PEDACOS, String(n))).catch(() => {});
  }
}

/** Existe mesmo na nuvem? Usado antes de mostrar erro genérico. */
export async function videoExiste(chave: string): Promise<boolean> {
  if (!db) return false;
  try { return (await getDoc(doc(db, COL, chave))).exists(); } catch { return false; }
}
