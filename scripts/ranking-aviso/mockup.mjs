// PRÉVIA do pop-up das regras, para a Vivian aprovar ANTES de existir no app.
//
// O desenho é injetado por cima da tela real, no navegador da captura — nada
// disso está no código do app. É proposta, não implementação.
//
// Uso: node scripts/ranking-aviso/mockup.mjs <pasta>
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2];
if (!SAIDA) { console.error('falta a pasta'); process.exit(1); }
fs.mkdirSync(SAIDA, { recursive: true });

const U = { uid: 'p1', name: 'Walther', email: 'walther@tigeromoda.com.br', role: 'balconista',
  cargo: 'vendedor-veiculos', loja: 'tiger-goiania', brands: ['ramasa'] };

const POPUP = `
<div id="mk-fundo">
  <div id="mk-card">
    <span class="mk-et">O ranking mudou</span>
    <h2>Toda semana tem ponto novo</h2>

    <div class="mk-l"><b style="color:#2b6ef5">10</b><span><i>Assistir o vídeo de um carro</i><em>uma vez por carro</em></span></div>
    <div class="mk-l"><b style="color:#b08a2a">30</b><span><i>Acertar o quiz do carro</i><em>o que mais vale</em></span></div>
    <div class="mk-l"><b style="color:#1f9d6b">2</b><span><i>Usar o app no atendimento</i><em>até 10 por dia</em></span></div>

    <div class="mk-novo">
      <span class="mk-novo-et">Novo</span>
      <div class="mk-nl"><b>+25</b><span><i>Desafio da semana</i><em>5 perguntas · toda segunda</em></span></div>
      <div class="mk-nl"><b>+60</b><span><i>Prova do mês</i><em>10 perguntas · todo dia 1º</em></span></div>
    </div>

    <p class="mk-rod">O placar zera todo dia 1º. Uma tentativa por desafio.</p>
    <button class="mk-ok">Ver o desafio da semana</button>
    <button class="mk-nao">Agora não</button>
  </div>
</div>
<style>
#mk-fundo{position:fixed;inset:0;z-index:999;background:rgba(10,16,26,.62);
  display:flex;align-items:flex-end;justify-content:center;padding:0}
#mk-card{width:100%;max-width:430px;background:#fff;border-radius:22px 22px 0 0;
  padding:26px 22px 22px;font-family:inherit;color:#16202a;
  box-shadow:0 -14px 50px rgba(10,16,26,.26)}
#mk-card .mk-et{display:block;font-size:11px;font-weight:800;letter-spacing:.14em;
  text-transform:uppercase;color:#2b6ef5;margin-bottom:7px}
#mk-card h2{font-size:22px;line-height:1.2;margin:0 0 18px;letter-spacing:-.3px}
.mk-l{display:flex;align-items:center;gap:15px;padding:11px 0;border-top:1px solid #eef0f4}
.mk-l:first-of-type{border-top:0}
.mk-l b{font:800 30px/1 Georgia,serif;width:46px;text-align:right;flex:none;letter-spacing:-1px}
.mk-l i,.mk-nl i{display:block;font-style:normal;font-size:14.5px;font-weight:700}
.mk-l em,.mk-nl em{display:block;font-style:normal;font-size:12px;color:#737c8b;margin-top:1px}
.mk-novo{margin-top:16px;background:linear-gradient(180deg,#fdf7e8,#fbf1d9);
  border:1.5px solid #e4cf92;border-radius:15px;padding:13px 15px 14px}
.mk-novo-et{display:block;font-size:10px;font-weight:800;letter-spacing:.16em;
  text-transform:uppercase;color:#b08a2a;margin-bottom:8px}
.mk-nl{display:flex;align-items:center;gap:15px;padding:8px 0;border-top:1px solid rgba(176,138,42,.22)}
.mk-nl:first-of-type{border-top:0}
.mk-nl b{font:800 26px/1 Georgia,serif;width:58px;text-align:right;flex:none;color:#b08a2a;letter-spacing:-1px}
.mk-nl i,.mk-nl em{color:#4d3c0c}
.mk-nl em{color:#6b5312}
.mk-rod{font-size:12px;color:#737c8b;text-align:center;margin:15px 0 0}
.mk-ok{width:100%;margin-top:13px;padding:14px;font-size:15.5px;font-weight:800;
  color:#fff;background:#2b6ef5;border:0;border-radius:12px}
.mk-nao{width:100%;margin-top:8px;padding:11px;font-size:14px;font-weight:700;
  color:#737c8b;background:none;border:0}
</style>`;

const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable'); await c.send('Runtime.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `
  localStorage.setItem('wp_dev_user', ${JSON.stringify(JSON.stringify(U))});
  localStorage.setItem('wp_brand','ramasa'); localStorage.setItem('wp_onboarded','1');
  localStorage.setItem('wp_instalar_dispensado','1');
  try { if (navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});}); } catch(e){}
  try { var f=function(){ if(document.getElementById('sa'))return; var a=document.head||document.documentElement; if(!a)return; var s=document.createElement('style'); s.id='sa'; s.textContent='.wp-aviso,.wp-rit-fundo{display:none !important}'; a.appendChild(s); }; f(); document.addEventListener('DOMContentLoaded',f); } catch(e){}
` });
await c.send('Page.navigate', { url: 'http://localhost:5173/eleva' });
await new Promise((r) => setTimeout(r, 4500));
await c.send('Runtime.evaluate', { expression:
  `(() => { const d = document.createElement('div'); d.innerHTML = ${JSON.stringify(POPUP)}; document.body.appendChild(d); })()` });
await new Promise((r) => setTimeout(r, 700));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(`${SAIDA}/popup.png`, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('prévia:', SAIDA + '/popup.png');
