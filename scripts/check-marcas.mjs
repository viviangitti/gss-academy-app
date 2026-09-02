#!/usr/bin/env node
/**
 * check-marcas.mjs — impede que o conteúdo de uma empresa apareça na de outra.
 *
 * Por que existe: o ranking comparava o vendedor da Ramasa com oito colegas
 * inventados de farmácia. Ninguém errou uma regra — o arquivo simplesmente não
 * tinha marca, e conteúdo sem marca vale para todo mundo. O mesmo padrão volta
 * toda vez que alguém cria uma lista de conteúdo nova e esquece do campo.
 *
 * Este script é a rede. Ele falha quando:
 *
 *   1. Uma lista de conteúdo não tem `brand` em item nenhum e é lida sem filtro.
 *   2. Uma rota de um vertical fica aberta por URL para o outro.
 *   3. Dado simulado ("exemplo", "demonstração", "fictício") ainda vai pro ar.
 *
 * Uso:  node scripts/check-marcas.mjs
 * Saída: 0 = separado | 1 = conteúdo vazando (NÃO faça deploy)
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DADOS = join(RAIZ, 'src/pilulas/data');
const ler = (p) => readFileSync(join(RAIZ, p), 'utf8');

const V = '\x1b[0;32m', X = '\x1b[0;31m', A = '\x1b[0;33m', N = '\x1b[0m';
let falhas = 0;
const falha = (m, d) => { console.log(`  ${X}FALHA${N}  ${m}`); if (d) console.log(`         ${d}`); falhas += 1; };
const aviso = (m) => console.log(`  ${A}aviso${N}  ${m}`);
const ok = (m) => console.log(`  ${V}ok${N}     ${m}`);

console.log('→ Conferindo separação por marca…\n');

// ── 1. Listas de conteúdo sem marca ────────────────────────────────────────
// Uma lista exportada com muitos itens e nenhum `brand:` é candidata a vazar.
// A exceção é declarada no próprio arquivo, com o motivo — o comentário
// "vale p/ todas" marca conteúdo deliberadamente comum a todas as marcas.
const ISENTOS = new Set([
  'brands.ts', 'cargos.ts', 'roles.ts', 'segments.ts', 'vocabulario.ts',
  'speech.ts', 'ditado.ts', 'narrationTimings.ts', 'excluirConta.ts',
  'afiliadoCode.ts', 'tracking.ts', 'store.ts', 'placar.ts', 'videoStore.ts',
  'videoGesture.ts', 'leads.ts', 'profile.ts', 'lembrete.ts', 'onePage.ts',
]);

/** Tira comentários: só interessa o que chega na tela, não o que explica o código. */
const semComentarios = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** O arquivo filtra por marca em algum lugar? Então a lista não sai crua. */
const filtraPorMarca = (t) => /DaMarca|daMarca|\.brand === |brand === |brandId\)|=== brandId/.test(t);

/**
 * Rótulo de estrutura (nível, prateleira, conquista, canal) não é conteúdo de
 * empresa: é o esqueleto da tela, igual para todo mundo por definição.
 */
const ESTRUTURA = /^(LEVELS|ACHIEVEMENTS|PRATELEIRAS|CHANNELS|ORIGENS|AUDIENCES|MEDAL|ORDEM)/;

for (const arq of readdirSync(DADOS).filter((f) => f.endsWith('.ts'))) {
  if (ISENTOS.has(arq)) continue;
  const src = ler(`src/pilulas/data/${arq}`);
  const listas = [...src.matchAll(/export const ([A-Z_][A-Z0-9_]*)\s*:\s*[^=]*=\s*\[/g)];
  for (const [, nome] of listas) {
    const bloco = src.slice(src.indexOf(`export const ${nome}`));
    const fim = bloco.indexOf('\n];');
    const corpo = bloco.slice(0, fim > 0 ? fim : 4000);
    const itens = (corpo.match(/^\s{2}\{/gm) || []).length;
    if (itens < 3) continue; // lista curta de configuração, não de conteúdo
    if (/brand[?]?:/.test(corpo)) continue;
    if (ESTRUTURA.test(nome)) continue; // esqueleto de tela, não conteúdo de empresa
    if (filtraPorMarca(src)) continue;  // o arquivo já recorta por marca na saída
    if (/vale p\/ todas|product-agnostic|comum a todas/.test(src)) {
      aviso(`${arq} · ${nome} não tem marca — declarado como comum a todas no arquivo`);
      continue;
    }
    falha(`${arq} · ${nome} tem ${itens} itens e nenhum campo brand`,
      'Conteúdo sem marca aparece para TODAS as empresas. Adicione brand ou declare o motivo no arquivo.');
  }
}

// ── 2. Rotas abertas por URL para o vertical errado ────────────────────────
const app = ler('src/pilulas/PilulasApp.tsx');
const nav = ler('src/pilulas/BottomNav.tsx');
const bloco = (marcador, ate) => nav.slice(nav.indexOf(marcador), nav.indexOf(ate));
const rotasDe = (t) => new Set([...t.matchAll(/to: '(\/eleva[^']*)'/g)].map((m) => m[1]));

const noMenuAuto = new Set([
  ...rotasDe(bloco('const AUTO_TABS', 'const GESTOR_AUTO_TABS')),
  ...rotasDe(bloco('const GESTOR_AUTO_TABS', 'const BALCAO_TABS')),
]);
// Telas que valem para qualquer vertical — não são conteúdo de marca.
const NEUTRAS = new Set(['/eleva', '/eleva/sobre', '/eleva/perfil', '/eleva/privacidade',
  '/eleva/trilha', '/eleva/ranking', '/eleva/gestor', '/eleva/documentos', '/eleva/acessorio']);

for (const [, rota] of app.matchAll(/path="(\/eleva[^"*:]*)"/g)) {
  if (noMenuAuto.has(rota) || NEUTRAS.has(rota)) continue;
  const linha = app.split('\n').find((l) => l.includes(`path="${rota}"`)) || '';
  if (/BlockAuto/.test(linha)) continue;
  falha(`rota ${rota} abre por URL no automotivo e não está no menu dele`,
    'Esconder a aba não fecha a porta. Envolva em <BlockAuto> ou explique por que pode ficar aberta.');
}

// ── 3. Dado simulado ainda no ar ───────────────────────────────────────────
const SIMULADO = /inventad|fictíci|de demonstração|simula(ção|do|da)|dados falsos/i;
for (const arq of readdirSync(DADOS).filter((f) => f.endsWith('.ts'))) {
  const src = semComentarios(ler(`src/pilulas/data/${arq}`));
  if (!SIMULADO.test(src)) continue;
  // "demo: true" na saída é honesto: a tela avisa o usuário. Sem aviso, não é.
  const avisaNaTela = /demo\b|exemplo/.test(src);
  if (avisaNaTela) aviso(`${arq} tem dado simulado, mas a tela avisa (demo/exemplo)`);
  else falha(`${arq} tem dado simulado e a tela NÃO avisa`,
    'Número inventado sem aviso vira promessa. Remova ou marque como exemplo na tela.');
}

console.log();
if (falhas === 0) {
  console.log(`${V}✓ Nada vazando entre as marcas.${N}`);
} else {
  console.log(`${X}✗ ${falhas} problema(s) de separação — NÃO publique.${N}`);
}
process.exit(falhas === 0 ? 0 : 1);
