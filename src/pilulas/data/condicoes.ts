// CONDIÇÕES COMERCIAIS com ANEXO (print ou PDF).
//
// No automotivo a condição do dia não é um texto que alguém digita: é a tabela
// que a montadora manda — print do grupo de WhatsApp, foto da planilha, PDF da
// campanha. Pedir pro gestor redigitar "% de desconto" garante erro e atraso.
// Aqui ele sobe a imagem/PDF e o time inteiro vê a mesma coisa que ele viu.
//
// Onde fica: Firestore, coleção `elevaCondicoes`. O arquivo vai DENTRO do
// documento, como data URL — o Storage do projeto eleva-gss não está ativado, e
// documento do Firestore aguenta 1 MB. Por isso a imagem é comprimida antes de
// subir (quase sempre fica abaixo de 300 KB) e o PDF tem limite de tamanho.
//
// Quem escreve: só gestor (regra do Firestore). Quem lê: quem está logado —
// igual ao resto do conteúdo do Eleva.
import { useSyncExternalStore } from 'react';
import {
  collection, deleteDoc, doc, getDocs, query, setDoc, where,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { BrandId } from './brands';

export interface Condicao {
  id: string;
  brand: BrandId;
  titulo: string;
  validade: string;
  observacao?: string;
  /**
   * A peça pode ir para o cliente?
   *
   * A tabela da montadora é interna: traz margem e custo, e encaminhar é
   * problema. Mas a arte de kit de acessórios é feita PRA mandar — tem preço
   * "por apenas", cortesia, chamada de campanha. O aviso era um só pra tudo e
   * mandava o vendedor não encaminhar justo o material feito para encaminhar.
   */
  paraCliente?: boolean;
  arquivo: string; // data URL (imagem comprimida ou PDF)
  tipo: 'imagem' | 'pdf';
  nomeArquivo: string;
  criadoEm: number;
}

const COL = 'elevaCondicoes';
const CKEY = 'wp_condicoes';
// Documento do Firestore aguenta 1 MiB. Deixo folga pros outros campos.
export const LIMITE_BYTES = 900 * 1024;

// ---- avisa a tela quando a lista muda ----
let version = 0;
const listeners = new Set<() => void>();
function emit() {
  version += 1;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}
export function useCondicoes(): number {
  return useSyncExternalStore(subscribe, () => version);
}

// ---- cache local: a condição abre na hora, mesmo no 4G ruim do showroom ----
function lerCache(): Condicao[] {
  try { return JSON.parse(localStorage.getItem(CKEY) || '[]'); } catch { return []; }
}
function gravarCache(lista: Condicao[]) {
  try { localStorage.setItem(CKEY, JSON.stringify(lista)); } catch { /* cheio */ }
  emit();
}

export function condicoesDaMarca(brand: BrandId): Condicao[] {
  return lerCache()
    .filter((c) => c.brand === brand)
    .sort((a, b) => b.criadoEm - a.criadoEm);
}

let carregando = false;
export async function carregarCondicoes(brand: BrandId): Promise<void> {
  if (!db || carregando) return;
  carregando = true;
  try {
    const snap = await getDocs(query(collection(db, COL), where('brand', '==', brand)));
    const vindas = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as Condicao[];
    // Mantém no cache o que é de OUTRAS marcas (o gestor troca de marca no app).
    const outras = lerCache().filter((c) => c.brand !== brand);
    gravarCache([...outras, ...vindas]);
  } catch {
    /* offline: fica o que já estava no cache */
  } finally {
    carregando = false;
  }
}

export async function publicarCondicao(c: Omit<Condicao, 'id' | 'criadoEm'>): Promise<void> {
  const id = 'c-' + Math.random().toString(36).slice(2, 10);
  const nova: Condicao = { ...c, id, criadoEm: Date.now() };
  gravarCache([nova, ...lerCache()]);
  if (!db) return;
  await setDoc(doc(db, COL, id), nova);
}

export async function apagarCondicao(id: string): Promise<void> {
  gravarCache(lerCache().filter((c) => c.id !== id));
  if (!db) return;
  await deleteDoc(doc(db, COL, id)).catch(() => {});
}

// ---- preparar o arquivo ----------------------------------------------------

function lerComoDataUrl(f: File): Promise<string> {
  return new Promise((ok, falhou) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result || ''));
    r.onerror = () => falhou(new Error('leitura'));
    r.readAsDataURL(f);
  });
}

// Print de celular vem com 3–8 MB e resolução muito maior do que a tela usa.
// Reduz pra 1600px de largura e vai baixando a qualidade até caber. A tabela
// continua legível — e é isso que importa: o vendedor vai LER os números.
async function comprimirImagem(f: File): Promise<string> {
  const url = await lerComoDataUrl(f);
  const img = await new Promise<HTMLImageElement>((ok, falhou) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = () => falhou(new Error('imagem'));
    i.src = url;
  });
  const MAXL = 1600;
  const escala = Math.min(1, MAXL / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * escala);
  c.height = Math.round(img.height * escala);
  const ctx = c.getContext('2d');
  if (!ctx) return url;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  for (const q of [0.82, 0.7, 0.6, 0.5, 0.4]) {
    const saida = c.toDataURL('image/jpeg', q);
    if (saida.length <= LIMITE_BYTES) return saida;
  }
  return c.toDataURL('image/jpeg', 0.35);
}

export interface ArquivoPronto {
  arquivo: string;
  tipo: 'imagem' | 'pdf';
  nomeArquivo: string;
  bytes: number;
}

// Devolve o arquivo pronto pra subir, ou lança um erro em português — a
// mensagem vai direto pra tela do gestor.
export async function prepararArquivo(f: File): Promise<ArquivoPronto> {
  const ehPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
  const ehImagem = f.type.startsWith('image/');
  if (!ehPdf && !ehImagem) {
    throw new Error('Mande uma imagem (print/foto) ou um PDF.');
  }
  const arquivo = ehPdf ? await lerComoDataUrl(f) : await comprimirImagem(f);
  if (arquivo.length > LIMITE_BYTES) {
    throw new Error(
      ehPdf
        ? 'Esse PDF é grande demais (limite ~900 KB). Tire um print da página da tabela e mande a imagem.'
        : 'Essa imagem é grande demais mesmo depois de comprimida. Tente recortar só a parte da tabela.'
    );
  }
  return { arquivo, tipo: ehPdf ? 'pdf' : 'imagem', nomeArquivo: f.name.slice(0, 80), bytes: arquivo.length };
}
