import type { BrandId } from './brands';

// Tipos de oferta. Os quatro primeiros são de varejo (saúde); os de baixo são
// do automotivo, onde "condição comercial" é taxa, bônus de troca e estoque.
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
  // ---- Ramasa (automotivo). EXEMPLO de estrutura: os números reais mudam por
  // campanha e têm validade curta — quem publica é o gestor, pelo Painel. ----
  {
    brand: 'ramasa',
    tag: 'TAXA',
    tagKind: 'taxa',
    title: 'Taxa promocional na linha Jaecoo',
    desc: 'Condição de financiamento da campanha vigente. Confirme a taxa e o prazo do dia antes de passar ao cliente — muda por lote e por banco.',
    until: 'a confirmar com a gerência',
    share: 'Oi! Consegui uma condição especial de financiamento para o Jaecoo J7 nesta semana. Posso simular com a sua entrada e te mandar por escrito? A condição tem validade.',
  },
  {
    brand: 'ramasa',
    tag: 'BÔNUS DE TROCA',
    tagKind: 'bonus',
    title: 'Bônus na avaliação do usado',
    desc: 'Valor adicional na troca dentro da campanha. Depende da avaliação do veículo — nunca prometa o valor antes de avaliar.',
    until: 'enquanto durar a campanha',
    share: 'Oi! Estamos com bônus na avaliação de usados nesta campanha. Quer trazer o seu para eu avaliar? Aí te passo o número real da troca.',
  },
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
