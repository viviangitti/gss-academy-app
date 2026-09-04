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

// A ÚLTIMA RESPOSTA BOA, sem prazo pra vencer.
//
// O Google às vezes devolve 200 com ZERO item pra esta função — ela roda num
// datacenter dos EUA, e de lá o feed nem sempre vem. Sem isto, aquele vazio
// entrava no cache e a tela ficava "Nada novo nesta frente" por 15 minutos,
// com o feed cheio de notícia do dia. Notícia de 3 horas atrás é melhor que
// tela vazia.
const ultimoBom = new Map(); // key: `${q}` -> { ts, items }

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
    if (items.length >= limit * 2) break; // pega folga: a ordenação por data escolhe depois
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
  // ORDENA PELA DATA, da mais nova pra mais velha.
  //
  // O Google News devolve por relevância dele, não por data — e o resultado é
  // uma tela de notícias que abre com "há 4 dias" no topo e esconde a de 35h
  // em sexto lugar. Quem abre a tela pergunta na hora por que não está
  // atualizado, e tem razão: a informação estava lá, na ordem errada.
  items.sort((a, b) => {
    const da = Date.parse(a.pubDate) || 0;
    const db = Date.parse(b.pubDate) || 0;
    return db - da;
  });
  return items.slice(0, limit);
}


// PLANO B: os próprios veículos de imprensa.
//
// O Google Notícias responde 200 com um feed VAZIO para esta função — 1.166
// bytes, só o cabeçalho do canal. Da máquina da Vivian, no Brasil, o mesmo
// endereço devolve 157 KB e 100 itens. É bloqueio por IP de datacenter, e não
// tem parâmetro que resolva: enquanto a tela dependia só dele, ficava em "nada
// novo" com o mercado publicando o dia inteiro.
//
// Estes são feeds RSS abertos das próprias redações. Não filtram por IP.
const FONTES_BR = [
  'https://quatrorodas.abril.com.br/feed/',
  'https://www.motor1.com/rss/news/all/',
  'https://www.noticiasautomotivas.com.br/feed/',
  'https://carrosinfoco.com.br/feed/',
  'https://www.flatout.com.br/feed/',
  'https://g1.globo.com/rss/g1/carros/',
];

const semAcento = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Os termos que importam na busca.
 *
 * A consulta vem em linguagem do Google ("Jaecoo OR Omoda OR \"Caoa Chery\"").
 * Aqui viram uma lista simples: as frases entre aspas inteiras, e as palavras
 * soltas de 4 letras ou mais. Operadores e conectivos saem.
 */
function termosDaBusca(q) {
  const t = semAcento(q);
  const frases = [...t.matchAll(/"([^"]+)"/g)].map((m) => m[1].trim()).filter((x) => x.length > 3);
  const resto = t.replace(/"[^"]*"/g, ' ').replace(/[()]/g, ' ');
  // Palavra que aparece em TODA matéria de carro não seleciona nada — só faz a
  // busca de "mercado" trazer a Ferrari do Hamilton. O que vale é o termo
  // distintivo: nome de marca, "fenabrave", "emplacamentos", "recarga".
  const PARAR = new Set([
    'or', 'and', 'para', 'como', 'mais', 'sobre', 'pelo', 'pela',
    'brasil', 'brasileiro', 'carro', 'carros', 'suv', 'veiculo', 'veiculos',
    'novo', 'nova', 'novos', 'novas', 'marca', 'marcas', 'modelo', 'modelos',
    'venda', 'vendas', 'preco', 'precos', 'mercado', 'automotivo', 'automotiva',
    'setor', 'linha', 'versao', 'versoes',
  ]);
  const palavras = resto.split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !PARAR.has(w));
  return [...new Set([...frases, ...palavras])];
}

async function buscaNasFontes(q) {
  const termos = termosDaBusca(q);
  const achados = [];
  const resultados = await Promise.allSettled(FONTES_BR.map((u) =>
    fetch(u, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    }).then((r) => (r.ok ? r.text() : '')),
  ));
  for (const r of resultados) {
    if (r.status !== 'fulfilled' || !r.value) continue;
    for (const it of parseRss(r.value, 60)) {
      const alvo = semAcento(`${it.title} ${it.description}`);
      // Sem termo nenhum (busca genérica), passa tudo; senão, tem que casar.
      if (termos.length && !termos.some((t) => alvo.includes(t))) continue;
      achados.push(it);
    }
  }
  // Sem repetir a mesma matéria vinda de dois lugares.
  const vistos = new Set();
  return achados
    .filter((i) => { const k = semAcento(i.title).slice(0, 60); if (vistos.has(k)) return false; vistos.add(k); return true; })
    .sort((a, b) => (Date.parse(b.pubDate) || 0) - (Date.parse(a.pubDate) || 0));
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
      const guardado = ultimoBom.get(q);
      if (guardado) {
        res.setHeader('X-Cache', 'STALE');
        return res.status(200).json({
          status: 'ok',
          items: guardado.items.slice(0, limit),
          aviso: 'O buscador não respondeu agora; mostrando a última lista que veio.',
        });
      }
      return res.status(502).json({ status: 'error', message: `upstream ${upstream.status}`, items: [] });
    }

    const xml = await upstream.text();
    const items = parseRss(xml, 50); // guarda até 50 no cache, já em ordem de data

    // Espiada de diagnóstico, protegida pelo ADMIN_TOKEN. Existe porque o feed
    // voltou VAZIO em produção e cheio aqui do Brasil: sem ver o que o Google
    // responde pra função, o conserto vira chute.
    if (req.query.debug && process.env.ADMIN_TOKEN && req.query.debug === process.env.ADMIN_TOKEN) {
      return res.status(200).json({
        status: 'debug',
        upstream: upstream.status,
        bytes: xml.length,
        itens: items.length,
        inicio: xml.slice(0, 400),
        fim: xml.slice(-200),
      });
    }

    // VAZIO NÃO ENTRA NO CACHE. Uma falha de segundos não pode virar quinze
    // minutos de tela vazia — foi exatamente o que aconteceu.
    if (!items.length) {
      // O Google veio vazio: busca direto nas redações.
      const doBrasil = await buscaNasFontes(q).catch(() => []);
      if (doBrasil.length) {
        cache.set(q, { ts: Date.now(), items: doBrasil });
        ultimoBom.set(q, { ts: Date.now(), items: doBrasil });
        res.setHeader('X-Cache', 'FONTES');
        return res.status(200).json({ status: 'ok', items: doBrasil.slice(0, limit) });
      }
      const guardado = ultimoBom.get(q);
      res.setHeader('X-Cache', guardado ? 'STALE' : 'VAZIO');
      // Sem aviso quando as fontes responderam e simplesmente não tinha notícia
      // desse assunto: aí "nada novo nesta frente" é a verdade, não uma falha.
      return res.status(200).json({
        status: 'ok',
        items: guardado ? guardado.items.slice(0, limit) : [],
        ...(guardado ? { aviso: 'O buscador não respondeu agora; mostrando a última lista que veio.' } : {}),
      });
    }

    cache.set(q, { ts: Date.now(), items });
    ultimoBom.set(q, { ts: Date.now(), items });
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json({ status: 'ok', items: items.slice(0, limit) });
  } catch (err) {
    console.error('[api/news] erro:', err);
    return res.status(500).json({ status: 'error', message: err?.message || 'unknown', items: [] });
  }
}
