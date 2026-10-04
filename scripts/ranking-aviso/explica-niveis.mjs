// A RESPOSTA PARA A SILENE — e a proposta do quiz por nível, no mesmo documento.
//
// A Silene perguntou se o ponto de atendimento não gera ruído: o Walther atende
// cem clientes e manda cem fichas; o colega não recebeu nenhum cliente de
// Jaecoo 5 e não mandou aquela ficha. Ela está certa, e o número prova — mas o
// remédio não é tirar o ponto do atendimento: é levantar o teto do estudo, que
// hoje é baixo porque o app entrega cinco níveis de graça.
//
// Por isso as duas coisas estão no mesmo PDF: a pergunta dela e a proposta são
// o mesmo assunto.
//
// Uso: IMGS=<json com os recortes> node scripts/ranking-aviso/explica-niveis.mjs <saida.pdf>
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/ELEVA - a pergunta da Silene.pdf`;
const IMGS = JSON.parse(fs.readFileSync(process.env.IMGS, 'utf8'));
const NOITE = '#0f0f1e';
const GOLD = '#c9a84c';
// As duas séries. Validadas com scripts/validate_palette.js do dataviz contra
// superfície clara: passam em faixa de luminosidade, croma, separação para
// daltonismo (ΔE 31 protan) e contraste — sem avisos.
const AZUL = '#2563eb';   // estudo
const OURO = '#a8842f';   // atendimento

// Setembro inteiro, recalculado com as regras de hoje (2 por ação, teto 10/dia).
const GENTE = [
  { n: 'Matheus Duarte', e: 200, t: 110 },
  { n: 'Lehander', e: 200, t: 52 },
  { n: 'Kleber', e: 200, t: 46 },
  { n: 'Welington', e: 200, t: 42 },
];
const MAIOR = 320;

/** Barra empilhada: estudo + atendimento, com rótulo direto em cada parte. */
const barra = (e, t) => `
  <div class="bar">
    <span class="seg" style="width:${(e / MAIOR) * 100}%;background:${AZUL}">${e}</span>
    <span class="seg gap" style="width:${(t / MAIOR) * 100}%;background:${OURO}">${t}</span>
    <span class="tot">${e + t}</span>
  </div>`;

/** Barra simples, para os tetos. */
const teto = (v, max, cor, rot) => `
  <div class="tl">
    <span class="tl-k">${rot}</span>
    <span class="tl-b"><i style="width:${(v / max) * 100}%;background:${cor}"></i></span>
    <span class="tl-v">${v}</span>
  </div>`;

const CARROS = [
  ['Jaecoo 5 SHS-H', 7, 40, 100], ['Jaecoo 7 SHS-P', 6, 40, 90], ['Omoda 5 SHS-H', 6, 40, 90],
  ['Omoda E5', 6, 40, 90], ['Omoda 7 SHS-P', 6, 40, 90],
];

const html = `<!doctype html><meta charset="utf-8">
<style>
@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}
body{font:11px/1.55 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#16181d;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:15mm 17mm 13mm;page-break-after:always;display:flex;flex-direction:column}
.pg:last-child{page-break-after:auto}
.capa{background:${NOITE};color:#f2f1ee;margin:-15mm -17mm 9mm;padding:14mm 17mm 12mm}
.k{font:800 10px sans-serif;letter-spacing:.2em;color:${GOLD};text-transform:uppercase}
h1{font:800 32px/1.12 Georgia,serif;margin:10px 0 8px;letter-spacing:-.6px}
.sub{font-size:13px;line-height:1.5;color:#c6c9d6;max-width:152mm}
h2{font:800 20px Georgia,serif;margin:0 0 5px;letter-spacing:-.3px}
.ld{font-size:12.5px;line-height:1.55;color:#5b6070;margin-bottom:11px;max-width:162mm}
.et{font:800 9.5px sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#9aa0b0;margin:16px 0 9px}
img{width:100%;display:block;border:1.2px solid #e3e7ec;border-radius:9px}
.leg{font-size:10px;color:#8a8f9e;margin-top:5px;text-align:center}

/* ---- gráfico ---- */
.legenda{display:flex;gap:16px;font-size:10.5px;color:#5b6070;margin-bottom:11px}
.legenda i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.linha{display:flex;align-items:center;gap:11px;margin-bottom:9px}
.nome{width:30mm;flex:none;font-size:11.5px;font-weight:700;text-align:right}
.bar{flex:1;display:flex;align-items:center}
.seg{height:17px;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;
  font-size:9.5px;font-weight:800;color:#fff}
.seg:first-child{border-radius:4px 0 0 4px}
.seg.gap{border-radius:0 4px 4px 0;box-shadow:-2px 0 0 #fff}
.tot{margin-left:9px;font-size:12px;font-weight:800;color:#16181d}

.tl{display:flex;align-items:center;gap:11px;margin-bottom:9px}
.tl-k{width:46mm;flex:none;font-size:11.5px;font-weight:700;text-align:right}
.tl-b{flex:1;height:17px;background:#f1f3f7;border-radius:4px;overflow:hidden}
.tl-b i{display:block;height:100%;border-radius:4px}
.tl-v{width:12mm;font-size:13px;font-weight:800;text-align:right}

.cx{margin-top:13px;background:#f6f7fa;border-radius:13px;padding:13px 15px;font-size:12.5px;line-height:1.55}
.cx b{color:#16181d}
.cx.ouro{background:linear-gradient(180deg,#fdf7e8,#fbf1d9);border:1.5px solid #e4cf92;color:#4d3c0c}
.cx.fala{background:#fff;border-left:3px solid ${GOLD};border-radius:0;padding:4px 0 4px 15px;
  font-size:13px;font-style:italic;color:#3d434f}

.par{display:flex;gap:11px;margin-top:10px}
.p{flex:1;border:1.6px solid #e3e7ec;border-radius:14px;padding:14px}
.p.mau{border-color:#e9d6d3;background:#fdf6f5}
.p.bom{border-color:#e4cf92;background:linear-gradient(180deg,#fdf7e8,#fff)}
.p .q{font-size:12.5px;font-weight:800;margin-bottom:3px}
.p .o{font-size:10.5px;color:#6b7183;margin-bottom:10px;min-height:26px}
.p .n{font:800 36px/1 Georgia,serif;letter-spacing:-1.4px}
.p .n small{font:800 9.5px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9aa0b0;margin-left:6px}
.p .tag{display:inline-block;margin-top:8px;padding:4px 9px;border-radius:99px;font-size:10px;font-weight:800}
.p.mau .tag{background:#fbe3e1;color:#c0483c} .p.bom .tag{background:#faeecd;color:#8a6a16}

table{width:100%;border-collapse:collapse;margin-top:9px;font-size:12px}
th{font:800 9px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9aa0b0;text-align:right;padding-bottom:7px}
th:first-child{text-align:left}
td{padding:8px 0;border-top:1px solid #eceff3;text-align:right}
td:first-child{text-align:left;font-weight:700}
td.v{color:#9aa0b0} td.n{color:#8a6a16;font-weight:800}
tr.t td{border-top:1.6px solid #d7dce3;font-weight:800;font-size:13.5px;padding-top:11px}
.rod{margin-top:auto;padding-top:7mm;border-top:1px solid #e9ebf1;font-size:9.5px;color:#9aa0b0;display:flex;justify-content:space-between}
</style>

<div class="pg">
  <div class="capa">
    <div class="k">Eleva · Grupo Ramasa</div>
    <h1>A pergunta da Silene, respondida</h1>
    <p class="sub">“O Walther atendeu cem clientes e mandou todas as fichas. O outro não atendeu nenhum cliente de Jaecoo 5, então não mandou aquela ficha — e por isso ganha menos ponto. Isso pode gerar ruído.”</p>
  </div>

  <h2>Ela está certa. E dá pra ver o tamanho</h2>
  <p class="ld">Recalculei <b>setembro inteiro</b> com as regras de hoje. Estas quatro pessoas estudaram
  exatamente a mesma coisa — as quatro chegaram no teto do estudo, 200 pontos. Olhe onde terminaram.</p>

  <div class="legenda">
    <span><i style="background:${AZUL}"></i>Estudo — vídeo e quiz</span>
    <span><i style="background:${OURO}"></i>Atendimento — usar o app com cliente</span>
  </div>
  ${GENTE.map((g) => `<div class="linha"><span class="nome">${g.n}</span>${barra(g.e, g.t)}</div>`).join('')}

  <div class="cx">
    <b>O estudo das quatro é idêntico.</b> A diferença de 68 pontos entre a primeira e a última é
    só quantos clientes entraram na loja naquele mês — e isso não é mérito de ninguém. É exatamente
    o ruído que a Silene descreveu.
  </div>

  <div class="et">Na marca inteira, setembro</div>
  ${teto(2010, 2700, AZUL, 'Estudo')}
  ${teto(652, 2700, OURO, 'Atendimento')}
  <p class="leg" style="text-align:left;margin-top:2px">O atendimento é 24% do placar — não domina hoje, mas o teto dele é que preocupa (próxima página).</p>

  <div class="rod"><span>Eleva · Grupo Ramasa · 04/10/2026</span><span>1 de 3</span></div>
</div>

<div class="pg">
  <h2>O problema de fundo: o teto errado é o maior</h2>
  <p class="ld">Estudo tem fim: são cinco carros, 40 pontos cada. Atendimento não tem — são 10 por dia,
  todo dia, enquanto houver cliente.</p>

  <div class="et">Quanto dá pra ganhar num mês, no máximo</div>
  ${teto(200, 300, AZUL, 'Estudando tudo')}
  ${teto(260, 300, OURO, 'Atendendo todo dia')}

  <div class="cx">
    <b>O teto do que a pessoa não controla é maior que o teto do que ela controla.</b>
    Num mês cheio, quem atende muito passa quem estudou tudo. Mexer no ponto do atendimento
    resolveria pela metade — o certo é entender <b>por que o estudo acaba tão rápido</b>.
  </div>

  <h2 style="margin-top:16px">Porque o app dá cinco níveis de graça</h2>
  <p class="ld">Cada carro tem seis vídeos — as abas no topo da tela. Nascem trancados.</p>
  <img src="${IMGS.trancado}" alt="Níveis trancados">
  <p class="leg">Antes do quiz: o nível 1 aberto, os outros com cadeado</p>
  <img src="${IMGS.aberto}" alt="Níveis abertos" style="margin-top:9px">
  <p class="leg">Depois de acertar três perguntas sobre o nível 1: os seis abertos de uma vez</p>

  <div class="cx">
    A partir daqui a pessoa pode fechar o app e <b>nunca assistir os outros cinco</b>. Já tem o selo
    e já ganhou os 40 pontos do carro — e quem assistiu os seis ganhou os mesmos 40.
  </div>

  <div class="rod"><span>Eleva · Grupo Ramasa · 04/10/2026</span><span>2 de 3</span></div>
</div>

<div class="pg">
  <h2>A resposta: levantar o teto do estudo</h2>
  <p class="ld">Cada nível ganha a sua própria pergunta. Acertou a do 2, abre o 3. A pessoa passa
  pelos seis de verdade, e cada pergunta acertada vale 10 pontos — o mesmo que uma pergunta
  vale hoje (o quiz do carro são 30 por 3).</p>

  <div class="par">
    <div class="p">
      <div class="q">Assistiu só o nível 1</div>
      <div class="o">Não acerta a pergunta, não abre o 2</div>
      <div class="n">40<small>pontos</small></div>
    </div>
    <div class="p bom">
      <div class="q">Assistiu os seis</div>
      <div class="o">Cinco perguntas a mais, 10 pontos cada</div>
      <div class="n" style="color:#8a6a16">90<small>pontos</small></div>
      <span class="tag">+50 por ir até o fim</span>
    </div>
  </div>

  <div class="et">Os tetos, depois das três mudanças</div>
  ${teto(460, 500, AZUL, 'Estudando tudo')}
  ${teto(100, 500, OURO, 'Atendendo todo dia')}
  <p class="leg" style="text-align:left;margin-top:2px">O estudo passa a decidir o mês, e o atendimento vira bônus — que é o que a Silene pediu.</p>

  <div class="cx ouro">
    <b>São três mudanças, não uma:</b><br>
    <b>1.</b> uma pergunta por nível — o estudo vai de 200 para 460;<br>
    <b>2.</b> teto mensal de 100 no atendimento (hoje só existe o de 10 por dia);<br>
    <b>3.</b> <b>produto do mês</b> — a ideia da Silene: todo mês um carro em foco, igual para
    todo mundo, independente de qual cliente entrou na loja.
  </div>

  <div class="et">Carro por carro</div>
  <table>
    <tr><th>Carro</th><th>Níveis</th><th>Vale hoje</th><th>Passaria a valer</th></tr>
    ${CARROS.map(([n, nv, h, no]) => `<tr><td>${n}</td><td class="v">${nv}</td><td class="v">${h}</td><td class="n">${no}</td></tr>`).join('')}
    <tr class="t"><td>A marca inteira</td><td class="v">31</td><td class="v">200</td><td class="n">460</td></tr>
  </table>

  <div class="rod"><span>Eleva · Grupo Ramasa · 04/10/2026</span><span>3 de 3</span></div>
</div>`;

const arq = '/tmp/explica-niveis.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 2000));
const { data } = await c.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('pdf:', SAIDA);
