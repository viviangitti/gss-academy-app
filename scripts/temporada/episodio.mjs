// A ARTE DE CADA EPISÓDIO — sempre a mesma, e é esse o ponto.
//
// O que faz reconhecer um anúncio da Netflix não é o símbolo: é o formato se
// repetindo sem exceção. Título no mesmo lugar, data no mesmo canto, selo no
// mesmo tamanho. Na décima vez a pessoa já sabe onde olhar antes de ler.
//
// Por isso esta arte é gerada, não desenhada: o número do episódio e o carro
// mudam, mais nada. Quem pedir "só dessa vez" um layout diferente está pedindo
// para destruir a única coisa que faz a série parecer série.
//
// Uso: node scripts/temporada/episodio.mjs <saida.png> --ep 1 --carro jaecoo-7 --titulo "O essencial"
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const arg = (n, padrao) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : padrao; };
const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-ep.png`;
const EP = String(arg('ep', '1')).padStart(2, '0');
const CARRO = arg('carro', 'jaecoo-7');
const TITULO = arg('titulo', 'O essencial');
const FOCO = arg('foco', '');
const NOME = { 'jaecoo-7': 'Jaecoo 7', 'jaecoo-5': 'Jaecoo 5', 'omoda-5-shs-h': 'Omoda 5', 'omoda-7-shs-p': 'Omoda 7', 'omoda-e5': 'Omoda E5' }[CARRO] || CARRO;

const NOITE = '#07070f';
const GOLD = '#c9a84c';
// CADA EPISÓDIO COM UMA FOTO DIFERENTE DO MESMO CARRO.
//
// A primeira versão usava sempre a `-1`: quatro posts seguidos do Jaecoo 7
// saíam com a MESMA imagem, e em sequência no grupo isso não lê como série,
// lê como erro de quem montou. Cada carro tem quatro fotos no app; o número do
// episódio escolhe qual, girando. Dá para forçar com --foto.
const foto = (() => {
  const forcada = arg('foto', '');
  const n = forcada || String(((Number(EP) - 1) % 4) + 1);
  const f = `public/carros/${CARRO}-${n}.jpg`;
  if (!fs.existsSync(f)) throw new Error(`não achei a foto ${f}`);
  return 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64');
})();

const L = 1080, A = 1350;
const html = `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${L}px;height:${A}px;background:${NOITE};color:#f4f3f0;
  font-family:Inter,-apple-system,Arial,sans-serif;overflow:hidden;position:relative}

/* A FOTO OCUPA O ALTO E MORRE NO ESCURO.
   É o corte das plataformas de streaming: a imagem não tem borda de baixo, ela
   se dissolve no fundo e o texto nasce de dentro dela. */
.capa{position:absolute;inset:0 0 auto 0;height:63%;overflow:hidden}
.capa img{width:100%;height:100%;object-fit:cover;object-position:center 42%}
.capa::after{content:'';position:absolute;inset:0;
  background:linear-gradient(transparent 28%, rgba(7,7,15,.72) 68%, ${NOITE} 97%)}

.pg{position:relative;height:100%;padding:52px 64px 56px;display:flex;flex-direction:column}

/* O SELO DO EPISÓDIO — canto de cima, à esquerda, sempre.
   É o lugar fixo que a pessoa aprende a procurar. */
.selo{display:inline-flex;align-items:baseline;gap:13px;align-self:flex-start;
  background:rgba(7,7,15,.62);backdrop-filter:blur(6px);
  border:2px solid ${GOLD};border-radius:999px;padding:14px 28px 15px}
.selo .k{font-size:21px;font-weight:900;letter-spacing:.24em;color:${GOLD};text-transform:uppercase}
.selo .n{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:36px;color:#f4f3f0;line-height:1}

.meio{margin-top:auto}
.carro{font-size:28px;font-weight:800;letter-spacing:.26em;text-transform:uppercase;color:${GOLD}}
h1{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:96px;line-height:1.04;margin:14px 0 0;letter-spacing:-.01em}
.foco{font-size:37px;color:#aab0c2;margin-top:20px;line-height:1.38;max-width:880px}

.quiz{display:flex;align-items:center;gap:18px;margin-top:34px;font-size:36px}
.quiz i{flex:none;width:15px;height:15px;border-radius:50%;background:${GOLD};font-style:normal}
.quiz b{font-weight:800}

/* O RODAPÉ NUNCA MUDA: esquerda onde está, direita quanto vale. */
.rodape{margin-top:40px;border-top:1.5px solid rgba(255,255,255,.16);padding-top:30px;
  display:flex;align-items:flex-end;justify-content:space-between}
.rodape .k{font-size:21px;font-weight:800;letter-spacing:.2em;color:#8e94a8;text-transform:uppercase}
.rodape .v{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:46px;color:${GOLD};margin-top:8px;line-height:1}
.premio{text-align:right}
.premio .v{font-family:Inter,sans-serif;font-size:37px;font-weight:800;color:#f4f3f0;line-height:1.25}
.premio .v span{color:${GOLD}}
</style>
<div class="capa"><img src="${foto}"></div>
<div class="pg">
  <div class="selo"><span class="k">Episódio</span><span class="n">${EP}</span></div>
  <div class="meio">
    <div class="carro">${NOME}</div>
    <h1>${TITULO}</h1>
    ${FOCO ? `<p class="foco">${FOCO}</p>` : ''}
    <div class="quiz"><i></i><span><b>3 perguntas</b> no fim · cada acerto vale ponto</span></div>
  </div>
  <div class="rodape">
    <!-- O RODAPÉ ENSINA O RITMO, toda vez. Era "no ar agora / no app", que
         diz duas vezes a mesma coisa e não ensina nada. O dia fixo repetido em
         cada episódio é o que constrói o hábito: na terceira semana a pessoa
         abre o app na terça sem ninguém avisar. -->
    <div><div class="k">Episódio novo</div><div class="v">terça e quinta</div></div>
    <div class="premio"><div class="k">Prêmio do mês</div><div class="v"><span>R$ 500</span> em combustível</div></div>
  </div>
</div>`;

const arq = '/tmp/ep.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: L, height: A, deviceScaleFactor: 1, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 3000));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('ep', EP, '→', SAIDA);
