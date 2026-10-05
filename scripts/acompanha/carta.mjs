// Fica de olho no banco enquanto alguém publica a carta do mês.
//
// Existe porque a Raphaela já tentou duas vezes e falhou, e a Vivian não quer
// descobrir pelo WhatsApp se funcionou. Emite UMA linha por condição nova e
// encerra sozinho quando a prateleira de veículo volta a ter conteúdo.
import { get, doc2obj } from '../_firestore.mjs';

const MARCA = 'ramasa';
const hoje = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

async function olhar() {
  const r = await get('elevaCondicoes');
  return (r.documents || []).map(doc2obj).filter((c) => c.brand === MARCA);
}

const vivasDeCarro = (l) =>
  l.filter((c) => (c.categoria || 'veiculo') === 'veiculo'
    && !c.arquivada && (!c.venceEm || c.venceEm >= hoje()));

let conhecidas = new Set();
try {
  (await olhar()).forEach((c) => conhecidas.add(c.id));
} catch { /* primeira leitura falhou: a próxima volta pro mesmo lugar */ }

const hora = () => new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit',
}).format(new Date());

for (;;) {
  await new Promise((r) => setTimeout(r, 20000));
  let lista;
  try {
    lista = await olhar();
  } catch {
    continue; // rede ou token: tenta de novo no próximo ciclo
  }
  const novas = lista.filter((c) => !conhecidas.has(c.id));
  for (const c of novas) {
    conhecidas.add(c.id);
    console.log(`${hora()} · SUBIU: ${c.titulo} (${c.categoria || 'veiculo'})`);
  }
  const carro = vivasDeCarro(lista);
  if (novas.length && carro.length) {
    console.log(`${hora()} · ✅ A PRATELEIRA DE VEÍCULO VOLTOU: ${carro.length} condição(ões) no ar para o time.`);
    carro.forEach((c) => console.log(`         · ${c.titulo}`));
    break;
  }
}
