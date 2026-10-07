// O LOGO DO ELEVA EM PNG, para foto de perfil do WhatsApp.
//
// Os ícones que já existiam (public/icon-512.png) têm cantos arredondados e a
// GSS maior que o Eleva: viram para dentro do app, onde a moldura é quadrada e
// quem olha já sabe de quem é. No WhatsApp o recorte é CÍRCULO — os cantos
// somem e a marca tem que caber dentro dele, com folga.
//
// Então: fundo sangrando até a borda, a marca centrada num círculo de segurança,
// e o Eleva na frente. As cores e a fonte são as do app (Cinzel, navy #0f0f1e,
// dourado #c9a84c), buscadas do mesmo Google Fonts que o index.html usa.
//
// Uso: node scripts/logo/eleva.mjs <saida.png> [tamanho]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-logo.png`;
const LADO = Number(process.argv[3]) || 1000;

const NOITE = '#0f0f1e';
const OURO = '#c9a84c';

const html = `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${LADO}px;height:${LADO}px;background:${NOITE};
  display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
/* SEM O CÍRCULO DOURADO DO CANTO.
   Ele é bonito nas peças grandes, mas aqui a arte vive a 48 pixels na lista de
   conversas: naquele tamanho ele não lê como brilho, lê como borrão. Fundo
   limpo é o que deixa a palavra ganhar. */
.marca{position:relative;display:flex;align-items:flex-start;gap:${LADO * 0.018}px}
.nome{font-family:'Cinzel',Georgia,serif;font-weight:800;color:#f4f3f0;
  font-size:${LADO * 0.152}px;line-height:1;letter-spacing:.012em}
/* A seta é a mesma do cabeçalho do app (lucide arrow-up-right), em dourado. */
/* A seta acompanha o topo das maiúsculas, como no cabeçalho do app. */
.seta{margin-top:${LADO * 0.016}px}
</style>
<div class="marca">
  <span class="nome">ELEVA</span>
  <svg class="seta" width="${LADO * 0.081}" height="${LADO * 0.081}" viewBox="0 0 24 24"
       fill="none" stroke="${OURO}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
  </svg>
</div>`;

const arq = '/tmp/eleva-logo.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: LADO, height: LADO, deviceScaleFactor: 1, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
// a fonte vem do Google: dá tempo de baixar antes do clique
await new Promise((r) => setTimeout(r, 3000));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('logo:', SAIDA, `(${LADO}×${LADO})`);
