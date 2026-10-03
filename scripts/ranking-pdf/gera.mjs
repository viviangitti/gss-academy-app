// A FOLHA DAS REGRAS DO RANKING — uma página, para colar no mural.
//
// Quem lê é o vendedor, de pé, no corredor, com trinta segundos. Não é um
// documento: é um cartaz. Por isso o número é grande o suficiente para ser lido
// de longe, e a conta do dia aparece DESENHADA — uma barra que soma 60 pontos
// explica o teto melhor do que o parágrafo que explicava o teto.
//
// Regra de pontuação que ninguém entende vira boato na loja ("dizem que vale
// mais se fizer de novo") — e é exatamente o comportamento que a mudança de
// outubro tirou do placar.
//
// Uso: node scripts/ranking-pdf/gera.mjs <saida.pdf>
import fs from 'fs';
import { icone } from '../deck-ramasa/icone.mjs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/ELEVA - como pontua o ranking.pdf`;
const ic = (n, cor, t = 20) => icone(n, { tamanho: t, cor, traco: 2.2 });

const NOITE = '#0f0f1e';
const GOLD = '#c9a84c';
const AZUL = '#2b6ef5';

// As três que valem. A ordem é a do dia da pessoa: assiste, prova que aprendeu,
// usa com cliente.
const VALE = [
  { ic: 'circle-play', n: '10', t: 'Assistir o vídeo<br>de um carro',
    d: 'Uma vez por carro.', cor: AZUL, fundo: '#eaf1ff' },
  { ic: 'graduation-cap', n: '30', t: 'Acertar o quiz<br>do carro',
    d: 'O que mais vale no placar.', cor: GOLD, fundo: '#faf3e0' },
  { ic: 'briefcase', n: '2', t: 'Usar o app<br>no atendimento',
    d: 'Até 10 por dia.', cor: '#1f9d6b', fundo: '#e6f6ef' },
];

// A CONTA DO DIA, DESENHADA.
//
// O teto de 10 era a regra que mais gerava pergunta, e nenhuma frase resolvia.
// Numa barra ele se explica sozinho: a fatia do atendimento simplesmente para
// de crescer, e dá pra ver que ela é a menor das três.
const DIA = [
  { rot: '2 vídeos', pts: 20, cor: AZUL },
  { rot: '1 quiz', pts: 30, cor: GOLD },
  { rot: 'atendimento (teto)', pts: 10, cor: '#1f9d6b' },
];
const TOTAL = DIA.reduce((s, f) => s + f.pts, 0);

const NAO = [
  ['Rever o mesmo carro', 'Vale para a ofensiva e para a missão do mês — só não dá ponto duas vezes.'],
  ['Passar do teto do dia', 'Depois de 10 pontos de atendimento, consultar mais não rende mais.'],
  ['Começar ou errar o quiz', 'Só o acerto pontua. Tentar quantas vezes quiser não custa nada.'],
];

const html = `<!doctype html><meta charset="utf-8">
<style>
@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}
body{font:11px/1.5 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#16181d;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:0 15mm 15mm;display:flex;flex-direction:column}

.capa{background:${NOITE};color:#f2f1ee;margin:0 -15mm 9mm;padding:17mm 15mm 15mm;position:relative;overflow:hidden}
.capa::after{content:'';position:absolute;right:-26mm;top:-26mm;width:76mm;height:76mm;border-radius:50%;background:rgba(201,168,76,.11)}
.k{font:800 10px sans-serif;letter-spacing:.2em;color:${GOLD};text-transform:uppercase}
h1{font:800 41px/1.08 Georgia,serif;margin:12px 0 10px;letter-spacing:-.6px}
.sub{font:400 14.5px/1.5 sans-serif;color:#c6c9d6;max-width:140mm;position:relative}

h2{font:800 10.5px sans-serif;letter-spacing:.15em;text-transform:uppercase;color:#8a8f9e;margin:0 0 11px}

/* As três moedas: número enorme, uma linha de apoio, nada mais. */
.vale{display:flex;gap:11px}
.card{flex:1;border:1.4px solid #e7eaf1;border-radius:19px;padding:21px 15px 22px;text-align:center}
.selo{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;margin:0 auto 14px}
.card .n{font:800 66px/.86 Georgia,serif;letter-spacing:-2.5px}
.card .u{display:block;font:800 9px sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#9aa0b0;margin:7px 0 13px}
.card .t{display:block;font:800 15px/1.3 sans-serif;color:#16181d;margin-bottom:6px}
.card .d{display:block;font-size:11.5px;color:#6b7183}

/* A conta do dia. A barra é a explicação do teto. */
.dia{background:#f6f7fa;border-radius:19px;padding:20px 21px 21px;margin-top:5px}
.dia-topo{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:11px}
.dia-topo b{font:800 15px sans-serif}
.dia-topo i{font-style:normal;font:800 30px Georgia,serif;color:${NOITE}}
.dia-topo i small{font:800 9px sans-serif;letter-spacing:.14em;color:#9aa0b0;text-transform:uppercase;margin-left:5px}
.barra{display:flex;height:34px;border-radius:11px;overflow:hidden}
.barra span{display:grid;place-items:center;font:800 13px sans-serif;color:#fff}
.chaves{display:flex;margin-top:7px}
.chaves span{font-size:10.5px;color:#6b7183;display:flex;align-items:center;gap:5px}
.pt{width:8px;height:8px;border-radius:3px;flex:none}

/* O que não vale: três colunas, com o × dizendo o que o texto diria. */
.nao{display:flex;gap:11px;margin-top:5px}
.nao div{flex:1;background:#fff;border:1.4px solid #e7eaf1;border-radius:17px;padding:17px 16px 18px}
.x{width:25px;height:25px;border-radius:8px;background:#fbe3e1;color:#bf3b31;display:grid;place-items:center;font:800 15px sans-serif;margin-bottom:11px}
.nao b{display:block;font:800 13px sans-serif;margin-bottom:4px}
.nao span{color:#6b7183;font-size:11px;line-height:1.5}

.mes{display:flex;gap:11px;margin-top:14px}
.mes div{flex:1;background:${NOITE};color:#e9e9f2;border-radius:17px;padding:18px 19px}
.mes b{display:block;color:${GOLD};font:800 10px sans-serif;letter-spacing:.13em;text-transform:uppercase;margin-bottom:8px}
.mes span{font-size:11.5px;line-height:1.55}

.rod{margin-top:auto;padding-top:7mm;border-top:1px solid #e9ebf1;display:flex;justify-content:space-between;color:#9aa0b0;font-size:9.5px}
</style>
<div class="pg">
  <div class="capa">
    <div class="k">Eleva · Grupo Ramasa</div>
    <h1>Como pontua o ranking</h1>
    <p class="sub">O placar zera todo dia 1º e vale por marca. Na frente fica quem aprendeu o que é novo e usou o app com cliente — não quem abriu o mesmo vídeo mais vezes.</p>
  </div>

  <h2>O que vale ponto</h2>
  <div class="vale">
    ${VALE.map((v) => `
    <div class="card">
      <span class="selo" style="background:${v.fundo}">${ic(v.ic, v.cor, 23)}</span>
      <span class="n" style="color:${v.cor}">${v.n}</span>
      <span class="u">pontos</span>
      <span class="t">${v.t}</span>
      <span class="d">${v.d}</span>
    </div>`).join('')}
  </div>

  <h2 style="margin-top:17px">Um dia bom, na prática</h2>
  <div class="dia">
    <div class="dia-topo">
      <b>Dois carros estudados, um quiz acertado e o app usado no salão</b>
      <i>${TOTAL}<small>pontos</small></i>
    </div>
    <div class="barra">
      ${DIA.map((f) => `<span style="background:${f.cor};flex:${f.pts}">${f.pts}</span>`).join('')}
    </div>
    <div class="chaves">
      ${DIA.map((f) => `<span style="flex:${f.pts};justify-content:center"><i class="pt" style="background:${f.cor}"></i>${f.rot}</span>`).join('')}
    </div>
  </div>

  <h2 style="margin-top:17px">O que não vale — e por quê</h2>
  <div class="nao">
    ${NAO.map(([t, d]) => `<div><span class="x">&times;</span><b>${t}</b><span>${d}</span></div>`).join('')}
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
