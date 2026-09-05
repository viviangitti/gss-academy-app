#!/usr/bin/env node
// CONFERE A LÂMINA CONTRA A CARTA DA MONTADORA.
//
// A folha que o time vê em Condições é IMAGEM, e a IA responde por um texto
// (`resumo`) escrito na hora da publicação. Se esse texto sair com um número
// trocado, a IA repete o erro com toda a confiança, e ninguém percebe: não há
// como comparar imagem com texto a olho, todo mês, em seis lâminas.
//
// Este script fecha a corrente: PDF da montadora → resumo publicado. Ele tira
// TODO valor em reais, TODA porcentagem e TODO prazo (24x, 36x) de cada lâmina
// e confere se aparecem no PDF original.
//
// RODAR TODO MÊS, depois de publicar a carta nova:
//     node scripts/confere-carta.mjs public/docs/ramasa/carta-comercial-setembro-2026.pdf
//
// Precisa de: pdftotext (brew install poppler) e login do firebase-tools.
//
// O que ele NÃO faz: conferir o que NÃO está no resumo. Uma linha inteira
// esquecida na publicação passa por aqui — o script prova que o que está
// escrito está certo, não que está completo.
import fs from 'fs';
import { execFileSync } from 'child_process';

const pdfPath = process.argv[2];
if (!pdfPath || !fs.existsSync(pdfPath)) {
  console.error('Uso: node scripts/confere-carta.mjs <caminho-do-pdf>');
  process.exit(1);
}

const conf = JSON.parse(fs.readFileSync(`${process.env.HOME}/.config/configstore/firebase-tools.json`, 'utf8'));
const tk = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    refresh_token: conf.tokens.refresh_token,
    grant_type: 'refresh_token',
  }),
}).then((r) => r.json());
if (!tk.access_token) { console.error('Sem token do Firebase — rode `npx firebase login`.'); process.exit(1); }

const base = 'https://firestore.googleapis.com/v1/projects/eleva-gss/databases/(default)/documents';
const res = await fetch(`${base}/elevaCondicoes?pageSize=200`, {
  headers: { Authorization: `Bearer ${tk.access_token}` },
}).then((r) => r.json());

const val = (v) => (v && 'stringValue' in v ? v.stringValue : '');
const conds = (res.documents || []).map((d) => ({
  id: d.name.split('/').pop(),
  titulo: val(d.fields?.titulo),
  resumo: val(d.fields?.resumo),
  categoria: val(d.fields?.categoria),
}));

const pdf = execFileSync('pdftotext', ['-layout', pdfPath, '-']).toString().replace(/\s+/g, ' ');

let total = 0, batem = 0, comProblema = 0;
for (const c of conds) {
  if (!c.resumo || c.categoria !== 'veiculo') continue;
  const nums = [...new Set([
    ...(c.resumo.match(/R\$\s?[\d.]+(?:,\d{2})?/g) || []),
    ...(c.resumo.match(/\d+(?:,\d+)?%/g) || []),
    ...(c.resumo.match(/\b\d{2}x\b/g) || []),
  ])];
  if (!nums.length) continue;
  const perdidos = nums.filter((n) => {
    const alvo = n.replace(/\s+/g, ' ').replace(/R\$\s?/, 'R$ ');
    return !pdf.includes(alvo) && !pdf.includes(alvo.replace('R$ ', ''));
  });
  total += nums.length;
  batem += nums.length - perdidos.length;
  if (perdidos.length) comProblema++;
  const marca = perdidos.length ? '\x1b[31m⚠\x1b[0m ' : '\x1b[32m✓\x1b[0m ';
  console.log(`${marca} ${c.id.padEnd(32)} ${nums.length - perdidos.length}/${nums.length}`);
  if (perdidos.length) console.log(`    não achei no PDF: ${perdidos.join(', ')}`);
}

console.log(`\n${batem}/${total} números conferidos contra ${pdfPath.split('/').pop()}`);
if (comProblema) {
  console.log('\nConfira à mão as marcadas. Se o PDF mudou, corrija o texto em');
  console.log('Painel → Condições → lápis → "O que a IA lê desta folha".');
  process.exit(1);
}
console.log('Toda lâmina publicada bate com a carta da montadora.');
