// Vercel Serverless Function — Proxy do Gemini.
// Endpoint: POST /api/ai-proxy  { model, contents, systemInstruction?, generationConfig?, tools? }
//
// A chave do Gemini fica APENAS aqui (env do servidor). Antes as páginas
// chamavam o SDK direto do navegador com VITE_GEMINI_API_KEY, o que embutia a
// chave no bundle público — foi esse o vetor do sequestro que suspendeu o
// projeto no Google.
//
// O cliente usa src/lib/aiProxy.ts, que expõe a mesma interface do SDK.

import { requireAuth, checkRateLimit } from './_auth.js';
import { guardBudget } from './_aiBudget.js';
import { MODELOS } from './_modelos.js';
import { linhaDeHoje } from './_hoje.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Só os modelos que o app realmente usa (evita abuso com modelos caros).
const ALLOWED_MODELS = new Set(MODELOS);

// Teto de payload: fluxos multimodais mandam imagem/áudio em base64.
const MAX_PAYLOAD_BYTES = 12 * 1024 * 1024;

export default async function handler(req, res) {
    // Resposta de IA não se guarda em lugar nenhum: é por pessoa, por minuto,
    // e uma resposta reaproveitada é uma resposta desatualizada — foi assim que
    // a data velha chegou à tela. Mesmo trio que as rotas maestria-* já usam.
    res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
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
    if (!(await guardBudget(res, 'proxy'))) return;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'IA não configurada no servidor' });

    const { model, contents, systemInstruction, generationConfig, tools } = req.body || {};
    if (!model || !contents) return res.status(400).json({ error: 'model e contents são obrigatórios' });
    if (!ALLOWED_MODELS.has(model)) return res.status(400).json({ error: `Modelo não permitido: ${model}` });

    try {
        // O DIA ENTRA AQUI, SEMPRE.
        //
        // Este proxy é a porta por onde passam RolePlay, análise de reunião e o
        // que vier depois — cada um monta o próprio prompt, e nenhum lembrava de
        // dizer que dia é hoje. Em vez de confiar que cada tela nova vai lembrar,
        // o dia é carimbado na passagem: uma linha, em todas as chamadas.
        const body = { contents };
        const partesSistema = !systemInstruction
            ? []
            : typeof systemInstruction === 'string'
                ? [{ text: systemInstruction }]
                : (systemInstruction.parts || []);
        body.systemInstruction = { parts: [...partesSistema, { text: linhaDeHoje() }] };
        if (generationConfig && typeof generationConfig === 'object') body.generationConfig = generationConfig;
        if (Array.isArray(tools)) body.tools = tools;

        const payload = JSON.stringify(body);
        if (Buffer.byteLength(payload, 'utf8') > MAX_PAYLOAD_BYTES) {
            return res.status(413).json({ error: 'Conteúdo grande demais.' });
        }

        const r = await fetch(`${GEMINI_URL}/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
        });
        const data = await r.json();

        if (!r.ok) {
            // Log completo no servidor; mensagem genérica para o cliente (não
            // expor detalhes de billing/quota do Google).
            console.error(`[api/ai-proxy] status=${r.status}: ${data?.error?.message || 'erro'}`);
            const msg = r.status === 429
                ? 'A IA está indisponível no momento. Tente novamente mais tarde.'
                : 'Não foi possível processar agora. Tente novamente.';
            return res.status(r.status === 429 ? 429 : 502).json({ error: msg });
        }

        const parts = data.candidates?.[0]?.content?.parts;
        const text = Array.isArray(parts) ? parts.map((p) => p.text || '').join('') : '';

        return res.status(200).json({ text, raw: data });
    } catch (err) {
        console.error('[api/ai-proxy] erro:', err);
        return res.status(502).json({ error: 'Falha ao chamar a IA. Tente novamente.' });
    }
}
