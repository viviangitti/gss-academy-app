// O FUNIL DO ELEVA — visão de growth, em uma imagem.
//
// A primeira versão desta peça era uma lista de KPIs, e a Vivian disse que
// tinha texto demais. Lista não mostra onde vaza; funil mostra.
//
// Os quatro degraus são ANINHADOS de verdade — cada um é subconjunto do
// anterior, conferido pessoa a pessoa, não três contagens soltas coladas em
// forma de funil. Sem isso, a porcentagem engana: "levaram pro cliente" (28)
// é maior que "estudaram" (25), porque tem gente que usa o app na frente do
// cliente sem nunca ter feito um quiz.
//
// O último degrau é tracejado de propósito: o app registra treze tipos de
// evento e nenhum deles é uma venda. Desenhar esse degrau cheio seria mentir.
//
// Uso: node scripts/kpis/funil.mjs [saida.png]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';
import { populacao } from '../uso-eleva.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-funil.png`;
const NOITE = '#07070f';
const GOLD = '#c9a84c';
const L = 1080, A = 1350;

const { pessoas } = await populacao();
const N = pessoas.length;
const levouAoCliente = (p) => p.eventos.some(
  (e) => (/onepage/.test(e.type) && /cliente/.test(String(e.id))) || e.type === 'jornada_onepage' || e.type === 'jornada_script',
);
const virouHabito = (p) => new Set(p.eventos.map((e) => e.at.toISOString().slice(0, 10))).size >= 4;

const abriu = pessoas.filter((p) => p.eventos.length);
const cliente = abriu.filter(levouAoCliente);
const habito = cliente.filter(virouHabito);

const DEGRAUS = [
  [N, 'Têm conta', 0],
  [abriu.length, 'Abriram conteúdo', N - abriu.length],
  [cliente.length, 'Usaram no cliente', abriu.length - cliente.length],
  [habito.length, 'Viraram hábito', cliente.length - habito.length],
];
const pct = (x) => Math.round((x / N) * 100);
// A maior queda é onde está o trabalho. Hoje é a última, e por isso a peça a
// marca: 12 pessoas levaram o app para a frente do cliente e não voltaram.
const maior = DEGRAUS.slice(1).reduce((m, d) => (d[2] > m[2] ? d : m));

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${L}px;height:${A}px;background:${NOITE};color:#f4f3f0;
  font-family:Inter,-apple-system,Arial,sans-serif;overflow:hidden;position:relative}
.luz{position:absolute;left:50%;top:-34%;transform:translateX(-50%);width:150%;height:82%;
  border-radius:50%;background:radial-gradient(closest-side,rgba(201,168,76,.16),rgba(201,168,76,0) 70%)}
.pg{position:relative;height:100%;padding:72px 64px 58px;display:flex;flex-direction:column}

.marca{text-align:center;font-family:Cinzel,Georgia,serif;font-weight:800;font-size:28px;
  letter-spacing:.24em;color:#8e94a8}
h1{text-align:center;font-family:Cinzel,Georgia,serif;font-weight:900;font-size:78px;
  line-height:1;margin-top:18px}
h1 em{display:block;font-style:normal;color:${GOLD};font-size:38px;margin-top:14px;font-family:Inter,Arial,sans-serif;font-weight:700;letter-spacing:0}

.funil{flex:1;display:flex;flex-direction:column;justify-content:space-evenly;gap:12px;margin:26px 0 18px}
.lin{display:flex;align-items:center;gap:22px}
.barra{height:122px;border-radius:16px;display:flex;align-items:center;padding:0 30px;gap:24px;
  background:linear-gradient(90deg,rgba(201,168,76,.30),rgba(201,168,76,.12));
  border:1px solid rgba(201,168,76,.38)}
.barra .n{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:56px;color:#fff;line-height:1}
.barra .t{display:block;font-size:31px;font-weight:800;line-height:1.1;white-space:nowrap}
.barra .p{display:block;font-size:24px;color:#c3c8d6;margin-top:5px}
.perda{font-size:30px;font-weight:800;color:#e0806f;white-space:nowrap}
.perda.forte{color:#ff6a4d;font-size:36px}

/* O DEGRAU QUE O APP NÃO VÊ. Tracejado porque não é medição, é a pergunta. */
.vazio{height:122px;border-radius:16px;display:flex;align-items:center;padding:0 30px;gap:24px;
  border:2px dashed rgba(255,255,255,.26);background:rgba(255,255,255,.025)}
.vazio .n{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:56px;color:#6e7488;line-height:1}
.vazio .t{display:block;font-size:31px;font-weight:800;color:#9aa0b2;line-height:1.1;white-space:nowrap}
.vazio .p{display:block;font-size:24px;color:#6e7488;margin-top:5px}

.pe{text-align:center;font-size:28px;color:#aab0c2;line-height:1.4;margin-top:4px}
.pe b{color:${GOLD};font-weight:800}
</style>
<div class="luz"></div>
<div class="pg">
  <div class="marca">ELEVA · GRUPO RAMASA</div>
  <h1>O funil<em>onde o Eleva ganha e perde gente</em></h1>

  <div class="funil">
    ${DEGRAUS.map(([v, t, perda], i) => `
    <div class="lin">
      <div class="barra" style="width:${Math.max(46, pct(v))}%">
        <span class="n">${v}</span>
        <span><span class="t">${t}</span><span class="p">${pct(v)}% dos ${N}</span></span>
      </div>
      ${perda ? `<span class="perda${DEGRAUS[i] === maior ? ' forte' : ''}">−${perda}</span>` : ''}
    </div>`).join('')}

    <div class="lin">
      <div class="vazio" style="width:46%">
        <span class="n">?</span>
        <span><span class="t">Venderam</span><span class="p">o app não enxerga</span></span>
      </div>
    </div>
  </div>

  <p class="pe">A maior queda é a última: <b>${maior[2]} pessoas</b> levaram o Eleva para a<br>
  frente do cliente e não voltaram. O degrau de baixo está na loja.</p>
</div>`;

const arq = '/tmp/funil.html';
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
console.log('funil:', SAIDA);
