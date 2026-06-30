// GET /api/maestria-insights
// Insights de produto: gaps dos vendedores, tópicos mais perguntados,
// heatmap de uso, power users, narrativa acionável.

import { getDb, isInternalUser } from './_firebase.js';

let cache = null;
let cacheTs = 0;
const TTL_MS = 5 * 60 * 1000;

// Dicionário de tópicos de vendas (com palavras-chave em PT-BR + variações)
const TOPIC_KEYWORDS = {
  'Objeções (preço/caro)': ['caro', 'preço', 'preco', 'valor', 'desconto', 'caro demais', 'fora do orçamento', 'orcamento', 'cabe no bolso'],
  'Objeções (tempo)': ['nao tenho tempo', 'não tenho tempo', 'depois falo', 'sem pressa', 'penso e te falo', 'preciso pensar'],
  'Fechamento': ['fechar', 'fechamento', 'assinar', 'contrato', 'fechei', 'concluir venda', 'finalizar'],
  'Prospecção': ['prospec', 'cold call', 'ligação fria', 'primeiro contato', 'abordagem inicial', 'lead frio'],
  'Follow-up': ['follow up', 'follow-up', 'followup', 'retomar', 'continuar conversa', 'voltar ao cliente'],
  'Negociação': ['negociar', 'negociação', 'negociacao', 'contraproposta', 'condições'],
  'Proposta comercial': ['proposta', 'envio de proposta', 'apresentar proposta'],
  'Reunião / Apresentação': ['reunião', 'reuniao', 'meeting', 'apresentação', 'apresentacao', 'demo', 'demonstração'],
  'WhatsApp / Mensagem': ['whatsapp', 'zap', 'mensagem', 'msg', 'texto', 'audio', 'áudio'],
  'Qualificação de lead': ['qualifica', 'sql', 'mql', 'qualificar lead', 'budget', 'autoridade', 'necessidade'],
  'Cliente indeciso': ['indeciso', 'não sabe', 'ainda não decidiu', 'em dúvida', 'duvida'],
  'Liderança / Equipe': ['liderar', 'liderança', 'equipe', 'time de vendas', 'gestão de equipe'],
};

const TYPE_LABELS = {
  message_review: 'Análise de Mensagem',
  meeting_analysis: 'Análise de Reunião',
  simulator_session: 'Role Play',
  leadership_session: 'Sessão de Liderança',
};

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
    const usersSnap = await db.collection('users').get();
    const realUsers = usersSnap.docs.filter(d => !isInternalUser(d.data()));

    // Fetch all histories in parallel
    const histories = await Promise.all(realUsers.map(async (u) => {
      try {
        const h = await db.collection('users').doc(u.id).collection('data').doc('history').get();
        return { uid: u.id, user: u.data(), items: h.exists ? (h.data()?.items || []) : [] };
      } catch (e) {
        return { uid: u.id, user: u.data(), items: [] };
      }
    }));

    // === Datas base ===
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const last7Start = new Date(today); last7Start.setDate(today.getDate() - 6);
    const prev7Start = new Date(today); prev7Start.setDate(today.getDate() - 13);
    const prev7End = new Date(today); prev7End.setDate(today.getDate() - 7);
    const last30Start = new Date(today); last30Start.setDate(today.getDate() - 29);

    // === Agregadores ===
    let totalSessions = 0;
    let sessionsThisWeek = 0;
    let sessionsPrevWeek = 0;
    const usersWithSessionThisWeek = new Set();
    const usersWithSessionPrevWeek = new Set();
    const usersWithAnySession = new Set();
    const usersWithFirstSession = []; // pra ativação
    const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0)); // dow × hour
    const topicCounts = {};
    const featureCounts = {};
    const featureByUser = {}; // uid → Set(features)
    const sessionsByUser = {}; // uid → count
    const userMeta = {}; // uid → user info pra power users
    const companyEngagement = {}; // company → { users: Set, sessions: 0 }
    let usersWithZeroSessions = 0;

    histories.forEach(({ uid, user, items }) => {
      userMeta[uid] = user;
      sessionsByUser[uid] = items.length;
      if (!items.length) usersWithZeroSessions++;
      else usersWithAnySession.add(uid);

      // Empresa
      const company = (user.company || 'Sem empresa').trim();
      if (!companyEngagement[company]) companyEngagement[company] = { users: new Set(), sessions: 0 };
      companyEngagement[company].users.add(uid);

      // primeira sessão
      let firstTs = null;

      items.forEach((it) => {
        totalSessions++;
        companyEngagement[company].sessions++;
        const type = String(it.type || 'unknown');
        featureCounts[type] = (featureCounts[type] || 0) + 1;
        if (!featureByUser[uid]) featureByUser[uid] = new Set();
        featureByUser[uid].add(type);

        const ts = toDate(it.createdAt);
        if (!ts) return;

        if (!firstTs || ts < firstTs) firstTs = ts;

        // Heatmap (dia da semana × hora)
        heatmap[ts.getDay()][ts.getHours()]++;

        // Semana atual e anterior
        if (ts >= last7Start) { sessionsThisWeek++; usersWithSessionThisWeek.add(uid); }
        else if (ts >= prev7Start && ts < prev7End) { sessionsPrevWeek++; usersWithSessionPrevWeek.add(uid); }

        // Extrai texto do item pra análise de tópicos
        const text = [
          it.title || '',
          it.subtitle || '',
          it.preview || '',
          extractTextFromData(it.data),
        ].join(' ').toLowerCase();

        if (text.trim()) {
          for (const [topic, kws] of Object.entries(TOPIC_KEYWORDS)) {
            for (const kw of kws) {
              if (text.includes(kw)) {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                break; // conta uma vez por sessão
              }
            }
          }
        }
      });

      if (firstTs) usersWithFirstSession.push({ uid, firstTs, totalSessions: items.length });
    });

    // === Funil de ativação ===
    const totalRealUsers = realUsers.length;
    const usersWith1Plus = usersWithFirstSession.length;
    const usersWith3Plus = usersWithFirstSession.filter(u => u.totalSessions >= 3).length;
    const usersWith7Plus = usersWithFirstSession.filter(u => u.totalSessions >= 7).length;

    // === Power users (top 10 por sessões) ===
    const powerUsers = Object.entries(sessionsByUser)
      .filter(([, c]) => c > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([uid, count]) => {
        const u = userMeta[uid] || {};
        const lastTs = (histories.find(h => h.uid === uid)?.items || [])
          .map(it => toDate(it.createdAt))
          .filter(Boolean)
          .sort((a, b) => b - a)[0];
        return {
          uid,
          firstName: (u.name || '').trim().split(/\s+/)[0] || null,
          lastInitial: (u.name || '').split(/\s+/).slice(1).map(s => s[0]).filter(Boolean).join('.'),
          company: u.company || null,
          role: u.role || null,
          totalSessions: count,
          featuresUsed: featureByUser[uid]?.size || 0,
          lastActivity: lastTs?.toISOString() || null,
        };
      });

    // === Empresas engajadas ===
    const companies = Object.entries(companyEngagement)
      .map(([name, d]) => ({ name, userCount: d.users.size, sessions: d.sessions, avgSessions: d.users.size ? +(d.sessions / d.users.size).toFixed(1) : 0 }))
      .sort((a, b) => b.sessions - a.sessions);

    // === Topics ordenados ===
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, count }));

    // === Insights acionáveis (texto gerado) ===
    const insights = [];

    if (totalRealUsers > 0) {
      const activationRate = (usersWith1Plus / totalRealUsers * 100).toFixed(0);
      if (usersWithZeroSessions > 0) {
        insights.push({
          icon: '⚠️',
          severity: 'warning',
          title: `${usersWithZeroSessions} de ${totalRealUsers} usuários nunca usaram o app`,
          desc: `Apenas ${activationRate}% chegaram a fazer pelo menos 1 sessão. Considere onboarding ativo ou contato direto pra ativar esses cadastros.`,
        });
      }
      if (usersWith1Plus > 0 && usersWith3Plus / usersWith1Plus < 0.5) {
        insights.push({
          icon: '📉',
          severity: 'warning',
          title: 'Retenção fraca após 1ª sessão',
          desc: `Só ${usersWith3Plus} dos ${usersWith1Plus} usuários que começaram chegaram a 3+ sessões. Há um gap entre experimentar e adotar — pode ser falta de valor percebido na 1ª sessão.`,
        });
      }
    }

    if (sessionsPrevWeek > 0) {
      const weekGrowth = ((sessionsThisWeek - sessionsPrevWeek) / sessionsPrevWeek * 100).toFixed(0);
      if (weekGrowth > 20) {
        insights.push({
          icon: '🚀',
          severity: 'success',
          title: `Uso cresceu ${weekGrowth}% essa semana`,
          desc: `${sessionsThisWeek} sessões vs ${sessionsPrevWeek} semana passada. Algo está funcionando — vale identificar o que.`,
        });
      } else if (weekGrowth < -20) {
        insights.push({
          icon: '📉',
          severity: 'warning',
          title: `Uso caiu ${Math.abs(weekGrowth)}% essa semana`,
          desc: `${sessionsThisWeek} sessões vs ${sessionsPrevWeek} semana passada. Pode ser hora de uma reengajamento ou check-in com os usuários.`,
        });
      }
    } else if (sessionsThisWeek > 0) {
      insights.push({
        icon: '🌱',
        severity: 'info',
        title: 'Primeira semana com atividade',
        desc: `${sessionsThisWeek} sessões registradas. Acompanhe os próximos dias pra ver consistência.`,
      });
    }

    if (topTopics.length > 0) {
      insights.push({
        icon: '🔥',
        severity: 'info',
        title: `Tópico mais quente: ${topTopics[0].topic}`,
        desc: `Os usuários estão focados em "${topTopics[0].topic.toLowerCase()}" (${topTopics[0].count} interações). Considere criar conteúdo dedicado ou um módulo específico.`,
      });
    }

    if (companies.length >= 2 && companies[0].sessions > 0) {
      insights.push({
        icon: '🏢',
        severity: 'info',
        title: `${companies[0].name} é a empresa mais engajada`,
        desc: `${companies[0].sessions} sessões com ${companies[0].userCount} usuário(s) — média de ${companies[0].avgSessions}/usuário. Caso de sucesso pra documentar.`,
      });
    }

    if (Object.keys(featureCounts).length > 0) {
      const [topFeature, topCount] = Object.entries(featureCounts).sort((a, b) => b[1] - a[1])[0];
      const label = TYPE_LABELS[topFeature] || topFeature;
      insights.push({
        icon: '⭐',
        severity: 'info',
        title: `${label} é a feature mais usada`,
        desc: `${topCount} sessões. Funcionalidades menos usadas podem precisar de divulgação interna ou ajuste de UX.`,
      });
    }

    const result = {
      summary: {
        totalRealUsers,
        usersWithAnySession: usersWithAnySession.size,
        usersWithZeroSessions,
        totalSessions,
        sessionsThisWeek,
        sessionsPrevWeek,
        weekDelta: sessionsThisWeek - sessionsPrevWeek,
        activeUsersThisWeek: usersWithSessionThisWeek.size,
        activeUsersPrevWeek: usersWithSessionPrevWeek.size,
      },
      activation: {
        signedUp: totalRealUsers,
        firstSession: usersWith1Plus,
        threePlus: usersWith3Plus,
        sevenPlus: usersWith7Plus,
      },
      heatmap, // [dow][hour]
      topTopics,
      featureCounts,
      powerUsers,
      companies: companies.slice(0, 10),
      insights,
      updatedAt: new Date().toISOString(),
    };

    cache = result;
    cacheTs = now;

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[maestria-insights] erro:', err);
    return res.status(500).json({ error: err.message || 'Erro inesperado' });
  }
}

// Extrai texto recursivamente de qualquer objeto/array (pra buscar keywords)
function extractTextFromData(data, depth = 0) {
  if (depth > 5 || data == null) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'number' || typeof data === 'boolean') return '';
  if (Array.isArray(data)) return data.map(d => extractTextFromData(d, depth + 1)).join(' ');
  if (typeof data === 'object') {
    return Object.values(data).map(v => extractTextFromData(v, depth + 1)).join(' ');
  }
  return '';
}

function toDate(v) {
  if (!v) return null;
  if (typeof v === 'number') return new Date(v);
  if (typeof v?.toDate === 'function') return v.toDate();
  if (typeof v === 'string') { const d = new Date(v); return isNaN(d) ? null : d; }
  return null;
}
