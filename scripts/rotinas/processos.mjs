// OS PROCESSOS DO APP — o que sai do Eleva, quando, e quem faz.
//
// Pedido da Vivian (13/10/2026): "organizar os processos do app (tudo envia no
// grupo)". Esta é a folha que explica o combinado para os gerentes.
//
// A DIVISÃO QUE A FOLHA FAZ É A QUE IMPORTA: o que alguém envia e o que o app
// faz sozinho. Sem ela, a reunião vira cobrança de coisa que já está
// automática, e some a cobrança do que realmente depende de gente.
//
// Uso: node scripts/rotinas/processos.mjs [saida.png]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-processos.png`;
const NOITE = '#0b1020';
const GOLD = '#c9a84c';
const VERDE = '#3fb27f';

const ENVIOS = [
  {
    n: 1, quando: 'Mensal', prazo: 'até o 6º dia útil',
    titulo: 'Checklist das rotinas + ranking',
    oque: 'As 4 rotinas de montagem do mês, com quem faz, o prazo e se está feito ou pendente. O ranking do mês vai junto.',
    formato: '1 imagem', quem: 'Vivian envia · gerentes executam',
  },
  {
    n: 2, quando: 'Semanal', prazo: 'toda segunda',
    titulo: 'Relatório de uso da semana anterior',
    oque: 'Segunda a domingo, por loja: quem usou, o que estudaram, objeções consultadas, quem parou e o que fazer na semana.',
    formato: 'PDF completo + 1 imagem de resumo', quem: 'Vivian envia · todo o grupo lê',
  },
];

// O que roda sem ninguém tocar. Está na folha porque é metade do combinado —
// e porque o time precisa saber que o app cobra sozinho.
const AUTOMATICO = [
  ['Pop-up por cargo', 'Cada gerente recebe a sua conferência na janela certa do mês. O “ok” fica gravado com nome e hora.'],
  ['Campanha fechando', 'Dias 14 e 30, o vendedor é avisado de que a disputa está acabando.'],
  ['Condição vencida', 'Sai do ar sozinha na data de validade — taxa vencida não chega ao cliente.'],
  ['Carta em falta', 'Se a prateleira de veículo ficar vazia, Cristiano e Raphaela são avisados todo dia até alguém publicar.'],
  ['Relatório diário', 'Chega para a Vivian às 7h48 e às 18h42, sem pedir.'],
];

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;background:${NOITE};color:#eef1f8;font-family:Inter,-apple-system,Arial,sans-serif;padding:52px 48px 42px}
.marca{font-family:Cinzel,Georgia,serif;font-weight:800;font-size:21px;letter-spacing:.22em;color:#8b93ab}
h1{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:56px;line-height:1.04;margin-top:12px}
.sub{font-size:24px;color:#a8b0c6;margin-top:11px;line-height:1.35}

h2{font-size:17px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#7b84a0;margin:34px 0 16px}
.env{display:flex;gap:20px;background:#151c31;border:1px solid #232c47;border-radius:18px;
  padding:24px 26px;margin-bottom:18px}
.env .n{flex:none;width:46px;height:46px;border-radius:50%;border:2px solid ${GOLD};color:${GOLD};
  display:grid;place-items:center;font-family:Cinzel,Georgia,serif;font-weight:900;font-size:24px}
.env .c{flex:1;min-width:0}
.quando{display:inline-flex;align-items:center;gap:9px;font-size:18px;font-weight:800;
  letter-spacing:.08em;text-transform:uppercase;color:${GOLD}}
.quando em{font-style:normal;color:#7b84a0;font-weight:600;letter-spacing:0;text-transform:none;font-size:19px}
.tit{font-size:31px;font-weight:800;line-height:1.12;margin-top:7px}
.oq{font-size:21px;color:#a8b0c6;margin-top:7px;line-height:1.4}
.pe{display:flex;gap:30px;margin-top:14px;padding-top:12px;border-top:1px solid #232c47;font-size:19px}
.pe b{color:#7b84a0;font-size:16px;letter-spacing:.1em;text-transform:uppercase;display:block;margin-bottom:4px}
.pe span{color:#d6dbe9}

.auto{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #232c47}
.auto i{flex:none;width:9px;height:9px;margin-top:9px;border-radius:50%;background:${VERDE};font-style:normal}
.auto b{font-size:22px;font-weight:800;display:block}
.auto span{font-size:19px;color:#a8b0c6;line-height:1.35;display:block;margin-top:3px}
.rod{margin-top:26px;display:flex;justify-content:space-between;font-size:17px;color:#7b84a0}
</style>
<div class="marca">ELEVA · GRUPO RAMASA</div>
<h1>Processos do app</h1>
<p class="sub">Dois envios no grupo. O resto o app faz sozinho.</p>

<h2>O que alguém envia</h2>
${ENVIOS.map((e) => `
<div class="env">
  <span class="n">${e.n}</span>
  <div class="c">
    <span class="quando">${e.quando} <em>· ${e.prazo}</em></span>
    <div class="tit">${e.titulo}</div>
    <div class="oq">${e.oque}</div>
    <div class="pe">
      <div><b>Formato</b><span>${e.formato}</span></div>
      <div><b>Quem</b><span>${e.quem}</span></div>
    </div>
  </div>
</div>`).join('')}

<h2>O que o app faz sozinho</h2>
${AUTOMATICO.map(([t, d]) => `<div class="auto"><i></i><div><b>${t}</b><span>${d}</span></div></div>`).join('')}

<div class="rod"><span>Combinado em 13/10/2026</span><span>gsseleva.com.br</span></div>`;

const arq = '/tmp/processos.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable'); await c.send('Runtime.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 900, deviceScaleFactor: 2, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 1800));
const { result } = await c.send('Runtime.evaluate', { expression: 'document.body.scrollHeight', returnByValue: true });
await c.send('Emulation.setDeviceMetricsOverride', { width: 1080, height: result.value, deviceScaleFactor: 2, mobile: false });
await new Promise((r) => setTimeout(r, 500));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('processos:', SAIDA);
