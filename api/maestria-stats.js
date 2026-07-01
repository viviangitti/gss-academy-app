// GET /api/maestria-stats
// Agrega dados do Firestore do app MAESTR.IA sem expor info pessoal.
// LGPD: retorna só contadores e médias.

import { getDb, isInternalUser } from './_firebase.js';

let cache = null;
let cacheTs = 0;
const TTL_MS = 5 * 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Impede CDN da Vercel/browser de cachear a resposta — o cache em memória da função já existe
  res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Cache
  const now = Date.now();
  if (cache && now - cacheTs < TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cache);
  }

  try {
    const db = getDb();

    // === USERS === (filtra contas internas: Vivian, Silene)
    const allUsersSnap = await db.collection('users').get();
    const usersDocs = allUsersSnap.docs.filter(d => !isInternalUser(d.data()));
    const totalUsers = usersDocs.length;
    const excludedCount = allUsersSnap.size - totalUsers;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let newUsers7d = 0;
    let newUsers30d = 0;
    const bySegment = {};
    const byCompany = {};
    const byRole = {};

    usersDocs.forEach((doc) => {
      const u = doc.data();
      const created = toDate(u.createdAt);
      if (created) {
        if (created >= sevenDaysAgo) newUsers7d++;
        if (created >= thirtyDaysAgo) newUsers30d++;
      }
      if (u.segment) bySegment[u.segment] = (bySegment[u.segment] || 0) + 1;
      if (u.company) byCompany[u.company] = (byCompany[u.company] || 0) + 1;
      if (u.role) byRole[u.role] = (byRole[u.role] || 0) + 1;
    });

    // === ATIVIDADE — busca em TODAS as subcollections que o app usa ===
    // /users/{uid}/data/{history|sales|day|favorites|lostSales}
    // Cada uma pode indicar "usou o app"
    let totalSessions = 0;
    let sessionsToday = 0;
    let sessionsLast7d = 0;
    const byFeature = {};
    let activeUsers7d = 0;
    let activeUsersToday = 0;

    // Ações "não-history" que também indicam uso do app
    const SIGNAL_COLLECTIONS = ['sales', 'day', 'favorites', 'lostSales'];
    let extraSignals = 0; // itens fora do history

    for (const userDoc of usersDocs) {
      const uid = userDoc.id;
      let userHadActivity7d = false;
      let userHadActivityToday = false;

      // 1) HISTORY (RolePlay, Análise de Mensagem, Análise de Reunião, Liderança)
      const histSnap = await db.collection('users').doc(uid).collection('data').doc('history').get();
      if (histSnap.exists) {
        const items = Array.isArray(histSnap.data()?.items) ? histSnap.data().items : [];
        items.forEach((item) => {
          totalSessions++;
          const t = toDate(item.createdAt);
          if (t) {
            if (t >= today) { sessionsToday++; userHadActivityToday = true; }
            if (t >= sevenDaysAgo) { sessionsLast7d++; userHadActivity7d = true; }
          }
          const type = String(item.type || 'unknown');
          byFeature[type] = (byFeature[type] || 0) + 1;
        });
      }

      // 2) OUTRAS COLLECTIONS (sinais de uso: favoritos, vendas, agenda, vendas perdidas)
      for (const collName of SIGNAL_COLLECTIONS) {
        const snap = await db.collection('users').doc(uid).collection('data').doc(collName).get();
        if (!snap.exists) continue;
        const data = snap.data();
        const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
        if (!Array.isArray(items) || items.length === 0) continue;
        // Cada item conta como "sinal de uso"
        extraSignals += items.length;
        // Verifica timestamps se houver
        items.forEach((it) => {
          const t = toDate(it?.createdAt || it?.updatedAt || it?.date);
          if (t) {
            if (t >= today) userHadActivityToday = true;
            if (t >= sevenDaysAgo) userHadActivity7d = true;
          }
        });
        byFeature[collName] = (byFeature[collName] || 0) + items.length;
      }

      if (userHadActivity7d) activeUsers7d++;
      if (userHadActivityToday) activeUsersToday++;
    }

    const result = {
      users: {
        total: totalUsers,
        new7d: newUsers7d,
        new30d: newUsers30d,
        active7d: activeUsers7d,
        activeToday: activeUsersToday,
      },
      sessions: {
        total: totalSessions,
        today: sessionsToday,
        last7d: sessionsLast7d,
      },
      breakdown: {
        bySegment,
        byCompany,
        byRole,
        byFeature,
      },
      signals: {
        // Ações extras (favoritos, vendas, agenda, vendas perdidas) que também
        // indicam uso, mas não são "sessões formais" do history
        extraActions: extraSignals,
      },
      excludedInternalUsers: excludedCount,
      // Aviso importante pra UI: o que o app NÃO rastreia hoje
      untracked: [
        'Leitura de notícias (News.tsx)',
        'Chat livre com IA Coach (AICoach.tsx)',
        'Navegação por Biblioteca / Técnicas / Objeções sem favoritar',
      ],
      source: 'firestore',
      updatedAt: new Date().toISOString(),
    };

    cache = result;
    cacheTs = now;

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[maestria-stats] erro:', err);
    return res.status(500).json({ error: err.message || 'Erro inesperado' });
  }
}

function toDate(v) {
  if (!v) return null;
  if (typeof v === 'number') return new Date(v);
  if (typeof v?.toDate === 'function') return v.toDate(); // Firestore Timestamp
  if (typeof v === 'string') { const d = new Date(v); return isNaN(d) ? null : d; }
  return null;
}
