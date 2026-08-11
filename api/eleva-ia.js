// Vercel Serverless Function — Tira-dúvida do Eleva (uso INTERNO).
// Endpoint: POST /api/eleva-ia
//
// O CÉREBRO fica em _coach.js: é o método GSS, propriedade intelectual do
// produto, e por isso vive aqui no servidor e nunca no pacote do navegador.
// Este arquivo é a PEÇA 4 do método — o comportamento em volta, sem o qual o
// coach parece quebrado mesmo com o prompt perfeito:
//   - resposta vazia nunca vai pra tela (o modelo às vezes devolve em branco)
//   - dois modelos, um de reserva, pra congestionamento não virar erro
//   - limite de uso por pessoa e teto diário de gasto
//
// O cliente manda DADOS (quem é a pessoa, o que ela viu, as condições
// publicadas). As instruções ele nunca vê.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth, checkRateLimit } from './_auth.js';
import { guardBudget } from './_aiBudget.js';
import { montarConversa } from './_coach.js';

// Dois modelos: o principal e o de reserva. Se o primeiro engasgar por
// congestionamento (429/503), a pergunta é refeita no segundo — o vendedor não
// fica esperando nem leva erro na cara no meio de um atendimento.
const MODELOS = ['gemini-flash-lite-latest', 'gemini-flash-latest'];

// Erro que vale tentar de novo no outro modelo (congestionamento/instabilidade),
// em oposição a erro de chave ou de payload, onde repetir só gasta.
function vaiAdiantarTrocarDeModelo(err) {
  const m = String(err?.message || err || '');
  return /\b(429|500|502|503|504)\b|overload|unavailable|exhausted|timeout|deadline/i.test(m);
}

async function responder(apiKey, conversa, mensagem) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let ultimoErro = null;
  for (const modelo of MODELOS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelo });
      const chat = model.startChat({ history: conversa });
      const r = await chat.sendMessage(mensagem);
      const texto = (r?.response?.text?.() || '').trim();
      // Resposta em branco é ERRO, não resposta. Deixar passar vira balão vazio
      // na tela — foi exatamente o que acontecia no MAESTR.IA.
      if (!texto) throw new Error(`resposta vazia (${modelo})`);
      return { texto, modelo };
    } catch (err) {
      ultimoErro = err;
      const ehVazia = /resposta vazia/.test(String(err?.message || ''));
      if (!ehVazia && !vaiAdiantarTrocarDeModelo(err)) throw err;
      console.warn(`[eleva-ia] ${modelo} falhou (${err?.message}) — tentando o próximo`);
    }
  }
  throw ultimoErro || new Error('sem resposta');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Exige usuária logada — sem isso o endpoint fica aberto e um robô consegue
  // queimar o crédito do Gemini chamando direto, mesmo sem ter a chave.
  const uid = await requireAuth(req, res);
  if (!uid) return;
  if (!checkRateLimit(uid)) {
    return res.status(429).json({ error: 'Muitas requisições. Aguarde um minuto.' });
  }

  // Teto DIÁRIO global. O 'orçamento' do Google é só alerta e não segura gasto;
  // este segura.
  if (!(await guardBudget(res))) return;

  try {
    const {
      message,
      history = [],
      context = '',     // conteúdo aprovado dos produtos, montado no cliente
      perfil = 'balcao', // 'auto' | 'balcao' | 'revenda' (compatível com a versão antiga)
      gestor = false,
      memoria = {},     // quem é a pessoa, o que ela viu, condições publicadas
      app = 'Eleva',
    } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem inválida' });
    }

    // SÓ a chave de servidor (GEMINI_API_KEY, sem VITE_). Nunca cair pra
    // VITE_GEMINI_API_KEY: essa vaza no bundle do navegador e já foi abusada por
    // robô (13,5 mil chamadas/dia). A chave fica aqui, no servidor, invisível.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key não configurada' });

    // Qual arsenal do MAESTR.IA usar. Balcão e revenda são farmacêutico; a
    // concessionária é automotivo.
    const segmento = perfil === 'auto' ? 'automotivo' : 'farmaceutico';

    const conversa = montarConversa({
      app: String(app).slice(0, 40),
      vertical: perfil,
      ehGestor: !!gestor,
      segmento,
      produtos: context,
      perfil: memoria,
      historico: history,
      apelido: 'Tira-dúvida',
    });

    const { texto, modelo } = await responder(apiKey, conversa, message);
    return res.status(200).json({ reply: texto, modelo });
  } catch (err) {
    console.error('[api/eleva-ia] erro:', err);
    return res.status(500).json({ error: 'Erro ao processar', details: err?.message || 'unknown' });
  }
}
