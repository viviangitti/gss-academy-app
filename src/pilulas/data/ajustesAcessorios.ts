// O QUE A GERÊNCIA MUDA NOS ACESSÓRIOS.
//
// Este arquivo era só o preço (precosAcessorios.ts). Virou o lugar de TUDO que
// a gerência de acessórios corrige por cima do catálogo, porque a limitação
// antiga era grande demais: os 27 acessórios vivem no código, e o único campo
// que a Silmara conseguia mexer sozinha era o número. Nome errado, benefício
// desatualizado, item que a loja parou de vender, ordem da lista — tudo isso
// virava pedido pra mim, e enquanto o pedido não andava o vendedor mostrava
// coisa errada na frente do cliente.
//
// O catálogo continua sendo a base (código de peça, foto, roteiro do vídeo,
// em que carros entra). Por cima dele vive UM documento por marca:
//
//     elevaAcessorios/{marca} = {
//       precos:  { 'rack-teto': 1950 },              // o número
//       edicoes: { 'rack-teto': { nome, beneficio, comoOferecer, observacao, origem } },
//       ocultos: ['escada-lateral'],                 // saiu de linha
//       ordem:   ['estribo-iluminado', 'rack-teto']  // a ordem da vitrine
//     }
//
// PREÇO CONTINUA MORANDO SÓ EM `precos`, e isso é de propósito: se ele também
// pudesse ser gravado dentro de `edicoes`, existiriam DOIS lugares com o mesmo
// número e um dia eles discordariam. Um número, uma casa.
//
// APAGAR É ESCONDER, e a tela diz isso com todas as letras. O item está no
// código; o que a gerência faz aqui é tirar da vitrine. É melhor assim: some
// da ponta na hora, e volta na hora se foi engano — coisa que exclusão de
// verdade não permitiria.
import { useSyncExternalStore } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { BrandId } from './brands';

const COL = 'elevaAcessorios';
const CKEY = 'wp_acess_ajustes';
// A chave antiga guardava só { marca: { id: preço } }. Some com ela pra não
// ficar um formato velho no aparelho de quem já usava o app.
const CKEY_VELHA = 'wp_precos_acess';

/** Origem é campo do catálogo, repetido aqui pra não criar dependência circular. */
export type OrigemEditavel = 'fabrica' | 'loja';

export interface EdicaoAcessorio {
  nome?: string;
  beneficio?: string;
  comoOferecer?: string;
  observacao?: string;
  origem?: OrigemEditavel;
}

/**
 * UM ACESSÓRIO CRIADO PELA GERÊNCIA, que não existe no código.
 *
 * Os 27 do catálogo vieram dos comunicados da montadora e da tabela da loja.
 * Mas a loja lança serviço novo o tempo todo — e até aqui isso virava pedido
 * pra mim, com o acessório fora do app até eu ter tempo.
 *
 * A forma é a mesma do catálogo, de propósito: assim ele se comporta igual em
 * toda tela (card, ficha, IA, condição), sem caminho separado pra manter.
 *
 * `foto` e vídeo não estão aqui: sobem pela tela do próprio acessório, do mesmo
 * jeito que nos outros, e ficam guardados pela chave do id.
 */
export interface AcessorioNovo {
  nome: string;
  origem: OrigemEditavel;
  beneficio: string;
  comoOferecer: string;
  preco?: number;
  /** Ids dos carros em que ele entra — é o que o faz aparecer dentro do modelo. */
  aplicaEm: string[];
  codigos: { modelo: string; pn: string }[];
  observacao?: string;
  criadoEm: number;
}

export interface AjustesDaMarca {
  precos: Record<string, number>;
  edicoes: Record<string, EdicaoAcessorio>;
  ocultos: string[];
  ordem: string[];
  /** Os que a gerência criou aqui, fora do catálogo do código. */
  novos: Record<string, AcessorioNovo>;
}

type Mapa = Record<string, AjustesDaMarca>;

const VAZIO: AjustesDaMarca = { precos: {}, edicoes: {}, ocultos: [], ordem: [], novos: {} };

let version = 0;
const ouvintes = new Set<() => void>();
function emit() {
  version += 1;
  ouvintes.forEach((f) => f());
}

/** Redesenha a tela quando o ajuste da nuvem chega ou a gerência salva. */
export function useAjustesAcessorios(): number {
  return useSyncExternalStore(
    (f) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; },
    () => version,
    () => 0,
  );
}

/** Aceita o formato velho (só preços) sem quebrar, e devolve sempre completo. */
function normalizar(x: unknown): AjustesDaMarca {
  const o = (x || {}) as Partial<AjustesDaMarca>;
  return {
    precos: o.precos && typeof o.precos === 'object' ? o.precos : {},
    edicoes: o.edicoes && typeof o.edicoes === 'object' ? o.edicoes : {},
    ocultos: Array.isArray(o.ocultos) ? o.ocultos : [],
    ordem: Array.isArray(o.ordem) ? o.ordem : [],
    novos: o.novos && typeof o.novos === 'object' ? o.novos : {},
  };
}

function lerCache(): Mapa {
  try {
    const bruto = JSON.parse(localStorage.getItem(CKEY) || '{}') as Record<string, unknown>;
    const m: Mapa = {};
    for (const marca of Object.keys(bruto)) m[marca] = normalizar(bruto[marca]);
    return m;
  } catch {
    return {};
  }
}

function gravarCache(m: Mapa) {
  try {
    localStorage.setItem(CKEY, JSON.stringify(m));
    localStorage.removeItem(CKEY_VELHA);
  } catch { /* cheio */ }
  emit();
}

export function ajustesDaMarca(brand: BrandId): AjustesDaMarca {
  return lerCache()[brand] || VAZIO;
}

/**
 * O preço corrigido deste acessório, se a gerência tiver mexido.
 *
 * Varre as marcas porque o id do acessório é único no app inteiro e a tela do
 * item nem sempre sabe de que marca ela veio.
 */
export function precoCorrigido(id: string): number | undefined {
  const m = lerCache();
  for (const marca of Object.keys(m)) {
    const v = m[marca]?.precos?.[id];
    if (typeof v === 'number') return v;
  }
  return undefined;
}

/** O texto corrigido deste acessório, se houver. */
export function edicaoDe(id: string): EdicaoAcessorio | undefined {
  const m = lerCache();
  for (const marca of Object.keys(m)) {
    const e = m[marca]?.edicoes?.[id];
    if (e && Object.keys(e).length) return e;
  }
  return undefined;
}

/** Saiu da vitrine? O time não vê; a gerência vê marcado e pode trazer de volta. */
export function estaOculto(id: string): boolean {
  const m = lerCache();
  return Object.keys(m).some((marca) => (m[marca]?.ocultos || []).includes(id));
}

/** A ordem que a gerência arrumou. Vazia = ordem do catálogo. */
export function ordemDaMarca(brand: BrandId): string[] {
  return ajustesDaMarca(brand).ordem;
}

export async function carregarAjustesAcessorios(brand: BrandId): Promise<void> {
  if (!db) return;
  try {
    const d = await getDoc(doc(db, COL, brand));
    gravarCache({ ...lerCache(), [brand]: normalizar(d.exists() ? d.data() : {}) });
  } catch {
    /* offline: fica o que já estava */
  }
}

/**
 * Grava um pedaço do ajuste, com volta atrás se a nuvem recusar.
 *
 * A tela muda ANTES da nuvem responder de propósito — quem está corrigindo
 * preço numa loja com sinal ruim não pode ficar olhando um botão girar. Se a
 * gravação falhar, o valor antigo volta e o erro sobe pra tela.
 */
async function salvar(brand: BrandId, mudanca: Partial<AjustesDaMarca>): Promise<void> {
  const antes = ajustesDaMarca(brand);
  const depois = { ...antes, ...mudanca };
  gravarCache({ ...lerCache(), [brand]: depois });
  if (!db) return;
  await setDoc(doc(db, COL, brand), mudanca, { merge: true }).catch((e) => {
    gravarCache({ ...lerCache(), [brand]: antes });
    throw e;
  });
}

/** O preço novo. `undefined` volta pro preço do catálogo. */
export async function salvarPreco(brand: BrandId, id: string, preco?: number): Promise<void> {
  const precos = { ...ajustesDaMarca(brand).precos };
  if (typeof preco === 'number' && preco > 0) precos[id] = preco;
  else delete precos[id];
  await salvar(brand, { precos });
}

/**
 * O texto novo. `null` joga fora a edição inteira e devolve o texto do catálogo.
 *
 * Campo vazio também some do mapa: guardar `nome: ''` faria o acessório
 * aparecer sem nome na vitrine, que é pior que não ter editado.
 */
export async function salvarEdicao(brand: BrandId, id: string, e: EdicaoAcessorio | null): Promise<void> {
  const edicoes = { ...ajustesDaMarca(brand).edicoes };
  if (!e) {
    delete edicoes[id];
  } else {
    const limpo: EdicaoAcessorio = {};
    if (e.nome?.trim()) limpo.nome = e.nome.trim();
    if (e.beneficio?.trim()) limpo.beneficio = e.beneficio.trim();
    if (e.comoOferecer?.trim()) limpo.comoOferecer = e.comoOferecer.trim();
    if (e.observacao?.trim()) limpo.observacao = e.observacao.trim();
    if (e.origem) limpo.origem = e.origem;
    if (Object.keys(limpo).length) edicoes[id] = limpo;
    else delete edicoes[id];
  }
  await salvar(brand, { edicoes });
}

/** Tira da vitrine (ou traz de volta). */
export async function ocultarAcessorio(brand: BrandId, id: string, oculto: boolean): Promise<void> {
  const atuais = ajustesDaMarca(brand).ocultos;
  const ocultos = oculto ? [...new Set([...atuais, id])] : atuais.filter((x) => x !== id);
  await salvar(brand, { ocultos });
}

/**
 * A ordem da vitrine. Grava a LISTA INTEIRA, não só o item que se moveu.
 *
 * Metade com ordem e metade sem faz a lista dançar sozinha na próxima abertura,
 * porque quem não tem posição cai no critério do catálogo. Mesmo motivo do
 * reordenar das condições.
 */
export async function salvarOrdemAcessorios(brand: BrandId, ids: string[]): Promise<void> {
  await salvar(brand, { ordem: ids });
}


/** Os acessórios que a gerência criou nesta marca. */
export function novosDaMarca(brand: BrandId): Record<string, AcessorioNovo> {
  return ajustesDaMarca(brand).novos;
}

/** Todos os criados, de qualquer marca — para achar um pelo id. */
export function todosOsNovos(): Record<string, AcessorioNovo & { brand: string }> {
  const m = lerCache();
  const out: Record<string, AcessorioNovo & { brand: string }> = {};
  for (const marca of Object.keys(m)) {
    for (const [id, a] of Object.entries(m[marca]?.novos || {})) out[id] = { ...a, brand: marca };
  }
  return out;
}

/**
 * Cria ou corrige um acessório da gerência.
 *
 * O id nasce do nome porque ele vira URL (/eleva/acessorio/<id>) e chave da
 * foto: um id legível é o que permite achar a foto certa no Firestore seis
 * meses depois. Colisão ganha um sufixo — dois "engate" na mesma loja é erro
 * de cadastro, mas não pode sobrescrever o primeiro em silêncio.
 */
export async function salvarAcessorioNovo(
  brand: BrandId, id: string, dados: AcessorioNovo,
): Promise<void> {
  const novos = { ...ajustesDaMarca(brand).novos, [id]: dados };
  await salvar(brand, { novos });
}

export function idParaAcessorio(nome: string, jaExistem: string[]): string {
  const base = nome.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'acessorio';
  if (!jaExistem.includes(base)) return base;
  for (let i = 2; i < 50; i++) if (!jaExistem.includes(`${base}-${i}`)) return `${base}-${i}`;
  return `${base}-${jaExistem.length}`;
}

/**
 * Apaga DE VEZ um acessório criado aqui.
 *
 * Só vale pros criados: os do código não têm como sair do código, e pra eles
 * existe o "tirar da vitrine", que volta atrás. Aqui não volta — por isso a
 * tela pergunta antes.
 */
export async function apagarAcessorioNovo(brand: BrandId, id: string): Promise<void> {
  const novos = { ...ajustesDaMarca(brand).novos };
  delete novos[id];
  const a = ajustesDaMarca(brand);
  await salvar(brand, {
    novos,
    ocultos: a.ocultos.filter((x) => x !== id),
    ordem: a.ordem.filter((x) => x !== id),
    precos: Object.fromEntries(Object.entries(a.precos).filter(([k]) => k !== id)),
    edicoes: Object.fromEntries(Object.entries(a.edicoes).filter(([k]) => k !== id)),
  });
}
