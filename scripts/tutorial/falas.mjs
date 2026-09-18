// AS FALAS, do roteiro para os scripts de áudio e montagem.
//
// narrar.py, karaoke.py e montar.py leem falas-{qual}.json — não leem
// roteiros.mjs. Sem este passo, mexer na fala do roteiro não muda NADA no
// vídeo: a narração antiga é reaproveitada e ninguém percebe. Era o degrau
// que faltava entre escrever e gravar.
import fs from 'fs';
import { VENDEDOR, GERENTE } from './roteiros.mjs';

for (const [qual, cenas] of [['vendedor', VENDEDOR], ['gerente', GERENTE]]) {
  const falas = cenas.map((c) => ({ id: c.id, fala: c.fala }));
  fs.writeFileSync(`falas-${qual}.json`, JSON.stringify(falas, null, 1));
  const palavras = falas.reduce((n, c) => n + (c.fala || '').split(/\s+/).length, 0);
  console.log(`falas-${qual}.json: ${falas.length} cenas · ${palavras} palavras`);
}
