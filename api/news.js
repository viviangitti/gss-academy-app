// Vercel Serverless Function — Notícias via Google News RSS
// Endpoint: GET /api/news?q=<query>&limit=<n>
//
// Busca o feed RSS do Google Notícias pelo servidor (o navegador não
// consegue por causa de CORS) e devolve JSON já limpo pro app.
//
// Substitui o antigo rss2json.com, que o Google News passou a bloquear
// no lado servidor ("Cannot download this RSS feed").
//
// LGPD: não armazena nada. Apenas repassa notícias públicas.

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 min — alinhado ao cache do cliente
const cache = new Map(); // key: `${q}` -> { ts, items }

// Decodifica entidades HTML comuns que aparecem nos títulos do Google News
function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&amp;/g, '&'); // por último, pra não reintroduzir entidades
}

function tag(block, name) {
  // pega <name>...</name>, lidando com CDATA
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  if (!m) return '';
  let v = m[1].trim();
  const cdata = v.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  if (cdata) v = cdata[1].trim();
  return v;
}

function parseRss(xml, limit) {
  const items = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    if (items.length >= limit) break;
    const title = decodeEntities(tag(block, 'title'));
    const link = decodeEntities(tag(block, 'link'));
    const pubDate = tag(block, 'pubDate');
    const rawDesc = tag(block, 'description');
    // decodifica entidades ANTES de tirar tags — senão &lt;a&gt; vira <a> e reaparece
    const description = decodeEntities(rawDesc).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 150);
    if (title && link) {
      items.push({ title, link, pubDate, description });
    }
  }
  return items;
}

export default async function handler(req, res) {
  // CORS — permite chamada do app (mesma origem em prod, mas libera dev/preview)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const q = (req.query.q || '').toString().trim();
  const limit = Math.min(parseInt(req.query.limit, 10) || 25, 50);

  if (!q) {
    return res.status(400).json({ status: 'error', message: 'parâmetro q obrigatório', items: [] });
  }

  // Cache em memória por query
  const cached = cache.get(q);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json({ status: 'ok', items: cached.items.slice(0, limit) });
  }

  const rssUrl =
    `https://news.google.com/rss/search?q=${encodeURIComponent(q)}` +
    `&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

  try {
    const upstream = await fetch(rssUrl, {
      headers: {
        // User-Agent de browser real — o Google bloqueia fetchers anônimos
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!upstream.ok) {
      return res.status(502).json({ status: 'error', message: `upstream ${upstream.status}`, items: [] });
    }

    const xml = await upstream.text();
    const items = parseRss(xml, 50); // guarda até 50 no cache, fatia no retorno

    cache.set(q, { ts: Date.now(), items });
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json({ status: 'ok', items: items.slice(0, limit) });
  } catch (err) {
    console.error('[api/news] erro:', err);
    return res.status(500).json({ status: 'error', message: err?.message || 'unknown', items: [] });
  }
}
