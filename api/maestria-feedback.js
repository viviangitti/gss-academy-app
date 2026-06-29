// GET /api/maestria-feedback
// Lista feedbacks dos usuários. Email/nome ficam disponíveis pra você
// (admin), mas você decide se quer exibir no dashboard ou não.

import { getDb } from './_firebase.js';

let cache = null;
let cacheTs = 0;
const TTL_MS = 5 * 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
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
    const snap = await db.collection('feedbacks').orderBy('createdAt', 'desc').limit(200).get();
    const list = [];
    let sumRating = 0;
    let ratingCount = 0;
    const byMostUsed = {};
    const byRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    snap.forEach((doc) => {
      const f = doc.data();
      const r = Number(f.rating) || 0;
      if (r >= 1 && r <= 5) {
        sumRating += r;
        ratingCount++;
        byRating[r] = (byRating[r] || 0) + 1;
      }
      if (f.mostUsed) byMostUsed[f.mostUsed] = (byMostUsed[f.mostUsed] || 0) + 1;

      list.push({
        id: doc.id,
        rating: r,
        mostUsed: f.mostUsed || null,
        whatMissing: f.whatMissing || null,
        bug: f.bug || null,
        suggestion: f.suggestion || null,
        firstName: (f.name || '').trim().split(/\s+/)[0] || null,
        createdAt: toDate(f.createdAt)?.toISOString() || null,
      });
    });

    const result = {
      total: list.length,
      averageRating: ratingCount ? +(sumRating / ratingCount).toFixed(2) : null,
      ratingDistribution: byRating,
      byMostUsed,
      feedbacks: list,
      source: 'firestore',
      updatedAt: new Date().toISOString(),
    };

    cache = result;
    cacheTs = now;

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[maestria-feedback] erro:', err);
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
