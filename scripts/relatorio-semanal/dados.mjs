// Os números de UMA semana (segunda a domingo) do Eleva na Ramasa.
//
// A espinha é o Firebase Auth: nome, data da conta e acesso. O que cada pessoa
// fez vem do array `events` de elevaStats — o mesmo dado do scripts/uso-eleva.mjs.
// Filtrar por `brand` do elevaStats foi o erro do relatório antigo: o carimbo
// de marca já esteve errado para seis vendedores. Aqui vale o acesso do perfil.
import { get, doc2obj, TOKEN } from '../_firestore.mjs';
import { readFileSync } from 'fs';

const RAIZ = new URL('../../', import.meta.url);
const MARCA = 'ramasa';
const TESTE = new Set(['viviangitti23@gmail.com', 'viviangitti@gmail.com', 'maria26@gmail.com',
  'silene_mendes@hotmail.com', 'silene.mendesdesouza@gmail.com', 'silene.mendesangelodesouza@gmail.com']);
// Nome fora do relatório a pedido da Vivian (07/09/2026). A conta segue nos totais.
const SEM_NOME = /mariana/i;
const LEADS = ['executivo-leads', 'gerente-leads'];

export const dia = (x) => (x ? new Date(new Date(x).getTime() - 3 * 3600e3).toISOString().slice(0, 10) : '');
const mais = (d, n) => new Date(Date.parse(d + 'T12:00:00Z') + n * 86400e3).toISOString().slice(0, 10);
const entre = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 86400e3);

/** Segunda-feira da última semana completa. */
export function ultimaSemana(hoje = new Date()) {
  const h = dia(hoje.toISOString());
  const dow = (new Date(h + 'T12:00:00Z').getUTCDay() + 6) % 7; // 0 = segunda
  return mais(h, -dow - 7);
}

function arruma(nome, email) {
  let n = (nome || '').trim();
  if (!n || /^[a-z0-9._-]+$/.test(n)) n = (n || email.split('@')[0]).replace(/[._-]+/g, ' ');
  n = n.split('|')[0].replace(/\b(tiger\s+omoda|lince\s+toyota|nikko\s+mitsubishi|omoda|jaecoo)\b/gi, '').replace(/\d{2,}/g, '').replace(/\s{2,}/g, ' ').trim();
  return n.split(' ').filter(Boolean).slice(0, 2).map((p) => (p.length <= 2 ? p.toLowerCase() : p[0].toUpperCase() + p.slice(1).toLowerCase())).join(' ') || email.split('@')[0];
}

function papeisDoCodigo() {
  const src = readFileSync(new URL('src/pilulas/AuthContext.tsx', RAIZ), 'utf8');
  const ini = src.indexOf('const ROLE_OVERRIDES');
  const bloco = src.slice(ini, src.indexOf('};', ini));
  const o = {};
  for (const m of bloco.matchAll(/'([^']+@[^']+)':\s*\{([^}]*)\}/g)) o[m[1].toLowerCase()] = { role: (m[2].match(/role:\s*'([^']+)'/) || [])[1], cargo: (m[2].match(/cargo:\s*'([^']+)'/) || [])[1] };
  return o;
}
function podemPublicar() {
  const r = readFileSync(new URL('firestore.eleva.rules', RAIZ), 'utf8');
  const f = r.slice(r.indexOf('function isGestor()'));
  return new Set([...f.slice(0, f.indexOf('}')).matchAll(/'([^']+@[^']+)'/g)].map((m) => m[1].toLowerCase()));
}
export function nomesDeDocumentos() {
  const s = readFileSync(new URL('src/pilulas/data/documentos.ts', RAIZ), 'utf8');
  const m = {}; let id = null;
  for (const l of s.split('\n')) {
    const a = l.match(/id:\s*'([^']+)',\s*brand/); if (a) { id = a[1]; continue; }
    if (!id) continue;
    const b = l.match(/^\s*titulo:\s*'([^']+)'/); if (b) { m[id] = b[1]; id = null; }
  }
  return m;
}

export async function coletar(segunda) {
  const de = segunda, ate = mais(segunda, 6);
  const deAnt = mais(de, -7), ateAnt = mais(de, -1);
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/projects/eleva-gss/accounts:batchGet?maxResults=500', { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error(`Firebase Auth recusou (${r.status})`);
  const auth = (await r.json()).users || [];
  const perfis = {}, stats = {};
  for (const d of ((await get('elevaUsers?pageSize=300')).documents || [])) perfis[d.name.split('/').pop()] = doc2obj(d);
  for (const d of ((await get('elevaStats?pageSize=300')).documents || [])) { const o = doc2obj(d); stats[o.uid] = o; }
  const over = papeisDoCodigo(), publica = podemPublicar();

  const pessoas = auth.map((u) => {
    const email = (u.email || '').toLowerCase(), p = perfis[u.localId] || {}, s = stats[u.localId] || {};
    const role = over[email]?.role || p.role || '', cargo = over[email]?.cargo || p.cargo || s.cargo || '';
    const eventos = (s.events || []).filter((e) => e.at && dia(e.at) <= ate).map((e) => ({ ...e, d: dia(e.at) }));
    return { email, nome: arruma(u.displayName || s.name, email), cargo, role, marcas: p.brands || [],
      criada: dia(new Date(Number(u.createdAt)).toISOString()), eventos,
      gestor: role === 'gestor' || /gerente|lider/.test(cargo), podePublicar: publica.has(email) };
  }).filter((p) => p.marcas.includes(MARCA) && !TESTE.has(p.email) && p.criada <= ate);

  const naJanela = (p, a, b) => p.eventos.filter((e) => e.d >= a && e.d <= b);
  const resumo = (a, b) => {
    const ev = pessoas.flatMap((p) => naJanela(p, a, b).map((e) => ({ ...e, quem: p.email })));
    return {
      acoes: ev.length,
      pessoas: new Set(ev.map((e) => e.quem)).size,
      quiz: ev.filter((e) => e.type === 'quiz_pass').length,
      materiais: ev.filter((e) => e.type === 'onepage' && String(e.id).endsWith('|cliente')).length,
      acessorios: ev.filter((e) => e.type === 'acessorio').length,
      contasNovas: pessoas.filter((p) => p.criada >= a && p.criada <= b).length,
      gestores: pessoas.filter((p) => p.gestor && naJanela(p, a, b).length).length,
      leads: pessoas.filter((p) => LEADS.includes(p.cargo) && naJanela(p, a, b).length).length,
    };
  };
  const conta = (lista, f) => { const o = {}; for (const e of lista) if (f(e)) o[e.id] = (o[e.id] || 0) + 1; return Object.entries(o).sort((x, y) => y[1] - x[1]); };
  const evSemana = pessoas.flatMap((p) => naJanela(p, de, ate).map((e) => ({ ...e, quem: p })));
  const tipos = {}; for (const e of evSemana) tipos[e.type] = (tipos[e.type] || 0) + 1;

  const dias = Array.from({ length: 7 }, (_, i) => mais(de, i)).map((d) => {
    const ev = evSemana.filter((e) => e.d === d);
    return { d, acoes: ev.length, pessoas: new Set(ev.map((e) => e.quem.email)).size };
  });
  const semanas = Array.from({ length: 8 }, (_, i) => mais(de, -7 * (7 - i))).map((s) => ({ de: s, ate: mais(s, 6), ...resumo(s, mais(s, 6)) }));

  const ultimoAntes = (p, d) => p.eventos.filter((e) => e.d < d).map((e) => e.d).sort().pop();
  const ultimo = (p) => p.eventos.map((e) => e.d).sort().pop();
  const visivel = (p) => !SEM_NOME.test(p.nome);

  const ranking = pessoas.filter(visivel).map((p) => {
    const ev = naJanela(p, de, ate);
    return { nome: p.nome, cargo: p.cargo, acoes: ev.length, dias: new Set(ev.map((e) => e.d)).size,
      quiz: ev.filter((e) => e.type === 'quiz_pass').length, materiais: ev.filter((e) => e.type === 'onepage' && String(e.id).endsWith('|cliente')).length };
  }).filter((x) => x.acoes).sort((a, b) => b.acoes - a.acoes || b.dias - a.dias);

  const aprovados = evSemana.filter((e) => e.type === 'quiz_pass' && visivel(e.quem)).map((e) => ({ nome: e.quem.nome, carro: String(e.id).split('|')[0], d: e.d }));
  const estreias = pessoas.filter((p) => visivel(p) && p.criada >= de && p.criada <= ate).map((p) => ({ nome: p.nome, cargo: p.cargo, criada: p.criada, usou: naJanela(p, de, ate).length > 0 }));
  const voltaram = pessoas.filter((p) => visivel(p) && naJanela(p, de, ate).length).map((p) => ({ p, antes: ultimoAntes(p, de) }))
    .filter((x) => x.antes && entre(x.antes, naJanela(x.p, de, ate)[0].d) >= 7).map((x) => ({ nome: x.p.nome, parado: entre(x.antes, naJanela(x.p, de, ate)[0].d) }));
  const pararam = pessoas.filter((p) => visivel(p) && p.eventos.length && !naJanela(p, de, ate).length)
    .map((p) => ({ nome: p.nome, cargo: p.cargo, dias: entre(ultimo(p), ate) })).sort((a, b) => b.dias - a.dias);
  const nunca = pessoas.filter((p) => visivel(p) && !p.eventos.length).map((p) => ({ nome: p.nome, cargo: p.cargo, criada: p.criada }));
  const gestores = pessoas.filter((p) => p.gestor && visivel(p)).map((p) => ({ nome: p.nome, cargo: p.cargo, podePublicar: p.podePublicar,
    naSemana: naJanela(p, de, ate).length, ultimo: ultimo(p) || null })).sort((a, b) => b.naSemana - a.naSemana);

  return {
    de, ate, deAnt, ateAnt, geradoEm: new Date().toISOString(),
    contas: pessoas.length, totalGestores: pessoas.filter((p) => p.gestor).length, totalLeads: pessoas.filter((p) => LEADS.includes(p.cargo)).length,
    semana: resumo(de, ate), anterior: resumo(deAnt, ateAnt), dias, semanas, tipos,
    carros: conta(evSemana, (e) => e.type === 'pill_view'), objecoes: conta(evSemana, (e) => e.type === 'objecao'),
    materiaisPorCarro: conta(evSemana, (e) => e.type === 'onepage' && String(e.id).endsWith('|cliente')),
    docs: conta(evSemana, (e) => e.type === 'doc_open'), acessorios: conta(evSemana, (e) => e.type === 'acessorio'),
    ranking, aprovados, estreias, voltaram, pararam, nunca, gestores,
    desdeOInicio: { usaram: pessoas.filter((p) => p.eventos.length).length, acoes: pessoas.reduce((s, p) => s + p.eventos.length, 0) },
  };
}
