import fs from 'fs';
import { abrirChrome, conectar } from './cdp.mjs';

const T = '/Users/viviangitti/gss/scripts/tutorial/';
const TIME = fs.readFileSync(T + 'time-ramasa.json', 'utf8');
const ARGS = fs.readFileSync(T + 'argumentos-ramasa.json', 'utf8');
const OBJS = fs.readFileSync(T + 'objecoes-ramasa.json', 'utf8');

const VENDEDOR = { uid: 'demo-vend', name: 'Walther', email: 'walther@tigeromoda.com.br',
  role: 'balconista', cargo: 'vendedor-veiculos', brands: ['ramasa'], loja: 'tiger-goiania' };
const GESTOR = { uid: 's6OJY8iOFiP3uZPWG7TelexMBwl2', name: 'Mariana', email: 'mariana@gruporamasa.com',
  role: 'gestor', cargo: 'diretor', brands: ['ramasa'] };

const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');

async function semente(user) {
  await c.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('wp_dev_user', ${JSON.stringify(JSON.stringify(user))});
      localStorage.setItem('wp_demo_time', ${JSON.stringify(TIME)});
      localStorage.setItem('wp_demo_argumentos', ${JSON.stringify(ARGS)});
      localStorage.setItem('wp_demo_objecoes', ${JSON.stringify(OBJS)});
      localStorage.setItem('wp_brand', 'ramasa');
      localStorage.setItem('wp_onboarded', '1');
      localStorage.setItem('wp_pp_done', '1');
      localStorage.setItem('wp_instalar_dispensado', '1');
      localStorage.setItem('wp_jornada_campos', JSON.stringify({ cliente: 'Gerson', carro: 'Jaecoo 7', vendedor: 'Walther', loja: 'Tiger Omoda' }));
    `,
  });
}

async function tela(rota, arquivo, { espera = 3000, rolar = 0, inteira = false } = {}) {
  await c.send('Page.navigate', { url: 'http://localhost:5173' + rota });
  await new Promise((r) => setTimeout(r, espera));
  if (rolar) {
    await c.send('Runtime.evaluate', { expression: `window.scrollTo({top:${rolar}})` });
    await new Promise((r) => setTimeout(r, 900));
  }
  const { data } = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: inteira });
  fs.writeFileSync('telas/' + arquivo, Buffer.from(data, 'base64'));
  console.log('  ', arquivo);
}

await semente(VENDEDOR);
await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await tela('/eleva', 'hoje.png');
await tela('/eleva/jornada', 'jornada.png');
await tela('/eleva/jornada', 'jornada-msg.png', { rolar: 700 });
await tela('/eleva/produto/jaecoo-7', 'produto.png');
await tela('/eleva/produto/jaecoo-7', 'objecoes.png', { rolar: 1500 });
await tela('/eleva/assistente', 'assistente.png');
await tela('/eleva/ofertas', 'condicoes.png');
await tela('/eleva/documentos', 'documentos.png');
await tela('/eleva/noticias', 'noticias.png');
await tela('/eleva/catalogo', 'catalogo.png');

await semente(GESTOR);
await tela('/eleva/gestor', 'painel.png');
await tela('/eleva/gestor', 'painel-time.png', { rolar: 1700 });
await tela('/eleva/cultura', 'cultura.png');
c.fechar(); proc.kill();
