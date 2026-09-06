import fs from 'fs';
import { abrirChrome, conectar } from './cdp.mjs';
import { VENDEDOR, GERENTE } from './roteiros.mjs';

const QUAL = process.argv[2]; // 'vendedor' | 'gerente'
const CENAS = QUAL === 'gerente' ? GERENTE : VENDEDOR;
const SAIDA = `frames-${QUAL}`;
fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

const condicoes = JSON.parse(fs.readFileSync('condicoes-reais.json', 'utf8'));
// O TIME REAL, pra aba Resultados do vídeo mostrar gente de verdade em vez de
// tela vazia. A sessão de gravação não tem login do Firebase, então a leitura
// do time falha e o painel fica em branco — que foi o que a Vivian viu.
// Só a gravação usa isto (ver o remendo temporário em teamStats.ts).
const TIME = JSON.parse(fs.readFileSync('time-ramasa.json', 'utf8'));
const folha = fs.readFileSync('folha-omoda5.txt', 'utf8');
// A folha entra só na condição que o vídeo abre — as outras ficam sem arquivo,
// como na vida real (a folha só desce quando alguém abre).
const comFolha = condicoes.map((c) => (c.id === 'carta-set26-omoda-5' ? { ...c, arquivo: folha } : c));

const USUARIO = QUAL === 'gerente'
  ? { uid: 'c', name: 'Cristiano Maciel', email: 'cristiano.maciel@gruporamasa.com', role: 'gestor', brands: ['ramasa'], cargo: 'gerente-veiculos' }
  : { uid: 'v', name: 'Walther', email: 'walther@gruporamasa.com', role: 'balconista', brands: ['ramasa'], cargo: 'vendedor-veiculos' };

const SEMENTE = `
  localStorage.setItem('wp_brand', 'ramasa');
  localStorage.setItem('wp_demo_time', ${JSON.stringify(JSON.stringify(TIME))});
  localStorage.setItem('wp_onboarded', '1');
  localStorage.setItem('wp_instalar_dispensado', '1');
  localStorage.setItem('wp_condicoes', ${JSON.stringify(JSON.stringify(comFolha))});
  // SÓ NA GRAVAÇÃO: esconde a barra de "tem versão nova".
  // O servidor de desenvolvimento serve um sw.js mais novo que o pacote em
  // execução, então o app — corretamente — avisa que está atrasado. No app de
  // verdade a barra só aparece quando há versão nova mesmo; aqui ela cobriria
  // o rodapé de todos os quadros.
  document.addEventListener('DOMContentLoaded', () => {
    const e = document.createElement('style');
    e.textContent = '.wp-aviso-versao{display:none!important}';
    document.head.appendChild(e);
    // SÓ NA GRAVAÇÃO: o aviso de "acesso ao Painel não liberado" existe porque
    // a sessão de captura não tem login do Firebase. Na conta real de quem
    // assiste ele não aparece — deixá-lo no vídeo ensinaria um erro.
    const limpa = () => document.querySelectorAll('p,div').forEach((n) => {
      if (n.children.length === 0 && /acesso ao Painel ainda não foi liberado/.test(n.textContent || '')) {
        n.closest('div')?.remove();
      }
    });
    limpa();
    const t = setInterval(limpa, 400);
    setTimeout(() => clearInterval(t), 8000);
  });
  localStorage.setItem('wp_ia_conversa:ramasa:' + ${JSON.stringify(USUARIO.email)}, JSON.stringify({em: Date.now(), msgs: [
    { role: 'user', content: 'Cliente tem um seminovo com FIPE de R$ 45.000 e quer um Omoda 7 Luxury. Ele leva o bônus de trade-in inteiro?' },
    { role: 'assistant', content: 'Não. Para o Omoda 7 LUXURY, o seminovo precisa ter FIPE a partir de **R$ 70.000** para levar 100% do bônus, ou entre R$ 50.000 e R$ 69.999 para levar 50%. Com R$ 45.000 ele fica abaixo da faixa e **não há bônus de trade-in**.\\n\\nMas a versão já tem **BÔNUS VAREJO de R$ 10.000**, que soma com a opção escolhida. Apresente a condição A (taxa 0%, entrada 60%, 36x) somando esse bônus, e faça a avaliação do seminovo para abater no total.' },
  ]}));
  localStorage.setItem('wp_stats_v1:' + ${JSON.stringify(USUARIO.email)}, JSON.stringify({perProduct:{'omoda-5-shs-h@2026-09-05':1},perQuiz:{'omoda-5-shs-h':1},perMission:{}}));
`;

const { proc, ws } = await abrirChrome();
const c = conectar(ws);
await c.pronto;
await c.send('Page.enable');
await c.send('Runtime.enable');
await c.send('Emulation.setDeviceMetricsOverride', {
  width: 390, height: 844, deviceScaleFactor: 3, mobile: true,
});
await c.send('Page.addScriptToEvaluateOnNewDocument', { source: SEMENTE });

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let idAcesso = null;

for (const cena of CENAS) {
  // Cena DESENHADA (os passos do Safari): não tem tela pra capturar, só copia.
  if (cena.ilustracao) {
    fs.copyFileSync(cena.ilustracao, `${SAIDA}/${cena.id}.png`);
    fs.writeFileSync(`${SAIDA}/${cena.id}.json`, 'null');
    console.log('🎨', cena.id);
    continue;
  }
  // Alguns passos só existem no iPhone: o cartão de instalar muda de texto
  // conforme o navegador, e o time é de iPhone.
  await c.send('Emulation.setUserAgentOverride', { userAgent: cena.ua || '' });
  // O ACESSO DA CENA, trocado a cada uma.
  //
  // addScriptToEvaluateOnNewDocument ACUMULA: um script injetado numa cena
  // continua rodando nas seguintes. Foi assim que o vídeo do gerente virou o
  // vídeo da Silmara da cena 8 em diante — as telas de acessório precisam do
  // acesso dela, e ele ficou grudado até o fim. Agora o anterior é removido
  // antes de entrar o novo.
  if (idAcesso) {
    await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: idAcesso }).catch(() => {});
    idAcesso = null;
  }
  const quem = cena.usuario || USUARIO;
  const posto = await c.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `localStorage.setItem('wp_dev_user', ${JSON.stringify(JSON.stringify(quem))});`,
  });
  idAcesso = posto.identifier;
  await c.send('Page.navigate', { url: `http://[::1]:5173${cena.url}` });
  await espera(cena.espera || 2000);
  if (cena.acao) {
    await c.send('Runtime.evaluate', {
      expression: `(async()=>{ ${cena.acao} })()`, awaitPromise: true,
    }).catch((e) => console.log(`  ação falhou em ${cena.id}: ${e.message}`));
    await espera(1400);
  }
  // Onde está, NA TELA, o que a narração vai falar. Medido agora, não chutado:
  // seletor errado ou elemento fora de vista devolve nulo e a cena fica sem
  // marca, em vez de com um círculo no lugar errado.
  let caixa = null;
  if (cena.foco) {
    const m = await c.send('Runtime.evaluate', {
      expression: `(()=>{ const el = ${cena.foco}; if(!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > innerHeight) return null;
        return JSON.stringify({x:r.x, y:r.y, w:r.width, h:r.height}); })()`,
    }).catch(() => null);
    if (m?.result?.value) caixa = JSON.parse(m.result.value);
    if (!caixa) console.log(`  (sem marca em ${cena.id})`);
  }
  const r = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(`${SAIDA}/${cena.id}.png`, Buffer.from(r.data, 'base64'));
  fs.writeFileSync(`${SAIDA}/${cena.id}.json`, JSON.stringify(caixa));
  console.log('📸', cena.id, caixa ? '◎' : '');
}

c.fechar();
proc.kill();
console.log('\nframes em', SAIDA);
