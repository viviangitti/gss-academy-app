// AS 7 ABAS, UMA POR UMA — as capturas do deck "O app em 7 abas".
//
// A barra de baixo tem 7 abas para a concessionária, e ela MUDA com o papel:
// o gestor vê Painel e "Ver como time" onde o vendedor vê Hoje e Carros
// (src/pilulas/BottomNav.tsx). Este deck retrata a barra do GESTOR, que é a do
// slide que a Vivian apontou — então Painel e Ver como time são capturados
// logado como gestora, e o resto como vendedor, que é quem usa aquelas telas
// no dia a dia.
//
// Uso: node scripts/deck-app/captura-abas.mjs <pasta-de-saida>
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2];
if (!SAIDA) { console.error('falta a pasta de saída'); process.exit(1); }

const T = '/Users/viviangitti/gss/scripts/tutorial/';
const TIME = fs.readFileSync(T + 'time-ramasa.json', 'utf8');
const ARGS = fs.readFileSync(T + 'argumentos-ramasa.json', 'utf8');
const OBJS = fs.readFileSync(T + 'objecoes-ramasa.json', 'utf8');
// AS CONDIÇÕES REAIS, semeadas no cache do aparelho.
//
// A aba Condições lê do Firestore, e a sessão de captura não tem login do
// Firebase — sem isto ela fotografa "Nenhuma tabela publicada ainda", que é
// justamente o contrário do que a aba faz. São as mesmas 14 folhas que o time
// da Ramasa vê, lidas do banco por scripts/tutorial (condicoes-reais.json).
const CONDICOES = (() => {
  // A FOLHA DA CAMPANHA, DE VERDADE.
  //
  // A sessão de captura não tem login do Firebase, então toda folha vinha como
  // "não consegui abrir a folha". A arte da Premiação de setembro existe em
  // disco (é a que está no ar), então ela entra embutida no cache e a tela
  // fotografa o que o time vê de verdade.
  const lista = JSON.parse(fs.readFileSync(T + 'condicoes-reais.json', 'utf8'));
  const arte = fs.readFileSync('/private/tmp/claude-501/-Users-viviangitti-gss/84f94a70-efb7-46bd-8bda-f478a2a6d14f/scratchpad/abas/campanha-dataurl.txt', 'utf8');
  return JSON.stringify(lista.map((c) => (c.id === 'campanha-set26-premiacao' ? { ...c, arquivo: arte } : c)));
})();

const VENDEDOR = { uid: 'demo-vend', name: 'Walther', email: 'walther@tigeromoda.com.br',
  role: 'balconista', cargo: 'vendedor-veiculos', brands: ['ramasa'], loja: 'tiger-goiania' };
const GESTOR = { uid: 's6OJY8iOFiP3uZPWG7TelexMBwl2', name: 'Mariana', email: 'mariana@gruporamasa.com',
  role: 'gestor', cargo: 'diretor', brands: ['ramasa'] };

const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');

// A CONVERSA DO TIRA-DÚVIDA, plantada com carimbo de HOJE.
// Sem isso a aba aparece vazia; e com carimbo velho a tela escreveria
// "Conversa de 25/09" em cima do print (ver src/pilulas/data/conversaIA.ts).
const agora = Date.now();
// Curta de propósito: o chat abre rolado para o fim, e uma resposta longa
// entrava com o balão da pergunta cortado em cima. Esta cabe inteira na tela.
const CONVERSA = [
  { role: 'user', content: '"É chinês, né?" — o cliente travou nisso. O que eu respondo?', at: agora - 240000 },
  { role: 'assistant', content: 'Essa é a objeção de MARCA, Walther. Responde com fato, não com adjetivo:\n\n1. Acolhe: "Faz sentido, é marca nova por aqui."\n2. Tamanho: a Chery vende 1,9 milhão de carros por ano e exporta há 25 anos.\n3. Prova local: o Jaecoo 7 tem 5 estrelas no Latin NCAP.\n4. Garantia: 6 anos. Ninguém dá 6 anos em carro que não confia.\n\nE convide para o test drive: marca desconhecida vira conhecida no banco do motorista, não na conversa.', at: agora - 235000 },
];

async function semente(user, extra = '') {
  await c.send('Page.addScriptToEvaluateOnNewDocument', {
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
      ${extra}

      // O APP FALANDO DE SI MESMO FICA FORA DO PRINT.
      //
      // O pacote de desenvolvimento nunca bate com o sw.js publicado, então a
      // faixa azul "Tem uma versão nova do app" aparecia em TODA captura,
      // tapando justamente a barra de abas que este deck existe para mostrar.
      //
      // Vem DEPOIS da semente e dentro de try: este script roda antes de o
      // documento existir, e uma exceção aqui derrubava o localStorage inteiro
      // — as capturas voltavam com a tela de login, sem ninguém logado.
      try {
        if (navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () {});
        }
      } catch (e) { /* sem service worker: melhor ainda */ }
      try {
        var porEstilo = function () {
          try {
            if (document.getElementById('sem-avisos')) return;
            var alvo = document.head || document.documentElement;
            if (!alvo) return;
            var st = document.createElement('style');
            st.id = 'sem-avisos';
            // .wp-rit-fundo é o ritual do mês: no dia 14 e no dia 30 ele abre por cima
            // de tudo e tapa a tela inteira. É comportamento certo do app e errado
            // para a foto.
            st.textContent = '.wp-aviso, .wp-rit-fundo{display:none !important}';
            alvo.appendChild(st);
          } catch (e) { /* ainda não deu: o DOMContentLoaded tenta de novo */ }
        };
        porEstilo();
        document.addEventListener('DOMContentLoaded', porEstilo);
      } catch (e) { /* pior caso: a faixa aparece e eu recorto */ }
    `,
  });
}

async function tela(rota, arquivo, { espera = 3500, rolar = 0, clicar = '' } = {}) {
  await c.send('Page.navigate', { url: 'http://localhost:5173' + rota });
  await new Promise((r) => setTimeout(r, espera));
  if (clicar) {
    // A aba Condições abre numa lista de categorias e o resto da tela fica
    // vazio — num slide isso parece tela sem conteúdo. Entrando em Veículos,
    // o print mostra o que a aba realmente entrega: as folhas publicadas.
    const r = await c.send('Runtime.evaluate', {
      expression: `(() => {
        const alvo = ${JSON.stringify(clicar)};
        const el = [...document.querySelectorAll('button, a, [role=button]')]
          .find((e) => (e.textContent || '').trim().startsWith(alvo));
        if (!el) return 'NAO ACHEI: ' + alvo;
        el.click();
        return 'ok';
      })()`,
    });
    const diz = r?.result?.value;
    if (diz !== 'ok') throw new Error(`clique falhou em ${arquivo}: ${diz}`);
    await new Promise((x) => setTimeout(x, 1400));
  }
  if (rolar) {
    await c.send('Runtime.evaluate', { expression: `window.scrollTo({top:${rolar}})` });
    await new Promise((r) => setTimeout(r, 900));
  }
  const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${SAIDA}/telas/${arquivo}`, Buffer.from(data, 'base64'));
  console.log('  ', arquivo);
}

await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });

console.log('como GESTORA (Mariana):');
await semente(GESTOR);
await tela('/eleva/gestor', 'painel.png', { rolar: 430 });
await tela('/eleva/catalogo', 'ver-como-time.png', { rolar: 250 });

console.log('como VENDEDOR (Walther):');
await semente(VENDEDOR);
await tela('/eleva/jornada', 'jornada.png');
// DENTRO DA ABA: os assets que a GSS produziu para a Ramasa.
// A Vivian pediu para o slide mostrar o que existe dentro de Condições — o
// catálogo de acessórios e a campanha da casa — e não só as três categorias.
await tela('/eleva/ofertas', 'cond-campanha.png', { clicar: 'Campanhas da casa', espera: 4500 });
await tela('/eleva/acessorio/estribo-iluminado', 'acessorio.png');
// A FICHA DO ACESSÓRIO como documento: é material, não tela de app.
await tela('/eleva/ficha/estribo-iluminado', 'ficha-acessorio.png');

// FICA NA TELA DE ENTRADA DA ABA, de propósito.
// Entrar em "Veículos" mostraria as folhas — mas a sessão de captura não tem
// login do Firebase e cada folha vira "não consegui abrir a folha". Tela de
// erro num deck de venda é pior que tela com espaço sobrando.
await tela('/eleva/ofertas', 'condicoes.png');
await tela('/eleva/noticias', 'noticias.png', { espera: 6000 });
await tela('/eleva/documentos', 'documentos.png', { rolar: 120 });
await tela('/eleva/assistente', 'tira-duvida.png', { espera: 4500 });

c.fechar(); proc.kill();
console.log('\npronto:', SAIDA + '/telas');
