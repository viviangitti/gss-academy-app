// Monta o HTML do relatório semanal a partir dos dados de coletar().
import { readFileSync } from 'fs';
import { nomesDeDocumentos } from './dados.mjs';

const ASSETS = new URL('./assets/', import.meta.url);
const img = (arq) => 'data:image/' + (arq.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + readFileSync(new URL(arq, ASSETS)).toString('base64');
const imgOuNada = (arq) => { try { return img(arq); } catch { return ''; } };

const CARRO = { 'jaecoo-7': 'Jaecoo 7 SHS-P', 'jaecoo-5': 'Jaecoo 5 SHS-H', 'omoda-5-shs-h': 'Omoda 5 SHS-H', 'omoda-e5': 'Omoda E5', 'omoda-7-shs-p': 'Omoda 7 SHS-P' };
const nomeCarro = (id) => CARRO[String(id).split('|')[0]] || String(id).split('|')[0];
const LOJA = { 'tiger-goiania': 'Tiger Goiânia', 'tiger-anapolis': 'Tiger Anápolis', 'tiger-itumbiara': 'Tiger Itumbiara' };
const CARGO = { 'vendedor-veiculos': 'vendedor de veículos', 'supervisor-vendas': 'supervisor de vendas', 'vendedor-acessorios': 'vendedor de acessórios', fi: 'F&I', 'gerente-vendas': 'gerente de vendas',
  'gerente-veiculos': 'gerente de veículos', 'gerente-acessorios': 'gerente de acessórios', 'lider-acessorios': 'supervisor de acessórios',
  'executivo-leads': 'executivo de leads', 'gerente-leads': 'gerente de leads' };
const cargo = (c) => CARGO[c] || '—';
const dm = (d) => `${d.slice(8)}/${d.slice(5, 7)}`;
const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const sem = (d) => SEM[new Date(d + 'T12:00:00Z').getUTCDay()];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const lista = (nomes) => nomes.length <= 1 ? (nomes[0] || '') : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;

export const METAS = { pessoas: 24, quiz: 10, materiais: 25 };

function delta(a, b) {
  if (a === b) return '<span class="dl eq">= igual à semana anterior</span>';
  const d = a - b, cls = d > 0 ? 'up' : 'dn';
  return `<span class="dl ${cls}">${d > 0 ? '▲ +' : '▼ −'}${Math.abs(d)} vs. semana anterior</span>`;
}
function situacao(valor, meta, antes) {
  if (valor >= meta) return '<span class="st ok">meta atingida</span>';
  if (valor > antes) return '<span class="st up">▲ subiu</span>';
  if (valor < antes) return '<span class="st dn">▼ caiu</span>';
  return '<span class="st eq">= igual</span>';
}
const linha = (rot, v, max, cor, extra = '') => `<div class="hb"><span class="hb-rot">${rot}</span><span class="hb-tr"><i style="width:${Math.max(3, (v / Math.max(1, max)) * 100)}%;background:${cor}"></i></span><b>${v}</b>${extra}</div>`;

function colunas(itens, rotulo, sub, destaque) {
  const W = 540, H = 150, pad = 26, T = 20, max = Math.max(1, ...itens.map((i) => i.v)), lg = (W - pad) / itens.length, bw = Math.min(46, lg - 14);
  return `<svg viewBox="0 0 ${W} ${H + T + 38}" class="graf">
  ${[0.5, 1].map((f) => `<line x1="${pad}" x2="${W}" y1="${H - H * f + T}" y2="${H - H * f + T}" stroke="#e8ebf1"/><text x="0" y="${H - H * f + T + 3}" class="ax">${Math.round(max * f)}</text>`).join('')}
  ${itens.map((it, i) => { const h = it.v ? Math.max(3, (it.v / max) * H) : 0, x = pad + i * lg + (lg - bw) / 2, y = H - h + T;
    return `${h ? `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="4" fill="${destaque(it) ? '#0f0f1e' : '#c9a84c'}"/>` : ''}
    <text x="${x + bw / 2}" y="${(h ? y : H + T) - 5}" class="vl">${it.v}</text>
    <text x="${x + bw / 2}" y="${H + T + 14}" class="dt">${rotulo(it)}</text><text x="${x + bw / 2}" y="${H + T + 25}" class="dt2">${sub(it)}</text>`; }).join('')}
  </svg>`;
}

export function montar(D) {
  const S = D.semana, A = D.anterior;
  const DOC = nomesDeDocumentos();
  const nomeDoc = (id) => DOC[id] || DOC[String(id).split('|')[0]] || (String(id).startsWith('ficha-pdf') ? `Ficha técnica — ${nomeCarro(String(id).split('|')[1] || '')}` : id);
  const semanasComDado = D.semanas.slice(D.semanas.findIndex((s) => s.acoes > 0));
  const edicao = semanasComDado.length;
  const gAtivos = D.gestores.filter((g) => g.naSemana).length, gTotal = D.gestores.length;
  const top = D.ranking[0];
  const objs = D.objecoes.map(([k, v]) => [String(k).split('|')[1]?.replace(/^"|"$/g, '').replace(/\.$/, '') || k, v, String(k).split('|')[0]]);
  const docs = (() => { const o = {}; for (const [k, v] of D.docs) o[nomeDoc(k)] = (o[nomeDoc(k)] || 0) + v; return Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 5); })();
  const totCarros = D.carros.reduce((s, [, v]) => s + v, 0);
  const mixN = { pill_view: ['Abriu um carro', '#0f0f1e'], objecao: ['Consultou objeção', '#c9853c'], doc_open: ['Abriu documento', '#4a6fa5'], onepage: ['Gerou material', '#2e9e5b'],
    quiz_start: ['Começou quiz', '#b9bfcd'], quiz_pass: ['Passou no quiz', '#c9a84c'], quiz_fail: ['Errou o quiz', '#d9d2c0'], acessorio: ['Abriu acessório', '#7a5ea8'],
    jornada_script: ['Copiou script da jornada', '#5b7fb0'], jornada_onepage: ['Mandou one page da jornada', '#2e9e5b'] };
  const mix = Object.entries(D.tipos).sort((a, b) => b[1] - a[1]);
  const pct = (a, b) => (b ? Math.round((1 - a / b) * 100) : 0);
  const variacao = S.acoes === A.acoes ? 'igual à semana anterior' : S.acoes > A.acoes ? `${Math.round((S.acoes / Math.max(1, A.acoes) - 1) * 100)}% a mais que na semana anterior` : `${pct(S.acoes, A.acoes)}% a menos que na semana anterior`;

  // Ações recomendadas: regras fixas, a partir dos números da semana.
  const recs = [];
  if (gAtivos < gTotal) recs.push(['Gestão', `${gAtivos} de ${gTotal} gestores abriram conteúdo na semana.`, 'Quinze minutos de painel na reunião de segunda: quem estudou, quem parou e a objeção mais consultada.']);
  if (D.pararam.length) recs.push(['Quem parou', `${D.pararam.length} pessoa${D.pararam.length > 1 ? 's' : ''} com conta não abriram o app na semana.`, `Usar o botão “Cobrar” do painel, começando por ${lista(D.pararam.slice(0, 3).map((p) => p.nome))}.`]);
  if (S.quiz < METAS.quiz) recs.push(['Quiz', `${S.quiz} quiz${S.quiz === 1 ? '' : 'zes'} aprovado${S.quiz === 1 ? '' : 's'} (meta: ${METAS.quiz}).`, 'Pedir um quiz por vendedor até sexta — o quiz abre o próximo nível da trilha.']);
  if (S.materiais < METAS.materiais) recs.push(['Material pro cliente', `${S.materiais} resumos enviados (meta: ${METAS.materiais}).`, 'Todo atendimento termina com o resumo do carro no WhatsApp, com o contato do vendedor.']);
  if (S.acessorios < 5) recs.push(['Acessórios', `${S.acessorios} abertura${S.acessorios === 1 ? '' : 's'} de acessório na semana.`, 'Acessório da semana: escolher um na segunda e perguntar na sexta quem ofereceu.']);
  if (!S.leads && D.totalLeads) recs.push(['Leads', `Ninguém do time de leads usou o app (${D.totalLeads} contas).`, 'Quinze minutos mostrando o Tira-dúvida e o resumo do carro para responder lead.']);
  const novos = D.estreias.filter((e) => e.usou).map((e) => e.nome);
  if (novos.length) recs.push(['Quem chegou', `${lista(novos)} ${novos.length > 1 ? 'entraram' : 'entrou'} no app nesta semana.`, 'Mensagem do gerente no terceiro dia de uso — é quando quem estreia costuma sumir.']);
  if (D.ranking.length) recs.push(['Reconhecimento', `Quem mais usou: ${lista(D.ranking.slice(0, 3).map((r) => `${r.nome} (${r.acoes})`))}.`, 'Citar no grupo do time na sexta.']);
  if (objs.length) recs.push(['Objeção da semana', `“${objs[0][0]}” foi a mais consultada.`, 'Levar a resposta pronta do app para a reunião de segunda.']);

  const rod = (n) => `<div class="rod"><span>Eleva · Relatório semanal · Grupo Ramasa · ${dm(D.de)} a ${dm(D.ate)}/${D.ate.slice(0, 4)}</span><span>${n} / 7</span></div>`;
  const carroImg = (id) => imgOuNada(`carro-${id}.jpg`);

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@page{size:A4;margin:0}*{box-sizing:border-box}
body{font:10.5px/1.5 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#16181d;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;min-height:297mm;padding:15mm 15mm 13mm;page-break-after:always;position:relative}.pg:last-child{page-break-after:auto}
.capa{background:#0f0f1e;color:#f2f1ee;margin:-15mm -15mm 0;padding:16mm 15mm 16mm;display:flex;justify-content:space-between;align-items:flex-start}
.capa .k{font-size:11px;font-weight:800;letter-spacing:.16em;color:#c9a84c}
.capa h1{font-size:30px;line-height:1.1;margin:10px 0 6px;letter-spacing:-.6px;font-weight:800}
.capa .dt{color:#a7a7b8;font-size:12px;margin:0}.capa img{height:52px}
.kpis{display:flex;gap:8px;margin:-9mm 0 7mm}
.kpi{flex:1;background:#fff;border:1px solid #e4e8ef;border-radius:11px;padding:10px 11px 9px;box-shadow:0 3px 10px rgba(15,15,30,.06)}
.kpi b{display:block;font-size:25px;line-height:1;font-weight:800;letter-spacing:-.8px}.kpi b i{font-size:12px;font-style:normal;color:#9aa1ae}
.kpi span{display:block;color:#6b7280;font-size:9px;margin-top:5px;line-height:1.3}
.dl{display:block;font-size:8.5px;font-weight:700;margin-top:4px}.dl.up{color:#2e9e5b}.dl.dn{color:#c04b4b}.dl.eq{color:#9aa1ae}
h2{font-size:15px;margin:0 0 3px;letter-spacing:-.2px}h2 .n{color:#c9a84c;font-weight:800;margin-right:6px}
.sub{color:#6b7280;margin:0 0 10px;font-size:10px}h3{font-size:11.5px;margin:14px 0 6px}
.duas{display:flex;gap:13px}.col{flex:1;min-width:0}.c70{width:66%;flex:none}.c30{width:31%;flex:none}
.graf{width:100%;height:auto}.ax{font-size:8px;fill:#b0b6c2}.vl{font-size:8.5px;fill:#16181d;text-anchor:middle;font-weight:700}
.dt{font-size:8px;fill:#6b7280;text-anchor:middle}.dt2{font-size:7.5px;fill:#b0b6c2;text-anchor:middle}
.hb{display:flex;align-items:center;gap:8px;margin:0 0 5px;font-size:10px}.hb-rot{width:130px;flex:none;color:#374151}
.hb-tr{flex:1;height:9px;background:#f1f3f7;border-radius:99px;overflow:hidden}.hb-tr i{display:block;height:100%;border-radius:99px}
.hb b{width:24px;text-align:right}.pc{color:#9aa1ae;font-size:8.5px;width:56px;text-align:left;padding-left:5px}
.cx{background:#f7f8fb;border-radius:10px;padding:10px 12px;margin:8px 0}.cx p{margin:0 0 6px}.cx p:last-child{margin:0}
.frase{background:#0f0f1e;color:#f2f1ee;border-radius:12px;padding:11px 14px;margin:0 0 8px}.frase b{color:#e0c987}
.fone{border:5px solid #0f0f1e;border-radius:20px;overflow:hidden;background:#0f0f1e;box-shadow:0 8px 22px rgba(15,15,30,.16)}.fone img{display:block;width:100%}
.fone-cap{text-align:center;color:#9aa1ae;font-size:8.5px;margin-top:5px}
table.t{width:100%;border-collapse:collapse;font-size:10px}.t th{text-align:left;font-size:8.5px;color:#6b7280;font-weight:700;padding:5px;border-bottom:1px solid #d7dce5}
.t td{padding:5px;border-bottom:1px solid #eef1f6}.t .r{text-align:right}
.st{display:inline-block;font-size:8.5px;font-weight:800;padding:2px 8px;border-radius:99px}.st.ok{background:#e8f6ee;color:#1d6b3f}.st.up{background:#eef6ff;color:#1e5fa8}.st.dn{background:#fbe9e9;color:#a33b3b}.st.eq{background:#f1f3f7;color:#6b7280}
.pill{display:inline-block;font-size:8.5px;font-weight:800;padding:1px 7px;border-radius:99px}.pill.ok{background:#e8f6ee;color:#1d6b3f}.pill.no{background:#fbe9e9;color:#a33b3b}
.carro{display:flex;gap:9px;align-items:center;margin-bottom:7px}.carro img{width:74px;height:42px;object-fit:cover;border-radius:6px;flex:none;background:#eef0f4}
.carro .txt{flex:1}.carro .nm{font-weight:700;font-size:10.5px}.carro .tr{height:7px;background:#f1f3f7;border-radius:99px;margin-top:3px;overflow:hidden}
.carro .tr i{display:block;height:100%;background:#0f0f1e;border-radius:99px}.carro .v2{font-size:9px;color:#6b7280;margin-top:2px}
.cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.card{border:1px solid #e4e8ef;border-radius:10px;padding:9px 11px}
.card h4{margin:0 0 6px;font-size:10.5px;color:#a5842f;text-transform:uppercase;letter-spacing:.04em}
.card ul{margin:0;padding:0;list-style:none}.card li{font-size:9.8px;padding:2px 0;color:#374151}.card .vazio{color:#9aa1ae;font-size:9.5px}
.pes{border:1px solid #e4e8ef;border-radius:10px;padding:9px 11px}.pes h4{margin:0 0 6px;font-size:10.5px;display:flex;justify-content:space-between}.pes h4 span{font-size:15px;font-weight:800}
.pes ul{margin:0;padding:0;list-style:none;columns:2;column-gap:12px}.pes li{font-size:9px;padding:2px 0;color:#374151;display:flex;justify-content:space-between;gap:6px;break-inside:avoid}
.pes li i{font-style:normal;color:#9aa1ae}.pes.at h4 span{color:#c9853c}.pes.no h4 span{color:#c04b4b}.pes.no ul{columns:1}
.rec{display:flex;gap:10px;align-items:flex-start;border:1px solid #e4e8ef;border-radius:10px;padding:9px 12px;margin:0 0 7px}
.rec .num{width:24px;height:24px;border-radius:50%;background:#0f0f1e;color:#c9a84c;font-weight:800;display:flex;align-items:center;justify-content:center;flex:none;font-size:11px}
.rec b{display:block;font-size:11px}.rec .fato{color:#374151;font-size:10px}.rec .acao{color:#1d6b3f;font-size:10px;font-weight:700;margin-top:2px}
.rod{position:absolute;left:15mm;right:15mm;bottom:8mm;border-top:1px solid #e8ebf1;padding-top:6px;color:#b0b6c2;font-size:8px;display:flex;justify-content:space-between}
</style></head><body>

<div class="pg">
  <div class="capa">
    <div><div class="k">ELEVA · RELATÓRIO SEMANAL · ${edicao}ª SEMANA</div>
      <h1>Semana de ${dm(D.de)} a ${dm(D.ate)}</h1>
      <p class="dt">Uso do app no Grupo Ramasa · segunda a domingo</p></div>
    <img src="${img('logo-gss.png')}">
  </div>
  <div class="kpis">
    <div class="kpi"><b>${S.pessoas}<i>/${D.contas}</i></b><span>pessoas usaram o app</span>${delta(S.pessoas, A.pessoas)}</div>
    <div class="kpi"><b>${S.acoes}</b><span>ações no app</span>${delta(S.acoes, A.acoes)}</div>
    <div class="kpi"><b style="color:#a5842f">${S.quiz}</b><span>quizzes aprovados</span>${delta(S.quiz, A.quiz)}</div>
    <div class="kpi"><b style="color:#2e9e5b">${S.materiais}</b><span>materiais enviados a clientes</span>${delta(S.materiais, A.materiais)}</div>
    <div class="kpi"><b>${S.contasNovas}</b><span>contas novas</span>${delta(S.contasNovas, A.contasNovas)}</div>
  </div>
  <div class="duas">
    <div class="col c70">
      <h2><span class="n">01</span>A semana em três frases</h2>
      <p class="sub">Um resumo para quem só tem um minuto.</p>
      <div class="frase"><b>Uso.</b> ${S.pessoas} pessoas usaram o app e fizeram ${S.acoes} ações — ${variacao}.</div>
      <div class="frase"><b>Venda.</b> ${S.materiais} resumo${S.materiais === 1 ? '' : 's'} de carro ${S.materiais === 1 ? 'foi enviado' : 'foram enviados'} a clientes e ${D.tipos.objecao || 0} objeç${(D.tipos.objecao || 0) === 1 ? 'ão foi consultada' : 'ões foram consultadas'}${objs.length ? `; a mais procurada foi “${esc(objs[0][0])}”` : ''}.</div>
      <div class="frase"><b>Pessoas.</b> ${top ? `Quem mais usou foi ${top.nome}, com ${top.acoes} ações em ${top.dias} dia${top.dias > 1 ? 's' : ''}.` : 'Ninguém usou o app nesta semana.'} ${novos.length ? `${novos.length} pessoa${novos.length > 1 ? 's' : ''} ${novos.length > 1 ? 'entraram' : 'entrou'} no app pela primeira vez.` : ''} ${gAtivos ? `${gAtivos} de ${gTotal} gestores abriram conteúdo.` : 'Nenhum gestor abriu conteúdo.'}</div>
      <h3>Desde o início</h3>
      <div class="cx"><p>${D.desdeOInicio.usaram} das ${D.contas} contas já usaram o app, com ${D.desdeOInicio.acoes} ações registradas até ${dm(D.ate)}.</p></div>
    </div>
    <div class="col c30"><div class="fone"><img src="${img('tela-hoje.jpg')}"></div><p class="fone-cap">A tela que abre para cada vendedor</p></div>
  </div>
  ${rod(1)}
</div>

<div class="pg">
  <h2><span class="n">02</span>Placar das metas</h2>
  <p class="sub">Metas do plano de ação de 15/09/2026, para medir semana a semana.</p>
  <table class="t"><thead><tr><th>Indicador</th><th class="r">Meta</th><th class="r">Esta semana</th><th class="r">Semana anterior</th><th class="r">Situação</th></tr></thead><tbody>
    <tr><td>Pessoas que usaram o app</td><td class="r">${METAS.pessoas} de ${D.contas}</td><td class="r"><b>${S.pessoas}</b></td><td class="r">${A.pessoas}</td><td class="r">${situacao(S.pessoas, METAS.pessoas, A.pessoas)}</td></tr>
    <tr><td>Gestores que abriram conteúdo</td><td class="r">${gTotal} de ${gTotal}</td><td class="r"><b>${gAtivos}</b></td><td class="r">${A.gestores}</td><td class="r">${situacao(gAtivos, gTotal, A.gestores)}</td></tr>
    <tr><td>Quizzes aprovados</td><td class="r">${METAS.quiz}</td><td class="r"><b>${S.quiz}</b></td><td class="r">${A.quiz}</td><td class="r">${situacao(S.quiz, METAS.quiz, A.quiz)}</td></tr>
    <tr><td>Materiais enviados a clientes</td><td class="r">${METAS.materiais}</td><td class="r"><b>${S.materiais}</b></td><td class="r">${A.materiais}</td><td class="r">${situacao(S.materiais, METAS.materiais, A.materiais)}</td></tr>
    <tr><td>Time de leads usando o app</td><td class="r">${D.totalLeads} de ${D.totalLeads}</td><td class="r"><b>${S.leads}</b></td><td class="r">${A.leads}</td><td class="r">${situacao(S.leads, D.totalLeads, A.leads)}</td></tr>
  </tbody></table>
  ${D.lojas && D.lojas.length ? `<h3 style="margin-top:18px">Por loja</h3>
  <p class="sub">Quem usou o app em cada unidade, na semana.</p>
  <table class="t"><thead><tr><th>Loja</th><th class="r">Contas</th><th class="r">Usaram</th><th class="r">Ações</th><th class="r">Materiais</th></tr></thead><tbody>
    ${D.lojas.map((l) => `<tr><td><b>${LOJA[l.loja] || l.loja}</b></td><td class="r">${l.contas}</td><td class="r">${l.pessoas}</td><td class="r">${l.acoes}</td><td class="r">${l.materiais}</td></tr>`).join('')}
  </tbody></table>
  ${D.semLoja ? `<p class="sub" style="margin-top:5px">${D.semLoja} ${D.semLoja === 1 ? 'pessoa ainda não escolheu' : 'pessoas ainda não escolheram'} a loja no perfil — elas não entram nesta conta.</p>` : ''}` : ''}

  <h3 style="margin-top:18px">Semana a semana, desde o lançamento</h3>
  <p class="sub">Ações por semana. A barra escura é esta semana; embaixo, quantas pessoas usaram.</p>
  ${colunas(semanasComDado.map((s) => ({ v: s.acoes, s })), (it) => `${dm(it.s.de)}`, (it) => `${it.s.pessoas} pessoas`, (it) => it.s.de === D.de)}
  <div class="cx"><p>Os números de pessoas e de gestores contam quem abriu pelo menos um conteúdo na semana. Quem só abriu o app e saiu não entra: esse registro também conta renovações automáticas do login e não é confiável.</p></div>
  ${rod(2)}
</div>

<div class="pg">
  <h2><span class="n">03</span>A semana, dia a dia</h2>
  <p class="sub">Ações por dia. A barra escura é o dia de maior uso.</p>
  ${(() => { const maior = Math.max(...D.dias.map((d) => d.acoes)); return colunas(D.dias.map((d) => ({ v: d.acoes, d })), (it) => dm(it.d.d), (it) => `${sem(it.d.d)} · ${it.d.pessoas}p`, (it) => it.d.acoes === maior && maior > 0); })()}
  <div class="duas" style="margin-top:12px">
    <div class="col">
      <h3 style="margin-top:0">O que o time fez</h3>
      ${mix.length ? mix.map(([k, v]) => linha((mixN[k] || [k])[0], v, mix[0][1], (mixN[k] || [0, '#9aa1ae'])[1])).join('') : '<p class="sub">Nenhuma ação nesta semana.</p>'}
    </div>
    <div class="col">
      <h3 style="margin-top:0">Materiais enviados, por carro</h3>
      ${D.materiaisPorCarro.length ? D.materiaisPorCarro.map(([k, v]) => linha(nomeCarro(k), v, D.materiaisPorCarro[0][1], '#2e9e5b')).join('') : '<p class="sub">Nenhum material enviado a cliente nesta semana.</p>'}
      <div class="cx"><p>O resumo do carro sai do app com foto, ficha e o WhatsApp do vendedor. É o sinal de que o app está sendo usado para vender, e não só para estudar.</p></div>
    </div>
  </div>
  ${rod(3)}
</div>

<div class="pg">
  <h2><span class="n">04</span>O que eles estudaram</h2>
  <p class="sub">Aberturas de ficha por modelo — ${totCarros} na semana.</p>
  ${D.carros.length ? D.carros.slice(0, 5).map(([k, v]) => `<div class="carro"><img src="${carroImg(k)}"><div class="txt"><div class="nm">${nomeCarro(k)}</div><div class="tr"><i style="width:${(v / D.carros[0][1]) * 100}%"></i></div><div class="v2">${v} abertura${v > 1 ? 's' : ''}${totCarros ? ` · ${Math.round((v / totCarros) * 100)}% da semana` : ''}</div></div></div>`).join('') : '<p class="sub">Nenhum carro aberto nesta semana.</p>'}
  <div class="duas" style="margin-top:12px">
    <div class="col c70">
      <h3>As perguntas que o cliente fez</h3>
      <p class="sub" style="margin-bottom:7px">Objeções mais consultadas pelo time na semana.</p>
      ${objs.length ? objs.slice(0, 8).map(([t, v, id]) => linha(`<b style="font-weight:600">${esc(t)}</b>`, v, objs[0][1], '#c9853c', `<span class="pc">${nomeCarro(id).replace(/ SHS-[HP]$/, '')}</span>`)).join('') : '<p class="sub">Nenhuma objeção consultada nesta semana.</p>'}
      <h3>Documentos mais abertos</h3>
      ${docs.length ? docs.map(([n, v]) => linha(esc(n), v, docs[0][1], '#4a6fa5')).join('') : '<p class="sub">Nenhum documento aberto nesta semana.</p>'}
      <div class="cx"><p><b>Acessórios:</b> ${S.acessorios} abertura${S.acessorios === 1 ? '' : 's'} na semana${D.acessorios.length ? ` — ${D.acessorios.slice(0, 3).map(([k, v]) => `${String(k).replace(/-/g, ' ')} (${v})`).join(', ')}` : ''}.</p></div>
    </div>
    <div class="col c30"><div class="fone"><img src="${img('tela-objecao.jpg')}"></div><p class="fone-cap">A resposta que o vendedor lê na hora</p></div>
  </div>
  ${rod(4)}
</div>

<div class="pg">
  <h2><span class="n">05</span>Destaques da semana</h2>
  <p class="sub">Quem mais usou o app entre ${dm(D.de)} e ${dm(D.ate)}.</p>
  ${D.ranking.length ? `<table class="t"><thead><tr><th>#</th><th>Pessoa</th><th>Cargo</th><th class="r">Ações</th><th class="r">Dias no app</th><th class="r">Quizzes</th><th class="r">Materiais</th></tr></thead><tbody>
  ${D.ranking.slice(0, 10).map((r, i) => `<tr><td>${i + 1}</td><td><b>${esc(r.nome)}</b></td><td style="color:#6b7280">${cargo(r.cargo)}</td><td class="r">${r.acoes}</td><td class="r">${r.dias}</td><td class="r">${r.quiz}</td><td class="r">${r.materiais}</td></tr>`).join('')}
  </tbody></table>` : '<p class="sub">Ninguém usou o app nesta semana.</p>'}
  <h3 style="margin-top:16px">Movimentos da semana</h3>
  <div class="cards">
    <div class="card"><h4>Passaram no quiz</h4>${D.aprovados.length ? `<ul>${D.aprovados.map((a) => `<li><b>${esc(a.nome)}</b> · ${nomeCarro(a.carro)} <span style="color:#9aa1ae">(${dm(a.d)})</span></li>`).join('')}</ul>` : '<p class="vazio">Ninguém nesta semana.</p>'}</div>
    <div class="card"><h4>Entraram no app</h4>${D.estreias.length ? `<ul>${D.estreias.map((e) => `<li><b>${esc(e.nome)}</b> · ${dm(e.criada)}${e.usou ? '' : ' <span style="color:#c04b4b">(ainda sem uso)</span>'}</li>`).join('')}</ul>` : '<p class="vazio">Nenhuma conta nova.</p>'}</div>
    <div class="card"><h4>Voltaram depois de uma pausa</h4>${D.voltaram.length ? `<ul>${D.voltaram.map((v) => `<li><b>${esc(v.nome)}</b> · ${v.parado} dias parado</li>`).join('')}</ul>` : '<p class="vazio">Ninguém nesta semana.</p>'}</div>
  </div>
  ${rod(5)}
</div>

<div class="pg">
  <h2><span class="n">06</span>Quem precisa de atenção</h2>
  <p class="sub">Situação em ${dm(D.ate)}.</p>
  <div class="duas">
    <div class="col c70"><div class="pes at"><h4>Não usaram nesta semana <span>${D.pararam.length}</span></h4>
      ${D.pararam.length ? `<ul>${D.pararam.map((p) => `<li><span>${esc(p.nome)}</span><i>${p.dias} dias</i></li>`).join('')}</ul>` : '<p class="sub">Todos que já usaram voltaram nesta semana.</p>'}</div></div>
    <div class="col c30"><div class="pes no"><h4>Nunca usaram <span>${D.nunca.length}</span></h4>
      ${D.nunca.length ? `<ul>${D.nunca.map((p) => `<li><span>${esc(p.nome)}</span><i>${cargo(p.cargo)}</i></li>`).join('')}</ul>` : '<p class="sub">Todas as contas já usaram.</p>'}</div></div>
  </div>
  <h3 style="margin-top:16px">Os gestores na semana</h3>
  <table class="t"><thead><tr><th>Gestor</th><th>Cargo</th><th class="r">Ações na semana</th><th class="r">Último conteúdo</th><th class="r">Pode publicar</th></tr></thead><tbody>
  ${D.gestores.map((g) => `<tr><td><b>${esc(g.nome)}</b></td><td style="color:#6b7280">${cargo(g.cargo)}</td><td class="r">${g.naSemana}</td><td class="r">${g.ultimo ? dm(g.ultimo) : '—'}</td><td class="r">${g.podePublicar ? '<span class="pill ok">sim</span>' : '<span class="pill no">não</span>'}</td></tr>`).join('')}
  </tbody></table>
  <p class="sub" style="margin-top:5px">"Não usaram nesta semana" mostra há quantos dias foi o último uso, contado até ${dm(D.ate)}.</p>
  ${rod(6)}
</div>

<div class="pg">
  <h2><span class="n">07</span>Ações recomendadas para esta semana</h2>
  <p class="sub">Geradas a partir dos números acima. O que fazer, e por quê.</p>
  ${recs.slice(0, 8).map(([t, fato, acao], i) => `<div class="rec"><div class="num">${i + 1}</div><div><b>${t}</b><div class="fato">${esc(fato)}</div><div class="acao">→ ${esc(acao)}</div></div></div>`).join('')}
  <h3 style="margin-top:16px">Como ler este relatório</h3>
  <div class="cx">
    <p><b>Semana</b> vai de segunda a domingo. <b>Ação</b> é qualquer coisa que a pessoa fez com conteúdo: abrir um carro, uma objeção ou um documento, gerar material, fazer o quiz.</p>
    <p><b>Material enviado</b> é o resumo do carro gerado para o cliente, com o contato do vendedor.</p>
    <p>Fonte: Firebase ao vivo (contas e registro de uso do app), lido em ${new Date(D.geradoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}. Contas de teste ficam fora.</p>
  </div>
  ${rod(7)}
</div>
</body></html>`;
}
