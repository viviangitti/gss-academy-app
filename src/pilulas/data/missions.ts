// Missões de Creator — a camada que transforma a vendedora em criadora de conteúdo.
// Cada missão dá um "kit pronto" (legenda + hashtags) e pontua no MESMO ranking.

import { Camera, Clapperboard, MessageCircle, Image, type LucideIcon } from 'lucide-react';
import type { BrandId } from './brands';

export type MissionKind = 'stories' | 'reels' | 'status' | 'feed';

export interface Mission {
  id: string;
  brand: BrandId;
  kind: MissionKind;
  points: number;
  title: string; // o que fazer
  goal: string; // detalhe / porquê
  productId?: string; // pílula relacionada (abre o vídeo)
  caption: string; // legenda pronta pra copiar
  hashtags: string;
}

export const KIND_LABEL: Record<MissionKind, { label: string; Icon: LucideIcon }> = {
  stories: { label: 'Stories', Icon: Camera },
  reels: { label: 'Reels', Icon: Clapperboard },
  status: { label: 'Status WhatsApp', Icon: MessageCircle },
  feed: { label: 'Post no Feed', Icon: Image },
};

export const MISSIONS: Mission[] = [
  {
    id: 'm-glpen-stories',
    brand: 'meraki',
    kind: 'stories',
    points: 30,
    title: 'Poste a pílula do GLPEN Nutri Muscle no seu Stories',
    goal: 'O vídeo de 30s já está pronto. Mire em quem está na “caneta” — é o público que mais compra.',
    productId: 'glpen-nutri-muscle',
    caption:
      'A caneta te emagrece e derrete seu músculo junto — ninguém te avisa. 💉 O GLPEN Nutri Muscle segura sua massa magra pra você emagrecer FIRME: sem flacidez e sem efeito sanfona. Suou pra emagrecer? Não deixa o músculo ir junto. Me chama 👊',
    hashtags: '#glp1 #massamagra #emagrecimento #ozempic #proteina #meraki',
  },
  {
    id: 'm-omega-reels',
    brand: 'meraki',
    kind: 'reels',
    points: 50,
    title: 'Grave um Reels curto sobre o Ômega 3 Odor Free',
    goal: 'Todo mundo tem aquele ômega encostado na gaveta. O gancho “sem gosto de peixe” é o que faz o dedo parar.',
    productId: 'omega-3',
    caption:
      'Confessa: você já comprou ômega 3 e ele acabou esquecido na gaveta porque repetia o dia todo, né? 🐟😖 Esse aqui é Odor Free — toque de morango, zero gosto de peixe. É o ômega que você REALMENTE toma todo dia (e seu coração agradece). Bora testar? 💬',
    hashtags: '#omega3 #saude #suplementos #odorfree #bemestar',
  },
  {
    id: 'm-kit-glow-status',
    brand: 'wepink',
    kind: 'status',
    points: 20,
    title: 'Compartilhe a oferta do Kit Glow no seu Status',
    goal: 'Status bate em quem já é seu contato. Poste a sensação (viço + cheiro), não a lista de produtos.',
    caption:
      'Pele com aquele viço + um cheiro que faz todo mundo perguntar "amiga, que perfume é esse?" 😍 O Kit Glow junta sérum e body splash com preço de combo. É se sentir gata da cabeça aos pés — e só essa semana. Bora? 💬',
    hashtags: '#skincare #kitglow #ofertadasemana',
  },
  {
    id: 'm-serum-antes-depois',
    brand: 'wepink',
    kind: 'feed',
    points: 60,
    title: 'Faça um “antes e depois” usando o Sérum Facial',
    goal: 'Conteúdo de prova social é o que mais converte. Use você mesma como modelo.',
    productId: 'serum-facial',
    caption:
      'Testei o Sérum Facial Glow por 7 dias e olha esse viço 💧 Textura leve, some rápido e deixa a make lisinha. Quer testar? Te conto como usar 💗',
    hashtags: '#antesedepois #skincare #glow #peleviçosa #resenha',
  },
];
