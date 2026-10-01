// O ONE-PAGE DE VERDADE, gerado pelo próprio código do app.
//
// É o material que o vendedor manda pro cliente: A4 a 150 dpi, desenhado em
// <canvas> por src/pilulas/data/onePage.ts. Ele nasce em memória e nunca entra
// na página, então não dá para fotografar com screenshot — o jeito é pedir ao
// próprio módulo que desenhe e devolver o PNG.
//
// Isso só funciona no servidor de desenvolvimento, onde o Vite serve os
// módulos: `import('/src/pilulas/data/onePage.ts')` entra transformado.
//
// Uso: node scripts/deck-app/onepage.mjs <pasta-de-saida> [id-do-carro]
import fs from 'fs';
import { abrirChrome, conectar } from '../tutorial/cdp.mjs';

const SAIDA = process.argv[2];
const CARRO = process.argv[3] || 'jaecoo-7';
if (!SAIDA) { console.error('falta a pasta de saída'); process.exit(1); }

const { proc, ws } = await abrirChrome();
const c = conectar(ws); await c.pronto;
await c.send('Page.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: 420, height: 900, deviceScaleFactor: 2, mobile: false });
await c.send('Page.navigate', { url: 'http://localhost:5173/eleva' });
await new Promise((r) => setTimeout(r, 4000));

const r = await c.send('Runtime.evaluate', {
  awaitPromise: true,
  returnByValue: true,
  expression: `(async () => {
    const op = await import('/src/pilulas/data/onePage.ts');
    const prod = await import('/src/pilulas/data/products.ts');
    const marcas = await import('/src/pilulas/data/brands.ts');

    const lista = prod.allProducts ? prod.allProducts() : (prod.PRODUCTS || []);
    const carro = lista.find((p) => p.id === ${JSON.stringify(CARRO)}) || lista.find((p) => p.brand === 'ramasa');
    if (!carro) return { erro: 'não achei o carro', ids: lista.slice(0, 8).map((p) => p.id) };

    const m = marcas.getBrand('ramasa');
    const canvas = await op.desenharOnePage({
      product: carro,
      variante: 'cliente',
      marca: m.name,
      vendedor: 'Walther',
      whatsapp: '(62) 99999-0000',
      capa: carro.imageUrl,
      fotos: carro.fotos,
      accent: m.accent,
      accentDeep: m.accentDeep,
    });
    return { nome: carro.name, png: canvas.toDataURL('image/png'), w: canvas.width, h: canvas.height };
  })()`,
}).then((x) => x.result.value);

if (!r || r.erro || !r.png) {
  console.error('falhou:', JSON.stringify(r).slice(0, 400));
  c.fechar(); proc.kill(); process.exit(1);
}
fs.writeFileSync(`${SAIDA}/onepage.png`, Buffer.from(r.png.split(',')[1], 'base64'));
console.log(`one-page de ${r.nome}: ${r.w}×${r.h} → ${SAIDA}/onepage.png`);
c.fechar(); proc.kill();
