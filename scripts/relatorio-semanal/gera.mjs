// Relatório semanal de uso do Eleva na Ramasa — um comando só.
//
//   npm run relatorio-semanal                       → última semana completa
//   npm run relatorio-semanal -- --semana 2026-09-07 → semana que começa nessa segunda
//
// Grava em ~/.claude/eleva-uso/relatorios/<segunda>/ (dados, HTML, PDF e as
// páginas em imagem, para conferência) e copia o PDF para ~/Downloads.
import { mkdirSync, writeFileSync, copyFileSync, readdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { homedir } from 'os';
import { join } from 'path';
import { coletar, ultimaSemana } from './dados.mjs';
import { montar } from './monta.mjs';
import { imprimir } from './pdf.mjs';

const i = process.argv.indexOf('--semana');
const segunda = i > -1 ? process.argv[i + 1] : ultimaSemana();
if (!/^\d{4}-\d{2}-\d{2}$/.test(segunda) || new Date(segunda + 'T12:00:00Z').getUTCDay() !== 1) {
  console.error(`--semana precisa ser uma segunda-feira no formato AAAA-MM-DD (recebi "${segunda}")`);
  process.exit(1);
}
const pasta = join(homedir(), '.claude', 'eleva-uso', 'relatorios', segunda);
mkdirSync(join(pasta, 'paginas'), { recursive: true });

const D = await coletar(segunda);
writeFileSync(join(pasta, 'dados.json'), JSON.stringify(D, null, 1));
const html = join(pasta, 'relatorio.html');
writeFileSync(html, montar(D));
const pdf = join(pasta, 'relatorio.pdf');
await imprimir(html, pdf);

const paginas = Number((execFileSync('pdfinfo', [pdf]).toString().match(/Pages:\s+(\d+)/) || [])[1] || 0);
for (const f of readdirSync(join(pasta, 'paginas'))) if (f.endsWith('.jpg')) execFileSync('rm', ['-f', join(pasta, 'paginas', f)]);
execFileSync('pdftoppm', ['-jpeg', '-r', '80', pdf, join(pasta, 'paginas', 'pag')]);

const dm = (d) => `${d.slice(8)}-${d.slice(5, 7)}`;
const destino = join(homedir(), 'Downloads', `Eleva - Relatorio semanal Ramasa ${dm(D.de)} a ${dm(D.ate)}.pdf`);
copyFileSync(pdf, destino);
console.log(JSON.stringify({ semana: `${D.de} a ${D.ate}`, paginas, esperado: 7, pdf: destino, conferencia: join(pasta, 'paginas'),
  numeros: D.semana, anterior: D.anterior }, null, 1));
if (paginas !== 7) { console.error(`ATENÇÃO: o PDF saiu com ${paginas} páginas (esperado 7) — algum bloco transbordou.`); process.exit(2); }
