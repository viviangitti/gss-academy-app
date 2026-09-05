#!/usr/bin/env node
/**
 * check-leitura.mjs — quem escreve não é quem lê.
 *
 * Por que existe: o Lucas corrigiu cinco preços de acessório, a correção subiu
 * certinho, e o time continuou vendo os preços antigos por horas. A busca dos
 * preços na nuvem só era chamada DENTRO do Painel — quem não passava por lá
 * ficava com o número do código.
 *
 * O erro é fácil de cometer e difícil de ver: eu testava o Painel primeiro, o
 * dado ficava guardado no meu navegador, e a tela do vendedor mostrava o valor
 * certo — não porque funcionava, mas porque o dado já estava ali. No celular de
 * quem nunca abre o Painel, nunca esteve.
 *
 * Este script procura o padrão: função que BUSCA dado na nuvem e é chamada
 * só de uma tela de gerência. Se o dado aparece pro time, isso é um furo.
 *
 * Quando for mesmo só da gerência (desempenho do time, contatos da vitrine),
 * marque a função com o comentário:
 *
 *     // so-gerencia: <por quê>
 *
 * Uso: node scripts/check-leitura.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const V = '\x1b[0;32m', X = '\x1b[0;31m', A = '\x1b[0;33m', N = '\x1b[0m';

// Telas que são de GERÊNCIA. Dado buscado só aqui não chega no time.
const SO_GERENCIA = ['Gestor.tsx', 'Painel.tsx'];

function arquivos(dir, saida = []) {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) arquivos(p, saida);
    else if (/\.(ts|tsx)$/.test(nome)) saida.push(p);
  }
  return saida;
}

const todos = arquivos(join(RAIZ, 'src'));
const fontes = new Map(todos.map((p) => [p, readFileSync(p, 'utf8')]));

// 1) as funções que buscam dado na nuvem
const buscadores = [];
for (const [p, txt] of fontes) {
  if (!p.includes('/data/')) continue;
  const leNuvem = /\bgetDocs?\s*\(/.test(txt);
  if (!leNuvem) continue;
  for (const m of txt.matchAll(/export\s+(?:async\s+)?function\s+(carregar|buscar|fetch)(\w+)/g)) {
    const nome = m[1] + m[2];
    // opt-out declarado logo acima da função
    const antes = txt.slice(Math.max(0, m.index - 400), m.index);
    const isento = /\/\/\s*so-gerencia:/.test(antes);
    buscadores.push({ nome, arquivo: basename(p), isento });
  }
}

// 2) quem chama cada uma
let problemas = 0;
console.log(`${'FUNÇÃO'.padEnd(26)} ${'ONDE MORA'.padEnd(24)} QUEM CHAMA`);
for (const b of buscadores.sort((x, y) => x.nome.localeCompare(y.nome))) {
  const chamadores = [];
  for (const [p, txt] of fontes) {
    if (p.includes('/data/')) continue;
    if (new RegExp(`\\b${b.nome}\\s*\\(`).test(txt)) chamadores.push(basename(p));
  }
  const soGerencia = chamadores.length > 0 && chamadores.every((c) => SO_GERENCIA.includes(c));
  const ninguem = chamadores.length === 0;
  const marca = b.isento ? `${V}ok (só gerência, declarado)${N}`
    : ninguem ? `${A}ninguém chama${N}`
    : soGerencia ? `${X}SÓ O PAINEL — o time não recebe${N}`
    : `${V}${chamadores.join(', ')}${N}`;
  if (!b.isento && (soGerencia || ninguem)) problemas += 1;
  console.log(`${b.nome.padEnd(26)} ${b.arquivo.padEnd(24)} ${marca}`);
}

console.log();
if (problemas) {
  console.log(`${X}${problemas} busca(s) que o time não recebe.${N}`);
  console.log('Chame no Shell (src/pilulas/PilulasApp.tsx) para valer no app inteiro,');
  console.log('ou marque a função com "// so-gerencia: <por quê>" se for mesmo só da gerência.');
  process.exit(1);
}
console.log(`${V}✓ Todo dado da nuvem chega em quem precisa dele.${N}`);
