// Puxa as condições publicadas para a gravação mostrar o app com o conteúdo
// real — a folha de uma delas vai junto, pra tela da lâmina não ficar vazia.
import fs from 'fs';
import { get, doc2obj } from '../_firestore.mjs';

const r = await get('elevaCondicoes?pageSize=100');
const conds = (r.documents || []).map((d) => ({ id: d.name.split('/').pop(), ...doc2obj(d) }))
  .filter((c) => c.brand === 'ramasa')
  .map(({ arquivo, ...c }) => c);
fs.writeFileSync('condicoes-reais.json', JSON.stringify(conds));
console.log('condições publicadas:', conds.length);

const alvo = conds.find((c) => /omoda-5/.test(c.id)) || conds[0];
const f = await get(`elevaCondicoes/${alvo.id}/arquivo/unica`);
fs.writeFileSync('folha-omoda5.txt', f.fields?.arquivo?.stringValue || '');
console.log('folha de', alvo.id, '·', Math.round((f.fields?.arquivo?.stringValue || '').length / 1024), 'KB');
