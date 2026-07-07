// Inteligência de mercado: o que a ponta digita na busca "me salva" é a voz
// do cliente final (objeções reais). Registra local; com o backend ligado,
// esses eventos sobem agregados pro painel do fabricante.

const KEY = 'wp_mesalva_log';

function read(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

let last = '';
export function logSearch(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 3 || q === last) return;
  // Evita contar cada tecla: só registra quando a busca "cresceu" pra um termo novo.
  if (last && (q.startsWith(last) || last.startsWith(q))) {
    // substitui o prefixo pelo termo mais completo
    const m = read();
    if (m[last]) {
      m[last] -= 1;
      if (m[last] <= 0) delete m[last];
    }
    m[q] = (m[q] || 0) + 1;
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ }
    last = q;
    return;
  }
  const m = read();
  m[q] = (m[q] || 0) + 1;
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ }
  last = q;
}

export function topSearches(n = 5): { term: string; count: number }[] {
  return Object.entries(read())
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}
