// O QUE O TIME RESPONDEU, no formato que o Painel espera — só para captura.
//
// Mesma razão do gera-time.mjs: a sessão de print não tem login do Firebase, a
// leitura falha e o Painel diz "ninguém respondeu ainda" com 64 respostas no
// banco. Isso enganou a Vivian num print (25/09/2026).
import fs from 'fs';
import { get, doc2obj } from '../_firestore.mjs';

async function lista(col) {
  const o = []; let t = '';
  for (;;) {
    const r = await get(`${col}?pageSize=300${t ? `&pageToken=${t}` : ''}`);
    (r.documents || []).forEach((d) => o.push({ id: d.name.split('/').pop(), ...doc2obj(d) }));
    if (!r.nextPageToken) break; t = r.nextPageToken;
  }
  return o;
}

const MARCA = process.argv[2] || 'ramasa';

const args = (await lista('elevaArgumentos'))
  .filter((a) => a.brand === MARCA)
  .map((a) => ({
    id: a.id, brand: a.brand, productId: a.productId, productName: a.productName,
    pontos: a.pontos || [], byName: a.byName || '', byEmail: a.byEmail || '',
    byRole: a.byRole || '', createdAt: a.createdAt || '', destacado: a.destacado === true,
  }))
  .sort((x, y) => String(y.createdAt).localeCompare(String(x.createdAt)));
fs.writeFileSync('argumentos-ramasa.json', JSON.stringify(args));

const objs = (await lista('elevaObjections'))
  .filter((o) => o.brand === MARCA)
  .map((o) => ({ id: o.id, ...o }));
fs.writeFileSync('objecoes-ramasa.json', JSON.stringify(objs));

console.log('argumentos-ramasa.json:', args.length, 'respostas ·', new Set(args.map((a) => a.byName)).size, 'pessoas');
console.log('objecoes-ramasa.json:', objs.length, 'objeções');
