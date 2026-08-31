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

// Conta da Vivian: fica fora da contagem do time. Ela é quem lê o relatório —
// o uso dela inflaria os números e esconderia se o time está entrando ou não.
const DONA = 'viviangitti23@gmail.com';

// Credenciais públicas do CLI do Firebase (firebase-tools). Não são segredo:
// um "installed app" do OAuth não consegue guardar segredo, por definição, e
// elas vêm no código aberto do próprio firebase-tools. Quem dá acesso de fato
// é o refresh token guardado na máquina da Vivian.
const CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

// ─────────────────────────────── utilidades ───────────────────────────────

const arg = (nome) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

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

  let anterior = null;
  try { anterior = new Date(JSON.parse(readFileSync(ESTADO, 'utf8')).ultimoRelatorio); } catch { /* primeira vez */ }
  // Sem estado anterior, cobre as últimas 14h — o vão típico entre dois turnos.
  const de = anterior && !Number.isNaN(+anterior) ? anterior : new Date(+agora - 14 * 3600 * 1000);
  return { de, ate: agora, rotulo: 'desde o relatório anterior', fixa: false };
}

// ─────────────────────────────── relatório ───────────────────────────────

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
  const excecoes = excecoesDeAcesso();
  const perfilPorUid = Object.fromEntries(perfis.map((p) => [p._id, p]));
  const statPorUid = Object.fromEntries(stats.map((s) => [s._id, s]));

  const daMarca = (id) => cat[id]?.marca === MARCA || !cat[id]; // id desconhecido conta (acessório novo)
  const rotulo_ = (id) => cat[id]?.nome || id;

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
    .filter((p) => p.marcas.includes(MARCA) && p.email !== DONA);

  const dentro = (d) => d && d >= de && d < ate;
  const linhas = [];
  const P = (s = '') => linhas.push(s);

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
      const r =
        e.type === 'quiz_pass' ? `★ QUIZ APROVADO — ${rotulo_(e.id)}`
        : e.type === 'mission_done' ? `missão concluída — ${rotulo_(e.id)}`
        : rotulo_(e.id);
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
  P('Fonte: Firebase ao vivo (Auth + elevaStats). A conta da Vivian fica fora');
  P('da contagem, e só entram contas com acesso à Ramasa.');

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
