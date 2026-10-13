// OS ROTEIROS DE GRAVAÇÃO — agora com o Jaecoo 5.
//
// O documento enviado à Ramasa em 03/09 tinha quatro roteiros: Jaecoo 7,
// Omoda 5, Omoda E5 e Omoda 7. O Jaecoo 5 entrou na linha depois e ficou de
// fora — e hoje ele é o terceiro carro mais aberto do app, à frente de dois
// que têm roteiro. A Vivian pediu a atualização em 13/10/2026.
//
// O QUINTO ROTEIRO NÃO FOI INVENTADO. A dor do cliente é a objeção que o time
// mais consultou neste carro dentro do app — "e se a bateria acabar no meio do
// caminho?", procurada por 5 vendedores. Os números do argumento saem da ficha
// do próprio app. Escrever uma dor que ninguém relatou seria dar ao time uma
// resposta para uma pergunta que o cliente não faz.
//
// RESSALVA HONESTA, e ela está impressa na peça: os três pontos dos outros
// quatro carros vieram da pesquisa com 16 vendedores (192 respostas), feita
// antes de o Jaecoo 5 existir. Os do Jaecoo 5 são proposta minha, a partir dos
// benefícios da ficha — e aparecem marcados como "a confirmar com o time".
//
// Uso: node scripts/roteiros/gera.mjs [saida.pdf]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/Eleva-Ramasa-Roteiros-Veiculos.pdf`;
const R = JSON.parse(fs.readFileSync(new URL('./roteiros.json', import.meta.url), 'utf8'));
const NOITE = '#0f0f1e';
const GOLD = '#c9a84c';

const html = `<!doctype html><meta charset="utf-8">
<style>
@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}
body{font:11px/1.55 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#16181d;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:16mm 18mm 13mm;page-break-after:always;display:flex;flex-direction:column}
.pg:last-child{page-break-after:auto}
.capa{background:${NOITE};color:#f2f1ee;margin:-16mm -18mm 11mm;padding:16mm 18mm 13mm}
.k{font:800 10px sans-serif;letter-spacing:.2em;color:${GOLD};text-transform:uppercase}
h1{font:800 34px/1.1 Georgia,serif;margin:10px 0 9px;letter-spacing:-.6px}
.sub{font-size:13px;line-height:1.5;color:#c6c9d6;max-width:150mm}
.et{font:800 9.5px sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#9aa0b0;margin:15px 0 8px}

.tres{display:flex;gap:11px}
.tres div{flex:1;border:1.5px solid #e7eaf1;border-radius:13px;padding:12px 14px;font-size:11.5px;line-height:1.5;color:#5b6070}
.tres b{display:block;color:#16181d;font-size:12.5px;margin-bottom:4px}

h2{font:800 23px Georgia,serif;letter-spacing:-.3px}
.vsub{font-size:12px;color:#5b6070;line-height:1.5;margin-top:5px;max-width:150mm}
.dor{margin-top:13px;background:#f6f7fa;border-radius:12px;padding:12px 14px;font-size:12px;line-height:1.5;color:#5b6070}
.dor b{color:#16181d}
.fecha{margin-top:9px;font-size:12px;color:#16181d}
.fecha span{font:800 9.5px sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#9aa0b0;display:block;margin-bottom:4px}
.fecha em{font-style:normal;font-weight:800}
.prov{display:inline-block;margin-left:8px;font:700 10px sans-serif;color:#8a7a3e;background:#fdf7e8;
  border:1px solid #e4cf92;border-radius:999px;padding:2px 9px}

table{width:100%;border-collapse:collapse;margin-top:14px}
td{padding:11px 0;border-top:1px solid #eceff3;vertical-align:top}
td.t{width:24mm;font:800 12px sans-serif;color:${'#2563eb'}}
td.n{width:34mm;font:800 11px sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#16181d}
td.x{font-size:12px;line-height:1.6;color:#2a2f3a}
.rod{margin-top:auto;padding-top:7mm;border-top:1px solid #e9ebf1;font-size:9.5px;color:#9aa0b0;display:flex;justify-content:space-between}
</style>

<div class="pg">
  <div class="capa">
    <div class="k">Ramasa · Jaecoo e Omoda · Eleva</div>
    <h1>Roteiros de gravação</h1>
    <p class="sub">${R.length} vídeos de 45 segundos, um por modelo. Vertical, gravado no celular, no showroom, com o carro atrás.</p>
  </div>

  <div class="tres">
    <div><b>Enquadramento</b>Celular na vertical, o carro atrás de você e a frente dele aparecendo. Nada de zoom.</div>
    <div><b>Som</b>Grave longe da oficina. O áudio derruba mais vídeo do que a imagem.</div>
    <div><b>Corte</b>Uma tomada por batida. Errou, refaz só aquela — não o vídeo inteiro.</div>
  </div>

  <div class="et">Os modelos</div>
  <table>${R.map((v, i) => `<tr><td class="t">${i + 1} de ${R.length}</td><td class="x"><b>${v.nome}</b>${v.fechaProposto ? ' <span class="prov">roteiro novo</span>' : ''}</td></tr>`).join('')}</table>

  <div class="dor" style="margin-top:16px">
    Cada roteiro tem <b>cinco batidas com o tempo marcado</b>. O texto não é para decorar — é a ideia de
    cada trecho. A ordem dos argumentos segue a pesquisa com <b>16 vendedores, 192 respostas</b>.
    <br><br>
    O <b>Jaecoo 5 entrou depois dessa pesquisa</b>: a dor do cliente dele é a objeção que o time mais
    consultou no app (5 vendedores procuraram “e se a bateria acabar no meio do caminho?”), e os três
    pontos que fecham são proposta, para o time confirmar.
  </div>

  <div class="rod"><span>Eleva · Ramasa</span><span>capa</span></div>
</div>

${R.map((v, i) => `
<div class="pg">
  <div class="k" style="color:#9aa0b0">Roteiro ${i + 1} de ${R.length} · 45 segundos · vertical 9:16</div>
  <h2 style="margin-top:7px">${v.nome}</h2>
  ${v.sub ? `<p class="vsub">${v.sub}</p>` : ''}

  <div class="dor"><b>A dor do cliente.</b> ${v.dor}</div>
  <div class="fecha"><span>O que o time diz que fecha este carro</span><em>${v.fecha}</em>${v.fechaProposto ? '<span class="prov">a confirmar com o time</span>' : ''}</div>

  <table>${v.batidas.map(([t, n, x]) => `<tr><td class="t">${t}</td><td class="n">${n}</td><td class="x">${x}</td></tr>`).join('')}</table>

  <div class="rod"><span>Eleva · Ramasa — Jaecoo e Omoda</span><span>${i + 1} / ${R.length}</span></div>
</div>`).join('')}`;

const arq = '/tmp/roteiros.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 2000));
const { data } = await c.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('roteiros:', SAIDA);
