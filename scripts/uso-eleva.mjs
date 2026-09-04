#!/usr/bin/env node
/**
 * uso-eleva.mjs — relatório de utilização do Eleva na Ramasa.
 *
 * Por que existe: a gerência precisa saber quem está usando o app sem depender
 * de alguém abrir o Painel. Roda de manhã e no fim do dia (tarefas agendadas).
 *
 * De onde vêm os dados:
 *   - Firebase Auth  → quem abriu o app (lastRefreshAt) e quem criou conta
 *   - elevaStats     → o que cada um fez, com hora (array `events`, últimos 200)
 *   - elevaUsers     → marca, papel e cargo salvos na conta
 *   - AuthContext    → ROLE_OVERRIDES, que mandam mais que o perfil salvo
 *
 * O array `events` é a fonte boa: tem carimbo de hora por ação, então dá pra
 * dizer o que aconteceu num intervalo — e não só "qual foi o último acesso",
 * que é tudo que o Firebase Auth guarda.
 *
 * Uso:
 *   node scripts/uso-eleva.mjs --turno manha
 *   node scripts/uso-eleva.mjs --turno noite
 *   node scripts/uso-eleva.mjs --desde 2026-08-30T18:00:00-03:00   # janela manual
 *   node scripts/uso-eleva.mjs --dia 30/08                          # um dia inteiro
 *   node scripts/uso-eleva.mjs --fundo                              # quem testou o quê, pessoa a pessoa
 *   node scripts/uso-eleva.mjs --fundo --desde 2026-08-28T00:00-03:00
 *
 * Quando roda por turno, guarda o fim da janela em ~/.claude/eleva-uso/estado.json,
 * pra que o relatório seguinte comece exatamente onde este parou — sem buraco e
 * sem repetir. As janelas manuais (--desde/--dia) não mexem nesse estado.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJETO = 'eleva-gss';
const MARCA = 'ramasa';
const ESTADO_DIR = join(homedir(), '.claude', 'eleva-uso');
const ESTADO = join(ESTADO_DIR, 'estado.json');
const FUSO = -3; // America/Sao_Paulo

// Contas de TESTE: ficam fora da contagem do time.
//
// A Vivian é quem lê o relatório, e a Silene testa junto — o uso das duas
// inflaria os números e esconderia se o time está entrando ou não. É a mesma
// lista que o app usa pra tirá-las do Painel e do ranking (ver
// src/pilulas/data/contasDeTeste.ts); as duas listas têm que contar a MESMA
// história, senão o Painel diz 9 vendedores e o relatório diz 11.
const TESTE = new Set([
  'viviangitti23@gmail.com',
  'viviangitti@gmail.com',
  'maria26@gmail.com',
  'silene_mendes@hotmail.com',
  'silene.mendesdesouza@gmail.com',
  'silene.mendesangelodesouza@gmail.com',
]);

// Credenciais públicas do CLI do Firebase (firebase-tools). Não são segredo:
// um "installed app" do OAuth não consegue guardar segredo, por definição, e
// elas vêm no código aberto do próprio firebase-tools. Quem dá acesso de fato
// é o refresh token guardado na máquina da Vivian.
const CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

// ─────────────────────────────── utilidades ───────────────────────────────

const arg = (nome) => {
  const i = process.argv.indexOf(`--${nome}`);
  const v = i > -1 ? process.argv[i + 1] : undefined;
  return v && !v.startsWith('--') ? v : undefined;
};
const temFlag = (nome) => process.argv.includes(`--${nome}`);

/** Data deslocada para Brasília — só para formatar, nunca para comparar. */
const br = (d) => new Date(d.getTime() + FUSO * 3600 * 1000);
const hhmm = (d) => br(d).toISOString().slice(11, 16);
const ddmm = (d) => {
  const b = br(d).toISOString();
  return `${b.slice(8, 10)}/${b.slice(5, 7)}`;
};
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const carimbo = (d) => `${ddmm(d)} (${DIAS[br(d).getUTCDay()]}) ${hhmm(d)}`;
const diasAtras = (d, agora) => Math.floor((agora - d) / 86400000);
const plural = (n, um, muitos) => `${n} ${n === 1 ? um : muitos}`;

// ─────────────────────────────── autenticação ───────────────────────────────

async function token() {
  const cfg = join(homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (!existsSync(cfg)) throw new Error('firebase-tools não está logado. Rode: npx firebase login');

  const refresh = JSON.parse(readFileSync(cfg, 'utf8'))?.tokens?.refresh_token;
  if (!refresh) throw new Error('sem refresh_token no firebase-tools.json — rode: npx firebase login');

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refresh,
      grant_type: 'refresh_token',
    }),
  });
  if (!r.ok) throw new Error(`o Google recusou renovar o acesso (${r.status}) — rode: npx firebase login`);
  return (await r.json()).access_token;
}

// ─────────────────────────────── leitura ───────────────────────────────

/** Desempacota o formato verboso do Firestore REST em JS puro. */
function limpa(v) {
  if (v == null) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return new Date(v.timestampValue);
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(limpa);
  if ('mapValue' in v) {
    const o = {};
    for (const [k, x] of Object.entries(v.mapValue.fields || {})) o[k] = limpa(x);
    return o;
  }
  return undefined;
}

async function colecao(tok, nome) {
  const docs = [];
  let pag = '';
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJETO}/databases/(default)/documents/${nome}?pageSize=300${pag}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
    if (!r.ok) throw new Error(`Firestore recusou ler ${nome} (${r.status})`);
    const j = await r.json();
    for (const d of j.documents || []) {
      const o = { _id: d.name.split('/').pop() };
      for (const [k, v] of Object.entries(d.fields || {})) o[k] = limpa(v);
      docs.push(o);
    }
    pag = j.nextPageToken ? `&pageToken=${encodeURIComponent(j.nextPageToken)}` : '';
  } while (pag);
  return docs;
}

async function contas(tok) {
  const r = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${PROJETO}/accounts:batchGet?maxResults=500`,
    { headers: { Authorization: `Bearer ${tok}` } },
  );
  if (!r.ok) throw new Error(`Firebase Auth recusou listar as contas (${r.status})`);
  return (await r.json()).users || [];
}

// ─────────────────────────────── catálogo e acessos ───────────────────────────────

/**
 * id do produto → { nome, marca }, lido do products.ts para não desatualizar
 * toda vez que a gerência cadastra um carro ou acessório novo.
 */
function catalogo() {
  const mapa = {};
  try {
    const src = readFileSync(join(RAIZ, 'src/pilulas/data/products.ts'), 'utf8');
    let id = null;
    let marca = null;
    for (const linha of src.split('\n')) {
      const mId = linha.match(/^\s*id:\s*'([^']+)'/);
      if (mId) { id = mId[1]; marca = null; continue; }
      if (!id) continue;
      const mMarca = linha.match(/^\s*brand:\s*'([^']+)'/);
      if (mMarca) { marca = mMarca[1]; continue; }
      const mNome = linha.match(/^\s*name:\s*'([^']+)'/);
      if (mNome) { mapa[id] = { nome: mNome[1], marca }; id = null; }
    }
  } catch { /* sem o arquivo, o relatório mostra o id cru */ }
  return mapa;
}

/** id do acessório → nome, lido do acessorios.ts. */
function catalogoAcessorios() {
  const mapa = {};
  try {
    const src = readFileSync(join(RAIZ, 'src/pilulas/data/acessorios.ts'), 'utf8');
    let id = null;
    for (const linha of src.split('\n')) {
      const mId = linha.match(/^\s*id:\s*'([^']+)'/);
      if (mId) { id = mId[1]; continue; }
      if (!id) continue;
      const mNome = linha.match(/^\s*nome:\s*'([^']+)'/);
      if (mNome) { mapa[id] = { nome: mNome[1], marca: MARCA }; id = null; }
    }
  } catch { /* sem o arquivo, mostra o id cru */ }
  return mapa;
}

/** id do documento → { nome, marca }, lido do documentos.ts. */
function catalogoDocs() {
  const mapa = {};
  try {
    const src = readFileSync(join(RAIZ, 'src/pilulas/data/documentos.ts'), 'utf8');
    let atual = null;
    for (const linha of src.split('\n')) {
      const mId = linha.match(/id:\s*'([^']+)',\s*brand:\s*'([^']+)'/);
      if (mId) { atual = { id: mId[1], marca: mId[2] }; continue; }
      if (!atual) continue;
      const mTit = linha.match(/titulo:\s*'([^']+)'/);
      if (mTit) { mapa[atual.id] = { nome: mTit[1], marca: atual.marca }; atual = null; }
    }
  } catch { /* sem o arquivo, mostra o id cru */ }
  return mapa;
}

/**
 * Lê o ROLE_OVERRIDES do AuthContext.tsx — é ele que manda no app. O perfil
 * salvo no Firestore pode estar velho: a Silene, por exemplo, está gravada
 * como "afiliada sem marca" no banco e entra como gestora das três marcas.
 */
function excecoesDeAcesso() {
  const mapa = {};
  try {
    const src = readFileSync(join(RAIZ, 'src/pilulas/AuthContext.tsx'), 'utf8');
    const i = src.indexOf('const ROLE_OVERRIDES');
    if (i < 0) return mapa;
    const bloco = src.slice(i, src.indexOf('\n};', i));
    for (const m of bloco.matchAll(/'([^']+@[^']+)':\s*\{([^}]*)\}/g)) {
      const [, email, corpo] = m;
      mapa[email.toLowerCase()] = {
        papel: corpo.match(/role:\s*'([^']+)'/)?.[1],
        cargo: corpo.match(/cargo:\s*'([^']+)'/)?.[1],
        marcas: [...(corpo.match(/brands:\s*\[([^\]]*)\]/)?.[1] || '').matchAll(/'([^']+)'/g)].map((x) => x[1]),
      };
    }
  } catch { /* sem o arquivo, vale o que está no Firestore */ }
  return mapa;
}

const LOJAS = {
  'tigeromoda.com.br': 'Tiger Omoda',
  'lincetoyota.com': 'Lince Toyota',
  'nikkomitsubishi.com.br': 'Nikko Mitsubishi',
  'gruporamasa.com': 'Grupo Ramasa',
};

const CARGOS = {
  'vendedor-veiculos': 'vendedor de veículos',
  'vendedor-acessorios': 'vendedor de acessórios',
  'gerente-veiculos': 'gerente de veículos',
  'gerente-acessorios': 'gerente de acessórios',
  'lider-acessorios': 'líder de acessórios',
  'gerente-qualidade': 'gerente de qualidade',
};

const identifica = (p) =>
  [CARGOS[p.cargo] || (p.papel === 'gestor' ? 'gestor' : p.papel), LOJAS[p.email.split('@')[1]]]
    .filter(Boolean)
    .join(' · ');

// ─────────────────────────────── janela ───────────────────────────────

function janela(agora) {
  const manual = arg('desde');
  if (manual) {
    const de = new Date(manual);
    if (Number.isNaN(+de)) throw new Error(`data inválida em --desde: ${manual}`);
    return { de, ate: agora, rotulo: 'janela informada na mão', fixa: true };
  }

  const dia = arg('dia'); // dd/mm — cobre o dia inteiro
  if (dia) {
    const [d, m] = dia.split('/').map(Number);
    if (!d || !m) throw new Error(`use --dia no formato dd/mm (recebi "${dia}")`);
    const ano = br(agora).getUTCFullYear();
    const de = new Date(Date.UTC(ano, m - 1, d) - FUSO * 3600 * 1000);
    return { de, ate: new Date(+de + 86400000), rotulo: `o dia ${dia} inteiro`, fixa: true };
  }

  // O relatório em profundidade olha a história inteira por padrão: a graça
  // dele é ver o caminho de cada pessoa, não o recorte de um turno.
  if (temFlag('fundo')) return { de: new Date(0), ate: agora, rotulo: 'desde o começo', fixa: true };

  let anterior = null;
  try { anterior = new Date(JSON.parse(readFileSync(ESTADO, 'utf8')).ultimoRelatorio); } catch { /* primeira vez */ }
  // Sem estado anterior, cobre as últimas 14h — o vão típico entre dois turnos.
  const de = anterior && !Number.isNaN(+anterior) ? anterior : new Date(+agora - 14 * 3600 * 1000);
  return { de, ate: agora, rotulo: 'desde o relatório anterior', fixa: false };
}

// ─────────────────────────────── relatório ───────────────────────────────



/**
 * Como cada ação aparece escrita. O `id` de objeção e one-page carrega duas
 * partes separadas por "|": o produto e o detalhe.
 */
function descreve(e, cat, docs = {}, acess = {}) {
  const [base, detalhe] = String(e.id || '').split('|');
  const nome = cat[base]?.nome || docs[base]?.nome || acess[base]?.nome || base;
  switch (e.type) {
    case 'quiz_pass': return `★ QUIZ APROVADO — ${nome}`;
    case 'quiz_start': return `começou o quiz — ${nome}`;
    case 'quiz_fail': return `errou o quiz — ${nome}`;
    case 'video_play': return `ASSISTIU AO VÍDEO (com som) — ${nome}`;
    case 'doc_open': return `abriu o documento — ${nome}`;
    case 'onepage': return `mandou o one-page${detalhe === 'estudo' ? ' (versão estudo)' : ''} — ${nome}`;
    case 'objecao': return `consultou a objeção “${detalhe || '—'}” — ${nome}`;
    case 'acessorio': return `abriu o acessório — ${nome}`;
    case 'mission_done': return `missão — ${nome}`;
    default: return nome;
  }
}

/** Só estas ações contam como "abriu uma ficha". */
const ABERTURA = 'pill_view';

// ─────────────────────────── relatório em profundidade ───────────────────────────

/**
 * Reconstrói as sessões de uma pessoa. Duas aberturas separadas por mais de
 * 30 minutos viram sessões diferentes — é a régua usual para "voltou ao app".
 */
function sessoes(eventos, minutos = 30) {
  const ordenados = [...eventos].sort((a, b) => a.at - b.at);
  const grupos = [];
  for (const e of ordenados) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && (e.at - ultimo[ultimo.length - 1].at) / 60000 <= minutos) ultimo.push(e);
    else grupos.push([e]);
  }
  return grupos;
}

/**
 * Lê o ritmo de uma sessão. A pílula tem ~45s de vídeo mais a ficha; abrir a
 * próxima em menos de um minuto significa que a anterior não foi consumida.
 *
 * O último item da sessão fica de fora: não existe evento depois dele, então
 * não dá para saber quanto tempo ficou ali. Dizer que "passou batido" seria
 * inventar.
 */
function ritmo(sessao) {
  if (sessao.length < 2) return null;
  const gaps = [];
  for (let i = 1; i < sessao.length; i += 1) gaps.push((sessao[i].at - sessao[i - 1].at) / 1000);
  const corridos = gaps.filter((g) => g < 60).length;
  // Mediana, e não média: um intervalo longo no meio (a pessoa foi atender um
  // cliente e voltou) puxaria a média para cima e faria parecer que ela leu
  // tudo com calma.
  const ord = [...gaps].sort((a, b) => a - b);
  const meio = Math.floor(ord.length / 2);
  const mediana = Math.round(ord.length % 2 ? ord[meio] : (ord[meio - 1] + ord[meio]) / 2);
  return { gaps, corridos, mediana, total: gaps.length };
}

const dur = (seg) => (seg < 60 ? `${seg}s` : `${Math.floor(seg / 60)}min${String(seg % 60).padStart(2, '0')}`);

function relatorioFundo({ pessoas, cat, docs, acess, de, ate, agora, P }) {
  const noPeriodo = (p) => p.eventos.filter((e) => e.at >= de && e.at < ate).sort((a, b) => a.at - b.at);
  const modelos = Object.entries(cat)
    .filter(([, v]) => v.marca === MARCA)
    .map(([id, v]) => ({ id, nome: v.nome }));
  const idsModelo = new Set(modelos.map((m) => m.id));

  P('═'.repeat(58));
  P('ELEVA · RAMASA — quem testou o quê, em profundidade');
  P(`${carimbo(agora)}`);
  const primeiro = pessoas.flatMap((p) => p.eventos).sort((a, b) => a.at - b.at)[0];
  P(
    +de === 0 && primeiro
      ? `Cobre da primeira ação registrada (${carimbo(primeiro.at)}) até ${carimbo(ate)}`
      : `Cobre ${carimbo(de)} → ${carimbo(ate)}`,
  );
  P('═'.repeat(58));
  P();
  P('COMO LER ESTES NÚMEROS');
  P('  ABERTURA é a ficha do produto aparecendo na tela — uma vez por produto');
  P('  por dia. Não quer dizer que a pessoa assistiu: só que a tela abriu.');
  P('  ASSISTIU AO VÍDEO é outra coisa: só conta quando o vídeo toca COM SOM,');
  P('  que é uma escolha da pessoa. O autoplay mudo não entra.');
  P();
  P('  Onde o intervalo entre uma ação e a seguinte permite, o relatório diz o');
  P('  ritmo. Abrir a próxima ficha em menos de 1 minuto significa que a');
  P('  anterior não foi consumida: a pílula sozinha tem ~45s de vídeo.');
  P();
  P('  Vídeo, quiz começado, quiz errado, documento aberto, objeção consultada');
  P('  e one-page enviado passaram a ser registrados em 31/08. Antes dessa');
  P('  data só existia a abertura de ficha — a ausência deles no histórico');
  P('  anterior não significa que não aconteceram.');
  P();

  // ── a leitura: o parágrafo que responde "e aí, como está?" ──
  //
  // O relatório crescia pra 500 linhas e a resposta que a Vivian quer cabe em
  // seis. Elas são CALCULADAS, não escritas: se o time melhorar, o texto muda
  // sozinho. Escrever "o time está engajado" à mão seria o mesmo que não medir.
  // Primeiro nome resolve, até ter três Anas e duas Silenes: aí "Ana (6d)" vira
  // uma acusação sem destinatário. Quando o primeiro nome se repete, entra o
  // segundo.
  const primeiros = new Map();
  for (const p of pessoas) {
    const n = p.nome.split(' ')[0];
    primeiros.set(n, (primeiros.get(n) || 0) + 1);
  }
  const curto = (p) => {
    const partes = p.nome.split(' ').filter(Boolean);
    return primeiros.get(partes[0]) > 1 && partes[1] ? `${partes[0]} ${partes[1]}` : partes[0];
  };

  const diasDe = (p) => new Set(noPeriodo(p).map((e) => ddmm(e.at)));
  const ultimaAcao = (p) => noPeriodo(p).slice(-1)[0]?.at || null;
  const ehChefia = (p) => /gerente|lider|líder/.test(p.cargo || '') || p.papel === 'gestor';

  const usaram = pessoas.filter((p) => noPeriodo(p).length);
  const nucleo = usaram.filter((p) => diasDe(p).size >= 3);
  const umDiaSo = usaram.filter((p) => diasDe(p).size === 1 && diasAtras(p.criada, agora) >= 2);
  const sumidos = usaram.filter((p) => {
    const u = ultimaAcao(p);
    return u && diasAtras(u, agora) >= 3;
  });
  const chefia = pessoas.filter(ehChefia);
  const chefiaAtiva = chefia.filter((p) => noPeriodo(p).length);
  const passouQuiz = pessoas.filter((p) => noPeriodo(p).some((e) => e.type === 'quiz_pass'));

  // Ritmo: de cada duas ações seguidas na mesma sessão, quantas vieram em menos
  // de um minuto? A pílula tem ~45s — abaixo disso não deu tempo de consumir.
  let intervalos = 0;
  let corridos = 0;
  for (const p of usaram) {
    for (const ses of sessoes(noPeriodo(p))) {
      for (let i = 1; i < ses.length; i += 1) {
        intervalos += 1;
        if ((ses[i].at - ses[i - 1].at) / 1000 < 60) corridos += 1;
      }
    }
  }

  P('─'.repeat(58));
  P('A LEITURA');
  P('─'.repeat(58));
  P(`  ${usaram.length} de ${pessoas.length} pessoas usaram o app no período.`);
  if (nucleo.length) {
    P(`  O núcleo são ${plural(nucleo.length, 'pessoa', 'pessoas')} — usaram em 3 dias ou mais: ${nucleo.map(curto).join(', ')}.`);
  }
  if (umDiaSo.length) {
    P(`  ${plural(umDiaSo.length, 'pessoa entrou', 'pessoas entraram')} num dia só e não ${umDiaSo.length === 1 ? 'voltou' : 'voltaram'}: ${umDiaSo.map(curto).join(', ')}.`);
  }
  if (sumidos.length) {
    P(`  Sem aparecer há 3 dias ou mais: ${sumidos.map((p) => `${curto(p)} (${diasAtras(ultimaAcao(p), agora)}d)`).join(', ')}.`);
  }
  if (chefia.length) {
    const fora = chefia.filter((p) => !noPeriodo(p).length).map(curto);
    P(`  Chefia: ${chefiaAtiva.length} de ${chefia.length} ${chefiaAtiva.length === 1 ? 'usou' : 'usaram'}${fora.length ? ` — fora: ${fora.join(', ')}` : ''}.`);
  }
  P(`  Quiz: ${passouQuiz.length} de ${pessoas.length} passaram em pelo menos um.`);
  if (intervalos >= 10) {
    P(`  Ritmo: ${Math.round((corridos / intervalos) * 100)}% das ações vieram em menos de 1 minuto da anterior — ${corridos / intervalos > 0.5 ? 'é reconhecimento, não estudo' : 'a maioria teve tempo de consumir'}.`);
  }
  P();

  // ── dia a dia ──
  //
  // A tabela que mostra a CURVA. Pessoa a pessoa diz quem; isto diz quando —
  // se o uso está subindo, se caiu depois de um treinamento, se fim de semana
  // some. É o que o número total esconde.
  const dias = new Map();
  for (const p of pessoas) {
    for (const e of noPeriodo(p)) {
      const k = br(e.at).toISOString().slice(0, 10);
      const d = dias.get(k) || { pessoas: new Set(), acoes: 0, quiz: 0, dia: e.at };
      d.pessoas.add(p.email);
      d.acoes += 1;
      if (e.type === 'quiz_pass') d.quiz += 1;
      dias.set(k, d);
    }
  }
  if (dias.size) {
    P('─'.repeat(58));
    P('DIA A DIA');
    P('─'.repeat(58));
    const chaves = [...dias.keys()].sort();
    const maxP = Math.max(...[...dias.values()].map((d) => d.pessoas.size));
    // Inclui os dias SEM ninguém: um buraco no meio da semana é informação, e
    // some quando o relatório só lista os dias que tiveram uso.
    const um = 86400000;
    const ini = new Date(chaves[0] + 'T12:00:00Z');
    // Vai até HOJE, e não até o último dia com uso: um dia vazio no fim é a
    // informação mais importante da tabela — o time parou.
    const fim = new Date(br(agora).toISOString().slice(0, 10) + 'T12:00:00Z');
    for (let t = +ini; t <= +fim; t += um) {
      const k = new Date(t).toISOString().slice(0, 10);
      const d = dias.get(k);
      const data = new Date(t);
      const rot = `${k.slice(8, 10)}/${k.slice(5, 7)} ${DIAS[data.getUTCDay()]}`;
      if (!d) { P(`  ${rot.padEnd(10)} —`); continue; }
      const n = d.pessoas.size;
      P(`  ${rot.padEnd(10)} ${'▇'.repeat(Math.max(1, Math.round((n / maxP) * 18))).padEnd(18)} ${String(n).padStart(2)} ${n === 1 ? 'pessoa ' : 'pessoas'} · ${String(d.acoes).padStart(3)} ${d.acoes === 1 ? 'ação ' : 'ações'}${d.quiz ? ` · ${plural(d.quiz, 'quiz aprovado', 'quizzes aprovados')}` : ''}`);
    }
    P();
  }

  // ── pessoa a pessoa ──
  P('─'.repeat(58));
  P('PESSOA A PESSOA');
  P('─'.repeat(58));

  const ativos = pessoas
    .map((p) => ({ p, ev: noPeriodo(p) }))
    .sort((a, b) => b.ev.length - a.ev.length || a.p.nome.localeCompare(b.p.nome));

  for (const { p, ev } of ativos) {
    const quem = identifica(p);
    P();
    P(`${p.nome.toUpperCase()}${quem ? ` — ${quem}` : ''}`);
    P(`  ${p.email}`);
    P(`  conta criada ${carimbo(p.criada)}${p.abriu ? ` · última vez no app ${carimbo(p.abriu)}` : ''}`);

    if (!ev.length) {
      const d = p.abriu ? diasAtras(p.abriu, agora) : diasAtras(p.criada, agora);
      P(`  ⚠ NÃO ABRIU NENHUMA FICHA no período. Tem conta há ${diasAtras(p.criada, agora)} dias.`);
      if (p.abriu && d <= 1) P('    Entrou no app, mas não chegou a abrir nenhum produto.');
      continue;
    }

    const grupos = sessoes(ev);
    const dias = new Set(ev.map((e) => ddmm(e.at)));
    const base = (e) => String(e.id || '').split('|')[0];
    const vistos = new Set(ev.filter((e) => idsModelo.has(base(e))).map(base));
    const aberturas = ev.filter((e) => e.type === ABERTURA).length;
    const assistiu = ev.filter((e) => e.type === 'video_play').length;
    const passou = ev.filter((e) => e.type === 'quiz_pass').length;
    const tentou = ev.filter((e) => e.type === 'quiz_start').length;

    const resumo = [
      plural(grupos.length, 'sessão', 'sessões'),
      `em ${plural(dias.size, 'dia', 'dias diferentes')}`,
      plural(aberturas, 'ficha aberta', 'fichas abertas'),
    ];
    if (assistiu) resumo.push(plural(assistiu, 'vídeo assistido', 'vídeos assistidos'));
    resumo.push(tentou || passou ? `${passou} de ${tentou || passou} quizzes acertados` : 'nenhum quiz');
    P(`  ${resumo.join(' · ')}`);
    P(`  cobertura do catálogo: ${vistos.size} de ${modelos.length} modelos${vistos.size === modelos.length ? ' ✓' : ''}`);
    P();

    for (const s of grupos) {
      const total = Math.round((s[s.length - 1].at - s[0].at) / 1000);
      const cab = s.length === 1
        ? `${carimbo(s[0].at)}`
        : `${carimbo(s[0].at)}–${hhmm(s[s.length - 1].at)}  (${dur(total)})`;
      P(`    ${cab}`);
      for (let i = 0; i < s.length; i += 1) {
        const e = s[i];
        const gap = i > 0 ? Math.round((e.at - s[i - 1].at) / 1000) : null;
        P(`      ${hhmm(e.at)}  ${descreve(e, cat, docs, acess)}${gap != null ? `   (${dur(gap)} depois da anterior)` : ''}`);
      }
      const r = ritmo(s);
      if (r) {
        if (r.corridos === r.total) {
          P(`      → passou por ${plural(s.length, 'ficha', 'fichas')} sem parar em nenhuma. Reconhecimento, não estudo.`);
        } else if (r.corridos) {
          P(`      → ${r.corridos} de ${r.total} fichas ficaram abertas menos de 1 minuto (metade delas, ${dur(r.mediana)} ou menos).`);
        } else {
          P(`      → metade das fichas ficou aberta ${dur(r.mediana)} ou mais: deu tempo de assistir.`);
        }
      }
      P();
    }

    const faltando = modelos.filter((m) => !vistos.has(m.id));
    if (faltando.length) P(`  Nunca abriu: ${faltando.map((m) => m.nome).join(' · ')}`);
    if (!passou) {
      P(tentou
        ? `  Tentou o quiz ${plural(tentou, 'vez', 'vezes')} e não passou — segue travado no nível 1.`
        : '  Nunca fez um quiz — segue travado no nível 1.');
    }
  }

  // ── por modelo ──
  P();
  P('─'.repeat(58));
  P('POR MODELO — o que o time procura');
  P('─'.repeat(58));
  const porModelo = modelos
    .map((m) => {
      const abriu = (p) => noPeriodo(p).filter((e) => String(e.id).split('|')[0] === m.id);
      const quem = pessoas.filter((p) => abriu(p).length);
      const assistiram = pessoas.filter((p) => abriu(p).some((e) => e.type === 'video_play'));
      return { ...m, quem, assistiram };
    })
    .sort((a, b) => b.quem.length - a.quem.length);
  for (const m of porModelo) {
    P(`  ${String(m.quem.length).padStart(2)} de ${pessoas.length} pessoas  ${m.nome}`);
    P(`      ${m.quem.length ? m.quem.map((p) => p.nome.split(' ')[0]).join(', ') : '— ninguém abriu —'}`);
    if (m.assistiram.length) P(`      assistiram ao vídeo: ${m.assistiram.map((p) => p.nome.split(' ')[0]).join(', ')}`);
  }

  // ── por loja e por cargo ──
  const agrupa = (chave, titulo) => {
    const mapa = new Map();
    for (const p of pessoas) {
      const k = chave(p) || 'sem definição';
      const g = mapa.get(k) || { pessoas: 0, ativas: 0, aberturas: 0 };
      const ev = noPeriodo(p);
      g.pessoas += 1;
      if (ev.length) g.ativas += 1;
      g.aberturas += ev.length;
      mapa.set(k, g);
    }
    P();
    P('─'.repeat(58));
    P(titulo);
    P('─'.repeat(58));
    for (const [k, g] of [...mapa].sort((a, b) => b[1].ativas - a[1].ativas || b[1].pessoas - a[1].pessoas)) {
      P(`  ${k.padEnd(24)} ${g.ativas} de ${g.pessoas} usaram · ${plural(g.aberturas, 'abertura', 'aberturas')}`);
    }
  };
  agrupa((p) => LOJAS[p.email.split('@')[1]], 'POR LOJA');
  agrupa((p) => CARGOS[p.cargo], 'POR CARGO');

  // ── horários ──
  const horas = new Map();
  for (const p of pessoas) for (const e of noPeriodo(p)) {
    const h = Number(hhmm(e.at).slice(0, 2));
    horas.set(h, (horas.get(h) || 0) + 1);
  }
  if (horas.size) {
    P();
    P('─'.repeat(58));
    P('A QUE HORAS O TIME USA');
    P('─'.repeat(58));
    const max = Math.max(...horas.values());
    for (const h of [...horas.keys()].sort((a, b) => a - b)) {
      const n = horas.get(h);
      P(`  ${String(h).padStart(2, '0')}h  ${'█'.repeat(Math.max(1, Math.round((n / max) * 24)))} ${n}`);
    }
  }

  // ── funil ──
  const criou = pessoas.length;
  const entrou = pessoas.filter((p) => p.abriu).length;
  const abriuFicha = pessoas.filter((p) => noPeriodo(p).length).length;
  const viuTudo = pessoas.filter((p) => {
    const v = new Set(
      noPeriodo(p).map((e) => String(e.id).split('|')[0]).filter((id) => idsModelo.has(id)),
    );
    return v.size === modelos.length && modelos.length > 0;
  }).length;
  const tentouQuiz = pessoas.filter((p) => noPeriodo(p).some((e) => e.type === 'quiz_start')).length;
  const fezQuiz = pessoas.filter((p) => noPeriodo(p).some((e) => e.type === 'quiz_pass')).length;
  P();
  P('─'.repeat(58));
  P('O FUNIL');
  P('─'.repeat(58));
  const etapa = (n, rot) => P(`  ${String(n).padStart(2)}  ${'▇'.repeat(Math.max(0, Math.round((n / Math.max(criou, 1)) * 30))).padEnd(30)} ${rot}`);
  etapa(criou, 'criaram conta');
  etapa(entrou, 'abriram o app');
  etapa(abriuFicha, 'abriram pelo menos uma ficha');
  etapa(viuTudo, `viram os ${modelos.length} modelos`);
  etapa(tentouQuiz, 'tentaram um quiz');
  etapa(fezQuiz, 'passaram em um quiz');
  P();
  P('─'.repeat(58));
  P('Fonte: Firebase ao vivo (Auth + elevaStats, últimos 200 eventos por pessoa).');
  P('As contas de teste (Vivian e Silene) ficam fora, como no Painel.');
}

async function main() {
  const turno = (arg('turno') || 'manha').toLowerCase();
  const agora = new Date();
  const { de, ate, rotulo, fixa } = janela(agora);

  const tok = await token();
  const [users, stats, perfis] = await Promise.all([
    contas(tok),
    colecao(tok, 'elevaStats'),
    colecao(tok, 'elevaUsers'),
  ]);

  const cat = catalogo();
  const docs = catalogoDocs();
  const acess = catalogoAcessorios();
  const excecoes = excecoesDeAcesso();
  const perfilPorUid = Object.fromEntries(perfis.map((p) => [p._id, p]));
  const statPorUid = Object.fromEntries(stats.map((s) => [s._id, s]));

  // Objeção e one-page trazem o id em duas partes ("produto|detalhe"): a marca
  // está na primeira. Id que não está em lugar nenhum conta como da marca —
  // é acessório recém-cadastrado, e sumir com ele seria pior do que incluir.
  const daMarca = (id) => {
    const base = String(id || '').split('|')[0];
    const m = cat[base]?.marca ?? docs[base]?.marca ?? acess[base]?.marca;
    return m === undefined || m === MARCA;
  };

  const pessoas = users
    .map((u) => {
      const email = (u.email || '').toLowerCase();
      const perfil = perfilPorUid[u.localId] || {};
      const st = statPorUid[u.localId] || {};
      const ex = excecoes[email] || {};
      // Vale o acesso efetivo no app: a exceção primeiro, o perfil salvo depois.
      const eventos = (st.events || [])
        .map((e) => ({ ...e, at: new Date(e.at) }))
        .filter((e) => !Number.isNaN(+e.at) && daMarca(e.id));
      return {
        email,
        nome: u.displayName || st.name || email.split('@')[0],
        marcas: ex.marcas?.length ? ex.marcas : perfil.brands || [],
        papel: ex.papel || perfil.role || st.role || '',
        cargo: ex.cargo || perfil.cargo || st.cargo || '',
        criada: new Date(Number(u.createdAt)),
        abriu: u.lastRefreshAt ? new Date(u.lastRefreshAt) : null,
        eventos,
        vistas: eventos.filter((e) => e.type === 'pill_view').length,
        quiz: eventos.filter((e) => e.type === 'quiz_pass').length,
      };
    })
    .filter((p) => p.marcas.includes(MARCA) && !TESTE.has(p.email));

  const linhas = [];
  const P = (s = '') => linhas.push(s);

  if (temFlag('fundo')) {
    relatorioFundo({ pessoas, cat, docs, acess, de, ate, agora, P });
    console.log(linhas.join('\n'));
    return;
  }

  const dentro = (d) => d && d >= de && d < ate;

  P('═'.repeat(58));
  P(`ELEVA · RAMASA — relatório de ${turno === 'noite' ? 'FIM DO DIA' : 'MANHÃ'}`);
  P(`${carimbo(agora)}`);
  P(`Cobre ${carimbo(de)} → ${carimbo(ate)} (${rotulo})`);
  P('═'.repeat(58));
  P();

  // 1. Quem fez alguma coisa no período
  const ativos = pessoas
    .map((p) => ({ ...p, novos: p.eventos.filter((e) => dentro(e.at)).sort((a, b) => a.at - b.at) }))
    .filter((p) => p.novos.length)
    .sort((a, b) => a.novos[0].at - b.novos[0].at);

  const acoes = ativos.reduce((n, p) => n + p.novos.length, 0);
  const quizNovos = ativos.reduce((n, p) => n + p.novos.filter((e) => e.type === 'quiz_pass').length, 0);

  P('QUEM USOU');
  P(`  ${ativos.length} de ${pessoas.length} pessoas · ${plural(acoes, 'ação', 'ações')} · ${plural(quizNovos, 'quiz aprovado', 'quizzes aprovados')}`);
  P();
  if (!ativos.length) P('  Ninguém abriu conteúdo nenhum no período.');
  for (const p of ativos) {
    const ini = hhmm(p.novos[0].at);
    const fim = hhmm(p.novos[p.novos.length - 1].at);
    const faixa = ini === fim ? ini : `${ini}–${fim}`;
    const quem = identifica(p);
    P(`  ${faixa.padEnd(13)}${p.nome}${quem ? ` (${quem})` : ''}`);
    const conta = new Map();
    for (const e of p.novos) {
      const r = descreve(e, cat, docs, acess);
      conta.set(r, (conta.get(r) || 0) + 1);
    }
    for (const [r, n] of conta) P(`  ${''.padEnd(13)}${r}${n > 1 ? ` (${n}×)` : ''}`);
  }
  P();

  // 2. Abriu o app e não viu nada — sinal de que não achou o que procurava.
  //    Quem criou conta agora sai daqui: já aparece em CONTAS NOVAS.
  const soAbriu = pessoas.filter(
    (p) => dentro(p.abriu) && !dentro(p.criada) && !p.eventos.some((e) => dentro(e.at)),
  );
  if (soAbriu.length) {
    P('ABRIU E NÃO VIU NADA');
    for (const p of soAbriu) {
      const quem = identifica(p);
      P(`  ${hhmm(p.abriu).padEnd(13)}${p.nome}${quem ? ` (${quem})` : ''}`);
    }
    P();
  }

  // 3. Contas novas — é aqui que aparece gente entrando com acesso de gerência
  const novas = pessoas.filter((p) => dentro(p.criada));
  if (novas.length) {
    P('CONTAS NOVAS');
    for (const p of novas) {
      P(`  ${hhmm(p.criada).padEnd(13)}${p.nome} — ${identifica(p) || 'sem cargo definido'}`);
      P(`  ${''.padEnd(13)}${p.email}`);
      if (p.papel === 'gestor') {
        P(`  ${''.padEnd(13)}⚠ entrou como GESTOR: vê o Painel do time inteiro e publica conteúdo.`);
        P(`  ${''.padEnd(13)}  Confirmar se é pra ter esse acesso.`);
      }
      if (!p.cargo) P(`  ${''.padEnd(13)}⚠ ficou sem cargo — some da separação por função no Painel.`);
    }
    P();
  }

  // 4. Quem parou e quem nunca começou — duas conversas diferentes
  const parou = pessoas
    .filter((p) => p.vistas > 0 && p.abriu && diasAtras(p.abriu, agora) >= 2)
    .sort((a, b) => a.abriu - b.abriu);
  const nunca = pessoas
    .filter((p) => p.vistas === 0 && diasAtras(p.criada, agora) >= 1)
    .sort((a, b) => a.criada - b.criada);

  if (parou.length) {
    P('PAROU DE USAR');
    for (const p of parou) {
      const quem = identifica(p);
      P(`  ${`${diasAtras(p.abriu, agora)} dias`.padEnd(13)}${p.nome}${quem ? ` (${quem})` : ''} — último acesso ${ddmm(p.abriu)}`);
    }
    P();
  }

  if (nunca.length) {
    P('NUNCA USOU DE VERDADE');
    P('  Criou a conta e não abriu nenhum conteúdo até agora.');
    for (const p of nunca) {
      const quem = identifica(p);
      P(`  ${`${diasAtras(p.criada, agora)} dias`.padEnd(13)}${p.nome}${quem ? ` (${quem})` : ''} — conta de ${ddmm(p.criada)}`);
    }
    P();
  }

  // 5. A trava do momento: sem quiz, dois terços do conteúdo seguem fechados
  const comQuiz = pessoas.filter((p) => p.quiz > 0).length;
  const usaram = pessoas.filter((p) => p.vistas > 0).length;
  P('SITUAÇÃO GERAL');
  P(`  ${pessoas.length} contas da Ramasa · ${usaram} já abriram algum conteúdo · ${pessoas.reduce((n, p) => n + p.vistas, 0)} aberturas no total`);
  if (!comQuiz) {
    P(`  ⚠ Nenhuma das ${pessoas.length} passou de nível ainda (zero quiz aprovado).`);
    P('    Enquanto isso, os níveis 2 e 3 seguem trancados para todo mundo.');
  } else {
    P(`  ${comQuiz} de ${pessoas.length} já passaram de nível.`);
  }
  P();
  P('─'.repeat(58));
  P('Fonte: Firebase ao vivo (Auth + elevaStats). As contas de teste (Vivian e');
  P('Silene) ficam fora da contagem, e só entram contas com acesso à Ramasa.');

  console.log(linhas.join('\n'));

  // Guarda onde parou, pra que o próximo relatório continue exatamente daqui.
  if (!fixa) {
    mkdirSync(ESTADO_DIR, { recursive: true });
    writeFileSync(ESTADO, JSON.stringify({ ultimoRelatorio: ate.toISOString(), turno }, null, 2));
  }
}

main().catch((e) => {
  console.error(`Não consegui montar o relatório: ${e.message}`);
  process.exit(1);
});
