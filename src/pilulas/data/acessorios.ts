// ACESSÓRIOS — a segunda venda, e um TIPO DIFERENTE de item.
//
// Acessório não é um carro pequeno. Muda tudo:
//   - ele tem CÓDIGO de peça, e o vendedor precisa dele pra pedir no sistema;
//   - tem PREÇO PÚBLICO fixo (o carro sai da tabela vigente, o acessório não);
//   - vale pra VÁRIOS modelos, então não cabe dentro de um produto só;
//   - a objeção não é "é chinês", é "preciso mesmo disso?";
//   - e o momento é OUTRO: acessório se vende no fechamento, não na abordagem.
//
// Por isso ele vive aqui, separado dos veículos, e aparece em dois lugares:
// na lista de acessórios do catálogo e DENTRO de cada carro compatível — que é
// onde a venda de verdade acontece, com o cliente já decidido pelo carro.
//
// Fonte: comunicados de pós-vendas PV050/2026 e PV033/2026 da Omoda|Jaecoo.
// Os preços são o PÚBLICO SUGERIDO. Custo de reposição e margem estão nos
// comunicados e NÃO entram no app: isso é informação da gerência, e vendedor
// com custo na tela acaba negociando o desconto que não é dele pra dar.
import type { BrandId } from './brands';

export interface Acessorio {
  id: string;
  brand: BrandId;
  nome: string;
  /** O que ele resolve pro cliente — é isto que o vendedor fala primeiro. */
  beneficio: string;
  /** Como oferecer, na prática. */
  comoOferecer: string;
  /** Preço público sugerido, em reais. Sem centavos porque todos são redondos. */
  preco?: number;
  /** Ids dos veículos em que ele encaixa. É o que faz o acessório aparecer dentro do carro. */
  aplicaEm: string[];
  /** Código de peça por modelo — o vendedor precisa disso pra pedir. */
  codigos: { modelo: string; pn: string }[];
  observacao?: string;
}

const JAECOO = 'jaecoo-7';
const O5 = 'omoda-5-shs-h';
const O7 = 'omoda-7-shs-p';
const E5 = 'omoda-e5';

export const ACESSORIOS: Acessorio[] = [
  {
    id: 'tapete-carpete-premium',
    brand: 'ramasa',
    nome: 'Tapete carpete premium',
    beneficio: 'Protege o carro novo no primeiro dia, que é quando ele mais estraga.',
    comoOferecer:
      'É o mais fácil de todos e quase ninguém oferece. Custa menos que a primeira lavagem completa e o cliente leva sem pensar. Ofereça na entrega, não na negociação.',
    preco: 470,
    aplicaEm: [O5, JAECOO, O7],
    codigos: [
      { modelo: 'Omoda 5', pn: '08JD1N50T19CHEN001' },
      { modelo: 'Jaecoo 7', pn: '08W01N30T1EJPY001' },
      { modelo: 'Omoda 7', pn: '08W01N30T1GCPY001' },
    ],
  },
  {
    id: 'estribo-iluminado',
    brand: 'ramasa',
    nome: 'Estribo iluminado retrátil',
    beneficio: 'Recolhe sozinho quando o carro anda e acende quando a porta abre.',
    comoOferecer:
      'É o acessório que mais impressiona — e o de maior valor. Mostre funcionando: abra a porta e deixe o cliente ver o estribo sair e acender. Combina com quem tem criança, idoso em casa ou é baixinho.',
    preco: 9000,
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Jaecoo 7', pn: '08CT1W20T1EJPHN001' }],
  },
  {
    id: 'rack-teto',
    brand: 'ramasa',
    nome: 'Rack de teto',
    beneficio: 'A base pra levar bagageiro ou bicicleta — sem ele, os dois não entram.',
    comoOferecer:
      'Pergunte sobre viagem em família e praia. Quem responde já está comprando. E avise: o bagageiro e o rack de bike dependem dele.',
    preco: 1800,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [
      { modelo: 'Linha Jaecoo', pn: 'ZJP-CY3000362' },
      { modelo: 'Linha Omoda', pn: 'ZJP-CY3000361' },
    ],
  },
  {
    id: 'bagageiro',
    brand: 'ramasa',
    nome: 'Bagageiro de teto',
    beneficio: 'A mala da viagem inteira sai de dentro do carro.',
    comoOferecer:
      'O gancho é a viagem que ele já está planejando. Pergunte quantas pessoas viajam juntas — se forem quatro ou mais, o bagageiro se vende sozinho.',
    preco: 5400,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [
      { modelo: 'Linha Jaecoo', pn: 'ZJP-CY3000366' },
      { modelo: 'Linha Omoda', pn: 'ZJP-CY3000365' },
    ],
    observacao: 'Precisa do rack de teto instalado.',
  },
  {
    id: 'rack-bike',
    brand: 'ramasa',
    nome: 'Rack de bike de teto',
    beneficio: 'A bicicleta vai junto sem sujar nem riscar o porta-malas.',
    comoOferecer:
      'Repare se ele fala de trilha, ciclismo ou fim de semana fora. É acessório de quem já tem a bike — não tente criar a vontade, só resolva o problema de levar.',
    preco: 1490,
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Linha Jaecoo', pn: '08Z01S2023TYY003' }],
    observacao: 'Precisa do rack de teto instalado.',
  },
  {
    id: 'modification-kit-j7',
    brand: 'ramasa',
    nome: 'Modification Kit — Jaecoo 7',
    beneficio: 'Transforma o visual do carro: rack off-road, bolsa lateral com chave e escada.',
    comoOferecer:
      'As três peças são integradas e instaladas juntas — não venda uma só. É o kit que muda a cara do carro no estacionamento, então mostre no carro exposto, nunca em foto. E tem uma alavanca forte: a marca mantém taxa zero em 24, 36 e 60 vezes para incluir o kit no financiamento do Jaecoo 7 (confirme se a condição está valendo).',
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Jaecoo 7', pn: 'ver comunicado PV033/2026' }],
    observacao: 'Preço inclui 4 horas de instalação. Confirme o valor vigente com a gerência.',
  },
];

export function acessoriosDaMarca(brand: BrandId): Acessorio[] {
  return ACESSORIOS.filter((a) => a.brand === brand);
}

/** Os que encaixam neste veículo — é o que aparece dentro do carro. */
export function acessoriosPara(produtoId: string): Acessorio[] {
  return ACESSORIOS.filter((a) => a.aplicaEm.includes(produtoId));
}

export function precoLabel(a: Acessorio): string {
  if (!a.preco) return 'sob consulta';
  return a.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}
