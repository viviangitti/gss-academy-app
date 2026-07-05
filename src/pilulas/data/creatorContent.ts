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
    day: 'Seg', channel: 'instagram', format: 'Reels', tema: 'Antes e depois: o resultado do produto',
    roteiro: [
      'Comece MOSTRANDO a dor (cabelo no ralo, pele apagada) — a cliente precisa se ver ali.',
      'Corta seco pro resultado com o produto. O contraste é o que prende o dedo.',
      'Fecha reto: "quer esse resultado? me chama que eu te explico".',
    ],
  },
  {
    day: 'Ter', channel: 'whatsapp', format: 'Status', tema: 'Oferta da semana no seu status',
    roteiro: [
      'Foto do produto + o selo da oferta BEM grande (tem que ler de longe).',
      'Uma frase só: o benefício + o prazo ("só até domingo, hein").',
      'Chama pra ação: "responde aqui que eu já te explico".',
    ],
  },
  {
    day: 'Qua', channel: 'instagram', format: 'Caixinha', tema: 'Caixinha: "Me pergunta sobre o produto"',
    roteiro: [
      'Abre a caixinha: "me pergunta qualquer coisa sobre [produto]".',
      'Responde 1 por Story, em VÍDEO — seu rosto e sua voz vendem mais que texto.',
      'No fim de cada resposta: "quer o seu? clica no link/me chama".',
    ],
  },
  {
    day: 'Qui', channel: 'tiktok', format: 'Trend', tema: 'Áudio em alta + dica rápida',
    roteiro: [
      'Pega um áudio que tá bombando (olha os que aparecem repetido no seu feed).',
      'Encaixa uma dica rápida do produto em 7-10s. Sem enrolar.',
      'Texto GRANDE na tela com o benefício principal.',
    ],
  },
  {
    day: 'Sex', channel: 'instagram', format: 'Reels', tema: '3 motivos pra usar o produto',
    roteiro: [
      'Gancho direto: "3 motivos pra você usar [produto] AGORA".',
      'Um motivo por corte, rapidinho, com texto na tela.',
      'Fecha com a chamada mais forte que você tiver.',
    ],
  },
  {
    day: 'Sáb', channel: 'whatsapp', format: 'Direct', tema: 'Depoimento de cliente (prova social)',
    roteiro: [
      'Pega um print ou áudio de uma cliente satisfeita (prova social vale ouro).',
      'Manda no status ou no direct de quem tá em cima do muro.',
      'Legenda simples: "olha o que a fulana me mandou 👇".',
    ],
  },
  {
    day: 'Dom', channel: 'instagram', format: 'Stories', tema: 'Bastidores da sua rotina com o produto',
    roteiro: [
      'Mostra você USANDO o produto na rotina real — nada posado.',
      'Conta por que virou parte do seu dia. Verdade vende.',
      'Sem CTA pesado hoje: gera proximidade, a venda vem depois.',
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
    desc: 'Mostra o problema, corta no beat do áudio e revela o resultado com o produto.',
    dica: 'Filma o "antes" com cara de problema e o "depois" já resolvida. O corte na batida é o que viraliza.',
  },
  {
    id: 't-caixinha', channel: 'instagram', tag: 'Caixinha',
    title: '"Me pergunta sobre..."',
    desc: 'Caixinha de perguntas nos Stories sobre o produto/dor da cliente.',
    dica: 'Responda em vídeo, 1 pergunta por Story. Rosto converte mais.',
  },
  {
    id: 't-enquete', channel: 'instagram', tag: 'Stories',
    title: 'Enquete "A ou B"',
    desc: 'Ex.: "Cabelo caindo? Sim / Não" e puxe pro produto na sequência.',
    dica: 'Resposta fácil = mais gente toca = o Insta entrega pra mais gente. Depois puxa quem votou "sim" pro direct.',
  },
  {
    id: 't-pov', channel: 'tiktok', tag: 'Reels',
    title: 'POV: você descobre o benefício',
    desc: 'Formato POV curtinho mostrando a "virada" que o produto traz.',
    dica: 'Texto na tela + expressão. 7-10 segundos, sem enrolar.',
  },
  {
    id: 't-audio', channel: 'tiktok', tag: 'Trend',
    title: 'Áudio em alta da semana',
    desc: 'Pegue um áudio bombando e encaixe seu produto no formato do trend.',
    dica: 'Posta enquanto o áudio ainda tá subindo. Áudio velho não entrega — timing é tudo.',
  },
];
