// "QUAL O SEU ARGUMENTO MATADOR?" — a pergunta que a gerência faz ao time.
//
// A ideia é simples e a razão é forte: quem descobre o que fecha a venda é quem
// está no showroom, não quem escreve o material. O vendedor que vendeu doze
// Jaecoo sabe qual frase faz o cliente parar de comparar — e essa frase não
// está em manual nenhum.
//
// A coleta é por um FORMULÁRIO ABERTO, num endereço que a gerência manda no
// WhatsApp: gsseleva.com.br/argumentos. Sem login de propósito — pedir cadastro
// pra responder três frases derruba a resposta pela metade, e o time da Ramasa
// ainda nem entrou no app.
//
// Mas a resposta não morre numa planilha: ela cai direto no Painel do gestor,
// que escolhe as melhores e manda pra dentro do carro. É o mesmo ciclo das
// objeções — responde → gestor escolhe → volta pro time.
//
// Como é escrita SEM login, a regra do Firestore tranca o FORMATO (tamanho,
// quantidade de campos, marca conhecida). É a mesma defesa dos contatos da
// vitrine: robô de spam não consegue entupir a coleção.
import { collection, addDoc, doc, deleteDoc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import type { BrandId } from './brands';

export interface Argumento {
  id: string;
  brand: BrandId;
  productId: string;
  productName: string;
  /** Os três pontos que a pessoa considera matadores, na ordem que ela escreveu. */
  pontos: string[];
  byName: string;
  byEmail: string;
  byRole: string;
  at?: Date;
  /** Ligado pelo gestor: passa a aparecer dentro do carro, pro time inteiro. */
  destacado?: boolean;
}

const COL = 'elevaArgumentos';

function paraArgumento(id: string, x: Record<string, unknown>): Argumento {
  const pontos = Array.isArray(x.pontos) ? (x.pontos as string[]).filter((p) => String(p || '').trim()) : [];
  return {
    id,
    brand: x.brand as BrandId,
    productId: String(x.productId || ''),
    productName: String(x.productName || ''),
    pontos,
    byEmail: String(x.byEmail || ''),
    byName: String(x.byName || '') || String(x.byEmail || '').split('@')[0] || 'Alguém',
    byRole: String(x.byRole || ''),
    at: (x.createdAt as { toDate?: () => Date })?.toDate?.(),
    destacado: x.destacado === true,
  };
}

const maisNovoPrimeiro = (a: Argumento, b: Argumento) => (b.at?.getTime() || 0) - (a.at?.getTime() || 0);

/**
 * Envia UMA resposta (uma pessoa, um modelo). Sem login: vem do formulário
 * aberto. Os campos são cortados no tamanho que a regra do Firestore aceita —
 * melhor cortar aqui, com o texto na mão, do que a escrita falhar lá.
 */
export async function enviarArgumento(o: {
  brand: BrandId;
  productId: string;
  productName: string;
  pontos: string[];
  nome: string;
  papel?: string;
}): Promise<boolean> {
  const pontos = o.pontos.map((p) => p.trim().slice(0, 220)).filter(Boolean).slice(0, 3);
  if (!db || !pontos.length) return false;
  try {
    await addDoc(collection(db, COL), {
      brand: o.brand,
      productId: o.productId.slice(0, 60),
      productName: o.productName.slice(0, 80),
      pontos,
      byName: o.nome.trim().slice(0, 80),
      byEmail: auth?.currentUser?.email || '',
      byRole: (o.papel || '').slice(0, 40),
      createdAt: serverTimestamp(),
      destacado: false,
    });
    return true;
  } catch {
    return false;
  }
}

/** Tudo o que o time respondeu — visão do gestor. */
export async function buscarArgumentos(brand: BrandId): Promise<Argumento[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, COL), where('brand', '==', brand)));
    return snap.docs.map((d) => paraArgumento(d.id, d.data() as Record<string, unknown>)).sort(maisNovoPrimeiro);
  } catch {
    return [];
  }
}

/** Os que o gestor destacou — é o que o time inteiro vê dentro do carro. */
export async function buscarDestacados(brand: BrandId): Promise<Argumento[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(
      query(collection(db, COL), where('brand', '==', brand), where('destacado', '==', true)),
    );
    return snap.docs.map((d) => paraArgumento(d.id, d.data() as Record<string, unknown>)).sort(maisNovoPrimeiro);
  } catch {
    return [];
  }
}

/** O que ESTA pessoa já respondeu deste carro — pra não pedir duas vezes. */
export async function meuArgumento(productId: string, email?: string): Promise<Argumento | null> {
  if (!db || !email) return null;
  try {
    const snap = await getDocs(query(collection(db, COL), where('byEmail', '==', email)));
    const meus = snap.docs
      .map((d) => paraArgumento(d.id, d.data() as Record<string, unknown>))
      .filter((a) => a.productId === productId)
      .sort(maisNovoPrimeiro);
    return meus[0] || null;
  } catch {
    return null;
  }
}

export async function destacarArgumento(id: string, destacado: boolean): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, COL, id), { destacado });
}

/**
 * Apaga uma resposta. O formulário é aberto, então uma hora entra brincadeira,
 * duplicata ou teste — sem isso o gestor ficaria com lixo na lista pra sempre.
 */
export async function apagarArgumento(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, COL, id)).catch(() => {});
}

/**
 * O que mais se repete entre as respostas de um carro.
 *
 * É a parte que transforma opinião em evidência: se cinco de sete pessoas
 * escreveram "teto solar", isso não é gosto de ninguém, é o que funciona no
 * showroom. A comparação é grosseira de propósito — normaliza e olha palavras
 * de mais de quatro letras. Não precisa ser exato pra ser útil: serve pro gestor
 * enxergar o padrão, não pra fechar estatística.
 */
export function palavrasQueSeRepetem(args: Argumento[], minimo = 2): { termo: string; vezes: number }[] {
  const IGNORAR = new Set([
    'para', 'pela', 'pelo', 'como', 'mais', 'muito', 'porque', 'quando', 'cliente',
    'carro', 'ponto', 'sobre', 'isso', 'esse', 'essa', 'tem', 'que', 'com', 'dos', 'das',
    'ele', 'ela', 'uma', 'nao', 'sem', 'aqui', 'gente', 'coisa', 'todos', 'toda',
  ]);
  const conta = new Map<string, number>();
  for (const a of args) {
    // Uma pessoa que repete a palavra três vezes conta uma só: o sinal é
    // quantas PESSOAS falaram, não quantas vezes a palavra apareceu.
    const vistas = new Set<string>();
    for (const p of a.pontos) {
      for (const bruta of p.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/)) {
        if (bruta.length < 5 || IGNORAR.has(bruta)) continue;
        vistas.add(bruta);
      }
    }
    vistas.forEach((t) => conta.set(t, (conta.get(t) || 0) + 1));
  }
  return [...conta.entries()]
    .filter(([, n]) => n >= minimo)
    .map(([termo, vezes]) => ({ termo, vezes }))
    .sort((a, b) => b.vezes - a.vezes)
    .slice(0, 8);
}
