// Diagnóstico da IA — responde se a chave do Gemini está válida, SEM expor a chave.
// Protegido por senha de admin (x-admin-token). Endpoint: GET /api/ia-status
//
// Serve pra saber, em 1 segundo, se o problema é: chave ausente, chave inválida,
// cota estourada, ou se está tudo certo. Sem isso, a única pista é "não funcionou".

import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  const key = process.env.GEMINI_API_KEY;
  const info = {
    chaveConfigurada: !!key,
    // Só o tamanho e os 4 primeiros caracteres — o suficiente pra saber SE trocou,
    // sem revelar a chave.
    tamanho: key ? key.length : 0,
    comeca: key ? key.slice(0, 4) : null,
    firestore: !!process.env.FIREBASE_SERVICE_ACCOUNT,
  };

  if (!key) {
    return res.status(200).json({ ...info, ok: false, diagnostico: 'GEMINI_API_KEY não está configurada neste projeto' });
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const r = await model.generateContent('Responda apenas: ok');
    const txt = (r.response.text() || '').trim().slice(0, 20);
    return res.status(200).json({ ...info, ok: true, diagnostico: 'chave VÁLIDA, Gemini respondeu', resposta: txt });
  } catch (e) {
    const msg = String(e?.message || e);
    let diagnostico = 'erro desconhecido';
    if (/API_KEY_INVALID|API key not valid/i.test(msg)) diagnostico = 'CHAVE INVÁLIDA (errada ou revogada)';
    else if (/quota|RESOURCE_EXHAUSTED|429/i.test(msg)) diagnostico = 'COTA ESTOURADA (limite do nível gratuito)';
    else if (/PERMISSION_DENIED|403/i.test(msg)) diagnostico = 'SEM PERMISSÃO (API não habilitada no projeto)';
    else if (/billing/i.test(msg)) diagnostico = 'problema de faturamento no projeto';
    return res.status(200).json({ ...info, ok: false, diagnostico, erroBruto: msg.slice(0, 200) });
  }
}
