// Confere se as abas de Notícias estão trazendo notícia recente.
//
//   npm run confere-noticias                 → produção (gsseleva.com.br)
//   npm run confere-noticias -- --base URL   → outro endereço
//   npm run confere-noticias -- --json       → saída para a checagem diária
//
// Sai com código 1 se alguma aba estiver VELHA (a mais nova passou de 72h),
// VAZIA ou com ERRO. "consertou sozinha" = o servidor precisou da busca
// afrouxada ou das redações: funcionou, mas a busca daquela aba pede ajuste.
import { readFileSync } from 'fs';
import { FRENTES, MARCAS_AUTO } from '../api/_buscasNoticias.js';

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const BASE = arg('base') || 'https://gsseleva.com.br';
const LIMITE_H = 72;

// Só as marcas que têm a aba Notícias (concessionária). Os nomes vêm do app,
// para esta lista não desatualizar.
const brands = readFileSync(new URL('../src/pilulas/data/brands.ts', import.meta.url), 'utf8');
const MARCAS = [...brands.matchAll(/^\s*\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'/gm)].map((m) => ({ id: m[1], nome: m[2] }))
  .filter((m) => MARCAS_AUTO.includes(m.id));

const linhas = [];
for (const { id, nome } of MARCAS) {
  for (const frente of FRENTES) {
    const url = `${BASE}/api/news?marca=${id}&frente=${frente}&nome=${encodeURIComponent(nome)}&limit=14`;
    let estado = 'ERRO', horas = null, itens = 0, origem = '';
    try {
      const r = await fetch(url);
      origem = r.headers.get('x-cache') || '';
      const d = await r.json();
      itens = (d.items || []).length;
      const datas = (d.items || []).map((i) => Date.parse(i.pubDate)).filter((x) => !Number.isNaN(x));
      horas = datas.length ? (Date.now() - Math.max(...datas)) / 36e5 : null;
      estado = !itens ? 'VAZIA' : horas === null || horas > LIMITE_H ? 'VELHA' : ['AFROUXADA', 'MISTURA'].includes(origem) ? 'consertou sozinha' : 'ok';
    } catch (e) { origem = String(e.message || e).slice(0, 40); }
    linhas.push({ marca: id, frente, estado, horas: horas === null ? null : Math.round(horas * 10) / 10, itens, origem });
  }
}

if (process.argv.includes('--json')) console.log(JSON.stringify({ base: BASE, quando: new Date().toISOString(), linhas }, null, 1));
else {
  console.log(`Notícias em ${BASE} — limite ${LIMITE_H}h\n`);
  for (const l of linhas) console.log(`  ${l.marca.padEnd(7)} ${l.frente.padEnd(14)} ${String(l.estado).padEnd(18)} ${l.horas === null ? '   —  ' : String(l.horas).padStart(6) + 'h'}  ${String(l.itens).padStart(2)} itens  ${l.origem}`);
}
const ruins = linhas.filter((l) => ['VELHA', 'VAZIA', 'ERRO'].includes(l.estado));
if (!process.argv.includes('--json')) console.log(ruins.length ? `\n✗ ${ruins.length} aba(s) com problema.` : '\n✓ Todas as abas com notícia recente.');
process.exit(ruins.length ? 1 : 0);
