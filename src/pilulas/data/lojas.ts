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
  // Em Goiânia o grupo tem duas operações, e elas são lojas diferentes para
  // quem trabalha nelas (24/09/2026).
  { id: 'omoda-goiania', nome: 'Omoda Goiânia', brand: 'ramasa' },
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
  { id: 'grupo', nome: 'Grupo — todas as unidades', brand: 'ramasa' },
];

export function lojasDaMarca(brand: BrandId): Loja[] {
  return LOJAS.filter((l) => l.brand === brand);
}

/** O nome que aparece na tela. Loja desconhecida devolve o próprio código. */
export function lojaLabel(id?: string | null): string {
  if (!id) return '';
  return LOJAS.find((l) => l.id === id)?.nome || String(id);
}
