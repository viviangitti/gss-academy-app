// Gera api/_arsenal.js a partir do conteúdo do MAESTR.IA (src/services/content.ts).
//
// POR QUE existe: o arsenal de vendas (objeções testadas, técnicas, roteiros) é
// método GSS — propriedade intelectual do produto. Ele NÃO pode viajar no pacote
// que vai pro navegador, onde qualquer pessoa lê. Então o servidor lê deste
// JSON, e o front não importa mais nada disso.
//
// A fonte da verdade continua sendo content.ts. Mudou lá? Rode de novo:
//   npx tsx scripts/gera-arsenal.mjs
import { writeFileSync } from 'node:fs';
import { getObjections, getScripts, TECHNIQUES } from '../src/services/content.ts';

// Segmentos que o Eleva usa hoje. Novo vertical? Acrescente aqui.
const SEGMENTOS = ['automotivo', 'automotivo_luxo', 'farmaceutico'];

const saida = { tecnicas: TECHNIQUES.map((t) => ({
  nome: t.name, resumo: t.summary, quando: t.whenToUse, passos: t.steps,
})), porSegmento: {} };

for (const seg of SEGMENTOS) {
  // A base repete a mesma objeção de propósito (ângulos diferentes pra leitura
  // humana). Pro contexto da IA isso é ruído: funde numa entrada só.
  const porTexto = new Map();
  for (const o of getObjections(seg)) {
    const chave = o.objection.trim().toLowerCase();
    const ja = porTexto.get(chave);
    if (!ja) { porTexto.set(chave, { objecao: o.objection, curtas: [...(o.quickResponses || [])], completas: [...(o.responses || [])], erro: o.commonMistake || '' }); continue; }
    ja.curtas.push(...(o.quickResponses || []));
    ja.completas.push(...(o.responses || []));
    ja.erro = ja.erro || o.commonMistake || '';
  }
  saida.porSegmento[seg] = {
    objecoes: [...porTexto.values()].map((o) => ({
      objecao: o.objecao,
      curtas: [...new Set(o.curtas)].slice(0, 3),
      completa: o.completas[0] || '',
      erro: o.erro,
    })),
    roteiros: getScripts(seg).map((s) => ({ titulo: s.title, contexto: s.context, texto: s.script.replace(/\n+/g, ' ') })),
  };
}

// Arquivo .js (e não .json) de propósito: import de JSON em função serverless
// depende de flag do Node e de o bundler copiar o arquivo. Módulo ESM sempre entra.
const cabecalho = `// GERADO POR scripts/gera-arsenal.mjs — não edite à mão.
// Fonte da verdade: src/services/content.ts (MAESTR.IA). Mudou lá? rode:
//   npx tsx scripts/gera-arsenal.mjs
//
// Vive em /api porque é método GSS: não pode ir no pacote do navegador.
export default `;
writeFileSync(new URL('../api/_arsenal.js', import.meta.url), cabecalho + JSON.stringify(saida, null, 1) + ';\n');
console.log('api/_arsenal.js gerado:', SEGMENTOS.map((s) => `${s}=${saida.porSegmento[s].objecoes.length} objeções`).join(', '));
