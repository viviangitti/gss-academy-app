// GET /api/maestria-user-history?uid={uid}
// Retorna o histórico completo de um usuário específico:
// - Todas as sessões com data/hora e tipo
// - Heatmap diário (últimos 30 dias)
// - Estatísticas de uso

import { getDb, isInternalUser } from './_firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Impede CDN da Vercel/browser de cachear a resposta — o cache em memória da função já existe
  res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const uid = String(req.query.uid || '').trim();
  if (!uid) return res.status(400).json({ error: 'uid obrigatório' });

  try {
    const db = getDb();

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Usuário não encontrado' });

    const u = userDoc.data();
    if (isInternalUser(u)) {
      return res.status(403).json({ error: 'Usuário interno (oculto)' });
    }

    // History
    const histSnap = await db.collection('users').doc(uid).collection('data').doc('history').get();
    const items = histSnap.exists ? (histSnap.data()?.items || []) : [];

    // Normaliza + ordena por data desc
    const sessions = items.map(it => ({
      type: it.type || 'unknown',
      title: it.title || null,
      subtitle: it.subtitle || null,
      createdAt: toIso(it.createdAt),
    })).filter(s => s.createdAt).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Heatmap dos últimos 30 dias (mapa data → contagem)
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const heatmap = [];
    const dailyMap = {};
    sessions.forEach(s => {
      const d = new Date(s.createdAt);
      const k = formatDate(d);
      dailyMap[k] = (dailyMap[k] || 0) + 1;
    });
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const k = formatDate(d);
      heatmap.push({ date: k, count: dailyMap[k] || 0 });
    }

    // Por tipo
    const byType = {};
    sessions.forEach(s => { byType[s.type] = (byType[s.type] || 0) + 1; });

    // Dias com acesso nos últimos 30
    const daysActive30d = heatmap.filter(d => d.count > 0).length;

    // Streaks (sequência consecutiva)
    let currentStreak = 0;
    for (let i = heatmap.length - 1; i >= 0; i--) {
      if (heatmap[i].count > 0) currentStreak++;
      else break;
    }

    // Tempo desde último acesso (em horas)
    const lastSession = sessions[0]?.createdAt;
    const hoursSinceLast = lastSession ? Math.floor((Date.now() - new Date(lastSession).getTime()) / 3600000) : null;

    return res.status(200).json({
      user: {
        uid,
        firstName: (u.name || '').trim().split(/\s+/)[0] || null,
        lastInitial: (u.name || '').split(/\s+/).slice(1).map(s => s[0]).filter(Boolean).join('.'),
        company: u.company || null,
        segment: u.segment || null,
        role: u.role || null,
        isAdmin: !!u.isAdmin,
        createdAt: toIso(u.createdAt),
      },
      stats: {
        totalSessions: sessions.length,
        byType,
        daysActive30d,
        currentStreak,
        hoursSinceLastAccess: hoursSinceLast,
      },
      heatmap,
      sessions: sessions.slice(0, 100), // últimas 100
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[maestria-user-history] erro:', err);
    return res.status(500).json({ error: err.message || 'Erro inesperado' });
  }
}

function toIso(v) {
  if (!v) return null;
  if (typeof v === 'number') return new Date(v).toISOString();
  if (typeof v?.toDate === 'function') return v.toDate().toISOString();
  if (typeof v === 'string') { const d = new Date(v); return isNaN(d) ? null : d.toISOString(); }
  return null;
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
