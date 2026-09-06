import fs from 'fs';
import { get, doc2obj } from '../_firestore.mjs';

const st = await get('elevaStats?pageSize=300');
const TESTE = /gitti|silene|mari\.briso|teste|diagnostico|sync|maria26/i;
const gente = (st.documents || []).map((d) => ({ uid: d.name.split('/').pop(), ...doc2obj(d) }))
  .filter((u) => u.brand === 'ramasa' && !TESTE.test(`${u.email || ''} ${u.name || ''}`));

const CARGOS = {
  'vendedor-veiculos': 'Vendedor de veículos',
  'vendedor-acessorios': 'Vendedor de acessórios',
  'executivo-leads': 'Executivo de leads',
  'gerente-leads': 'Gerente de leads',
  'gerente-veiculos': 'Gerente de vendas',
  'gerente-acessorios': 'Gerente de acessórios',
  'lider-acessorios': 'Supervisor de acessórios',
  'gerente-qualidade': 'Qualidade',
};

const todos = [];
for (const u of gente) {
  const ev = Array.isArray(u.events) ? u.events : [];
  todos.push({
    nome: u.name || (u.email || '').split('@')[0],
    email: u.email || '',
    cargo: CARGOS[u.cargo] || (u.role === 'gestor' ? 'Gestão (sem cargo)' : 'Sem cargo definido'),
    cargoId: u.cargo || '',
    papel: u.role || '',
    pontos: u.month?.points || 0,
    vistas: u.totals?.views || 0,
    quiz: u.totals?.quizPassed || 0,
    ofensiva: u.totals?.streak || 0,
    contato: u.cartaoPronto === true,
    ultimo: u.lastActiveAt || null,
    eventos: ev,
  });
}
fs.writeFileSync('uso-bruto.json', JSON.stringify(todos, null, 1));

// quantos dias de atividade e o que cada um fez
const porTipo = {};
let totalEventos = 0;
const porDia = {};
for (const p of todos) {
  for (const e of p.eventos) {
    totalEventos++;
    porTipo[e.type] = (porTipo[e.type] || 0) + 1;
    const dia = String(e.at || '').slice(0, 10);
    if (dia) porDia[dia] = (porDia[dia] || 0) + 1;
  }
}
console.log('pessoas (fora contas de teste):', todos.length);
console.log('eventos registrados          :', totalEventos);
console.log('\npor tipo de ação:'); for (const [k, v] of Object.entries(porTipo).sort((a,b)=>b[1]-a[1])) console.log(`  ${k.padEnd(16)} ${v}`);
console.log('\npor dia:'); for (const [k, v] of Object.entries(porDia).sort()) console.log(`  ${k}  ${v}`);
console.log('\npor cargo:');
const g = {};
for (const p of todos) (g[p.cargo] ||= []).push(p);
for (const [c, ps] of Object.entries(g)) {
  const ativos = ps.filter((p) => p.eventos.length).length;
  console.log(`  ${c.padEnd(26)} ${String(ps.length).padStart(2)} pessoas · ${ativos} com atividade · ${ps.reduce((s,p)=>s+p.vistas,0)} vídeos`);
}
