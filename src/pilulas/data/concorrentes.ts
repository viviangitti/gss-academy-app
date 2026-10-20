// OS CONCORRENTES, UM A UM — e por que isto não entra na tabela da casa.
//
// O Gerson mandou dez folhas prontas (17/10/2026): Jaecoo 5 Prestige contra o
// top de linha de cada concorrente, cada uma uma peça fechada da marca, com a
// arte, o carro e as linhas que ELES escolheram comparar.
//
// POR QUE IMAGEM E NÃO DADO. A tentação era transcrever as dez fichas para
// dentro do comparativo da casa, e aí o vendedor misturaria tudo numa tabela
// só. Duas coisas mataram a ideia:
//
//   1. As folhas só falam do Jaecoo 5. Transcrever não daria Omoda 5 contra
//      Creta — esse número não existe em lugar nenhum, e inventar está fora.
//      Ou seja: o trabalho todo não entregaria a flexibilidade que prometia.
//
//   2. Transcrever é digitar à mão a especificação do carro DOS OUTROS. Um
//      dígito errado vira uma afirmação falsa sobre o produto do concorrente,
//      dita por um vendedor com o cliente olhando. Hoje a folha é peça
//      assinada pela marca: se tiver erro, o erro é de quem fez.
//
// Quando a marca mandar ficha de concorrente EM DADO, promove-se para coluna
// de verdade no comparativo. Até lá, a folha pronta serve melhor.
//
// O PESO IMPORTA. Os PNG originais somavam 10 MB — o vendedor abre isto no
// salão, no 4G, com o cliente esperando. Em JPEG de 1080px somam 3,2 MB, e
// cada folha sai por volta de 330 KB. A tela carrega uma de cada vez.
import type { BrandId } from './brands';


// ---- O QUE DÁ PARA COMPARAR, E DE ONDE VEM ----

/**
 * OS ITENS DE EQUIPAMENTO, com o nome que a folha da marca usa.
 *
 * O `naoTem` de cada concorrente sai das folhas do Gerson — é a marca
 * afirmando o que o rival NÃO traz. Isso vale contra QUALQUER carro da casa,
 * não só o Jaecoo 5: se a folha diz que a Creta não tem câmera 540°, ela
 * continua não tendo quando o vendedor compara com o Omoda 5.
 *
 * É o que torna as outras quarenta folhas possíveis sem inventar nada: o lado
 * do concorrente é dado da marca, e o lado do nosso carro sai da ficha dele.
 */
export const ITENS: Record<string, string> = {
  'hibrido-pleno': 'Motor híbrido pleno',
  'turbo': 'Motor turbo com injeção direta',
  'teto': 'Teto panorâmico (Sky screen)',
  'porta-malas-eletrico': 'Porta-malas elétrico',
  'bancos-eletricos': 'Bancos dianteiros elétricos',
  'bancos-ventilados': 'Bancos dianteiros ventilados',
  'som-sony': 'Som premium Sony',
  'camera-540': 'Câmera 540°',
  'adas': 'Pacote ADAS',
  'ar-dual': 'Ar-condicionado dual zone',
  'sensor-chuva': 'Sensor de chuva',
  'farois-led': 'Faróis full LED',
  'sensores-estacionamento': 'Sensores de estacionamento',
  'karaoke': 'Sistema de karaokê',
  'partida-sem-botao': 'Partida sem botão',
};

export interface EspecConc {
  /** cv — SEMPRE da folha da marca, menos onde o comentário disser o contrário. */
  potencia?: number;
  malas?: number;      // litros
  eixos?: number;      // mm
  comp?: number;       // mm
  cem?: number;        // segundos
  autonomia?: number;  // km
  rodas?: number;      // polegadas
  multimidia?: number; // polegadas
  garantia?: number;   // anos
}

export interface Concorrente {
  id: string;
  /**
   * A MARCA DONA DA FOLHA. Sem este campo o conteúdo vale para TODAS as
   * empresas (ver isolamento em check-marcas.mjs) — e estas são peças da
   * Ramasa: apareceriam no app da Meraki e da Drogaria São Paulo, que é
   * entregar material de um cliente para outro.
   */
  brand: BrandId;
  /** Como o cliente chama o carro. */
  nome: string;
  /** A versão que a folha compara — sempre o top de linha dele. */
  versao: string;
  /** A folha, em public/comparativos. */
  arquivo: string;
  /** Os números dele. Vazio = não achei em fonte confiável; nunca estimado. */
  espec: EspecConc;
  /** O que a folha da marca mostra que ele NÃO traz (chaves de ITENS). */
  naoTem: string[];
  /** De onde vieram os campos que a folha não dá. */
  fonte?: string;
}

/**
 * OS NOMES SAEM DA FOLHA, LIDOS UM A UM — não da minha memória.
 *
 * Na primeira versão eu escrevi as versões de cabeça e errei quatro: o Corolla
 * Cross virou XRE em vez de XRX, o Renegade virou Willys em vez de Sahara
 * MHEV, o CS55 virou Plus em vez de PHEV, e o B10 saiu como "Omoda B10" —
 * trocando a MARCA de um concorrente pela marca da casa. Tudo isso foi ao ar
 * em 18/10 e ficou dois dias na mão do vendedor.
 *
 * Foi exatamente o risco que eu mesma tinha descrito ao recusar transcrever as
 * fichas dos concorrentes: digitar de cabeça a especificação do carro dos
 * outros. Caí nele no único campo que achei "simples demais para errar".
 *
 * Qualquer concorrente novo entra COPIANDO o cabeçalho da folha, com a folha
 * aberta do lado.
 */

/** Contra qual carro da casa estas folhas falam. */
export const CARRO_DAS_FOLHAS = 'jaecoo-5';

export const CONCORRENTES: Concorrente[] = [
  {
    id: 'creta', brand: 'ramasa',
    nome: 'Hyundai Creta', versao: 'Platinum',
    arquivo: '/comparativos/jaecoo-5-x-creta.jpg',
    espec: { potencia: 120, malas: 422, eixos: 2610, comp: 4330, cem: 11.6, rodas: 17 },
    naoTem: ['hibrido-pleno', 'farois-led', 'porta-malas-eletrico', 'bancos-eletricos', 'som-sony', 'camera-540', 'sensor-chuva'],
    fonte: 'dimensões e 0 a 100: Webmotors e iCarros, 20/10/2026',
  },
  {
    id: 'compass', brand: 'ramasa',
    nome: 'Jeep Compass', versao: 'Longitude MHEV',
    arquivo: '/comparativos/jaecoo-5-x-compass.jpg',
    espec: { potencia: 176, malas: 475, eixos: 2636, comp: 4404, cem: 9.3, multimidia: 10.1 },
    naoTem: ['hibrido-pleno', 'teto', 'porta-malas-eletrico', 'bancos-ventilados', 'camera-540', 'adas'],
    fonte: 'dimensões e 0 a 100 (etanol): carro.blog.br e Mobiauto, 20/10/2026',
  },
  {
    id: 'corolla-cross', brand: 'ramasa',
    nome: 'Toyota Corolla Cross', versao: 'XRX',
    arquivo: '/comparativos/jaecoo-5-x-corolla-cross.jpg',
    espec: { potencia: 122, malas: 440, eixos: 2640, comp: 4460, cem: 13.0, multimidia: 10.0 },
    naoTem: ['turbo', 'teto', 'bancos-eletricos', 'som-sony'],
    fonte: 'dimensões e 0 a 100: carro.blog.br, 20/10/2026 — porta-malas só em texto corrido, conferir',
  },
  {
    id: 'hr-v', brand: 'ramasa',
    nome: 'Honda HR-V', versao: 'EXL',
    arquivo: '/comparativos/jaecoo-5-x-hr-v.jpg',
    espec: { potencia: 126, malas: 354, eixos: 2610, comp: 4346, rodas: 17, multimidia: 8.0 },
    naoTem: ['hibrido-pleno', 'turbo', 'teto', 'porta-malas-eletrico', 'bancos-ventilados', 'som-sony', 'ar-dual', 'camera-540'],
    fonte: 'dimensões: Webmotors e autocosmos, 20/10/2026',
  },
  {
    id: 't-cross', brand: 'ramasa',
    nome: 'VW T-Cross', versao: 'Highline',
    arquivo: '/comparativos/jaecoo-5-x-t-cross.jpg',
    espec: { potencia: 150, malas: 420, eixos: 2651, comp: 4199, cem: 8.7, rodas: 17 },
    naoTem: ['hibrido-pleno', 'porta-malas-eletrico', 'teto', 'adas', 'bancos-ventilados', 'som-sony', 'camera-540'],
    fonte: 'dimensões e 0 a 100: Garagem360 e carro.blog.br, 20/10/2026',
  },
  {
    id: 'renegade', brand: 'ramasa',
    nome: 'Jeep Renegade', versao: 'Sahara MHEV',
    arquivo: '/comparativos/jaecoo-5-x-renegade.jpg',
    espec: { potencia: 176, multimidia: 8.4 },
    naoTem: ['hibrido-pleno', 'porta-malas-eletrico', 'bancos-eletricos', 'bancos-ventilados', 'som-sony', 'adas', 'camera-540'],
    fonte: 'só a potência se confirmou em fonte brasileira — o 1º resultado era o Renegade argentino, de 130 cv',
  },
  {
    id: 'atto-2', brand: 'ramasa',
    nome: 'BYD Atto 2', versao: 'GS',
    arquivo: '/comparativos/jaecoo-5-x-atto-2.jpg',
    espec: { potencia: 197, malas: 455, eixos: 2620, comp: 4330, cem: 8.5, autonomia: 1045, rodas: 17, multimidia: 12.8, garantia: 6 },
    naoTem: ['turbo', 'porta-malas-eletrico', 'bancos-ventilados', 'som-sony', 'camera-540'],
    fonte: 'dimensões, 0 a 100 e autonomia: CanalVE, Itatiaia e autodata, 20/10/2026',
  },
  {
    id: 'yaris-cross', brand: 'ramasa',
    nome: 'Toyota Yaris Cross', versao: 'XRX HEV',
    arquivo: '/comparativos/jaecoo-5-x-yaris-cross.jpg',
    espec: { potencia: 111, malas: 400, eixos: 2620, comp: 4310, cem: 14.0, multimidia: 10.0 },
    naoTem: ['turbo', 'bancos-ventilados', 'som-sony', 'ar-dual', 'camera-540', 'adas'],
    fonte: 'dimensões e 0 a 100: Vrum, Garagem360 e fichacompleta, 20/10/2026',
  },
  {
    id: 'cs55', brand: 'ramasa',
    nome: 'Changan CS55', versao: 'PHEV',
    arquivo: '/comparativos/jaecoo-5-x-cs55.jpg',
    espec: { potencia: 286, malas: 525, autonomia: 1200 },
    naoTem: ['partida-sem-botao', 'sensores-estacionamento', 'karaoke'],
    fonte: 'a folha da marca NÃO traz potência deste — os 286 cv vieram de Canaltech, Autopapo e DGABC (20/10/2026) e ainda não foram confirmados',
  },
  {
    id: 'b10', brand: 'ramasa',
    nome: 'Leapmotor B10', versao: 'REEV',
    arquivo: '/comparativos/jaecoo-5-x-b10.jpg',
    espec: { potencia: 218, malas: 350, autonomia: 900, garantia: 6 },
    naoTem: ['turbo', 'ar-dual', 'sensores-estacionamento', 'som-sony', 'karaoke'],
    fonte: 'potência e porta-malas: folha da marca. Autonomia: Garagem360 e autoentusiastas, 20/10/2026',
  },
];

export function concorrentePorId(id?: string | null): Concorrente | null {
  return CONCORRENTES.find((c) => c.id === id) || null;
}

/** As folhas DESTA marca — nunca as de outra. */
export function concorrentesDaMarca(brand: BrandId): Concorrente[] {
  return CONCORRENTES.filter((c) => c.brand === brand);
}
