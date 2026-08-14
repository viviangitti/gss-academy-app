// O QUE AINDA É NOVO PRA ESTA PESSOA.
//
// A ideia original era "marcar o conteúdo do mês como novidade". Não fiz assim
// de propósito: isso vira mais uma tarefa manual pro gestor, e tarefa manual
// que ninguém faz produz um selo "novo" em cima de conteúdo de março.
//
// Aqui "novo" é o que ESTA pessoa ainda não abriu. É verdade sempre, sem
// ninguém marcar nada: quando o gestor publica um carro, ele nasce novo pra
// todo mundo; quando a pessoa assiste, ele deixa de ser — só pra ela.
import { getStats } from './tracking';
import type { Product } from './products';

// ATENÇÃO à chave: em perProduct ela é `{id}@{AAAA-MM-DD}`, não o id puro — é
// assim que o contador evita pontuar a mesma pílula duas vezes no mesmo dia.
// Comparar com o id direto dava sempre "não visto", e o selo "novo" ficaria
// grudado em todo carro pra sempre.
function jaViu(perProduct: Record<string, number>, id: string): boolean {
  const prefixo = `${id}@`;
  return Object.keys(perProduct).some((k) => k === id || k.startsWith(prefixo));
}

export function naoVistos(produtos: Product[]): Product[] {
  const { perProduct } = getStats();
  return produtos.filter((p) => !jaViu(perProduct, p.id));
}

export function ehNovo(id: string): boolean {
  return !jaViu(getStats().perProduct, id);
}
