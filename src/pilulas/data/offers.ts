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
}

// Ofertas "de fábrica" (seed). O gestor cria novas pelo Painel (ficam no store).
export const SEED_OFFERS: Offer[] = [
  {
    brand: 'wepink',
    tag: '30% OFF',
    tagKind: 'desconto',
    title: 'Cabelos & Unhas — 1º pote',
    desc: 'A cliente que vive reclamando do cabelo? Essa é a desculpa perfeita pra ela começar. 30% no 1º pote mata o "depois eu vejo".',
    until: 'até domingo',
    share: 'Sabe aquele cabelo que você olha no espelho e pensa "pelo amor" 😅? Então… o tratamento que tá virando a cabeça (literalmente) de todo mundo tá com *30% OFF no primeiro pote* — mas só até domingo. É o empurrãozinho pra você finalmente começar e ver a diferença no próprio espelho. Quer que eu separo o seu? 💛',
  },
  {
    brand: 'wepink',
    tag: 'COMBO',
    tagKind: 'combo',
    title: 'Kit Glow: Sérum + Body Splash',
    desc: 'Venda a sensação, não o kit. Skincare + perfume no mesmo carrinho = ticket maior e cliente saindo feliz.',
    until: 'enquanto durar o estoque',
    share: 'Imagina só: pele com aquele viço de quem dormiu 8 horas ✨ + um cheirinho que faz a pessoa virar e perguntar "amiga, que perfume é esse?". É isso que o *Kit Glow* (sérum + body splash) entrega — e agora com preço de kit. Autoestima em dose dupla, enquanto durar o estoque. Garanto o seu? 😍',
  },
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
    title: 'Ômega 3 + necessaire exclusiva',
    desc: 'Brinde fecha a venda de quem tá em cima do muro. "Ganha uma necessaire" costuma ser o empurrão final.',
    until: 'até acabarem as necessaires',
    share: 'Comprando o *Ômega 3 Odor Free* (aquele que NÃO repete gosto de peixe 🐟🚫) você ganha uma *necessaire exclusiva* de brinde 🎁. E olha… são as últimas. Quando acabar, acabou de verdade — sem choro depois. Quer que eu separo a sua antes de sumir?',
  },
];
