// DOCUMENTO GRANDE NO PLANO GRÁTIS.
//
// O caminho óbvio seria o Firebase Storage, mas o bucket do projeto eleva-gss
// não está criado e criar esbarra em plano pago. Só que Storage não é a única
// saída: o Firestore, que já usamos e é grátis, guarda 1 GiB — mais de trinta
// vezes o que estes documentos ocupam. O problema é só o teto de 1 MB POR
// DOCUMENTO. Então a gente parte o arquivo.
//
// Como funciona: o PDF é cortado em pedaços de 600 KB (que viram ~800 KB depois
// de codificados, com folga pro teto), cada pedaço vira um documento, e na hora
// de abrir a gente remonta no navegador. O usuário não vê nada disso: clica e o
// PDF abre.
//
// A conta do plano grátis, com os 28 MB de material da Ramasa:
//   guardado ....... 28 MB de 1 GiB  (2,8%)
//   leituras ....... abrir um guia de 5 MB custa 9 leituras; o teto é 50 mil/dia
//   saída .......... 10 GiB/mês — daria pra baixar tudo 350 vezes
//
// Se um dia o volume crescer muito, aí sim vale ligar o Storage. Hoje, não.
import {
  collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { BrandId } from './brands';
import type { PrateleiraId } from './documentos';

const COL = 'elevaDocs';
const PEDACOS = 'pedacos';
// 600 KB de arquivo viram ~800 KB codificados. O teto do Firestore é 1 MB.
const TAMANHO_PEDACO = 600 * 1024;

export interface DocNuvem {
  id: string;
  brand: BrandId;
  prateleira: PrateleiraId;
  titulo: string;
  paraQue: string;
  interno: boolean;
  nomeArquivo: string;
  tipo: string;
  bytes: number;
  pedacos: number;
  criadoEm: number;
}

// ---------------------------------------------------------------- leitura ---

let cache: DocNuvem[] = [];
const montados = new Map<string, string>(); // id -> blob: URL já remontada

export function docsNuvemDaMarca(brand: BrandId): DocNuvem[] {
  return cache.filter((d) => d.brand === brand);
}

export async function carregarDocsNuvem(brand: BrandId): Promise<DocNuvem[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, COL), where('brand', '==', brand)));
    const vindos = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as DocNuvem[];
    cache = [...cache.filter((d) => d.brand !== brand), ...vindos];
    return vindos;
  } catch {
    return [];
  }
}

/**
 * Remonta o arquivo e devolve um endereço que o navegador abre.
 *
 * Guarda o resultado na memória: abrir o mesmo guia duas vezes na mesma sessão
 * não baixa de novo. `aoProgredir` existe porque um guia de 5 MB no 4G demora —
 * e barra parada faz a pessoa achar que travou.
 */
export async function abrirDocNuvem(d: DocNuvem, aoProgredir?: (pct: number) => void): Promise<string> {
  const pronto = montados.get(d.id);
  if (pronto) return pronto;
  if (!db) throw new Error('sem conexão');

  const partes: string[] = [];
  const q = query(collection(db, COL, d.id, PEDACOS), orderBy('n'));
  const snap = await getDocs(q);
  const ordenados = snap.docs
    .map((x) => x.data() as { n: number; b64: string })
    .sort((a, b) => a.n - b.n);
  if (ordenados.length !== d.pedacos) throw new Error('arquivo incompleto');

  ordenados.forEach((p, i) => {
    partes.push(p.b64);
    aoProgredir?.(Math.round(((i + 1) / ordenados.length) * 100));
  });

  const bin = atob(partes.join(''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: d.tipo || 'application/pdf' }));
  montados.set(d.id, url);
  return url;
}

// ------------------------------------------------------------------ envio ---

function paraBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = '';
  // Em blocos: passar 600 mil argumentos de uma vez estoura a pilha do navegador.
  const passo = 8192;
  for (let i = 0; i < bytes.length; i += passo) {
    s += String.fromCharCode(...bytes.subarray(i, i + passo));
  }
  return btoa(s);
}

export interface EnvioDoc {
  brand: BrandId;
  prateleira: PrateleiraId;
  titulo: string;
  paraQue: string;
  interno: boolean;
  arquivo: File;
}

/** Manda o documento em pedaços. `aoProgredir` alimenta a barra na tela. */
export async function enviarDocNuvem(e: EnvioDoc, aoProgredir?: (pct: number) => void): Promise<void> {
  if (!db) throw new Error('sem conexão');
  const buf = await e.arquivo.arrayBuffer();
  const total = Math.ceil(buf.byteLength / TAMANHO_PEDACO);
  const id = 'd-' + Math.random().toString(36).slice(2, 10);

  // Os pedaços primeiro, a ficha por último: se a internet cair no meio, fica um
  // punhado de pedaços órfãos em vez de um documento que aparece na lista e não
  // abre. Órfão ninguém vê; documento quebrado, todo mundo.
  for (let n = 0; n < total; n += 1) {
    const fatia = buf.slice(n * TAMANHO_PEDACO, (n + 1) * TAMANHO_PEDACO);
    await setDoc(doc(db, COL, id, PEDACOS, String(n)), { n, b64: paraBase64(fatia) });
    aoProgredir?.(Math.round(((n + 1) / total) * 100));
  }

  await setDoc(doc(db, COL, id), {
    brand: e.brand,
    prateleira: e.prateleira,
    titulo: e.titulo.trim(),
    paraQue: e.paraQue.trim(),
    interno: e.interno,
    nomeArquivo: e.arquivo.name.slice(0, 90),
    tipo: e.arquivo.type || 'application/pdf',
    bytes: buf.byteLength,
    pedacos: total,
    criadoEm: Date.now(),
    enviadoEm: serverTimestamp(),
  });
}

export async function apagarDocNuvem(d: DocNuvem): Promise<void> {
  if (!db) return;
  // A ficha primeiro: some da lista na hora, mesmo se apagar os pedaços demorar.
  await deleteDoc(doc(db, COL, d.id)).catch(() => {});
  cache = cache.filter((x) => x.id !== d.id);
  for (let n = 0; n < d.pedacos; n += 1) {
    await deleteDoc(doc(db, COL, d.id, PEDACOS, String(n))).catch(() => {});
  }
}

/** Existe mesmo? Usado antes de mostrar erro genérico pro gestor. */
export async function docExiste(id: string): Promise<boolean> {
  if (!db) return false;
  try {
    return (await getDoc(doc(db, COL, id))).exists();
  } catch {
    return false;
  }
}
