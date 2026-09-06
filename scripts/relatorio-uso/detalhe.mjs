import fs from 'fs';
const todos = JSON.parse(fs.readFileSync('uso-bruto.json', 'utf8'));
const NOMES = { pill_view:'Vídeo assistido', quiz_start:'Quiz iniciado', quiz_pass:'Quiz acertado',
  quiz_fail:'Quiz errado', doc_open:'Documento aberto', onepage:'Material gerado pro cliente',
  objecao:'Objeção registrada', acessorio:'Acessório consultado', video_play:'Vídeo tocado' };
const carros = {}, docs = {}, acess = {};
for (const p of todos) {
  p.porTipo = {};
  p.dias = new Set();
  for (const e of p.eventos) {
    p.porTipo[e.type] = (p.porTipo[e.type] || 0) + 1;
    const d = String(e.at||'').slice(0,10); if (d) p.dias.add(d);
    if (e.type === 'pill_view') carros[e.id] = (carros[e.id]||0)+1;
    if (e.type === 'doc_open') docs[e.id] = (docs[e.id]||0)+1;
    if (e.type === 'acessorio') acess[e.id] = (acess[e.id]||0)+1;
  }
  p.diasAtivos = p.dias.size;
  p.ultimoDia = p.eventos.length ? String(p.eventos[p.eventos.length-1].at||'').slice(0,10) : '';
  delete p.dias; delete p.eventos;
}
fs.writeFileSync('uso-detalhe.json', JSON.stringify({ todos, carros, docs, acess, NOMES }, null, 1));
const top = (o,n=8)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n);
console.log('CARROS MAIS ASSISTIDOS'); for (const [k,v] of top(carros)) console.log(`  ${k.padEnd(24)} ${v}`);
console.log('\nDOCUMENTOS MAIS ABERTOS'); for (const [k,v] of top(docs)) console.log(`  ${k.padEnd(40)} ${v}`);
console.log('\nACESSÓRIOS CONSULTADOS'); for (const [k,v] of top(acess)) console.log(`  ${k.padEnd(30)} ${v}`);
console.log('\nPESSOAS SEM NENHUMA ATIVIDADE:', todos.filter(p=>!p.diasAtivos).map(p=>p.nome).join(', ') || '(nenhuma)');
console.log('MATERIAL PRO CLIENTE gerado por:', todos.filter(p=>p.porTipo.onepage).map(p=>`${p.nome} (${p.porTipo.onepage})`).join(', ') || '(ninguém)');
