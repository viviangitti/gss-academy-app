import fs from 'fs';
const D = JSON.parse(fs.readFileSync('uso-detalhe.json', 'utf8'));
const { todos, carros, docs, acess, NOMES } = D;

const CARRO_NOME = { 'jaecoo-7':'Jaecoo 7 SHS-P', 'omoda-5-shs-h':'Omoda 5 SHS-H',
  'omoda-e5':'Omoda E5', 'omoda-7-shs-p':'Omoda 7 SHS-P', 're-hidraben':'Re-Hidraben (farmácia)' };
const GRUPOS = [
  ['Vendedores de veículos', ['vendedor-veiculos']],
  ['Vendedores de acessórios', ['vendedor-acessorios']],
  ['Leads', ['executivo-leads', 'gerente-leads']],
  ['Gestão', ['gerente-veiculos', 'gerente-acessorios', 'lider-acessorios', 'gerente-qualidade']],
  ['Sem cargo definido no cadastro', ['']],
];
const dias = {};
for (const p of todos) { /* recalculado abaixo */ }
const PORDIA = { '2026-08-28':13, '2026-08-29':5, '2026-08-31':7, '2026-09-01':29,
  '2026-09-02':103, '2026-09-03':33, '2026-09-04':60, '2026-09-05':25 };

const tot = (k) => todos.reduce((s, p) => s + (p.porTipo[k] || 0), 0);
const eventos = todos.reduce((s, p) => s + Object.values(p.porTipo).reduce((a, b) => a + b, 0), 0);
const br = (d) => d ? d.split('-').reverse().join('/') : '—';
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

const grupo = (ids) => todos.filter((p) => ids.includes(p.cargoId));
const linha = (p) => `<tr>
  <td class="n">${esc(p.nome)}<i>${esc(p.email)}</i></td>
  <td class="c">${p.diasAtivos}</td>
  <td class="c">${p.porTipo.pill_view || 0}</td>
  <td class="c">${p.quiz}</td>
  <td class="c">${p.porTipo.onepage || 0}</td>
  <td class="c">${p.porTipo.doc_open || 0}</td>
  <td class="c">${p.porTipo.objecao || 0}</td>
  <td class="c ${p.contato ? 'sim' : 'nao'}">${p.contato ? 'sim' : 'não'}</td>
  <td class="c">${br(p.ultimoDia)}</td>
</tr>`;

const maxDia = Math.max(...Object.values(PORDIA));
const barrasDia = Object.entries(PORDIA).sort().map(([d, v]) =>
  `<div class="dia"><span class="dl">${br(d)}</span><span class="db"><i style="width:${Math.round(v/maxDia*100)}%"></i></span><b>${v}</b></div>`).join('');

const barra = (obj, nomes, total) => Object.entries(obj).sort((a,b)=>b[1]-a[1]).map(([k, v]) =>
  `<div class="dia"><span class="dl2">${esc(nomes[k] || k)}</span><span class="db"><i style="width:${Math.round(v/total*100)}%"></i></span><b>${v}</b></div>`).join('');

const secao = (titulo, ids, nota) => {
  const g = grupo(ids);
  if (!g.length) return `<h2>${titulo}</h2><p class="vazio">${nota || 'Ninguém cadastrado com este cargo.'}</p>`;
  g.sort((a, b) => b.pontos - a.pontos);
  return `<h2>${titulo} <small>${g.length} ${g.length === 1 ? 'pessoa' : 'pessoas'}</small></h2>
  ${nota ? `<p class="nota">${nota}</p>` : ''}
  <table><thead><tr><th>Pessoa</th><th>Dias<br>ativos</th><th>Vídeos</th><th>Quiz<br>OK</th><th>Material<br>p/ cliente</th><th>Docs</th><th>Objeções</th><th>WhatsApp<br>no material</th><th>Último<br>acesso</th></tr></thead>
  <tbody>${g.map(linha).join('')}</tbody></table>`;
};

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<style>
@page { size: A4; margin: 14mm 12mm; }
* { box-sizing: border-box; }
body { font: 11px/1.5 -apple-system, Arial, sans-serif; color: #16181d; margin: 0; }
h1 { font-size: 25px; margin: 0 0 4px; letter-spacing: -.2px; }
h2 { font-size: 15px; margin: 26px 0 8px; padding-bottom: 5px; border-bottom: 2px solid #16181d; }
h2 small { font-weight: 400; color: #6b7280; font-size: 11px; }
.sub { color: #6b7280; margin: 0 0 18px; }
.kpis { display: flex; gap: 8px; margin: 14px 0 4px; }
.kpi { flex: 1; border: 1px solid #e3e7ee; border-radius: 8px; padding: 10px 12px; }
.kpi b { display: block; font-size: 21px; }
.kpi span { color: #6b7280; font-size: 10px; }
table { width: 100%; border-collapse: collapse; margin-top: 6px; }
th { text-align: center; font-size: 9px; color: #6b7280; font-weight: 700; padding: 5px 3px; border-bottom: 1px solid #d7dce5; }
th:first-child { text-align: left; }
td { padding: 6px 3px; border-bottom: 1px solid #eef1f6; font-size: 10.5px; }
td.n { font-weight: 700; }
td.n i { display: block; font-style: normal; font-weight: 400; color: #9aa1ae; font-size: 9px; }
td.c { text-align: center; }
td.sim { color: #1c6b3f; font-weight: 700; }
td.nao { color: #b02a2a; font-weight: 700; }
.dia { display: flex; align-items: center; gap: 8px; margin: 3px 0; }
.dl { width: 52px; color: #6b7280; font-size: 10px; }
.dl2 { width: 168px; font-size: 10px; }
.db { flex: 1; height: 9px; background: #eef1f6; border-radius: 99px; overflow: hidden; }
.db i { display: block; height: 100%; background: #2563eb; }
.dia b { width: 30px; text-align: right; font-size: 10px; }
.nota, .vazio { color: #6b7280; margin: 4px 0 8px; }
.vazio { background: #fdf6e4; border: 1px solid #f0e2bc; border-radius: 8px; padding: 9px 11px; color: #8a6516; }
.duas { display: flex; gap: 22px; }
.duas > div { flex: 1; }
.leitura { background: #f6f8fb; border-radius: 10px; padding: 12px 14px; margin-top: 8px; }
.leitura p { margin: 0 0 8px; }
.leitura b { color: #16181d; }
footer { margin-top: 22px; padding-top: 8px; border-top: 1px solid #e3e7ee; color: #9aa1ae; font-size: 9px; }
</style></head><body>

<h1>Uso do Eleva — Ramasa</h1>
<p class="sub">28 de agosto a 5 de setembro de 2026 · ${todos.length} pessoas cadastradas, fora as contas de teste</p>

<div class="kpis">
  <div class="kpi"><b>${eventos}</b><span>ações registradas</span></div>
  <div class="kpi"><b>${todos.filter(p=>p.diasAtivos).length}/${todos.length}</b><span>pessoas com atividade</span></div>
  <div class="kpi"><b>${tot('pill_view')}</b><span>vídeos assistidos</span></div>
  <div class="kpi"><b>${tot('onepage')}</b><span>materiais pro cliente</span></div>
  <div class="kpi"><b>${tot('quiz_pass')}</b><span>quiz acertados</span></div>
</div>

<h2>Movimento dia a dia</h2>
${barrasDia}
<p class="nota">O pico de 02/09 são 103 ações num dia só — foi quando a carta de setembro entrou no app. O uso cai no fim de semana (30/08 e 06/09 sem registro).</p>

<div class="duas">
  <div><h2>O que o time faz</h2>${barra(Object.fromEntries(Object.entries(NOMES).map(([k])=>[k, tot(k)]).filter(([,v])=>v)), NOMES, eventos)}</div>
  <div><h2>Carros mais assistidos</h2>${barra(carros, CARRO_NOME, tot('pill_view'))}</div>
</div>

${secao('Vendedores de veículos', ['vendedor-veiculos'])}
${secao('Vendedores de acessórios', ['vendedor-acessorios'], 'Duas pessoas cadastradas nesta frente, com 1 vídeo cada. É a menor adesão do time.')}
${secao('Leads', ['executivo-leads', 'gerente-leads'], 'Ninguém se cadastrou como Executivo ou Gerente de leads. Os cargos existem no app desde 04/09 — falta o time da frente de leads criar conta.')}
${secao('Gestão', ['gerente-veiculos', 'gerente-acessorios', 'lider-acessorios', 'gerente-qualidade'])}
${secao('Sem cargo definido no cadastro', [''], 'Entraram antes de o cargo virar lista obrigatória. Vale pedir para atualizarem em Perfil — sem cargo, não aparecem separadas por frente.')}

<h2>Documentos mais abertos</h2>
${barra(docs, {}, tot('doc_open'))}

<h2>Acessórios consultados</h2>
${barra(acess, {}, Math.max(tot('acessorio'),1))}
<p class="nota">Seis consultas em nove dias, num catálogo de 27 acessórios. A tela do acessório é a menos visitada do app.</p>

<h2>Leitura</h2>
<div class="leitura">
<p><b>O time usa, mas usa raso.</b> As 19 pessoas têm atividade e 92 vídeos foram assistidos — mas só 14 quiz acertados. A maioria assiste e não testa, e sem o quiz os níveis 2 em diante não abrem.</p>
<p><b>O Jaecoo 7 domina.</b> 41 dos 92 vídeos são dele — quase metade. Omoda 7 e E5 juntos não chegam a isso. Se a meta do mês incluir esses dois, o conteúdo deles precisa entrar na conversa da gerência.</p>
<p><b>Material pro cliente é o que mais engatou.</b> 35 gerações em 9 dias, com Matheus Duarte sozinho em 13. É a função que virou hábito.</p>
<p><b>Acessório é o ponto fraco.</b> Seis consultas no período inteiro, e os dois vendedores de acessórios têm 1 vídeo cada. A frente que mais depende de conhecimento de produto é a que menos usa.</p>
<p><b>Leads não existe no app.</b> Nenhum cadastro. Enquanto isso, a campanha do mês tem um prêmio inteiro — o Fone JBL — para o campeão de conversão de leads.</p>
</div>

<footer>Gerado a partir do registro de uso do próprio app (elevaStats), em 06/09/2026. Contas de teste excluídas. "Dias ativos" conta dias distintos com ao menos uma ação.</footer>
</body></html>`;

fs.writeFileSync('relatorio-uso.html', html);
console.log('html pronto ·', Math.round(html.length/1024), 'KB');
