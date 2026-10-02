// MOCKUP do Painel: o que eu proponho para a tela do gestor e a da diretora.
//
// Não é código do app — é uma maquete em HTML, na linguagem visual do Eleva,
// com DADO REAL do Grupo Ramasa (02/10/2026). Dado inventado num mockup faz a
// conversa girar em torno de número fictício; com o dado certo, a decisão é
// sobre o desenho.
//
// Uso: node scripts/mockup/gera.mjs <pasta-de-saida>
import fs from 'fs';
import { icone } from '../deck-ramasa/icone.mjs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2];
if (!SAIDA) { console.error('falta a pasta'); process.exit(1); }
fs.mkdirSync(SAIDA, { recursive: true });

const ic = (n, cor = 'currentColor', t = 16) => icone(n, { tamanho: t, cor, traco: 2.2 });

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{font:14px/1.45 -apple-system,"Helvetica Neue",Arial,sans-serif;background:#f2f3f7;color:#16181d;width:100%}
.topo{background:#10101e;color:#fff;padding:11px 14px;display:flex;align-items:center;gap:9px}
.marca{font:700 16px Georgia,serif;letter-spacing:.5px}
.seta{color:#4b8dff}
.av{width:26px;height:26px;border-radius:50%;background:#2a2d40;display:grid;place-items:center;font:700 11px sans-serif}
.pill{margin-left:auto;background:#262a3d;border-radius:99px;padding:5px 11px;font:600 11.5px sans-serif}
.corpo{padding:13px}
.card{background:#fff;border:1px solid #e6e8ef;border-radius:15px;padding:14px;margin-bottom:11px}
.h{display:flex;align-items:center;gap:6px;font:800 10.5px sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#6b7280;margin-bottom:11px}
.h svg{width:13px;height:13px}
.novo{background:#fff6e0;color:#8a6b1f;border:1px solid #efdca8;border-radius:99px;padding:2px 7px;font:800 9px sans-serif;letter-spacing:.06em;margin-left:auto}
.metrs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.m{background:#f6f7fa;border-radius:12px;padding:10px 9px;text-align:center}
.m b{display:block;font:800 21px sans-serif;color:#10101e;line-height:1.1}
.m span{display:block;font:600 9.5px sans-serif;color:#6b7280;margin-top:3px;line-height:1.25}
.d{display:inline-flex;align-items:center;gap:2px;font:800 9.5px sans-serif;margin-top:5px;padding:1px 5px;border-radius:99px}
.up{background:#e4f6ea;color:#1f7a4d}.dn{background:#fdeaea;color:#b3261e}
.pes{display:flex;align-items:center;gap:9px;padding:9px 0;border-top:1px solid #f0f1f5}
.pes:first-of-type{border-top:0}
.pes .n{font:700 13px sans-serif}
.pes .s{font:500 11px sans-serif;color:#8a90a0}
.dias{margin-left:auto;font:800 12px sans-serif;color:#b3261e;white-space:nowrap}
.bt{margin-left:9px;background:#10101e;color:#fff;border:0;border-radius:9px;padding:6px 11px;font:700 11px sans-serif;display:inline-flex;align-items:center;gap:4px}
.loja{padding:11px 0;border-top:1px solid #f0f1f5}
.loja:first-of-type{border-top:0}
.ltop{display:flex;align-items:baseline;gap:7px}
.ltop b{font:800 14px sans-serif}
.ltop i{font-style:normal;font:600 11px sans-serif;color:#8a90a0}
.ltop em{margin-left:auto;font-style:normal;font:800 15px sans-serif;color:#10101e}
.barra{height:7px;background:#eceef4;border-radius:99px;margin-top:7px;overflow:hidden}
.fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#2563eb,#6fa0ff)}
.fill.q{background:linear-gradient(90deg,#c9a84c,#e3cb86)}
.sub{font:500 11px sans-serif;color:#8a90a0;margin-top:5px}
.aviso{background:#10101e;color:#e9e9f2;border-radius:12px;padding:11px 12px;font:500 12px sans-serif;line-height:1.5;margin-top:4px}
.aviso b{color:#f0cd74}
.nav{position:fixed;bottom:0;left:0;width:100%;background:#fff;border-top:1px solid #e6e8ef;display:flex;padding:7px 4px 9px}
.nav div{flex:1;text-align:center;font:600 8.5px sans-serif;color:#9aa0ae}
.nav div.on{color:#2563eb}
.nav svg{width:17px;height:17px;display:block;margin:0 auto 2px}
.espaco{height:62px}
`;

const topo = (inicial, nome) => `<div class="topo"><span class="marca">ELEVA</span><span class="seta">${ic('arrow-up-right', '#4b8dff', 13)}</span><span class="av">${inicial}</span><span class="pill">Ramasa · Jaecoo e Omoda</span></div>`;

const nav = (ativo) => `<div class="nav">${[
  ['layout-dashboard', 'Painel'], ['route', 'Jornada'], ['eye', 'Ver como time'],
  ['tag', 'Condições'], ['newspaper', 'Notícias'], ['folder-open', 'Documentos'], ['circle-question-mark', 'Tira-dúvida'],
].map(([i, l]) => `<div class="${l === ativo ? 'on' : ''}">${ic(i, l === ativo ? '#2563eb' : '#9aa0ae', 17)}${l}</div>`).join('')}</div>`;

// ---------------------------------------------------------------- gestor ---
const PARARAM = [
  ['Tatiane', 'Vendedora de veículos', 28], ['Glaucia', 'Vendedora de veículos', 28],
  ['Samir Wallacy', 'Vendedor de veículos', 28], ['THAYSE', 'Vendedora de veículos', 23],
];
const gestor = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${CSS}</style>
${topo('R', 'Raphaela')}
<div class="corpo">

  <div class="card">
    <div class="h">${ic('trending-up', '#6b7280')} Resultados · Tiger Goiânia <span class="novo">com comparação</span></div>
    <div class="metrs">
      <div class="m"><b>6</b><span>pessoas ativas<br>nos 7 dias</span><span class="d up">${ic('arrow-up', '#1f7a4d', 9)} +2</span></div>
      <div class="m"><b>84</b><span>ações<br>na semana</span><span class="d up">${ic('arrow-up', '#1f7a4d', 9)} +19</span></div>
      <div class="m"><b>5</b><span>materiais<br>ao cliente</span><span class="d dn">${ic('arrow-down', '#b3261e', 9)} −3</span></div>
    </div>
    <p class="sub">Comparado com os mesmos 4 dias da semana passada.</p>
  </div>

  <div class="card">
    <div class="h">${ic('user-round-x', '#b3261e')} Quem parou <span class="novo">novo</span></div>
    <p class="sub" style="margin:-5px 0 9px">Usavam e sumiram. Toque em Cobrar para copiar a mensagem pronta.</p>
    ${PARARAM.map(([n, c, d]) => `<div class="pes"><div><div class="n">${n}</div><div class="s">${c}</div></div><span class="dias">${d} dias</span><button class="bt">${ic('send', '#fff', 11)} Cobrar</button></div>`).join('')}
    <div class="aviso">São <b>13 pessoas</b> da sua loja sem abrir o app há mais de uma semana — de 19 cadastradas.</div>
  </div>

  <div class="card">
    <div class="h">${ic('circle-question-mark', '#6b7280')} O que o cliente perguntou</div>
    <div class="loja"><div class="ltop"><b>"E se a bateria acabar no meio do caminho?"</b><em>4</em></div><div class="barra"><div class="fill q" style="width:100%"></div></div><div class="sub">Jaecoo 5 · a resposta está no app</div></div>
    <div class="loja"><div class="ltop"><b>"Quantas opções de roda tem?"</b><em>4</em></div><div class="barra"><div class="fill q" style="width:100%"></div></div><div class="sub">Jaecoo 5</div></div>
  </div>
</div>
<div class="espaco"></div>${nav('Painel')}`;

// -------------------------------------------------------------- diretora ---
const LOJAS = [
  ['Tiger Itumbiara', 5, 4, 369, 100], ['Tiger Goiânia', 19, 6, 331, 90],
  ['Omoda Goiânia', 1, 1, 31, 8], ['Sem loja no cadastro', 15, 5, 267, 72],
];
const diretora = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${CSS}</style>
${topo('M', 'Mariana')}
<div class="corpo">

  <div class="card">
    <div class="h">${ic('store', '#6b7280')} As lojas, lado a lado <span class="novo">novo</span></div>
    <p class="sub" style="margin:-5px 0 10px">Ações no app desde o começo. Toque numa loja para entrar nela.</p>
    ${LOJAS.map(([n, t, a, ac, w]) => `<div class="loja"><div class="ltop"><b>${n}</b><i>${a} de ${t} ativos</i><em>${ac}</em></div><div class="barra"><div class="fill" style="width:${w}%"></div></div></div>`).join('')}
    <div class="aviso">Itumbiara tem <b>5 pessoas</b> e usa mais que a Tiger Goiânia, que tem <b>19</b>. A distância entre as duas é o maior ganho disponível do grupo.</div>
  </div>

  <div class="card">
    <div class="h">${ic('trending-up', '#6b7280')} O grupo somado</div>
    <div class="metrs">
      <div class="m"><b>33</b><span>de 37 pessoas<br>já usaram</span></div>
      <div class="m"><b>998</b><span>ações<br>no total</span><span class="d up">${ic('arrow-up', '#1f7a4d', 9)} +13</span></div>
      <div class="m"><b>18</b><span>pararam<br>há 7+ dias</span><span class="d dn">${ic('arrow-up', '#b3261e', 9)} +4</span></div>
    </div>
  </div>

  <div class="card">
    <div class="h">${ic('user-round-x', '#b3261e')} Quem parou, no grupo <span class="novo">novo</span></div>
    ${[['Ana Laura', 'sem loja', 29], ['Tatiane', 'Tiger Goiânia', 28], ['Glaucia', 'Tiger Goiânia', 28]]
      .map(([n, l, d]) => `<div class="pes"><div><div class="n">${n}</div><div class="s">${l}</div></div><span class="dias">${d} dias</span><button class="bt">${ic('send', '#fff', 11)} Cobrar</button></div>`).join('')}
    <div class="aviso"><b>7 das 8</b> pessoas que mais sumiram são da Tiger Goiânia.</div>
  </div>
</div>
<div class="espaco"></div>${nav('Painel')}`;

// ----------------------------------------------------------------- render --
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });

for (const [nome, html] of [['gestor', gestor], ['diretora', diretora]]) {
  const arq = `${SAIDA}/${nome}.html`;
  fs.writeFileSync(arq, html);
  await c.send('Page.navigate', { url: 'file://' + arq });
  await new Promise((r) => setTimeout(r, 1200));
  // A ALTURA SAI DO CONTEÚDO, não do visor. Com captureBeyondViewport a página
  // vinha com a largura da janela (980) e uma faixa branca enorme embaixo — a
  // barra de navegação é `position: fixed` e não estica o documento.
  const larg = await c.send('Runtime.evaluate', { expression: 'innerWidth', returnByValue: true }).then((r) => r.result.value);
  const alt = await c.send('Runtime.evaluate', {
    expression: 'Math.ceil(document.body.getBoundingClientRect().height)', returnByValue: true,
  }).then((r) => r.result.value);
  await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: alt, deviceScaleFactor: 3, mobile: true });
  await new Promise((r) => setTimeout(r, 400));
  const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${SAIDA}/${nome}.png`, Buffer.from(data, 'base64'));
  console.log('  ', nome + '.png', '· visor', larg + 'px');
}
c.fechar(); proc.kill();
