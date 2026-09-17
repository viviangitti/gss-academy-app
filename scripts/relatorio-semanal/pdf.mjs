// Imprime um HTML em PDF (A4) pelo Chrome sem cabeça.
import { writeFileSync } from 'fs';
import { abrirChrome, conectar } from './cdp.mjs';

export async function imprimir(htmlPath, pdfPath) {
  const { proc, ws } = await abrirChrome();
  try {
    const c = conectar(ws); await c.pronto;
    await c.send('Page.enable');
    await c.send('Page.navigate', { url: 'file://' + htmlPath });
    await new Promise((r) => setTimeout(r, 3000));
    const r = await c.send('Page.printToPDF', { printBackground: true, paperWidth: 8.27, paperHeight: 11.69,
      marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, preferCSSPageSize: true });
    writeFileSync(pdfPath, Buffer.from(r.data, 'base64'));
    c.fechar();
  } finally { proc.kill(); }
}
