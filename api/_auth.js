// Verificação de Firebase ID token no servidor (sem SDK admin).
//
// Por que existe: os endpoints de IA ficaram ABERTOS depois que tiramos a chave
// do navegador. Um robô que já conhecia o site passou a chamar /api/* direto e
// continuou queimando o crédito do Gemini — não precisa mais da chave. Este
// guard exige uma conta logada em cada chamada.
//
// Valida a assinatura RS256 contra os certificados públicos do Google.

import crypto from 'node:crypto';

const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

let certsCache = { certs: null, expiresAt: 0 };

async function getGoogleCerts() {
    if (certsCache.certs && Date.now() < certsCache.expiresAt) return certsCache.certs;
    const res = await fetch(CERTS_URL);
    if (!res.ok) throw new Error('Falha ao obter certificados do Google');
    const certs = await res.json();
    const maxAge = parseInt((res.headers.get('cache-control') || '').match(/max-age=(\d+)/)?.[1] || '3600', 10);
    certsCache = { certs, expiresAt: Date.now() + maxAge * 1000 };
    return certs;
}

const b64url = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

export async function verifyIdToken(idToken) {
    if (!PROJECT_ID) throw new Error('FIREBASE_PROJECT_ID não configurado no servidor');

    const parts = idToken.split('.');
    if (parts.length !== 3) throw new Error('Token malformado');

    const header = JSON.parse(b64url(parts[0]).toString('utf8'));
    const payload = JSON.parse(b64url(parts[1]).toString('utf8'));
    if (header.alg !== 'RS256') throw new Error('Algoritmo inválido');

    const certs = await getGoogleCerts();
    const pem = certs[header.kid];
    if (!pem) throw new Error('Certificado desconhecido');

    const ok = crypto.verify(
        'RSA-SHA256',
        Buffer.from(`${parts[0]}.${parts[1]}`),
        crypto.createPublicKey(pem),
        b64url(parts[2])
    );
    if (!ok) throw new Error('Assinatura inválida');

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) throw new Error('Token expirado');
    if (payload.iat > now + 300) throw new Error('Token emitido no futuro');
    if (payload.aud !== PROJECT_ID) throw new Error('Audience inválida');
    if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) throw new Error('Issuer inválido');
    if (!payload.sub) throw new Error('Token sem uid');

    return payload.sub; // uid
}

/**
 * Exige usuário logado. Responde 401 e devolve null quando não autenticado.
 * Uso:  const uid = await requireAuth(req, res); if (!uid) return;
 */
export async function requireAuth(req, res) {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) {
        res.status(401).json({ error: 'Não autenticado' });
        return null;
    }
    try {
        return await verifyIdToken(token);
    } catch (e) {
        res.status(401).json({ error: `Token inválido: ${e.message}` });
        return null;
    }
}

/**
 * Exige senha de ADMIN. Protege os painéis de gestão (maestria-*, waitlist-*),
 * que expõem dado pessoal (nome, empresa, cargo, histórico de uso).
 *
 * Por que existe: esses endpoints ficaram abertos e qualquer um na internet
 * conseguia listar os usuários e puxar o histórico de cada um pelo uid.
 *
 * Falha FECHADA: sem ADMIN_TOKEN configurado no servidor, ninguém entra.
 * Uso:  if (!requireAdmin(req, res)) return;
 */
export function requireAdmin(req, res) {
    const expected = process.env.ADMIN_TOKEN;
    if (!expected) {
        res.status(503).json({ error: 'ADMIN_TOKEN não configurado no servidor' });
        return false;
    }
    const sent = req.headers['x-admin-token'] || '';
    // Comparação de tempo constante: evita descobrir a senha medindo o tempo.
    const a = Buffer.from(String(sent));
    const b = Buffer.from(String(expected));
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!ok) {
        res.status(401).json({ error: 'Não autorizado' });
        return false;
    }
    return true;
}

// ---- Rate limit por usuário (best-effort: por instância da function) ----
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;
const usage = new Map();

export function checkRateLimit(uid) {
    const now = Date.now();
    const e = usage.get(uid);
    if (!e || now - e.start > RATE_WINDOW_MS) {
        usage.set(uid, { start: now, count: 1 });
        return true;
    }
    e.count += 1;
    return e.count <= RATE_LIMIT;
}
