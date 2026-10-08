// O REGULAMENTO DO RANKING — gerado do código, nunca escrito à mão.
//
// A Silene pediu um regulamento para mandar à Mariana. Regulamento que diz 30
// pontos enquanto o app dá 10 é pior do que regulamento nenhum, e é isso que
// acontece na primeira vez que alguém ajusta uma regra e esquece do documento.
// Então os números saem DAQUI: do mesmo arquivo que o app lê. Se um dia
// divergirem, é porque alguém mexeu no app — e o documento muda no mesmo commit.
//
// O que NÃO dá para gerar — o prêmio, quem disputa, o desempate — aparece numa
// seção própria, marcada como pendente. Fingir que está decidido seria o pior
// dos dois mundos: um documento oficial com um buraco escondido.
//
// Uso: node scripts/regulamento/gera.mjs <saida.pdf>
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/ELEVA - regulamento do ranking.pdf`;
const NOITE = '#0f0f1e';
const GOLD = '#c9a84c';

/** Lê uma constante exportada direto do fonte. Se sumir, o script quebra — de
 *  propósito: melhor falhar aqui do que publicar um número inventado. */
function daFonte(arquivo, nome) {
  const txt = fs.readFileSync(new URL(arquivo, import.meta.url), 'utf8');
  const m = txt.match(new RegExp(`export const ${nome}\\s*=\\s*(\\d+)`));
  if (!m) throw new Error(`não achei ${nome} em ${arquivo}`);
  return Number(m[1]);
}
const T = '../../src/pilulas/data/tracking.ts';
const D = '../../src/pilulas/data/desafioSemanal.ts';
const V = {
  pilula: daFonte(T, 'POINTS_PER_PILL'),
  quiz: daFonte(T, 'POINTS_PER_QUIZ'),
  trabalho: daFonte(T, 'POINTS_PER_WORK'),
  tetoDia: daFonte(T, 'WORK_DAILY_CAP'),
  missao: daFonte(T, 'WEEKLY_GOAL'),
  pSemana: daFonte(D, 'PONTOS_SEMANA'),
  pMes: daFonte(D, 'PONTOS_MES'),
  qSemana: daFonte(D, 'PERGUNTAS_SEMANA'),
  qMes: daFonte(D, 'PERGUNTAS_MES'),
  aSemana: daFonte(D, 'ACERTOS_SEMANA'),
  aMes: daFonte(D, 'ACERTOS_MES'),
};
const hoje = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());

const VALE = [
  { n: V.pilula, t: 'Assistir o vídeo de um carro', d: 'Uma vez por carro. Rever não soma de novo — rever é bom, mas não é aprender de novo.', cor: '#2563eb' },
  { n: V.quiz, t: 'Acertar o quiz do carro', d: 'O que mais vale. Volta a valer quando a marca atualiza a ficha daquele carro.', cor: '#a8842f' },
  { n: V.trabalho, t: 'Usar o app no atendimento', d: `Consultar objeção, abrir documento, copiar o script da jornada, mandar o one-page ou abrir acessório. Até ${V.tetoDia} pontos por dia.`, cor: '#1f9d6b' },
];
const RENOVA = [
  { n: V.pSemana, t: 'Desafio da semana', d: `${V.qSemana} perguntas sobre os carros da casa · acerte ${V.aSemana} · abre toda segunda` },
  { n: V.pMes, t: 'Prova do mês', d: `${V.qMes} perguntas · acerte ${V.aMes} · abre todo dia 1º` },
];
const NAO = [
  ['Rever o mesmo carro', 'Continua valendo para a ofensiva e para a missão do mês — só não dá ponto duas vezes.'],
  ['Passar do teto do dia', `Depois de ${V.tetoDia} pontos de atendimento, consultar mais não rende mais. É o que impede o placar de premiar quem consulta porque não sabe.`],
  ['Começar ou errar o quiz do carro', 'Só o acerto pontua. Tentar quantas vezes quiser não custa nada.'],
  ['Repetir o desafio ou a prova', 'Uma tentativa por período. São as mesmas perguntas para o time inteiro — se desse para repetir até acertar, o placar não separaria ninguém.'],
];
const PENDENTE = [
  ['O prêmio do mês', 'O app ainda diz “selo + brinde”, que é texto genérico. Enquanto o prêmio não tiver nome, o ranking é um placar — e placar sozinho cansa em três semanas.'],
  ['Gerente disputa com vendedor?', 'Hoje disputam. A sugestão é que não: quem avalia não concorre, e entra numa lista de uso, à parte.'],
  ['Critério de desempate', 'Sugestão: quem fez mais quiz; empatando, quem tem mais dias seguidos. Premia conhecimento, depois constância.'],
  ['Quando a regra pode mudar', 'Sugestão: regra mudada no meio do mês só vale no mês seguinte. Sem isso, quem perder o prêmio vai dizer que mudaram no meio do jogo — e vai ter razão.'],
];

const html = `<!doctype html><meta charset="utf-8">
<style>
@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}
body{font:11px/1.55 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#16181d;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:15mm 17mm 13mm;page-break-after:always;display:flex;flex-direction:column}
.pg:last-child{page-break-after:auto}
.capa{background:${NOITE};color:#f2f1ee;margin:-15mm -17mm 10mm;padding:15mm 17mm 13mm}
.k{font:800 10px sans-serif;letter-spacing:.2em;color:${GOLD};text-transform:uppercase}
h1{font:800 33px/1.1 Georgia,serif;margin:10px 0 8px;letter-spacing:-.6px}
.sub{font-size:13px;line-height:1.5;color:#c6c9d6;max-width:150mm}
.vig{margin-top:11px;font-size:11px;color:#9aa0b4}
h2{font:800 19px Georgia,serif;margin:0 0 4px;letter-spacing:-.3px}
.ld{font-size:12px;line-height:1.55;color:#5b6070;margin-bottom:11px}
.et{font:800 9.5px sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#9aa0b0;margin:17px 0 9px}

.linha{display:flex;align-items:flex-start;gap:14px;padding:12px 0;border-top:1px solid #eceff3}
.linha:first-of-type{border-top:0}
.num{flex:none;width:58px;text-align:right;font:800 30px/1 Georgia,serif;letter-spacing:-1px}
.num small{display:block;font:800 8px sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#9aa0b0;margin-top:4px}
.tx b{display:block;font:800 13.5px sans-serif;margin-bottom:2px}
.tx span{font-size:11.5px;color:#5b6070;line-height:1.5}

.ouro{background:linear-gradient(180deg,#fdf7e8,#fbf1d9);border:1.5px solid #e4cf92;border-radius:15px;padding:14px 16px;margin-top:5px}
.ouro .et{margin-top:0;color:#8a6a16}
.ouro .linha{border-color:rgba(176,138,42,.25)}
.ouro .num{color:#8a6a16}
.ouro .tx b{color:#4d3c0c} .ouro .tx span{color:#6b5312}

.cinza{background:#f6f7fa;border-radius:14px;padding:13px 16px;margin-top:5px}
.cinza div{padding:9px 0;border-top:1px solid #e6e9ef}
.cinza div:first-of-type{border-top:0}
.cinza b{font:800 12.5px sans-serif}
.cinza span{font-size:11.5px;color:#5b6070;line-height:1.5}

.pend{border:1.5px solid #e9d6d3;background:#fdf6f5;border-radius:15px;padding:14px 16px;margin-top:5px}
.pend .et{margin-top:0;color:#b0564a}
.pend div{padding:9px 0;border-top:1px solid #efdedb}
.pend div:first-of-type{border-top:0}
.pend b{font:800 12.5px sans-serif;color:#7d3a31}
.pend span{font-size:11.5px;color:#6b5a57;line-height:1.5}

.cx{margin-top:13px;background:#f6f7fa;border-radius:13px;padding:13px 15px;font-size:12px;line-height:1.55;color:#5b6070}
.cx b{color:#16181d}
.rod{margin-top:auto;padding-top:7mm;border-top:1px solid #e9ebf1;font-size:9.5px;color:#9aa0b0;display:flex;justify-content:space-between}
</style>

<div class="pg">
  <div class="capa">
    <div class="k">Eleva · Grupo Ramasa</div>
    <h1>Regulamento do ranking</h1>
    <p class="sub">Como se ganha ponto no Eleva, o que não vale, e por quê. O placar zera todo dia 1º e vale por marca.</p>
    <p class="vig">Em vigor em ${hoje} · os números deste documento são lidos do próprio aplicativo</p>
  </div>

  <h2>O que vale ponto</h2>
  <p class="ld">Três coisas, o tempo todo.</p>
  ${VALE.map((v) => `
  <div class="linha">
    <span class="num" style="color:${v.cor}">${v.n}<small>pontos</small></span>
    <span class="tx"><b>${v.t}</b><span>${v.d}</span></span>
  </div>`).join('')}

  <div class="et">E o que renova sozinho</div>
  <div class="ouro">
    ${RENOVA.map((v) => `
    <div class="linha">
      <span class="num">+${v.n}<small>pontos</small></span>
      <span class="tx"><b>${v.t}</b><span>${v.d}</span></span>
    </div>`).join('')}
  </div>

  <div class="cx">
    <b>Por que existe o desafio.</b> Os pontos de estudo acabam: são cinco carros, e quem estuda
    todos chega ao fim. O desafio da semana e a prova do mês põem conteúdo novo na mesa toda
    segunda e todo dia 1º — e são <b>as mesmas perguntas para o time inteiro</b>, para que o prêmio
    meça preparo e não sorte.
  </div>

  <div class="rod"><span>Eleva · Grupo Ramasa</span><span>1 de 2</span></div>
</div>

<div class="pg">
  <h2>O que não vale — e por quê</h2>
  <p class="ld">Toda regra daqui existe para o placar medir aprendizado, não repetição.</p>
  <div class="cinza">
    ${NAO.map(([t, d]) => `<div><b>${t}</b><br><span>${d}</span></div>`).join('')}
  </div>

  <div class="et">Missão do mês</div>
  <div class="cx" style="margin-top:0">
    Assistir <b>${V.missao} pílulas</b> no mês completa a missão. Ela corre por fora do placar:
    é meta de cobertura, não de disputa.
  </div>

  <div class="et">Ainda não decidido</div>
  <div class="pend">
    <div class="et">Falta a diretoria definir</div>
    ${PENDENTE.map(([t, d]) => `<div><b>${t}</b><br><span>${d}</span></div>`).join('')}
  </div>

  <div class="cx">
    <b>Este documento é gerado do aplicativo.</b> Os pontos acima não foram digitados: saem do
    mesmo arquivo que o app lê para calcular o placar. Se um dia o documento divergir da tela, é
    porque alguém mudou a regra — e o documento muda junto.
  </div>

  <div class="rod"><span>Eleva · Grupo Ramasa · ${hoje}</span><span>2 de 2</span></div>
</div>`;

const arq = '/tmp/regulamento.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 1800));
const { data } = await c.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('pdf:', SAIDA);
console.log('valores lidos do código:', JSON.stringify(V));
