// Motor de conteúdo do creator (estilo Sociallis): canais, calendário e tendências.
// Product-agnostic — a vendedora encaixa o produto dela. Ganchos/roteiros prontos.
import { MessageCircle, Camera, Music2, type LucideIcon } from 'lucide-react';
import type { BrandId } from './brands';

export type Channel = 'whatsapp' | 'instagram' | 'tiktok';

export const CHANNELS: { id: Channel; label: string; Icon: LucideIcon; color: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle, color: '#25d366' },
  { id: 'instagram', label: 'Instagram', Icon: Camera, color: '#e1306c' },
  { id: 'tiktok', label: 'TikTok', Icon: Music2, color: '#111111' },
];

export interface CalendarDay {
  brand?: BrandId; // vazio = conteúdo "de fábrica" (vale p/ todas); setado = criado pelo gestor da marca
  day: string;
  channel: Channel;
  format: string;
  tema: string;
  roteiro: string[];
}

// Calendário sugerido da semana (1 conteúdo por dia).
export const CALENDAR: CalendarDay[] = [
  {
    day: 'Seg', channel: 'instagram', format: 'Reels', tema: 'Mostre a sua rotina com o produto',
    roteiro: [
      'Comece pela situação que a cliente reconhece (cansaço, pele ressecada) — ela precisa se identificar.',
      'Mostre como o produto entrou na sua rotina. O contraste é o que prende a atenção.',
      'Feche de forma direta: "quer entender se serve para você? me chama".',
    ],
  },
  {
    day: 'Ter', channel: 'whatsapp', format: 'Status', tema: 'Oferta da semana no seu status',
    roteiro: [
      'Foto do produto e o selo da oferta em destaque (precisa ser legível de longe).',
      'Uma frase só: o benefício e o prazo ("válido até domingo").',
      'Chamada para ação: "responde aqui que eu te explico".',
    ],
  },
  {
    day: 'Qua', channel: 'instagram', format: 'Caixinha', tema: 'Caixinha: "Me pergunta sobre o produto"',
    roteiro: [
      'Abra a caixinha: "me pergunta o que quiser sobre [produto]".',
      'Responda uma por Story, em vídeo — seu rosto e sua voz comunicam mais do que texto.',
      'Ao final de cada resposta: "quer saber mais? me chama".',
    ],
  },
  {
    day: 'Qui', channel: 'tiktok', format: 'Trend', tema: 'Áudio em alta + dica rápida',
    roteiro: [
      'Escolha um áudio em alta (os que aparecem repetidamente no seu feed).',
      'Encaixe uma dica rápida sobre o produto em 7 a 10 segundos.',
      'Texto em destaque na tela com o benefício principal.',
    ],
  },
  {
    day: 'Sex', channel: 'instagram', format: 'Reels', tema: '3 motivos para conhecer o produto',
    roteiro: [
      'Gancho direto: "3 motivos para conhecer o [produto]".',
      'Um motivo por corte, com texto na tela.',
      'Feche com a sua chamada mais clara.',
    ],
  },
  {
    day: 'Sáb', channel: 'whatsapp', format: 'Direct', tema: 'Depoimento de cliente (prova social)',
    roteiro: [
      'Peça autorização à cliente e use o print ou o áudio do relato dela — prova social tem muito peso.',
      'Envie no status ou no direct de quem está em dúvida.',
      'Legenda simples: "olha o que a [nome] me contou".',
    ],
  },
  {
    day: 'Dom', channel: 'instagram', format: 'Stories', tema: 'Bastidores da sua rotina com o produto',
    roteiro: [
      'Mostre você usando o produto na rotina real, sem pose.',
      'Conte por que ele virou parte do seu dia. Autenticidade comunica.',
      'Sem chamada pesada hoje: gere proximidade, a venda vem depois.',
    ],
  },
];

export interface Trend {
  brand?: BrandId;
  id: string;
  channel: Channel;
  tag: string;
  title: string;
  desc: string;
  dica: string;
}

// Tendências do momento (atualizável pelo gestor no futuro).
export const TRENDS: Trend[] = [
  {
    id: 't-transicao', channel: 'instagram', tag: 'Reels',
    title: 'Transição "antes / depois"',
    desc: 'Mostre a situação, corte no beat do áudio e revele a sua rotina com o produto.',
    dica: 'Filme a situação inicial e, na sequência, a sua rotina com o produto. O corte na batida dá ritmo.',
  },
  {
    id: 't-caixinha', channel: 'instagram', tag: 'Caixinha',
    title: '"Me pergunta sobre..."',
    desc: 'Caixinha de perguntas nos Stories sobre o produto/dor da cliente.',
    dica: 'Responda em vídeo, uma pergunta por Story. O rosto comunica mais.',
  },
  {
    id: 't-enquete', channel: 'instagram', tag: 'Stories',
    title: 'Enquete "A ou B"',
    desc: 'Ex.: "Cabelo caindo? Sim / Não" e conduza para o produto na sequência.',
    dica: 'Resposta fácil significa mais interações, e o Instagram entrega para mais gente. Depois, chame no direct quem votou "sim".',
  },
  {
    id: 't-pov', channel: 'tiktok', tag: 'Reels',
    title: 'POV: você descobre o benefício',
    desc: 'Formato POV curto mostrando a diferença que o produto faz na rotina.',
    dica: 'Texto na tela e expressão. De 7 a 10 segundos, direto ao ponto.',
  },
  {
    id: 't-audio', channel: 'tiktok', tag: 'Trend',
    title: 'Áudio em alta da semana',
    desc: 'Escolha um áudio em alta e encaixe o seu produto no formato do trend.',
    dica: 'Poste enquanto o áudio ainda está subindo. O timing faz diferença.',
  },
];
