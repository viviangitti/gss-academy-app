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
    goal: 'O vídeo já está pronto. Fale com quem está em tratamento com a medicação — é o público mais interessado.',
    productId: 'glpen-nutri-muscle',
    caption:
      'Emagrecer com a medicação pode custar massa magra no caminho. O GLPEN Nutri Muscle traz HMB, arginina e glutamina para apoiar a manutenção da massa muscular durante o processo — sempre junto do treino de força e da orientação do seu profissional de saúde. Quer saber se faz sentido para você? Me chama.',
    hashtags: '#glp1 #massamagra #emagrecimento #proteina #massamuscular #meraki',
  },
  {
    id: 'm-ativefer-reels',
    brand: 'meraki',
    kind: 'reels',
    points: 50,
    title: 'Grave um Reels curto sobre o Ative-Fer',
    goal: 'O gancho “cansaço que não passa nem dormindo” gera identificação — muitas mulheres se reconhecem.',
    productId: 'ative-fer',
    caption:
      'Cansaço persistente, queda de cabelo, falta de ar ao subir escadas? Pode estar associado ao ferro baixo, algo frequente entre mulheres. O Ative-Fer é ferro bisglicinato: reposição com melhor tolerância ao estômago. O diagnóstico é sempre do seu médico — me chama que eu te explico.',
    hashtags: '#ferro #cansaço #anemia #saudedamulher #meraki #disposição',
  },
];
