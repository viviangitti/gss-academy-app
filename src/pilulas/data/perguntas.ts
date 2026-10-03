// DE ONDE SAEM AS PERGUNTAS — um lugar só.
//
// O quiz do carro e o Desafio da semana fazem a mesma coisa com o mesmo
// conteúdo, e por isso precisam partilhar o MOTOR. Se cada tela montasse a
// própria pergunta, a correção de 03/10 — "fato que vale pra marca inteira não
// serve de alternativa errada" — ficaria em um dos dois e voltaria no outro,
// marcando como errado justamente quem conhece a marca.
//
// Aqui mora o motor; quem sorteia é quem chama. O quiz do carro sorteia na
// hora, com o relógio; o Desafio sorteia com SEMENTE, pra que a Raphaela em
// Itumbiara e o Walther em Goiânia respondam exatamente as mesmas perguntas na
// mesma semana — sem isso, o prêmio do mês premiaria sorte.
import { allProducts } from './store';
import { visibleProducts, type Product } from './products';
import type { BrandId } from './brands';

export interface Pergunta {
  q: string;
  options: string[];
  /** Índice da certa dentro de `options`. */
  correct: number;
  /** De qual carro saiu — o Desafio mostra isso ao corrigir. */
  produto: string;
  produtoNome: string;
  tipo: 'beneficio' | 'objecao' | 'paraquem' | 'ficha';
  /**
   * O ASSUNTO, pra não cair duas vezes no mesmo desafio.
   *
   * Carros irmãos repetem a objeção palavra por palavra — "o carro é menor que
   * o concorrente" existe no Omoda 7 e no Jaecoo 7. São perguntas diferentes e
   * respostas diferentes, mas lado a lado no mesmo desafio parecem erro do app.
   */
  assunto: string;
}

// ---------------------------------------------------------------- sorteio

/**
 * Sorteio com SEMENTE — o mesmo texto devolve sempre a mesma sequência.
 *
 * É o que faz o desafio da semana ser idêntico para o time inteiro sem precisar
 * guardar nada no servidor: a semente é a marca + o período, e todo aparelho
 * chega no mesmo resultado sozinho.
 */
export function semente(txt: string): () => number {
  let h = 1779033703 ^ txt.length;
  for (let i = 0; i < txt.length; i += 1) {
    h = Math.imul(h ^ txt.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const aoAcaso = (): number => Math.random();

export function embaralhar<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sortear<T>(arr: T[], n: number, rnd: () => number): T[] {
  return embaralhar(arr, rnd).slice(0, n);
}

// ---------------------------------------------------------------- filtros

/**
 * O QUE VALE PRA MARCA INTEIRA NÃO PODE SER ALTERNATIVA ERRADA.
 *
 * Medido em 03/10/2026, antes desta lista existir: de 270 alternativas erradas
 * que o app aceitava, 53 eram VERDADE sobre o carro da pergunta, e a chance de
 * uma pergunta sair injusta ia de 15% (objeção do Jaecoo 7) a 60% (objeção do
 * Jaecoo 5). Com a lista: 0 de 217.
 *
 * O filtro antigo (`pareceCom`) só reprovava a frase do outro carro quando ela
 * se parecia com algo escrito NESTE — e falhava justamente onde dói: o Jaecoo 5
 * não tem linha própria sobre garantia, então "7 anos ou 150.000 km", que vale
 * pros cinco, entrava como opção errada.
 */
const FATO_DA_MARCA = [
  /grupo\s+chery|\bchery\b/i,
  /desde\s+2009|em\s+2009/i,
  /\b\d{2}\s+pa[íi]ses/i,
  /cajamar/i,
  /allianz/i,
  /garantia[^.]{0,40}\b[78]\s+anos|\b150\.?000\s*km/i,
  /l[íi]tio[-\s]ferro[-\s]fosfato|\bLFP\b/i,
  /n[ãa]o\s+precisa\s+(de\s+)?tomada|sem\s+tomada|recarrega\s+sozinho/i,
];
export const ehFatoDaMarca = (t: string): boolean => FATO_DA_MARCA.some((re) => re.test(t));

const palavras = (t: string) =>
  new Set(
    t.toLowerCase().normalize('NFD').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 4),
  );

/** Duas frases dizem a mesma coisa? Serve pra não dar como errada a verdade. */
export function pareceCom(a: string, b: string): boolean {
  const A = palavras(a); const B = palavras(b);
  if (!A.size || !B.size) return false;
  const juntos = new Set([...A, ...B]).size;
  const comuns = [...A].filter((w) => B.has(w)).length;
  return comuns / juntos > 0.3;
}

// ---------------------------------------------------------------- ficha

/**
 * As quatro linhas de ficha que rendem pergunta com UMA resposta.
 *
 * São as únicas em que os cinco carros da Ramasa têm valores diferentes — logo,
 * o número do carro irmão nunca é verdade sobre este. Conferido valor a valor:
 * entre-eixos 2.672/2.620/2.610/2.630/2.720, porta-malas 500/410/372/360/590,
 * comprimento 4.500/4.380/4.447/4.424/4.660. O 0 a 100 tem empates (8,4 e 7,9
 * aparecem duas vezes), e por isso o distrator de valor igual é descartado.
 *
 * `limpa` existe porque a ficha é escrita por gente: um carro diz "410 litros",
 * outro "372 L", e o Jaecoo 7 emenda "— mais de 1.300 L com os bancos
 * rebatidos". A pergunta mostra só o número, ou a alternativa entregaria a
 * resposta pelo tamanho do texto.
 */
const LINHAS_FICHA: Array<{ label: string; pergunta: (nome: string) => string; limpa: (v: string) => string }> = [
  {
    label: 'Entre-eixos',
    pergunta: (n) => `Qual é o entre-eixos do ${n}?`,
    limpa: (v) => (v.match(/[\d.,]+\s*mm/) || [v])[0],
  },
  {
    label: 'Porta-malas',
    pergunta: (n) => `Quantos litros tem o porta-malas do ${n}?`,
    limpa: (v) => {
      const n = (v.match(/[\d.]+/) || [''])[0];
      return n ? `${n} litros` : v;
    },
  },
  {
    label: 'Dimensões',
    pergunta: (n) => `Qual é o comprimento do ${n}?`,
    limpa: (v) => (v.match(/[\d.,]+\s*mm/) || [v])[0],
  },
  {
    label: '0 a 100',
    pergunta: (n) => `Quanto o ${n} faz de 0 a 100 km/h?`,
    limpa: (v) => (v.match(/[\d,]+\s*segundos?/) || [v])[0],
  },
];

const valorDaLinha = (p: Product, label: string): string => {
  const linha = (p.ficha || []).find((f) => String(f.label).startsWith(label));
  return linha ? String(linha.value) : '';
};

// ---------------------------------------------------------------- motor

/**
 * Todas as perguntas que ESTE carro rende, já com alternativas.
 *
 * Devolve o pool inteiro — quem chama decide quantas usar. O quiz do carro pega
 * três; o Desafio junta o pool de todos e sorteia de lá.
 */
export function perguntasDoProduto(
  product: Product,
  rnd: () => number,
  role?: string,
  opts: { comFicha?: boolean; nomearCarro?: boolean } = {},
): Pergunta[] {
  const outros = visibleProducts(
    allProducts().filter(
      (p) =>
        p.brand === product.brand &&
        p.id !== product.id &&
        // Variação do MESMO produto não serve de alternativa errada: o benefício
        // dela também vale pro produto da pergunta.
        !(product.family && p.family === product.family),
    ),
    role,
  );

  const nucleo = product.name.toLowerCase().split(' ').slice(0, 2).join(' ');
  const falaDoProduto = (t: string) => t.toLowerCase().includes(nucleo);
  const proprio = [...product.benefits, product.forWho, ...product.objections.map((o) => o.answer)];

  const base = { produto: product.id, produtoNome: product.name };

  const montar = (
    q: string,
    correct: string,
    wrong: string[],
    tipo: Pergunta['tipo'],
    assunto: string,
  ): Pergunta | null => {
    const candidatas = wrong.filter(
      (w) => w && w.trim() !== correct.trim() && !falaDoProduto(w) && !ehFatoDaMarca(w)
        && !proprio.some((meu) => pareceCom(w, meu)),
    );
    const erradas = sortear(candidatas, 2, rnd);
    if (erradas.length < 2) return null;
    const options = embaralhar([correct.trim(), ...erradas.map((d) => d.trim())], rnd);
    return { ...base, tipo, assunto, q, options, correct: options.indexOf(correct.trim()) };
  };

  const qs: Pergunta[] = [];

  for (const b of product.benefits) {
    const q = montar(
      `Qual desses é um benefício do ${product.name}?`,
      b,
      outros.flatMap((p) => p.benefits),
      'beneficio',
      `beneficio:${product.id}:${b.slice(0, 40)}`,
    );
    if (q) qs.push(q);
  }

  for (const o of product.objections) {
    // NO DESAFIO, A OBJEÇÃO PRECISA DIZER DE QUAL CARRO É.
    //
    // Na tela do carro o contexto está na própria página, e "O cliente diz:
    // 'é menor que o concorrente'" se entende sozinho. No desafio da semana,
    // que mistura os cinco, a mesma frase não tem resposta: a certa fala de 590
    // litros porque é do Omoda 7, e quem leu pensando no Jaecoo 5 erra sabendo.
    const q = montar(
      opts.nomearCarro
        ? `Cliente do ${product.name} diz: ${o.trigger} O que você responde?`
        : `O cliente diz: ${o.trigger} O que você responde?`,
      o.answer,
      outros.flatMap((p) => p.objections.map((x) => x.answer)),
      'objecao',
      // O gatilho, sem o carro: é ele que se repete entre irmãos.
      `objecao:${o.trigger.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}`,
    );
    if (q) qs.push(q);
  }

  if (product.forWho.trim()) {
    const q = montar(
      `O ${product.name} é ideal pra quem?`,
      product.forWho,
      outros.map((p) => p.forWho),
      'paraquem',
      `paraquem:${product.id}`,
    );
    if (q) qs.push(q);
  }

  if (opts.comFicha) {
    for (const linha of LINHAS_FICHA) {
      const meu = valorDaLinha(product, linha.label);
      if (!meu) continue;
      const certa = linha.limpa(meu);
      const alternativas = outros
        .map((p) => valorDaLinha(p, linha.label))
        .filter(Boolean)
        .map((v) => linha.limpa(v))
        // Empate de número (o 0 a 100 tem dois 8,4 e dois 7,9): alternativa com
        // o MESMO valor que o certo seria uma segunda resposta certa.
        .filter((v) => v !== certa);
      const q = montar(linha.pergunta(product.name), certa, alternativas, 'ficha', `ficha:${product.id}:${linha.label}`);
      if (q) qs.push(q);
    }
  }

  return qs;
}

/** O pool inteiro da marca — é daqui que o Desafio sorteia. */
export function poolDaMarca(brand: BrandId, rnd: () => number, role?: string): Pergunta[] {
  return visibleProducts(allProducts().filter((p) => p.brand === brand), role)
    .flatMap((p) => perguntasDoProduto(p, rnd, role, { comFicha: true, nomearCarro: true }));
}
