import fs from 'fs';
import { abrirChrome, conectar } from './cdp.mjs';
import { VENDEDOR, GERENTE, DROGARIA } from './roteiros.mjs';

const QUAL = process.argv[2]; // 'vendedor' | 'gerente' | 'drogaria'
// Cenas avulsas: `node capturar.mjs gerente 17-instalar,16-fim` regrava só
// essas e NÃO apaga a pasta. Sem isso, consertar o seletor de uma cena obrigava
// a regravar as cinquenta — e a refazer o remendo temporário do Painel.
const SO = (process.argv[3] || '').split(',').map((x) => x.trim()).filter(Boolean);
const TODAS = QUAL === 'gerente' ? GERENTE : QUAL === 'drogaria' ? DROGARIA : VENDEDOR;
const CENAS = SO.length ? TODAS.filter((c) => SO.includes(c.id)) : TODAS;
const SAIDA = `frames-${QUAL}`;
if (!SO.length) fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });
if (SO.length && CENAS.length !== SO.length) {
  console.log('cenas não encontradas:', SO.filter((id) => !CENAS.some((c) => c.id === id)).join(', '));
}

const condicoes = JSON.parse(fs.readFileSync('condicoes-reais.json', 'utf8'));
// O TIME REAL, pra aba Resultados do vídeo mostrar gente de verdade em vez de
// tela vazia. A sessão de gravação não tem login do Firebase, então a leitura
// do time falha e o painel fica em branco — que foi o que a Vivian viu.
// Só a gravação usa isto (ver o remendo temporário em teamStats.ts).
const TIME = JSON.parse(fs.readFileSync('time-ramasa.json', 'utf8'));
const folha = fs.readFileSync('folha-omoda5.txt', 'utf8');

// A CONVERSA QUE APARECE NO TIRA-DÚVIDA. É uma pergunta real do balcão, com a
// resposta saindo do conteúdo publicado — não do que a IA acha.
const CONVERSA = QUAL === 'drogaria'
  ? [
      { role: 'user', content: 'A cliente disse que arrota gosto de peixe com o ômega 3. O que eu ofereço?' },
      { role: 'assistant', content: 'Primeiro a orientação simples: tomar **junto de uma refeição**, que é o que mais reduz o retorno do sabor.\n\nSe continuar incomodando, ofereça o **Ômega 3 Mini Caps** — o mesmo ômega 3 em cápsula menor, mais fácil de engolir — ou o **Ômega 3 Plus**, com mais EPA e DHA por cápsula.\n\nLembre de comunicar como suplemento: auxilia e contribui, nunca cura nem trata.' },
    ]
  : [
      { role: 'user', content: 'Cliente tem um seminovo com FIPE de R$ 45.000 e quer um Omoda 7 Luxury. Ele leva o bônus de trade-in inteiro?' },
      { role: 'assistant', content: 'Não. Para o Omoda 7 LUXURY, o seminovo precisa ter FIPE a partir de **R$ 70.000** para levar 100% do bônus.' },
    ];
// A folha entra só na condição que o vídeo abre — as outras ficam sem arquivo,
// como na vida real (a folha só desce quando alguém abre).
const comFolha = condicoes.map((c) => (c.id === 'carta-set26-omoda-5' ? { ...c, arquivo: folha } : c));

const USUARIO = QUAL === 'gerente'
  ? { uid: 'c', name: 'Cristiano Maciel', email: 'cristiano.maciel@gruporamasa.com', role: 'gestor', brands: ['ramasa'], cargo: 'gerente-veiculos' }
  : QUAL === 'drogaria'
  ? { uid: 'b', name: 'Ana', email: 'ana@drogariasaopaulo.com.br', role: 'balconista', brands: ['dsp'] }
  : { uid: 'v', name: 'Walther', email: 'walther@gruporamasa.com', role: 'balconista', brands: ['ramasa'], cargo: 'vendedor-veiculos' };

// A MARCA DA GRAVAÇÃO. O vídeo da Drogaria São Paulo mostra as telas DELES:
// mesmo app, catálogo deles, cor deles. Gravar farmácia com carro na tela seria
// entregar o material de outro cliente.
const MARCA = QUAL === 'drogaria' ? 'dsp' : 'ramasa';

const SEMENTE = `
  localStorage.setItem('wp_brand', ${JSON.stringify(MARCA)});
  localStorage.setItem('wp_demo_time', ${JSON.stringify(JSON.stringify(TIME))});
  localStorage.setItem('wp_onboarded', '1');
  // A Jornada com os campos preenchidos: no vídeo, script com "[nome do cliente]"
  // no meio da frase parece defeito, não exemplo.
  localStorage.setItem('wp_jornada_campos', JSON.stringify({ cliente: 'Marcos', carro: 'Jaecoo 7', vendedor: 'Walther', loja: 'Tiger Omoda' }));
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
  localStorage.setItem('wp_ia_conversa:' + ${JSON.stringify(MARCA)} + ':' + ${JSON.stringify(USUARIO.email)}, JSON.stringify({em: Date.now(), msgs: ${JSON.stringify(CONVERSA)}}));
  localStorage.setItem('wp_ia_conversa_velha:ramasa:' + ${JSON.stringify(USUARIO.email)}, JSON.stringify({em: Date.now(), msgs: [
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

// O ENDEREÇO DO SERVIDOR DE DESENVOLVIMENTO.
//
// Já mordeu duas vezes, dos dois lados: houve o dia em que o Vite subiu só em
// IPv6 e o Chrome, tentando IPv4, gravou quadro branco; e houve o dia em que
// o Chrome desta máquina não alcançou `[::1]` e gravou "site não acessível" —
// 14 cenas idênticas, todas com a tela de erro. Agora o padrão é localhost
// (que resolve os dois) e dá para forçar: ELEVA_URL=http://127.0.0.1:5173 node capturar.mjs ...
const ENDERECO = process.env.ELEVA_URL || 'http://localhost:5173';

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
  // O RELÓGIO DA CENA. Os rituais do mês só aparecem na janela do cargo — a
  // revisão de qualidade no primeiro dia útil, a campanha nos dias 14 e 30. Sem
  // adiantar o relógio, gravar essas telas só seria possível nesses dias.
  // Entra no MESMO script do acesso porque os dois têm que valer antes de o app
  // montar, e porque o removedor de scripts guarda um identificador só.
  const relogio = cena.relogio ? `(() => {
    const alvo = new Date(${JSON.stringify(cena.relogio)}).getTime();
    const _D = Date; const delta = alvo - _D.now();
    function D(...a) { return a.length ? new _D(...a) : new _D(_D.now() + delta); }
    D.now = () => _D.now() + delta; D.parse = _D.parse; D.UTC = _D.UTC; D.prototype = _D.prototype;
    Object.setPrototypeOf(D, _D); window.Date = D;
  })();
  localStorage.removeItem('wp_rituais_ok'); localStorage.removeItem('wp_ritual_adiado');` : '';
  const posto = await c.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `localStorage.setItem('wp_dev_user', ${JSON.stringify(JSON.stringify(quem))}); ${relogio}`,
  });
  idAcesso = posto.identifier;
  await c.send('Page.navigate', { url: `${ENDERECO}${cena.url}` });
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
