// Extrai o texto de locução (cenas do storyboard) de cada pílula e grava um
// manifesto JSON. Um script Python depois transforma cada linha em MP3 (voz
// neural Francisca) via edge-tts, em public/audio/narration/{id}-{index}.mp3.
//
// Rodar: npx tsx scripts/gen-narration.ts
import { writeFileSync } from 'node:fs';
import { PRODUCTS } from '../src/pilulas/data/products';

type Item = { id: string; index: number; text: string };
const items: Item[] = [];

for (const p of PRODUCTS) {
  p.storyboard.forEach((scene, index) => {
    const text = (scene.line || '').trim();
    if (text) items.push({ id: p.id, index, text });
  });
}

const out = process.argv[2] || 'narration-manifest.json';
writeFileSync(out, JSON.stringify(items, null, 2), 'utf-8');
console.log(`${items.length} cenas de ${PRODUCTS.length} pílulas -> ${out}`);
