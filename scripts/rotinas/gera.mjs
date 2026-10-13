// ROTINAS MENSAIS DO APP — a imagem que a Vivian manda para os gerentes.
//
// Pedido de 13/10/2026: "o que é, o que fazer, qual prazo, quem faz (cargo ou
// nomes) e se está feito ou pendente".
//
// A ÚLTIMA COLUNA É MEDIDA, NÃO DIGITADA. É o que separa esta imagem de um
// lembrete genérico: ela olha o banco e diz o que está aberto HOJE. Um
// checklist que não sabe o que já foi feito vira moldura na parede — todo mês
// a mesma lista, e ninguém confere.
//
// Duas fontes, porque "feito" tem dois sentidos aqui:
//   · o TRABALHO: a condição de outubro está publicada? (elevaCondicoes)
//   · o OK do ritual: alguém carimbou a conferência? (elevaRituais)
// Dá para ter um sem o outro, e o documento mostra os dois — foi assim que
// apareceu que as condições de veículo subiram em 02/10 e ninguém registrou a
// conferência.
//
// Uso: node scripts/rotinas/gera.mjs [saida.png]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';
import { get, doc2obj, TOKEN, BASE } from '../_firestore.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-rotinas-mensais.png`;
const NOITE = '#0b1020';
const CARTAO = '#151c31';
const GOLD = '#c9a84c';
const VERDE = '#3fb27f';
const AMBAR = '#e0a33a';

// As mesmas contas de teste que o relatório diário tira: sem isto a Vivian e
// a Silene apareceriam no ranking que vai para o time.
const TESTE = new Set(['viviangitti23@gmail.com', 'viviangitti@gmail.com', 'maria26@gmail.com',
  'silene_mendes@hotmail.com', 'silene.mendesdesouza@gmail.com', 'silene.mendesangelodesouza@gmail.com']);
const CARGO_CURTO = {
  'vendedor-veiculos': 'veículos', 'vendedor-acessorios': 'acessórios', fi: 'F&I',
  'executivo-leads': 'leads', 'gerente-veiculos': 'gerente', 'gerente-acessorios': 'gerente',
};
const AGORA = new Date();
const MES = AGORA.toISOString().slice(0, 7);
const NOME_MES = AGORA.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'America/Sao_Paulo' });

// ---- o que o banco diz ----
const cond = (await get('elevaCondicoes?pageSize=100')).documents || [];
const ramasa = cond.map(doc2obj).filter((c) => c.brand === 'ramasa');
const doMes = (cat) => ramasa.filter(
  (c) => (c.categoria || 'veiculo') === cat && c.criadoEm && new Date(c.criadoEm).toISOString().slice(0, 7) === MES,
).length;

// O RANKING DO MÊS entra aqui a pedido da Vivian (13/10): é o mesmo envio
// mensal, e é o que o time procura primeiro. Sai dos eventos de elevaStats,
// a mesma fonte do relatório diário — não é um segundo placar.
const stats = ((await get('elevaStats?pageSize=300')).documents || []).map(doc2obj)
  .filter((s) => s.brand === 'ramasa' && !TESTE.has(String(s.email || '').toLowerCase()));
const RANKING = stats.map((s) => {
  const ev = (s.events || []).filter((e) => String(e.at || '').slice(0, 7) === MES);
  return {
    nome: String(s.name || s.email || '').split(' ')[0],
    cargo: CARGO_CURTO[s.cargo] || s.cargo || '',
    pts: ev.reduce((t, e) => t + (e.points || 0), 0),
    quiz: ev.filter((e) => e.type === 'quiz_pass').length,
    dias: new Set(ev.map((e) => String(e.at).slice(0, 10))).size,
  };
}).filter((p) => p.pts > 0).sort((a, b) => b.pts - a.pts).slice(0, 5);

const rit = (await get('elevaRituais?pageSize=200')).documents || [];
const oks = rit.map(doc2obj).flatMap((d) => Object.values(d.oks || {}));
const okNoMes = (id) => oks.filter((o) => o.ritual === id && String(o.em || '').slice(0, 7) === MES).length;

const ultima = (cat) => {
  const l = ramasa.filter((c) => (c.categoria || 'veiculo') === cat).sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0))[0];
  return l?.criadoEm ? new Date(l.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—';
};

const ROTINAS = [
  {
    n: 1, titulo: 'Revisão do app',
    fazer: 'Conferir carros, condições, acessórios, documentos e objeções — e dar o ok.',
    prazo: '6º dia útil',
    quem: 'Becegato', cargo: 'diretor de qualidade',
    feito: okNoMes('qualidade-revisao') > 0,
    nota: okNoMes('qualidade-revisao') > 0 ? 'conferência registrada' : 'nenhuma conferência registrada até hoje',
  },
  {
    n: 2, titulo: 'Condição comercial',
    fazer: 'Publicar a tabela do mês com a validade certa.',
    prazo: '6º dia útil',
    quem: 'Raphaela · Cristiano · Cláudio', cargo: 'gerente de vendas',
    feito: doMes('veiculo') > 0,
    nota: doMes('veiculo') > 0
      ? `${doMes('veiculo')} condições publicadas em ${ultima('veiculo')}`
      : `a última é de ${ultima('veiculo')}`,
  },
  {
    n: 3, titulo: 'Campanha de incentivo',
    fazer: 'Cadastrar a campanha do mês no Painel.',
    prazo: '6º dia útil',
    quem: 'Raphaela · Cristiano · Cláudio', cargo: 'gerente de vendas',
    feito: doMes('campanha') > 0,
    nota: doMes('campanha') > 0 ? 'campanha do mês no ar' : `a última é de ${ultima('campanha')}`,
  },
  {
    n: 4, titulo: 'Acessórios',
    fazer: 'Conferir lista por carro, preços e o que saiu de linha.',
    prazo: '6º dia útil',
    quem: 'Silmara', cargo: 'gerente de acessórios',
    feito: doMes('acessorio') > 0 || okNoMes('acessorios-lista') > 0,
    nota: doMes('acessorio') > 0 ? 'lista atualizada no mês' : `a última atualização é de ${ultima('acessorio')}`,
  },
  {
    n: 5, titulo: 'Campanha fechando', meio: true,
    fazer: 'O app avisa sozinho. O vendedor confirma que viu.',
    prazo: 'Dias 14 e 30',
    quem: 'Time de vendas', cargo: 'todos',
    feito: doMes('campanha') > 0,
    nota: doMes('campanha') > 0 ? 'tem campanha no ar para avisar' : 'sem campanha de outubro, o aviso do dia 14 chega vazio',
  },
];

const check = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4"
  stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;background:${NOITE};color:#eef1f8;font-family:Inter,-apple-system,Arial,sans-serif;
  padding:52px 48px 42px}
.marca{font-family:Cinzel,Georgia,serif;font-weight:800;font-size:21px;letter-spacing:.22em;color:#8b93ab}
h1{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:56px;line-height:1.04;margin-top:12px}
.sub{font-size:24px;color:#a8b0c6;margin-top:12px;line-height:1.35}
.sub b{color:${GOLD}}

/* UMA LINHA POR ROTINA. A versão anterior tinha quatro marcadores em cada uma
   e virava texto para ler; isto é tabela para bater o olho. */
.tb{margin-top:26px;border-top:1px solid #232c47}
.lin{display:flex;align-items:center;gap:20px;padding:24px 4px;border-bottom:1px solid #232c47}
.lin.meio{opacity:.82}
.n{flex:none;width:40px;height:40px;border-radius:50%;border:2px solid ${GOLD};color:${GOLD};
  display:grid;place-items:center;font-family:Cinzel,Georgia,serif;font-weight:900;font-size:21px}
.txt{flex:1;min-width:0}
.tit{font-size:29px;font-weight:800;line-height:1.15}
.fz{font-size:21px;color:#a8b0c6;margin-top:5px;line-height:1.35}
.qm{flex:none;width:250px}
.qm b{display:block;font-size:21px;font-weight:700;line-height:1.25}
.qm span{display:block;font-size:17px;color:#7b84a0;margin-top:3px}
.pz{flex:none;width:150px;font-size:21px;font-weight:800;color:${GOLD};line-height:1.25}
.st{flex:none;width:176px;text-align:right}
.badge{display:inline-flex;align-items:center;gap:7px;font-size:20px;font-weight:800;
  padding:7px 14px;border-radius:999px}
.badge svg{width:15px;height:15px}
.badge .pt{width:9px;height:9px;border-radius:50%;background:currentColor}
.badge.ok{background:rgba(63,178,127,.15);color:${VERDE};border:1px solid rgba(63,178,127,.42)}
.badge.no{background:rgba(224,163,58,.14);color:${AMBAR};border:1px solid rgba(224,163,58,.42)}
.nota{display:block;font-size:16px;color:#7b84a0;margin-top:7px;line-height:1.3}

.rkt{font-size:17px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#7b84a0;margin:34px 0 8px}
.rl{display:flex;align-items:center;gap:15px;padding:13px 4px;border-bottom:1px solid #232c47}
.rl .pos{flex:none;width:34px;height:34px;border-radius:50%;background:#151c31;border:1px solid #232c47;
  color:${GOLD};display:grid;place-items:center;font-family:Cinzel,Georgia,serif;font-weight:900;font-size:18px}
.rl.ouro .pos{background:rgba(201,168,76,.18);border-color:rgba(201,168,76,.5)}
.rl .nm{flex:1;font-size:23px;font-weight:700}
.rl .nm i{font-style:normal;font-size:17px;color:#7b84a0;font-weight:500;margin-left:9px}
.rl .dt{flex:none;font-size:19px;color:#a8b0c6}
.rl .dt b{color:#eef1f8;font-weight:800}
.rod{margin-top:26px;display:flex;justify-content:space-between;font-size:18px;color:#7b84a0}
</style>
<div class="marca">ELEVA · GRUPO RAMASA</div>
<h1>Rotinas mensais do app</h1>
<p class="sub">Tudo fechado <b>até o 6º dia útil</b>. O app avisa cada cargo e o “ok” fica gravado com nome e hora.</p>

<div class="tb">
${ROTINAS.map((r) => `
<div class="lin${r.meio ? ' meio' : ''}">
  <span class="n">${r.n}</span>
  <div class="txt"><div class="tit">${r.titulo}</div><div class="fz">${r.fazer}</div></div>
  <div class="qm"><b>${r.quem}</b><span>${r.cargo}</span></div>
  <div class="pz">${r.prazo}</div>
  <div class="st">
    <span class="badge ${r.feito ? 'ok' : 'no'}">${r.feito ? check + ' Feito' : '<span class="pt"></span> Pendente'}</span>
    <span class="nota">${r.nota}</span>
  </div>
</div>`).join('')}
</div>

<h2 class="rkt">Ranking do mês</h2>
<div class="rk">
${RANKING.map((p, n) => `
<div class="rl${n === 0 ? ' ouro' : ''}">
  <span class="pos">${n + 1}</span>
  <span class="nm">${p.nome}<i>${p.cargo}</i></span>
  <span class="dt"><b>${p.pts}</b> pontos · <b>${p.dias}</b> dias${p.quiz ? ` · <b>${p.quiz}</b> quiz` : ''}</span>
</div>`).join('')}
</div>

<div class="rod"><span>Posição de ${AGORA.toLocaleDateString('pt-BR')}</span><span>gsseleva.com.br</span></div>`;

const arq = '/tmp/rotinas.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable'); await c.send('Runtime.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 900, deviceScaleFactor: 2, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 2000));
const { result } = await c.send('Runtime.evaluate', { expression: 'document.body.scrollHeight', returnByValue: true });
await c.send('Emulation.setDeviceMetricsOverride', { width: 1080, height: result.value, deviceScaleFactor: 2, mobile: false });
await new Promise((r) => setTimeout(r, 500));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('rotinas:', SAIDA);
