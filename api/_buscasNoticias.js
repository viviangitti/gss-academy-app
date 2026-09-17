// As buscas de cada aba de Notícias, por marca.
//
// Moravam no app (src/pilulas/Noticias.tsx). Em 16/09/2026 as abas Tudo e
// Mercado da Ramasa passaram a trazer notícia de 4 e 16 dias, e o conserto só
// chegava a quem atualizava o app. Aqui no servidor, trocar uma busca vale na
// hora para todo mundo — inclusive para a checagem diária automática, que é
// quem edita esta tabela quando uma aba envelhece.
export const FRENTES = ['tudo', 'concorrencia', 'mercado', 'lancamentos', 'condicoes', 'eletrificados'];

export const BUSCAS = {
  ramasa: {
    tudo: 'Omoda OR Jaecoo OR "Caoa Chery"',
    concorrencia:
      '(GWM OR Haval OR BYD OR "Great Wall" OR "Jeep Compass" OR "Corolla Cross" OR "Honda HR-V" OR "Volkswagen T-Cross") SUV Brasil',
    mercado: 'emplacamentos OR Fenabrave OR "mercado automotivo" Brasil',
    lancamentos: '(lançamento OR estreia OR "chega ao Brasil") (SUV OR carro) Brasil 2026',
    condicoes:
      '(desconto OR "taxa zero" OR financiamento OR "tabela de preços" OR promoção) carro OR SUV Brasil',
    eletrificados: '(carro elétrico OR híbrido OR eletrificado) Brasil (venda OR preço OR recarga OR autonomia)',
  },
};

// Marca sem busca configurada: usa o nome dela e o assunto do setor.
export function buscaPadrao(nome, frente) {
  const base = `"${String(nome || '').split('·')[0].trim()}"`;
  const porFrente = {
    tudo: base,
    concorrencia: `${base} concorrente OR mercado`,
    mercado: `${base} mercado OR setor`,
    lancamentos: `${base} lançamento`,
    condicoes: `${base} promoção OR desconto`,
    eletrificados: base,
  };
  return porFrente[frente] || base;
}

export function buscaDa(marca, frente, nome) {
  if (!FRENTES.includes(frente)) return '';
  return BUSCAS[marca]?.[frente] || buscaPadrao(nome || marca, frente);
}

// Marcas de concessionária: só para elas o plano B das redações automotivas faz
// sentido (é o mesmo critério de isAuto em src/pilulas/data/brands.ts).
export const MARCAS_AUTO = ['ramasa'];

/**
 * A versão mais solta de uma busca: só os nomes da lista de alternativas.
 *
 * "Jaecoo OR Omoda OR \"Caoa Chery\" OR Chery carro Brasil" vira
 * "Jaecoo OR Omoda OR \"Caoa Chery\" OR Chery". Palavra solta fora da lista é o
 * que o Google passa a exigir junto — e é ela que deixa a aba só com texto antigo.
 *
 * Só afrouxa quando sobram pelo menos DOIS termos específicos: nome próprio
 * (começa com maiúscula) ou expressão entre aspas. Palavra comum ("mercado",
 * "desconto") some da lista — sozinha, ela traz notícia de qualquer assunto.
 * Em 17/09/2026, sem essa trava, "\"Meraki\" concorrente OR mercado" virou
 * "\"Meraki\" OR mercado" e a aba encheu de notícia fora do assunto.
 * Devolve '' quando não há como afrouxar com segurança.
 */
export function afrouxar(q) {
  const grupos = [...String(q).matchAll(/\(([^()]*\bOR\b[^()]*)\)/g)].map((m) => m[1]);
  const cadeia = grupos.sort((a, b) => b.length - a.length)[0] || String(q);
  if (!/\bOR\b/.test(cadeia)) return '';
  const partes = cadeia.split(/\s+OR\s+/).map((p) => {
    const t = p.trim().replace(/^\(|\)$/g, '');
    const aspas = t.match(/^"[^"]+"/);
    return aspas ? aspas[0] : t.split(/\s+/)[0];
  }).filter((t) => t && (t.startsWith('"') || /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(t)));
  const unicas = [...new Set(partes)];
  if (unicas.length < 2) return '';
  const solta = unicas.join(' OR ');
  return solta !== String(q).trim() ? solta : '';
}
