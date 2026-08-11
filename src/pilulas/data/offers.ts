import type { BrandId } from './brands';

// Tipos de oferta — varejo (saúde). O automotivo NÃO usa oferta em card: lá a
// condição comercial é a tabela que a gerência sobe em print/PDF (ver
// data/condicoes.ts). Os tipos 'taxa', 'bonus' e 'estoque' seguem existindo
// porque uma marca de saúde pode querer usá-los.
export type OfferKind = 'desconto' | 'combo' | 'frete' | 'brinde' | 'taxa' | 'bonus' | 'estoque';

export interface Offer {
  brand: BrandId;
  tag: string;
  tagKind: OfferKind;
  title: string;
  desc: string;
  until: string;
  share: string;
  segment?: string; // canal alvo ('todos' ou vazio = rede inteira)
}

// Ofertas "de fábrica" (seed). O gestor cria novas pelo Painel (ficam no store).
export const SEED_OFFERS: Offer[] = [
  {
    brand: 'meraki',
    tag: 'FRETE GRÁTIS',
    tagKind: 'frete',
    title: 'Acima de R$ 199',
    desc: 'Um incentivo para aumentar o ticket: com o frete incluso, a cliente costuma completar o pedido.',
    until: 'o mês todo',
    share: 'Oi! Em pedidos acima de R$ 199, o frete fica por nossa conta. Se você já pensava em repor algum item, vale aproveitar para fazer tudo de uma vez. Quer que eu monte o seu carrinho até os R$ 199?',
  },
  {
    brand: 'meraki',
    tag: 'BRINDE',
    tagKind: 'brinde',
    title: 'Moviben + porta-comprimidos de brinde',
    desc: 'O brinde ajuda a decidir quem está em dúvida. Para quem vai tomar todos os dias, o porta-comprimidos é realmente útil.',
    until: 'até acabarem os brindes',
    share: 'Na compra do *Moviben* (colágeno tipo 2, glucosamina e condroitina, para apoiar a mobilidade das articulações), você ganha um *porta-comprimidos exclusivo* — útil para não esquecer a dose diária. As unidades do brinde são limitadas. Quer que eu separe o seu?',
  },
];
