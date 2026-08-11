// O ARSENAL DE VENDA que já existe no MAESTR.IA, emprestado pro Tira-dúvida.
//
// O Eleva sabia tudo sobre o PRODUTO e nada sobre VENDER. Quem está no showroom
// não trava na ficha técnica — trava em "vou pensar", "tá caro", "meu cunhado
// disse que chinês não tem revenda". Essa parte já estava escrita, testada e em
// uso no MAESTR.IA: objeções com resposta pronta, o erro comum que queima a
// venda, roteiros de abordagem e as técnicas de condução.
//
// Aqui a gente só monta esse conteúdo num texto que vai junto no contexto da IA.
// Nada é copiado nem duplicado: se mudar no MAESTR.IA, muda aqui.
import { getObjections, getScripts, TECHNIQUES } from '../../services/content';
import type { Objection } from '../../services/content';

// Junta as objeções gerais (valem pra qualquer venda) com as do segmento.
//
// A base do MAESTR.IA tem a MESMA objeção escrita mais de uma vez ("Está muito
// caro" aparece três vezes, "Vou pensar" duas) — lá isso é bom, são ângulos
// diferentes pra pessoa ler. No contexto da IA vira repetição que gasta espaço
// e não ensina nada, então aqui a gente funde: uma entrada por objeção, com as
// respostas de todas as versões juntas.
function objecoesDe(segmento: string): Objection[] {
  const porTexto = new Map<string, Objection>();
  for (const o of getObjections(segmento as Parameters<typeof getObjections>[0])) {
    const chave = o.objection.trim().toLowerCase();
    const ja = porTexto.get(chave);
    if (!ja) {
      porTexto.set(chave, { ...o });
      continue;
    }
    ja.quickResponses = [...(ja.quickResponses || []), ...(o.quickResponses || [])];
    ja.responses = [...(ja.responses || []), ...(o.responses || [])];
    ja.commonMistake = ja.commonMistake || o.commonMistake;
  }
  return [...porTexto.values()];
}

function blocoObjecoes(segmento: string): string {
  const linhas = objecoesDe(segmento).map((o) => {
    const partes = [`- OBJEÇÃO ${o.objection}`];
    const rapidas = [...new Set(o.quickResponses || [])].slice(0, 3);
    if (rapidas.length) partes.push(`  Resposta curta: ${rapidas.join(' / ')}`);
    if (o.responses?.[0]) partes.push(`  Resposta completa: ${o.responses[0]}`);
    if (o.commonMistake) partes.push(`  ERRO COMUM (não faça): ${o.commonMistake}`);
    return partes.join('\n');
  });
  return linhas.join('\n');
}

function blocoTecnicas(): string {
  return TECHNIQUES.map(
    (t) => `- ${t.name}: ${t.summary}\n  Quando usar: ${t.whenToUse}\n  Passos: ${t.steps.join(' → ')}`
  ).join('\n');
}

function blocoRoteiros(segmento: string): string {
  return getScripts(segmento as Parameters<typeof getScripts>[0])
    .map((s) => `- ${s.title} (${s.context}):\n  ${s.script.replace(/\n+/g, ' ')}`)
    .join('\n');
}

// O texto que vai no contexto da IA. `segmento` usa os mesmos nomes do
// MAESTR.IA ('automotivo', 'automotivo_luxo', 'farmaceutico'…).
export function saberDeVenda(segmento: string): string {
  return [
    '## OBJEÇÕES JÁ TESTADAS E COMO RESPONDER',
    'Estas objeções e respostas vêm do MAESTR.IA e já foram usadas em campo.',
    'Use-as como ESTRUTURA de raciocínio, não como texto pronto. Duas regras:',
    '1) Texto entre colchetes ([modelo], [Nome], [benefício]) é lacuna de exemplo:',
    '   preencha com o caso real ou reescreva a frase sem ela. NUNCA escreva um colchete na resposta.',
    '2) Números que aparecem aqui (30%, Y%, 3x) são EXEMPLO da forma do argumento,',
    '   não dado da concessionária. Nunca os repita como se fossem verdade.',
    blocoObjecoes(segmento),
    '',
    '## TÉCNICAS DE CONDUÇÃO DA VENDA',
    blocoTecnicas(),
    '',
    '## ROTEIROS PRONTOS',
    blocoRoteiros(segmento),
  ].join('\n');
}
