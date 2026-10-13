// AS LOJAS DO GRUPO.
//
// Até 18/09/2026 todo mundo era "Ramasa" e pronto. Aí a gerência mandou a lista
// por WhatsApp — Cristiano em Goiânia, Cláudio em Anápolis, Raphaela em
// Itumbiara, Wesley supervisor de Goiânia — e não havia onde guardar isso: o
// painel misturava as três unidades num número só, e a Jornada pedia o vendedor
// DIGITAR a própria loja em todo material que manda pro cliente.
//
// A loja fica no cadastro da pessoa (elevaUsers.loja) e viaja junto com o uso
// (elevaStats.loja), que é de onde o painel e o relatório leem.
import { type BrandId } from './brands';

export interface Loja {
  id: string;
  nome: string;
  brand: BrandId;
}

export const LOJAS: Loja[] = [
  { id: 'tiger-goiania', nome: 'Tiger Goiânia', brand: 'ramasa' },
  // EM GOIÂNIA É UMA LOJA SÓ.
  //
  // Existiu aqui uma 'omoda-goiania', aberta em 24/09/2026 porque eu entendi
  // que o grupo tinha duas operações na cidade. Não tem: a Vivian corrigiu em
  // 13/10/2026 — é só a Tiger Goiânia. A unidade saiu da lista e a única
  // pessoa que estava nela foi movida.
  //
  // Loja a mais não é opção inofensiva: ela racha o time no Painel. A Tiger
  // Goiânia aparecia com 19 pessoas e uma linha solta de 1 do lado, e a
  // diretora lia como se fossem duas operações com desempenhos diferentes.
  { id: 'tiger-anapolis', nome: 'Tiger Anápolis', brand: 'ramasa' },
  { id: 'tiger-itumbiara', nome: 'Tiger Itumbiara', brand: 'ramasa' },
  // QUEM NÃO É DE UMA LOJA SÓ.
  //
  // A trava do cadastro passou a exigir a unidade de todo mundo, e aí apareceu
  // gente para quem a pergunta não tem resposta: a Mariana responde pelo grupo,
  // o Lucas pela operação de acessórios das quatro lojas, a qualidade audita
  // todas. Obrigar essas pessoas a escolher UMA unidade não é só incômodo — põe
  // o número delas no balde errado do Painel, que é justamente o que a loja
  // existe para evitar.
  // O NOME NÃO PODE PARECER UM FILTRO. Isto aqui é uma UNIDADE — o lugar de
  // quem não pertence a nenhuma loja —, mas chamava-se "Grupo — todas as
  // unidades" e ficava do lado do botão "Todas as lojas", que é o filtro de
  // não-filtrar. Dois rótulos quase iguais, significados opostos: a Vivian
  // perguntou qual era a diferença em 13/10/2026, e se ela perguntou, o time
  // inteiro já tinha lido errado antes.
  //
  // O `id` continua 'grupo': trocar o id apagaria a unidade de quem já está
  // nela. Só o nome muda.
  { id: 'grupo', nome: 'Corporativo', brand: 'ramasa' },
];

export function lojasDaMarca(brand: BrandId): Loja[] {
  return LOJAS.filter((l) => l.brand === brand);
}

/** O nome que aparece na tela. Loja desconhecida devolve o próprio código. */
export function lojaLabel(id?: string | null): string {
  if (!id) return '';
  return LOJAS.find((l) => l.id === id)?.nome || String(id);
}
