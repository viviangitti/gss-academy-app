// A FOLHA DAS REGRAS DO RANKING — uma página, para colar no mural.
//
// Quem lê é o vendedor, não a gerência: por isso número grande, frase curta e
// o "por quê" ao lado de cada regra. Regra de pontuação que ninguém entende
// vira boato na loja ("dizem que vale mais se fizer de novo").
//
// Uso: node scripts/ranking-pdf/gera.mjs <saida.pdf>
import fs from 'fs';
import { icone } from '../deck-ramasa/icone.mjs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/ELEVA - como pontua o ranking.pdf`;
const ic = (n, cor, t = 20) => icone(n, { tamanho: t, cor, traco: 2.1 });
const GOLD = '#c9a84c';

const VALE = [
  ['circle-play', '10', 'pontos', 'Assistir o vídeo de um carro',
   'Uma vez por carro. Rever o mesmo carro não soma de novo — rever é bom, mas não é aprender de novo.'],
  ['graduation-cap', '30', 'pontos', 'Acertar o quiz do carro',
   'E volta a valer quando a marca atualiza a ficha daquele carro. Conteúdo novo, ponto novo.'],
  ['briefcase', '2', 'pontos', 'Usar o app no atendimento',
   'Consultar objeção, abrir documento, copiar o script da jornada, mandar o one-page ou abrir acessório. Até 10 pontos por dia.'],
];

const NAO = [
  ['Rever o mesmo carro', 'Continua valendo para a ofensiva e para a missão do mês — só não dá ponto duas vezes.'],
  ['Passar do teto do dia', 'Depois de 10 pontos de atendimento, consultar mais não rende mais. É o que impede o placar de premiar quem consulta porque não sabe.'],
  ['Começar ou errar o quiz', 'Só o acerto pontua. Tentar quantas vezes quiser não custa nada.'],
];

const html = `<!doctype html><meta charset="utf-8">
<style>
@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}
body{font:11px/1.5 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#16181d;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:15mm 16mm;display:flex;flex-direction:column}
.capa{background:#0f0f1e;color:#f2f1ee;margin:-15mm -16mm 9mm;padding:14mm 16mm 12mm}
.k{font:800 10px sans-serif;letter-spacing:.18em;color:${GOLD};text-transform:uppercase}
h1{font:800 31px/1.12 Georgia,serif;margin:9px 0 7px;letter-spacing:-.4px}
.sub{font:400 13px sans-serif;color:#c3c6d4;max-width:150mm}
h2{font:800 10px sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a8f9e;margin:0 0 8px}
.linha{display:flex;gap:13px;align-items:flex-start;padding:13px 0;border-top:1px solid #e9ebf1}
.linha:first-of-type{border-top:0}
.ico{width:40px;height:40px;border-radius:12px;background:#faf4e2;display:grid;place-items:center;flex:none}
.num{flex:none;width:74px;text-align:right}
.num b{display:block;font:800 30px Georgia,serif;color:#0f0f1e;line-height:1}
.num i{font-style:normal;font:700 9.5px sans-serif;color:#8a8f9e;letter-spacing:.06em;text-transform:uppercase}
.txt b{display:block;font:800 14px sans-serif;margin-bottom:2px}
.txt span{color:#5b6070;font-size:11px}
.nao{background:#f6f7fa;border-radius:13px;padding:13px 15px;margin-top:4px}
.nao div{padding:7px 0;border-top:1px solid #e6e8ef}
.nao div:first-of-type{border-top:0}
.nao b{font:800 12px sans-serif}
.nao span{color:#5b6070;font-size:10.5px}
.mes{display:flex;gap:9px;margin-top:11px}
.mes div{flex:1;background:#0f0f1e;color:#e9e9f2;border-radius:13px;padding:12px 13px}
.mes b{display:block;color:${GOLD};font:800 10px sans-serif;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}
.mes span{font-size:11px;line-height:1.45}
.rod{margin-top:auto;padding-top:9mm;border-top:1px solid #e9ebf1;display:flex;justify-content:space-between;color:#8a8f9e;font-size:9.5px}
</style>
<div class="pg">
  <div class="capa">
    <div class="k">Eleva · Grupo Ramasa</div>
    <h1>Como pontua o ranking</h1>
    <p class="sub">O placar zera todo dia 1º e vale por marca. Quem está na frente é quem aprendeu o que é novo e usou o app com cliente — não quem abriu o mesmo vídeo mais vezes.</p>
  </div>

  <h2>O que vale ponto</h2>
  ${VALE.map(([i, n, u, t, d]) => `
  <div class="linha">
    <span class="ico">${ic(i, GOLD, 21)}</span>
    <span class="num"><b>${n}</b><i>${u}</i></span>
    <span class="txt"><b>${t}</b><span>${d}</span></span>
  </div>`).join('')}

  <h2 style="margin-top:13px">O que não vale — e por quê</h2>
  <div class="nao">
    ${NAO.map(([t, d]) => `<div><b>${t}</b><br><span>${d}</span></div>`).join('')}
  </div>

  <div class="mes">
    <div><b>Como o mês renova</b><span>Carta nova, carro novo e ficha atualizada reabrem o quiz daquele carro. Todo mês tem conteúdo novo para pontuar — ninguém chega no dia 1º com a corrida ganha.</span></div>
    <div><b>Por que tem teto</b><span>Sem teto, quem atende mal e consulta vinte vezes passaria na frente de quem estudou e já sabe responder. O teto faz o placar premiar preparo, não insegurança.</span></div>
  </div>

  <div class="rod"><span>Eleva · Grupo Ramasa · Jaecoo e Omoda</span><span>Regras válidas a partir de outubro de 2026</span></div>
</div>`;

const arq = '/tmp/ranking-regras.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 1400));
const { data } = await c.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('pdf:', SAIDA);
