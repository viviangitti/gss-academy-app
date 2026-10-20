// A FOLHA GERADA — qualquer carro da casa contra qualquer concorrente.
//
// O Gerson mandou dez folhas, todas do Jaecoo 5. Faltavam quarenta: os outros
// quatro carros contra os mesmos dez rivais. Desenhar quarenta peças à mão não
// ia acontecer, e esperar por elas deixava o vendedor sem resposta.
//
// DE ONDE VEM CADA LADO, e por que isto não é inventar número:
//
//   o concorrente  → `naoTem` sai das folhas da marca. Se a folha diz que a
//                    Creta não tem câmera 540°, ela não tem — e continua não
//                    tendo quando o vendedor compara com o Omoda 5. É a mesma
//                    afirmação, contra outro carro nosso.
//   o nosso carro  → sai da ficha dele, que a gerência mantém.
//   os números     → potência vem da folha; dimensões e 0 a 100 do
//                    levantamento, com a origem impressa no rodapé da peça.
//
// A REGRA DE O QUE ENTRA: só linha em que o NOSSO carro ganha. Foi decisão da
// Vivian (20/10), e é como as folhas da marca já funcionam.
import type { Product } from './products';
import { ITENS, type Concorrente } from './concorrentes';

export interface LinhaFolha {
  rotulo: string;
  nosso: string;
  deles: string;
  /** Item de equipamento mostra bolinha e traço; número mostra o valor. */
  tipo: 'item' | 'numero';
}

/** O que a ficha do nosso carro diz que ele tem. */
const TEM: Record<string, RegExp> = {
  'som-sony': /sony/i,
  'camera-540': /c[âa]mera\s*540|540[°º]/i,
  'adas': /adas/i,
  'bancos-ventilados': /ventilad/i,
  'porta-malas-eletrico': /porta-malas el[ée]trico|tampa el[ée]trica/i,
  'teto': /panor[âa]mic|sky\s*screen|teto solar/i,
  'farois-led': /full led|far[óo]is led/i,
  'ar-dual': /dual zone|bizona|duas zonas/i,
  'sensor-chuva': /sensor de chuva/i,
  'hibrido-pleno': /h[íi]brido pleno|autorrecarreg|\bSHS\b|\bHEV\b/i,
  'turbo': /turbo/i,
  'bancos-eletricos': /bancos? diant[^.]*el[ée]tric/i,
  'sensores-estacionamento': /sensor(es)? (de )?estacionamento|sensores traseiros/i,
  'karaoke': /karaok/i,
  'partida-sem-botao': /contactless|partida sem bot/i,
};

const fichaInteira = (p: Product): string =>
  (p.ficha || []).map((l) => `${l.label} ${l.value}`).join(' · ');

const num = (texto: string, re: RegExp): number | undefined => {
  const m = texto.match(re);
  if (!m) return undefined;
  const n = Number(String(m[1]).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
};

/** Os números do nosso carro, lidos da ficha — nunca copiados para cá. */
export function numerosDoNosso(p: Product) {
  const f = fichaInteira(p);
  const linha = (rot: string) => (p.ficha || []).find((l) => String(l.label).toLowerCase().startsWith(rot.toLowerCase()))?.value || '';
  return {
    potencia: num(linha('Potência combinada'), /([\d.,]+)/),
    malas: num(linha('Porta-malas'), /([\d.,]+)/),
    eixos: num(linha('Entre-eixos'), /([\d.,]+)/),
    comp: num(linha('Dimensões'), /([\d.,]+)/),
    cem: num(linha('0 a 100'), /([\d.,]+)/),
    autonomia: /recorde|maratona/i.test(linha('Autonomia')) ? undefined : num(linha('Autonomia total') || linha('Autonomia'), /([\d.,]+)/),
    rodas: num(linha('Rodas'), /(\d+)"/),
    ficha: f,
  };
}

/**
 * MARGEM MÍNIMA PARA A LINHA ENTRAR.
 *
 * O Jaecoo 5 tem 2.620 mm de entre-eixos e a Creta 2.610: ganha por dez
 * milímetros. Tecnicamente é vitória; numa folha de venda enfraquece o resto,
 * porque o cliente lê "2.620 contra 2.610" e conclui que é a mesma coisa — e
 * passa a desconfiar das linhas que de fato importam. Abaixo de 3% a linha
 * não entra.
 */
const MARGEM = 0.03;
const ganhaPor = (nosso?: number, deles?: number, menorEhMelhor = false): boolean => {
  if (nosso == null || deles == null || deles === 0) return false;
  const dif = menorEhMelhor ? (deles - nosso) / deles : (nosso - deles) / deles;
  return dif >= MARGEM;
};

const NUMEROS: { chave: keyof ReturnType<typeof numerosDoNosso>; rotulo: string; un: string; menor?: boolean }[] = [
  { chave: 'potencia', rotulo: 'Potência', un: ' cv' },
  { chave: 'cem', rotulo: '0 a 100 km/h', un: ' s', menor: true },
  { chave: 'malas', rotulo: 'Porta-malas', un: ' L' },
  { chave: 'comp', rotulo: 'Comprimento', un: ' mm' },
  { chave: 'eixos', rotulo: 'Entre-eixos', un: ' mm' },
  { chave: 'autonomia', rotulo: 'Autonomia', un: ' km' },
  { chave: 'rodas', rotulo: 'Rodas de liga leve', un: '"' },
];

const br = (n: number, un: string) =>
  `${n >= 1000 ? n.toLocaleString('pt-BR') : String(n).replace('.', ',')}${un}`;

/** As linhas da folha: só onde o NOSSO ganha, equipamento primeiro. */
export function linhasDaFolha(p: Product, c: Concorrente): LinhaFolha[] {
  const n = numerosDoNosso(p);
  const itens: LinhaFolha[] = c.naoTem
    .filter((k) => TEM[k]?.test(n.ficha))
    .map((k) => ({ rotulo: ITENS[k] || k, nosso: '●', deles: '–', tipo: 'item' as const }));

  const numeros: LinhaFolha[] = NUMEROS
    .filter(({ chave, menor }) => ganhaPor(n[chave] as number, c.espec[chave as keyof typeof c.espec] as number, menor))
    .map(({ chave, rotulo, un }) => ({
      rotulo,
      nosso: br(n[chave] as number, un),
      deles: br(c.espec[chave as keyof typeof c.espec] as number, un),
      tipo: 'numero' as const,
    }));

  // Equipamento antes de número: o "tem / não tem" decide mais rápido na mão
  // do vendedor que uma diferença de milímetros.
  return [...itens, ...numeros];
}
