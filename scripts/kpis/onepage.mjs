// O ONE-PAGE DOS KPIs — o que medir para provar que o Eleva foi essencial.
//
// Para a Vivian levar à Mariana. A tese da peça é que "essencial" não se prova
// com uso: prova-se com dinheiro, com dependência e com uma coisa que a Ramasa
// não consegue de outro jeito. Por isso cada linha tem uma etiqueta dizendo O
// QUE ELA PROVA — sem a etiqueta, viram cinco indicadores soltos.
//
// A ordem é a da força do argumento, não a da facilidade de medir.
//
// Os números das linhas 4 e 5 saem do banco na hora de gerar. Já aconteceu de
// um documento meu circular com número congelado de dois dias antes.
//
// Uso: node scripts/kpis/onepage.mjs [saida.png]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';
import { populacao } from '../uso-eleva.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-kpis-onepage.png`;
const NOITE = '#07070f';
const GOLD = '#c9a84c';
const L = 1080, A = 1350;

const { pessoas } = await populacao();
// Quem VENDE. A chefia usa o app para avaliar, não para atender — misturar os
// dois incha o denominador e enfraquece justamente o número da objeção.
const chefia = (p) => /gestor|gerente|diretor|supervisor|l[íi]der/i.test(`${p.cargo} ${p.papel}`);
const vendem = pessoas.filter((p) => !chefia(p));

const paraCliente = (e) => /onepage/.test(e.type) && !/estudo/.test(String(e.id));
const ONEPAGES = pessoas.flatMap((p) => p.eventos).filter(paraCliente).length;
const QUEM_MANDOU = new Set(pessoas.filter((p) => p.eventos.some(paraCliente)).map((p) => p.email)).size;

// A objeção mais procurada, contada por PESSOAS e não por toques: "13 pessoas
// precisaram disso" é argumento; "17 consultas" pode ser uma pessoa insegura.
const porObjecao = {};
for (const p of vendem) {
  for (const e of p.eventos) {
    if (e.type !== 'objecao') continue;
    const [, ...resto] = String(e.id).split('|');
    const k = resto.join('|').replace(/^"|"$/g, '');
    (porObjecao[k] = porObjecao[k] || new Set()).add(p.email);
  }
}
const [TOP_OBJ, TOP_QUEM] = Object.entries(porObjecao)
  .sort((a, b) => b[1].size - a[1].size)
  .map(([k, v]) => [k, v.size])[0];

const LINHAS = [
  ['Dinheiro', 'Taxa de anexação de acessório',
   'Antes × depois, <b>por vendedor</b>. É o único que vira reais na frente dela.'],
  ['Dependência', 'Venda assistida',
   '% das vendas em que o vendedor abriu aquele carro no app <b>no mesmo dia</b>.'],
  ['Treinamento', 'Rampa do vendedor novo',
   'Dias até vender na média do time. Ninguém discute que foi treinamento.'],
  ['O cliente', 'NPS de quem recebeu o one-page',
   `Contra quem não recebeu. <b>${ONEPAGES} clientes</b> já receberam, de ${QUEM_MANDOU} vendedores.`],
  ['Só o Eleva tem', 'O mapa das objeções',
   `<b>${TOP_QUEM} de ${vendem.length} vendedores</b> procuraram a mesma resposta: “${TOP_OBJ}”`],
];

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${L}px;height:${A}px;background:${NOITE};color:#f4f3f0;
  font-family:Inter,-apple-system,Arial,sans-serif;overflow:hidden;position:relative}
.luz{position:absolute;left:50%;top:-34%;transform:translateX(-50%);width:150%;height:80%;
  border-radius:50%;background:radial-gradient(closest-side,rgba(201,168,76,.16),rgba(201,168,76,0) 70%)}
.pg{position:relative;height:100%;padding:62px 58px 46px;display:flex;flex-direction:column}

.marca{text-align:center;font-family:Cinzel,Georgia,serif;font-weight:800;font-size:26px;
  letter-spacing:.24em;color:#8e94a8}
h1{text-align:center;font-family:Cinzel,Georgia,serif;font-weight:900;font-size:66px;
  line-height:1;margin-top:16px}
.sub{text-align:center;font-size:27px;color:#aab0c2;margin-top:14px;line-height:1.35}

.lista{flex:1;display:flex;flex-direction:column;justify-content:space-evenly;margin:18px 0 14px}
.kpi{display:flex;gap:22px;align-items:flex-start}
.num{flex:none;width:52px;height:52px;border-radius:50%;border:2px solid rgba(201,168,76,.5);
  color:${GOLD};display:grid;place-items:center;font-family:Cinzel,Georgia,serif;
  font-weight:900;font-size:28px;margin-top:4px}
.tag{display:inline-block;font-size:20px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;
  color:${GOLD};background:rgba(201,168,76,.13);border-radius:8px;padding:5px 12px}
.nome{display:block;font-size:37px;font-weight:800;line-height:1.1;margin-top:10px}
.diz{display:block;font-size:26px;color:#aeb4c4;line-height:1.36;margin-top:7px}
.diz b{color:#fff;font-weight:700}

.rod{border-top:1px solid rgba(255,255,255,.12);padding-top:20px;display:flex;gap:26px}
.rod div{flex:1;font-size:23px;line-height:1.4;color:#9aa0b2}
.rod b{display:block;font-size:21px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:7px}
.nao b{color:#e0806f}
.pre b{color:${GOLD}}
</style>
<div class="luz"></div>
<div class="pg">
  <div class="marca">ELEVA · GRUPO RAMASA</div>
  <h1>Os 5 números</h1>
  <p class="sub">“Essencial” não se prova com uso. Prova-se com dinheiro,<br>com dependência e com o que ninguém mais tem.</p>

  <div class="lista">
    ${LINHAS.map(([tag, nome, diz], i) => `
    <div class="kpi">
      <span class="num">${i + 1}</span>
      <span><span class="tag">${tag}</span><span class="nome">${nome}</span><span class="diz">${diz}</span></span>
    </div>`).join('')}
  </div>

  <div class="rod">
    <div class="nao"><b>Não mostrar</b>Uso, pontos e ranking. Parecem esforço, não valor.</div>
    <div class="pre"><b>Preciso de</b>Vendas de jul a set: vendedor · modelo · data · acessórios. Antes da temporada ir ao ar.</div>
  </div>
</div>`;

const arq = '/tmp/kpi-onepage.html';
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
console.log('one-page:', SAIDA);
