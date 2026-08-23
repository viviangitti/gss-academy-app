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
// SÃO DUAS LISTAS, E A DIFERENÇA IMPORTA:
//
//   'fabrica' — peça original Omoda|Jaecoo, pedida por PN no sistema. Tem prazo
//               de entrega e entra na garantia do carro.
//   'loja'    — serviço que a Ramasa instala aqui dentro (película, PPF,
//               vitrificação, som). Sai no mesmo dia, não depende de pedido —
//               e é onde fica a margem da concessionária.
//
// Um vendedor que promete "sai hoje" numa peça de fábrica cria problema na
// entrega; um que manda o cliente colocar película na rua entrega a margem pro
// vizinho. Por isso a origem aparece na tela, e não só no código.
//
// Fonte: comunicados de pós-vendas PV050/2026 e PV033/2026 da Omoda|Jaecoo
// (fábrica) e a tabela de acessórios da Ramasa por versão (loja).
// Os preços são o PÚBLICO SUGERIDO. Custo de reposição e margem estão nos
// comunicados e NÃO entram no app: isso é informação da gerência, e vendedor
// com custo na tela acaba negociando o desconto que não é dele pra dar.
import type { BrandId } from './brands';

export type OrigemAcessorio = 'fabrica' | 'loja';

export interface Acessorio {
  id: string;
  brand: BrandId;
  nome: string;
  /** Peça de fábrica (pedida por PN) ou serviço instalado na própria loja. */
  origem: OrigemAcessorio;
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
  /** Foto do item. Acessório sem foto ninguém oferece: não dá pra imaginar. */
  foto?: string;
}

const JAECOO = 'jaecoo-7';
const O5 = 'omoda-5-shs-h';
const O7 = 'omoda-7-shs-p';
const E5 = 'omoda-e5';

export const ACESSORIOS: Acessorio[] = [
  {
    id: 'tapete-carpete-premium',
    brand: 'ramasa',
    origem: 'fabrica',
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
    foto: '/acessorios/tapete-carpete-premium.jpg',
  },
  {
    id: 'estribo-iluminado',
    brand: 'ramasa',
    origem: 'fabrica',
    nome: 'Estribo iluminado retrátil',
    beneficio: 'Recolhe sozinho quando o carro anda e acende quando a porta abre.',
    comoOferecer:
      'É o acessório que mais impressiona — e o de maior valor. Mostre funcionando: abra a porta e deixe o cliente ver o estribo sair e acender. Combina com quem tem criança, idoso em casa ou é baixinho.',
    preco: 9000,
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Jaecoo 7', pn: '08CT1W20T1EJPHN001' }],
    foto: '/acessorios/estribo-iluminado.jpg',
  },
  {
    id: 'rack-teto',
    brand: 'ramasa',
    origem: 'fabrica',
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
    foto: '/acessorios/rack-teto.jpg',
  },
  {
    id: 'bagageiro',
    brand: 'ramasa',
    origem: 'fabrica',
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
    foto: '/acessorios/bagageiro.jpg',
  },
  {
    id: 'rack-bike',
    brand: 'ramasa',
    origem: 'fabrica',
    nome: 'Rack de bike de teto',
    beneficio: 'A bicicleta vai junto sem sujar nem riscar o porta-malas.',
    comoOferecer:
      'Repare se ele fala de trilha, ciclismo ou fim de semana fora. É acessório de quem já tem a bike — não tente criar a vontade, só resolva o problema de levar.',
    preco: 1490,
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Linha Jaecoo', pn: '08Z01S2023TYY003' }],
    observacao: 'Precisa do rack de teto instalado.',
    foto: '/acessorios/rack-bike.jpg',
  },
  {
    id: 'modification-kit-j7',
    brand: 'ramasa',
    origem: 'fabrica',
    nome: 'Modification Kit — Jaecoo 7',
    beneficio: 'Transforma o visual do carro: rack off-road, bolsa lateral com chave e escada.',
    comoOferecer:
      'As três peças são integradas e instaladas juntas — não venda uma só. É o kit que muda a cara do carro no estacionamento, então mostre no carro exposto, nunca em foto. E tem uma alavanca forte: a marca mantém taxa zero em 24, 36 e 60 vezes para incluir o kit no financiamento do Jaecoo 7 (confirme se a condição está valendo).',
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Jaecoo 7', pn: 'ver comunicado PV033/2026' }],
    observacao: 'Preço inclui 4 horas de instalação. Na tabela da loja as três peças aparecem separadas: barras R$ 15.175, bolsa R$ 6.300 e escada R$ 4.690. Confirme o valor vigente com a gerência.',
    foto: '/acessorios/modification-kit-j7.jpg',
  },
  // ------------------------------------------------------------------------
  // INSTALADOS NA LOJA — tabela Ramasa por versão.
  //
  // Aqui o vendedor não pede peça: ele agenda. Sai no mesmo dia da entrega e a
  // margem fica na casa. É a lista que mais fecha e a que menos se oferece,
  // porque ninguém decorou — então cada item abaixo carrega a frase que abre a
  // conversa, não só o preço.
  // ------------------------------------------------------------------------
  {
    id: 'pelicula-window-blue',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Película Window Blue + Premium',
    beneficio: 'Segura o calor antes de ele entrar — o ar-condicionado trabalha menos e o painel não resseca.',
    comoOferecer:
      'Este o cliente ia colocar de qualquer jeito, em algum lugar. A disputa não é se ele quer, é onde faz. O argumento é a garantia: instalada aqui não descola, não dá bolha e não briga com a garantia do carro. Ofereça junto da vitrificação — quem aceita proteger por fora aceita proteger por dentro.',
    preco: 1600,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'desbloqueio-multimidia',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Desbloqueio da multimídia (streaming box)',
    beneficio: 'Netflix, YouTube e Disney na tela central, com o carro parado.',
    comoOferecer:
      'É dos poucos que o cliente pede depois de ver. Deixe rodando na tela grande enquanto conversa. Fecha sozinho com quem tem criança ou passa tempo em fila de escola. Deixe claro que funciona com o carro parado — prometer o contrário vira reclamação na entrega.',
    preco: 2900,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'vitrificacao-carpro',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Vitrificação CarPro',
    beneficio: 'A pintura fica lisa, com brilho de vidro, e a sujeira não gruda.',
    comoOferecer:
      'Não explique: passe a mão no capô de um carro vitrificado no showroom e peça pro cliente passar também. A diferença se sente em dois segundos. O fechamento é pela revenda — pintura conservada é o que segura o preço na hora da troca.',
    preco: 1900,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'revestimento-assoalho',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Revestimento de assoalho + porta-malas',
    beneficio: 'Areia, barro e líquido derramado param antes de chegar no carpete original.',
    comoOferecer:
      'Três perguntas: tem criança, tem cachorro, vai pra praia? Quem responde sim pra duas já comprou. O número que fecha é o custo de trocar o carpete depois — é múltiplo disto aqui.',
    preco: 1700,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
    observacao: 'R$ 1.700 na linha Jaecoo e R$ 1.800 na linha Omoda.',
  },
  {
    id: 'engate-loja',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Engate',
    beneficio: 'Puxa carretinha, jet-ski ou suporte de bike sem furar nada na estrutura do carro.',
    comoOferecer:
      'Não é oferta, é pergunta de qualificação: "você puxa alguma coisa?". Quem tem barco, moto, quadriciclo ou reboque responde na hora — e quem não tem, encerra o assunto em um segundo. Vale nas duas direções.',
    preco: 1900,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [
      { modelo: 'Linha Jaecoo', pn: 'FR907' },
      { modelo: 'Linha Omoda', pn: 'FR916' },
    ],
  },
  {
    id: 'ppf-frontal',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'PPF frontal',
    beneficio: 'Uma película invisível no capô e no para-choque segura a pedra da estrada antes de ela lascar.',
    comoOferecer:
      'É o acessório de quem roda rodovia — pergunte a quilometragem que ele faz por mês. O argumento que convence: um retoque de capô custa quase o mesmo e nunca fica no tom exato. O PPF sai depois e a pintura está intacta embaixo.',
    preco: 7000,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'ppf-carro-todo',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'PPF carro todo',
    beneficio: 'O carro inteiro protegido — a pintura continua a de fábrica.',
    comoOferecer:
      'Não ofereça pra todo mundo: é pra quem levou a versão de cima, pagou à vista ou falou em guardar o carro. O caminho é a desvalorização — manter a pintura original é o que sustenta o valor na revenda. Se achar caro, ofereça o frontal.',
    preco: 17000,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'ppf-soleira-quina',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'PPF de soleira e quina',
    beneficio: 'Protege exatamente onde o carro descasca primeiro: a soleira do pé e a quina da porta.',
    comoOferecer:
      'A prova está no pátio: mostre a soleira riscada de um seminovo. É o degrau de entrada da linha de proteção — quando o cliente achar o PPF frontal caro, este resolve o arranhão mais comum por uma fração.',
    preco: 750,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'soleiras',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Soleiras',
    beneficio: 'Acaba o risco de sapato na entrada e o acabamento fica de série especial.',
    comoOferecer:
      'Quase nunca é recusado. O momento é a entrega, junto do tapete premium: os dois protegem a mesma área e somam pouco na parcela.',
    preco: 500,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'friso-porta',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Friso de porta',
    beneficio: 'Porta de estacionamento não marca mais a lateral.',
    comoOferecer:
      'Pergunte onde ele estaciona todo dia. Shopping, garagem de prédio e rua respondem sozinhos. É o seguro mais barato contra o amassado que ninguém assume.',
    preco: 700,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'bandeja-porta-malas',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Bandeja de porta-malas',
    beneficio: 'Compra derramada, mala de praia e caixa de ferramenta não sujam o porta-malas.',
    comoOferecer:
      'Mostre encaixada no carro exposto: é peça moldada pro modelo, não tapete cortado. Fecha fácil na sequência do revestimento de assoalho — mesma dor, mesmo cliente.',
    preco: 1100,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [{ modelo: 'Linha Omoda|Jaecoo', pn: '299090' }],
  },
  {
    id: 'ploter-teto',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Ploter de teto',
    beneficio: 'Teto preto — o carro ganha cara de versão especial.',
    comoOferecer:
      'É venda de gosto, não de necessidade, então mire em quem escolheu cor clara: o contraste é o que dá o efeito. Foto do antes e depois no mesmo modelo resolve a conversa.',
    preco: 2900,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'ppf-teto',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'PPF de teto',
    beneficio: 'O teto preto protegido — não desbota nem descasca no sol.',
    comoOferecer:
      'A hora certa é logo depois de fechar o ploter: "ficou ótimo, agora protege". Sem ele o sol come o vinil, e refazer custa mais que proteger.',
    preco: 3990,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'caixa-jbl',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Caixa JBL',
    beneficio: 'O som ganha grave de verdade sem mexer na fiação original.',
    comoOferecer:
      'O cliente se identifica sozinho: quem sobe o volume no test drive é quem compra. Deixe tocando quando ele entrar no carro e espere a pergunta.',
    preco: 2000,
    aplicaEm: [JAECOO, O5, O7, E5],
    codigos: [],
  },
  {
    id: 'antifurto-rodas',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Antifurto de rodas',
    beneficio: 'Só a sua chave tira as rodas de liga.',
    comoOferecer:
      'Diga quanto custa uma roda de 19 polegadas e deixe o silêncio trabalhar. É o item mais barato da lista protegendo a peça mais cara que fica do lado de fora do carro.',
    preco: 650,
    aplicaEm: [JAECOO],
    codigos: [],
  },
  {
    id: 'carregador-inducao-loja',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Carregador por indução',
    beneficio: 'O celular carrega apoiado no console, sem cabo.',
    comoOferecer:
      'Antes de oferecer, confira a versão: no line-up MY27 o carregador por indução já vem de série desde a ELITE. Vale pra quem está levando um ano-modelo anterior que saiu sem ele.',
    preco: 1700,
    aplicaEm: [JAECOO],
    codigos: [],
    observacao: 'Consta na tabela da loja para a versão LUXURY. Confirme o ano-modelo antes de oferecer — o MY27 já sai com o item de série.',
  },
  {
    id: 'telas-encosto-cabeca',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Telas de encosto de cabeça 9"',
    beneficio: 'Cada criança atrás com a própria tela.',
    comoOferecer:
      'O preço é por unidade — diga isso ANTES, não na hora de fechar: família com dois filhos leva duas. A pergunta que abre é quanto tempo dura o trajeto até a casa da avó.',
    preco: 1700,
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Jaecoo 7', pn: '3330' }],
    observacao: 'Valor por unidade.',
  },
  {
    id: 'led-interno',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'LED interno',
    beneficio: 'A luz de dentro deixa de ser amarelada e fraca.',
    comoOferecer:
      'Acenda a original e a nova lado a lado no carro exposto. É diferença que se vê em dois segundos e não se explica em dois minutos.',
    preco: 1499,
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Jaecoo 7', pn: '4209' }],
  },
  {
    id: 'barras-teto-offroad',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Barras de teto off-road',
    beneficio: 'A estrutura que muda a silhueta do carro e serve de base pra carga.',
    comoOferecer:
      'É a peça central do visual off-road do Jaecoo 7 e faz par com a bolsa e a escada — mostre as três no carro exposto, nunca em foto. Vale lembrar a alavanca: a marca vem mantendo taxa zero em 24, 36 e 60 vezes pra embutir o conjunto no financiamento.',
    preco: 15175,
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Jaecoo 7', pn: 'C00200300023' }],
  },
  {
    id: 'bolsa-lateral',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Bolsa lateral com chave',
    beneficio: 'Um compartimento trancado do lado de fora — bota o que está sujo e não entra no carro.',
    comoOferecer:
      'Fala com quem faz trilha, pesca ou camping: a bota enlameada e o equipamento molhado ficam do lado de fora. Vende junto das barras, que são a base dela.',
    preco: 6300,
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Jaecoo 7', pn: 'C00200300139' }],
  },
  {
    id: 'escada-lateral',
    brand: 'ramasa',
    origem: 'loja',
    nome: 'Escada lateral',
    beneficio: 'Dá pra subir no teto pra amarrar carga — e o carro fica com postura de aventura.',
    comoOferecer:
      'Fecha o conjunto off-road. Quem levou barras e bolsa quase sempre leva a escada, porque sem ela o teto não é acessível de verdade. Ofereça as três de uma vez, não uma a uma.',
    preco: 4690,
    aplicaEm: [JAECOO],
    codigos: [{ modelo: 'Jaecoo 7', pn: 'C00200300024' }],
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

/**
 * O rótulo de cada origem, com a frase que evita a promessa errada na entrega.
 * Fica aqui, junto do dado, pra não haver duas versões do mesmo texto na tela.
 */
export const ORIGENS: Record<OrigemAcessorio, { label: string; nota: string }> = {
  fabrica: {
    label: 'Peça original de fábrica',
    nota: 'Pedida por código no sistema. Tem prazo de entrega e entra na garantia do carro.',
  },
  loja: {
    label: 'Instalado aqui na loja',
    nota: 'Serviço da Ramasa: agenda junto com a entrega e sai no mesmo dia.',
  },
};

export function acessoriosPorOrigem(brand: BrandId, origem: OrigemAcessorio): Acessorio[] {
  return acessoriosDaMarca(brand).filter((a) => a.origem === origem);
}
