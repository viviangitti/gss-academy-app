// A ARTE DOS KPIs — o que medir antes, durante e depois do Eleva.
//
// Para a Vivian mandar à Mariana e ao Cristiano. Existe porque a conversa
// "o Eleva faz vender mais?" não se responde com o que o app guarda: ele mede
// atividade e não enxerga venda nenhuma. Quem tem o número de venda é a
// Ramasa, e o "antes" expira — depois que a temporada subir, não dá para
// remontar a linha de base.
//
// Por isso a peça começa pelo ANTES e não pelos indicadores bonitos do app:
// é o único bloco com prazo.
//
// SEM VALOR EM DINHEIRO NA PEÇA. Ela vai para o cliente, e a regra da casa é
// que preço não entra em material que circula. "Ticket médio" aqui é nome de
// indicador, não número.
//
// Uso: node scripts/kpis/arte.mjs [saida.png]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-kpis.png`;
const NOITE = '#07070f';
const GOLD = '#c9a84c';
const L = 1080, A = 1350;

// Ícones lucide em SVG — nunca emoji. Emoji muda de desenho em cada aparelho
// e no Android alguns viram quadrado vazio.
const ico = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="${GOLD}" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const FLAG = ico('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>');
const PULSO = ico('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>');
const SOBE = ico('<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>');

const BLOCOS = [
  [FLAG, 'Antes', 'congelar agora', '#c9a84c', [
    'Carros vendidos <b>por vendedor</b>, últimos 3 meses',
    'Conversão: <b>atendimento → venda</b>',
    '<b>Taxa de anexação</b>: % dos carros que saem com acessório',
    'Mix por modelo, com o <b>Jaecoo 5</b> à parte',
  ]],
  [PULSO, 'Durante', 'o app entrega sozinho', '#6f9cf5', [
    'Quem abre <b>conteúdo</b> — não só quem abre o app',
    '<b>One-page mandado pro cliente</b>: a ação mais perto da venda',
    '<b>Qual objeção</b> o time consultou, carro por carro',
    'Quizzes aprovados e acessórios abertos',
  ]],
  [SOBE, 'Depois', 'os dois cruzados', '#7fbf9a', [
    '<b>Anexação de acessório</b>, antes × depois, por vendedor',
    '<b>Jaecoo 5</b>: quem estudou × quem não estudou',
    'Cada vendedor <b>contra ele mesmo</b>, não contra o colega',
  ]],
];

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${L}px;height:${A}px;background:${NOITE};color:#f4f3f0;
  font-family:Inter,-apple-system,Arial,sans-serif;overflow:hidden;position:relative}
.luz{position:absolute;left:50%;top:-32%;transform:translateX(-50%);width:150%;height:80%;
  border-radius:50%;background:radial-gradient(closest-side,rgba(201,168,76,.16),rgba(201,168,76,0) 70%)}
.pg{position:relative;height:100%;padding:60px 56px 48px;display:flex;flex-direction:column}

.topo{text-align:center;margin-bottom:32px}
.marca{font-family:Cinzel,Georgia,serif;font-weight:800;font-size:30px;letter-spacing:.22em;color:#8e94a8}
h1{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:70px;line-height:1.02;margin-top:14px}
h1 em{display:block;font-style:normal;color:${GOLD};font-size:46px;margin-top:8px;white-space:nowrap}
.sub{font-size:27px;color:#aab0c2;margin-top:16px;line-height:1.38}

.blocos{display:flex;flex-direction:column;gap:22px;flex:1}
.bl{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);
  border-radius:22px;padding:22px 28px 20px}
.cab{display:flex;align-items:center;gap:14px;margin-bottom:15px}
.cab svg{width:34px;height:34px;flex:none}
.cab .q{font-family:Cinzel,Georgia,serif;font-weight:800;font-size:36px;letter-spacing:.01em}
.cab .quando{font-size:23px;color:#8e94a8;margin-left:auto;text-align:right;white-space:nowrap}
.it{display:flex;align-items:flex-start;gap:14px;font-size:26px;line-height:1.36;margin-top:9px;color:#dcdfe8}
.it:first-of-type{margin-top:0}
.it i{flex:none;width:9px;height:9px;margin-top:11px;border-radius:50%;font-style:normal}
.it b{font-weight:800;color:#fff}

.pe{margin-top:26px;text-align:center;font-size:25px;color:#8e94a8;line-height:1.42}
.pe b{color:${GOLD};font-weight:800}
</style>
<div class="luz"></div>
<div class="pg">
  <div class="topo">
    <div class="marca">ELEVA · GRUPO RAMASA</div>
    <h1>O que medir<em>antes, durante e depois</em></h1>
    <p class="sub">O app mede o que o time estuda. O número da venda está na loja.<br>Os dois juntos é que respondem se valeu.</p>
  </div>

  <div class="blocos">
    ${BLOCOS.map(([svg, q, quando, cor, itens]) => `
    <div class="bl">
      <div class="cab">${svg}<span class="q">${q}</span><span class="quando">${quando}</span></div>
      ${itens.map((t) => `<div class="it"><i style="background:${cor}"></i><span>${t}</span></div>`).join('')}
    </div>`).join('')}
  </div>

  <p class="pe">A chave que liga os dois é o <b>e-mail do vendedor</b> —<br>é o mesmo que já identifica cada um dentro do Eleva.</p>
</div>`;

const arq = '/tmp/kpis.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: L, height: A, deviceScaleFactor: 2, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 2200));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('kpis:', SAIDA);
