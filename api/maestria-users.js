// GET /api/maestria-users?limit=50
// Lista usuários (com dados mínimos pra dashboard, sem emails/whatsapp etc)
// Mostra: nome (primeiro nome), empresa, segmento, role, data cadastro,
// quantas sessões, última atividade.

import { getDb, isInternalUser } from './_firebase.js';

let cache = null;
let cacheTs = 0;
const TTL_MS = 5 * 60 * 1000;

const firstName = (full = '') => String(full).trim().split(/\s+/)[0] || '';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Impede CDN da Vercel/browser de cachear a resposta — o cache em memória da função já existe
  res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const now = Date.now();
  if (cache && now - cacheTs < TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cache);
  }

  try {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 200);

    const usersSnap = await db.collection('users').limit(limit).get();
    const users = [];
    let excludedCount = 0;

    for (const userDoc of usersSnap.docs) {
      const u = userDoc.data();
      if (isInternalUser(u)) { excludedCount++; continue; }

      // Pega contagem de sessões e última atividade do history
      let sessionsCount = 0;
      let lastActivity = null;
      let firstActivity = null;
      try {
        const histSnap = await db.collection('users').doc(userDoc.id).collection('data').doc('history').get();
        if (histSnap.exists) {
          const items = histSnap.data()?.items || [];
          sessionsCount = items.length;
          items.forEach((it) => {
            const t = toDate(it.createdAt);
            if (t) {
              if (!lastActivity || t > lastActivity) lastActivity = t;
              if (!firstActivity || t < firstActivity) firstActivity = t;
            }
          });
        }
      } catch (e) {
        // ignora
      }

      users.push({
        uid: userDoc.id,
        firstName: firstName(u.name),
        lastInitial: (u.name || '').split(/\s+/).slice(1).map(s => s[0]).filter(Boolean).join('.'),
        company: u.company || null,
        segment: u.segment || null,
        role: u.role || null,
        isAdmin: !!u.isAdmin,
        createdAt: toDate(u.createdAt)?.toISOString() || null,
        sessionsCount,
        lastActivityAt: lastActivity?.toISOString() || null,
        firstActivityAt: firstActivity?.toISOString() || null,
      });
    }

    // Ordena por última atividade (mais recente primeiro)
    users.sort((a, b) => {
      const ta = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
      const tb = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
      return tb - ta;
    });

    const result = {
      total: users.length,
      excludedInternalUsers: excludedCount,
      users,
      source: 'firestore',
      updatedAt: new Date().toISOString(),
    };

    cache = result;
    cacheTs = now;

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[maestria-users] erro:', err);
    return res.status(500).json({ error: err.message || 'Erro inesperado' });
  }
}

function toDate(v) {
  if (!v) return null;
  if (typeof v === 'number') return new Date(v);
  if (typeof v?.toDate === 'function') return v.toDate();
  if (typeof v === 'string') { const d = new Date(v); return isNaN(d) ? null : d; }
  return null;
}
