// O PREÇO DO ACESSÓRIO, editável pela gerência.
//
// Os 27 acessórios vivem no código, com o preço junto. Isso resolveu o começo —
// mas preço de acessório muda por tabela nova, por campanha, por decisão de
// margem, e toda mudança virava pedido pra mim. Enquanto isso o vendedor
// mostrava um número velho na tela.
//
// Aqui a gerência corrige sozinha. O catálogo continua sendo a base (nome,
// benefício, código de peça, foto); o preço passa a ter uma correção por cima:
//
//     elevaAcessorios/{marca} = { precos: { 'rack-de-teto': 1950, ... } }
//
// Só o preço, de propósito. Nome e benefício são texto de venda, revisado; se
// virasse campo livre no Painel, em duas semanas cada loja teria o seu.
import { useSyncExternalStore } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { BrandId } from './brands';

const COL = 'elevaAcessorios';
const CKEY = 'wp_precos_acess';

let version = 0;
const ouvintes = new Set<() => void>();
function emit() {
  version += 1;
  ouvintes.forEach((f) => f());
}
export function usePrecosAcessorios(): number {
  return useSyncExternalStore(
    (f) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; },
    () => version,
    () => 0,
  );
}

type Mapa = Record<string, Record<string, number>>;
function lerCache(): Mapa {
  try { return JSON.parse(localStorage.getItem(CKEY) || '{}'); } catch { return {}; }
}
function gravarCache(m: Mapa) {
  try { localStorage.setItem(CKEY, JSON.stringify(m)); } catch { /* cheio */ }
  emit();
}

/** O preço corrigido deste acessório, se a gerência tiver mexido. */
export function precoCorrigido(id: string): number | undefined {
  const m = lerCache();
  for (const marca of Object.keys(m)) {
    const v = m[marca]?.[id];
    if (typeof v === 'number') return v;
  }
  return undefined;
}

export async function carregarPrecos(brand: BrandId): Promise<void> {
  if (!db) return;
  try {
    const d = await getDoc(doc(db, COL, brand));
    const precos = (d.exists() ? (d.data() as { precos?: Record<string, number> }).precos : {}) || {};
    gravarCache({ ...lerCache(), [brand]: precos });
  } catch {
    /* offline: fica o que já estava */
  }
}

/**
 * Grava o preço novo. `undefined` volta pro preço do catálogo.
 *
 * Escreve o mapa inteiro em vez de um campo: são poucos itens, e assim o cache
 * local e a nuvem contam a mesma história — sem estado intermediário na tela.
 */
export async function salvarPreco(brand: BrandId, id: string, preco?: number): Promise<void> {
  const atuais = { ...(lerCache()[brand] || {}) };
  const antes = { ...atuais };
  if (typeof preco === 'number' && preco > 0) atuais[id] = preco;
  else delete atuais[id];
  gravarCache({ ...lerCache(), [brand]: atuais });
  if (!db) return;
  await setDoc(doc(db, COL, brand), { precos: atuais }, { merge: true }).catch((e) => {
    gravarCache({ ...lerCache(), [brand]: antes });
    throw e;
  });
}
