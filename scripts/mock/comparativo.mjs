// MOCK: comparativo entre modelos da casa + resumo da persona no fim da ficha.
//
// Pedido da Vivian (13/10/2026), a partir de uma conversa com o cliente: um
// comparativo entre os modelos da própria Omoda, e um resumo de persona no fim
// da ficha ("o Omoda 5 é um carro para quem valoriza X, Y e Z").
//
// É MOCK: não mexe no app. Serve para ela decidir a forma antes de eu construir.
//
// Três decisões que o desenho carrega, e que valem discussão:
//
// 1. OS TRÊS ATRIBUTOS NÃO SÃO MINHA OPINIÃO. Saem de "O QUE O TIME DIZ QUE
//    FECHA ESTE CARRO", do roteiro que a Ramasa recebeu em 03/09 — que por sua
//    vez saiu de uma pesquisa com 16 vendedores, 192 respostas. Se eu
//    escrevesse os adjetivos, a primeira pergunta da Mariana seria "quem disse?".
//
// 2. NENHUM CARRO GANHA. Os dois são dela. Comparativo com vencedor ensina o
//    vendedor a derrubar metade do próprio estoque. Por isso cada coluna fecha
//    com "é a escolha quando…", não com um selo de melhor.
//
// 3. A LINHA QUE DECIDE É "TIPO", não porta-malas. Plug-in, híbrido pleno e
//    elétrico resolvem rotinas diferentes — é aí que o cliente se reconhece.
//
// Uso: node scripts/mock/comparativo.mjs [saida.png]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-mock-comparativo.png`;
const TINTA = '#17231d';
const ROTULO = '#7a857f';
const BORDA = '#e8ebe6';
const ESCURO = '#1a1a2e';
const VERDE = '#1f7a4d';

// Os três atributos vêm do roteiro de 03/09. O Jaecoo 5 não tem roteiro — e o
// mock mostra justamente como fica esse caso, em vez de escondê-lo.
const CARROS = {
  'omoda-5': {
    nome: 'Omoda 5 SHS-H',
    frase: 'É pra quem quer cortar combustível sem mudar nada na rotina.',
    tags: ['Autonomia', 'Tecnologia', 'Sem tomada'],
    tipo: 'Híbrido autorrecarregável — não carrega na tomada',
    malas: '372 L', eixos: '2.610 mm', cem: '7,9 s', comp: '4.447 mm',
    quando: 'o cliente roda muito na cidade e não quer obra em casa.',
  },
  'omoda-7': {
    nome: 'Omoda 7 SHS-P',
    frase: 'É pra quem quer o topo de acabamento sem abrir mão da estrada.',
    tags: ['Acabamento', 'Espaço', 'Autonomia'],
    tipo: 'Híbrido plug-in — roda como híbrido só abastecendo',
    malas: '590 L', eixos: '2.720 mm', cem: '8,4 s', comp: '4.660 mm',
    quando: 'a família é maior, pega estrada e tem onde carregar em casa.',
  },
};

const linhas = [
  ['O que é', 'tipo', true],
  ['Porta-malas', 'malas', false],
  ['Entre-eixos', 'eixos', false],
  ['Comprimento', 'comp', false],
  ['0 a 100', 'cem', false],
];

const fone = (titulo, corpo) => `
<div class="fone">
  <div class="rot">${titulo}</div>
  <div class="tela">${corpo}</div>
</div>`;

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#eef0ee;font-family:Inter,-apple-system,Arial,sans-serif;color:${TINTA};
  padding:38px 34px;display:flex;gap:30px;align-items:flex-start;width:max-content}
.fone{width:390px}
.rot{font-size:15px;font-weight:800;color:#5c6660;margin-bottom:12px;letter-spacing:.01em}
.tela{background:#fff;border-radius:22px;padding:22px 20px 26px;border:1px solid #dfe3df;
  box-shadow:0 12px 30px rgba(0,0,0,.07)}

h2{font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${ROTULO};margin-bottom:7px}
.p{font-size:13px;line-height:1.55}
.sep{border-top:1px solid ${BORDA};margin:16px 0}

/* o resumo da persona */
.frase{font-size:16px;font-weight:800;line-height:1.3;margin-bottom:10px}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.tag{font-size:11.5px;font-weight:700;padding:5px 10px;border-radius:999px;
  background:#eaf3ee;color:${VERDE};border:1px solid #cfe5d8}
.fonte{font-size:10.5px;color:#9aa49e;line-height:1.45;margin-top:9px}
.antigo{font-size:12.5px;line-height:1.5;color:#5c6660}

/* botão do comparativo */
.btn{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;
  margin-top:16px;padding:13px 15px;border-radius:12px;background:${ESCURO};color:#fff;
  font-size:13.5px;font-weight:700}
.btn svg{width:17px;height:17px;flex:none}

/* a tabela do comparativo */
.cab{display:flex;gap:10px;margin-bottom:4px}
.col{flex:1;min-width:0}
.col .nm{font-size:13.5px;font-weight:800;line-height:1.2}
.col .ts{display:flex;flex-wrap:wrap;gap:4px;margin-top:7px}
.col .ts i{font-style:normal;font-size:10px;font-weight:700;padding:3px 7px;border-radius:999px;
  background:#eaf3ee;color:${VERDE};border:1px solid #cfe5d8}
.lin{border-top:1px solid ${BORDA};padding:11px 0}
.lin .lb{font-size:9.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${ROTULO};margin-bottom:6px}
.lin .vs{display:flex;gap:10px}
.lin .vs div{flex:1;min-width:0;font-size:12.5px;line-height:1.4}
.lin.dec{background:#fbfaf5;margin:0 -8px;padding:11px 8px;border-radius:9px}
.lin.dec .lb{color:#8a7a3e}
.lin .lb em{font-style:normal;font-weight:700;letter-spacing:0;text-transform:none;font-size:10px}

.quando{display:flex;gap:10px;margin-top:14px}
.quando div{flex:1;background:#f6f8f6;border:1px solid ${BORDA};border-radius:11px;padding:10px 11px;
  font-size:11.5px;line-height:1.45;color:#44504a}
.quando b{display:block;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:${ROTULO};margin-bottom:5px}

/* o seletor */
.op{display:flex;align-items:center;gap:11px;padding:12px 0;border-top:1px solid ${BORDA}}
.op:first-of-type{border-top:0}
.op .bo{width:34px;height:34px;border-radius:9px;background:#f0f2f0;flex:none}
.op .tx{flex:1;min-width:0}
.op .tx b{display:block;font-size:13px;font-weight:800}
.op .tx span{display:block;font-size:11px;color:#7a857f;margin-top:2px}
.op .ck{width:19px;height:19px;border-radius:50%;border:2px solid #d6dbd7;flex:none}
.op.on .ck{border-color:${VERDE};background:${VERDE};box-shadow:inset 0 0 0 3px #fff}
.aviso{margin-top:13px;background:#fdf7e8;border:1px solid #ecd9a4;border-radius:10px;
  padding:10px 12px;font-size:11.5px;line-height:1.5;color:#6b5a2e}
</style>

${fone('1 · Fim da ficha — o resumo da persona', `
  <h2>Para quem é</h2>
  <p class="frase">O Omoda 5 é pra quem quer cortar combustível sem mudar nada na rotina.</p>
  <div class="tags"><span class="tag">Autonomia</span><span class="tag">Tecnologia</span><span class="tag">Sem tomada</span></div>
  <p class="antigo">Cliente urbano que roda muito na cidade, quer cortar combustível e não quer obra em casa nem depender de eletroposto.</p>
  <p class="fonte">Os três pontos saem do que o time respondeu sobre o que fecha este carro — pesquisa com 16 vendedores, 192 respostas.</p>
  <button class="btn">Comparar com outro modelo da casa
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  </button>
`)}

${fone('2 · O comparativo', `
  <h2>Omoda 5 × Omoda 7</h2>
  <div class="cab">
    ${Object.values(CARROS).map((c) => `
    <div class="col"><span class="nm">${c.nome}</span>
      <span class="ts">${c.tags.map((t) => `<i>${t}</i>`).join('')}</span>
    </div>`).join('')}
  </div>
  ${linhas.map(([lb, k, dec]) => `
  <div class="lin${dec ? ' dec' : ''}">
    <div class="lb">${lb}${dec ? ' <em>— é esta linha que decide</em>' : ''}</div>
    <div class="vs">${Object.values(CARROS).map((c) => `<div>${c[k]}</div>`).join('')}</div>
  </div>`).join('')}
  <div class="quando">
    ${Object.values(CARROS).map((c) => `<div><b>É a escolha quando</b>${c.quando}</div>`).join('')}
  </div>
`)}

${fone('3 · Escolher o outro modelo', `
  <h2>Comparar o Omoda 5 com</h2>
  ${[['Omoda 7 SHS-P', 'Híbrido plug-in · 590 L', true],
     ['Omoda E5', '100% elétrico · 360 L', false],
     ['Jaecoo 7 SHS-P', 'Híbrido plug-in · 500 L', false],
     ['Jaecoo 5 SHS-H', 'Híbrido pleno · 410 L', false]].map(([n, s, on]) => `
  <div class="op${on ? ' on' : ''}"><span class="bo"></span><span class="tx"><b>${n}</b><span>${s}</span></span><span class="ck"></span></div>`).join('')}
  <div class="aviso"><b>O Jaecoo 5 entra sem os três pontos.</b> Ele é o único sem roteiro gravado, então não existe resposta do time sobre o que fecha ele. Dá pra comparar a ficha normalmente; o resumo da persona fica em branco até o roteiro chegar.</div>
`)}
`;

const arq = '/tmp/mock-comp.html';
fs.writeFileSync(arq, html);
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Runtime.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 2, mobile: false });
await c.send('Page.navigate', { url: 'file://' + arq });
await new Promise((r) => setTimeout(r, 2200));
// Mede em pixels de CSS e redimensiona a janela para o tamanho exato: com
// `clip` o recorte saía multiplicado pelo deviceScaleFactor e a imagem vinha
// com 8400 px de largura.
const { result } = await c.send('Runtime.evaluate', {
  expression: 'JSON.stringify([document.body.scrollWidth, document.body.scrollHeight])',
  returnByValue: true,
});
const [L, A] = JSON.parse(result.value);
await c.send('Emulation.setDeviceMetricsOverride', { width: L, height: A, deviceScaleFactor: 2, mobile: false });
await new Promise((r) => setTimeout(r, 600));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
c.fechar(); proc.kill();
console.log('mock:', SAIDA);
