// O COMPARATIVO ENTRE OS CARROS DA CASA.
//
// A Mariana pediu (13/10/2026) comparar quantos modelos quiser de uma vez, e a
// Vivian pediu um resumo de persona no fim da ficha. É a mesma informação, e
// por isso mora num arquivo só.
//
// DE ONDE VEM CADA COISA — e por que não é tudo igual:
//
// Os NÚMEROS saem da ficha do próprio carro, derivados na hora. Não copiei os
// valores para cá de propósito: ficha e comparativo têm que dizer a mesma
// coisa, e número copiado é número que um dia diverge. Se a gerência corrigir
// o porta-malas na ficha, o comparativo muda junto, sem ninguém lembrar.
//
// As FRASES CURTAS ("Híbrido", "Não precisa") são escritas aqui, porque a
// ficha é prosa e prosa não cabe numa coluna de 96px: o Omoda 5 tem escrito
// "Híbrido autorrecarregável (HEV) — NÃO carrega na tomada. O treinamento
// insiste nisso". No comparativo o que importa é "Híbrido"; o texto inteiro
// continua na ficha.
//
// Os TRÊS ATRIBUTOS não são adjetivo meu. São a resposta do time à pergunta "o
// que fecha este carro", no roteiro que a Ramasa recebeu em 03/09 — que por
// sua vez saiu de uma pesquisa com 16 vendedores e 192 respostas. Se eu
// escrevesse "sofisticado", a primeira pergunta justa seria "quem disse?".
import { allProducts } from './store';
import { visibleProducts, type Product } from './products';
import type { BrandId } from './brands';

export interface Comparavel {
  id: string;
  nome: string;
  /** Nome curto para o cabeçalho da coluna: "Omoda 5" em vez de "Omoda 5 SHS-H". */
  curto: string;
  versao: string;
  valores: Record<string, string>;
  /**
   * Os três pontos que o time diz que fecham o carro.
   *
   * Vazio quando o carro não tem roteiro — hoje só o Jaecoo 5, que entrou na
   * linha depois dos quatro roteiros de 03/09. Deixar em branco é de
   * propósito: inventar três adjetivos para ele seria exatamente o que o resto
   * deste arquivo existe para evitar.
   */
  atributos: string[];
}

export interface LinhaComp {
  chave: string;
  rotulo: string;
  /** A linha que de fato separa os carros vem destacada e em primeiro. */
  decide?: boolean;
}

/**
 * AS LINHAS DO COMPARATIVO, nesta ordem.
 *
 * "Carrega na tomada?" abre porque é a pergunta que realmente separa os cinco
 * — e porque "não tenho onde carregar o carro" é a segunda objeção mais
 * consultada no app (11 consultas, 9 vendedores), atrás só de "nunca ouvi
 * falar dessa marca".
 *
 * AUTONOMIA FICOU DE FORA, e isso é escolha, não esquecimento: o rótulo muda
 * de carro para carro (uns têm "Autonomia", outro "Autonomia total", outro
 * "Autonomia só no elétrico") e num deles o valor é texto de campanha —
 * "RECORDE de 1.306 km com um tanque, de São Paulo a Vitória". Comparar isso
 * com "345 km (Inmetro)" não é comparar. Volta no dia em que a Ramasa disser
 * qual número vale para cada carro.
 */
export const LINHAS: LinhaComp[] = [
  { chave: 'tomada', rotulo: 'Carrega na tomada?', decide: true },
  { chave: 'tipo', rotulo: 'O que é' },
  { chave: 'malas', rotulo: 'Porta-malas' },
  { chave: 'eixos', rotulo: 'Entre-eixos' },
  { chave: 'comp', rotulo: 'Comprimento' },
  { chave: 'cem', rotulo: '0 a 100' },
  { chave: 'autonomia', rotulo: 'Autonomia' },
];

/** O que é prosa na ficha e precisa de versão curta para caber na coluna. */
const CURTO: Record<string, { curto: string; tomada: string; tipo: string; atributos: string[] }> = {
  'jaecoo-7': {
    curto: 'Jaecoo 7', tomada: 'Opcional', tipo: 'Plug-in',
    atributos: ['Autonomia', 'Potência', 'Design'],
  },
  'jaecoo-5': {
    curto: 'Jaecoo 5', tomada: 'Não precisa', tipo: 'Híbrido',
    atributos: [], // sem roteiro — ver o comentário em `atributos`
  },
  'omoda-5-shs-h': {
    curto: 'Omoda 5', tomada: 'Não precisa', tipo: 'Híbrido',
    atributos: ['Autonomia', 'Tecnologia', 'Sem tomada'],
  },
  'omoda-e5': {
    curto: 'Omoda E5', tomada: 'Obrigatório', tipo: 'Elétrico',
    atributos: ['Autonomia', 'Custo-benefício', 'Design'],
  },
  'omoda-7-shs-p': {
    curto: 'Omoda 7', tomada: 'Opcional', tipo: 'Plug-in',
    atributos: ['Acabamento', 'Espaço', 'Autonomia'],
  },
};

const linhaFicha = (p: Product, comeca: string): string => {
  const l = (p.ficha || []).find((f) => String(f.label).toLowerCase().startsWith(comeca.toLowerCase()));
  return l ? String(l.value) : '';
};

// Cada um destes corta o número e joga fora o resto da frase. O "resto" é
// informação boa — "mais de 1.300 L com os bancos rebatidos" vende —, mas é
// informação da ficha, não da coluna de 96px.
const soLitros = (v: string) => {
  const n = (v.match(/[\d.]+/) || [''])[0];
  return n ? `${n} L` : '';
};
const soMm = (v: string) => (v.match(/[\d.]+\s*mm/) || [''])[0].replace(/\s+/g, ' ').trim();
const soSegundos = (v: string) => {
  const n = (v.match(/[\d,]+/) || [''])[0];
  return n ? `${n} s` : '';
};

/**
 * A AUTONOMIA — e o recorde que NÃO pode entrar aqui.
 *
 * Os cinco têm linha de "Autonomia" na ficha, mas elas não falam a mesma
 * língua. A do Omoda 5 é "RECORDE de 1.306 km com um tanque, de São Paulo a
 * Vitória, na maratona da marca" — número de condução econômica, não de
 * terça-feira. Puxado cru para a coluna, o Omoda 5 apareceria como o que vai
 * mais longe dos cinco, na frente do Jaecoo 7, e o vendedor repetiria isso
 * para o cliente. O próprio roteiro da marca avisa: "diga que é recorde, não
 * o número de todo dia".
 *
 * Então recorde não entra. Fica vazio, e quem quiser o número abre a ficha,
 * onde ele está inteiro e com o contexto que o explica.
 */
const soAutonomia = (v: string) => {
  if (/recorde|maratona/i.test(v)) return '';
  const m = v.match(/(até\s*)?([\d.]+)\s*km/i);
  if (!m) return '';
  return `${m[1] ? 'até ' : ''}${m[2]} km`;
};

/** A versão curta do carro, pronta para a tabela. Null = não dá para comparar. */
export function comparavel(p: Product): Comparavel | null {
  const fixo = CURTO[p.id];
  if (!fixo) return null;
  const valores: Record<string, string> = {
    tomada: fixo.tomada,
    tipo: fixo.tipo,
    malas: soLitros(linhaFicha(p, 'Porta-malas')),
    eixos: soMm(linhaFicha(p, 'Entre-eixos')),
    comp: soMm(linhaFicha(p, 'Dimensões')),
    cem: soSegundos(linhaFicha(p, '0 a 100')),
    // "AUTONOMIA TOTAL" PRIMEIRO, e isso não é detalhe de busca.
    //
    // Os plug-in têm DUAS linhas de autonomia: "só no elétrico" (79 km no
    // Jaecoo 7, 60 no Omoda 7) e "total" (até 1.200 km nos dois). Pegando a
    // primeira que começa com "Autonomia" vinha a do elétrico — e aí o Jaecoo
    // 7 aparecia com 79 km ao lado dos 791 km do Jaecoo 5, como se fosse dez
    // vezes pior. É o número certo lido na coluna errada.
    autonomia: soAutonomia(linhaFicha(p, 'Autonomia total') || linhaFicha(p, 'Autonomia')),
  };
  return {
    id: p.id,
    nome: p.name,
    curto: fixo.curto,
    // "Omoda 5 SHS-H" menos "Omoda 5" sobra "SHS-H", que é o que vai no
    // subtítulo da coluna. Sem isso eu teria o nome escrito duas vezes.
    versao: p.name.replace(fixo.curto, '').trim() || '—',
    valores,
    atributos: fixo.atributos,
  };
}

/** Todos os carros da marca que dá para comparar, respeitando o papel de quem olha. */
export function comparaveisDaMarca(brand: BrandId, role?: string): Comparavel[] {
  return visibleProducts(allProducts().filter((p) => p.brand === brand), role)
    .map(comparavel)
    .filter((c): c is Comparavel => !!c);
}

/** Dá para comparar nesta marca? É o que decide se o botão aparece na ficha. */
export function temComparativo(brand: BrandId, role?: string): boolean {
  return comparaveisDaMarca(brand, role).length >= 2;
}
