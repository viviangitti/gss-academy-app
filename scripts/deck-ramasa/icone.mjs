// UM ÍCONE LUCIDE VIRA SVG, para colar dentro de um slide em HTML.
//
// O app usa lucide-react, e a regra da casa é ícone em SVG — nunca emoji.
// O pacote não traz os arquivos .svg prontos, só o "iconNode" (a lista de
// formas). Este script monta o SVG a partir dele, com o mesmo traço que o app
// desenha na tela.
//
// Uso: node scripts/deck-ramasa/icone.mjs graduation-cap plug-zap bell-off
import { readFileSync } from 'fs';

const RAIZ = '/Users/viviangitti/gss/node_modules/lucide-react/dist/esm/icons/';

export function icone(nome, { tamanho = 24, cor = 'currentColor', traco = 2 } = {}) {
  const fonte = readFileSync(`${RAIZ}${nome}.js`, 'utf8');
  const bruto = fonte.match(/const __iconNode = (\[[\s\S]*?\n\];)/);
  if (!bruto) throw new Error(`não achei o desenho de "${nome}"`);
  // O arquivo é módulo ES com chaves sem aspas — o JSON.parse não serve.
  const formas = eval('(' + bruto[1].replace(/;$/, '') + ')');
  const partes = formas.map(([tag, attrs]) => {
    const a = Object.entries(attrs)
      .filter(([k]) => k !== 'key')
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    return `<${tag} ${a} />`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="${traco}" stroke-linecap="round" stroke-linejoin="round">${partes}</svg>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const nome of process.argv.slice(2)) console.log(icone(nome));
}
