// ROTINAS MENSAIS DO APP — a imagem que a Vivian manda para os gerentes.
//
// Pedido de 13/10/2026: "o que é, o que fazer, qual prazo, quem faz (cargo ou
// nomes) e se está feito ou pendente".
//
// A ÚLTIMA COLUNA É MEDIDA, NÃO DIGITADA. É o que separa esta imagem de um
// lembrete genérico: ela olha o banco e diz o que está aberto HOJE. Um
// checklist que não sabe o que já foi feito vira moldura na parede — todo mês
// a mesma lista, e ninguém confere.
//
// Duas fontes, porque "feito" tem dois sentidos aqui:
//   · o TRABALHO: a condição de outubro está publicada? (elevaCondicoes)
//   · o OK do ritual: alguém carimbou a conferência? (elevaRituais)
// Dá para ter um sem o outro, e o documento mostra os dois — foi assim que
// apareceu que as condições de veículo subiram em 02/10 e ninguém registrou a
// conferência.
//
// Uso: node scripts/rotinas/gera.mjs [saida.png]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';
import { get, doc2obj, TOKEN, BASE } from '../_firestore.mjs';

const SAIDA = process.argv[2] || `${process.env.HOME}/Downloads/eleva-rotinas-mensais.png`;
const NOITE = '#0b1020';
const CARTAO = '#151c31';
const GOLD = '#c9a84c';
const VERDE = '#3fb27f';
const AMBAR = '#e0a33a';

const AGORA = new Date();
const MES = AGORA.toISOString().slice(0, 7);
const NOME_MES = AGORA.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'America/Sao_Paulo' });

// ---- o que o banco diz ----
const cond = (await get('elevaCondicoes?pageSize=100')).documents || [];
const ramasa = cond.map(doc2obj).filter((c) => c.brand === 'ramasa');
const doMes = (cat) => ramasa.filter(
  (c) => (c.categoria || 'veiculo') === cat && c.criadoEm && new Date(c.criadoEm).toISOString().slice(0, 7) === MES,
).length;

const rit = (await get('elevaRituais?pageSize=200')).documents || [];
const oks = rit.map(doc2obj).flatMap((d) => Object.values(d.oks || {}));
const okNoMes = (id) => oks.filter((o) => o.ritual === id && String(o.em || '').slice(0, 7) === MES).length;

const ultima = (cat) => {
  const l = ramasa.filter((c) => (c.categoria || 'veiculo') === cat).sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0))[0];
  return l?.criadoEm ? new Date(l.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—';
};

const ROTINAS = [
  {
    n: 1, titulo: 'Revisão do app',
    oque: 'Conferir se o que está no app é o que vale hoje.',
    fazer: ['Carros: ficha, fotos e vídeos, sem versão fora de linha',
            'Condições: a tabela do mês está no ar e a antiga saiu',
            'Acessórios: lista por carro, preços e o que saiu de linha',
            'Documentos e objeções: o que está publicado é a versão atual'],
    prazo: '1º dia útil do mês',
    quem: 'Becegato — diretor de qualidade\nJessica e Letícia Lima — líder de qualidade',
    feito: okNoMes('qualidade-revisao') > 0,
    nota: okNoMes('qualidade-revisao') > 0 ? 'conferência registrada' : 'nenhuma conferência registrada até hoje',
  },
  {
    n: 2, titulo: 'Condição comercial',
    oque: 'A carta da montadora do mês, publicada no app.',
    fazer: ['Publicar a tabela do mês com a validade certa',
            'Conferir que a do mês passado saiu do ar'],
    prazo: 'Entre os dias 1 e 5',
    quem: 'Raphaela, Cristiano e Cláudio — gerente de vendas',
    feito: doMes('veiculo') > 0,
    nota: doMes('veiculo') > 0
      ? `${doMes('veiculo')} condições publicadas em ${ultima('veiculo')}`
      : `a última é de ${ultima('veiculo')}`,
  },
  {
    n: 3, titulo: 'Campanha de incentivo',
    oque: 'A disputa interna do mês — meta, prêmio e prazo.',
    fazer: ['Cadastrar a campanha do mês no Painel',
            'Tirar do ar a campanha que terminou'],
    prazo: 'Entre os dias 1 e 5',
    quem: 'Raphaela, Cristiano e Cláudio — gerente de vendas',
    feito: doMes('campanha') > 0,
    nota: doMes('campanha') > 0 ? 'campanha do mês no ar' : `a última é de ${ultima('campanha')}`,
  },
  {
    n: 4, titulo: 'Acessórios',
    oque: 'A lista por carro, o que saiu de linha e os preços.',
    fazer: ['Conferir a lista de acessórios de cada carro',
            'Tirar do ar o que saiu de linha ou está sem estoque',
            'Conferir os preços com a tabela da loja'],
    prazo: 'Entre os dias 1 e 5',
    quem: 'Silmara — gerente de acessórios',
    feito: doMes('acessorio') > 0 || okNoMes('acessorios-lista') > 0,
    nota: doMes('acessorio') > 0 ? 'lista atualizada no mês' : `a última atualização é de ${ultima('acessorio')}`,
  },
  {
    n: 5, titulo: 'Campanha fechando', meio: true,
    oque: 'O lembrete que vai para o time quando a disputa está acabando.',
    fazer: ['O app avisa sozinho — o vendedor confirma que sabe qual campanha está valendo, quanto falta e que falou com um cliente parado'],
    prazo: 'Dias 14 e 30',
    quem: 'Todo o time de vendas',
    feito: doMes('campanha') > 0,
    nota: doMes('campanha') > 0 ? 'tem campanha no ar para avisar' : 'sem campanha de outubro, o aviso do dia 14 chega vazio',
  },
];

const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;background:${NOITE};color:#eef1f8;font-family:Inter,-apple-system,Arial,sans-serif;
  padding:54px 50px 44px}
.marca{font-family:Cinzel,Georgia,serif;font-weight:800;font-size:22px;letter-spacing:.22em;color:#8b93ab}
h1{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:58px;line-height:1.04;margin-top:14px}
.sub{font-size:25px;color:#a8b0c6;margin-top:14px;line-height:1.4}
.sub b{color:${GOLD}}

.lin{display:flex;gap:20px;margin-top:22px;background:${CARTAO};border:1px solid #232c47;
  border-radius:18px;padding:22px 24px}
.lin.meio{background:#111728;border-style:dashed}
.n{flex:none;width:46px;height:46px;border-radius:50%;border:2px solid ${GOLD};color:${GOLD};
  display:grid;place-items:center;font-family:Cinzel,Georgia,serif;font-weight:900;font-size:24px}
.corpo{flex:1;min-width:0}
.tit{font-size:30px;font-weight:800;line-height:1.1}
.oque{font-size:22px;color:#a8b0c6;margin-top:6px;line-height:1.35}
.fazer{margin-top:13px;display:flex;flex-direction:column;gap:7px}
.fazer div{display:flex;gap:11px;font-size:20px;line-height:1.35;color:#d6dbe9}
.fazer i{flex:none;width:8px;height:8px;margin-top:8px;border-radius:50%;font-style:normal}
.pe{display:flex;gap:28px;margin-top:15px;padding-top:13px;border-top:1px solid #232c47}
.pe div{font-size:19px;line-height:1.35}
.pe b{display:block;font-size:16px;letter-spacing:.1em;text-transform:uppercase;color:#7b84a0;margin-bottom:4px}
.pe .quem{white-space:pre-line;color:#d6dbe9}
.pe .prazo{color:${GOLD};font-weight:700}

.st{flex:none;width:188px;text-align:right}
.badge{display:inline-flex;align-items:center;gap:8px;font-size:21px;font-weight:800;
  padding:8px 15px;border-radius:999px}
.badge.ok{background:rgba(63,178,127,.15);color:${VERDE};border:1px solid rgba(63,178,127,.42)}
.badge.no{background:rgba(224,163,58,.14);color:${AMBAR};border:1px solid rgba(224,163,58,.42)}
.nota{display:block;font-size:17px;color:#7b84a0;margin-top:9px;line-height:1.35}

.rod{margin-top:30px;padding-top:18px;border-top:1px solid #232c47;display:flex;
  justify-content:space-between;font-size:18px;color:#7b84a0}
</style>
<div class="marca">ELEVA · GRUPO RAMASA</div>
<h1>Rotinas mensais do app</h1>
<p class="sub">As quatro primeiras fecham <b>até o 4º dia útil</b>. O app avisa cada cargo na janela certa, e o “ok” fica gravado com nome e hora.</p>

${ROTINAS.map((r) => `
<div class="lin${r.meio ? ' meio' : ''}">
  <span class="n">${r.n}</span>
  <div class="corpo">
    <div class="tit">${r.titulo}</div>
    <div class="oque">${r.oque}</div>
    <div class="fazer">${r.fazer.map((f) => `<div><i style="background:${GOLD}"></i><span>${f}</span></div>`).join('')}</div>
    <div class="pe">
      <div><b>Prazo</b><span class="prazo">${r.prazo}</span></div>
      <div><b>Quem faz</b><span class="quem">${r.quem}</span></div>
    </div>
  </div>
  <div class="st">
    <span class="badge ${r.feito ? 'ok' : 'no'}">${r.feito ? '✓ Feito' : '• Pendente'}</span>
    <span class="nota">${r.nota}</span>
  </div>
</div>`).join('')}

<div class="rod"><span>Posição de ${AGORA.toLocaleDateString('pt-BR')} · ${NOME_MES}</span><span>gsseleva.com.br</span></div>`;

const arq = '/tmp/rotinas.html';
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
console.log('rotinas:', SAIDA);
