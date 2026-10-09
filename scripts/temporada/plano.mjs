// O PLANO DE LANÇAMENTO, em PDF — para a Vivian decidir e para a Mariana ler.
//
// Tudo o que entra aqui é ou dado do app (quantas pessoas abrem, a que horas)
// ou aritmética (31 episódios ÷ 2 por semana). O que é opinião minha está
// marcado como opinião — a Vivian pediu embasamento antes, e misturar as duas
// coisas num documento que vai circular seria pior do que não fazê-lo.
//
// Uso: node scripts/temporada/plano.mjs <saida.pdf>
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/ELEVA - plano de lancamento.pdf`;
const NOITE = '#0f0f1e';
const GOLD = '#c9a84c';
const AZUL = '#2563eb';
const OURO = '#a8842f';

const ART = `${process.env.HOME}/Downloads/eleva-temporada`;
const img = (f) => 'data:image/png;base64,' + fs.readFileSync(`${ART}/${f}`).toString('base64');

// O QUE FOI REALMENTE ENCOMENDADO A ELES — não o que eu supus.
//
// Eu tinha montado a série sobre os "níveis" do app, que são roteiros de texto
// que já existem lá dentro. Mas os vídeos que a Ramasa está gravando são outra
// coisa: dois documentos enviados em agosto e setembro pedem 4 roteiros de
// veículo e 27 de acessório. Coincidência cruel: dá 31 nos dois casos, e foi
// por isso que o erro passou despercebido na primeira versão.
const ENCOMENDADO = [
  ['Veículos', 4, 'Jaecoo 7 SHS-P · Omoda 5 SHS-H · Omoda E5 · Omoda 7 SHS-P', '03/09'],
  ['Acessórios', 27, 'De fábrica e de loja — o acessório é o ator, não o vendedor', '25/08'],
];
// AS DUAS GRAMÁTICAS. Não é o mesmo roteiro aplicado a dois assuntos: são
// formatos diferentes, e a diferença tem razão escrita no próprio documento.
const BATIDAS = [
  ['0–5s', 'Gancho', '0–5s', 'Gancho'],
  ['5–15s', 'A causa', '5–13s', 'O que é'],
  ['15–30s', 'O argumento', '13–25s', 'Pra quem é'],
  ['30–40s', 'A virada', '25–37s', 'A objeção'],
  ['40–45s', 'CTA', '37–45s', 'Quando oferecer'],
];
const CANAIS = [
  ['1', 'Vídeo da Mariana no grupo', '30 segundos, às 7h30', 'É a dona anunciando, não o fornecedor. E é o único jeito de alcançar as 8 pessoas que nunca abriram o app.'],
  ['2', 'A arte, logo em seguida', 'mesmo grupo, mesmo minuto', 'O vídeo dá a emoção; a arte dá a informação — data, prêmio, como pontua. Fica fixada e a pessoa volta nela.'],
  ['3', 'Pop-up no app', 'só no dia da estreia', 'O pop-up não anuncia: ele converte quem o WhatsApp trouxe. Sozinho falaria só com quem já abre o app.'],
  ['4', 'Uma linha no grupo a cada episódio', 'terça e quinta', '“Episódio 4 no ar: Motorização do Jaecoo 7.” Curto, sempre igual, sempre no mesmo horário.'],
  ['5', 'A foto do vencedor recebendo', 'fim do mês', 'Não é detalhe: é o que faz o segundo mês funcionar. Sem ela, o desafio vira “aquela coisa do app”.'],
];
const HORAS = [['7h',63],['8h',193],['9h',168],['10h',162],['11h',99],['12h',104],['13h',49],['14h',52],['15h',54],['16h',69],['17h',65],['18h',44]];
const maxH = Math.max(...HORAS.map((h) => h[1]));

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
h2{font:800 19px Georgia,serif;margin:0 0 4px;letter-spacing:-.3px}
.ld{font-size:12px;line-height:1.55;color:#5b6070;margin-bottom:11px}
.et{font:800 9.5px sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#9aa0b0;margin:13px 0 8px}

.big{display:flex;gap:11px;margin-bottom:4px}
.big div{flex:1;border:1.5px solid #e7eaf1;border-radius:14px;padding:12px 14px}
.big b{display:block;font:800 30px/1 Georgia,serif;color:${NOITE};letter-spacing:-1px}
.big span{display:block;font-size:11px;color:#6b7183;margin-top:7px;line-height:1.4}

table{width:100%;border-collapse:collapse;font-size:11.5px}
td{padding:7px 0;border-top:1px solid #eceff3;vertical-align:top}
tr:first-child td{border-top:0}
td.n{width:18mm;font-weight:800}
td.q{width:16mm;text-align:right;color:#9aa0b0;font-weight:700}
td.d{color:#5b6070;font-size:11px;padding-left:12px}

.canal{display:flex;gap:14px;padding:12px 0;border-top:1px solid #eceff3}
.canal:first-of-type{border-top:0}
.canal .num{flex:none;width:30px;height:30px;border-radius:50%;background:${NOITE};color:${GOLD};
  display:grid;place-items:center;font:800 14px sans-serif}
.canal b{display:block;font:800 13.5px sans-serif}
.canal i{display:block;font-style:normal;font-size:10.5px;color:${OURO};font-weight:700;margin-top:2px}
.canal span{display:block;font-size:11.5px;color:#5b6070;line-height:1.5;margin-top:5px}

.barras{display:flex;align-items:flex-end;gap:5px;height:34mm;margin-top:6px}
.barras div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%}
.barras i{display:block;width:100%;border-radius:4px 4px 0 0;background:${AZUL}}
.barras i.pico{background:${OURO}}
.barras span{font-size:9px;color:#9aa0b0;margin-top:5px}

.artes{display:flex;gap:11px;margin-top:6px}
.artes img{width:100%;border-radius:10px;border:1px solid #e3e7ec;display:block}
.artes figcaption{font-size:10px;color:#8a8f9e;margin-top:6px;text-align:center}

.cx{margin-top:11px;background:#f6f7fa;border-radius:13px;padding:12px 14px;font-size:11.5px;line-height:1.5;color:#5b6070}
.cx b{color:#16181d}
.cx.ouro{background:linear-gradient(180deg,#fdf7e8,#fbf1d9);border:1.5px solid #e4cf92;color:#4d3c0c}
.cx.ouro b{color:#4d3c0c}
.pend{border:1.5px solid #e9d6d3;background:#fdf6f5;border-radius:14px;padding:13px 16px;margin-top:5px}
.pend div{padding:8px 0;border-top:1px solid #efdedb}
.pend div:first-of-type{border-top:0}
.pend b{font:800 12.5px sans-serif;color:#7d3a31}
.pend span{font-size:11.5px;color:#6b5a57;line-height:1.5}
.rod{margin-top:auto;padding-top:7mm;border-top:1px solid #e9ebf1;font-size:9.5px;color:#9aa0b0;display:flex;justify-content:space-between}
</style>

<div class="pg">
  <div class="capa">
    <div class="k">Eleva · Grupo Ramasa</div>
    <h1>Lançar o conteúdo como uma série</h1>
    <p class="sub">A ideia é tratar o conteúdo do app como uma temporada — episódios com data, em vez de biblioteca parada esperando alguém procurar.</p>
  </div>

  <h2>A série é o que já foi encomendado</h2>
  <p class="ld">Dois roteiros foram enviados à Ramasa em agosto e setembro. Juntos, eles são a temporada — e nada precisa ser escrito de novo.</p>

  <div class="big">
    <div><b>31</b><span>vídeos encomendados: 4 de veículo e 27 de acessório</span></div>
    <div><b>45s</b><span>cada um, vertical, gravado no celular no showroom</span></div>
    <div><b>0</b><span>já subiram no app — a temporada inteira está por vir</span></div>
  </div>

  <div class="et">O que foi pedido, e quando</div>
  <table>
    ${ENCOMENDADO.map(([c, n, t, d]) => `<tr><td class="n">${c}</td><td class="q">${n}</td><td class="d">${t}<br><span style="color:#9aa0b0">roteiro enviado em ${d}</span></td></tr>`).join('')}
  </table>

  <div class="et">As duas gramáticas de 45 segundos, já escritas nos roteiros deles</div>
  <table>
    <tr><td class="n" style="color:${AZUL};width:34mm">VEÍCULO · 4 vídeos</td><td class="n" style="color:${OURO}">ACESSÓRIO · 27 vídeos</td></tr>
    ${BATIDAS.map(([t1, n1, t2, n2]) => `<tr><td class="d" style="padding-left:0"><b style="color:${AZUL}">${t1}</b> &nbsp;${n1}</td><td class="d" style="padding-left:0"><b style="color:${OURO}">${t2}</b> &nbsp;${n2}</td></tr>`).join('')}
  </table>
  <div class="cx" style="margin-top:9px">
    <b>A diferença não é cosmética.</b> No vídeo do carro, mais da metade é argumento e virada,
    e ele fecha com CTA. No do acessório, <b>mais da metade é “pra quem é” e “a objeção”</b> — e
    não tem CTA nenhum. A razão está escrita no documento: o vendedor já sabe o que o produto
    faz; o que ele não sabe é a quem oferecer e o que responder quando ouve não. E quem assiste
    já trabalha ali, não precisa ser convidado a nada. A ordem dos argumentos do carro também
    não é opinião: saiu da pesquisa com 16 vendedores, 192 respostas.
  </div>

  <div class="cx">
    <b>Duas temporadas, não uma.</b> Os 4 carros são a estreia — curta e forte, duas semanas a
    dois por semana. Os 27 acessórios são o que sustenta os meses seguintes: mais treze semanas.
    Juntas, quinze semanas de lançamento sem escrever um roteiro novo.
    <br><br>
    O padrão técnico já está fixado no roteiro deles: vertical 9:16, 45 segundos, MP4 de até
    12 MB e <b>legenda sempre queimada</b> — metade vai assistir sem som, de pé, ao lado de um
    cliente.
  </div>

  <div class="rod"><span>Eleva · Grupo Ramasa</span><span>1 de 3</span></div>
</div>

<div class="pg">
  <h2>Por onde anunciar — e por quê nessa ordem</h2>
  <p class="ld">O app não consegue se anunciar sozinho. Dos 45 cadastrados da Ramasa, 21 abriram nos últimos sete dias e 8 nunca abriram nada. Um pop-up é incapaz, por definição, de alcançar quem não abre.</p>

  <div class="big">
    <div><b>47%</b><span>abriram o app nos últimos 7 dias</span></div>
    <div><b>73%</b><span>abriram nos últimos 30 dias</span></div>
    <div><b>8</b><span>nunca abriram nada — só o WhatsApp alcança</span></div>
  </div>

  <div class="et">A ordem</div>
  ${CANAIS.map(([n, t, q, d]) => `
  <div class="canal">
    <span class="num">${n}</span>
    <span><b>${t}</b><i>${q}</i><span>${d}</span></span>
  </div>`).join('')}

  <div class="et">A que horas o time usa o app</div>
  <div class="barras">
    ${HORAS.map(([h, v]) => `<div><i class="${v > 150 ? 'pico' : ''}" style="height:${Math.round(v / maxH * 100)}%"></i><span>${h}</span></div>`).join('')}
  </div>
  <div class="cx">
    <b>45% de tudo acontece entre 8h e 11h</b>, com pico às 8h. Por isso o vídeo vai às 7h30:
    chega antes da loja abrir, a pessoa vê no caminho, e quando liga o app às 8h o conteúdo já
    está esperando. Mandar às 14h é o pior horário do dia.
  </div>

  <div class="rod"><span>Eleva · Grupo Ramasa</span><span>2 de 3</span></div>
</div>

<div class="pg">
  <h2>As peças</h2>
  <p class="ld">O formato nunca muda — selo do episódio no mesmo canto, rodapé sempre com as mesmas duas informações. E o título de cada episódio é a <b>objeção do cliente</b> que aquele vídeo resolve, tirada do próprio roteiro: é o que faz um vendedor querer abrir.</p>

  <div class="artes">
    <figure style="flex:1"><img src="${img('00-anuncio-da-temporada.png')}"><figcaption>Anúncio da temporada</figcaption></figure>
    <figure style="flex:1"><img src="${img('ep-01-jaecoo7-e-chines.png')}"><figcaption>Episódio 1 · Jaecoo 7</figcaption></figure>
    <figure style="flex:1"><img src="${img('ep-03-omodae5-onde-eu-carrego.png')}"><figcaption>Episódio 3 · Omoda E5</figcaption></figure>
  </div>

  <div class="cx ouro">
    <b>O prêmio: R$ 500 em combustível por mês</b>, entregue pela Mariana na frente do time.
    É o dinheiro mais útil para quem vende carro — dinheiro vivo vira conta no fim do mês e
    ninguém lembra que ganhou; combustível dura semanas e lembra todo dia.
    <br><br>
    <b>Esta é a parte mais fraca do plano</b>, e vale dizer: não tenho dado nenhum sobre o que
    esse time valoriza. Se a Mariana ou o Cristiano disserem outra coisa, a opinião deles vale
    mais que a minha.
  </div>

  <div class="et">Falta decidir</div>
  <div class="pend">
    <div><b>O Jaecoo 5 não tem roteiro</b><br><span>Os quatro enviados em 03/09 são Jaecoo 7, Omoda 5, Omoda E5 e Omoda 7. O Jaecoo 5 entrou na linha depois — e é justamente o carro de lançamento, com condição própria na carta de outubro (fase de lançamento, limitada a 3.600 unidades). Sem roteiro dele, a estreia sai sem o carro do momento.</span></div>
    <div><b>A data de estreia</b><br><span>As artes estão com “em breve”. Com a data, saem prontas em dez segundos.</span></div>
    <div><b>Gerente disputa o prêmio com vendedor?</b><br><span>Sugestão: não. Quem avalia não concorre — entra numa lista de uso, à parte.</span></div>
    <div><b>Critério de desempate</b><br><span>Sugestão: quem fez mais quiz; empatando, quem tem mais dias seguidos.</span></div>
  </div>

  <div class="rod"><span>Eleva · Grupo Ramasa</span><span>3 de 3</span></div>
</div>`;

const arq = '/tmp/plano.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 2500));
const { data } = await c.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('pdf:', SAIDA);
