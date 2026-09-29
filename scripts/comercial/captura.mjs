// AS TELAS DO COMERCIAL — inteiras, para poderem ROLAR no vídeo.
//
// A diferença para a captura do deck: aqui cada tela vem com a PÁGINA TODA
// (captureBeyondViewport), não só o que cabe no visor. É isso que permite o
// movimento: no vídeo, a janela de recorte desce sobre a imagem alta e a tela
// parece estar sendo rolada pelo dedo de quem usa.
//
// Uso: node scripts/comercial/captura.mjs <pasta-de-saida>
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2];
if (!SAIDA) { console.error('falta a pasta de saída'); process.exit(1); }
fs.mkdirSync(`${SAIDA}/telas`, { recursive: true });

const T = '/Users/viviangitti/gss/scripts/tutorial/';
const TIME = fs.readFileSync(T + 'time-ramasa.json', 'utf8');
const ARGS = fs.readFileSync(T + 'argumentos-ramasa.json', 'utf8');
const OBJS = fs.readFileSync(T + 'objecoes-ramasa.json', 'utf8');
const CONDICOES = fs.readFileSync(T + 'condicoes-reais.json', 'utf8');

const VENDEDOR = { uid: 'demo-vend', name: 'Walther', email: 'walther@tigeromoda.com.br',
  role: 'balconista', cargo: 'vendedor-veiculos', brands: ['ramasa'], loja: 'tiger-goiania' };
const GESTOR = { uid: 's6OJY8iOFiP3uZPWG7TelexMBwl2', name: 'Mariana', email: 'mariana@gruporamasa.com',
  role: 'gestor', cargo: 'diretor', brands: ['ramasa'] };

const agora = Date.now();
const CONVERSA = [
  { role: 'user', content: '"É chinês, né?" — o cliente travou nisso. O que eu respondo?', at: agora - 240000 },
  { role: 'assistant', content: 'Essa é a objeção de marca, Walther. Responde com fato, não com adjetivo:\n\n1. Acolhe: "Faz sentido, é marca nova por aqui."\n2. Tamanho: a Chery vende 1,9 milhão de carros por ano e exporta há 25 anos.\n3. Prova local: o Jaecoo 7 tem 5 estrelas no Latin NCAP.\n4. Garantia: 6 anos. Ninguém dá 6 anos em carro que não confia.\n\nE convide para o test drive: marca desconhecida vira conhecida no banco do motorista, não na conversa.', at: agora - 235000 },
];

const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');

let semeadoId = null;
async function semente(user) {
  // O acesso GRUDA: addScriptToEvaluateOnNewDocument acumula, e a semente de
  // uma cena continua valendo nas seguintes (foi assim que um tutorial inteiro
  // virou vídeo da pessoa errada da cena 8 em diante). Remove a anterior.
  if (semeadoId) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: semeadoId });
  const r = await c.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('wp_dev_user', ${JSON.stringify(JSON.stringify(user))});
      localStorage.setItem('wp_demo_time', ${JSON.stringify(TIME)});
      localStorage.setItem('wp_demo_argumentos', ${JSON.stringify(ARGS)});
      localStorage.setItem('wp_demo_objecoes', ${JSON.stringify(OBJS)});
      localStorage.setItem('wp_brand', 'ramasa');
      localStorage.setItem('wp_condicoes', ${JSON.stringify(CONDICOES)});
      localStorage.setItem('wp_onboarded', '1');
      localStorage.setItem('wp_pp_done', '1');
      localStorage.setItem('wp_instalar_dispensado', '1');
      localStorage.setItem('wp_jornada_campos', JSON.stringify({ cliente: 'Gerson', carro: 'Jaecoo 7', vendedor: 'Walther', loja: 'Tiger Omoda' }));
      localStorage.setItem('wp_ia_conversa:ramasa:' + ${JSON.stringify(user.email)}, JSON.stringify({ em: ${agora}, msgs: ${JSON.stringify(CONVERSA)} }));

      try {
        if (navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () {});
        }
      } catch (e) {}
      try {
        var por = function () {
          try {
            if (document.getElementById('sem-avisos')) return;
            var alvo = document.head || document.documentElement;
            if (!alvo) return;
            var st = document.createElement('style');
            st.id = 'sem-avisos';
            st.textContent = '.wp-aviso{display:none !important}';
            alvo.appendChild(st);
          } catch (e) {}
        };
        por();
        document.addEventListener('DOMContentLoaded', por);
      } catch (e) {}
    `,
  });
  semeadoId = r.identifier;
}

// A BARRA DE ABAS É FIXA, e isso estraga a captura da página inteira.
//
// `.wp-nav` é `position: fixed; bottom: 0`: numa captura que vai além do visor,
// o navegador a desenha na altura em que o visor estava — ou seja, NO MEIO da
// imagem alta. No vídeo ela aparecia flutuando no meio da tela, como se o app
// estivesse quebrado.
//
// Então cada tela sai DUAS vezes: a página inteira com as barras apagadas (é o
// que rola no vídeo) e o visor normal (de onde saem as faixas do cabeçalho e
// da barra, coladas por cima a cada quadro). O resultado é o que a pessoa vê
// de verdade: o conteúdo corre, as barras ficam.
const medidas = {};

async function tela(rota, arquivo, { espera = 3500 } = {}) {
  const id = arquivo.replace('.png', '');
  await c.send('Page.navigate', { url: 'http://localhost:5173' + rota });
  await new Promise((r) => setTimeout(r, espera));

  // 1) o visor, com as barras no lugar
  const visor = await c.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${SAIDA}/telas/${id}-visor.png`, Buffer.from(visor.data, 'base64'));

  const m = await c.send('Runtime.evaluate', {
    expression: `(() => {
      const nav = document.querySelector('.wp-nav');
      const cab = document.querySelector('.wp-header');
      return {
        largura: innerWidth,
        altura: document.body.scrollHeight,
        nav: nav ? Math.round(nav.getBoundingClientRect().height) : 0,
        cabecalho: cab ? Math.round(cab.getBoundingClientRect().height) : 0,
      };
    })()`, returnByValue: true,
  }).then((r) => r.result.value);
  medidas[id] = m;

  // 2) a página inteira, sem as barras
  await c.send('Runtime.evaluate', {
    expression: `(() => {
      let st = document.getElementById('sem-barras');
      if (!st) { st = document.createElement('style'); st.id = 'sem-barras'; document.head.appendChild(st); }
      st.textContent = '.wp-nav, .wp-header { visibility: hidden !important }';
    })()`,
  });
  await new Promise((r) => setTimeout(r, 350));
  const { data } = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(`${SAIDA}/telas/${arquivo}`, Buffer.from(data, 'base64'));

  console.log(`   ${arquivo}  (página ${m.largura}×${m.altura} css · cabeçalho ${m.cabecalho} · barra ${m.nav})`);
}

await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });

console.log('vendedor:');
await semente(VENDEDOR);
await tela('/eleva/assistente', 'tira-duvida.png', { espera: 4500 });
await tela('/eleva/jornada', 'jornada.png');
await tela('/eleva/ofertas', 'condicoes.png');
await tela('/eleva/documentos', 'documentos.png');
await tela('/eleva/noticias', 'noticias.png', { espera: 6500 });
await tela('/eleva/catalogo', 'carros.png');

console.log('gestora:');
await semente(GESTOR);
await tela('/eleva/gestor', 'painel.png', { espera: 4500 });

fs.writeFileSync(`${SAIDA}/telas/medidas.json`, JSON.stringify(medidas, null, 1));
c.fechar(); proc.kill();
console.log('\npronto:', SAIDA + '/telas');
