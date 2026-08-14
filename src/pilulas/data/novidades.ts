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

export function naoVistos(produtos: Product[]): Product[] {
  const { perProduct } = getStats();
  return produtos.filter((p) => !perProduct[p.id]);
}

export function ehNovo(id: string): boolean {
  return !getStats().perProduct[id];
}
