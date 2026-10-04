// A IMAGEM DAS REGRAS — a versão de mandar no grupo.
//
// Não é a folha do mural em menor: é outra peça. A folha A4 a pessoa lê de pé,
// com tempo; esta ela vê no WhatsApp, no meio de cinquenta mensagens, com o
// polegar já a caminho da próxima. Então são cinco números e nada mais — o
// "por quê" de cada regra fica na folha, que é onde cabe.
//
// Uso: node scripts/ranking-aviso/imagem.mjs <saida.png>
import fs from 'fs';
import { icone } from '../deck-ramasa/icone.mjs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/ELEVA - como pontuar.png`;
const ic = (n, cor, t = 22) => icone(n, { tamanho: t, cor, traco: 2.3 });
const NOITE = '#0f0f1e';
const GOLD = '#c9a84c';

const SEMPRE = [
  { ic: 'circle-play', n: '10', t: 'Assistir o vídeo de um carro', d: 'uma vez por carro', cor: '#5b9bf8' },
  { ic: 'graduation-cap', n: '30', t: 'Acertar o quiz do carro', d: 'o que mais vale', cor: GOLD },
  { ic: 'briefcase', n: '2', t: 'Usar o app no atendimento', d: 'até 10 por dia', cor: '#49c58d' },
];

const NOVO = [
  { n: '25', t: 'Desafio da semana', d: '5 perguntas · acerte 4 · toda segunda' },
  { n: '60', t: 'Prova do mês', d: '10 perguntas · acerte 8 · todo dia 1º' },
];

const html = `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;background:${NOITE};color:#f4f3f0;
     font:16px/1.5 -apple-system,"Helvetica Neue",Arial,sans-serif;
     -webkit-font-smoothing:antialiased;overflow:hidden;position:relative}
body::after{content:'';position:absolute;right:-180px;top:-180px;width:560px;height:560px;
            border-radius:50%;background:rgba(201,168,76,.10)}
.pg{position:relative;padding:76px 72px 64px;height:100%;display:flex;flex-direction:column}
.k{font:800 20px sans-serif;letter-spacing:.22em;color:${GOLD};text-transform:uppercase}
h1{font:800 82px/1.04 Georgia,serif;margin:26px 0 20px;letter-spacing:-1.5px}
.sub{font-size:27px;line-height:1.45;color:#b9bdcc;max-width:840px}

.rot{font:800 19px sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#7d8498;margin:62px 0 26px}
.linha{display:flex;align-items:center;gap:26px;padding:40px 0;border-top:1px solid rgba(255,255,255,.09)}
.linha:first-of-type{border-top:0}
.selo{width:84px;height:84px;border-radius:25px;display:grid;place-items:center;flex:none}
.n{font:800 70px Georgia,serif;letter-spacing:-2px;width:130px;text-align:right;flex:none}
.tx b{display:block;font:800 33px sans-serif;margin-bottom:5px}
.tx span{font-size:24px;color:#9aa1b4}

.novo{margin-top:auto;background:rgba(201,168,76,.13);border:2px solid rgba(201,168,76,.42);
      border-radius:28px;padding:34px 34px 32px}
.novo .et{font:800 18px sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${GOLD};margin-bottom:18px}
.nl{display:flex;align-items:center;gap:22px;padding:18px 0;border-top:1px solid rgba(201,168,76,.22)}
.nl:first-of-type{border-top:0}
.nl .nn{font:800 50px Georgia,serif;color:${GOLD};width:106px;text-align:right;letter-spacing:-1.5px;flex:none}
.nl b{display:block;font:800 27px sans-serif}
.nl span{font-size:20px;color:#b9bdcc}

.rod{margin-top:26px;font-size:22px;color:#8e95a8;display:flex;justify-content:space-between}
.rod b{color:#f4f3f0}
</style>
<div class="pg">
  <div class="k">Eleva · Grupo Ramasa</div>
  <h1>Como pontuar</h1>
  <p class="sub">O placar zera todo dia 1º. Na frente fica quem aprende o que é novo e usa o app com cliente.</p>

  <div class="rot">Vale sempre</div>
  ${SEMPRE.map((v) => `
  <div class="linha">
    <span class="selo" style="background:${v.cor}22">${ic(v.ic, v.cor, 36)}</span>
    <span class="n" style="color:${v.cor}">${v.n}</span>
    <span class="tx"><b>${v.t}</b><span>${v.d}</span></span>
  </div>`).join('')}

  <div class="novo">
    <div class="et">Novo — toda semana tem ponto na mesa</div>
    ${NOVO.map((v) => `
    <div class="nl">
      <span class="nn">+${v.n}</span>
      <span><b>${v.t}</b><span>${v.d}</span></span>
    </div>`).join('')}
  </div>

  <div class="rod"><span>Regras completas na folha do mural</span><span><b>gsseleva.com.br</b></span></div>
</div>`;

const arq = '/tmp/ranking-imagem.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 1400));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('imagem:', SAIDA);
