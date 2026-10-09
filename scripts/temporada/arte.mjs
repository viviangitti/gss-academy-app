// A ARTE DE ESTREIA — o conteúdo do Eleva anunciado como série.
//
// A ideia é da Vivian: parar de tratar o conteúdo como biblioteca parada e
// passar a lançar por episódio, com data, como uma temporada. O que ela não
// sabia quando teve a ideia é que a série JÁ EXISTE — cada carro tem 6 ou 7
// níveis escritos ("O essencial", "Por dentro", "Motorização"...), 31 no total.
// O app entrega os seis de uma vez e por isso ninguém sente que recebeu nada.
//
// SEM O VERMELHO DA NETFLIX, de propósito. Copiar a cor seria derivativo e
// fora da marca; o que faz a peça parecer cinema é o escuro, a profundidade e
// os pôsteres em fila — não o vermelho. O acento continua sendo o dourado.
//
// Uso: node scripts/temporada/arte.mjs <saida.png> [--data "13 de outubro"]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-temporada.png`;
const iData = process.argv.indexOf('--data');
const DATA = iData > -1 ? process.argv[iData + 1] : '';

const NOITE = '#07070f';
const GOLD = '#c9a84c';
const CARROS = [
  ['jaecoo-7-1.jpg', 'Jaecoo 7'],
  ['omoda-7-shs-p-1.jpg', 'Omoda 7'],
  ['jaecoo-5-1.jpg', 'Jaecoo 5'],
  ['omoda-5-shs-h-1.jpg', 'Omoda 5'],
  ['omoda-e5-1.jpg', 'Omoda E5'],
];
const b64 = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(`public/carros/${f}`).toString('base64');

const L = 1080, A = 1350;
const html = `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${L}px;height:${A}px;background:${NOITE};color:#f4f3f0;
  font-family:Inter,-apple-system,Arial,sans-serif;overflow:hidden;position:relative}
/* A luz de cima: é ela que dá o ar de sala escura com a tela acesa. */
.luz{position:absolute;left:50%;top:-30%;transform:translateX(-50%);
  width:150%;height:85%;border-radius:50%;
  background:radial-gradient(closest-side, rgba(201,168,76,.17), rgba(201,168,76,0) 70%)}
/* ESPAÇO DISTRIBUÍDO, não empilhado.
   Com tudo encostado no topo sobrava um terço da peça vazio embaixo, e no
   WhatsApp isso lê como arte inacabada. Espalhando, cada bloco ganha ar e a
   peça inteira respira. */
.pg{position:relative;height:100%;padding:66px 64px 56px;display:flex;flex-direction:column;
  justify-content:space-between}

.apresenta{display:flex;align-items:center;gap:14px;justify-content:center}
.apresenta .marca{font-family:Cinzel,Georgia,serif;font-weight:800;font-size:44px;letter-spacing:.02em}
.apresenta .ap{font-size:21px;font-weight:800;letter-spacing:.3em;color:#8e94a8;text-transform:uppercase}

h1{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:96px;line-height:1.02;
  text-align:center;margin:0;letter-spacing:-.01em}
h1 em{display:block;font-style:normal;color:${GOLD};font-size:76px;margin-top:6px;white-space:nowrap}
.linha{text-align:center;font-size:35px;color:#aab0c2;margin-top:20px;letter-spacing:.01em}

/* A FILA DE PÔSTERES, como a prateleira de uma plataforma de streaming. */
/* CARTÃO DEITADO, não pôster em pé. A foto do carro é larga: recortada em 2:3
   ela vira um detalhe de para-lama, e o vendedor não reconhece o carro que
   vende. Deitado, cabe o carro inteiro — e é também o formato que as
   plataformas de streaming usam nas fileiras. */
.fila{display:flex;justify-content:center;align-items:center;gap:10px}
.pos{width:192px;height:136px;border-radius:13px;overflow:hidden;position:relative;
  box-shadow:0 16px 34px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.09)}
.pos:nth-child(1),.pos:nth-child(5){opacity:.74}
.pos:nth-child(2),.pos:nth-child(4){opacity:.9}
.pos img{width:100%;height:100%;object-fit:cover}
/* SEM ETIQUETA NO CARTÃO. A 400px de largura, que é como a peça chega no
   WhatsApp, o nome do carro vira um borrão de 5 pixels — ruído, não
   informação. E o time reconhece os próprios carros sem legenda. */

.promessa{display:flex;flex-direction:column;gap:22px}
.it{display:flex;align-items:flex-start;gap:20px;font-size:37px;line-height:1.32}
.it i{flex:none;width:15px;height:15px;margin-top:14px;border-radius:50%;background:${GOLD};font-style:normal}
.it b{font-weight:800}

/* O PRIMEIRO EPISÓDIO, com nome e tudo.
   Sem ele a peça prometia uma série e não mostrava nada dela — e metade da arte
   ficava vazia. Dizer o nome do episódio 1 é o que transforma "vem aí" em
   "começa assim". */
.ep1{border-left:3px solid ${GOLD};padding:4px 0 4px 22px}
.ep1-k{font-size:21px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${GOLD}}
.ep1-t{font-family:Cinzel,Georgia,serif;font-weight:800;font-size:54px;margin-top:12px;line-height:1.1}
.ep1-d{font-size:20px;color:#aab0c2;margin-top:10px;line-height:1.45;max-width:720px}

.rodape{border-top:1px solid rgba(255,255,255,.13);padding-top:26px;
  display:flex;align-items:flex-end;justify-content:space-between}
.estreia .k{font-size:21px;font-weight:800;letter-spacing:.2em;color:#8e94a8;text-transform:uppercase}
.estreia .v{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:${DATA ? 58 : 66}px;color:${GOLD};margin-top:10px;line-height:1}
.premio{text-align:right;max-width:430px}
.premio .k{font-size:21px;font-weight:800;letter-spacing:.2em;color:#8e94a8;text-transform:uppercase}
.premio .v{font-size:37px;font-weight:800;margin-top:10px;line-height:1.22}
.premio .v span{color:${GOLD}}
</style>
<div class="luz"></div>
<div class="pg">
  <div class="apresenta"><span class="marca">ELEVA</span><span class="ap">apresenta</span></div>

  <div><h1>Temporada<em>Omoda &amp; Jaecoo</em></h1>
  <p class="linha">Tudo o que você precisa saber para vender, episódio por episódio.</p></div>

  <div class="fila">
    ${CARROS.map(([f]) => `<div class="pos"><img src="${b64(f)}"></div>`).join('')}
  </div>

  <div class="promessa">
    <div class="it"><i></i><span><b>Episódio novo toda terça e quinta</b>, no app</span></div>
    <div class="it"><i></i><span><b>3 perguntas</b> no fim de cada carro · acertou as 3, +30 pontos</span></div>
  </div>

  <div class="ep1">
    <div class="ep1-k">Episódio 1</div>
    <div class="ep1-t">“É chinês, né?”</div>
  </div>

  <div class="rodape">
    <div class="estreia">
      <div class="k">Estreia</div>
      <div class="v">${DATA || 'em breve'}</div>
    </div>
    <div class="premio">
      <div class="k">Prêmio do mês</div>
      <!-- CURTO, e igual ao da arte de episódio. Com a letra no tamanho que se
           lê no celular, "para quem liderar o ranking" quebrava em três linhas
           e empurrava o bloco inteiro. Esse detalhe cabe na legenda do
           WhatsApp, não na arte. -->
      <div class="v"><span>R$ 500</span> em combustível</div>
    </div>
  </div>
</div>`;

const arq = '/tmp/temporada.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: L, height: A, deviceScaleFactor: 1, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 3200));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('arte:', SAIDA);
