// AS REGRAS DO BANCO CONFERIDAS CONTRA O QUE O APP REALMENTE LÊ.
//
// Nasceu de um estrago: em 25/09/2026 as regras novas fecharam a leitura do
// que não estivesse citado nominalmente, e a FOLHA da condição — que mora numa
// subcoleção (elevaCondicoes/{id}/arquivo) — ficou de fora da lista. Por seis
// horas o time viu "sem internet para abrir a folha" com 5G na tela.
//
// A lista que eu tinha usado para escrever as regras saiu da minha cabeça, e o
// teste que eu escrevi depois repetiu o mesmo ponto cego: quem escreve a regra
// não é bom juiz do que ela esqueceu. Este script não pergunta nada a ninguém —
// ele LÊ O CÓDIGO do app, monta cada caminho que o app busca no Firestore
// (inclusive subcoleção) e pede ao próprio Firebase para simular a leitura com
// uma conta de vendedor comum. Se um caminho vier negado, falha.
//
// Uso: node scripts/check-regras.mjs            (regras publicadas)
//      node scripts/check-regras.mjs arquivo    (o firestore.eleva.rules local)
import fs from 'fs';
import path from 'path';
if (process.env.PULAR_REGRAS === '1') {
  console.log('→ Regras do banco: conferência PULADA a pedido (PULAR_REGRAS=1).');
  process.exit(0);
}
const { TOKEN } = await import('./_firestore.mjs');

const RAIZ = 'src/pilulas';
const D = '/databases/(default)/documents';
const VERDE = '\x1b[0;32m', VERM = '\x1b[0;31m', AMAR = '\x1b[0;33m', FIM = '\x1b[0m';

// ── 1. o que o app lê, tirado do código ───────────────────────────────────
function arquivosTs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return arquivosTs(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

// Constantes de coleção declaradas no próprio arquivo (const COL = 'elevaX').
function constantes(texto) {
  const mapa = {};
  for (const [, nome, valor] of texto.matchAll(/const\s+([A-Z_][A-Z0-9_]*)\s*=\s*'([^']+)'/g)) mapa[nome] = valor;
  return mapa;
}

function caminhosDe(texto, consts) {
  const achados = new Set();
  const resolve = (arg) => {
    const t = arg.trim();
    if (/^'[^']*'$/.test(t)) return t.slice(1, -1);
    if (consts[t]) return consts[t];
    return null; // variável: vira um {id} qualquer
  };
  // collection(db, A[, b, c…]) e doc(db, A[, b, c…])
  for (const [, args] of texto.matchAll(/\b(?:collection|doc)\(\s*db\s*,([^)]*)\)/g)) {
    const partes = args.split(',').map((x) => x.trim()).filter(Boolean);
    if (!partes.length) continue;
    const trilha = [];
    partes.forEach((p, i) => {
      const v = resolve(p);
      // posição par (0,2,4…) é COLEÇÃO; ímpar é documento
      if (i % 2 === 0) trilha.push(v || '???');
      else trilha.push(v ? `{${v}}` : '{id}');
    });
    if (trilha[0] && trilha[0].startsWith('eleva')) achados.add(trilha.join('/'));
  }
  return achados;
}

const caminhos = new Set();
for (const arq of arquivosTs(RAIZ)) {
  const texto = fs.readFileSync(arq, 'utf8');
  if (!texto.includes('db,')) continue;
  for (const c of caminhosDe(texto, constantes(texto))) caminhos.add(c);
}

// Normaliza: coleção/{doc}/subcoleção/{doc} → caminho concreto para o teste.
const paraTeste = [...caminhos].map((c) => {
  const partes = c.split('/');
  const concreto = partes.map((p, i) => (i % 2 === 0 ? p : 'x')).join('/');
  // sempre termina em documento (o simulador testa leitura de documento)
  return partes.length % 2 === 1 ? `${concreto}/x` : concreto;
}).filter((c) => !c.includes('???'));

const unicos = [...new Set(paraTeste)].sort();
console.log(`→ Conferindo as regras contra ${unicos.length} caminho(s) que o app lê…`);

// ── 2. pergunta ao Firebase se um VENDEDOR comum consegue ler ─────────────
const h = { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' };
let source;
const arg = process.argv[2];
if (arg) {
  // caminho de arquivo (ou 'arquivo' para o firestore.eleva.rules do repositório)
  const alvo = arg === 'arquivo' ? 'firestore.eleva.rules' : arg;
  source = { files: [{ name: 'firestore.rules', content: fs.readFileSync(alvo, 'utf8') }] };
  console.log(`  regras do arquivo: ${alvo}`);
} else {
  const rel = await fetch('https://firebaserules.googleapis.com/v1/projects/eleva-gss/releases', { headers: h }).then((r) => r.json());
  const alvo = (rel.releases || []).find((r) => r.name.endsWith('cloud.firestore'));
  const rs = await fetch(`https://firebaserules.googleapis.com/v1/${alvo.rulesetName}`, { headers: h }).then((r) => r.json());
  source = rs.source;
  console.log(`  regras no ar: ${alvo.rulesetName.split('/').pop()}`);
}

// ── QUEM PODE LER CADA COISA ──────────────────────────────────────────────
//
// O contrato, escrito à mão de propósito: é a única parte que exige decisão
// humana. O scanner acha os caminhos; esta tabela diz de quem eles são. Se
// aparecer um caminho que não está aqui, o teste falha pedindo que alguém
// declare — assim coleção nova não entra em silêncio.
//
//   vendedor — qualquer pessoa da marca lê (conteúdo do dia a dia)
//   gestor   — só a gerência da marca
//   gss      — só a GSS
//   dono     — só a própria pessoa (o teste usa o uid dela)
const QUEM_LE = {
  'elevaUsers/*': 'dono',
  'elevaStats/*': 'dono',
  'elevaRituais/*': 'dono',
  'elevaPlacar/*': 'vendedor',
  'elevaCondicoes/*': 'vendedor',
  'elevaCondicoes/*/arquivo/*': 'vendedor',   // a folha — o que quebrou em 25/09
  'elevaProdutos/*': 'vendedor',
  'elevaDocs/*': 'vendedor',
  'elevaDocs/*/pedacos/*': 'vendedor',
  'elevaVideos/*': 'vendedor',
  'elevaVideos/*/pedacos/*': 'vendedor',
  'elevaImagens/*': 'vendedor',
  'elevaAcessorios/*': 'vendedor',            // o documento é a MARCA
  'elevaDocsOcultos/*': 'vendedor',           // idem
  'elevaDestaques/*': 'vendedor',
  'elevaOverrides/*': 'vendedor',
  'elevaContent/*': 'vendedor',
  'elevaMeta/*': 'vendedor',
  'elevaObjections/*': 'gestor',
  'elevaArgumentos/*': 'gestor',
  'elevaSales/*': 'gestor',
  'elevaLeads/*': 'gss',
  // Estrutura antiga (store.firebase.ts), mantida por compatibilidade: o
  // documento de primeiro nível é a MARCA.
  'elevaBrands/*': 'vendedor',
  'elevaBrands/*/elevaProducts/*': 'vendedor',
  'elevaBrands/*/elevaOffers/*': 'vendedor',
  'elevaBrands/*/elevaCalendar/*': 'vendedor',
  'elevaBrands/*/elevaTrends/*': 'vendedor',
  'elevaBrands/*/elevaMissions/*': 'vendedor',
  'elevaBrands/*/elevaSellers/*': 'vendedor',
  'elevaBrands/*/elevaEvents/*': 'gestor',
};

// Coleções cujo NOME DO DOCUMENTO é a marca — o teste precisa usar 'ramasa',
// senão a regra nega com razão e o alarme dispara à toa.
const DOC_E_MARCA = new Set(['elevaAcessorios', 'elevaDocsOcultos', 'elevaBrands']);

const CONTAS = {
  vendedor: { uid: 'x', token: { email: 'vendedor@gruporamasa.com', email_verified: true } },
  gestor: { uid: 'x', token: { email: 'cristiano.maciel@gruporamasa.com', email_verified: true } },
  gss: { uid: 'x', token: { email: 'viviangitti23@gmail.com', email_verified: true } },
  dono: { uid: 'x', token: { email: 'vendedor@gruporamasa.com', email_verified: true } },
};

const VEND = CONTAS.vendedor;
const mocksDe = (caminho) => {
  const base = [
    { function: 'exists', args: [{ exactValue: `${D}/elevaUsers/x` }], result: { value: true } },
    { function: 'get', args: [{ exactValue: `${D}/elevaUsers/x` }], result: { value: { data: { brands: ['ramasa'] } } } },
  ];
  // Subcoleção: a regra costuma olhar o documento PAI para saber a empresa.
  const partes = caminho.split('/');
  for (let i = 2; i < partes.length; i += 2) {
    const pai = `${D}/${partes.slice(0, i).join('/')}`;
    base.push({ function: 'get', args: [{ exactValue: pai }], result: { value: { data: { brand: 'ramasa' } } } });
    base.push({ function: 'exists', args: [{ exactValue: pai }], result: { value: true } });
  }
  return base;
};

// A chave da tabela: o caminho com os documentos trocados por *
const chaveDe = (c) => c.split('/').map((p, i) => (i % 2 === 0 ? p : '*')).join('/');
// O documento de teste: 'ramasa' quando o nome do documento É a marca.
const concreto = (c) => c.split('/').map((p, i) => {
  if (i % 2 === 0) return p;
  return DOC_E_MARCA.has(c.split('/')[i - 1]) ? 'ramasa' : (i === 1 && c.startsWith('elevaUsers') ? 'x' : 'x');
}).join('/');

const semDono = unicos.filter((c) => !QUEM_LE[chaveDe(c)]);
if (semDono.length) {
  console.log(`\n${AMAR}AVISO${FIM}  caminho novo sem dono declarado em QUEM_LE:`);
  semDono.forEach((c) => console.log(`         ${chaveDe(c)}`));
  console.log(`       Declare quem lê (vendedor / gestor / gss / dono) antes de publicar.`);
}

const alvos = unicos.filter((c) => QUEM_LE[chaveDe(c)]);
const testCases = alvos.map((c) => {
  const quem = QUEM_LE[chaveDe(c)];
  const caminho = concreto(c);
  const dados = { brand: 'ramasa' };
  if (c.startsWith('elevaObjections')) { dados.publicada = true; dados.byEmail = 'outro@x.com'; }
  if (c.startsWith('elevaSales')) dados.uid = 'x';
  return {
    expectation: 'ALLOW',
    request: { auth: CONTAS[quem], path: `${D}/${caminho}`, method: 'get', time: new Date().toISOString() },
    resource: { data: dados },
    functionMocks: mocksDe(caminho),
  };
});

const r = await fetch('https://firebaserules.googleapis.com/v1/projects/eleva-gss:test', {
  method: 'POST', headers: h, body: JSON.stringify({ source, testSuite: { testCases } }),
}).then((x) => x.json());

if (r.error) {
  // Não consegui conferir NÃO é o mesmo que está tudo bem. Falha de propósito —
  // com uma saída declarada para quem estiver sem rede e souber o que faz.
  console.log(`${VERM}✗ não consegui simular as regras: ${r.error.message || ''}${FIM}`);
  console.log(`  sem rede? rode com PULAR_REGRAS=1 npm run confere — e confira antes de publicar regra.`);
  process.exit(1);
}

const negados = [];
(r.testResults || []).forEach((res, i) => {
  if (res.state !== 'SUCCESS') negados.push(`${alvos[i]}  (deveria abrir para: ${QUEM_LE[chaveDe(alvos[i])]})`);
});

if (semDono.length && !negados.length) process.exitCode = 1;
if (negados.length) {
  console.log(`\n${VERM}FALHA${FIM}  o app lê estes caminhos e as regras NEGAM:`);
  negados.forEach((c) => console.log(`         ${c}`));
  console.log(`\n       Foi exatamente assim que a folha da condição caiu em 25/09.`);
  console.log(`${VERM}✗ Regras e app desencontrados — NÃO publique.${FIM}`);
  process.exit(1);
}
console.log(`${VERDE}✓ Tudo o que o app lê continua aberto para quem é da marca.${FIM}`);
