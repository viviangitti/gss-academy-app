// QUE DIA É HOJE — a conferência que impede o coach de repetir data velha.
//
// Nasceu de um erro que chegou à tela da Vivian: em 29/09/2026, uma terça, o
// Tira-dúvida cumprimentou com "hoje é sexta-feira, 25 de setembro de 2026".
// Não foi chute do modelo — 25/09 realmente caiu numa sexta. Foi ECO: o bloco
// "## HOJE" é o primeiro turno da conversa, o histórico guardado no aparelho
// entra depois dele, e lá dentro havia uma resposta do dia 25 dizendo a data
// do dia 25. Entre duas datas, o modelo fica com a última que leu.
//
// O conserto tem três partes, e este script guarda as três:
//   1. a data é repetida no FIM da fila, encostada na pergunta de agora;
//   2. toda mensagem de outro dia entra marcada com [dd/mm];
//   3. nenhum endpoint fala com um modelo sem dizer que dia é hoje.
//
// Uso: node scripts/check-data.mjs   (entra no npm run confere)
import fs from 'fs';
import path from 'path';
import { montarConversa } from '../api/_coach.js';

const VERDE = '\x1b[0;32m', VERM = '\x1b[0;31m', FIM = '\x1b[0m';
const falhas = [];
const dizer = (cond, erro) => { if (!cond) falhas.push(erro); };

// ── 1. a conversa montada, com o histórico do dia do bug ──────────────────
const ONTEM = Date.now() - 4 * 86400000;
const diaDe = (ms) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' }).format(new Date(ms));
const hojeExtenso = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

const base = { app: 'Eleva', vertical: 'auto', ehGestor: false, segmento: 'automotivo', produtos: 'x', perfil: { nome: 'Teste' }, apelido: 'Coach' };

const comHistoricoVelho = montarConversa({
  ...base,
  historico: [
    { role: 'user', content: 'me ajuda', at: ONTEM },
    { role: 'assistant', content: `Olá! Hoje é ${diaDe(ONTEM)} e a quinzena termina hoje.`, at: ONTEM },
  ],
});

const textos = comHistoricoVelho.map((t) => t.parts[0].text);
const ultimoUser = textos.findLastIndex((_, i) => comHistoricoVelho[i].role === 'user');
const posHistorico = textos.findIndex((t) => t.includes('me ajuda'));

dizer(
  textos[ultimoUser].includes('CONFERÊNCIA DE DATA') && textos[ultimoUser].includes(hojeExtenso),
  'a data de hoje não é o último turno de usuário — o histórico volta a mandar na data',
);
dizer(ultimoUser > posHistorico, 'a conferência de data vem ANTES do histórico; tem que vir depois');
dizer(
  comHistoricoVelho[comHistoricoVelho.length - 1].role === 'model' &&
    textos[textos.length - 1].includes(hojeExtenso),
  'o modelo não confirma a data com a própria boca no fim da fila',
);
dizer(textos[0].includes(hojeExtenso), 'o bloco ## HOJE perdeu a data de hoje');

// ── 2. o carimbo por mensagem ─────────────────────────────────────────────
const marca = new RegExp(`^\\[${diaDe(ONTEM).replace('/', '\\/')}\\] `);
dizer(marca.test(textos[posHistorico]), 'mensagem de outro dia entrou SEM a marca [dd/mm]');

const soDeHoje = montarConversa({ ...base, historico: [{ role: 'user', content: 'pergunta de hoje', at: Date.now() }] });
dizer(
  !/^\[\d\d\/\d\d\] /.test(soDeHoje[2].parts[0].text),
  'mensagem de HOJE saiu marcada — a marca vira ruído e o modelo passa a repetir',
);

const semCarimbo = montarConversa({ ...base, historico: [{ role: 'user', content: 'conversa antiga sem at' }] });
dizer(semCarimbo.length >= 4, 'conversa gravada antes desta versão (sem carimbo) quebrou a montagem');
dizer(
  !/^\[/.test(semCarimbo[2].parts[0].text),
  'conversa inteira sem carimbo saiu marcada — quem está no pacote antigo teria até a pergunta de agora descontada',
);

// MISTA: parte carimbada, parte não. É quem atualizou o app no meio de uma
// conversa velha — e aí o que não tem data NÃO pode passar por fala de hoje.
const mista = montarConversa({
  ...base,
  historico: [
    { role: 'user', content: 'pergunta sem carimbo' },
    { role: 'assistant', content: 'resposta de hoje', at: Date.now() },
  ],
});
dizer(
  mista[2].parts[0].text.startsWith('[outro dia] '),
  'em conversa mista, a mensagem sem carimbo passou por fala de hoje — é assim que o bug volta',
);

// ── 3. papéis alternados: dois turnos iguais derrubam a chamada ───────────
for (const [nome, c] of [['normal', comHistoricoVelho], ['só hoje', soDeHoje], ['sem carimbo', semCarimbo],
  ['histórico terminando em pergunta', montarConversa({ ...base, historico: [{ role: 'user', content: 'pergunta que falhou', at: ONTEM }] })]]) {
  for (let i = 1; i < c.length; i++) {
    if (c[i].role === c[i - 1].role) { falhas.push(`dois turnos '${c[i].role}' seguidos (${nome}) — o Gemini recusa a chamada`); break; }
  }
}

// ── 3b. o relógio fora da conversa ────────────────────────────────────────
// A conferência do fim resolve o eco; o systemInstruction é a cópia que NENHUM
// turno de histórico alcança, porque não é uma fala da conversa.
const elevaIa = fs.readFileSync('api/eleva-ia.js', 'utf8');
dizer(
  /systemInstruction[\s\S]{0,120}linhaDeHoje/.test(elevaIa),
  'api/eleva-ia.js parou de mandar a data no systemInstruction — some a única cópia que o histórico não alcança',
);

// ── 4. nenhum endpoint fala com modelo sem data ───────────────────────────
// Não basta o Tira-dúvida estar certo: qualquer porta que chame um modelo sem
// dizer o dia faz o modelo chutar pela memória de treino, que é de outro ano.
const CHAMA_MODELO = /getGenerativeModel|generateContent|startChat|generativelanguage\.googleapis/;
const TEM_DATA = /montarConversa|hojeNoBrasil|linhaDeHoje|America\/Sao_Paulo/;
// ia-status não conversa: manda "responda apenas OK" para ver se a chave vive.
// Data ali não serve para nada — e exigir uma só ensinaria a driblar o teste.
const NAO_CONVERSA = new Set(['ia-status.js']);
for (const f of fs.readdirSync('api').filter((n) => n.endsWith('.js'))) {
  if (NAO_CONVERSA.has(f)) continue;
  const texto = fs.readFileSync(path.join('api', f), 'utf8');
  if (!CHAMA_MODELO.test(texto)) continue;
  if (!TEM_DATA.test(texto)) falhas.push(`api/${f} chama um modelo e nunca diz que dia é hoje`);
}

// ── veredito ──────────────────────────────────────────────────────────────
if (falhas.length) {
  console.log(`${VERM}FALHA${FIM}  a data pode voltar a sair errada na tela:`);
  falhas.forEach((f) => console.log(`         · ${f}`));
  console.log(`\n       Foi assim que o coach disse "hoje é 25/09" no dia 29/09.`);
  process.exit(1);
}
console.log(`${VERDE}✓ Data: hoje é ${hojeExtenso}, e é isso que o modelo lê por último.${FIM}`);
