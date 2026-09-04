// Diagnóstico da IA — responde se a chave do Gemini está válida, SEM expor a chave.
// Protegido por senha de admin (x-admin-token). Endpoint: GET /api/ia-status
//
// Serve pra saber, em 1 segundo, se o problema é: chave ausente, chave inválida,
// cota estourada, ou se está tudo certo. Sem isso, a única pista é "não funcionou".

import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAdmin } from './_auth.js';
import { MODELO_RAPIDO, MODELOS } from './_modelos.js';

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

  // ?modelos=a,b,c  → testa esses modelos via REST e diz quais funcionam.
  // Serve pra descobrir o modelo certo de OUTRO app (ex.: Corpo Leve) usando
  // esta chave, sem precisar mexer no outro projeto às cegas.
  const pedidos = String(req.query?.modelos || '').trim();
  if (pedidos) {
    const lista = pedidos.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8);
    const resultado = {};
    for (const mdl of lista) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'ok' }] }] }),
          }
        );
        resultado[mdl] = r.status === 200 ? 'FUNCIONA' : `HTTP ${r.status}`;
      } catch (e) {
        resultado[mdl] = 'erro: ' + String(e?.message || e).slice(0, 50);
      }
    }
    return res.status(200).json({ ...info, testeDeModelos: resultado });
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: MODELO_RAPIDO });
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
    else if (/not found|404/i.test(msg)) diagnostico = 'MODELO NÃO ENCONTRADO para esta chave';

    // Modelo não existe? Lista os que a chave PODE usar — é a resposta prática.
    let modelosDisponiveis = null;
    if (/not found|404/i.test(msg)) {
      try {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key));
        const j = await r.json();
        modelosDisponiveis = (j.models || [])
          .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
          .map((m) => String(m.name).replace('models/', ''))
          .slice(0, 25);
      } catch (e2) {
        modelosDisponiveis = 'falha ao listar: ' + String(e2?.message || e2).slice(0, 80);
      }
    }
    // A biblioteca falhou. Tenta na mão (REST puro) pra saber se o problema é a
    // biblioteca antiga ou o modelo mesmo.
    const testeDireto = {};
    for (const mdl of MODELOS) {
      for (const v of ['v1beta', 'v1']) {
        try {
          const r = await fetch(
            `https://generativelanguage.googleapis.com/${v}/models/${mdl}:generateContent?key=${encodeURIComponent(key)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: 'ok' }] }] }),
            }
          );
          testeDireto[`${v}/${mdl}`] = r.status === 200 ? 'FUNCIONA' : `HTTP ${r.status}`;
        } catch (e3) {
          testeDireto[`${v}/${mdl}`] = 'erro: ' + String(e3?.message || e3).slice(0, 40);
        }
      }
    }
    return res.status(200).json({ ...info, ok: false, diagnostico, erroBruto: msg.slice(0, 200), modelosDisponiveis, testeDireto });
  }
}
