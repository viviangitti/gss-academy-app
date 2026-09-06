import fs from 'fs';
import { abrirChrome, conectar } from './cdp.mjs';
const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
const url = 'file://' + process.cwd() + '/relatorio-uso.html';
await c.send('Page.navigate', { url });
await new Promise(r => setTimeout(r, 2500));
const r = await c.send('Page.printToPDF', {
  printBackground: true, paperWidth: 8.27, paperHeight: 11.69,
  marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, preferCSSPageSize: true,
});
fs.writeFileSync('Eleva — uso do app (Ramasa).pdf', Buffer.from(r.data, 'base64'));
console.log('pdf:', fs.statSync('Eleva — uso do app (Ramasa).pdf').size, 'bytes');
c.fechar(); proc.kill();
