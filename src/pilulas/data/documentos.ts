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
    id: 'ficha-jaecoo-7', brand: 'ramasa', prateleira: 'ficha',
    titulo: 'Ficha técnica — Jaecoo 7',
    paraQue: 'Item por item, o que vem na Luxury e o que vem na Prestige.',
    arquivo: '/docs/ramasa/ficha-jaecoo-7.pdf', paginas: 1, atualizado: '2026',
  },
  {
    id: 'ficha-omoda-5', brand: 'ramasa', prateleira: 'ficha',
    titulo: 'Ficha técnica — Omoda 5',
    paraQue: 'Motorização, consumo, dimensões e equipamento por versão.',
    arquivo: '/docs/ramasa/ficha-omoda-5.pdf', paginas: 1, atualizado: '2026',
  },
  {
    id: 'guia-jaecoo-7', brand: 'ramasa', prateleira: 'venda',
    titulo: 'Guia de venda — Jaecoo 7',
    paraQue: 'A apresentação em 6 passos e o comparativo contra Haval, Song Plus, Corolla Cross e Compass.',
    arquivo: '/docs/ramasa/guia-jaecoo-7.pdf', paginas: 35, atualizado: '2026',
  },
  {
    id: 'guia-omoda-7', brand: 'ramasa', prateleira: 'venda',
    titulo: 'Guia de venda — Omoda 7',
    paraQue: 'Os 6 passos do topo de linha e as respostas de objeção da marca.',
    arquivo: '/docs/ramasa/guia-omoda-7.pdf', paginas: 25, atualizado: '2026',
  },
  {
    id: 'guia-omoda-e5', brand: 'ramasa', prateleira: 'venda',
    titulo: 'Guia de venda — Omoda E5',
    paraQue: 'Comparativo de autonomia e tempo de recarga contra os elétricos concorrentes.',
    arquivo: '/docs/ramasa/guia-omoda-e5.pdf', paginas: 26, atualizado: '2026',
  },
  {
    id: 'acessorios-catalogo', brand: 'ramasa', prateleira: 'acessorios',
    titulo: 'Catálogo de acessórios originais',
    paraQue: 'As fotos de cada acessório e em que modelo cada um entra.',
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
