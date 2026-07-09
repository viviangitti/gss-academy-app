import type { BrandId } from './brands';

export type OfferKind = 'desconto' | 'combo' | 'frete' | 'brinde';

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
    desc: 'O gatilho pra subir o ticket. "Já que o frete é grátis, leva mais um" funciona quase sempre.',
    until: 'o mês todo',
    share: 'Psiu 👀 fechando R$ 199 o frete fica por minha conta. Já que é pra pedir, pede tudo de uma vez e não gasta nada com entrega, né? 😉 Me chama que eu monto seu carrinho pra bater os R$ 199 certinho — sem dor de cabeça.',
  },
  {
    brand: 'meraki',
    tag: 'BRINDE',
    tagKind: 'brinde',
    title: 'Moviben + porta-comprimidos de brinde',
    desc: 'Brinde fecha a venda de quem tá em cima do muro. Pra quem vai tomar todo dia, o porta-comprimidos é o empurrão perfeito.',
    until: 'até acabarem os brindes',
    share: 'Comprando o *Moviben* (colágeno tipo 2 + glucosamina + condroitina pra deixar a articulação livre 💪) você ganha um *porta-comprimidos exclusivo* de brinde 🎁 — perfeito pra não esquecer de tomar todo dia. E olha… são os últimos. Quando acabar, acabou de verdade. Quer que eu separo o seu antes de sumir?',
  },
];
