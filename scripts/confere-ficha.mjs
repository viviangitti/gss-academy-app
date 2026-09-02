#!/usr/bin/env node
/**
 * confere-ficha.mjs — cada número da ficha tem documento que sustente?
 *
 * Por que existe: eu disse à Vivian que oito números do app "não vinham de
 * documento". Ela desconfiou, mandou conferir, e quase todos estavam lá — nos
 * guias de venda e treinamentos, que eu não tinha aberto. Errar para menos é
 * tão ruim quanto errar para mais: no primeiro caso a gente pede à montadora o
 * que já tem, no segundo o vendedor promete o que ninguém escreveu.
 *
 * Este script tira a memória da jogada. Ele lê cada linha da ficha dos carros,
 * separa os números, e procura cada um nos PDFs publicados em Documentos.
 *
 * Uso:  node scripts/confere-ficha.mjs
 *       node scripts/confere-ficha.mjs --faltantes   (só o que não tem fonte)
 *
 * Precisa do pdftotext (poppler). Sem ele, avisa e sai.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(RAIZ, 'public/docs/ramasa');
const V = '\x1b[0;32m', X = '\x1b[0;31m', C = '\x1b[0;36m', N = '\x1b[0m';
const soFaltantes = process.argv.includes('--faltantes');

// ── texto de todos os documentos, uma vez ──────────────────────────────────
let temPdftotext = true;
try { execFileSync('pdftotext', ['-v'], { stdio: 'ignore' }); } catch { temPdftotext = false; }
if (!temPdftotext) {
  console.log('pdftotext não encontrado. Instale o poppler: brew install poppler');
  process.exit(2);
}

const textos = {};
const semTexto = [];
for (const f of readdirSync(DOCS).filter((x) => x.endsWith('.pdf'))) {
  let t = '';
  try {
    t = execFileSync('pdftotext', ['-layout', join(DOCS, f), '-'], { maxBuffer: 64 * 1024 * 1024 }).toString();
  } catch { t = ''; }
  // As fichas oficiais da montadora são IMAGEM: vieram como PNG e viraram PDF.
  // pdftotext não lê nada delas, então elas não podem ser conferidas aqui — e
  // dizer "sem documento" por causa disso seria mentira, justo o erro que este
  // script existe para não repetir.
  if (t.replace(/\s/g, '').length < 40) { semTexto.push(f); continue; }
  // Guarda duas versões: com espaço (tabela) e sem (texto corrido "500L").
  // Polegada aparece de cinco jeitos no material da montadora: 24,6" 24,6”
  // 24,6’’ 24,6'' 24,6“. Sem normalizar, a busca não acha e o script acusa
  // "sem documento" um número que está lá — o erro que ele existe pra evitar.
  const pol = (x) => x.replace(/[\u2019\u2018\u201C\u201D\u2033\u2032]{1,2}|''|´´/g, '"');
  textos[f] = pol(t.replace(/\s+/g, ' '));
  textos[f + ' (corrido)'] = pol(t.replace(/\s+/g, ''));
}
if (semTexto.length) {
  console.log(`${C}Não dá para conferir automaticamente${N} — estes documentos são imagem, sem texto:`);
  for (const f of semTexto) console.log(`  · ${f}`);
  console.log('  O que estiver só neles precisa ser conferido a olho na folha.\n');
}

// ── as fichas do app ───────────────────────────────────────────────────────
const src = readFileSync(join(RAIZ, 'src/pilulas/data/products.ts'), 'utf8');
const CARROS = ['jaecoo-7', 'omoda-5-shs-h', 'omoda-e5', 'omoda-7-shs-p'];

/**
 * O que vale procurar. Número puro ("135") aparece em qualquer lugar por acaso;
 * o que identifica um dado é o número COM a unidade, do jeito que a montadora
 * escreve. Também não adianta procurar preço e garantia: preço saiu da ficha de
 * propósito, e a garantia veio do manual, que é documento à parte.
 */
const IGNORAR = /garantia|revis|preço|marca|versões/i;
function numerosDe(valor) {
  const achados = new Set();
  for (const m of valor.matchAll(/(\d+(?:[.,]\d+)?)\s*(km\/L|kWh|km|kW|cv|mm|cm|Nm|kgfm|%|segundos|"|L\b)/gi)) {
    achados.add(`${m[1]} ${m[2]}`.replace(/\s+"/, '"'));
  }
  return [...achados];
}

/** O documento escreve o mesmo número de várias formas — 0.281 e 0,281, 6,6 kW e 6,6kW. */
function achaNoDoc(numero) {
  const [n, un] = numero.split(/\s+/);
  const variantes = [n, n.replace(',', '.'), n.replace('.', ',')];
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // O documento escreve "1300L", "1.300 L" e "1300 litros" — e ainda troca
  // ponto por vírgula. Procura o número com e sem separador de milhar.
  const semMilhar = n.replace(/[.,](?=\d{3}\b)/g, '');
  for (const v of [...new Set([...variantes, semMilhar])]) {
    for (const [arq, texto] of Object.entries(textos)) {
      const re = new RegExp(`${esc(v)}\\s*${esc(un || '')}`, 'i');
      if (re.test(texto)) return arq.replace(' (corrido)', '');
      if (un && new RegExp(`${esc(v)}\\s*${esc(un.slice(0, 2))}`, 'i').test(texto)) return arq.replace(' (corrido)', '');
    }
  }
  // Segunda tentativa: TABELA com a unidade no cabeçalho, não colada no número
  // — "Volume do porta-malas (L)  372". É como a montadora escreve os
  // comparativos, e sem isto o script acusava oito números que estavam lá.
  if (un) {
    for (const [arq, texto] of Object.entries(textos)) {
      if (arq.includes('(corrido)')) continue;
      for (const v of [...new Set([...variantes, semMilhar])]) {
        if (new RegExp(`\\(\\s*${esc(un)}\\s*\\)[^\\n]{0,120}?\\b${esc(v)}\\b`, 'i').test(texto)) return `${arq} (tabela)`;
      }
    }
  }
  return null;
}

let semFonte = 0;
for (const id of CARROS) {
  const i = src.indexOf(`id: '${id}'`);
  const fi = src.indexOf('ficha: [', i);
  const bloco = src.slice(fi, src.indexOf('\n    ],', fi));
  const nome = src.slice(src.indexOf("name: '", i) + 7, src.indexOf("'", src.indexOf("name: '", i) + 7));

  const linhas = [];
  const vistos = new Set();
  const anota = (label, texto) => {
    if (IGNORAR.test(label)) return;
    for (const num of numerosDe(texto)) {
      const chave = `${label}|${num}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      const doc = achaNoDoc(num);
      if (!doc) semFonte += 1;
      linhas.push({ label, num, doc });
    }
  };

  // 1) a ficha
  for (const m of bloco.matchAll(/\{ label: '([^']+)', value: '([^']*)'/g)) anota(m[1], m[2]);

  // 2) o resto do carro: benefício, objeção, roteiro, destaque, versões.
  //    O produto vai do seu `id:` até o `id:` do próximo — pega tudo no meio.
  const iProx = CARROS.map((c) => src.indexOf(`id: '${c}'`)).filter((x) => x > i).sort((a, b) => a - b)[0];
  const tudo = src.slice(i, iProx > 0 ? iProx : src.length);
  const CAMPOS = [
    ['benefício', /benefits: \[([\s\S]*?)\n    \]/],
    ['objeção', /objections: \[([\s\S]*?)\n    \]/],
    ['roteiro', /storyboard: \[([\s\S]*?)\n    \]/],
    ['destaque', /destaques: \[([\s\S]*?)\n    \]/],
    ['versões', /versoes: \[([\s\S]*?)\n    \]/],
    ['o que é', /whatItIs:\s*'([^']*)'/],
    ['chamada', /tagline: '([^']*)'/],
  ];
  for (const [nome, re] of CAMPOS) {
    const m = tudo.match(re);
    if (m) anota(nome, m[1]);
  }

  const mostrar = soFaltantes ? linhas.filter((l) => !l.doc) : linhas;
  if (!mostrar.length) continue;
  console.log(`\n${C}${nome}${N}`);
  for (const l of mostrar) {
    // "Não achei" não é o mesmo que "não existe": as quatro fichas oficiais
    // são imagem, e tudo que só está nelas escapa desta busca.
    const marca = l.doc ? `${V}✓${N} ${l.doc}` : `${X}conferir na ficha oficial${N}`;
    console.log(`  ${l.num.padEnd(16)} ${l.label.padEnd(26)} ${marca}`);
  }
}

if (semFonte === 0) {
  console.log(`\n${V}✓ Todo número da ficha aparece em documento com texto.${N}`);
} else {
  console.log(`\n${C}${semFonte} número(s) não apareceram nos documentos com texto.${N}`);
  console.log('Confira à mão nas fichas oficiais (são imagem). O que não estiver lá');
  console.log('é o que precisa ser pedido à montadora.');
}
