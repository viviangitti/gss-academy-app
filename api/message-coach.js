// Vercel Serverless Function — Coach de Mensagem.
// Endpoint: POST /api/message-coach  { message, context, channel }
//
// A chave do Gemini fica APENAS aqui (env do servidor). Antes a análise rodava
// no navegador com VITE_GEMINI_API_KEY, o que embutia a chave no bundle público
// — foi esse o vetor do sequestro que suspendeu o projeto.
//
// O prompt também vive aqui (não é aceito do cliente), então o endpoint não
// vira um proxy genérico de IA para terceiros.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth, checkRateLimit } from './_auth.js';
import { guardBudget } from './_aiBudget.js';
import { MODELO_RAPIDO } from './_modelos.js';

const MAX_MESSAGE_CHARS = 4000;

const ANALYSIS_PROMPT = (message, context, channel) => `Você é um coach de vendas especialista. Analise esta mensagem comercial que o vendedor vai enviar para o cliente.

CANAL: ${channel}
CONTEXTO: ${context || 'não especificado'}

MENSAGEM DO VENDEDOR:
"""
${message}
"""

Responda EXATAMENTE neste formato JSON (sem markdown, sem crases), em português brasileiro:

{
  "score": <nota de 1 a 10>,
  "tone": "<descrição curta do tom, ex: 'Genérico e passivo'>",
  "strengths": ["<1-3 pontos fortes em frases curtas>"],
  "problems": ["<1-4 problemas específicos em frases diretas>"],
  "improved": "<mensagem reescrita do zero, MUITO MELHOR, pronta para copiar e enviar. Mantenha o canal escolhido. Para WhatsApp seja curto e direto. Para e-mail seja estruturado. Não use formalidades exageradas>",
  "whyBetter": "<1 frase explicando por que a versão melhorada funciona melhor>"
}

Seja honesto: se a mensagem for ruim, dê nota baixa. Se for excelente, dê nota alta.
NÃO inclua nenhum texto antes ou depois do JSON.`;

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

    // Teto DIÁRIO global (contador no Firestore). O 'orçamento' do Google é
    // só alerta e não segura gasto — este segura.
    if (!(await guardBudget(res))) return;

  const { message, context = '', channel = '' } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Mensagem inválida' });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return res.status(413).json({ error: 'Mensagem muito longa' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'IA não configurada no servidor' });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODELO_RAPIDO });

    const result = await model.generateContent(
      ANALYSIS_PROMPT(message, String(context).slice(0, 200), String(channel).slice(0, 60))
    );
    const text = result.response.text().trim();
    // Remove possíveis crases de markdown
    const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      console.error('[api/message-coach] resposta não-JSON:', cleaned.slice(0, 200));
      return res.status(502).json({ error: 'A IA não retornou uma análise válida. Tente novamente.' });
    }

    return res.status(200).json({ analysis });
  } catch (err) {
    console.error('[api/message-coach] erro:', err);
    return res.status(502).json({ error: 'A análise ficou indisponível. Tente novamente.' });
  }
}
