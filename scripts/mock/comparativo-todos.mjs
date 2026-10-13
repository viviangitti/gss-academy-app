// MOCK 2: comparar QUANTOS MODELOS QUISER de uma vez.
//
// A Mariana pediu (13/10): "acho legal dar pra comparar com todos de uma única
// vez — ele seleciona quantos quiser".
//
// Dá. O problema não é selecionar vários, é caber em 390px de celular. Cinco
// colunas num celular dão 78px cada — menos que a palavra "autorrecarregável".
//
// A solução tem duas partes, e a segunda é de CONTEÚDO, não de tela:
//
// 1. COLUNA DE RÓTULO FIXA + rolagem lateral. O nome da linha nunca sai da
//    tela; os carros deslizam por baixo. É como planilha no celular.
//
// 2. OS VALORES VIRAM FICHA CURTA. "Híbrido autorrecarregável (HEV) — NÃO
//    carrega na tomada. O treinamento insiste nisso" não cabe em coluna de
//    100px — e nem precisa: no comparativo o que importa é "Híbrido". O texto
//    inteiro continua na ficha do carro. Isso exige um campo novo por linha
//    comparável, escrito uma vez por carro.
//
// A primeira linha é "CARREGA NA TOMADA?" porque é a pergunta que de fato
// separa os cinco — e é a objeção mais consultada no app depois de "nunca ouvi
// falar dessa marca".
//
// A última linha é "É PRA QUEM" — o resumo da persona que a Vivian pediu,
// dentro do próprio comparativo em vez de numa tela à parte.
//
// Uso: node scripts/mock/comparativo-todos.mjs [saida.png]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-mock-comparar-todos.png`;
const TINTA = '#17231d';
const ROTULO = '#7a857f';
const BORDA = '#e8ebe6';
const ESCURO = '#1a1a2e';
const VERDE = '#1f7a4d';

const CARROS = [
  { id: 'j7', nome: 'Jaecoo 7', sub: 'SHS-P', tomada: 'Opcional', tipo: 'Plug-in',
    malas: '500 L', eixos: '2.672', comp: '4.500', cem: '8,4 s',
    quem: 'Quer SUV médio cheio de série e aceita marca nova.' },
  { id: 'j5', nome: 'Jaecoo 5', sub: 'SHS-H', tomada: 'Não precisa', tipo: 'Híbrido',
    malas: '410 L', eixos: '2.620', comp: '4.380', cem: '7,9 s',
    quem: 'Quer economia sem mudar nada na rotina.' },
  { id: 'o5', nome: 'Omoda 5', sub: 'SHS-H', tomada: 'Não precisa', tipo: 'Híbrido',
    malas: '372 L', eixos: '2.610', comp: '4.447', cem: '7,9 s',
    quem: 'Roda muito na cidade e não quer obra em casa.' },
  { id: 'e5', nome: 'Omoda E5', sub: '100% elétrico', tomada: 'Obrigatório', tipo: 'Elétrico',
    malas: '360 L', eixos: '2.630', comp: '4.424', cem: '7,6 s',
    quem: 'Tem onde carregar e valoriza silêncio e tecnologia.' },
  { id: 'o7', nome: 'Omoda 7', sub: 'SHS-P', tomada: 'Opcional', tipo: 'Plug-in',
    malas: '590 L', eixos: '2.720', comp: '4.660', cem: '8,4 s',
    quem: 'Família maior, pega estrada, quer o topo de acabamento.' },
];

const LINHAS = [
  ['Carrega na tomada?', 'tomada', true],
  ['O que é', 'tipo', false],
  ['Porta-malas', 'malas', false],
  ['Entre-eixos', 'eixos', false],
  ['Comprimento', 'comp', false],
  ['0 a 100', 'cem', false],
];

// `desloca` simula a rolagem lateral: o mesmo comparativo, visto em dois
// momentos, é o jeito de mostrar numa imagem parada que a coluna de rótulo
// fica e os carros passam.
const tabela = (desloca) => `
  <div class="tb">
    <div class="rot-col">
      <div class="ch">&nbsp;</div>
      ${LINHAS.map(([lb, , dec]) => `<div class="rl${dec ? ' dec' : ''}">${lb}</div>`).join('')}
      <div class="rl quem-lb">É pra quem</div>
    </div>
    <div class="pista"><div class="trilho" style="margin-left:-${desloca}px">
      ${CARROS.map((c) => `
      <div class="cc">
        <div class="ch"><b>${c.nome}</b><span>${c.sub}</span></div>
        ${LINHAS.map(([, k, dec]) => `<div class="cl${dec ? ' dec' : ''}">${c[k]}</div>`).join('')}
        <div class="cl quem">${c.quem}</div>
      </div>`).join('')}
    </div></div>
  </div>`;

const fone = (titulo, corpo) => `<div class="fone"><div class="rot">${titulo}</div><div class="tela">${corpo}</div></div>`;

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#eef0ee;font-family:Inter,-apple-system,Arial,sans-serif;color:${TINTA};
  padding:38px 34px;display:flex;gap:30px;align-items:flex-start;width:max-content}
.fone{width:390px}
.rot{font-size:15px;font-weight:800;color:#5c6660;margin-bottom:12px}
.tela{background:#fff;border-radius:22px;padding:20px 0 24px;border:1px solid #dfe3df;
  box-shadow:0 12px 30px rgba(0,0,0,.07);overflow:hidden}
.pad{padding:0 20px}
h2{font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${ROTULO};margin-bottom:10px}

/* seletor */
.op{display:flex;align-items:center;gap:11px;padding:11px 0;border-top:1px solid ${BORDA}}
.op:first-of-type{border-top:0}
.op .bo{width:32px;height:32px;border-radius:8px;background:#f0f2f0;flex:none}
.op .tx{flex:1;min-width:0}
.op .tx b{display:block;font-size:13px;font-weight:800}
.op .tx span{display:block;font-size:11px;color:${ROTULO};margin-top:2px}
.op .ck{width:21px;height:21px;border-radius:6px;border:2px solid #d6dbd7;flex:none}
.op.on .ck{border-color:${VERDE};background:${VERDE};
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E");
  background-size:14px;background-position:center;background-repeat:no-repeat}
.todos{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;
  padding:11px 13px;border-radius:11px;background:#f6f8f6;border:1px solid ${BORDA};
  font-size:13px;font-weight:800}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:16px;
  padding:14px;border-radius:12px;background:${ESCURO};color:#fff;font-size:14px;font-weight:800}

/* comparativo com rolagem lateral */
.tb{display:flex;align-items:stretch}
.rot-col{flex:none;width:102px;padding-left:20px;background:#fff;position:relative;z-index:2;
  box-shadow:6px 0 10px -6px rgba(0,0,0,.14)}
.pista{flex:1;overflow:hidden}
.trilho{display:flex;width:max-content}
.cc{width:104px;flex:none;padding:0 9px;border-left:1px solid ${BORDA}}
.ch{height:46px;display:flex;flex-direction:column;justify-content:center}
.ch b{font-size:12.5px;font-weight:800;line-height:1.1}
.ch span{font-size:9.5px;color:${ROTULO};margin-top:2px}
.rl,.cl{border-top:1px solid ${BORDA};height:50px;font-size:11.5px;line-height:1.3;
  display:flex;align-items:center}
.rl{font-size:8.5px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:${ROTULO};
  padding-right:8px;line-height:1.25}
.cl{font-weight:600}
.rl.dec,.cl.dec{background:#fbfaf5}
.rl.dec{color:#8a7a3e}
.cl.dec{font-weight:800}
.quem-lb,.quem{align-items:flex-start;padding-top:10px;font-size:10.5px;font-weight:500;line-height:1.35;height:86px;color:#44504a}
.quem-lb{color:${VERDE};font-size:9.5px;font-weight:800}
.nota{margin:14px 20px 0;background:#f6f8f6;border:1px solid ${BORDA};border-radius:10px;
  padding:10px 12px;font-size:11px;line-height:1.5;color:#44504a}
.nota b{color:${TINTA}}
.desliza{display:flex;align-items:center;gap:6px;margin:11px 20px 0;font-size:10.5px;color:#9aa49e}
.desliza svg{width:13px;height:13px}
</style>

${fone('1 · Escolher quantos quiser', `<div class="pad">
  <h2>Comparar modelos</h2>
  <div class="todos">Selecionar os 5 <span class="ck" style="width:21px;height:21px;border-radius:6px;border:2px solid ${VERDE};background:${VERDE}"></span></div>
  ${CARROS.map((c, i) => `
  <div class="op on"><span class="bo"></span><span class="tx"><b>${c.nome} ${c.sub}</b><span>${c.tipo} · ${c.malas}</span></span><span class="ck"></span></div>`).join('')}
  <button class="btn">Comparar os 5</button>
</div>`)}

${fone('2 · O comparativo — começo', `
  <div class="pad"><h2>5 modelos lado a lado</h2></div>
  ${tabela(0)}
  <div class="desliza"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg> deslize para ver os outros · o nome da linha fica parado</div>
  <div class="nota"><b>A primeira linha é a que decide.</b> Plug-in, híbrido e elétrico resolvem rotinas diferentes — é nela que o cliente se reconhece.</div>
`)}

${fone('3 · O mesmo, deslizado para o fim', `
  <div class="pad"><h2>5 modelos lado a lado</h2></div>
  ${tabela(208)}
  <div class="nota"><b>Nenhum carro ganha.</b> Os cinco são da casa: a última linha diz para quem cada um é, em vez de apontar um melhor.</div>
`)}
`;

const arq = '/tmp/mock-todos.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Runtime.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 2, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 2200));
const { result } = await c.send('Runtime.evaluate', {
  expression: 'JSON.stringify([document.body.scrollWidth, document.body.scrollHeight])', returnByValue: true,
});
const [L, A] = JSON.parse(result.value);
await c.send('Emulation.setDeviceMetricsOverride', { width: L, height: A, deviceScaleFactor: 2, mobile: false });
await new Promise((r) => setTimeout(r, 600));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('mock:', SAIDA);
