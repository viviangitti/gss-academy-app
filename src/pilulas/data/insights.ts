// Inteligência de mercado: o que a ponta digita na busca "me salva" é a voz
// do cliente final (objeções reais). Registra local; com o backend ligado,
// esses eventos sobem agregados pro painel do fabricante.
//
// SEPARADO POR MARCA: cada marca tem seu próprio log (wp_mesalva_log_{brand}).
// Assim o painel da Sorocaps nunca mostra busca feita na Meraki e vice-versa.

function keyFor(brand: string): string {
  return `wp_mesalva_log_${brand || 'default'}`;
}

function read(brand: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(keyFor(brand)) || '{}');
  } catch {
    return {};
  }
}

let last = '';
export function logSearch(query: string, brand: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 3 || q === last) return;
  const key = keyFor(brand);
  // Evita contar cada tecla: só registra quando a busca "cresceu" pra um termo novo.
  if (last && (q.startsWith(last) || last.startsWith(q))) {
    // substitui o prefixo pelo termo mais completo
    const m = read(brand);
    if (m[last]) {
      m[last] -= 1;
      if (m[last] <= 0) delete m[last];
    }
    m[q] = (m[q] || 0) + 1;
    try { localStorage.setItem(key, JSON.stringify(m)); } catch { /* ignore */ }
    last = q;
    return;
  }
  const m = read(brand);
  m[q] = (m[q] || 0) + 1;
  try { localStorage.setItem(key, JSON.stringify(m)); } catch { /* ignore */ }
  last = q;
}

export function topSearches(n = 5, brand = ''): { term: string; count: number }[] {
  return Object.entries(read(brand))
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}
