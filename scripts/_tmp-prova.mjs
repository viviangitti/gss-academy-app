import fs from 'fs';
import { TOKEN } from './_firestore.mjs';
const h = { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' };
const source = { files: [{ name: 'firestore.rules', content: fs.readFileSync('/Users/viviangitti/gss/firestore.eleva.rules', 'utf8') }] };
const D = '/databases/(default)/documents';
const perfil = (uid, marcas) => ([
  { function: 'exists', args: [{ exactValue: `${D}/elevaUsers/${uid}` }], result: { value: true } },
  { function: 'get', args: [{ exactValue: `${D}/elevaUsers/${uid}` }], result: { value: { data: { brands: marcas } } } },
]);
const DSP = { uid: 'u-dsp', token: { email: 'balconista@drogariasp.com.br', email_verified: true } };
const RAM = { uid: 'u-ram', token: { email: 'cristiano.maciel@gruporamasa.com', email_verified: true } };
const VEN = { uid: 'u-ven', token: { email: 'vendedor@gruporamasa.com', email_verified: true } };
const VIV = { uid: 'u-viv', token: { email: 'viviangitti23@gmail.com', email_verified: true } };
const SIL = { uid: 'u-sil', token: { email: 'silene_mendes@hotmail.com', email_verified: true } };

const casos = [
  // --- a pergunta da Vivian: a DSP não alcança as outras ---
  ['DSP lê condição da Ramasa',          'DENY',  DSP, 'get',  `${D}/elevaCondicoes/r1`, { brand: 'ramasa' }, perfil('u-dsp', ['dsp'])],
  ['DSP lê perfil de outra pessoa',      'DENY',  DSP, 'get',  `${D}/elevaUsers/u-ram`, { brands: ['ramasa'] }, perfil('u-dsp', ['dsp'])],
  ['DSP lê uso de outra pessoa',         'DENY',  DSP, 'get',  `${D}/elevaStats/u-ram`, { brand: 'ramasa' }, perfil('u-dsp', ['dsp'])],
  ['DSP lista produtos da Ramasa',       'DENY',  DSP, 'list', `${D}/elevaProdutos/p1`, { brand: 'ramasa' }, perfil('u-dsp', ['dsp'])],
  ['DSP lê acessórios da Ramasa',        'DENY',  DSP, 'get',  `${D}/elevaAcessorios/ramasa`, { itens: [] }, perfil('u-dsp', ['dsp'])],
  ['DSP lê objeção publicada da Ramasa', 'DENY',  DSP, 'get',  `${D}/elevaObjections/o1`, { brand: 'ramasa', publicada: true, byEmail: 'x@y' }, perfil('u-dsp', ['dsp'])],
  ['DSP lê placar da Ramasa',            'DENY',  DSP, 'list', `${D}/elevaPlacar/u-ram`, { brand: 'ramasa' }, perfil('u-dsp', ['dsp'])],
  ['DSP lê lead do site',                'DENY',  DSP, 'get',  `${D}/elevaLeads/l1`, { email: 'x@y' }, perfil('u-dsp', ['dsp'])],
  // --- e continua enxergando o que é dela ---
  ['DSP lê a própria condição',          'ALLOW', DSP, 'get',  `${D}/elevaCondicoes/d1`, { brand: 'dsp' }, perfil('u-dsp', ['dsp'])],
  ['DSP lê o próprio perfil',            'ALLOW', DSP, 'get',  `${D}/elevaUsers/u-dsp`, { brands: ['dsp'] }, perfil('u-dsp', ['dsp'])],
  ['DSP lê o próprio uso',               'ALLOW', DSP, 'get',  `${D}/elevaStats/u-dsp`, { brand: 'dsp' }, perfil('u-dsp', ['dsp'])],
  ['DSP lê os próprios acessórios',      'ALLOW', DSP, 'get',  `${D}/elevaAcessorios/dsp`, { itens: [] }, perfil('u-dsp', ['dsp'])],
  ['DSP grava o próprio uso',            'ALLOW', DSP, 'update', `${D}/elevaStats/u-dsp`, { brand: 'dsp' }, perfil('u-dsp', ['dsp'])],
  ['DSP lê documento global (sem marca)','ALLOW', DSP, 'get',  `${D}/elevaDocs/d1`, { titulo: 'x' }, perfil('u-dsp', ['dsp'])],
  ['DSP lê foto de produto',             'ALLOW', DSP, 'get',  `${D}/elevaImagens/x`, { bytes: 1 }, perfil('u-dsp', ['dsp'])],
  // --- o time da Ramasa segue funcionando ---
  ['Vendedor Ramasa lê condição dele',   'ALLOW', VEN, 'list', `${D}/elevaCondicoes/r1`, { brand: 'ramasa' }, perfil('u-ven', ['ramasa'])],
  ['Vendedor Ramasa lê o placar do time','ALLOW', VEN, 'list', `${D}/elevaPlacar/u-x`, { brand: 'ramasa' }, perfil('u-ven', ['ramasa'])],
  ['Gerente Ramasa lista uso do time',   'ALLOW', RAM, 'list', `${D}/elevaStats/u-ven`, { brand: 'ramasa' }, perfil('u-ram', ['ramasa'])],
  ['Gerente Ramasa publica condição',    'ALLOW', RAM, 'update', `${D}/elevaCondicoes/r1`, { brand: 'ramasa' }, perfil('u-ram', ['ramasa'])],
  ['Gerente Ramasa lista uso da Meraki', 'DENY',  RAM, 'list', `${D}/elevaStats/u-mer`, { brand: 'meraki' }, perfil('u-ram', ['ramasa'])],
  ['Gerente Ramasa lê perfil do time',   'DENY',  RAM, 'get',  `${D}/elevaUsers/u-ven`, { brands: ['ramasa'] }, perfil('u-ram', ['ramasa'])],
  // --- GSS enxerga tudo ---
  ['Vivian lê condição da Ramasa',       'ALLOW', VIV, 'get',  `${D}/elevaCondicoes/r1`, { brand: 'ramasa' }, perfil('u-viv', [])],
  ['Vivian lê perfil de qualquer um',    'ALLOW', VIV, 'get',  `${D}/elevaUsers/u-ven`, { brands: ['ramasa'] }, perfil('u-viv', [])],
  ['Silene lista uso da Meraki',         'ALLOW', SIL, 'list', `${D}/elevaStats/u-mer`, { brand: 'meraki' }, perfil('u-sil', [])],
  ['Silene lê lead do site',             'ALLOW', SIL, 'get',  `${D}/elevaLeads/l1`, { email: 'x@y' }, perfil('u-sil', [])],
];
const testCases = casos.map(([, esperado, auth, method, path, data, mocks]) => ({
  expectation: esperado,
  request: { auth, path, method, time: '2026-09-25T12:00:00Z' },
  resource: { data }, functionMocks: mocks,
}));
const r = await fetch('https://firebaserules.googleapis.com/v1/projects/eleva-gss:test', {
  method: 'POST', headers: h, body: JSON.stringify({ source, testSuite: { testCases } }),
}).then((x) => x.json());
if (r.error) { console.log('ERRO nas regras:', JSON.stringify(r.error).slice(0, 600)); process.exit(1); }
let falhas = 0;
(r.testResults || []).forEach((res, i) => {
  const ok = res.state === 'SUCCESS';
  if (!ok) falhas++;
  console.log(`${ok ? '  ok ' : 'FALHA'} ${casos[i][1].padEnd(5)} ${casos[i][0]}`);
});
console.log(falhas ? `\n${falhas} fora do esperado` : `\nTodos os ${casos.length} casos bateram.`);
