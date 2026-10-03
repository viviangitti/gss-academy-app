// O CAMINHO DE SUBIR A CARTA, FOTOGRAFADO PASSO A PASSO.
//
// A Raphaela mandou a carta comercial de outubro no WhatsApp em vez de subir no
// app. Ela TEM permissão (o e-mail dela está liberado em firestore.eleva.rules),
// então o que falta não é acesso: é nunca ter visto a tela. Este script grava os
// quatro passos no app de verdade, logado com o cargo dela, pra virar um guia de
// uma imagem que se manda por WhatsApp.
//
// Roda com o servidor de desenvolvimento no ar (preview "eleva", porta 5173).
// Uso: node scripts/guia-condicoes/captura.mjs <pasta-de-saida>
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2];
if (!SAIDA) { console.error('falta a pasta de saída'); process.exit(1); }
fs.mkdirSync(`${SAIDA}/telas`, { recursive: true });

const T = '/Users/viviangitti/gss/scripts/tutorial/';
const TIME = fs.readFileSync(T + 'time-ramasa.json', 'utf8');
// As 14 folhas que estão no banco — com as de setembro já vencidas, que é
// exatamente o estado que a Raphaela vai encontrar ao abrir o Painel.
const CONDICOES = fs.readFileSync(T + 'condicoes-reais.json', 'utf8');
// A carta de exemplo: três páginas com texto de verdade, pro app cortar como
// corta a carta da montadora. Os valores são zerados de propósito.
const CARTA = process.env.CARTA;
if (!CARTA || !fs.existsSync(CARTA)) { console.error('falta a carta de exemplo (CARTA=...)'); process.exit(1); }

// A RAPHAELA, com o cargo e a loja que ela tem no banco.
const RAPHAELA = {
  uid: 'lHBcQnfKfUOkdXT0AGWSPuujQCS2',
  name: 'Raphaela Loise Mechi Machado',
  email: 'raphaela.machado@gruporamasa.com',
  role: 'gestor', cargo: 'gerente-veiculos', brands: ['ramasa'], loja: 'tiger-itumbiara',
};

const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable'); await c.send('DOM.enable'); await c.send('Runtime.enable');

await c.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    localStorage.setItem('wp_dev_user', ${JSON.stringify(JSON.stringify(RAPHAELA))});
    localStorage.setItem('wp_demo_time', ${JSON.stringify(TIME)});
    localStorage.setItem('wp_brand', 'ramasa');
    localStorage.setItem('wp_condicoes', ${JSON.stringify(CONDICOES)});
    localStorage.setItem('wp_onboarded', '1');
    localStorage.setItem('wp_pp_done', '1');
    localStorage.setItem('wp_instalar_dispensado', '1');
    try { if (navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});}).catch(function(){}); } catch (e) {}
    try {
      var semAviso = function () {
        try {
          if (document.getElementById('sem-avisos')) return;
          var alvo = document.head || document.documentElement; if (!alvo) return;
          var st = document.createElement('style'); st.id = 'sem-avisos';
          st.textContent = '.wp-aviso, .wp-rit-fundo{display:none !important}';
          alvo.appendChild(st);
        } catch (e) {}
      };
      semAviso(); document.addEventListener('DOMContentLoaded', semAviso);
    } catch (e) {}
  `,
});

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function roda(expr) {
  const r = await c.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' — ' + expr.slice(0, 80));
  return r.result?.value;
}

// ONDE FICA O ALVO, medido no próprio DOM.
//
// O guia desenha um anel em volta do botão de cada passo. Cravar a coordenada à
// mão funciona até a primeira mexida no CSS — e aí a seta aponta pro vazio sem
// ninguém perceber. Aqui a posição sai da tela, na hora da foto.
const ALVOS = {};
async function alvo(arquivo, comeca, { tag = 'button, a, [role=button], label, input, h1, h2, p, span, div' } = {}) {
  const r = await roda(`(() => {
    const t = ${JSON.stringify(comeca)};
    const cand = [...document.querySelectorAll(${JSON.stringify(tag)})]
      .filter((e) => (e.textContent || '').trim().startsWith(t));
    const el = cand.find((e) => ![...e.children].some((f) => (f.textContent || '').trim().startsWith(t))) || cand[0];
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    return { x: b.left * d, y: b.top * d, w: b.width * d, h: b.height * d };
  })()`);
  if (!r) throw new Error(`não achei o alvo: ${comeca}`);
  ALVOS[arquivo] = r;
}

async function foto(arquivo) {
  const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${SAIDA}/telas/${arquivo}`, Buffer.from(data, 'base64'));
  console.log('  ', arquivo);
}

/**
 * Rola até o bloco pelo texto do título.
 *
 * Pega o MAIS FUNDO que contém a frase: procurar "o primeiro que contém" devolve
 * o <html>, e a tela ficava parada no topo em vez de ir até o bloco.
 */
async function ate(texto, { alto = 120 } = {}) {
  const ok = await roda(`(() => {
    const t = ${JSON.stringify(texto)};
    const todos = [...document.querySelectorAll('body *')].filter((e) => (e.textContent || '').includes(t));
    const el = todos.reverse().find((e) => ![...e.children].some((f) => (f.textContent || '').includes(t)));
    if (!el) return 'NAO ACHEI';
    const y = el.getBoundingClientRect().top + window.scrollY - ${alto};
    window.scrollTo({ top: Math.max(0, y) });
    return 'ok';
  })()`);
  if (ok !== 'ok') throw new Error(`não achei na tela: ${texto}`);
  await espera(700);
}

async function clica(comeca) {
  const ok = await roda(`(() => {
    const alvo = ${JSON.stringify(comeca)};
    const el = [...document.querySelectorAll('button, a, [role=button], summary')]
      .find((e) => (e.textContent||'').trim().startsWith(alvo));
    if (!el) return 'NAO ACHEI';
    el.scrollIntoView({ block: 'center' }); el.click(); return 'ok';
  })()`);
  if (ok !== 'ok') throw new Error(`não consegui clicar: ${comeca}`);
  await espera(1200);
}

await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });

console.log('como a RAPHAELA (gerente de veículos, Tiger Itumbiara):');
await c.send('Page.navigate', { url: 'http://localhost:5173/eleva/gestor' });
await espera(5200);

// O Painel abre em Resultados. Condições comerciais mora na outra aba — e esse
// é justamente o passo que ninguém adivinha sozinho.
await clica('Conteúdo');

// PASSO 1 — onde fica o botão.
await ate('Condições comerciais', { alto: 70 });
await alvo('1-onde-fica.png', 'Subir tabela');
await foto('1-onde-fica.png');

// PASSO 2 — o formulário aberto, com o campo do arquivo.
await clica('Subir tabela');
await ate('Print ou PDF da tabela', { alto: 150 });
await alvo('2-escolher-arquivo.png', '', { tag: 'input[type=file]' });
await foto('2-escolher-arquivo.png');

// PASSO 3 — o app leu o PDF e cortou a carta em folhas.
const nó = await c.send('DOM.getDocument');
const campo = await c.send('DOM.querySelector', { nodeId: nó.root.nodeId, selector: 'input[type=file]' });
if (!campo.nodeId) throw new Error('não achei o campo de arquivo');
await c.send('DOM.setFileInputFiles', { nodeId: campo.nodeId, files: [CARTA] });
// pdf.js desenha três páginas: dá tempo.
for (let i = 0; i < 40; i += 1) {
  const pronto = await roda(`!!document.querySelector('.wp-gz-carta')`);
  if (pronto) break;
  await espera(500);
}
await espera(1500);
await ate('páginas — cada uma vira', { alto: 90 });
await alvo('3-o-app-corta.png', '3 páginas');
await foto('3-o-app-corta.png');

// PASSO 4 — substituir a carta velha e a data de saída.
await ate('Substituir o que já está', { alto: 110 });
await alvo('4-substituir-e-data.png', 'Publicar 3');
await foto('4-substituir-e-data.png');

fs.writeFileSync(`${SAIDA}/alvos.json`, JSON.stringify(ALVOS, null, 2));
c.fechar(); proc.kill();
console.log('\npronto:', SAIDA + '/telas');
