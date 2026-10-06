// PUBLICA A CARTA DO MÊS no lugar de quem não conseguiu.
//
// A Raphaela tentou duas vezes e esbarrou num defeito do app (o pdf.js exigindo
// um método que o celular dela não tem). O conserto está no ar, mas o time está
// sem taxa de carro desde 02/10 — então a Vivian mandou subir.
//
// O corte das páginas é feito pelo PRÓPRIO lerCarta do app, dentro do navegador:
// é o que garante que o rebate da rede sai tapado exatamente como sairia pelas
// mãos dela. Só a gravação é minha, porque eu tenho a chave e ela tem a conta.
//
// Uso: node scripts/acompanha/publica-carta.mjs <carta.pdf> [--de-verdade]
import fs from 'fs';
import { BASE, TOKEN } from '../_firestore.mjs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const PDF = process.argv[2];
const VALENDO = process.argv.includes('--de-verdade');
const MARCA = 'ramasa';
if (!PDF || !fs.existsSync(PDF)) { console.error('falta o PDF'); process.exit(1); }

/** A mesma impressão digital que o app usa pra reconhecer folha repetida. */
function impressaoDe(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return `${(h >>> 0).toString(36)}-${s.length}`;
}
const novoId = () => 'c-' + Math.random().toString(36).slice(2, 10);

// ---- 1. o corte, pelo app ----
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('DOM.enable');
await c.send('Page.navigate', { url: 'http://localhost:5173/eleva' });
await new Promise((r) => setTimeout(r, 4500));
await c.send('Runtime.evaluate', { expression: `(()=>{const i=document.createElement('input');i.type='file';i.id='alvo';document.body.appendChild(i);})()` });
const doc = await c.send('DOM.getDocument');
const campo = await c.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#alvo' });
await c.send('DOM.setFileInputFiles', { nodeId: campo.nodeId, files: [PDF] });
const r = await c.send('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `(async () => {
  const { lerCarta } = await import('/src/pilulas/data/cartaPdf.ts');
  const pgs = await lerCarta(document.getElementById('alvo').files[0], '${MARCA}');
  return pgs.map(p => ({ n:p.n, titulo:p.titulo, categoria:p.categoria, incluir:p.incluir,
    arquivo:p.arquivo, bytes:p.bytes, rebates:p.rebates, venceEm:p.venceEm, validade:p.validade, resumo:p.resumo }));
})()` });
c.fechar(); proc.kill();
const pgs = r.result.value;
const escolhidas = pgs.filter((p) => p.incluir);

console.log('A CARTA, CORTADA PELO APP');
pgs.forEach((p) => console.log('  pág', String(p.n).padStart(2), p.incluir ? '· publica' : '·  fora  ',
  String(Math.round(p.bytes / 1024) + ' KB').padStart(8), (p.rebates ? `${p.rebates} rebate(s) tapado(s)` : '').padEnd(22), p.titulo));
console.log('');
console.log('validade:', escolhidas[0]?.validade, '| sai do ar em', escolhidas[0]?.venceEm);
console.log('vão subir:', escolhidas.length, 'condições');

if (!VALENDO) { console.log('\n(ensaio — nada foi gravado. rode com --de-verdade)'); process.exit(0); }

// ---- 2. a gravação ----
// Ordem invertida, como o app faz: a última gravada fica no topo da lista, e
// assim a página 2 (a primeira da carta) encabeça a prateleira do vendedor.
console.log('');
let ok = 0;
for (const p of [...escolhidas].reverse()) {
  const id = novoId();
  const ficha = {
    id, brand: MARCA, titulo: p.titulo,
    validade: p.validade || 'confirmar validade com a gerência',
    categoria: p.categoria, venceEm: p.venceEm || '',
    resumo: p.resumo || '', tipo: 'imagem',
    nomeArquivo: `${p.titulo.slice(0, 60)}.jpg`,
    criadoEm: Date.now(), impressao: impressaoDe(p.arquivo),
  };
  const grava = async (caminho, campos) => {
    const body = { fields: Object.fromEntries(Object.entries(campos).map(([k, v]) => [k,
      typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v) }])) };
    const res = await fetch(`${BASE}/${caminho}`, { method: 'PATCH',
      headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`${caminho}: ${res.status} ${(await res.text()).slice(0, 160)}`);
  };
  // A FOLHA PRIMEIRO, como o app: se a ficha entrasse antes e a imagem
  // falhasse, o time veria uma condição publicada que não abre.
  await grava(`elevaCondicoes/${id}/arquivo/unica`, { arquivo: p.arquivo });
  await grava(`elevaCondicoes/${id}`, ficha);
  ok += 1;
  console.log('  publicada:', p.titulo);
}
console.log('');
console.log(ok, 'de', escolhidas.length, 'no ar.');
