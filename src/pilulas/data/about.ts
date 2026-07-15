// Conteúdo institucional "Quem é a marca" — mostrado na página Sobre.
// White-label: uma entrada por marca. Fonte: Apresentação Institucional Meraki 2026.
import type { BrandId } from './brands';

export interface AboutValue {
  title: string;
  desc: string;
}

export interface AboutContent {
  meaning: string; // significado do nome
  tagline: string; // assinatura
  symbol: string; // o símbolo da marca, em 1 frase
  purpose: string;
  values: AboutValue[];
  focus: string;
  stat: { number: string; label: string };
  clients: string[];
  leadership: string;
}

const MERAKI: AboutContent = {
  meaning: 'Meraki vem do grego: "dar parte de si em algo", "fazer com alma".',
  tagline: 'Ao seu lado pela vida.',
  symbol: 'O símbolo é o infinito na forma do "M" — a ideia de fazer as coisas com alma e transcender.',
  purpose:
    'Promover saúde e bem-estar por meio de produtos, serviços e soluções que agreguem valor para todos os elos da cadeia, construindo relações sustentáveis.',
  values: [
    { title: 'Empreendedorismo', desc: 'Gerar resultado de forma sistêmica e sustentável.' },
    { title: 'Simplicidade', desc: 'Agir de forma autêntica, elegante e inteligente.' },
    { title: 'Coerência', desc: 'Alinhar ação, propósito e valores da empresa.' },
    { title: 'Maestria', desc: 'Buscar a perfeição em tudo que se propõe a fazer.' },
    { title: 'Perseverança', desc: 'Determinação e disciplina para superar obstáculos.' },
  ],
  focus:
    'Construir marcas de sucesso — com desempenho, relevância e consistência — no canal de redes de farmácia.',
  stat: { number: '+4.000', label: 'pontos de venda ativos' },
  clients: [
    'Farmácias São João',
    'Drogal',
    'Grupo DPSP',
    'Nissei',
    'Drogaria Globo',
    'Ultra Popular',
    'Indiana',
    'FarmaLIDER',
  ],
  leadership:
    'Fundada por profissionais com mais de 25 anos de mercado farmacêutico e de saúde, com passagens por Medley, Cimed, Hypera e Myralis.',
};

const ABOUT: Partial<Record<BrandId, AboutContent>> = {
  meraki: MERAKI,
};

export function getAbout(id: BrandId): AboutContent | undefined {
  return ABOUT[id];
}
