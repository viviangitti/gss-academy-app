// O QUE MUDA COM PERGUNTA POR NÍVEL — explicador para a Vivian decidir.
//
// Não é peça pro time: é a conta na mesa, pra ela dizer sim, não ou outro
// número. Por isso compara DUAS PESSOAS em vez de listar regras — a injustiça
// de hoje só fica óbvia quando as duas aparecem lado a lado com o mesmo 40.
//
// Uso: node scripts/ranking-aviso/niveis.mjs <saida.png>
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/ELEVA - quiz por nivel.png`;
const NOITE = '#0f0f1e';
const GOLD = '#c9a84c';
const VERM = '#d1483f';

const CARROS = [
  { n: 'Jaecoo 5 SHS-H', niveis: 7, hoje: 40, novo: 100 },
  { n: 'Jaecoo 7 SHS-P', niveis: 6, hoje: 40, novo: 90 },
  { n: 'Omoda 5 SHS-H', niveis: 6, hoje: 40, novo: 90 },
  { n: 'Omoda E5', niveis: 6, hoje: 40, novo: 90 },
  { n: 'Omoda 7 SHS-P', niveis: 6, hoje: 40, novo: 90 },
];

/** As barrinhas dos níveis — cheias = a pessoa estudou. */
const trilha = (cheios, total, cor) => Array.from({ length: total }, (_, i) =>
  `<span class="nv" style="background:${i < cheios ? cor : 'rgba(255,255,255,.13)'}"></span>`).join('');

const html = `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;background:${NOITE};color:#f4f3f0;
  font:16px/1.5 -apple-system,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.pg{padding:62px 64px 56px}
.k{font:800 17px sans-serif;letter-spacing:.2em;color:${GOLD};text-transform:uppercase}
h1{font:800 64px/1.05 Georgia,serif;margin:18px 0 14px;letter-spacing:-1.4px}
.sub{font-size:24px;line-height:1.45;color:#b9bdcc;max-width:920px}

.rot{font:800 16px sans-serif;letter-spacing:.18em;text-transform:uppercase;margin:46px 0 18px}
.rot.mal{color:${VERM}} .rot.bem{color:${GOLD}}

.par{display:flex;gap:20px}
.p{flex:1;border:2px solid rgba(255,255,255,.12);border-radius:22px;padding:26px 26px 24px}
.p.vence{border-color:${GOLD};background:rgba(201,168,76,.09)}
.p .quem{font-size:22px;font-weight:800;margin-bottom:5px}
.p .oq{font-size:18px;color:#9aa1b4;margin-bottom:18px}
.trilha{display:flex;gap:6px;margin-bottom:20px}
.nv{height:12px;flex:1;border-radius:4px}
.p .pts{font:800 62px Georgia,serif;letter-spacing:-2px;line-height:1}
.p .pts small{font:800 18px sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#8d94a7;margin-left:10px}

.selo{margin-top:16px;display:inline-block;padding:8px 15px;border-radius:99px;
  font-size:16px;font-weight:800}
.selo.mal{background:rgba(209,72,63,.17);color:#f08b82}
.selo.bem{background:rgba(201,168,76,.2);color:${GOLD}}

.regra{margin-top:22px;background:rgba(201,168,76,.12);border:2px solid rgba(201,168,76,.4);
  border-radius:20px;padding:22px 26px;font-size:23px;line-height:1.5}
.regra b{color:${GOLD}}

table{width:100%;border-collapse:collapse;margin-top:16px;font-size:21px}
th{font:800 14px sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#7d8498;
  text-align:right;padding:0 0 12px}
th:first-child{text-align:left}
td{padding:14px 0;border-top:1px solid rgba(255,255,255,.09);text-align:right}
td:first-child{text-align:left;font-weight:700}
td.vel{color:#8d94a7}
td.nov{color:${GOLD};font-weight:800}
tr.tot td{border-top:2px solid rgba(255,255,255,.22);font-weight:800;font-size:24px;padding-top:18px}

.rod{margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);
  font-size:19px;color:#9aa1b4;line-height:1.55}
.rod b{color:#f4f3f0}
</style>
<div class="pg">
  <div class="k">Eleva · proposta</div>
  <h1>Quiz por nível</h1>
  <p class="sub">Cada carro tem 6 ou 7 níveis. Hoje, três perguntas sobre o nível 1 destravam todos os outros de uma vez — e o carro vale o mesmo, estude você fundo ou raso.</p>

  <div class="rot mal">Hoje</div>
  <div class="par">
    <div class="p">
      <div class="quem">Assiste o nível 1</div>
      <div class="oq">O essencial, e para por aí</div>
      <div class="trilha">${trilha(1, 6, '#5b9bf8')}</div>
      <div class="pts">40<small>pontos</small></div>
    </div>
    <div class="p">
      <div class="quem">Assiste os 6 níveis</div>
      <div class="oq">Até Motorização e Negociação difícil</div>
      <div class="trilha">${trilha(6, 6, '#5b9bf8')}</div>
      <div class="pts">40<small>pontos</small></div>
      <span class="selo mal">o mesmo que a de cima</span>
    </div>
  </div>

  <div class="rot bem">Com pergunta por nível</div>
  <div class="par">
    <div class="p">
      <div class="quem">Assiste o nível 1</div>
      <div class="oq">Não acerta a pergunta, não abre o 2</div>
      <div class="trilha">${trilha(1, 6, GOLD)}</div>
      <div class="pts">40<small>pontos</small></div>
    </div>
    <div class="p vence">
      <div class="quem">Assiste os 6 níveis</div>
      <div class="oq">Uma pergunta por nível, 10 pontos cada</div>
      <div class="trilha">${trilha(6, 6, GOLD)}</div>
      <div class="pts" style="color:${GOLD}">90<small>pontos</small></div>
      <span class="selo bem">+50 por ir até o fim</span>
    </div>
  </div>

  <div class="regra">
    Por que <b>10</b> por pergunta: é exatamente o que uma pergunta vale hoje — o quiz do carro
    são <b>30 pontos por 3 perguntas</b>. Não é moeda nova; é cobrar o mesmo preço pelo conteúdo
    que hoje sai de graça.
  </div>

  <div class="rot" style="color:#7d8498">Carro por carro</div>
  <table>
    <tr><th>Carro</th><th>Níveis</th><th>Vale hoje</th><th>Passaria a valer</th></tr>
    ${CARROS.map((c) => `<tr><td>${c.n}</td><td class="vel">${c.niveis}</td><td class="vel">${c.hoje}</td><td class="nov">${c.novo}</td></tr>`).join('')}
    <tr class="tot"><td>A marca inteira</td><td class="vel">31</td><td class="vel">200</td><td class="nov">460</td></tr>
  </table>

  <p class="rod">
    O estudo a fundo é o grande prêmio do começo e esgota — depois, quem sustenta o mês é o
    <b>desafio da semana (25)</b>, a <b>prova do mês (60)</b> e o atendimento (até 10 por dia).
    A ficha nova de cada carta reabre parte do estudo.<br><br>
    Se 10 por pergunta parecer muito: com <b>5</b>, a marca vale <b>330</b> em vez de 460.
  </p>
</div>`;

const arq = '/tmp/niveis.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 2, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 1400));
const { data } = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('png:', SAIDA);
