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
    id: 'm-ativefer-reels',
    brand: 'meraki',
    kind: 'reels',
    points: 50,
    title: 'Grave um Reels curto sobre o Ative-Fer',
    goal: 'O gancho “cansaço que não passa nem dormindo” faz o dedo parar — quase toda mulher se identifica.',
    productId: 'ative-fer',
    caption:
      'Cansaço que dorme e acorda igual, cabelo caindo, falta de ar subindo a escada? 😴 Muitas vezes é ferro baixo — comum demais na mulher. O Ative-Fer é ferro bisglicinato: repõe o ferro SEM aquela azia e prisão de ventre do ferro comum. Bora trazer a sua energia de volta? Me chama 💬',
    hashtags: '#ferro #cansaço #anemia #saudedamulher #meraki #disposição',
  },
];
