// CONDIÇÕES COMERCIAIS com ANEXO (print ou PDF).
//
// No automotivo a condição do dia não é um texto que alguém digita: é a tabela
// que a montadora manda — print do grupo de WhatsApp, foto da planilha, PDF da
// campanha. Pedir pro gestor redigitar "% de desconto" garante erro e atraso.
// Aqui ele sobe a imagem/PDF e o time inteiro vê a mesma coisa que ele viu.
//
// Onde fica: Firestore, coleção `elevaCondicoes`. A FICHA (título, validade,
// observação) fica no documento; o ARQUIVO fica numa subcoleção, num documento
// só dele. É o mesmo desenho dos guias e dos vídeos, e aqui virou obrigatório:
//
//   Com o arquivo dentro da ficha, listar as condições baixava TUDO — 13 peças
//   davam 3 MB por abertura de tela, no 4G do showroom. Pior: a lista inteira
//   ia pro localStorage, que estoura em ~5 MB. O setItem falhava, o catch
//   engolia, e a tela continuava mostrando a lista VELHA. Publiquei sete folhas
//   da carta de setembro e elas simplesmente não apareceram — sem erro nenhum.
//
// Agora a lista pesa alguns KB e o arquivo desce só quando alguém abre aquela
// condição. O que vai pro cache local é só a ficha, nunca o arquivo.
//
// Quem escreve: só gestor (regra do Firestore). Quem lê: quem está logado —
// igual ao resto do conteúdo do Eleva.
import { useSyncExternalStore } from 'react';
import {
  collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where,
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
   * O último dia em que ela vale, como aaaa-mm-dd.
   *
   * `validade` acima é texto pro vendedor ler ("Válida de 03/09/2026 a
   * 02/10/2026"). Isto é data de verdade, pro app agir: passou, a condição
   * some da tela do time sozinha.
   *
   * Existe porque a carta comercial vira no dia 2 e a nova chega no primeiro
   * dia útil. No intervalo, quem abrisse o app veria taxa e bônus que a loja
   * não pratica mais — e sem ninguém errado na história: a gerência não tem
   * como lembrar de apagar sete folhas num sábado.
   *
   * Sem data, não vence. É o certo pra arte de kit, que fica até a gerência
   * dizer o contrário.
   */
  venceEm?: string;
  /**
   * Condição de carro, de acessório, ou campanha da casa?
   *
   * São conversas diferentes em momentos diferentes: a do carro entra na
   * negociação, a do acessório entra DEPOIS do sim, e a campanha não é conversa
   * com cliente nenhum — é a meta e a premiação do mês, que o vendedor abre
   * antes de entrar no salão. Misturadas numa lista só, ele rolava kit de
   * proteção para achar a taxa do Jaecoo, com o cliente esperando.
   *
   * Sem valor, vale 'veiculo': é o que a gerência sobe na maior parte das
   * vezes, e errar para o lado do carro não esconde nada de ninguém.
   */
  categoria?: 'veiculo' | 'acessorio' | 'campanha';
  /**
   * O arquivo — data URL (imagem comprimida ou PDF).
   *
   * Opcional porque a lista chega SEM ele: desce só quando alguém abre esta
   * condição. Tela que precisa mostrar a folha chama `abrirArquivo` antes.
   */
  arquivo?: string;
  tipo: 'imagem' | 'pdf';
  nomeArquivo: string;
  criadoEm: number;
}

const COL = 'elevaCondicoes';
// Subcoleção de um documento só, com o arquivo dentro.
const SUB = 'arquivo';
const PECA = 'unica';
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

// ---- cache local: a lista abre na hora, mesmo no 4G ruim do showroom ----
//
// Só a FICHA vai pro localStorage. Guardar o arquivo aqui foi o que estourou a
// cota e travou a lista numa versão antiga — ver o comentário do topo.
function lerCache(): Condicao[] {
  try { return JSON.parse(localStorage.getItem(CKEY) || '[]'); } catch { return []; }
}
function gravarCache(lista: Condicao[]) {
  const semArquivo = lista.map(({ arquivo: _ignorado, ...ficha }) => ficha as Condicao);
  try { localStorage.setItem(CKEY, JSON.stringify(semArquivo)); } catch { /* cheio */ }
  emit();
}

// Arquivos já baixados nesta sessão. Some ao recarregar a página, e tudo bem:
// é cache de conveniência, não fonte de verdade.
const baixados = new Map<string, string>();

/**
 * Já passou do último dia?
 *
 * Compara só a data, no fuso de São Paulo — a condição que vale "até 02/10"
 * tem que valer o dia 02 inteiro, incluindo às 23h de quem está fechando uma
 * venda no showroom.
 */
export function estaVencida(c: Condicao, agora = new Date()): boolean {
  if (!c.venceEm) return false;
  const hoje = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(agora);
  return c.venceEm < hoje;
}

export function condicoesDaMarca(brand: BrandId): Condicao[] {
  return lerCache()
    .filter((c) => c.brand === brand)
    .map((c) => (baixados.has(c.id) ? { ...c, arquivo: baixados.get(c.id) } : c))
    .sort((a, b) => b.criadoEm - a.criadoEm);
}

/**
 * Baixa a folha desta condição — só quando alguém pede pra ver.
 *
 * Devolve a data URL, ou string vazia se não deu (offline, ou condição antiga
 * publicada antes desta divisão). Quem chama decide o que mostrar.
 */
export async function abrirArquivo(c: Condicao): Promise<string> {
  if (c.arquivo) return c.arquivo;
  const guardado = baixados.get(c.id);
  if (guardado) return guardado;
  if (!db) return '';
  try {
    const d = await getDoc(doc(db, COL, c.id, SUB, PECA));
    const url = d.exists() ? String((d.data() as { arquivo?: string }).arquivo || '') : '';
    if (url) { baixados.set(c.id, url); emit(); }
    return url;
  } catch {
    return '';
  }
}

let carregando = false;
export async function carregarCondicoes(brand: BrandId): Promise<void> {
  if (!db || carregando) return;
  carregando = true;
  try {
    const snap = await getDocs(query(collection(db, COL), where('brand', '==', brand)));
    const vindas = snap.docs.map((d) => {
      // `arquivo` some da ficha aqui: em condição antiga ele ainda vem inline, e
      // deixar passar devolveria a lista de megabytes pro localStorage.
      const { arquivo, ...ficha } = d.data() as { arquivo?: string };
      if (arquivo) baixados.set(d.id, arquivo);
      return { id: d.id, ...ficha } as Condicao;
    });
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
  const { arquivo, ...ficha } = c;
  const nova: Condicao = { ...ficha, id, criadoEm: Date.now() };
  if (arquivo) baixados.set(id, arquivo);
  gravarCache([nova, ...lerCache()]);
  if (!db) return;
  // O ARQUIVO primeiro. Se a ficha entrasse antes e a folha falhasse, o time
  // veria uma condição publicada que não abre — pior do que não ver nada.
  if (arquivo) await setDoc(doc(db, COL, id, SUB, PECA), { arquivo });
  await setDoc(doc(db, COL, id), nova);
}

/**
 * Corrige uma condição que já está no ar.
 *
 * Existia só publicar e apagar. Errou a data de validade, o título ou a
 * prateleira? Apagar e subir de novo — e nesse meio-tempo a condição some da
 * tela do time, no meio do expediente. Pior: quem apaga por engano perde a
 * folha, porque o arquivo vai junto.
 *
 * `arquivo` é opcional: sem ele, a folha que já estava fica. É o caso comum —
 * quase toda correção é de texto ou de data, não da imagem.
 */
export async function atualizarCondicao(
  id: string,
  mudancas: Partial<Omit<Condicao, 'id' | 'criadoEm'>>,
): Promise<void> {
  const { arquivo, ...ficha } = mudancas;
  const atual = lerCache().find((c) => c.id === id);
  if (!atual) return;
  const nova: Condicao = { ...atual, ...ficha };
  if (arquivo) baixados.set(id, arquivo);
  gravarCache(lerCache().map((c) => (c.id === id ? nova : c)));
  if (!db) return;
  // A folha primeiro, como na publicação: se ela falhar, a ficha antiga segue
  // apontando pra folha antiga — que abre. O contrário deixaria a condição
  // dizendo uma coisa e mostrando outra.
  if (arquivo) await setDoc(doc(db, COL, id, SUB, PECA), { arquivo });
  const { arquivo: _fora, ...paraNuvem } = nova;
  await setDoc(doc(db, COL, id), paraNuvem, { merge: true });
}

export async function apagarCondicao(id: string): Promise<void> {
  gravarCache(lerCache().filter((c) => c.id !== id));
  baixados.delete(id);
  if (!db) return;
  // A ficha primeiro: é ela que faz a condição aparecer na tela do time. Se a
  // folha sobrar órfã, ninguém vê — e some na próxima limpeza.
  await deleteDoc(doc(db, COL, id)).catch(() => {});
  await deleteDoc(doc(db, COL, id, SUB, PECA)).catch(() => {});
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
