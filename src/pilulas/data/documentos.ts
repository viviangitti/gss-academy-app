// REPOSITÓRIO — o documento que se consulta como está.
//
// A regra que separa daqui pro resto do app: o que o vendedor consulta EM PÉ,
// com o cliente do lado, vira dado dentro da pílula. O que ele consulta
// SENTADO — antes do expediente, no fim do dia, na sala — fica aqui em PDF.
// Guia de 35 páginas ninguém abre no showroom, mas é onde ele estuda.
//
// Fase 1 (esta): os documentos que a montadora manda e não mudam toda semana
// viajam junto com o app. Abrem rápido, funcionam sem configurar nada.
// Fase 2: o gestor subir documento sozinho — precisa do Firebase Storage
// ligado, porque estes arquivos passam de 1 MB (teto do Firestore).
import type { BrandId } from './brands';

export type PrateleiraId = 'ficha' | 'venda' | 'acessorios' | 'processo';

export interface Prateleira {
  id: PrateleiraId;
  titulo: string;
  descricao: string;
}

export const PRATELEIRAS: Prateleira[] = [
  { id: 'ficha', titulo: 'Fichas técnicas', descricao: 'O dado oficial, versão por versão. É o que vale quando o cliente questiona um número.' },
  { id: 'venda', titulo: 'Guias de venda', descricao: 'A apresentação em 6 passos, o comparativo com o concorrente e as objeções, como a marca escreveu.' },
  { id: 'acessorios', titulo: 'Acessórios', descricao: 'Catálogo, códigos de peça e comunicados de lançamento.' },
  { id: 'processo', titulo: 'Processos', descricao: 'Como a loja opera — entrega técnica e afins.' },
];

export interface Documento {
  id: string;
  brand: BrandId;
  prateleira: PrateleiraId;
  titulo: string;
  /** Por que ele existe — em uma linha, do ponto de vista de quem vai abrir. */
  paraQue: string;
  arquivo: string;
  paginas: number;
  atualizado: string;
  /**
   * Documento com informação que NÃO pode chegar ao cliente (custo de
   * reposição, margem, política de preço). O app avisa antes de abrir — os
   * comunicados de pós-vendas vêm marcados "INTERNAL" pela própria montadora.
   */
  interno?: boolean;
}

export const DOCUMENTOS: Documento[] = [
  {
    id: 'guia-jaecoo-7-my27', brand: 'ramasa', prateleira: 'venda',
    titulo: 'Guia do line-up MY27 — Jaecoo 7',
    paraQue: 'O que muda entre ELITE, LUXURY e PRESTIGE, item por item — e o comparativo de gasto anual contra Corolla Cross, Compass e Taos.',
    arquivo: '/docs/ramasa/guia-jaecoo-7-my27.pdf', paginas: 16, atualizado: 'Abril de 2026',
    // A própria montadora carimbou "divulgação externa proibida" no rodapé.
    interno: true,
  },
  {
    id: 'treinamento-shs', brand: 'ramasa', prateleira: 'venda',
    titulo: 'Sistema Super Híbrido (SHS) — treinamento',
    paraQue: 'Como o híbrido funciona de verdade, para responder quando o cliente pergunta se precisa de tomada.',
    arquivo: '/docs/ramasa/treinamento-shs.pdf', paginas: 40, atualizado: '2026',
  },
  {
    id: 'treinamento-omoda-5', brand: 'ramasa', prateleira: 'venda',
    titulo: 'Treinamento completo — Omoda 5 SHS-H',
    paraQue: 'O material longo do carro: versões, equipamentos e as vantagens contra cada concorrente.',
    // Traz o comparativo de PREÇO contra Corolla Cross, HR-V e Creta — material de treinamento, não de cliente.
    interno: true,
    arquivo: '/docs/ramasa/treinamento-omoda-5.pdf', paginas: 50, atualizado: '2026',
  },
  {
    id: 'treinamento-omoda-7', brand: 'ramasa', prateleira: 'venda',
    titulo: 'Treinamento completo — Omoda 7 SHS-P',
    paraQue: 'O material longo do carro: LUXURY x PRESTIGE e o comparativo com Haval H6, Song Plus, Commander e Tiguan.',
    // Traz o comparativo de PREÇO contra os concorrentes — material de treinamento, não de cliente.
    interno: true,
    arquivo: '/docs/ramasa/treinamento-omoda-7.pdf', paginas: 44, atualizado: '2026',
  },
  {
    id: 'acessorios-tabela-loja', brand: 'ramasa', prateleira: 'acessorios',
    titulo: 'Tabela de acessórios e serviços da loja',
    paraQue: 'O que a Ramasa instala aqui dentro, por versão, com o valor de cada item — do PPF à película.',
    arquivo: '/docs/ramasa/acessorios-tabela-loja.pdf', paginas: 3, atualizado: '2026',
    // Preço público sugerido, mas é tabela da casa: confirmar o vigente antes
    // de falar número com o cliente.
    interno: true,
  },
  {
    id: 'catalogo-jaecoo', brand: 'ramasa', prateleira: 'acessorios',
    titulo: 'Catálogo Jaecoo — folha de acessórios',
    paraQue: 'A folha de acessórios da linha Jaecoo, para mostrar na tela quando o cliente pergunta o que existe.',
    arquivo: '/docs/ramasa/catalogo-jaecoo.pdf', paginas: 1, atualizado: '2026',
  },
  {
    id: 'ficha-jaecoo-7', brand: 'ramasa', prateleira: 'ficha',
    titulo: 'Ficha técnica — Jaecoo 7 SHS-P',
    paraQue: 'As três versões, item por item: ELITE, LUXURY e PRESTIGE.',
    arquivo: '/docs/ramasa/ficha-jaecoo-7.pdf', paginas: 3, atualizado: 'set/2026',
  },
  {
    id: 'ficha-omoda-5', brand: 'ramasa', prateleira: 'ficha',
    titulo: 'Ficha técnica — Omoda 5 SHS-H',
    paraQue: 'Luxury e Prestige lado a lado, com o que muda entre as duas.',
    arquivo: '/docs/ramasa/ficha-omoda-5.pdf', paginas: 1, atualizado: 'set/2026',
  },
  {
    id: 'ficha-omoda-7', brand: 'ramasa', prateleira: 'ficha',
    titulo: 'Ficha técnica — Omoda 7 SHS-P',
    paraQue: 'Luxury e Prestige lado a lado, com o que muda entre as duas.',
    arquivo: '/docs/ramasa/ficha-omoda-7.pdf', paginas: 1, atualizado: 'set/2026',
  },
  {
    id: 'ficha-omoda-e5', brand: 'ramasa', prateleira: 'ficha',
    titulo: 'Ficha técnica — Omoda E5',
    paraQue: 'O elétrico completo: bateria, V2L, dimensões e o pacote ADAS.',
    arquivo: '/docs/ramasa/ficha-omoda-e5.pdf', paginas: 1, atualizado: 'set/2026',
  },
  {
    id: 'ncap-jaecoo-7', brand: 'ramasa', prateleira: 'ficha',
    titulo: 'Euro NCAP — Jaecoo 7 PHEV (5 estrelas)',
    paraQue: 'O laudo completo do teste de 2025, com o vídeo e as fotos de cada impacto. Para mandar ao cliente que pede prova.',
    arquivo: '/docs/ramasa/ncap-jaecoo-7.pdf', paginas: 14, atualizado: 'abr/2025',
  },
  {
    id: 'ncap-omoda-5', brand: 'ramasa', prateleira: 'ficha',
    titulo: 'Euro NCAP — Omoda 5 (5 estrelas)',
    paraQue: 'O laudo completo, com o vídeo e as fotos de cada impacto. A nota vale para todas as versões do Omoda 5.',
    arquivo: '/docs/ramasa/ncap-omoda-5.pdf', paginas: 11, atualizado: 'dez/2022',
  },
  {
    id: 'manual-garantia', brand: 'ramasa', prateleira: 'processo',
    titulo: 'Manual de garantia Omoda & Jaecoo',
    paraQue: 'O documento que sustenta o "7 anos, 8 na bateria": prazos, limite de km, o que cancela a garantia e o que é peça de desgaste.',
    arquivo: '/docs/ramasa/manual-garantia.pdf', paginas: 28, atualizado: 'set/2026',
  },
  {
    id: 'guia-jaecoo-7', brand: 'ramasa', prateleira: 'venda',
    titulo: 'Guia de venda — Jaecoo 7',
    paraQue: 'A apresentação em 6 passos e o comparativo contra Haval, Song Plus, Corolla Cross e Compass.',
    // Traz preço público e o preço dos concorrentes — é guia de venda, não folheto de cliente.
    interno: true,
    arquivo: '/docs/ramasa/guia-jaecoo-7.pdf', paginas: 35, atualizado: '2026',
  },
  {
    id: 'guia-omoda-7', brand: 'ramasa', prateleira: 'venda',
    titulo: 'Guia de venda — Omoda 7',
    paraQue: 'Os 6 passos do topo de linha e as respostas de objeção da marca.',
    // Traz preço público e o preço dos concorrentes — é guia de venda, não folheto de cliente.
    interno: true,
    arquivo: '/docs/ramasa/guia-omoda-7.pdf', paginas: 25, atualizado: '2026',
  },
  {
    id: 'guia-omoda-e5', brand: 'ramasa', prateleira: 'venda',
    titulo: 'Guia de venda — Omoda E5',
    paraQue: 'Comparativo de autonomia e tempo de recarga contra os elétricos concorrentes.',
    // Traz preço público e o preço dos concorrentes — é guia de venda, não folheto de cliente.
    interno: true,
    arquivo: '/docs/ramasa/guia-omoda-e5.pdf', paginas: 26, atualizado: '2026',
  },
  {
    id: 'acessorios-catalogo', brand: 'ramasa', prateleira: 'acessorios',
    titulo: 'Catálogo de acessórios originais',
    paraQue: 'As fotos de cada acessório e em que modelo cada um entra.',
    // Traz o preço de cada acessório — quem responde preço é a condição vigente, não o catálogo.
    interno: true,
    arquivo: '/docs/ramasa/acessorios-catalogo.pdf', paginas: 10, atualizado: 'jul/2026',
  },
  {
    id: 'acessorios-pv050', brand: 'ramasa', prateleira: 'acessorios',
    titulo: 'Comunicado PV050 — lançamento de acessórios',
    paraQue: 'A tabela oficial de códigos, aplicabilidade e preços.',
    arquivo: '/docs/ramasa/acessorios-pv050.pdf', paginas: 4, atualizado: '14/08/2026',
    interno: true,
  },
  {
    id: 'acessorios-kit', brand: 'ramasa', prateleira: 'acessorios',
    titulo: 'Comunicado PV033 — Modification Kit Jaecoo 7',
    paraQue: 'As três peças do kit, a instalação conjunta e a condição de financiamento.',
    arquivo: '/docs/ramasa/acessorios-modification-kit.pdf', paginas: 4, atualizado: '2026',
    interno: true,
  },
  {
    id: 'entrega-tecnica', brand: 'ramasa', prateleira: 'processo',
    titulo: 'Guia de entrega técnica',
    paraQue: 'O que mostrar ao cliente na entrega do carro, sem sobrecarregar.',
    arquivo: '/docs/ramasa/entrega-tecnica.pdf', paginas: 28, atualizado: 'mar/2026',
  },
];

export function documentosDaMarca(brand: BrandId): Documento[] {
  return DOCUMENTOS.filter((d) => d.brand === brand);
}
