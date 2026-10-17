// OS CONCORRENTES, UM A UM — e por que isto não entra na tabela da casa.
//
// O Gerson mandou dez folhas prontas (17/10/2026): Jaecoo 5 Prestige contra o
// top de linha de cada concorrente, cada uma uma peça fechada da marca, com a
// arte, o carro e as linhas que ELES escolheram comparar.
//
// POR QUE IMAGEM E NÃO DADO. A tentação era transcrever as dez fichas para
// dentro do comparativo da casa, e aí o vendedor misturaria tudo numa tabela
// só. Duas coisas mataram a ideia:
//
//   1. As folhas só falam do Jaecoo 5. Transcrever não daria Omoda 5 contra
//      Creta — esse número não existe em lugar nenhum, e inventar está fora.
//      Ou seja: o trabalho todo não entregaria a flexibilidade que prometia.
//
//   2. Transcrever é digitar à mão a especificação do carro DOS OUTROS. Um
//      dígito errado vira uma afirmação falsa sobre o produto do concorrente,
//      dita por um vendedor com o cliente olhando. Hoje a folha é peça
//      assinada pela marca: se tiver erro, o erro é de quem fez.
//
// Quando a marca mandar ficha de concorrente EM DADO, promove-se para coluna
// de verdade no comparativo. Até lá, a folha pronta serve melhor.
//
// O PESO IMPORTA. Os PNG originais somavam 10 MB — o vendedor abre isto no
// salão, no 4G, com o cliente esperando. Em JPEG de 1080px somam 3,2 MB, e
// cada folha sai por volta de 330 KB. A tela carrega uma de cada vez.
import type { BrandId } from './brands';

export interface Concorrente {
  id: string;
  /**
   * A MARCA DONA DA FOLHA. Sem este campo o conteúdo vale para TODAS as
   * empresas (ver isolamento em check-marcas.mjs) — e estas são peças da
   * Ramasa: apareceriam no app da Meraki e da Drogaria São Paulo, que é
   * entregar material de um cliente para outro.
   */
  brand: BrandId;
  /** Como o cliente chama o carro. */
  nome: string;
  /** A versão que a folha compara — sempre o top de linha dele. */
  versao: string;
  /** A folha, em public/comparativos. */
  arquivo: string;
}

/** Contra qual carro da casa estas folhas falam. */
export const CARRO_DAS_FOLHAS = 'jaecoo-5';

export const CONCORRENTES: Concorrente[] = [
  { id: 'creta', brand: 'ramasa', nome: 'Hyundai Creta', versao: 'Platinum', arquivo: '/comparativos/jaecoo-5-x-creta.jpg' },
  { id: 'compass', brand: 'ramasa', nome: 'Jeep Compass', versao: 'Longitude', arquivo: '/comparativos/jaecoo-5-x-compass.jpg' },
  { id: 'corolla-cross', brand: 'ramasa', nome: 'Toyota Corolla Cross', versao: 'XRE', arquivo: '/comparativos/jaecoo-5-x-corolla-cross.jpg' },
  { id: 'hr-v', brand: 'ramasa', nome: 'Honda HR-V', versao: 'EXL', arquivo: '/comparativos/jaecoo-5-x-hr-v.jpg' },
  { id: 't-cross', brand: 'ramasa', nome: 'VW T-Cross', versao: 'Highline', arquivo: '/comparativos/jaecoo-5-x-t-cross.jpg' },
  { id: 'renegade', brand: 'ramasa', nome: 'Jeep Renegade', versao: 'Willys', arquivo: '/comparativos/jaecoo-5-x-renegade.jpg' },
  { id: 'atto-2', brand: 'ramasa', nome: 'BYD Atto 2', versao: 'GS', arquivo: '/comparativos/jaecoo-5-x-atto-2.jpg' },
  { id: 'yaris-cross', brand: 'ramasa', nome: 'Toyota Yaris Cross', versao: 'XRX', arquivo: '/comparativos/jaecoo-5-x-yaris-cross.jpg' },
  { id: 'cs55', brand: 'ramasa', nome: 'Changan CS55', versao: 'Plus', arquivo: '/comparativos/jaecoo-5-x-cs55.jpg' },
  { id: 'b10', brand: 'ramasa', nome: 'Omoda B10', versao: 'Pro', arquivo: '/comparativos/jaecoo-5-x-b10.jpg' },
];

export function concorrentePorId(id?: string | null): Concorrente | null {
  return CONCORRENTES.find((c) => c.id === id) || null;
}

/** As folhas DESTA marca — nunca as de outra. */
export function concorrentesDaMarca(brand: BrandId): Concorrente[] {
  return CONCORRENTES.filter((c) => c.brand === brand);
}
