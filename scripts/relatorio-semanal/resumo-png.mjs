// O RESUMO DA SEMANA EM UMA IMAGEM — o que vai no grupo junto com o PDF.
//
// A Vivian organizou o processo (13/10/2026): toda segunda, o relatório da
// semana anterior, por loja, completo em PDF — e um PNG junto.
//
// O PDF tem sete páginas e é para ler sentado. No grupo, sete páginas viram
// anexo que ninguém abre. O PNG é a capa: os números que fazem a pessoa
// querer abrir o PDF, e o ranking, que é o que o time procura primeiro.
//
// Lê o dados.json que o relatório já gerou — não refaz consulta nenhuma. Se o
// número divergir entre a imagem e o PDF, é bug meu, não duas medições.
//
// Uso: node scripts/relatorio-semanal/resumo-png.mjs [--semana 2026-10-05]
import fs from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';
import { ultimaSemana } from './dados.mjs';

const i = process.argv.indexOf('--semana');
const segunda = i > -1 ? process.argv[i + 1] : ultimaSemana();
const pasta = join(homedir(), '.claude', 'eleva-uso', 'relatorios', segunda);
const D = JSON.parse(fs.readFileSync(join(pasta, 'dados.json'), 'utf8'));

const br = (d) => d.split('-').reverse().slice(0, 2).join('/');
// A barra da data vira separador de pasta no nome do arquivo — o primeiro
// try gravou em "Downloads/Eleva - Semana 05/10 a 11/10.png" e o sistema
// entendeu "05" como diretório.
const arq_ = (d) => d.split('-').reverse().slice(0, 2).join('-');
const SAIDA = `${homedir()}/Downloads/Eleva - Semana ${arq_(D.de)} a ${arq_(D.ate)}.png`;

const NOITE = '#0b1020';
const GOLD = '#c9a84c';
const VERDE = '#3fb27f';
const VERMELHO = '#e07a68';

const CARGOS = {
  'vendedor-veiculos': 'veículos', 'vendedor-acessorios': 'acessórios', fi: 'F&I',
  'executivo-leads': 'leads', 'gerente-veiculos': 'gerente', 'gerente-acessorios': 'gerente',
  'supervisor-acessorios': 'supervisor', 'gerente-leads': 'gerente de leads',
};
const LOJA = { 'tiger-goiania': 'Tiger Goiânia', 'tiger-itumbiara': 'Tiger Itumbiara',
  'tiger-anapolis': 'Tiger Anápolis', grupo: 'Grupo' };

// A variação contra a semana anterior. Vale mais que o número absoluto: 168
// ações não diz nada sozinho; "29% a menos que na semana passada" diz.
const dif = (a, b) => (b ? Math.round(((a - b) / b) * 100) : 0);
const seta = (v) => (v > 0 ? `<span class="up">▲ +${v}%</span>`
  : v < 0 ? `<span class="dn">▼ ${v}%</span>` : '<span class="ig">= igual</span>');

const lojas = (D.lojas || []).slice().sort((a, b) => b.acoes - a.acoes);
const maxL = Math.max(1, ...lojas.map((l) => l.acoes));
const top = (D.ranking || []).slice(0, 5);

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;background:${NOITE};color:#eef1f8;font-family:Inter,-apple-system,Arial,sans-serif;padding:52px 48px 42px}
.marca{font-family:Cinzel,Georgia,serif;font-weight:800;font-size:21px;letter-spacing:.22em;color:#8b93ab}
h1{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:56px;line-height:1.04;margin-top:12px}
.sub{font-size:23px;color:#a8b0c6;margin-top:10px}

.nums{display:flex;gap:16px;margin-top:30px}
.nums div{flex:1;background:#151c31;border:1px solid #232c47;border-radius:16px;padding:20px 18px}
.nums b{display:block;font-family:Cinzel,Georgia,serif;font-weight:900;font-size:50px;line-height:1}
.nums span{display:block;font-size:18px;color:#a8b0c6;margin-top:9px;line-height:1.3}
.up{color:${VERDE};font-weight:800}.dn{color:${VERMELHO};font-weight:800}.ig{color:#7b84a0;font-weight:700}

h2{font-size:17px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#7b84a0;margin:34px 0 14px}
.loja{display:flex;align-items:center;gap:16px;margin-bottom:13px}
.loja .nm{flex:none;width:190px;font-size:22px;font-weight:700}
.loja .ba{flex:1;height:30px;background:#151c31;border-radius:7px;overflow:hidden}
.loja .ba i{display:block;height:100%;background:linear-gradient(90deg,${GOLD},#9c8137);border-radius:7px}
.loja .vl{flex:none;width:210px;font-size:19px;color:#a8b0c6;text-align:right}
.loja .vl b{color:#eef1f8;font-weight:800;font-size:22px}

.rk{display:flex;align-items:center;gap:15px;padding:13px 0;border-top:1px solid #232c47}
.rk:first-of-type{border-top:0}
.rk .p{flex:none;width:34px;height:34px;border-radius:50%;background:#151c31;border:1px solid #232c47;
  color:${GOLD};display:grid;place-items:center;font-family:Cinzel,Georgia,serif;font-weight:900;font-size:18px}
.rk .n{flex:1;font-size:23px;font-weight:700}
.rk .n i{font-style:normal;font-size:17px;color:#7b84a0;font-weight:500;margin-left:9px}
.rk .d{flex:none;font-size:19px;color:#a8b0c6}
.rk .d b{color:#eef1f8;font-weight:800}
.rk.ouro .p{background:rgba(201,168,76,.18);border-color:rgba(201,168,76,.5)}

.cx{margin-top:26px;background:#151c31;border:1px solid #232c47;border-radius:14px;padding:16px 18px;
  font-size:20px;line-height:1.45;color:#a8b0c6}
.cx b{color:#eef1f8}
.rod{margin-top:24px;padding-top:16px;border-top:1px solid #232c47;display:flex;justify-content:space-between;font-size:17px;color:#7b84a0}
</style>
<div class="marca">ELEVA · GRUPO RAMASA</div>
<h1>Semana de ${br(D.de)} a ${br(D.ate)}</h1>
<p class="sub">Uso do app no grupo — segunda a domingo. O relatório completo vai em PDF.</p>

<div class="nums">
  <div><b>${D.semana.pessoas}</b><span>pessoas usaram<br>${seta(dif(D.semana.pessoas, D.anterior.pessoas))}</span></div>
  <div><b>${D.semana.acoes}</b><span>ações no app<br>${seta(dif(D.semana.acoes, D.anterior.acoes))}</span></div>
  <div><b>${D.semana.materiais}</b><span>materiais ao cliente<br>${seta(dif(D.semana.materiais, D.anterior.materiais))}</span></div>
  <div><b>${D.semana.quiz}</b><span>quizzes aprovados<br>${seta(dif(D.semana.quiz, D.anterior.quiz))}</span></div>
</div>

<h2>Por loja</h2>
${lojas.map((l) => `
<div class="loja">
  <span class="nm">${LOJA[l.loja] || l.loja}</span>
  <span class="ba"><i style="width:${Math.max(3, Math.round((l.acoes / maxL) * 100))}%"></i></span>
  <span class="vl"><b>${l.acoes}</b> ações · ${l.pessoas} de ${l.contas} pessoas</span>
</div>`).join('')}

<h2>Quem mais usou</h2>
${top.map((p, n) => `
<div class="rk${n === 0 ? ' ouro' : ''}">
  <span class="p">${n + 1}</span>
  <span class="n">${p.nome}<i>${CARGOS[p.cargo] || p.cargo}</i></span>
  <span class="d"><b>${p.acoes}</b> ações · <b>${p.dias}</b> dias${p.quiz ? ` · <b>${p.quiz}</b> quiz` : ''}</span>
</div>`).join('')}

<div class="cx">
  <b>${D.semLoja} pessoas ainda não escolheram a loja</b> no perfil e por isso não entram na conta por
  unidade. <b>${(D.pararam || []).length}</b> têm conta e não usaram na semana.
</div>
<div class="rod"><span>Posição de ${new Date(D.geradoEm).toLocaleDateString('pt-BR')}</span><span>gsseleva.com.br</span></div>`;

const arq = '/tmp/resumo-semana.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable'); await c.send('Runtime.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 900, deviceScaleFactor: 2, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 2000));
const { result } = await c.send('Runtime.evaluate', { expression: 'document.body.scrollHeight', returnByValue: true });
await c.send('Emulation.setDeviceMetricsOverride', { width: 1080, height: result.value, deviceScaleFactor: 2, mobile: false });
await new Promise((r) => setTimeout(r, 500));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('resumo:', SAIDA);
