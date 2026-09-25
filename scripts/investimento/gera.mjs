// A FOLHA DE INVESTIMENTO DA RAMASA — html → PDF.
//
// Por que existe: a versão de 11/09 foi feita à mão e, quando a Vivian pediu
// "atualiza esse doc", não havia de onde partir — só o PDF pronto. Agora o
// documento mora aqui: edite doc.html, rode isto, e sai o PDF em Downloads.
//
//   node scripts/investimento/gera.mjs           → PDF com a data de hoje
//
// As horas e as entregas vêm do medir.mjs, que lê o histórico do repositório.
// Rode-o antes de mexer nos números, e copie o resultado para o doc.
import fs from 'fs';
import path from 'path';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const AQUI = import.meta.dirname;
const hoje = new Date();
const dd = String(hoje.getDate()).padStart(2, '0');
const mm = String(hoje.getMonth() + 1).padStart(2, '0');
// SEMPRE o mesmo nome, com "ATUAL" na frente: em 25/09 a Vivian abriu por
// engano o PDF de 11/09 que ainda estava em Downloads e leu "início 11/09".
// Um arquivo só, sobrescrito, não tem como confundir.
const SAIDA = path.join(process.env.HOME, 'Downloads', `ELEVA RAMASA - investimento ATUAL (${dd}-${mm}).pdf`);

const { proc, ws } = await abrirChrome();
const c = conectar(ws);
await c.pronto;
await c.send('Page.enable');
await c.send('Page.navigate', { url: `file://${AQUI}/doc.html` });
await new Promise((r) => setTimeout(r, 1800));
const { data } = await c.send('Page.printToPDF', {
  printBackground: true,
  preferCSSPageSize: true, // o rodapé cabe na margem de 11mm declarada no @page
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate:
    '<div style="width:100%;font-size:7pt;color:#8a97a3;text-align:center;font-family:Helvetica">'
    + `Eleva × Grupo Ramasa — investimento e proposta · ${dd}/${mm}/${hoje.getFullYear()} · uso interno · `
    + '<span class="pageNumber"></span>/<span class="totalPages"></span></div>',
});
fs.writeFileSync(SAIDA, Buffer.from(data, 'base64'));
console.log('pdf ok →', SAIDA);
c.fechar();
proc.kill();
