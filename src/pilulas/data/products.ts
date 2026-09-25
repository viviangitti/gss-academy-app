// Pílulas de Produto — base de conteúdo
// Cada produto vira uma "pílula": conteúdo curto, focado em BENEFÍCIO,
// de uso duplo (treina a vendedora + ela compartilha com a cliente).
//
import { Dumbbell, Pill, Wind, Sparkles, Flower2, Car, Zap, Wrench, Motorbike, type LucideIcon } from 'lucide-react';
import type { BrandId } from './brands';
import type { Audience } from '../AuthContext';
//
// Regra de ouro (compliance ANVISA p/ suplementos): benefício sempre no
// enquadramento "auxilia / contribui / ajuda a", NUNCA "cura / trata / emagrece".
// Para MEDICAMENTOS (ex.: acetilcisteína, expectorantes): copy factual, sem
// promessa, sempre remetendo à bula/rótulo e à orientação profissional.

// Categorias dos dois verticais. As de saúde vieram primeiro; 'suv',
// 'eletrificado' e 'acessorio' são do automotivo. O catálogo só mostra a
// categoria que tem produto da marca aberta, então nenhuma marca vê a
// categoria da outra.
//
// No automotivo o catálogo separa por MARCA (a Ramasa vende duas: Jaecoo e
// Omoda — e é assim que o showroom pensa e que o cliente pergunta) e mais uma
// parte de ACESSÓRIOS (engate, película, som, proteção), que é onde a
// concessionária ganha margem e o vendedor mais esquece de oferecer.
export type Category = 'performance' | 'capsulas' | 'respiratorio' | 'cosmeticos' | 'perfumaria' | 'jaecoo' | 'omoda' | 'royal' | 'acessorio';

export interface Objection {
  trigger: string; // o que a cliente fala
  answer: string; // resposta pronta da vendedora
}

export interface Scene {
  t: string; // marcação de tempo (ex.: "0-3s")
  label: string; // o que mostrar na tela
  line: string; // o que falar
}

// Ficha técnica — consulta rápida no balcão ("o que tem nisso?", "quantos vem?",
// "dura quanto tempo?"). Fatos secos, sem discurso de venda.
export interface FichaRow {
  label: string;
  value: string;
}

// NÍVEL — a profundidade que faltava, sem virar curso.
//
// Trinta segundos não formam ninguém; uma aula de 20 minutos ninguém termina.
// A saída é o mesmo formato curto, em camadas: o nível 1 é o que a pessoa
// precisa HOJE pra atender; o 2 é a comparação com o concorrente; o 3 é a
// negociação difícil. Cada um continua com menos de um minuto, e o seguinte só
// abre depois do quiz — quem não domina o básico não avança.
export interface Nivel {
  titulo: string;   // ex.: "Contra o concorrente"
  foco: string;     // o que a pessoa sai sabendo
  storyboard: Scene[];
}

/**
 * A CHAVE DO VÍDEO DE UM NÍVEL.
 *
 * Cada carro tem seis níveis, com seis roteiros diferentes — e até aqui tinha
 * UM lugar só pra vídeo. Quem subisse o episódio "Contra o concorrente" via
 * ele tocar nos seis, inclusive no nível 1, que fala de outra coisa.
 *
 * O nível 1 continua usando a chave do produto: é o vídeo padrão, o mesmo que
 * já existia e que o vídeo por público sobrescreve. Do 2 em diante, chave
 * própria — mesma ideia do `av:` dos públicos.
 */
export function nivelVideoKey(productId: string, n: number): string {
  return n <= 1 ? productId : `nv:${productId}:${n}`;
}

/** Quantos níveis o produto tem. O 1 é o storyboard; o resto vem de `niveis`. */
export function totalDeNiveis(p: Product): number {
  return 1 + (p.niveis?.length || 0);
}

/** O nome do nível na tela do gestor: "Nível 3 — Contra o concorrente". */
export function nivelLabel(p: Product, n: number): string {
  const t = n === 1 ? 'O essencial' : p.niveis?.[n - 2]?.titulo;
  return t ? `Nível ${n} — ${t}` : `Nível ${n}`;
}

/**
 * VERSÃO DO MODELO — o que muda de uma pra outra.
 *
 * Existe porque o carro não é um só. O Jaecoo 7 tem três versões e a diferença
 * entre a de entrada e a de topo é head-up display, som Sony, dashcam e um
 * pacote inteiro de assistência. Vendedor que decorou a ficha da versão de cima
 * e mostra a de entrada promete o que o cliente não vai encontrar na entrega —
 * e aí a conta não chega no showroom, chega no pós-vendas.
 *
 * A lista é CUMULATIVA de propósito: cada versão só carrega o que ELA acrescenta,
 * e `herda` diz de onde vem o resto. É como a fábrica publica e é como o
 * vendedor precisa falar — "tudo da Luxury, mais isso aqui" fecha mais rápido
 * que repetir trinta itens.
 */
export interface Versao {
  nome: string;
  /** Uma linha: pra que cliente essa versão é. */
  paraQuem: string;
  /** Nome da versão de baixo, quando esta herda tudo dela. */
  herda?: string;
  /** O que ESTA versão traz a mais (ou tudo, quando é a de entrada). */
  vemCom: string[];
}

export interface Product {
  id: string;
  brand: BrandId;
  name: string;
  line?: string; // linha do produto (ex.: 'glpen') — usado p/ liberar catálogo por papel
  // Variações do MESMO produto (ex.: Ômega 3, Ômega 3 Plus, Ômega 3 Mini) dividem
  // a mesma family. O quiz nunca usa uma como resposta errada da outra — os
  // benefícios são praticamente os mesmos, e a pergunta ficava sem resposta errada.
  family?: string;
  category: Category;
  tagline: string; // 1 linha do que é
  hook: string; // gancho — a dor/desejo da cliente
  whatItIs: string; // o que é, em 1 frase
  benefits: string[]; // 3 a 4 benefícios (compliance-safe)
  howToUse: string;
  forWho: string;
  salesLine: string; // frase de venda + CTA
  objections: Objection[];
  compliance?: string; // aviso de enquadramento (suplementos)
  durationSec: number;
  gradient: [string, string]; // capa da "reel"
  storyboard: Scene[]; // roteiro do vídeo de 30s — é o NÍVEL 1
  /** Níveis 2 em diante. O nível 1 é o `storyboard` acima. */
  niveis?: Nivel[];
  videoUrl?: string; // MP4 real da pílula (quando o gestor sobe um vídeo)
  audienceVideos?: Partial<Record<Audience, string>>; // MP4 pronto POR PÚBLICO (bundled em /public/videos) — ex.: vídeos da Mari
  instagramUrl?: string; // link de um reel/post público do IG — prova social (só o gestor cadastra)
  imageUrl?: string; // foto de capa (URL hospedada; upload local fica no IndexedDB)
  /** Galeria do modelo. A 1ª é a capa do material que vai pro cliente. */
  fotos?: string[];
  /**
   * ETIQUETA FIXA do card e da tela do carro — hoje só o "Lançamento".
   *
   * Diferente do selo "novo", que é por pessoa e some quando ela abre o carro
   * (ver novidades.ts): esta vale para todo mundo e só sai quando a gerência
   * tirar daqui. É o que diferencia carro recém-chegado de carro que a pessoa
   * ainda não viu.
   */
  etiqueta?: string;
  /**
   * DESTAQUES — as 5 razões de compra, do jeito que o cliente lê.
   *
   * Cada uma tem duas partes de propósito: `titulo` é o BENEFÍCIO (o que muda
   * na vida de quem compra) e `prova` é a ficha que sustenta (o que o carro
   * tem). Ficha sozinha não vende: "som Sony de 12 alto-falantes" é o que ele
   * TEM; "ninguém mais briga pelo som" é o que ele FAZ. O cliente decide pela
   * segunda e confere na primeira.
   *
   * Não confundir com `benefits`, que são frases inteiras pro VENDEDOR estudar.
   */
  destaques?: { titulo: string; prova?: string }[];
  buyUrl?: string; // e-commerce oficial — a cliente compra direto
  ficha?: FichaRow[]; // ficha técnica p/ consulta rápida no balcão
  /**
   * A FOLHA OFICIAL da montadora, em PDF — a que vai para o cliente.
   *
   * A `ficha` acima é para o vendedor consultar EM PÉ, com o cliente do lado:
   * linha a linha, na tela, dá pra achar um número em dois segundos. Mas ela
   * saía no WhatsApp como texto corrido de "*Item:* valor", e chegava no
   * cliente parecendo mensagem digitada às pressas.
   *
   * Quando existe folha oficial, é ela que vai: o desenho da marca, as versões
   * lado a lado, sem preço (a caixa de preço foi tapada com "consulte a
   * condição vigente na loja"). O que o cliente recebe passa a ser o mesmo
   * documento que a montadora publica.
   */
  fichaPdf?: string;
  /** Versões do modelo, da de entrada pra de topo. */
  versoes?: Versao[];
}

// Linha que o AFILIADO enxerga. Hoje ele só trabalha a GLPEN — o resto do
// portfólio (Hyaluvita, Moviben, Resfben...) é assunto de balconista/promotor.
export const AFILIADO_LINE = 'glpen';

// Rótulo de duração da pílula. Quando o produto tem vídeo gravado, o
// `durationSec` (que é o tempo do roteiro animado, 30s) não vale mais — os
// vídeos da Mari têm de 56s a 80s, e cada público tem o seu. Nesse caso a tela
// diz só "vídeo", em vez de mentir um número.
export function duracaoLabel(p: Product): string {
  const temVideo = !!p.videoUrl || !!(p.audienceVideos && Object.keys(p.audienceVideos).length);
  return temVideo ? 'vídeo' : `${p.durationSec}s`;
}

/**
 * Filtra o catálogo pelo que o papel pode ver.
 *
 * A regra nasceu na Meraki: afiliado vende a linha GLPEN e só ela, então não
 * faz sentido mostrar o resto do portfólio pra ele. Balconista, promotor e
 * gestor veem tudo.
 *
 * O QUE ESTAVA ERRADO: a regra era aplicada em QUALQUER marca. Na Ramasa não
 * existe linha GLPEN — nenhum carro tem `line` —, então o filtro devolvia zero
 * e a pessoa abria o catálogo e via só a seção de acessórios, que não passa por
 * aqui. Parecia que os carros tinham sumido do app.
 *
 * Agora a restrição só vale onde a linha existe de verdade. Numa marca sem
 * GLPEN ela não é regra nenhuma — e devolver tudo é mais certo que devolver
 * uma tela vazia.
 */
export function visibleProducts(products: Product[], role?: string): Product[] {
  if (role !== 'afiliado') return products;
  const daLinha = products.filter((p) => p.line === AFILIADO_LINE);
  return daLinha.length ? daLinha : products;
}

export const CATEGORIES: Record<Category, { label: string; Icon: LucideIcon }> = {
  performance: { label: 'Performance & Massa Magra', Icon: Dumbbell },
  capsulas: { label: 'Suplementos & Vitaminas', Icon: Pill },
  respiratorio: { label: 'Vias Respiratórias', Icon: Wind },
  cosmeticos: { label: 'Cosméticos & Skincare', Icon: Sparkles },
  perfumaria: { label: 'Perfumaria', Icon: Flower2 },
  jaecoo: { label: 'Jaecoo', Icon: Car },
  omoda: { label: 'Omoda', Icon: Zap },
  royal: { label: 'Royal Enfield', Icon: Motorbike },
  acessorio: { label: 'Acessórios', Icon: Wrench },
};

// Quais categorias o gestor pode escolher, por vertical. Sem isso a Ramasa via
// "Performance & Massa Magra" e "Vias Respiratórias" no cadastro do carro.
export const CATEGORIAS_AUTO: Category[] = ['jaecoo', 'omoda', 'royal', 'acessorio'];
export const CATEGORIAS_SAUDE: Category[] = ['performance', 'capsulas', 'respiratorio', 'cosmeticos', 'perfumaria'];

export const PRODUCTS: Product[] = [
  // ───────────────────────── CARRO-CHEFE (MERAKI) ─────────────────────────
  {
    id: 'glpen-nutri-muscle',
    audienceVideos: { 'afiliado-saude': '/videos/glpen-nutri-muscle-nutri.mp4', 'afiliado-geral': '/videos/glpen-nutri-muscle-afiliado.mp4' },
    videoUrl: '/videos/glpen-nutri-muscle-afiliado.mp4', // base (balconista/promotor/gestor) = versão geral da Mari
    brand: 'meraki',
    line: 'glpen',
    buyUrl: 'https://glpennutri.com.br/products/muscle',
    ficha: [
      { label: 'Diferencial', value: 'Associação exclusiva de HMB + arginina + glutamina' },
      { label: 'Ativos', value: 'HMB 3 g (dose cheia), L-arginina, L-glutamina, vitamina C e vitamina D' },
      { label: 'Formato', value: 'Sachê de 10 g — caixa com 30 (pó para suspensão oral)' },
      { label: 'Dose', value: '1 sachê ao dia, em cerca de 200 ml de água' },
      { label: 'Duração', value: '1 caixa = 30 dias de uso' },
      { label: 'Dado-chave', value: 'Cerca de 30% do peso perdido com GLP-1 pode ser massa magra' },
      { label: 'Resultado', value: 'A maioria relata diferença a partir de 30 dias; ciclo indicado de 3 meses' },
    ],
    name: 'GLPEN Nutri Muscle',
    imageUrl: 'https://drogal.vtexassets.com/arquivos/ids/279281-600-600?v=639141832073530000',
    instagramUrl: 'https://www.instagram.com/reel/DZiG3EQOXzi',
    category: 'performance',
    tagline: 'Associação exclusiva de HMB, arginina e glutamina em sachê — apoio à massa muscular de quem emagrece com análogos de GLP-1.',
    hook: 'Quem emagrece com a medicação da caneta também pode perder massa magra no caminho. Dá para cuidar disso.',
    whatItIs:
      'Num emagrecimento acelerado, o corpo pode perder não apenas gordura, mas também massa magra — cerca de 30% do peso perdido com análogos de GLP-1 pode ser de músculos. O GLPEN Nutri Muscle foi desenvolvido para essa fase: uma associação exclusiva de HMB, arginina e glutamina em sachê, para apoiar a preservação muscular de quem está emagrecendo com orientação profissional.',
    benefits: [
      'HMB em dose cheia — 3 g por sachê —, que ajuda a reduzir a degradação proteica muscular',
      'Arginina — aminoácido que favorece a circulação sanguínea',
      'Glutamina — aminoácido essencial para a recuperação do tecido muscular',
      'Sachê prático (30 sachês de 10g) — fácil de manter mesmo com o apetite reduzido',
    ],
    howToUse:
      'Um sachê (10g) ao dia, dissolvido em cerca de 200 ml de água — de preferência junto da rotina de treino de força. O suplemento é um apoio: quem preserva a massa muscular é a combinação de proteína adequada, treino e acompanhamento profissional.',
    forWho:
      'Pessoas em uso de análogos de GLP-1 (como semaglutida ou tirzepatida), sob orientação profissional, que querem cuidar da massa muscular e da recuperação.',
    salesLine: 'Emagrecer cuidando da massa magra faz diferença no resultado. Quer que eu te explique como ele entra na sua rotina?',
    objections: [
      {
        trigger: '"A caneta já emagrece, pra que tomar isso?"',
        answer:
          'A medicação atua no peso, mas não escolhe o que sai: cerca de 30% do peso perdido pode ser de músculos. O Muscle traz HMB, arginina e glutamina para apoiar a preservação muscular — sempre junto do treino de força e da orientação do seu profissional de saúde.',
      },
      {
        trigger: '"Achei caro."',
        answer:
          'Entendo. Vale pensar nele como parte do cuidado com o resultado: preservar a massa magra ajuda na força, na firmeza e na manutenção do peso ao longo do tempo. Se quiser, eu te mostro o custo por dose e a gente vê se cabe na sua rotina.',
      },
      {
        trigger: '"Já tomo whey, está de bom tamanho."',
        answer:
          'O whey é uma ótima fonte de proteína. O Muscle soma o que o whey não traz: HMB, que ajuda a reduzir a degradação muscular, com arginina e glutamina para a recuperação — pensado para quem está comendo menos. Um complementa o outro.',
      },
      {
        trigger: '"E quando eu parar a caneta? Não volta tudo?"',
        answer:
          'Esse é um risco real: segundo dados citados pela marca, até dois terços do peso perdido podem voltar no primeiro ano depois de parar a medicação. O músculo é o que sustenta o metabolismo nessa transição — por isso preservá-lo durante o tratamento é investir na manutenção do resultado.',
      },
      {
        trigger: '"Não faço musculação. Faz sentido pra mim?"',
        answer:
          'Faz. O HMB foi estudado até em pessoas em repouso absoluto, sem nenhuma atividade física, e mostrou apoio à preservação muscular. Com treino o resultado é melhor — mas o suporte vale mesmo pra quem ainda não começou.',
      },
      {
        trigger: '"Em quanto tempo vejo resultado?"',
        answer:
          'A maioria relata diferença a partir de 30 dias de uso constante, e a recomendação da marca é um ciclo de pelo menos 3 meses. No site oficial há garantia de 30 dias.',
      },
    ],
    compliance:
      'Suplemento alimentar. Não é medicamento e não substitui acompanhamento médico ou nutricional nem uma alimentação equilibrada. Uso de medicação: consulte seu profissional de saúde.',
    durationSec: 30,
    gradient: ['#12B5A5', '#0B5563'],
    storyboard: [
      { t: '0-4s', label: 'GANCHO', line: 'Quem emagrece com a caneta também pode perder massa muscular. E dá para cuidar disso.' },
      { t: '4-12s', label: 'O PORQUÊ', line: 'Numa perda de peso rápida, nem tudo que sai é gordura — parte pode ser músculo, que sustenta força e firmeza.' },
      { t: '12-24s', label: 'O PRODUTO', line: 'GLPEN Nutri Muscle: HMB, arginina e glutamina em um sachê ao dia, junto de proteína e treino.' },
      { t: '24-30s', label: 'CTA', line: 'Quer saber se faz sentido para você? Me chama.' },
    ],
  },

  {
    id: 'glpen-nutri-energy',
    audienceVideos: { 'afiliado-saude': '/videos/glpen-nutri-energy-nutri.mp4', 'afiliado-geral': '/videos/glpen-nutri-energy-afiliado.mp4' },
    videoUrl: '/videos/glpen-nutri-energy-afiliado.mp4', // base (balconista/promotor/gestor) = versão geral da Mari
    brand: 'meraki',
    line: 'glpen',
    buyUrl: 'https://glpennutri.com.br/products/energy',
    ficha: [
      { label: 'Diferencial', value: 'Cafeína em dose medida + L-arginina, com vitaminas e minerais — energia sem nervosismo' },
      { label: 'Ativos', value: 'Cafeína, L-arginina, ferro bisglicinato, zinco, selênio, cromo e vitaminas A, C, D, E e do complexo B' },
      { label: 'Formato', value: 'Cápsulas softgel — 30 unidades' },
      { label: 'Dose', value: '1 cápsula ao dia; quem treina costuma usar antes da atividade' },
      { label: 'Duração', value: '1 caixa = 30 dias de uso' },
      { label: 'Atenção', value: 'Contém cafeína — se você é sensível, evite depois das 16h' },
      { label: 'Resultado', value: 'A maioria relata diferença a partir de 30 dias; ciclo indicado de 3 meses' },
    ],
    name: 'GLPEN Nutri Energy',
    imageUrl: 'https://drogal.vtexassets.com/arquivos/ids/271436-600-600?v=638978647328370000',
    category: 'performance',
    tagline: 'Cafeína, arginina e colina verde com vitaminas e minerais — energia, foco e disposição para quem emagrece com a caneta e treina.',
    hook: 'Comendo bem menos por causa da medicação, é comum a energia cair. Há como apoiar essa fase.',
    whatItIs:
      'Menos comida significa menos combustível: vem o cansaço, a falta de foco e o treino arrastado. O GLPEN Nutri Energy combina cafeína, arginina e colina verde com vitaminas e minerais, para apoiar a disposição e o desempenho físico e mental de quem está em restrição — especialmente quem treina.',
    benefits: [
      'Cafeína, que contribui para o estado de alerta e a disposição',
      'Arginina e colina verde — combinação pensada para foco e desempenho',
      'Vitaminas e minerais que auxiliam na redução do cansaço',
      'Cápsulas softgel, práticas para a rotina e o pré-treino',
    ],
    howToUse:
      'Uma cápsula ao dia — quem treina costuma usar antes da atividade. Contém cafeína: evite depois das 16h se você for sensível, para não atrapalhar o sono.',
    forWho:
      'Usuários de canetas emagrecedoras que fazem atividade física e sentem queda de disposição, foco e concentração.',
    salesLine: 'Energia e foco também merecem cuidado nessa fase. Quer que eu te explique como ele entra na sua rotina?',
    objections: [
      { trigger: '"Café não resolve?"', answer: 'O café oferece apenas a cafeína. O Energy soma arginina, colina verde, vitaminas e minerais em dose medida — um suporte pensado para a fase de restrição, não um cafezinho.' },
      { trigger: '"Tenho medo de ficar acelerada."', answer: 'A proposta é energia sustentável, sem nervosismo nem tremedeira: a dose de cafeína é medida por cápsula, diferente de empilhar xícaras de café. Se você é sensível, use antes das 16h e converse com seu profissional de saúde.' },
      { trigger: '"Energia é só dormir bem."', answer: 'O sono é a base. Mas, comendo bem menos, falta combustível — e é aí que vitaminas, minerais e cafeína em dose adequada fazem diferença.' },
      { trigger: '"Em quanto tempo vejo resultado?"', answer: 'A maioria relata diferença a partir de 30 dias de uso constante; a recomendação da marca é um ciclo de pelo menos 3 meses. No site oficial há garantia de 30 dias.' },
    ],
    compliance:
      'Suplemento alimentar. Contém cafeína — gestantes, lactantes e pessoas sensíveis à cafeína devem consultar um profissional de saúde. Não é medicamento e não substitui uma alimentação equilibrada.',
    durationSec: 30,
    gradient: ['#8bc53f', '#457a12'],
    storyboard: [
      { t: '0-4s', label: 'GANCHO', line: 'Comendo bem menos por causa da caneta, é comum a energia cair.' },
      { t: '4-12s', label: 'O PORQUÊ', line: 'Menos comida é menos combustível: cansaço, falta de foco e treino arrastado.' },
      { t: '12-24s', label: 'O PRODUTO', line: 'GLPEN Nutri Energy: cafeína, arginina e colina verde com vitaminas e minerais.' },
      { t: '24-30s', label: 'CTA', line: 'Contém cafeína — quer saber se encaixa na sua rotina? Me chama.' },
    ],
  },
  {
    id: 'glpen-nutri-ultra-az',
    audienceVideos: { 'afiliado-saude': '/videos/glpen-nutri-ultra-az-nutri.mp4', 'afiliado-geral': '/videos/glpen-nutri-ultra-az-afiliado.mp4' },
    videoUrl: '/videos/glpen-nutri-ultra-az-afiliado.mp4', // base (balconista/promotor/gestor) = versão geral da Mari
    brand: 'meraki',
    line: 'glpen',
    buyUrl: 'https://glpennutri.com.br/products/ultra-az',
    ficha: [
      { label: 'Diferencial', value: 'Multivitamínico específico para quem usa caneta — doses ampliadas e minerais quelatos (melhor absorção)' },
      { label: 'Ativos', value: 'Ferro, magnésio e zinco bisglicinato, cálcio, selênio, cromo, iodo e vitaminas de A a Z' },
      { label: 'Formato', value: 'Cápsulas softgel — 60 unidades' },
      { label: 'Dose', value: '2 cápsulas ao dia, junto a uma refeição' },
      { label: 'Duração', value: '1 frasco = 30 dias de uso' },
      { label: 'Dado-chave', value: 'Feito para quem passou a comer muito menos por causa da medicação' },
      { label: 'Resultado', value: 'Cabelo e unha respondem devagar: a maioria nota a partir de 30 dias; ciclo indicado de 3 meses' },
    ],
    name: 'GLPEN Nutri Ultra AZ',
    imageUrl: 'https://drogal.vtexassets.com/arquivos/ids/271438-600-600?v=638978508656770000',
    category: 'capsulas',
    tagline: 'Multivitamínico específico para quem usa caneta emagrecedora — doses até 10x maiores, minerais quelatos, com aronia e quercetina.',
    hook: 'Comendo até 70% menos, faltam vitaminas e minerais — e o corpo avisa.',
    whatItIs:
      'Quem emagrece com análogos de GLP-1 pode passar a comer até 70% menos — e a ingestão de vitaminas e minerais cai junto. O multivitamínico comum foi pensado para quem come normalmente. O GLPEN Nutri Ultra AZ traz doses adaptadas a essa realidade, até 10x maiores, em minerais quelatos (de melhor absorção), com aronia e quercetina.',
    benefits: [
      'Doses até 10x maiores que as de um multivitamínico comum — adaptadas a quem come bem menos',
      'Minerais quelatos, forma de melhor absorção',
      'Contribui para a imunidade e auxilia no cuidado com cabelos e unhas',
      'Ajuda a prevenir deficiências nutricionais durante o emagrecimento acelerado',
    ],
    howToUse: 'Duas cápsulas ao dia, junto a uma refeição. A constância é o que garante a reposição.',
    forWho:
      'Todos os usuários de canetas emagrecedoras — especialmente quem nota queda de cabelo, unhas frágeis, imunidade baixa ou falta de disposição.',
    salesLine: 'Quem come 70% menos precisa repor com dose adequada. Quer que eu te explique como ele funciona?',
    objections: [
      { trigger: '"Já tomo multivitamínico."', answer: 'O multivitamínico comum foi feito para quem come normalmente. Na caneta, a alimentação cai até 70% — o Ultra AZ traz doses até 10x maiores e minerais quelatos, pensados para essa realidade.' },
      { trigger: '"Prefiro repor pela comida."', answer: 'Seria o ideal. Mas, com o apetite reduzido pela medicação, o prato não dá conta do volume necessário — é exatamente para isso que o Ultra AZ existe.' },
      { trigger: '"Todo multivitamínico é igual."', answer: 'Compare os rótulos: a dose e a forma do mineral fazem toda a diferença. Minerais quelatos absorvem melhor, e doses de quem come 100% não servem para quem come 30%.' },
      { trigger: '"Em quanto tempo vejo resultado?"', answer: 'Cabelo e unha respondem devagar por natureza: a maioria nota diferença a partir de 30 dias, e a recomendação da marca é um ciclo de pelo menos 3 meses. No site oficial há garantia de 30 dias.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento e não substitui uma alimentação equilibrada nem acompanhamento profissional. Sintomas persistentes: procure um médico.',
    durationSec: 30,
    gradient: ['#5b4fe0', '#2c2480'],
    storyboard: [
      { t: '0-4s', label: 'GANCHO', line: 'Comendo até 70% menos, faltam vitaminas e minerais — e o corpo avisa.' },
      { t: '4-12s', label: 'O PORQUÊ', line: 'Cabelo, unhas, imunidade e disposição sentem primeiro.' },
      { t: '12-24s', label: 'O PRODUTO', line: 'Ultra AZ: doses até 10x maiores, minerais quelatos de melhor absorção.' },
      { t: '24-30s', label: 'CTA', line: 'Quer entender como ele entra na sua rotina? Me chama.' },
    ],
  },

  // ───────────────────── Suplementos & Vitaminas (MERAKI) ─────────────────────
  {
    id: 'hyaluvita-duo-collagen',
    brand: 'meraki',
    name: 'Hyaluvita Duo Collagen',
    imageUrl: 'https://hyaluvita.com.br/cdn/shop/files/1Duocollagen_7b46bf2a-8dbb-474f-b508-694212937066.jpg',
    instagramUrl: 'https://www.instagram.com/reel/C7ZU0uDMz0N',
    category: 'cosmeticos',
    tagline: 'Dois colágenos (Verisol 2,5g + hidrolisado 10g) com silício orgânico, vitamina C, E, zinco e cromo — pó sabor limão.',
    hook: 'Fez o procedimento e investiu nele — mas deu ao corpo a matéria-prima para construir o colágeno?',
    whatItIs:
      'Procedimento estético que estimula colágeno (bioestimulador, laser, microagulhamento) é só o ESTÍMULO — quem constrói o colágeno depois é o seu corpo. E, para construir, ele precisa de matéria-prima. O Duo Collagen junta 2,5g de colágeno Verisol + 10g de colágeno hidrolisado + 500mg de silício orgânico (Nutricolin), com vitamina C, vitamina E, zinco e cromo. É o "material de obra" que acompanha o que você já investiu — sabor limão, 1 dose por dia.',
    benefits: [
      'Dois colágenos numa dose só: Verisol (2,5g) + colágeno hidrolisado (10g)',
      'Silício orgânico Nutricolin (500mg) + vitamina C, que contribui para a formação normal de colágeno',
      'Vitamina E, zinco e cromo — antioxidantes que auxiliam pele, cabelos e unhas',
      'Pó sabor limão que dissolve na água: fácil de manter todo dia',
    ],
    howToUse:
      'Dissolva 2 medidas (15g) em 200ml de água, 1x ao dia — de preferência em jejum ou com bom intervalo das refeições. Costuma ser orientado por pelo menos 3 meses após o procedimento.',
    forWho:
      'Quem fez (ou vai fazer) procedimento estético que estimula colágeno e quer dar ao corpo a matéria-prima para construir o resultado.',
    salesLine: 'O procedimento é o estímulo — quem constrói o colágeno é você. Quer que eu te explique como tomar?',
    objections: [
      { trigger: '"Colágeno em pó funciona mesmo?"', answer: 'O Verisol é um peptídeo de colágeno com estudos, e aqui ele vem junto da vitamina C, que contribui para a formação normal do colágeno. Não é mágica: é matéria-prima + constância. Por isso a orientação costuma ser de 3 meses ou mais.' },
      { trigger: '"Já fiz o procedimento, não preciso disso."', answer: 'O procedimento estimula; quem constrói o colágeno é o seu corpo. Sem matéria-prima (colágeno, silício, vitamina C, zinco), o resultado tende a render menos. É o complemento do que você já investiu.' },
      { trigger: '"Achei caro."', answer: 'Compara com o valor do procedimento que você já fez: o pote acompanha justamente os meses em que o corpo está construindo o resultado. É proteger o investimento, não gastar de novo.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento e não substitui uma alimentação equilibrada nem acompanhamento profissional. Não realiza procedimento nem garante resultado estético — resultados variam de pessoa para pessoa.',
    durationSec: 28,
    gradient: ['#c3d34e', '#7d8f22'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Fez o procedimento e não alimentou o colágeno por dentro?' },
      { t: '3-10s', label: 'O PORQUÊ', line: 'O procedimento só estimula. Quem constrói o colágeno é o seu corpo — com matéria-prima.' },
      { t: '10-20s', label: 'O PRODUTO', line: 'Duo Collagen: Verisol + colágeno hidrolisado + silício e vitamina C, 1 dose por dia.' },
      { t: '20-28s', label: 'CTA', line: 'Quer proteger o que você já investiu? Me chama.' },
    ],
  },
  {
    id: 'hyaluvita-silicio',
    brand: 'meraki',
    name: 'Hyaluvita Silício',
    imageUrl: 'https://hyaluvita.com.br/cdn/shop/files/Hyaluvita_Silicio1.jpg?width=800',
    category: 'cosmeticos',
    tagline: 'Silício orgânico (Nutricolin) + biotina em dose alta, vitamina D, ferro, zinco e complexo B — pele, cabelos e unhas.',
    hook: 'Cabelo ficando no ralo e unha que descasca à toa? Isso se constrói de dentro, não com creme.',
    whatItIs:
      'Cabelo, unhas e pele são construídos de dentro para fora — e, para isso, o corpo precisa de nutrientes. O Hyaluvita Silício traz silício orgânico Nutricolin (uma das formas mais biodisponíveis), biotina em dose alta, vitamina D, ferro, zinco e vitaminas do complexo B (B6, B9 e B12). É 1 cápsula por dia para oferecer ao corpo o que ele usa na formação de cabelos, unhas e pele.',
    benefits: [
      'Silício orgânico Nutricolin — contribui para a firmeza e a densidade da pele',
      'Biotina em dose alta: auxilia na manutenção de cabelos e unhas normais',
      'Ferro e zinco, que contribuem para cabelos e unhas normais',
      '1 cápsula ao dia, uso adulto — 90 cápsulas por pote',
    ],
    howToUse:
      '1 cápsula ao dia, de preferência em jejum (o silício costuma absorver melhor assim). Consulte médico ou nutricionista para orientação individual.',
    forWho:
      'Quem reclama de queda de cabelo, unha fraca que quebra e descasca, e quer pele mais firme — cuidando de dentro para fora.',
    salesLine: 'Cabelo e unha se constroem de dentro. Quer que eu te conte a rotina de 1 cápsula por dia?',
    objections: [
      { trigger: '"Biotina eu já tomo."', answer: 'Ótimo! Aqui a biotina vem acompanhada de silício orgânico, ferro, zinco e complexo B — porque cabelo e unha não se constroem com um nutriente só. É a formação completa numa cápsula.' },
      { trigger: '"Queda de cabelo não é caso de médico?"', answer: 'É sim, e a gente sempre orienta procurar. Queda tem várias causas. O que o suplemento faz é oferecer a matéria-prima (ferro, zinco, biotina, silício): ele auxilia, não substitui a investigação com um profissional.' },
      { trigger: '"Demora pra ver resultado?"', answer: 'Cabelo e unha crescem devagar — quem faz a diferença é a constância. Por isso a orientação é de uso contínuo por alguns meses, e por isso o pote vem com 90 cápsulas.' },
    ],
    compliance: 'Suplemento alimentar em cápsulas. Não é medicamento e não substitui uma alimentação equilibrada. Queda de cabelo pode ter várias causas — procure um profissional de saúde. Uso adulto.',
    durationSec: 28,
    gradient: ['#2ec4d6', '#0d7c8c'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Cabelo no ralo e unha que quebra à toa?' },
      { t: '3-10s', label: 'O PORQUÊ', line: 'Fio e unha se constroem de dentro: silício, biotina, ferro e zinco.' },
      { t: '10-20s', label: 'O PRODUTO', line: 'Hyaluvita Silício: Nutricolin + biotina em dose alta, 1 cápsula por dia.' },
      { t: '20-28s', label: 'CTA', line: 'Quer cuidar de cabelo e unhas? Me chama.' },
    ],
  },
  {
    id: 'hyaluvita-melan',
    brand: 'meraki',
    name: 'Hyaluvita Melan',
    imageUrl: 'https://hyaluvita.com.br/cdn/shop/files/Melan_0000.png?width=800',
    category: 'cosmeticos',
    tagline: 'Picnogenol (Pinus pinaster), Olea europaea, astaxantina, luteína e licopeno — antioxidantes que auxiliam a pele.',
    hook: 'Passa protetor todo dia e a mancha continua teimando? Cuidar só por fora deixa metade do trabalho.',
    whatItIs:
      'Mancha é assunto de constância — e de cuidar por dentro E por fora. O Hyaluvita Melan é um suplemento com Pinus pinaster (picnogenol), extrato de Olea europaea, astaxantina, luteína e licopeno: antioxidantes conhecidos pela ação de fotoproteção oral. Ele trabalha JUNTO do protetor solar e do que a sua dermatologista indicar — nunca no lugar deles. É 1 cápsula ao dia.',
    benefits: [
      'Antioxidantes (astaxantina, luteína e licopeno) que auxiliam a defesa da pele contra o estresse oxidativo',
      'Picnogenol e Olea europaea — contribuem para a uniformidade do tom da pele',
      'Fotoproteção oral: complementa o protetor solar (e nunca o substitui)',
      '1 cápsula ao dia junto da refeição — 90 cápsulas por pote',
    ],
    howToUse:
      '1 cápsula ao dia junto de uma refeição (melhora a absorção), ou conforme orientação do seu profissional de saúde. Mantenha sempre o protetor solar.',
    forWho:
      'Quem convive com manchas e melasma, já usa protetor solar e quer somar um cuidado antioxidante de dentro para fora.',
    salesLine: 'Mancha pede constância — por dentro e por fora. Quer que eu te explique como ele entra na sua rotina?',
    objections: [
      { trigger: '"Isso acaba com o melasma?"', answer: 'Não — e desconfie de quem promete isso. Melasma é crônico e pede acompanhamento com dermatologista e protetor solar todo dia. O Melan é um suplemento antioxidante que AUXILIA esse cuidado por dentro. Ele soma, não substitui.' },
      { trigger: '"Então posso maneirar no protetor?"', answer: 'De jeito nenhum! A fotoproteção oral é complemento. O protetor solar continua sendo o principal — o Melan trabalha junto com ele, nunca no lugar dele.' },
      { trigger: '"Já uso creme clareador."', answer: 'Perfeito, continue com o que sua dermato indicou. O creme age por fora; o Melan traz antioxidantes que agem por dentro. É o cuidado nos dois caminhos.' },
    ],
    compliance: 'Suplemento alimentar em cápsulas. Não é medicamento, não trata nem cura melasma e não substitui o protetor solar nem o acompanhamento com dermatologista. Uso adulto. Resultados variam de pessoa para pessoa.',
    durationSec: 28,
    gradient: ['#7fc9e8', '#2a6f9e'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Passa protetor todo dia e a mancha continua teimando?' },
      { t: '3-10s', label: 'O PORQUÊ', line: 'Cuidar só por fora é metade: antioxidantes agem por dentro.' },
      { t: '10-20s', label: 'O PRODUTO', line: 'Hyaluvita Melan: picnogenol, astaxantina, luteína e licopeno — 1 cápsula ao dia.' },
      { t: '20-28s', label: 'CTA', line: 'Some ao seu protetor solar e à orientação da sua dermatologista. Me chama.' },
    ],
  },
  {
    id: 're-hidraben',
    brand: 'meraki',
    name: 'Re-Hidraben',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/10/Re-Hiudraben-Sabor-AguadeCoco.jpg',
    category: 'capsulas',
    tagline: 'Repositor de água e eletrólitos (sódio, potássio, zinco) em sachê — água de coco, laranja, uva ou natural.',
    hook: 'Bebe água e continua com dor de cabeça, moleza e boca seca? Água pura não repõe os sais que o corpo perde.',
    whatItIs:
      'Quando o corpo perde líquido — no calor, no treino ou num episódio de mal-estar — não sai apenas água: saem também sais minerais como sódio, potássio e zinco. Beber água pura mata a sede, mas não repõe esses eletrólitos. O Re-Hidraben devolve água e eletrólitos na proporção adequada, em quatro sabores, para uma hidratação mais completa.',
    benefits: [
      'Repõe água e eletrólitos (sódio, potássio e zinco) perdidos no calor, no treino e em episódios de mal-estar',
      'Auxilia a recuperação da disposição de forma mais completa do que a água pura',
      'Contém zinco, que contribui para o funcionamento normal do sistema imunológico',
      'Quatro sabores: água de coco, laranja, uva e natural',
    ],
    howToUse:
      'Dissolva 1 sachê em água conforme o rótulo. Indicado após o treino, em dias de calor intenso ou em situações de maior perda de líquidos.',
    forWho:
      'Quem treina e transpira bastante, quem passa o dia exposto ao calor e famílias em dias de mal-estar com perda de líquidos.',
    salesLine: 'Hidratação completa envolve água e eletrólitos. Quer que eu te indique o sabor mais pedido?',
    objections: [
      { trigger: '"Água pura não resolve?"', answer: 'A água mata a sede, mas não repõe os sais minerais. Quando você transpira muito ou passa mal, perde também sódio e potássio — e é isso que costuma causar a moleza e a dor de cabeça. O Re-Hidraben repõe os dois.' },
      { trigger: '"É como um isotônico de mercado?"', answer: 'A proposta é parecida, mas a fórmula prioriza a reposição de eletrólitos com menos açúcar e ainda traz zinco. E você escolhe entre quatro sabores.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento. Em caso de diarreia persistente ou desidratação intensa, procure um médico.',
    durationSec: 24,
    gradient: ['#12b5a5', '#0b7285'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Bebe água e continua com dor de cabeça e moleza?' },
      { t: '3-9s', label: 'O PORQUÊ', line: 'Água pura não repõe os sais que o corpo perde: sódio, potássio e zinco.' },
      { t: '9-17s', label: 'O PRODUTO', line: 'Re-Hidraben devolve água e eletrólitos, em quatro sabores.' },
      { t: '17-24s', label: 'CTA', line: 'Quer saber qual sabor combina com você? Me chama.' },
    ],
  },
  {
    id: 'moviben',
    brand: 'meraki',
    name: 'Moviben',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/10/Moviben.jpg',
    category: 'capsulas',
    tagline: 'Suporte para as articulações: colágeno tipo 2, glucosamina, condroitina, curcumina, MSM, cálcio, magnésio e vitamina D3.',
    hook: 'Joelho estalando, dificuldade para levantar da cadeira, receio de perder mobilidade com o tempo?',
    whatItIs:
      'Mobilidade é autonomia: subir escada, brincar com os netos, treinar com segurança. O Moviben reúne em um único comprimido os nutrientes associados à saúde articular — colágeno tipo 2, glucosamina, condroitina, curcumina, MSM, cálcio, magnésio e vitamina D3 — para apoiar quem quer continuar em movimento.',
    benefits: [
      'Reúne colágeno tipo 2, glucosamina e condroitina — nutrientes associados à saúde articular',
      'Com curcumina e MSM, que complementam o cuidado com músculos e articulações',
      'Cálcio, magnésio e vitamina D3, que contribuem para a manutenção de ossos normais',
      'Um comprimido concentrado, prático para manter todos os dias',
    ],
    howToUse: 'Conforme o rótulo, diariamente, junto a uma refeição. O cuidado com as articulações depende de constância — pense em meses, não em dias.',
    forWho:
      'Pessoas a partir dos 40 que sentem desconforto nas articulações, quem treina com intensidade e quer proteger joelhos e ombros, e quem deseja manter a mobilidade.',
    salesLine: 'Articulações saudáveis são liberdade de movimento. Quer que eu te explique como incluir na rotina?',
    objections: [
      { trigger: '"Já tomo colágeno."', answer: 'O colágeno é uma parte do cuidado. O Moviben reúne colágeno tipo 2, glucosamina, condroitina, curcumina e minerais em um comprimido — um suporte mais completo para a articulação.' },
      { trigger: '"Isso é para pessoas mais velhas?"', answer: 'É para quem quer se manter em movimento, em qualquer idade. Atletas usam para proteger os joelhos; quem tem rotina intensa usa para manter a mobilidade. Cuidar antes costuma ser mais simples do que remediar depois.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento e não trata doenças articulares. Dor persistente: procure seu médico.',
    durationSec: 30,
    gradient: ['#f59e0b', '#b45309'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Joelho estalando e receio de perder mobilidade com o tempo?' },
      { t: '3-10s', label: 'O PRODUTO', line: 'Moviben: colágeno tipo 2, glucosamina, condroitina e minerais em um comprimido.' },
      { t: '10-18s', label: 'BENEFÍCIO', line: 'Um suporte completo para apoiar a mobilidade e a qualidade de vida.' },
      { t: '18-24s', label: 'NA PRÁTICA', line: 'Um por dia, todos os dias. A articulação responde à constância.' },
      { t: '24-30s', label: 'CTA', line: 'Quer cuidar da sua mobilidade? Me chama.' },
    ],
  },
  {
    id: 'probiativ',
    brand: 'meraki',
    name: 'ProbiAtiv',
    category: 'capsulas',
    imageUrl: 'https://farmaciaindiana.vtexassets.com/arquivos/ids/342113-600-600?v=638737771515070000',
    tagline: 'Probiótico em comprimido para equilibrar a flora intestinal e apoiar a digestão e a imunidade.',
    hook: 'Intestino preso, inchaço depois das refeições, sensação de digestão lenta?',
    whatItIs:
      'O equilíbrio da flora intestinal influencia a digestão, a absorção de nutrientes e a imunidade. O ProbiAtiv é um probiótico em comprimido que ajuda a repor as bactérias benéficas da flora, apoiando uma digestão mais regular e o bom funcionamento do intestino.',
    benefits: [
      'Ajuda a equilibrar a flora intestinal (as bactérias benéficas)',
      'Apoia uma digestão mais leve e regular',
      'Um intestino equilibrado contribui para a absorção de nutrientes e para a imunidade',
      'Comprimido prático, um por dia na rotina',
    ],
    howToUse: 'Conforme o rótulo, de preferência no mesmo horário todos os dias. Combine com boa ingestão de água e fibras.',
    forWho: 'Quem convive com intestino irregular, sente inchaço após as refeições ou usou antibiótico e quer reequilibrar a flora.',
    salesLine: 'Um intestino em equilíbrio muda o dia inteiro. Quer que eu te explique como começar?',
    objections: [
      { trigger: '"Iogurte não faz o mesmo?"', answer: 'O iogurte ajuda, mas a quantidade de bactérias vivas varia e costuma vir acompanhada de açúcar. O probiótico entrega as cepas selecionadas na dose adequada, de forma constante.' },
      { trigger: '"Preciso tomar para sempre?"', answer: 'Depende de cada caso. Muitas pessoas usam por um período para reequilibrar a flora — após um antibiótico, por exemplo — e seguem conforme a orientação profissional e a resposta do próprio corpo.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento. Sintomas persistentes: procure orientação profissional.',
    durationSec: 26,
    gradient: ['#22c55e', '#15803d'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Inchaço depois das refeições e intestino irregular?' },
      { t: '3-12s', label: 'O PRODUTO', line: 'ProbiAtiv repõe as bactérias benéficas que equilibram a flora intestinal.' },
      { t: '12-20s', label: 'BENEFÍCIO', line: 'Digestão mais leve, melhor absorção de nutrientes e apoio à imunidade.' },
      { t: '20-26s', label: 'CTA', line: 'Quer cuidar do seu intestino? Me chama.' },
    ],
  },
  {
    id: 'ative-fer',
    brand: 'meraki',
    name: 'Ative-Fer',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/10/AtivFer.jpg',
    category: 'capsulas',
    tagline: 'Ferro bisglicinato em cápsula — forma de ferro mais suave para o estômago — no cuidado com o cansaço associado ao ferro baixo.',
    hook: 'Cansaço que não passa nem dormindo, palidez, queda de cabelo e falta de ar em esforços simples?',
    whatItIs:
      'O cansaço persistente, a palidez, a queda de cabelo e a falta de ar em esforços leves podem estar associados ao ferro baixo — uma situação frequente entre mulheres. O Ative-Fer utiliza ferro bisglicinato, uma forma de melhor absorção e mais suave para o estômago, sem o desconforto comum do ferro tradicional. O diagnóstico, porém, é sempre do seu médico.',
    benefits: [
      'Ferro na forma bisglicinato — melhor absorção e mais suave para o estômago',
      'O ferro contribui para a redução do cansaço e da fadiga',
      'Apoia o transporte normal de oxigênio no organismo',
      'Sem o desconforto (azia e prisão de ventre) comum ao ferro tradicional',
    ],
    howToUse: 'Conforme o rótulo. O ferro é melhor absorvido junto de vitamina C e longe de café e leite.',
    forWho: 'Mulheres com menstruação intensa, gestantes (com acompanhamento), vegetarianos e quem sente cansaço persistente mesmo dormindo bem.',
    salesLine: 'Se o cansaço não passa nem dormindo, vale investigar o ferro. Quer que eu te explique?',
    objections: [
      { trigger: '"Ferro me dá enjoo e prende o intestino."', answer: 'Esse é um desconforto comum do ferro tradicional. O Ative-Fer usa ferro bisglicinato, uma forma reconhecida por ser mais suave — pensada justamente para quem não tolera bem o ferro comum.' },
      { trigger: '"Como sei se preciso?"', answer: 'Cansaço persistente, palidez, unhas fracas e falta de ar são sinais que merecem atenção. O caminho é um exame de sangue e a avaliação do seu médico — o suplemento entra como apoio, com orientação profissional.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento. Anemia deve ser diagnosticada e acompanhada por um médico.',
    durationSec: 28,
    gradient: ['#ef4444', '#991b1b'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Cansaço que não passa nem dormindo bem?' },
      { t: '3-10s', label: 'A CAUSA', line: 'Pode estar associado ao ferro baixo — frequente entre mulheres.' },
      { t: '10-20s', label: 'O PRODUTO', line: 'Ative-Fer é ferro bisglicinato: reposição com melhor tolerância ao estômago.' },
      { t: '20-28s', label: 'CTA', line: 'Quer entender se é o seu caso? Me chama.' },
    ],
  },
  {
    id: 'flenoben',
    brand: 'meraki',
    name: 'Flenoben',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/12/Flenoben.jpg',
    category: 'capsulas',
    tagline: 'Suporte para a circulação das pernas, com riboflavina — para a sensação de pernas pesadas e inchadas no fim do dia.',
    hook: 'Fim do dia com as pernas pesadas, inchadas e a marca da meia?',
    whatItIs:
      'A sensação de pernas pesadas e inchadas no fim do dia costuma estar ligada à circulação. O Flenoben apoia a microcirculação das pernas, ajudando a amenizar essa sensação de peso e inchaço em quem passa muitas horas em pé ou sentado.',
    benefits: [
      'Apoia a circulação e a sensação de leveza nas pernas',
      'Ajuda a amenizar a sensação de peso e inchaço no fim do dia',
      'Com riboflavina (vitamina B2), que contribui para o metabolismo normal de energia',
      'Cápsula prática para quem fica muito tempo em pé ou sentado',
    ],
    howToUse: 'Conforme o rótulo, diariamente. Combine com pausas para movimentar as pernas e boa hidratação.',
    forWho: 'Quem passa o dia em pé (balcão, salão, cozinha) ou muito tempo sentado e sente as pernas pesarem e incharem no fim do dia.',
    salesLine: 'Pernas mais leves no fim do dia fazem diferença. Quer que eu te explique como usar?',
    objections: [
      { trigger: '"Isso é para varizes?"', answer: 'O Flenoben é um suplemento que apoia a circulação e a sensação de leveza nas pernas no dia a dia. Varizes exigem avaliação médica — o cuidado diário caminha junto, nunca no lugar do médico.' },
      { trigger: '"Só levantar a perna não resolve?"', answer: 'Levantar as pernas alivia no momento. O cuidado por dentro apoia a circulação de forma contínua e, junto com pausas para movimentar as pernas, o resultado costuma ser melhor.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento e não trata doenças venosas. Dor, varizes ou inchaço persistente: procure um médico.',
    durationSec: 26,
    gradient: ['#6366f1', '#3730a3'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Fim do dia com as pernas pesadas e inchadas?' },
      { t: '3-12s', label: 'O PRODUTO', line: 'Flenoben apoia a microcirculação para amenizar o peso e o inchaço nas pernas.' },
      { t: '12-20s', label: 'PRA QUEM', line: 'Indicado para quem passa o dia em pé ou muito tempo sentado.' },
      { t: '20-26s', label: 'CTA', line: 'Quer chegar em casa com as pernas mais leves? Me chama.' },
    ],
  },

  // ───────────────────────── Vias Respiratórias (MERAKI) ─────────────────────────
  // Atenção compliance: são medicamentos isentos de prescrição / fitoterápicos —
  // copy factual, sem promessa de cura, sempre remetendo à bula/rótulo e ao profissional.
  {
    id: 'resfben',
    brand: 'meraki',
    name: 'Resfben',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/12/Resfben-0-Acucar.jpg',
    category: 'respiratorio',
    tagline: 'Linha de alívio para a garganta e as vias respiratórias: pastilhas com mel, vitamina C, zinco e romã; e xarope com guaco.',
    hook: 'Garganta arranhando, pigarro persistente e tosse que não passa?',
    whatItIs:
      'No início de um desconforto na garganta, o alívio ajuda a atravessar o dia. A linha Resfben traz pastilhas com mel, vitamina C, zinco e concentrado de romã, que confortam a garganta, e o xarope com guaco, tradicional aliado das vias respiratórias. Siga sempre as orientações do rótulo e da bula.',
    benefits: [
      'Pastilhas com mel, vitamina C, zinco e romã — alívio e conforto para a garganta',
      'Xarope com guaco, tradicional aliado das vias respiratórias',
      'Zinco e vitamina C contribuem para o funcionamento normal do sistema imunológico',
      'Formatos práticos para levar na bolsa e ter em casa na estação da tosse',
    ],
    howToUse: 'Pastilhas: dissolva na boca conforme o rótulo. Xarope: siga a indicação da embalagem. Leia sempre o rótulo e a bula.',
    forWho: 'Quem sente desconforto na garganta em dias de ar seco ou ar-condicionado, e a família na época de resfriados e tosse.',
    salesLine: 'Ao primeiro desconforto na garganta, agir cedo ajuda. Quer que eu indique qual item da linha se encaixa no seu caso?',
    objections: [
      { trigger: '"Pastilha resolve mesmo?"', answer: 'A pastilha traz alívio e conforto para a garganta, com mel, zinco e vitamina C — uma boa opção para o dia a dia. Quando a tosse vem com catarro, o xarope com guaco entra para ajudar a soltar a secreção.' },
      { trigger: '"Posso dar para os meus filhos?"', answer: 'Há versão infantil (xarope sabor morango). Confira sempre a indicação de idade no rótulo. Para crianças pequenas e gestantes, confirme com o profissional de saúde.' },
    ],
    compliance: 'Siga sempre as orientações do rótulo/bula. Em caso de sintomas persistentes ou febre, procure um médico. Respeite as indicações de idade.',
    durationSec: 26,
    gradient: ['#f97316', '#9a3412'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Garganta arranhando e pigarro persistente?' },
      { t: '3-12s', label: 'O PRODUTO', line: 'Linha Resfben: pastilha com mel, vitamina C e zinco, e xarope com guaco.' },
      { t: '12-20s', label: 'BENEFÍCIO', line: 'Alívio e conforto para a garganta e apoio às vias respiratórias.' },
      { t: '20-26s', label: 'CTA', line: 'Leia o rótulo e me chama que eu te oriento.' },
    ],
  },
  {
    id: 'acetilcisteina',
    brand: 'meraki',
    name: 'Acetilcisteína Meraki',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/10/ACETILCISTEINA-soluvel.jpg',
    category: 'respiratorio',
    tagline: 'Mucolítico (xarope, solúvel ou efervescente 600mg) que ajuda a fluidificar o catarro e facilitar a respiração.',
    hook: 'Tosse com catarro preso, que não sobe nem desce?',
    whatItIs:
      'A tosse com secreção presa incomoda e atrapalha a respiração. A Acetilcisteína é um mucolítico: ajuda a tornar a secreção mais fluida e mais fácil de eliminar. Está disponível em xarope, solúvel e efervescente. É um medicamento — use conforme a bula.',
    benefits: [
      'Ajuda a fluidificar o catarro, facilitando a eliminação',
      'Diferentes formatos: xarope (20 e 40mg/ml), solúvel e efervescente 600mg',
      'Sabores que facilitam o uso (morango, laranja)',
      'Aliado nas fases de tosse com secreção (tosse produtiva)',
    ],
    howToUse: 'Uso conforme a bula e a orientação do farmacêutico ou médico. Respeite a dose e a idade indicadas.',
    forWho: 'Quem está com tosse produtiva (com catarro) e quer ajudar o organismo a eliminar a secreção — sempre seguindo a bula.',
    salesLine: 'Catarro preso pode piorar a tosse. Quer que eu te explique qual formato se encaixa melhor no seu caso?',
    objections: [
      { trigger: '"É remédio? Posso tomar por conta?"', answer: 'É um medicamento isento de prescrição, mas ainda assim é medicamento. Leia a bula, respeite a dose e a indicação de idade. Em caso de dúvida, fale com o farmacêutico. Se o sintoma não melhorar ou houver febre, procure o médico.' },
      { trigger: '"Serve para qualquer tosse?"', answer: 'É indicado para a tosse com catarro (produtiva), ajudando a soltar a secreção. A tosse seca tem outra abordagem — por isso vale confirmar o tipo antes.' },
    ],
    compliance: 'Medicamento. Ao persistirem os sintomas, um médico deverá ser consultado. Leia a bula. Não exceda a dose recomendada. Respeite a indicação de idade.',
    durationSec: 24,
    gradient: ['#0ea5e9', '#075985'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Tosse com catarro preso, que não sobe nem desce?' },
      { t: '3-12s', label: 'O PRODUTO', line: 'A Acetilcisteína é um mucolítico: ajuda a fluidificar o catarro para facilitar a eliminação.' },
      { t: '12-19s', label: 'FORMATOS', line: 'Disponível em xarope, solúvel e efervescente.' },
      { t: '19-24s', label: 'CTA', line: 'Leia a bula e me chama que eu te oriento sobre o formato.' },
    ],
  },

  // ───────── DROGARIA SÃO PAULO · marca própria (fabricação Sorocaps) ─────────
  // Modo balcão: o balconista se prepara pra atender. Conteúdo compliance-safe.
  // Especificações confirmadas no site da Drogaria São Paulo (marca própria):
  // Ômega 3 = 1000mg/cáps, Plus = 1050mg (concentração reforçada), Mini = 550mg
  // (cápsula menor). ⚠️ Ainda conferir com a Sorocaps: a divisão exata de EPA/DHA
  // e o mg de melatonina.
  {
    id: 'dsp-omega-3',
    brand: 'dsp',
    family: 'dsp-omega-3',
    name: 'Ômega 3',
    category: 'capsulas',
    imageUrl: 'https://drogariasp.vteximg.com.br/arquivos/ids/1624324-1000-1000/893056---omega-3-drogaria-sao-paulo-1000mg-120-capsulas-1.jpg?v=639053966796200000',
    tagline: 'Óleo de peixe com EPA e DHA em cápsula — para quem não come peixe o suficiente. Em 60 e 120 cápsulas.',
    hook: 'Come pouco peixe? O ômega 3 que o coração e o cérebro pedem costuma faltar na alimentação.',
    whatItIs:
      'O ômega 3 (EPA e DHA) é uma gordura boa que o corpo não produz — vem principalmente do peixe. Quem não come peixe com frequência dificilmente atinge a quantidade recomendada. O Ômega 3 entrega essa dose em cápsula, todos os dias. Disponível em dois tamanhos: 60 e 120 cápsulas.',
    benefits: [
      'EPA e DHA, que contribuem para a saúde do coração',
      'O DHA auxilia a manutenção da função normal do cérebro e da visão',
      'Prático: entrega uma dose difícil de atingir só com a alimentação',
      'Dois tamanhos — 60 e 120 cápsulas (o de 120 dura mais e sai melhor por dose)',
    ],
    howToUse:
      'Conforme o rótulo, de preferência junto de uma refeição — ajuda na absorção e evita o "gosto de peixe".',
    forWho: 'Adultos que comem pouco peixe e querem cuidar do coração e do cérebro.',
    salesLine: 'Uma cápsula por dia cobre o que falta no prato. Quer que eu te explique a diferença dos tamanhos?',
    objections: [
      { trigger: '"Achei caro."', answer: 'Uma cápsula por dia — o frasco de 120 dura cerca de 4 meses. Por dia sai barato, e é um cuidado contínuo com coração e cérebro.' },
      { trigger: '"Já como peixe."', answer: 'Ótimo! Mas para atingir a dose de ômega 3 seria peixe quase todo dia. A cápsula garante o que o prato nem sempre dá.' },
      { trigger: '"Fico arrotando gosto de peixe."', answer: 'Tome junto da refeição, que ajuda bastante. E temos a versão Mini e a Plus, que costumam incomodar menos.' },
      { trigger: '"Funciona mesmo?"', answer: 'O EPA e o DHA contribuem para o coração e para o cérebro — com uso constante, não de um dia para o outro.' },
    ],
    compliance:
      'Suplemento alimentar. Não é medicamento e não substitui uma alimentação equilibrada. Em uso de medicamentos ou gestação, consulte um profissional de saúde.',
    durationSec: 30,
    gradient: ['#2f9d6a', '#14603f'],
    storyboard: [
      { t: '0-5s', label: 'GANCHO', line: 'Come pouco peixe? Então provavelmente falta ômega 3 no seu dia.' },
      { t: '5-13s', label: 'POR QUE TOMAR', line: 'EPA e DHA vêm do peixe, o corpo não produz, e são eles que contribuem pro coração e ajudam o cérebro. Sem peixe quase todo dia, falta.' },
      { t: '13-21s', label: 'O PRODUTO', line: 'Uma cápsula por dia repõe o que faltou no prato: 540mg de EPA e 360mg de DHA.' },
      { t: '21-33s', label: 'POR QUE ESTE', line: 'Por que este e não outro? É a marca própria da Drogaria São Paulo: a farmácia bota o nome dela, com preço justo. E tem a linha completa — 120 pra economizar, Mini pra engolir fácil e Plus concentrado, sem gosto de peixe.' },
      { t: '33-38s', label: 'CTA', line: 'Uma por dia. Me chama que eu te ajudo a escolher a sua.' },
    ],
    ficha: [
      { label: 'O que é', value: 'Óleo de peixe — fonte de ômega 3 (EPA e DHA)' },
      { label: 'Concentração', value: '1000mg por cápsula' },
      { label: 'Ativos', value: 'EPA e DHA (confira a divisão no rótulo)' },
      { label: 'Formato', value: 'Cápsulas softgel — frascos de 60 e de 120' },
      { label: 'Dose', value: 'Conforme o rótulo, junto de uma refeição' },
      { label: 'Duração', value: 'Frasco de 120 = ~4 meses (1 cápsula/dia)' },
      { label: 'Para quem', value: 'Adultos que comem pouco peixe' },
    ],
  },
  {
    id: 'dsp-omega-3-plus',
    brand: 'dsp',
    family: 'dsp-omega-3',
    name: 'Ômega 3 Plus',
    category: 'capsulas',
    imageUrl: 'https://drogariasp.vteximg.com.br/arquivos/ids/1624320-1000-1000/891908---Suplemento-Alimentar-Omega-3-Plus-1050mg-Drogaria-Sao-Paulo-60-Capsulas-1.jpg?v=639053966414500000',
    tagline: 'Versão com concentração reforçada de ômega 3 — mais EPA e DHA por cápsula.',
    hook: 'Quer mais ômega 3 sem tomar mais cápsulas? A versão Plus é mais concentrada.',
    whatItIs:
      'O Ômega 3 Plus é a versão com concentração reforçada: entrega mais EPA e DHA por cápsula do que o Ômega 3 comum. É a escolha de quem quer uma dose maior sem aumentar a quantidade de cápsulas por dia.',
    benefits: [
      'Concentração reforçada de EPA e DHA por cápsula',
      'Mais ômega 3 sem precisar tomar mais cápsulas',
      'Mesmos benefícios do ômega 3 para coração e cérebro, em dose maior',
      'Indicado para quem já entendeu o valor e quer mais concentração',
    ],
    howToUse: 'Conforme o rótulo, junto de uma refeição.',
    forWho: 'Quem quer uma dose maior de ômega 3 por cápsula.',
    salesLine: 'Se você quer mais ômega 3 sem tomar mais cápsulas, o Plus é o caminho. Quer comparar com o comum?',
    objections: [
      { trigger: '"Qual a diferença pro normal?"', answer: 'O Plus é mais concentrado: mais EPA e DHA em cada cápsula. Mesma proposta, dose maior.' },
      { trigger: '"Preciso do Plus?"', answer: 'Depende do seu objetivo. Se busca uma dose maior de ômega 3, sim. Se é manutenção, o comum já cumpre.' },
      { trigger: '"É mais caro?"', answer: 'Por ser mais concentrado, costuma ser. Mas você toma menos cápsula para a mesma quantidade de ômega 3.' },
    ],
    compliance:
      'Suplemento alimentar. Não é medicamento e não substitui uma alimentação equilibrada. Em uso de medicamentos ou gestação, consulte um profissional de saúde.',
    durationSec: 30,
    gradient: ['#1f7a52', '#0e3f2a'],
    storyboard: [
      { t: '0-4s', label: 'GANCHO', line: 'Quer mais ômega 3 sem tomar mais cápsulas?' },
      { t: '4-14s', label: 'O PRODUTO', line: 'O Ômega 3 Plus é mais concentrado: mais EPA e DHA por cápsula.' },
      { t: '14-24s', label: 'PRA QUEM', line: 'Pra quem quer uma dose maior, sem aumentar a quantidade de cápsulas.' },
      { t: '24-30s', label: 'CTA', line: 'Quer comparar com o comum? Me chama.' },
    ],
    ficha: [
      { label: 'Diferencial', value: '1050mg por cápsula — concentração reforçada' },
      { label: 'Ativos', value: 'EPA e DHA em maior concentração (confira o rótulo)' },
      { label: 'Formato', value: 'Cápsulas softgel — frasco de 60' },
      { label: 'Dose', value: 'Conforme o rótulo, junto de uma refeição' },
      { label: 'Para quem', value: 'Quer mais ômega 3 sem tomar mais cápsulas' },
    ],
  },
  {
    id: 'dsp-omega-3-mini',
    brand: 'dsp',
    family: 'dsp-omega-3',
    name: 'Ômega 3 Mini Caps',
    category: 'capsulas',
    imageUrl: 'https://drogariasp.vteximg.com.br/arquivos/ids/1624318-1000-1000/891843---Suplemento-Alimentar-Omega-3-Mini-550mg-Drogaria-Sao-Paulo-60-Capsulas-1.jpg?v=639053966234230000',
    tagline: 'O mesmo ômega 3, em cápsula menor — fácil de engolir.',
    hook: 'Tem dificuldade de engolir cápsula grande? O ômega 3 também vem em versão mini.',
    whatItIs:
      'O Ômega 3 Mini Caps entrega o ômega 3 (EPA e DHA) numa cápsula menor, feita para quem tem dificuldade de engolir cápsulas grandes — idosos, quem tem refluxo ou simplesmente não se dá bem com softgel grande.',
    benefits: [
      'Cápsula menor — mais fácil de engolir',
      'O mesmo ômega 3 (EPA e DHA) para coração e cérebro',
      'Ideal para idosos e para quem tem dificuldade com cápsulas grandes',
      'Costuma incomodar menos no estômago',
    ],
    howToUse: 'Conforme o rótulo, junto de uma refeição.',
    forWho: 'Quem tem dificuldade de engolir cápsulas grandes.',
    salesLine: 'Se cápsula grande é um problema pra você, essa resolve. Quer ver?',
    objections: [
      { trigger: '"Não consigo engolir cápsula grande."', answer: 'É exatamente pra isso que a Mini existe: cápsula menor, mesmo ômega 3. Muito mais fácil de tomar.' },
      { trigger: '"Tem menos ômega que a normal?"', answer: 'A cápsula é menor, então pode precisar de mais unidades para a mesma dose — o rótulo indica. A vantagem é conseguir tomar.' },
      { trigger: '"É pra idoso?"', answer: 'É ótima pra idoso, mas serve pra qualquer pessoa que não se dá bem com cápsula grande.' },
    ],
    compliance:
      'Suplemento alimentar. Não é medicamento e não substitui uma alimentação equilibrada. Em uso de medicamentos ou gestação, consulte um profissional de saúde.',
    durationSec: 30,
    gradient: ['#3aa574', '#14603f'],
    storyboard: [
      { t: '0-4s', label: 'GANCHO', line: 'Cápsula grande é um problema pra você?' },
      { t: '4-14s', label: 'O PRODUTO', line: 'O Ômega 3 Mini traz o mesmo ômega 3 numa cápsula bem menor.' },
      { t: '14-24s', label: 'PRA QUEM', line: 'Idosos, quem tem refluxo, quem não engole cápsula grande.' },
      { t: '24-30s', label: 'CTA', line: 'Ficou fácil de tomar. Me chama que eu te mostro.' },
    ],
    ficha: [
      { label: 'Diferencial', value: '550mg — cápsula menor, fácil de engolir' },
      { label: 'Ativos', value: 'EPA e DHA (mesmo ômega 3; confira o rótulo)' },
      { label: 'Formato', value: 'Cápsulas softgel mini — frasco de 60' },
      { label: 'Dose', value: 'Conforme o rótulo, junto de uma refeição' },
      { label: 'Para quem', value: 'Dificuldade com cápsulas grandes' },
    ],
  },
  {
    id: 'dsp-melatonina-triptofano',
    brand: 'dsp',
    name: 'Melatonina + Triptofano',
    category: 'capsulas',
    imageUrl: 'https://drogariasp.vteximg.com.br/arquivos/ids/1926936-1000-1000/891959---MELATONINA-TRIPTOFANO-DSP-60-CPS-1.jpg?v=639141980457530000',
    tagline: 'Melatonina com triptofano — apoio para quem tem dificuldade de pegar no sono.',
    hook: 'Custa a pegar no sono ou tem a rotina de sono desregulada?',
    whatItIs:
      'A melatonina é o hormônio que sinaliza ao corpo que é hora de dormir; o triptofano é o aminoácido que o corpo usa para produzir serotonina e melatonina. Juntos, dão apoio a quem tem dificuldade de adormecer ou tem a rotina de sono bagunçada (trabalho em turnos, viagens, telas à noite).',
    benefits: [
      'Melatonina — o hormônio que regula o ciclo do sono',
      'Triptofano — aminoácido que o corpo usa para produzir serotonina e melatonina',
      'Apoio para quem custa a pegar no sono ou tem a rotina desregulada',
      'Cápsula, para uso à noite',
    ],
    howToUse:
      'Conforme o rótulo, à noite, um pouco antes de dormir. Ajuda combinar com boa higiene do sono (menos tela, ambiente escuro).',
    forWho: 'Adultos com dificuldade de pegar no sono ou rotina de sono desregulada.',
    salesLine: 'Se o problema é pegar no sono, vale conhecer. Quer que eu te explique como usar?',
    objections: [
      { trigger: '"Melatonina vicia?"', answer: 'Não. A melatonina é o próprio hormônio do sono que o corpo já produz — ela ajuda a regular o ciclo, não causa dependência.' },
      { trigger: '"É remédio de tarja?"', answer: 'Não, é suplemento alimentar. Mas se você usa outros medicamentos ou tem alguma condição, vale confirmar com o médico.' },
      { trigger: '"Posso tomar todo dia?"', answer: 'Conforme o rótulo. É bastante usada por quem tem a rotina de sono desregulada. Em caso de dúvida, o médico orienta.' },
      { trigger: '"Achei caro."', answer: '60 cápsulas — cerca de 2 meses. Uma noite mal dormida custa caro no dia seguinte.' },
    ],
    compliance:
      'Suplemento alimentar. Não é medicamento e não substitui acompanhamento profissional. Gestantes, lactantes e pessoas em uso de medicamentos devem consultar um médico. Insônia persistente: procure orientação médica.',
    durationSec: 30,
    gradient: ['#4f7bd6', '#26397a'],
    storyboard: [
      { t: '0-4s', label: 'GANCHO', line: 'Custa a pegar no sono? A rotina de sono está bagunçada?' },
      { t: '4-14s', label: 'O PRODUTO', line: 'Melatonina, o hormônio do sono, com triptofano, que o corpo usa pra produzi-lo.' },
      { t: '14-24s', label: 'COMO USAR', line: 'À noite, antes de dormir — junto de menos tela e ambiente escuro.' },
      { t: '24-30s', label: 'CTA', line: 'Suplemento, não vicia. Quer entender melhor? Me chama.' },
    ],
    ficha: [
      { label: 'O que é', value: 'Melatonina (hormônio do sono) + triptofano (aminoácido)' },
      { label: 'Ativos', value: 'Melatonina e L-triptofano (confira as doses no rótulo)' },
      { label: 'Formato', value: 'Cápsulas — frasco de 60' },
      { label: 'Dose', value: 'À noite, antes de dormir (conforme o rótulo)' },
      { label: 'Duração', value: 'Frasco de 60 = ~2 meses' },
      { label: 'Atenção', value: 'Não vicia. Gestantes e uso de medicamentos: consulte o médico' },
    ],
  },

  // ===================== VERTICAL AUTOMOTIVO — Ramasa =====================
  // A Ramasa vende as DUAS marcas do grupo: Jaecoo e Omoda.
  //
  // DE ONDE VEM O DADO, EM ORDEM DE QUEM MANDA:
  //   1. As fichas técnicas oficiais e o manual de garantia (01/09/2026).
  //   2. Os guias de venda e treinamentos da montadora, também publicados em
  //      Documentos: é DELES que vêm desempenho, consumo e autonomia — as
  //      fichas técnicas não trazem esses números. guia-jaecoo-7 (0-100, 79 km,
  //      1.200 km, 15,1 km/L, 44,5%, 17,4 cm, recarga), guia-omoda-7 (0-100,
  //      60 km), guia-omoda-e5 (345 km Inmetro, 0-100, coeficiente 0,281) e
  //      treinamento-omoda-5 (78% de aço).
  //   3. O site da marca (omodajaecoo.com.br, 11/08/2026), só para o resto.
  // Documento enviado SEMPRE ganha da internet. Quando os dois divergirem, o
  // documento vale e a internet sai.
  //
  // PREÇO NÃO ENTRA NA FICHA. Ele muda por campanha, e ficha desatualizada na
  // mão do vendedor vira promessa que a loja não cumpre. Quem responde preço é
  // a tabela do dia, não o app.
  //
  // Onde nem o documento nem o site trazem o número (consumo e autonomia do
  // Omoda 5, por exemplo), está escrito "confirmar" de propósito. Número de
  // carro inventado vira promessa que a concessionária não cumpre.
  //
  // As objeções são as reais do mercado — cada modelo trava numa diferente:
  // o Jaecoo trava em "é chinês", o híbrido em "preciso de tomada?", o elétrico
  // em "onde eu carrego?" e o topo de linha em "por esse preço eu pego outro".
  {
    id: 'jaecoo-7',
    brand: 'ramasa',
    category: 'jaecoo',
    family: 'jaecoo7',
    name: 'Jaecoo 7 SHS-P',
    tagline: 'O SUV que abre a Jaecoo no Brasil: SHS-P — híbrido plug-in em TODAS as versões, com pacote de série cheio para a faixa.',
    hook: 'O cliente gostou do carro, mas trava numa frase: "é chinês, né?"',
    whatItIs:
      'O Jaecoo 7 é o SUV que abre a marca Jaecoo no Brasil. A Jaecoo faz parte do grupo Chery, que está no país desde 2009. Chega em três versões: ELITE e as SHS Luxury e Prestige, que usam o sistema híbrido plug-in — motor 1.5 TGDI de 135 cv somado a um motor elétrico de 204 cv, com transmissão DHT de 3ª geração e bateria de lítio-ferro-fosfato de 18,3 kWh.',
    benefits: [
      'Sistema SHS: 1.5 TGDI de 135 cv + elétrico de 204 cv, com 44,5% de eficiência térmica declarada',
      'Pacote de série cheio para a faixa — teto solar panorâmico de 1,1 m², multimídia de 13,2" (14,8" na Prestige), painel digital de 10,25" e maçanetas retráteis',
      'Cinco estrelas no Euro NCAP, no teste de 2025 — o protocolo mais duro que já existiu',
      'Estrutura reforçada e pacote ADAS completo (AEB, ACC, LDW, TJA, FCW, CSA) — o guia da marca fala em estrutura reforçada, sem dar percentual',
      'Marca do grupo Chery, no Brasil desde 2009 — rede e peça já existem no país',
      'Gasta R$ 4.827 de combustível por ano contra R$ 8.798 do Corolla Cross — quase R$ 4 mil de diferença a cada 15 mil km (dados do guia de fábrica)',
      '279 cv combinados contra 175 cv do Corolla Cross, com motor MENOR: 1.5 turbo contra 2.0 aspirado',
      '7 anos ou 150.000 km de garantia total, e 8 anos ou 150.000 km na bateria — Corolla Cross e Compass dão 5, Taos dá 3',
    ],
    howToUse:
      'Na abordagem: leve o cliente para o test drive antes de falar de preço. O 7 vende no rodar e no acabamento — ficha isolada perde para a experiência. Se ele veio pelo preço, comece pela lista de série: é aí que a comparação vira a seu favor.',
    forWho:
      'Cliente que busca SUV médio, compara preço contra itens de série, e está aberto a marca nova desde que a assistência esteja resolvida.',
    salesLine: 'Me diz com quais carros você está comparando, que eu monto o item a item pra você levar e decidir com calma.',
    objections: [
      {
        trigger: '"E é seguro? Nunca vi esse carro batido."',
        answer:
          'Tem laudo, e do teste mais duro do mundo: cinco estrelas no Euro NCAP, avaliação de 2025. O protocolo europeu ficou bem mais exigente nos últimos anos, então cinco estrelas hoje vale mais do que cinco estrelas de cinco anos atrás. Posso te mandar o laudo completo agora — ele está aqui no meu app, com o teste inteiro em vídeo e foto.',
      },
      {
        trigger: '"Nunca ouvi falar dessa marca."',
        answer:
          'Justo — e é bom você perguntar. A Omoda e a Jaecoo são do grupo Chery, que está em 44 países e já vendeu mais de 570 mil veículos. No Reino Unido a marca fez 1,5% do mercado em menos de um ano; na Espanha, 20 mil carros em 17 meses. No Brasil passamos de mil unidades em menos de três meses. Não é aposta: é marca que já provou em mercado exigente.',
      },
      {
        trigger: '"Não tenho onde carregar o carro."',
        answer:
          'Então não carregue. Esse é o ponto do sistema SHS: você pode usar o Jaecoo 7 como um híbrido comum, só abastecendo no posto, e ele faz 15,1 km/L assim mesmo. A tomada é opção, não obrigação. Quem carrega ganha 79 km só no elétrico — e, somando os dois, dá até 1.200 km sem parar.',
      },
      {
        trigger: '"O carro é menor que o concorrente."',
        answer:
          'Por fora, um pouco. Por dentro é onde importa: entre-eixos de 2,67 m e porta-malas de 500 litros, que passa de 1.300 rebatendo os bancos. E o assoalho é plano, então cabe de verdade — não é número de folheto. Quer conferir? Vamos até o carro e você põe a mala de vocês dentro agora.',
      },
      {
        trigger: '"Tenho medo do pós-venda."',
        answer:
          'É a preocupação certa numa marca nova. O centro de distribuição de peças fica em Cajamar, São Paulo, com os itens essenciais em estoque — não depende de importar peça a peça. A assistência 24h é da Allianz, e a revisão é aqui, com a gente, com preço fixo publicado pela marca: a primeira sai por R$ 699, a segunda por R$ 1.379 e a terceira por R$ 1.138 — R$ 3.216 nos três primeiros anos. O preço é travado pelos 8 primeiros anos, então ele sabe hoje o que vai pagar.',
      },
      {
        trigger: '"A garantia tem limite de quilometragem."',
        answer:
          'Tem, e o número está no manual de garantia: 150.000 km, valendo o que vier primeiro entre isso e os 7 anos (8 anos na bateria). Vale fazer a conta com o cliente: o brasileiro roda em média 10 mil km por ano, então 150 mil km é bem mais do que ele vai rodar em 7 anos. Duas coisas que precisam ser ditas: no CNPJ ou uso comercial a garantia cai para 36 meses ou 100.000 km, e ela é cancelada se as revisões não forem feitas na rede autorizada, no prazo.',
      },
      {
        trigger: '"E a revenda? Vou perder muito."',
        answer:
          'Toda marca em entrada deprecia mais no começo, isso é verdade e não vou dizer o contrário. Só que a conta é dos dois lados: um concorrente chinês estabelecido depreciou 17,2% em 2025, o que deu quarenta mil reais. Some a isso o que você economiza de combustível e de revisão e a diferença muda de lado. Posso montar essa conta com o seu quilômetro real.',
      },
    ],
    compliance:
      'Itens de série, garantia, prazo de entrega e condições variam por versão e por campanha vigente. Confirme sempre na tabela e na condição do dia antes de prometer ao cliente.',
    fotos: ['/carros/jaecoo-7-1.jpg', '/carros/jaecoo-7-2.jpg', '/carros/jaecoo-7-3.jpg', '/carros/jaecoo-7-4.jpg'],
    destaques: [
      { titulo: 'São Paulo a Salvador sem parar no posto', prova: 'Até 1.200 km de autonomia somando tanque e bateria' },
      { titulo: 'A semana inteira sem gastar gasolina', prova: '79 km só no elétrico — mais que o trajeto diário da maioria' },
      { titulo: 'Anda como esportivo quando você pede', prova: 'De 0 a 100 km/h em 8,4 segundos' },
      { titulo: 'Céu aberto sobre a família inteira', prova: 'Teto solar panorâmico de 1,1 m²' },
      { titulo: 'A rua fica do lado de fora', prova: 'Vidros dianteiros duplos e som Sony de 8 alto-falantes' },
    ],
    durationSec: 45,
    gradient: ['#1e6fd9', '#0f3a75'],
    versoes: [
      {
        nome: 'ELITE',
        paraQuem: 'A porta de entrada — e já entrega o que a concorrência cobra à parte.',
        vemCom: [
          'Motor 1.5 TGDI de 135 cv com transmissão DHT e motor elétrico de 204 cv',
          'Bateria de 18,3 kWh',
          'Rodas de liga leve de 19"',
          'Conjunto óptico dianteiro e traseiro Full LED, com DRL em LED',
          'Maçanetas externas retráteis',
          'Retrovisores elétricos, rebatíveis e aquecidos',
          'Ar-condicionado automático digital dual zone',
          'Bancos dianteiros elétricos',
          'Iluminação ambiente',
          'Porta-malas elétrico com sensor de presença',
          'Carregador por indução com refrigeração',
          'Freio de estacionamento eletrônico com Auto Hold',
          'Sistema GPS nativo',
          'Painel de instrumentos digital de 10,25"',
          'Central multimídia de 13,2"',
          'Partida do motor sem botão (contactless power-on)',
          'Som com 6 alto-falantes',
          '6 airbags — frontais, laterais e de cortina',
          'Freio a disco nas 4 rodas, com ABS, EBD, BAS e BOS',
          'Sensores de estacionamento dianteiros e traseiros, e câmera de ré',
          'Espelho retrovisor interno eletrocrômico',
          'Pacote ADAS de direção inteligente (IHC, FCW, AEB, LDW, ACC, DAI, TJA e CSA)',
        ],
      },
      {
        nome: 'LUXURY',
        paraQuem: 'Pra quem quer o teto solar e o conforto do dia a dia sem ir pro topo.',
        herda: 'ELITE',
        vemCom: [
          'Bancos dianteiros com ventilação',
          'Teto solar panorâmico elétrico',
          'Airbag de joelho para o motorista',
          'Câmera 540º',
          'IOV — o aplicativo do carro',
          'Atualização remota OTA (Over-The-Air)',
        ],
      },
      {
        nome: 'PRESTIGE',
        paraQuem: 'O topo: é aqui que entram HUD, som Sony, dashcam e o ADAS 2.5.',
        herda: 'LUXURY',
        vemCom: [
          'Central multimídia de 14,8"',
          'Cockpit digital colorido (head-up display)',
          'Sistema de som Sony com 8 alto-falantes',
          'Dashcam',
          'Bancos dianteiros aquecidos',
          'Banco do motorista com memória e sistema Welcome',
          'Retrovisores com memória',
          'Iluminação de projeção externa nas portas',
          'Pacote ADAS 2.5 de proteção avançada (DOW, DMS, RCW, RCTB, BSD, ELK, LCA)',
        ],
      },
    ],
    fichaPdf: '/docs/ramasa/ficha-jaecoo-7.pdf',
    ficha: [
      { label: 'Marca', value: 'Jaecoo (grupo Chery)' },
      { label: 'Versões', value: 'ELITE · LUXURY · PRESTIGE (line-up MY27)' },
      { label: 'Tipo', value: 'Híbrido plug-in (SHS de 3ª geração) — roda como híbrido só abastecendo' },
      { label: 'Motor a combustão', value: '1.5 TGDI — 135 cv e 20,4 kgfm' },
      { label: 'Motor elétrico', value: '204 cv e 31,6 kgfm' },
      { label: '0 a 100 km/h', value: '8,4 segundos' },
      { label: 'Autonomia só no elétrico', value: '79 km' },
      { label: 'Autonomia total', value: 'até 1.200 km' },
      { label: 'Consumo sem carregar', value: '15,1 km/L' },
      { label: 'Eficiência térmica', value: '44,5% — um dos motores mais eficientes do mercado' },
      { label: 'Bateria', value: '18,3 kWh de lítio-ferro-fosfato (LFP) — mais durável e com menor risco de incêndio' },
      { label: 'Recarga', value: 'até 6,6 kW na tomada (AC) e até 40 kW na rápida (DC)' },
      { label: 'Tempo de carga (20% a 100%)', value: 'Tomada 220V de casa: 5h13 · wallbox de 7 ou 11 kW: 2h13 · rápido de 30 kW: 29 min · rápido de 80 kW: 22 min. Bateria menor que a de um elétrico, então carrega bem mais rápido.' },
      { label: 'Dimensões', value: '4.500 mm de comprimento · 1.865 de largura · 1.670 de altura' },
      { label: 'Entre-eixos', value: '2.672 mm' },
      { label: 'Porta-malas', value: '500 L — mais de 1.300 L com os bancos rebatidos' },
      { label: 'Altura do solo', value: '17,4 cm' },
      { label: 'Cores', value: 'Branco Arctic · Preto Andromeda · Prata Crest · Cinza Highland · Prata Crest e Cinza Highland também com teto preto — interior preto em todas' },
      { label: 'Potência combinada', value: '279 cv — é o número que a marca usa no comparativo (o Corolla Cross faz 175). A ficha técnica traz 339 cv e 510 Nm, que é a soma aritmética dos dois motores (135 + 204); no sistema, a entrega real é 279. Se o cliente chegar com os dois números, é essa a explicação.' },
      { label: 'Rodas', value: 'Liga leve aerodinâmica de 19" · pneus 235/50R19' },
      { label: 'Telas', value: 'Multimídia de 13,2" na ELITE e 14,8" na LUXURY e na PRESTIGE · painel digital de 10,25"' },
      { label: 'Som', value: '6 alto-falantes na ELITE · 4 + 2 tweeters na LUXURY · Sony com 4 + 4 tweeters na PRESTIGE' },
      { label: 'Segurança', value: '6 airbags na ELITE · 7 na LUXURY e na PRESTIGE (inclui airbag de joelho) · câmera 540°' },
      { label: 'Euro NCAP', value: '★★★★★ cinco estrelas, no teste de 2025 — o protocolo mais exigente já aplicado. O laudo completo está em Documentos.' },
      { label: 'Garantia', value: '7 anos ou 150.000 km no veículo · 8 anos ou 150.000 km na bateria de alta tensão · 5 anos ou 150.000 km na pintura e contra corrosão — sempre o que vier primeiro' },
      { label: 'Revisões', value: 'A cada 12 meses ou 10.000 km, o que vier primeiro' },
      { label: 'As três primeiras revisões', value: '1ª R$ 699 · 2ª R$ 1.379 · 3ª R$ 1.138 — R$ 3.216 nas três (preço fixo da marca, válido até 31/12/2026)' },
      { label: 'Garantia em uso comercial', value: '36 meses ou 100.000 km — vale para compra no CNPJ ou uso comercial' },
    ],
    storyboard: [
      { t: '0-5s', label: 'GANCHO', line: 'O cliente gostou do carro. Aí ele fala: "mas é chinês, né?"' },
      { t: '5-15s', label: 'A CAUSA', line: 'Marca nova assusta porque o cliente não tem referência. Ele não está negando o carro — está pedindo segurança.' },
      { t: '15-30s', label: 'O ARGUMENTO', line: 'Jaecoo é do grupo Chery, no Brasil desde 2009. Rede e peça existem aqui. E o SHS entrega 135 cv de motor a combustão mais 204 cv de elétrico.' },
      { t: '30-40s', label: 'A VIRADA', line: 'E o que mais fecha: até 1.200 km de autonomia somando tanque e bateria — São Paulo a Salvador sem parar no posto. São 79 km só no elétrico, mais que o trajeto diário da maioria. Some o teto panorâmico e o ADAS completo, que na concorrência são opcionais.' },
      { t: '40-45s', label: 'CTA', line: 'Agende o test drive e mande a condição por escrito — ela tem validade.' },
    ],
    niveis: [
      {
        titulo: 'Por dentro',
        foco: 'Passo 4 da montadora: o que o cliente sente ao sentar, antes de qualquer número.',
        storyboard: [
          { t: '0-8s', label: 'A REGRA', line: 'Não fale enquanto ele senta. Deixe cinco segundos de silêncio — é nesse tempo que o cliente decide se o carro é bom.' },
          { t: '8-20s', label: 'O TETO', line: 'Abra a cortina do teto panorâmico de 1,1 m² antes de ele entrar. A cabine muda de tamanho aos olhos dele, e isso não se explica: se mostra.' },
          { t: '20-32s', label: 'O SILÊNCIO', line: 'Feche a porta com ele dentro e pare de falar. Os vidros dianteiros duplos e o acabamento seguram o barulho da rua — se a loja for movimentada, melhor ainda.' },
          { t: '32-42s', label: 'O BANCO', line: 'Na LUXURY e na PRESTIGE, ventilação e aquecimento. Na PRESTIGE tem memória. Ligue o ventilado num dia quente e não diga nada.' },
          { t: '42-52s', label: 'O ESPAÇO', line: 'Abra o porta-malas: 500 litros, e mais de 1.300 rebatendo os bancos. Pergunte o que ele costuma carregar.' },
        ],
      },
      {
        titulo: 'Cabine e tecnologia',
        foco: 'Passo 5: as telas e o que elas resolvem — não a lista de recursos.',
        storyboard: [
          { t: '0-8s', label: 'A REGRA', line: 'Ninguém compra polegada. Mostre o que a tela RESOLVE, e deixe ele mexer.' },
          { t: '8-20s', label: 'AS TELAS', line: 'Multimídia de 14,8" na LUXURY e na PRESTIGE, 13,2" na ELITE, com painel digital de 10,25". Diga a versão junto do número, sempre.' },
          { t: '20-32s', label: 'O CELULAR', line: 'CarPlay e Android Auto sem fio. Peça o telefone dele e conecte na frente dele — leva dez segundos e vale mais que qualquer explicação.' },
          { t: '32-42s', label: 'A MANOBRA', line: 'Câmera 540° com imagem panorâmica. Estacione com ele vendo a tela: quem tem medo de garagem apertada compra aqui.' },
          { t: '42-52s', label: 'O ADAS', line: 'Pacote completo: frenagem automática, piloto adaptativo, assistente de faixa e de congestionamento. Guarde pro test drive, é lá que convence.' },
        ],
      },
      {
        titulo: 'Motorização',
        foco: 'Passo 6: o sistema SHS e a autonomia — o argumento que o time mais usa.',
        storyboard: [
          { t: '0-8s', label: 'O NÚMERO', line: 'Autonomia foi o argumento mais citado pelo time: nove de dezesseis vendedores. Comece por ele.' },
          { t: '8-20s', label: 'A AUTONOMIA', line: 'Até 1.200 km somando tanque e bateria. São Paulo a Salvador sem parar no posto. E 79 km só no elétrico, mais que o trajeto diário da maioria.' },
          { t: '20-32s', label: 'O SISTEMA', line: '1.5 TGDI de 135 cv mais elétrico de 204, com 44,5% de eficiência térmica. Sem carregar na tomada ele faz 15,1 km por litro na cidade.' },
          { t: '32-42s', label: 'A TOMADA', line: 'Carrega, mas não precisa. Quem instalar wallbox de 7 kW carrega em 2h13; na tomada de casa, 5h13; no rápido de 80 kW, 22 minutos.' },
          { t: '42-52s', label: 'A BATERIA', line: 'Lítio-ferro-fosfato de 18,3 kWh — a química mais resistente a temperatura. Garantia de 8 anos ou 150.000 km só nela.' },
        ],
      },
      {
        titulo: 'Contra o concorrente',
        foco: 'Os números que ganham do Haval, do Song Plus, do Corolla Cross e do Compass.',
        storyboard: [
          { t: '0-8s', label: 'A REGRA', line: 'Nunca fale mal do concorrente. Compare com número, que é o que o cliente consegue repetir em casa.' },
          { t: '8-20s', label: 'CONTRA O HAVAL', line: 'O porta-malas dele é maior, admita. Mas o nosso faz 15,1 km por litro contra 13,5, e as três primeiras revisões têm preço fixo publicado pela marca — abra a tabela no app e mostre na hora. Mais som Sony e aquecimento de banco, que ele não tem.' },
          { t: '20-32s', label: 'CONTRA O SONG PLUS', line: 'Ele é mais espaçoso no entre-eixos. Nós temos um ano a mais de garantia e 17,4 centímetros de altura do solo contra 15. E ele depreciou 17,2% em 2025 — a conta em reais você monta na frente do cliente, não decora no vídeo.' },
          { t: '32-42s', label: 'CONTRA O COROLLA CROSS', line: 'A garantia dele de dez anos é real, reconheça. Depois compare potência, autonomia e porta-malas: ganhamos nos três, e o acabamento fala por si no test drive.' },
          { t: '42-52s', label: 'CONTRA O COMPASS', line: 'Dois anos a mais de garantia, mais espaço, mais porta-malas. E ele faz 10,1 km por litro no urbano contra os nossos 15,1.' },
          { t: '52-58s', label: 'CTA', line: 'Pergunte qual ele está comparando e monte o item a item por escrito. É o papel que ele leva pra casa.' },
        ],
      },
      {
        titulo: 'Negociação difícil',
        foco: 'O que fazer quando ele diz que vai pensar, e como conduzir sem prometer o que a loja não cumpre.',
        storyboard: [
          { t: '0-6s', label: 'A FRASE', line: 'Vou pensar e te falo. Nove em cada dez vezes, isso não é dúvida sobre o carro.' },
          { t: '6-18s', label: 'O QUE É', line: 'É dúvida sobre a decisão: preço, cônjuge, medo de errar. Se você não descobrir qual das três, não tem o que responder.' },
          { t: '18-32s', label: 'A PERGUNTA', line: 'Pergunte: se fosse só por você, você levaria? A resposta separa objeção de produto de objeção de contexto.' },
          { t: '32-44s', label: 'A TRAVA', line: 'Nunca invente taxa, bônus ou prazo pra segurar o cliente. O que você prometer, a loja tem que entregar — e quem paga o vexame é você.' },
          { t: '44-54s', label: 'O QUE FAZER', line: 'Ofereça o que é seu pra dar: test drive, avaliação do usado e a condição vigente por escrito, com a validade nela.' },
          { t: '54-60s', label: 'CTA', line: 'Combine o próximo contato com dia e hora. Sem isso, você não fez follow-up: você ficou esperando.' },
        ],
      },
    ],
  },

  {
    // JAECOO 5 — o SUV compacto que abriu a pré-venda em setembro de 2026.
    //
    // O ponto de venda dele é diferente do 7: aqui o híbrido NÃO precisa de
    // tomada. É o carro para o cliente que quer economia de híbrido e mora em
    // apartamento sem ponto de recarga — a objeção que mais aparece no salão.
    //
    // Os números vêm da ficha do Carros na Web (versão Comfort 1.5 HEV) que a
    // Vivian indicou, com o comprimento completado por segunda fonte. Carro de
    // lançamento: confirme na tabela antes de prometer item de série.
    id: 'jaecoo-5',
    brand: 'ramasa',
    category: 'jaecoo',
    family: 'jaecoo5',
    name: 'Jaecoo 5 SHS-H',
    tagline: 'O SUV compacto da Jaecoo: híbrido de 224 cv que não precisa de tomada e faz quase 800 km de autonomia na cidade.',
    hook: 'O cliente quer a economia do híbrido, mas mora em apartamento sem tomada — e acha que isso o obriga a continuar no carro a gasolina.',
    whatItIs:
      'O Jaecoo 5 é o SUV compacto da marca, com o sistema SHS híbrido pleno: motor 1.5 TGDI turbo somado a um elétrico de 204 cv, 224 cv combinados e câmbio DHT de uma marcha. A bateria de 1,83 kWh se recarrega sozinha, na condução e na frenagem: o carro nunca vê uma tomada. Chega em duas versões — COMFORT e PRESTIGE —, abaixo do Jaecoo 7, para quem quer o mesmo pacote de tecnologia num carro de cidade.',
    benefits: [
      '224 cv combinados num SUV compacto — mais potência que a maioria dos rivais dessa faixa, que ficam entre 150 e 190 cv',
      'Híbrido pleno de verdade: recarrega na condução e na frenagem, sem tomada, sem wallbox e sem conta de luz',
      '15,5 km/l na cidade e 13,7 km/l na estrada — e a cidade, que costuma ser o pior número, aqui é o melhor',
      '791 km de autonomia urbana com um tanque de 51 litros: quem roda 40 km por dia abastece uma vez por mês',
      '0 a 100 km/h em 7,9 segundos — é o argumento do test drive, não da ficha',
      'A versão de entrada já vem com rodas 18", ar dual zone, seis airbags, freio de estacionamento eletrônico com auto hold, sensor de chuva e partida sem botão',
      'Na PRESTIGE: multimídia de 13,2" Ultra HD 2K, som Sony de 8 alto-falantes, câmera 540°, teto panorâmico Sky Screen, bancos ventilados e pacote ADAS 2.5 com 17 recursos',
      'Suspensão traseira independente multibraço, que a concorrência dessa faixa quase sempre entrega como eixo de torção',
      'Plataforma T1X, a mesma família de arquitetura dos outros SUVs do grupo — peça e rede já existem no Brasil',
    ],
    howToUse:
      'Comece perguntando onde ele mora e se tem garagem com tomada. Se a resposta for "não tenho onde carregar", o Jaecoo 5 é a resposta pronta: é o híbrido que não pede tomada. Depois leve para o test drive — 224 cv num compacto surpreendem, e a arrancada faz metade do trabalho.',
    forWho:
      'Cliente de SUV compacto que quer economia de combustível sem mudar a rotina: sem instalar carregador, sem planejar recarga, sem trocar o posto pela tomada.',
    salesLine: 'Me diz quanto você roda por dia e onde estaciona à noite, que eu te mostro em números o que esse carro muda na sua conta do mês.',
    objections: [
      {
        trigger: '"Híbrido não precisa de tomada?"',
        answer:
          'Esse não. O Jaecoo 5 é híbrido pleno: a bateria se recarrega sozinha, com o motor e com a frenagem. Você abastece no posto, como sempre fez, e a parte elétrica trabalha dentro do carro. Não tem wallbox, não tem obra na garagem e não tem conta de luz.',
      },
      {
        trigger: '"E se a bateria acabar no meio do caminho?"',
        answer:
          'Ela não acaba como a de um elétrico, porque não é ela que leva o carro sozinha. A bateria é de 1,83 kWh — pequena de propósito — e o sistema fica enchendo e usando o tempo todo. Se estiver vazia, o motor a combustão assume e ela volta a carregar em minutos rodando. O que você tem que olhar é o tanque: 51 litros, 791 km na cidade.',
      },
      {
        trigger: '"Não conheço a marca Jaecoo."',
        answer:
          'Justo, e é bom perguntar. A Jaecoo é do grupo Chery, que está no Brasil desde 2009 e vende em mais de 40 países. O centro de peças fica em Cajamar, São Paulo, e a revisão é aqui com a gente, com preço publicado pela marca. Se quiser, te mostro o Jaecoo 7, que é o irmão maior e já roda aqui — é a mesma engenharia.',
      },
      {
        trigger: '"É pequeno demais para a minha família?"',
        answer:
          'Vamos medir em vez de estimar: 4,38 m de comprimento, 2,62 m entre-eixos e porta-malas de 410 litros. O entre-eixos é o número que decide o espaço de quem senta atrás, e ele é grande para a categoria. Traga o carrinho de bebê ou a mala que você mais usa no test drive — a gente coloca dentro e você decide olhando, não imaginando.',
      },
      {
        trigger: '"Manutenção de híbrido é mais cara."',
        answer:
          'Na prática costuma ser o contrário: o motor elétrico ajuda na arrancada, o freio regenerativo poupa pastilha e o motor a combustão trabalha menos. A revisão é a mesma da rede, com preço publicado pela marca, e a gente pode ver o plano junto agora. O que encarece híbrido é bateria grande de plug-in — esta aqui é pequena.',
      },
      {
        trigger: '"Na Comfort também tem teto panorâmico?"',
        answer:
          'Não. O teto panorâmico Sky Screen é da PRESTIGE — e essa é uma das perguntas que mais aparece, então é melhor responder antes que ele descubra na entrega. Na COMFORT o pacote de conforto é outro: ar-condicionado digital de duas zonas, sensor de chuva, acendimento automático dos faróis e freio de estacionamento eletrônico com auto hold, tudo de série.',
      },
      {
        trigger: '"Quantas opções de roda tem?"',
        answer:
          'Uma só, e é a boa notícia: roda de liga leve aro 18" nas duas versões, com pneu 235/55 R18. No comparativo da própria marca, dos cinco concorrentes listados só o Renegade também entrega 18" — Creta, WR-V, Nivus e Atto 2 vêm de 17".',
      },
      {
        trigger: '"Qual a diferença entre a Comfort e a Prestige?"',
        answer:
          'A PRESTIGE tem tudo da COMFORT e acrescenta o pacote de tecnologia e conforto: multimídia de 13,2" Ultra HD 2K, comando de voz, karaokê, câmera 540° com sensores na frente e atrás, teto Sky Screen, faróis Full LED, porta-malas elétrico, keyless entry, som Sony de 8 alto-falantes, bancos dianteiros elétricos e ventilados, ADAS 2.5 com 17 recursos, carregador por indução com ventilação, iluminação ambiente, rack de teto e retrovisores rebatíveis. Motor e câmbio são os mesmos nas duas.',
      },
      {
        trigger: '"A partida da Comfort é igual à da Prestige?"',
        answer:
          'Parecida, mas não é a mesma coisa — e vale explicar. A COMFORT tem partida sem botão (Contactless Power-On): você entra com a chave no bolso e o carro liga. A chave presencial completa, o keyless entry, é da PRESTIGE. Na prática: nas duas você não usa a chave para ligar; na PRESTIGE você também não usa para destravar.',
      },
      {
        trigger: '"Quais cores eu posso pedir?"',
        answer:
          'Cinco. Preto Andrômeda, Azul Gaia e Cinza Centaurus saem nas duas versões. O Branco Artic com teto preto é exclusivo da PRESTIGE, e o Branco Artic liso, só na COMFORT. O interior é sempre preto, com forro de teto claro — não existe outra combinação para escolher.',
      },
      {
        trigger: '"Ele tem os assistentes de condução, o tal do ADAS?"',
        answer:
          'Na PRESTIGE, sim: pacote ADAS 2.5, com 17 recursos. Na COMFORT o que existe nessa linha é controle de velocidade de cruzeiro com limitador. Não prometa ADAS na COMFORT — esse é o tipo de item que o cliente vai procurar no primeiro fim de semana.',
      },
      {
        trigger: '"Quanto ele mede? Cabe na minha garagem?"',
        answer:
          'São 4,38 m de comprimento, 1,86 m de largura e 1,65 m de altura, com 2,62 m entre-eixos e porta-malas de 410 litros. É compacto o bastante para manobrar e estacionar na cidade, com porte de SUV. Se a garagem for apertada, me manda a medida que eu confiro com você antes da visita.',
      },
      {
        trigger: '"Por que não levo logo o Jaecoo 7?"',
        answer:
          'Pode levar, e eu te mostro os dois. A diferença é o uso: o 7 é plug-in, maior, e rende mais para quem tem onde carregar e faz muita estrada. O 5 é de cidade, não pede tomada e pesa menos no bolso na entrada. Me diz quantos quilômetros você roda por dia e onde o carro dorme, que a escolha se resolve sozinha.',
      },
    ],
    compliance:
      'Conteúdo por versão, cores e comparativos vieram do treinamento de lançamento da marca (24/09/2026). Carro de lançamento: itens, versões e prazo de entrega ainda podem mudar por lote — confirme na tabela vigente antes de prometer. Atenção a um número: a página de conteúdo do treinamento e a ficha técnica trazem 224 cv, e o slide do comparativo traz 279 cv. Enquanto a marca não confirmar, use 224 cv.',
    fotos: ['/carros/jaecoo-5-1.jpg', '/carros/jaecoo-5-2.jpg', '/carros/jaecoo-5-3.jpg', '/carros/jaecoo-5-4.jpg'],
    etiqueta: 'Lançamento',
    destaques: [
      { titulo: 'Economia de híbrido sem obra na garagem', prova: 'A bateria se recarrega sozinha, na condução e na frenagem' },
      { titulo: 'Um mês inteiro entre um posto e outro', prova: '791 km de autonomia urbana e tanque de 51 litros' },
      { titulo: 'Anda como carro grande quando você pisa', prova: '224 cv combinados e 0 a 100 km/h em 7,9 segundos' },
      { titulo: 'A cidade deixou de ser o pior consumo', prova: '15,5 km/l no urbano, contra 13,7 na estrada' },
      { titulo: 'Enxerga o que você não vê ao manobrar', prova: 'Câmera 540° com sensores na frente e atrás na PRESTIGE; câmera de ré com linhas-guia e sensores traseiros na COMFORT' },
      { titulo: 'Conteúdo de intermediária já na versão de entrada', prova: 'Rodas 18", ar dual zone, seis airbags e freio eletrônico com auto hold de série na COMFORT' },
    ],
    durationSec: 45,
    gradient: ['#2f7fe0', '#12406f'],
    // AS DUAS VERSÕES, COMO A MARCA PUBLICOU NO TREINAMENTO DE LANÇAMENTO.
    //
    // Esta lista substituiu a que tinha sido montada pela ficha de internet, e
    // não foi um detalhe: a de antes dava à COMFORT multimídia de 12", câmera
    // 360°, faróis full LED e chave presencial. Nada disso é dela — é tudo da
    // PRESTIGE. Vendedor que decora a lista errada promete na venda o que o
    // cliente não acha na entrega.
    versoes: [
      {
        nome: 'COMFORT',
        paraQuem: 'A versão de entrada — e já chega com o que a categoria costuma cobrar à parte.',
        vemCom: [
          'Motorização SHS-H com 224 cv',
          'Tanque de combustível de 51 L',
          'Rodas de liga leve de 18"',
          'Ar-condicionado automático digital Dual Zone',
          'Sensor de chuva',
          'Acendimento automático dos faróis',
          'Bancos em tecido',
          'Freio de estacionamento eletrônico com função Auto Hold',
          '6 airbags',
          'Partida sem botão (Contactless Power-On)',
          'Câmera de ré com linhas-guia e sensores de estacionamento traseiros',
          'Sistema de som com 6 alto-falantes',
          'Multimídia de 9" Full HD com Android Auto / Apple CarPlay sem fio',
          'Controle de velocidade de cruzeiro e limitador de velocidade',
        ],
      },
      {
        nome: 'PRESTIGE',
        paraQuem: 'Para quem não abre mão de teto, som e tela grande — é onde estão os itens que o cliente mostra para os outros.',
        herda: 'COMFORT',
        vemCom: [
          'Central multimídia de alta resolução com 13,2" (Ultra HD 2K, até 1.000 nits de brilho)',
          'Sistema de voz para comandos do veículo',
          'Sistema de karaokê',
          'Câmera panorâmica 540° com sensores dianteiros e traseiros',
          'Teto panorâmico Sky Screen',
          'Faróis dianteiros Full LED',
          'Porta-malas elétrico',
          'Keyless entry (chave presencial)',
          'Sistema de som premium Sony com 8 alto-falantes',
          'Bancos e volante revestidos em material premium sintético (Organosilicone)',
          'Bancos dianteiros elétricos e ventilados',
          'Pacote ADAS 2.5 com 17 recursos',
          'Carregador de celular por indução rápido com ventilação',
          'Iluminação ambiente',
          'Rack de teto longitudinal',
          'Retrovisores rebatíveis eletricamente',
        ],
      },
    ],
    fichaPdf: '/docs/ramasa/ficha-jaecoo-5.pdf',
    ficha: [
      { label: 'Marca', value: 'Jaecoo (grupo Chery)' },
      { label: 'Versões', value: 'COMFORT e PRESTIGE — mesmo motor e mesmo câmbio nas duas' },
      { label: 'Tipo', value: 'Híbrido pleno (SHS) — recarrega sozinho, nunca vê tomada' },
      { label: 'Motor a combustão', value: '1.5 TGDI turbo, injeção direta — 20,4 kgfm a 2.500 rpm' },
      { label: 'Motor elétrico', value: '204 cv e 31,6 kgfm, dianteiro' },
      { label: 'Potência combinada', value: '224 cv' },
      { label: 'Torque combinado', value: '30,1 kgfm' },
      { label: 'Bateria', value: '1,83 kWh — pequena de propósito: ela trabalha o tempo todo, não guarda energia para a semana' },
      { label: 'Câmbio', value: 'Automático DHT de 1 marcha, com embreagem multidisco' },
      { label: '0 a 100 km/h', value: '7,9 segundos' },
      { label: 'Velocidade máxima', value: '175 km/h' },
      { label: 'Consumo', value: '15,5 km/l na cidade · 13,7 km/l na estrada' },
      { label: 'Autonomia', value: '791 km urbana · 699 km rodoviária' },
      { label: 'Tanque', value: '51 litros' },
      { label: 'Dimensões', value: '4.380 mm de comprimento · 1.860 de largura · 1.650 de altura' },
      { label: 'Entre-eixos', value: '2.620 mm' },
      { label: 'Porta-malas', value: '410 litros' },
      { label: 'Suspensão', value: 'Independente nas quatro rodas — McPherson na frente, multibraço atrás' },
      { label: 'Rodas e pneus', value: 'Liga leve aro 18" nas duas versões · 235/55 R18 · estepe é kit de reparo' },
      { label: 'Multimídia', value: 'COMFORT: 9" Full HD com Android Auto e Apple CarPlay sem fio · PRESTIGE: 13,2" Ultra HD 2K, até 1.000 nits' },
      { label: 'Som', value: 'COMFORT: 6 alto-falantes · PRESTIGE: Sony premium com 8 alto-falantes' },
      { label: 'Câmeras e sensores', value: 'COMFORT: câmera de ré com linhas-guia e sensores traseiros · PRESTIGE: câmera 540° com sensores dianteiros e traseiros' },
      { label: 'Assistência à condução', value: 'COMFORT: cruise control com limitador · PRESTIGE: pacote ADAS 2.5 com 17 recursos' },
      { label: 'Teto', value: 'Panorâmico Sky Screen — só na PRESTIGE' },
      { label: 'Bancos', value: 'COMFORT: tecido · PRESTIGE: material premium sintético (Organosilicone), dianteiros elétricos e ventilados' },
      { label: 'Cores', value: 'Preto Andrômeda, Azul Gaia e Cinza Centaurus nas duas versões · Branco Artic com teto preto só na PRESTIGE · Branco Artic só na COMFORT' },
      { label: 'Interior', value: 'Sempre preto, com forro de teto claro — não há outra combinação' },
      { label: 'Plataforma', value: 'T1X' },
      { label: 'Lugares', value: '5' },
      { label: 'Fonte', value: 'Conteúdo por versão, cores e comparativos: treinamento de lançamento da marca, 24/09/2026. Números de motor, consumo e medidas: ficha técnica publicada. Carro de lançamento — confirme o line-up na tabela vigente.' },
    ],
    storyboard: [
      { t: '0-8s', label: 'A PERGUNTA QUE ABRE', line: 'Antes de falar do carro, pergunte: você tem onde carregar em casa? Se a resposta for não, o Jaecoo 5 é a resposta.' },
      { t: '8-18s', label: 'SEM TOMADA', line: 'Híbrido pleno: a bateria se recarrega na condução e na frenagem. Nada de wallbox, obra na garagem ou conta de luz.' },
      { t: '18-30s', label: 'O NÚMERO QUE SURPREENDE', line: '224 cv combinados num SUV compacto, e 0 a 100 em 7,9 segundos. A concorrência dessa faixa fica entre 150 e 190 cv.' },
      { t: '30-40s', label: 'A CONTA DO MÊS', line: '15,5 km/l na cidade e 791 km de autonomia urbana. Quem roda 40 km por dia abastece uma vez por mês.' },
      { t: '40-45s', label: 'O FECHAMENTO', line: 'Pergunte quanto ele roda por dia e onde o carro dorme. É com essas duas respostas que você mostra a economia em números.' },
    ],
    // SEIS NÍVEIS, agora com a versão no meio de tudo.
    //
    // O treinamento de lançamento (24/09/2026) trouxe duas versões, o conteúdo
    // item por item, as cores e dois comparativos. Os níveis 3 e 6 foram
    // reescritos por causa disso — o que estava aqui dava à COMFORT itens que
    // são da PRESTIGE — e o nível 5 nasceu com a pergunta que decide a venda.
    niveis: [
      {
        titulo: 'Por dentro',
        foco: 'Passo 3 da marca — a lateral: porte de SUV, as rodas de série e a segurança que já vem na versão de entrada.',
        storyboard: [
          { t: '0-10s', label: 'A LATERAL', line: 'A linha de cintura alta dá o porte de SUV, e as linhas retas rendem espaço para gente e bagagem. As rodas 18 são de série nas duas versões — a categoria quase toda entrega 17.' },
          { t: '10-22s', label: 'O ESPAÇO DE TRÁS', line: 'Sente atrás com ele. São 2,62 m entre-eixos para um carro de 4,38 m: é aí que o Jaecoo 5 ganha da categoria.' },
          { t: '22-34s', label: 'O PORTA-MALAS', line: '410 litros. Peça para ele trazer o carrinho ou a mala de sempre no test drive: colocar dentro vale mais que dizer o número.' },
          { t: '34-45s', label: 'SEGURANÇA DE SÉRIE', line: 'Seis airbags desde a COMFORT — frontais, laterais e de cortina. É proteção na versão de entrada, não item de versão cara.' },
        ],
      },
      {
        titulo: 'Cabine e tecnologia',
        foco: 'Passo 6 da marca — a cabine, versão por versão. É aqui que o vendedor mais promete o que não é da COMFORT.',
        storyboard: [
          { t: '0-12s', label: 'A TELA MUDA COM A VERSÃO', line: 'COMFORT: multimídia de 9 polegadas Full HD, com Android Auto e CarPlay sem fio. PRESTIGE: 13,2 polegadas, Ultra HD 2K e até mil nits — lê claro mesmo com sol batendo.' },
          { t: '12-24s', label: 'A MANOBRA', line: 'COMFORT tem câmera de ré com linhas-guia e sensores atrás. PRESTIGE tem câmera panorâmica 540 com sensores na frente e atrás. Não prometa 540 na COMFORT.' },
          { t: '24-34s', label: 'A CONDUÇÃO ASSISTIDA', line: 'O pacote ADAS 2.5, com 17 recursos, é da PRESTIGE. Na COMFORT o que existe nessa linha é o controle de cruzeiro com limitador.' },
          { t: '34-45s', label: 'O QUE ELE VAI MOSTRAR AOS OUTROS', line: 'Na PRESTIGE: bancos dianteiros elétricos e ventilados, som Sony de 8 alto-falantes, teto Sky Screen, karaokê e carregador por indução com ventilação.' },
        ],
      },
      {
        titulo: 'Motorização',
        foco: 'O sistema SHS sem tomada — o argumento que fecha com quem mora em apartamento.',
        storyboard: [
          { t: '0-10s', label: 'COMO FUNCIONA', line: 'Dois motores: 1.5 turbo e um elétrico de 204 cv. O câmbio DHT tem uma marcha só, então não existe solavanco de troca.' },
          { t: '10-22s', label: 'A BATERIA', line: '1,83 kWh. Pequena de propósito: ela enche e esvazia o tempo todo com a frenagem, em vez de guardar energia para a semana.' },
          { t: '22-34s', label: 'O CONSUMO', line: '15,5 km/l na cidade contra 13,7 na estrada. Repare na inversão: no trânsito parado o elétrico trabalha, e é lá que ele economiza.' },
          { t: '34-45s', label: 'A CONTA', line: 'Some tanque e consumo: 791 km urbanos com 51 litros. Faça a conta do mês com o quilômetro real do cliente, na frente dele.' },
        ],
      },
      {
        titulo: 'COMFORT ou PRESTIGE',
        foco: 'A pergunta que decide a venda agora que o carro tem duas versões — e as cores de cada uma.',
        storyboard: [
          { t: '0-10s', label: 'NÃO PERGUNTE A VERSÃO', line: 'Pergunte do que ele não abre mão: teto aberto, som bom ou tela grande. A resposta escolhe a versão sozinha — e você não vira tabelista.' },
          { t: '10-22s', label: 'O QUE A COMFORT JÁ TEM', line: '224 cv, rodas 18, ar dual zone, seis airbags, freio eletrônico com auto hold, sensor de chuva e partida sem botão. É entrada com conteúdo de intermediária.' },
          { t: '22-34s', label: 'O QUE SÓ A PRESTIGE TEM', line: 'Tela de 13,2, som Sony de 8 alto-falantes, câmera 540, teto Sky Screen, ADAS 2.5, bancos ventilados, porta-malas elétrico e keyless entry.' },
          { t: '34-45s', label: 'AS CORES', line: 'Preto Andrômeda, Azul Gaia e Cinza Centaurus nas duas. Branco Artic com teto preto só na PRESTIGE; Branco Artic liso só na COMFORT. Interior sempre preto, forro de teto claro.' },
        ],
      },
      {
        titulo: 'Contra o concorrente',
        foco: 'O comparativo oficial da marca, versão por versão — quem ela escolheu para comparar e onde ganha.',
        storyboard: [
          { t: '0-12s', label: 'A LISTA DA COMFORT', line: 'A marca compara com Creta Limited, WR-V EXL, Nivus Highline, Renegade Longitude e Atto 2 GL. Potência: 224 cv contra 120, 126, 128, 176 e 177.' },
          { t: '12-24s', label: 'OS ITENS DA COMFORT', line: 'Rodas 18: só o Jaecoo e o Renegade. Ar dual zone, freio eletrônico e partida contactless: só o Jaecoo e o Atto 2 têm os três. Sensor de chuva com acendimento automático: Jaecoo e Nivus.' },
          { t: '24-36s', label: 'A LISTA DA PRESTIGE', line: 'Contra Creta Platinum, HR-V EXL, T-Cross Highline, Renegade Willys e Atto 2 GS, cinco itens são só dele: som Sony de 8 alto-falantes, câmera 540, bancos ventilados, porta-malas elétrico e a tela de 13,2 — os outros vão de 8 a 12,8 polegadas.' },
          { t: '36-45s', label: 'COMO USAR', line: 'Compare item com item, sem atacar a marca do outro. E não prometa na COMFORT o que é da PRESTIGE: é aí que o comparativo vira reclamação na entrega.' },
        ],
      },
      {
        titulo: 'Negociação difícil',
        foco: 'O que fazer quando ele diz que vai pensar — sem prometer o que a loja não cumpre.',
        storyboard: [
          { t: '0-10s', label: 'O "VOU PENSAR"', line: 'Pergunte o que exatamente ficou em aberto: preço, prazo de entrega, ou a marca. Cada um tem uma resposta diferente, e adivinhar custa a venda.' },
          { t: '10-22s', label: 'SE FOR A MARCA', line: 'Mostre o Jaecoo 7 rodando aqui, o centro de peças em Cajamar e a revisão com preço publicado. Marca nova se responde com estrutura, não com promessa.' },
          { t: '22-34s', label: 'SE FOR PREÇO', line: 'Não invente desconto. Abra a condição vigente, faça a simulação com a entrada dele e ofereça a avaliação do carro na troca.' },
          { t: '34-45s', label: 'O COMBINADO', line: 'Termine com data: test drive marcado ou retorno com a proposta por escrito. Atendimento sem próximo passo é atendimento perdido.' },
        ],
      },
    ],
  },
  {
    id: 'omoda-5-shs-h',
    brand: 'ramasa',
    category: 'omoda',
    family: 'omoda5',
    name: 'Omoda 5 SHS-H',
    tagline: 'SUV híbrido que não precisa de tomada: se recarrega sozinho, rodando. É a porta de entrada da Omoda.',
    hook: 'O cliente quer economizar combustível, mas acha que híbrido dá trabalho.',
    whatItIs:
      'O Omoda 5 SHS-H é o SUV híbrido de entrada da marca. Usa o motor 1.5 TGDI HEV: o sistema alterna sozinho entre elétrico e combustão, e a bateria se recarrega rodando — o cliente não precisa de tomada nem de instalação em casa. Por dentro traz painel digital flutuante de 24,6", som Sony de 8 alto-falantes e bancos dianteiros elétricos com ventilação e aquecimento.',
    benefits: [
      'Híbrido que NÃO precisa de tomada: recarrega sozinho enquanto roda — zero mudança na rotina do cliente',
      'Painel digital flutuante de 24,6" (duas telas de 12,3") nas duas versões — som Sony com 8 alto-falantes só na PRESTIGE; a LUXURY tem 6',
      'Bancos dianteiros elétricos, ventilados e aquecidos — item que costuma ser opcional caro na concorrência',
      'Cinco estrelas no Euro NCAP — e a nota vale para todas as versões do Omoda 5',
      '7 airbags e carroceria com 78% de aço de alta resistência',
      '7 anos ou 150.000 km de garantia total, e 8 anos ou 150.000 km na bateria — uma das maiores do mercado brasileiro',
    ],
    howToUse:
      'A dúvida número um deste carro é "preciso de tomada?". Responda isso nos primeiros trinta segundos: não precisa. Depois disso a conversa flui, porque o resto é conforto — e conforto se vende no test drive, não na ficha.',
    forWho:
      'Cliente urbano que roda muito na cidade, quer cortar combustível e não quer obra em casa nem depender de eletroposto.',
    salesLine: 'Ele se recarrega sozinho enquanto roda — nada de tomada em casa. Quer dar uma volta pra sentir a diferença?',
    objections: [
      {
        trigger: '"Híbrido não precisa de tomada em casa?"',
        answer:
          'Este não — e dá pra provar. O treinamento da própria montadora tem uma tabela comparando os dois sistemas lado a lado: na coluna do SHS-H, que é este carro, a linha “carrega na tomada?” responde NÃO. Ele se recarrega sozinho enquanto você roda, no freio e no motor; você abastece no posto, como sempre. Quem carrega na tomada é o SHS-P, do Omoda 7 e do Jaecoo 7 — e aí é escolha, não obrigação.',
      },
      {
        trigger: '"E se a bateria pifar? Deve custar uma fortuna."',
        answer:
          'É a pergunta certa. A bateria é de lítio-ferro-fosfato, a química mais durável do mercado e com menor risco de incêndio, com sistema monitorando carga e temperatura o tempo todo. A garantia dela é própria, separada da do carro: 8 anos ou 150.000 km, o que vier primeiro — está no manual de garantia da montadora, e eu te mando o documento.',
      },
      {
        trigger: '"Manutenção de híbrido é mais cara, né?"',
        answer:
          'Na prática costuma ser o contrário: o motor elétrico assume boa parte do trabalho, então freio e motor sofrem menos. E a marca trabalha com revisão de preço baixo — no Jaecoo a primeira sai por 699 reais. Posso levantar a tabela deste modelo pra você comparar com o que paga hoje.',
      },
      {
        trigger: '"Nunca ouvi falar dessa marca."',
        answer:
          'A Omoda é do grupo Chery: 44 países e mais de 570 mil veículos vendidos. No Reino Unido, 1,5% do mercado em menos de um ano. No Brasil passamos de mil unidades em menos de três meses, e a assistência é nossa, com centro de peças em Cajamar e apoio 24h da Allianz.',
      },
      {
        trigger: '"É seguro? É um carro que eu não conheço."',
        answer:
          'O Omoda 5 tirou cinco estrelas no Euro NCAP. E tem um detalhe que costuma pesar: o laudo diz que a nota vale para TODAS as versões do Omoda 5, não só para a que foi testada. São 7 airbags, câmera 540° e 78% da carroceria em aço de alta resistência. O laudo completo está aqui no app e eu te mando agora.',
      },
      {
        trigger: '"Prefiro um Corolla Cross ou um HR-V, que já conheço."',
        answer:
          'São carros bons, sem discussão. A comparação justa é item a item na mesma faixa: veja o que vem de série aqui — painel de 24,6 polegadas, som Sony, bancos ventilados e aquecidos, sete airbags com o central dianteiro, câmera 360. Depois dirija os dois. Se o outro te convencer rodando, é a escolha certa; só não decida sem sentir este.',
      },
    ],
    compliance:
      'Consumo, autonomia, itens de série e garantia variam por versão e por campanha. Confirme na ficha técnica oficial e na condição vigente antes de falar número com o cliente.',
    fotos: ['/carros/omoda-5-shs-h-1.jpg', '/carros/omoda-5-shs-h-2.jpg', '/carros/omoda-5-shs-h-3.jpg', '/carros/omoda-5-shs-h-4.jpg'],
    destaques: [
      { titulo: 'De São Paulo a Vitória com um tanque', prova: 'Híbrido que se recarrega sozinho, sem tomada' },
      { titulo: 'Você não muda nada na sua rotina', prova: 'Abastece no posto, como sempre fez' },
      { titulo: 'Sete airbags, incluindo um entre os da frente', prova: 'Airbag central dianteiro, item que a concorrência não traz' },
      { titulo: 'Verão e inverno resolvidos no banco', prova: 'Bancos ventilados e aquecidos, com ajuste elétrico' },
      { titulo: 'Enxerga o que você não vê ao manobrar', prova: 'Câmera 360° e porta-malas elétrico com sensor de presença' },
    ],
    durationSec: 45,
    gradient: ['#3f8f8a', '#123a3c'],
    versoes: [
      {
        nome: 'LUXURY',
        paraQuem: 'A de entrada do Omoda 5 — já com teto solar e as duas telas de 12,3".',
        vemCom: [
          'Motor 1.5T HEV com transmissão DHT',
          'Bateria de 1,8 kWh',
          'Rodas de 18"',
          'Faróis em LED com sensor crepuscular e lanternas em LED',
          'Espelhos aquecidos e com rebatimento',
          'Teto solar elétrico',
          'Bancos em tecido + tecido premium',
          'Volante multifuncional em couro',
          'Painel digital de 12,3" e central multimídia de 12,3"',
          'Som com 6 alto-falantes',
          'Piloto automático',
          'Ar-condicionado dual zone',
          '7 airbags',
          'ABS + VSC + TRC',
          'Câmera 360º',
          'Sensor de estacionamento dianteiro e traseiro',
          'TPMS — monitoramento de pressão dos pneus',
        ],
      },
      {
        nome: 'PRESTIGE',
        paraQuem: 'Pra quem senta no banco e decide: revestimento premium, ventilação e som Sony.',
        herda: 'LUXURY',
        vemCom: [
          'Porta-malas elétrico',
          'Bancos com revestimento premium',
          'Bancos dianteiros elétricos, aquecidos e ventilados',
          'Espelho interno eletrocrômico',
          'Sistema de som Sony com 8 alto-falantes',
          'Sensor de chuva',
          'Carregador sem fio de 50 W com refrigeração',
          'Pacote ADAS 2.5',
        ],
      },
    ],
    fichaPdf: '/docs/ramasa/ficha-omoda-5.pdf',
    ficha: [
      { label: 'Marca', value: 'Omoda (grupo Chery)' },
      { label: 'Versões', value: 'SHS-H Luxury · SHS-H Prestige' },
      { label: 'Tipo', value: 'Híbrido autorrecarregável (HEV) — NÃO carrega na tomada. O treinamento do SHS responde em tabela, lado a lado com o Omoda 7: “Carrega na tomada? NÃO” no SHS-H contra “SIM” no SHS-P. Sem carregamento AC/DC e sem autonomia EV, porque não tem. A linha “PHEV” que aparece na ficha técnica é erro de template.' },
      { label: 'Motor a combustão', value: '1.5 TGDI — 135 cv e 20,4 kgfm' },
      { label: 'Motor elétrico', value: '204 cv e 31,6 kgfm' },
      { label: 'Potência combinada', value: '224 cv e 30,1 kgfm' },
      { label: 'Transmissão', value: 'DHT' },
      { label: 'Bateria', value: '1,83 kWh' },
      { label: 'Dimensões', value: '4.447 mm de comprimento · 1.824 de largura · 1.588 de altura' },
      { label: 'Entre-eixos', value: '2.610 mm' },
      { label: 'Porta-malas', value: '372 L' },
      { label: 'Telas', value: 'Multimídia de 12,3" e painel de 12,3" — o conjunto que a marca chama de painel flutuante de 24,6"' },
      { label: 'Som', value: '6 alto-falantes na LUXURY · Sony com 8 na PRESTIGE' },
      { label: 'Conforto', value: 'Teto solar elétrico nas duas · bancos dianteiros elétricos, ventilados e aquecidos só na PRESTIGE' },
      { label: 'Rodas', value: 'Liga leve de 18" nas duas versões' },
      { label: 'Segurança', value: '7 airbags · câmera 540° · TPMS · HAC e HDC · ADS 2.5 com 15 recursos (PRESTIGE)' },
      { label: 'Euro NCAP', value: '★★★★★ cinco estrelas — e o laudo diz que a nota vale para TODAS as versões do Omoda 5. O laudo completo está em Documentos.' },
      { label: 'Consumo (gasolina)', value: '15,1 km/L na cidade e 13,2 km/L na estrada — o melhor da comparação da própria marca contra Corolla Cross, Song Plus, Compass e Taos' },
      { label: 'Tanque', value: '51 L' },
      { label: 'Autonomia', value: 'RECORDE de 1.306 km com um tanque, de São Paulo a Vitória, na maratona da marca. É marca de condução econômica, não número de todo dia — a conta normal é o tanque vezes o consumo acima.' },
      { label: '0 a 100 km/h', value: '7,9 segundos' },
      { label: 'Velocidade máxima', value: '175 km/h' },
      { label: 'Altura livre do solo', value: '145 mm' },
      { label: 'Peso', value: '1.546 kg em ordem de marcha' },
      { label: 'Cores', value: 'Branco Arctic · Prata Alya · Preto Andromeda · Cinza Centaurus — interior preto' },
      { label: 'Garantia', value: '7 anos ou 150.000 km no veículo · 8 anos ou 150.000 km na bateria de alta tensão · 5 anos ou 150.000 km na pintura e contra corrosão — sempre o que vier primeiro' },
      { label: 'Revisões', value: 'A cada 12 meses ou 10.000 km, o que vier primeiro' },
      { label: 'As três primeiras revisões', value: '1ª R$ 698,54 · 2ª R$ 1.379 · 3ª R$ 839 — R$ 2.916,54 nas três (preço fixo da marca, válido até 31/12/2026)' },
      { label: 'Garantia em uso comercial', value: '36 meses ou 100.000 km — vale para compra no CNPJ ou uso comercial' },
    ],
    storyboard: [
      { t: '0-5s', label: 'GANCHO', line: '"Híbrido eu preciso ligar na tomada?" — é a primeira pergunta que você vai ouvir.' },
      { t: '5-15s', label: 'A RESPOSTA', line: 'Não precisa. O SHS-H se recarrega sozinho enquanto roda. O cliente abastece no posto, como sempre.' },
      { t: '15-30s', label: 'O ARGUMENTO', line: 'Resolvida a tomada, mostre o resto: painel de 24,6", 7 airbags e câmera 540°. Som Sony e bancos ventilados são só da PRESTIGE — confira a versão antes de citar.' },
      { t: '30-40s', label: 'A VIRADA', line: 'Aí venha com o número: 15,1 km por litro na cidade, o melhor do comparativo da própria marca contra Corolla Cross e HR-V. E o recorde da marca foi São Paulo a Vitória com um tanque só — 1.306 km. Diga que é recorde, não o número de todo dia.' },
      { t: '40-45s', label: 'CTA', line: 'Leve pro test drive: economia de combustível se sente rodando, não na tabela.' },
    ],
    niveis: [
      {
        titulo: 'Por dentro',
        foco: 'Passo 4 da montadora: o interior de um SUV de entrada que não parece de entrada.',
        storyboard: [
          { t: '0-8s', label: 'A REGRA', line: 'Este é o carro de entrada da Omoda. O cliente entra esperando pouco — use isso a favor e deixe ele sentar antes de falar.' },
          { t: '8-20s', label: 'O TETO', line: 'Teto solar com acionamento elétrico nas duas versões. Abra antes de ele entrar: num carro dessa faixa, isso não é comum.' },
          { t: '20-32s', label: 'O ACABAMENTO', line: 'Revestimento soft-touch nas portas e no painel central, bancos em material premium sintético. Peça pra ele passar a mão no painel.' },
          { t: '32-42s', label: 'O BANCO', line: 'Ventilação e aquecimento só na PRESTIGE — diga a versão. Na LUXURY os bancos são revestidos, mas sem ventilação.' },
          { t: '42-52s', label: 'O ESPAÇO', line: '372 litros de porta-malas e iluminação ambiente customizável. Pergunte quem anda no banco de trás no dia a dia.' },
        ],
      },
      {
        titulo: 'Cabine e tecnologia',
        foco: 'Passo 5: as duas telas e o que muda entre LUXURY e PRESTIGE.',
        storyboard: [
          { t: '0-8s', label: 'A REGRA', line: 'Aqui a diferença entre as versões é grande. Errar isso vira promessa quebrada na entrega.' },
          { t: '8-20s', label: 'AS TELAS', line: 'Duas telas de 12,3" — multimídia e painel — que a marca chama de painel flutuante de 24,6". Isso vem nas DUAS versões.' },
          { t: '20-32s', label: 'O SOM', line: 'Sony com 8 alto-falantes é só da PRESTIGE. A LUXURY tem 6 alto-falantes comuns. Nunca prometa Sony sem confirmar a versão.' },
          { t: '32-42s', label: 'O CELULAR', line: 'CarPlay e Android Auto sem fio nas duas, e reconhecimento de voz para comandos. Carregador por indução de 50W com refrigeração só na PRESTIGE.' },
          { t: '42-52s', label: 'A SEGURANÇA', line: '7 airbags e câmera 540° nas duas. O pacote ADS 2.5, com 15 recursos de assistência, é da PRESTIGE.' },
        ],
      },
      {
        titulo: 'Motorização',
        foco: 'Passo 6: o híbrido que não precisa de tomada, e o número que prova.',
        storyboard: [
          { t: '0-8s', label: 'A PERGUNTA', line: 'Toda apresentação deste carro passa por aqui: precisa ligar na tomada? Não. E você tem como provar.' },
          { t: '8-20s', label: 'A PROVA', line: 'O treinamento da montadora compara os dois sistemas lado a lado: no SHS-H a linha "carrega na tomada?" responde NÃO. Mostre o documento no app.' },
          { t: '20-32s', label: 'COMO FUNCIONA', line: '1.5 TGDI de 135 cv mais elétrico de 204, 224 cv combinados, com transmissão DHT. A bateria de 1,83 kWh se recarrega no freio e no motor.' },
          { t: '32-42s', label: 'O CONSUMO', line: '15,1 km por litro na cidade e 13,2 na estrada — o melhor do comparativo da própria marca contra Corolla Cross, HR-V e Creta.' },
          { t: '42-52s', label: 'O RECORDE', line: 'Na maratona da marca, São Paulo a Vitória com um tanque: 1.306 km. Diga que é recorde de condução econômica, não número de todo dia.' },
        ],
      },
      {
        titulo: 'Contra o concorrente',
        foco: 'Onde o híbrido ganha do carro a combustão que o cliente já conhece.',
        storyboard: [
          { t: '0-6s', label: 'A SITUAÇÃO', line: 'Ele está comparando com um SUV a combustão que todo mundo conhece. E gosta do que conhece.' },
          { t: '6-18s', label: 'A CONTA CERTA', line: 'Não compare preço de tabela: compare o custo do mês. Combustível é a parcela que ninguém coloca na planilha e todo mundo paga.' },
          { t: '18-32s', label: 'A PERGUNTA', line: 'Pergunte quanto ele gasta de combustível por mês hoje. O número sai da boca dele, não da sua — e aí ele acredita.' },
          { t: '32-44s', label: 'O CUIDADO', line: 'Não prometa consumo. Use o número do Inmetro e diga que depende do uso. Prometer consumo é a reclamação mais comum do pós-venda.' },
          { t: '44-52s', label: 'O RESTO', line: 'Depois da conta, mostre o pacote: painel de 24,6 polegadas, som Sony, bancos ventilados e aquecidos, 7 airbags.' },
          { t: '52-58s', label: 'CTA', line: 'Test drive no trânsito da tarde — é onde o híbrido mais aparece.' },
        ],
      },
      {
        titulo: 'A dúvida técnica',
        foco: 'Bateria, manutenção e revenda: as três perguntas que travam o híbrido.',
        storyboard: [
          { t: '0-6s', label: 'A DÚVIDA', line: 'E se a bateria pifar? Quanto custa? É a pergunta que mata a venda se você hesitar.' },
          { t: '6-18s', label: 'O QUE DIZER', line: 'A bateria é de lítio-ferro-fosfato, a química mais durável, com gerenciamento monitorando carga e temperatura o tempo todo.' },
          { t: '18-30s', label: 'O QUE NÃO DIZER', line: 'Não invente prazo de garantia. Confirme o vigente com a gerência e mande por escrito. Número errado aqui vira processo.' },
          { t: '30-42s', label: 'MANUTENÇÃO', line: 'No dia a dia costuma custar menos: o motor elétrico assume boa parte do trabalho, então freio e motor sofrem menos.' },
          { t: '42-54s', label: 'REVENDA', line: 'Seja honesto: o mercado de híbrido ainda está formando referência. Em compensação, ele entra pagando menos e gasta menos no uso.' },
          { t: '54-60s', label: 'CTA', line: 'Ofereça a tabela de revisão. Cliente que vê o custo de manutenção decide mais rápido.' },
        ],
      },
    ],
  },

  {
    id: 'omoda-e5',
    brand: 'ramasa',
    category: 'omoda',
    family: 'omodae5',
    name: 'Omoda E5',
    tagline: 'SUV 100% elétrico da Omoda: silêncio total, tecnologia de topo e a conta de combustível que sai da vida do cliente.',
    hook: 'O cliente quer o elétrico, mas a primeira coisa que ele pergunta é: "e onde eu carrego?"',
    whatItIs:
      'O Omoda E5 é o SUV 100% elétrico da marca. Bateria de lítio-ferro-fosfato com sistema de gerenciamento que controla temperatura e carga, display de 24,6", head-up display colorido, carregador wireless de 50 W com refrigeração e pacote ADAS 2.5. O desenho é aerodinâmico de propósito — rodas de 18" fechadas e aerofólio traseiro duplo existem para render mais autonomia.',
    benefits: [
      '100% elétrico: zero combustível, zero troca de óleo, e silêncio que o cliente sente já na primeira arrancada',
      'Display de 24,6", head-up display colorido, comando de voz e carregador wireless de 50 W com refrigeração',
      'Bateria de lítio-ferro-fosfato — a química mais resistente a temperatura e com maior vida útil',
      'Pacote ADAS 2.5 e 6 airbags — o percentual de aço de alta resistência não consta nos documentos do E5',
      'Roda 6 km com R$ 1 — o Corolla Cross híbrido faz 2,81 km e o Compass 1,60 km com o mesmo real. É a conta que o cliente faz todo mês',
      '8 anos ou 150.000 km de garantia na bateria e 7 anos ou 150.000 km no veículo — no elétrico, a bateria é a pergunta que o cliente não faz em voz alta',
    ],
    howToUse:
      'Não comece pela tecnologia: comece pela rotina dele. Pergunte quantos quilômetros ele roda por dia e se ele estaciona em casa ou em prédio. Com essas duas respostas você já sabe se o carro serve — e o cliente percebe que você não está empurrando.',
    forWho:
      'Cliente que roda o previsível na cidade, tem onde carregar (casa, prédio ou trabalho) e valoriza tecnologia e silêncio mais do que autonomia de estrada.',
    salesLine: 'Me conta sua rotina: quantos quilômetros por dia e onde o carro dorme? Com isso eu já te digo se ele serve — ou se é melhor você olhar o híbrido.',
    objections: [
      {
        trigger: '"E onde eu carrego? Não tenho posto perto."',
        answer:
          'A conta real é outra: quem tem elétrico carrega em casa, de noite, e sai todo dia com o carro cheio — ele roda 345 km com uma carga, e o brasileiro faz em média 10 mil km por ano, uns 30 por dia. E dá pra te dizer o tempo exato: na tomada comum de 220V da sua casa, 17h28 pra ir de 20% a 100% — é o carregamento da noite inteira, dormindo. Com um wallbox de 7 kW instalado na garagem, 6h59. Num carregador rápido de 80 kW, na estrada, 36 minutos: o tempo de um almoço.'
      },
      {
        trigger: '"Autonomia de elétrico é pouca."',
        answer:
          'Vamos comparar então. São 345 km pelo Inmetro, contra 330, 319, 294 e 250 dos concorrentes diretos. É a maior da faixa. E não é por acaso: o coeficiente aerodinâmico de 0,281 é melhor que o deles — o carro corta o ar gastando menos.',
      },
      {
        trigger: '"E se acabar a bateria na estrada?"',
        answer:
          'A mesma lógica de acabar a gasolina: o painel avisa com antecedência e mostra os pontos de recarga da rota. Sendo honesto com você: se estrada longa e frequente for a sua rotina, o híbrido encaixa melhor, e eu tenho o Omoda 5 e o 7 aqui. O que eu não faço é te vender o carro errado.',
      },
      {
        trigger: '"Manutenção de elétrico deve ser cara."',
        answer:
          'É o contrário, e dá pra provar com número: a primeira revisão sai por R$ 459, aos 20 mil km ou 2 anos — e a próxima só dois anos depois, por R$ 1.393. Em cinco anos você gasta R$ 1.852 de revisão, com preço fixo publicado pela marca. Não tem óleo, não tem filtro de óleo, não tem correia. Compare com o que você paga hoje, todo ano.',
      },
      {
        trigger: '"Elétrico desvaloriza mais rápido."',
        answer:
          'O mercado de elétrico ainda está formando referência, é verdade. Em compensação a conta do uso muda tudo: sem combustível, sem óleo, com revisão de 1.852 reais em cinco anos. Vale calcular pelos anos que você pretende ficar com ele — se quiser, monto essa conta com o seu quilômetro real.',
      },
    ],
    compliance:
      'Autonomia depende de uso, clima e carga. Use sempre o número do Inmetro e nunca prometa autonomia de estrada com base no número de ciclo urbano. Preço e condição saem da tabela vigente.',
    fotos: ['/carros/omoda-e5-1.jpg', '/carros/omoda-e5-2.jpg', '/carros/omoda-e5-3.jpg', '/carros/omoda-e5-4.jpg'],
    destaques: [
      { titulo: 'Roda a semana toda sem recarregar', prova: '345 km de autonomia Inmetro — a maior entre os elétricos da faixa' },
      { titulo: 'Some a gasolina e a troca de óleo da sua vida', prova: '100% elétrico, sem motor a combustão pra revisar' },
      { titulo: 'Cinco anos de revisão custam menos que uma', prova: 'R$ 1.852 no total — a primeira sai por R$ 459, e a seguinte só dois anos depois' },
      { titulo: 'Arranca na frente de todo mundo no semáforo', prova: 'De 0 a 100 km/h em 7,6 segundos' },
      { titulo: 'A informação no para-brisa, o olho na rua', prova: 'Projeção colorida, comando de voz e 7 airbags' },
    ],
    durationSec: 45,
    gradient: ['#6ea8ff', '#1b2a63'],
    fichaPdf: '/docs/ramasa/ficha-omoda-e5.pdf',
    ficha: [
      { label: 'Marca', value: 'Omoda (grupo Chery)' },
      { label: 'Tipo', value: '100% elétrico' },
      { label: 'Bateria', value: '61,1 kWh de lítio-ferro-fosfato (LFP)' },
      { label: 'Autonomia', value: '345 km (Inmetro) — a maior da faixa: concorrentes fazem 294, 330, 319 e 250 km' },
      { label: '0 a 100 km/h', value: '7,6 segundos' },
      { label: 'Aerodinâmica', value: 'Coeficiente de 0,281 — melhor que o dos concorrentes' },
      { label: 'Motor', value: '204 cv e 340 Nm — ímã permanente, síncrono' },
      { label: 'Função V2L', value: '3,3 kW — o carro vira tomada para churrasqueira, ferramenta, camping' },
      { label: 'Tempo de carga (20% a 100%)', value: 'Tomada 220V de casa: 17h28 · wallbox de 7 kW: 6h59 · wallbox de 11 kW: 4h56 · rápido de 30 kW: 1h37 · rápido de 80 kW: 36 min' },
      { label: 'Cores', value: 'As mesmas do Omoda 5 — Branco Arctic · Prata Alya · Preto Andromeda · Cinza Centaurus — mais o AZUL ANTARES, que é exclusivo do E5. Interior preto.' },
      { label: 'Custo de rodagem', value: '6,01 km por R$ 1 — o Yuan Plus faz 5,17, o Corolla Cross híbrido 2,81 e o Compass 1,60. É quase 4× o Compass no mesmo real gasto.' },
      { label: 'Consumo equivalente', value: '44,7 km/L — a conversão que a marca usa pra comparar com carro a combustão' },
      { label: 'Peso por torque', value: '5,03 kg por Nm — a melhor relação entre os concorrentes diretos, e é o que dá a sensação de leveza na arrancada' },
      { label: 'Dimensões', value: '4.424 mm de comprimento · 1.830 de largura · 1.588 de altura' },
      { label: 'Entre-eixos', value: '2.630 mm' },
      { label: 'Porta-malas', value: '360 L' },
      { label: 'Rodas', value: 'Liga leve aerodinâmica de 18" · pneus 215/55R18' },
      { label: 'Telas', value: 'Multimídia de 12,3", painel digital de 12,3" e head-up display colorido' },
      { label: 'Som', value: 'Sony com 6 alto-falantes e 2 tweeters' },
      { label: 'Tecnologia', value: 'Carregador por indução refrigerado · comando de voz · câmera 360° · ADAS' },
      { label: 'Segurança', value: 'Airbags frontais duplos, laterais dianteiros e de cortina · TPMS · BSD · ACC · AEB' },
      { label: 'Euro NCAP', value: 'Sem laudo publicado para o E5. Jaecoo 7 e Omoda 5 têm cinco estrelas; este ainda não foi testado — não empreste a nota de um pro outro.' },
      { label: 'Garantia', value: '7 anos ou 150.000 km no veículo · 8 anos ou 150.000 km na bateria de alta tensão · 5 anos ou 150.000 km na pintura e contra corrosão — sempre o que vier primeiro' },
      { label: 'Garantia em uso comercial', value: '36 meses ou 100.000 km — vale para compra no CNPJ ou uso comercial' },
      { label: 'Revisões', value: 'A cada 24 meses ou 20.000 km — metade da frequência de um carro a combustão' },
      { label: 'As três primeiras revisões', value: '1ª (2 anos) R$ 459 · 2ª (4 anos) R$ 1.393 · 3ª (6 anos) R$ 459 — R$ 2.311 em SEIS anos (preço fixo da marca, válido até 31/12/2026)' },
    ],
    storyboard: [
      { t: '0-5s', label: 'GANCHO', line: 'Ele quer o elétrico. E aí pergunta: "onde eu carrego?"' },
      { t: '5-15s', label: 'A VIRADA DE CHAVE', line: 'Quem tem elétrico carrega em casa, de noite, e sai todo dia cheio. Eletroposto é para viagem.' },
      { t: '15-30s', label: 'AS DUAS PERGUNTAS', line: 'Pergunte quantos km por dia e onde o carro dorme. Com isso você já sabe se serve — e ele vê que você não está empurrando.' },
      { t: '30-40s', label: 'O ARGUMENTO', line: 'Aí vêm os dois números que fecham: 345 km de autonomia pelo Inmetro, a maior da faixa, e 6 km rodados por real gasto — o Corolla Cross híbrido faz 2,8 e o Compass 1,6. Depois mostre a tela de 24,6" e o head-up display.' },
      { t: '40-45s', label: 'CTA', line: 'Se o perfil não bater, ofereça o híbrido. Vender o carro errado volta como reclamação.' },
    ],
    niveis: [
      {
        titulo: 'Por dentro',
        foco: 'Passo 4: o silêncio do elétrico é o argumento que nenhum folheto entrega.',
        storyboard: [
          { t: '0-8s', label: 'A REGRA', line: 'No elétrico, o interior vende sozinho — mas só se você calar a boca. Ligue o carro e não fale.' },
          { t: '8-20s', label: 'O SILÊNCIO', line: 'Sem motor a combustão não existe ruído de marcha lenta. Deixe cinco segundos. É a primeira vez que ele sente isso.' },
          { t: '20-32s', label: 'O TETO', line: 'Teto solar elétrico e iluminação ambiente. A cabine do E5 foi desenhada em volta das telas — mostre com a luz baixa.' },
          { t: '32-42s', label: 'O BANCO', line: 'Bancos dianteiros ventilados, com ajuste elétrico de 6 direções no motorista. Material premium sintético.' },
          { t: '42-52s', label: 'O ESPAÇO', line: '360 litros de porta-malas, com tampa elétrica e sensor de presença. Abra com o pé, com as mãos ocupadas.' },
        ],
      },
      {
        titulo: 'Cabine e tecnologia',
        foco: 'Passo 5: a tela é o painel do carro — e ele foi desenhado assim.',
        storyboard: [
          { t: '0-8s', label: 'A REGRA', line: 'Deixe ele mexer. Elétrico assusta quem nunca dirigiu um, e a tela é onde o medo passa.' },
          { t: '8-20s', label: 'AS TELAS', line: 'Multimídia de 12,3" e painel de 12,3" — os 24,6" de alta definição que a marca anuncia — mais o head-up display colorido no para-brisa.' },
          { t: '20-32s', label: 'A CÂMERA', line: 'Câmera 360° com imagem panorâmica. Estacione com ele olhando a tela: no elétrico, silencioso, a manobra impressiona ainda mais.' },
          { t: '32-42s', label: 'O CARREGADOR', line: 'Carregador de celular por indução com refrigeração — não esquenta o telefone. Som Sony com 6 alto-falantes e 2 tweeters.' },
          { t: '42-52s', label: 'O ADAS', line: 'Ponto cego, centralização de faixa, frenagem automática, monitoramento de fadiga e evasão inteligente. Guarde pro test drive.' },
        ],
      },
      {
        titulo: 'Motorização',
        foco: 'Passo 6: os dois números que fecham — autonomia e custo por real.',
        storyboard: [
          { t: '0-8s', label: 'O NÚMERO', line: 'Autonomia foi o argumento mais citado pelo time neste carro: seis de dezesseis. Comece por ele e não enrole.' },
          { t: '8-20s', label: 'A AUTONOMIA', line: '345 km pelo Inmetro — a maior entre os elétricos da faixa. O Yuan Plus faz 294, o Dolphin Plus 330. Bateria de lítio-ferro-fosfato de 61,1 kWh.' },
          { t: '20-32s', label: 'A CONTA', line: '6 km rodados por real gasto. O Corolla Cross híbrido faz 2,8 e o Compass 1,6. É quase quatro vezes mais com o mesmo dinheiro.' },
          { t: '32-42s', label: 'A RECARGA', line: 'Na tomada de casa, 17h28 — é a noite inteira dormindo. Wallbox de 7 kW, 6h59. No rápido de 80 kW da estrada, 36 minutos: o tempo de um almoço.' },
          { t: '42-52s', label: 'O EXTRA', line: 'Função V2L de 3,3 kW: o carro vira tomada. Churrasqueira, ferramenta, camping. É o item que ninguém espera e todo mundo comenta.' },
        ],
      },
      {
        titulo: 'Contra o concorrente elétrico',
        foco: 'O número que ganha de todos eles — e como usar sem parecer folheto.',
        storyboard: [
          { t: '0-8s', label: 'O NÚMERO', line: 'Guarde este: 345 km de autonomia pelo Inmetro. Os concorrentes diretos fazem 330, 319, 294 e 250.' },
          { t: '8-18s', label: 'POR QUE GANHA', line: 'Não é bateria maior por força bruta: o coeficiente aerodinâmico é 0,281, melhor que o deles. O carro corta o ar gastando menos.' },
          { t: '18-30s', label: 'A CONTA QUE FECHA', line: 'A revisão do elétrico não tem óleo, não tem filtro de óleo e não tem correia — e o preço é fixo, publicado pela marca. Abra a tabela no app e mostre. Peça pro cliente lembrar quanto pagou na última revisão dele.' },
          { t: '30-42s', label: 'A RECARGA', line: '345 km é uma recarga por semana pra quem roda 30 km por dia, que é a média do brasileiro. Ele carrega em casa, de noite, e sai cheio.' },
          { t: '42-52s', label: 'A HONESTIDADE', line: 'Se ele roda estrada toda semana, diga que o híbrido encaixa melhor e mostre o Omoda 5. Cliente sente quando você não está empurrando.' },
          { t: '52-58s', label: 'CTA', line: 'Test drive no fim do dia: o silêncio no trânsito é o que fecha esse carro.' },
        ],
      },
      {
        titulo: 'A conta do custo total',
        foco: 'Montar com o cliente a conta que faz o preço mais alto virar mais barato.',
        storyboard: [
          { t: '0-6s', label: 'A OBJEÇÃO', line: 'Ele fecha na tabela: é mais caro que o similar a combustão. E é mesmo, na tabela.' },
          { t: '6-18s', label: 'O QUE MUDA', line: 'A conta do elétrico não está no preço, está no uso: sem combustível, sem troca de óleo, com menos peça de desgaste.' },
          { t: '18-32s', label: 'COMO FAZER', line: 'Pegue o gasto mensal de combustível que ele te falou e multiplique pelos anos que ele pretende ficar com o carro. Esse é o número da conversa.' },
          { t: '32-44s', label: 'O CUIDADO', line: 'Não prometa economia exata: energia varia por região e por horário. Fale em ordem de grandeza, não em centavos.' },
          { t: '44-54s', label: 'O CONTRAPONTO', line: 'Reconheça a revenda: o mercado ainda está formando referência. Cliente confia em quem diz o lado ruim antes de ser perguntado.' },
          { t: '54-60s', label: 'CTA', line: 'Monte a conta com ele, por escrito. Quem faz a conta junto não esquece o número.' },
        ],
      },
    ],
  },

  {
    id: 'omoda-7-shs-p',
    brand: 'ramasa',
    category: 'omoda',
    family: 'omoda7',
    name: 'Omoda 7 SHS-P',
    tagline: 'O topo da linha: SUV híbrido plug-in, com 8 airbags, tela deslizante de 15,6" e som Sony de 12 alto-falantes.',
    hook: 'O cliente tem o dinheiro — mas nessa faixa ele acha que só marca conhecida entrega.',
    whatItIs:
      'O Omoda 7 SHS-P é o topo da linha da marca no Brasil. É híbrido plug-in: motor 1.5 TGDI de 135 cv somado a um elétrico de 204 cv, transmissão DHT de 3ª geração e bateria de lítio-ferro-fosfato de 18,4 kWh, que pode ser carregada na tomada para rodar em modo elétrico no dia a dia. Traz multimídia de 15,6" Ultra HD 2.5K com sistema Sliding, som Sony de 12 alto-falantes e o L’Essence, sistema de difusão de aromas da cabine.',
    benefits: [
      'Híbrido plug-in: roda no elétrico no dia a dia e usa a gasolina na estrada — sem ansiedade de autonomia',
      'Multimídia de 15,6" Ultra HD 2.5K com função Sliding, som Sony de 12 alto-falantes e o L’Essence de aromas',
      '8 airbags e estrutura com mais de 72% de aço de alta resistência, 30% de ultra-alta resistência e rigidez torsional acima de 25.000 Nm por grau',
      'ADAS avançado: evasão inteligente (IES), frenagem de emergência de 4 a 150 km/h e assistente de congestionamento',
      '7 anos ou 150.000 km de garantia total, e 8 anos ou 150.000 km na bateria — uma das maiores do mercado brasileiro',
    ],
    howToUse:
      'Nessa faixa o cliente não compra ficha, compra a sensação de ter acertado. Convide para sentar dentro antes de falar número — a tela deslizante, o som Sony e o L’Essence fazem o trabalho sozinhos. Só depois abra a comparação de preço, e aí compare equipado contra equipado.',
    forWho:
      'Cliente de SUV médio premium que quer tecnologia e conforto de topo, tem onde carregar em casa e não quer abrir mão da liberdade de pegar estrada.',
    salesLine: 'Quer conhecer por dentro, sem compromisso? Te mostro o que vem de série e, se fizer sentido pra você, a gente marca o test drive.',
    objections: [
      {
        trigger: '"Por esse preço eu compro uma marca que todo mundo conhece."',
        answer:
          'Pode, e é escolha legítima. Só que a comparação tem que ser equipado contra equipado: coloque o concorrente com 8 airbags, som Sony, bancos com massagem e tela de 15,6 e veja onde o preço dele para. E some a garantia de 8 anos e o consumo de 15,1 km por litro. Depois disso, dirija os dois.',
      },
      {
        trigger: '"O carro é menor que o concorrente."',
        answer:
          'Por fora, um pouco. Por dentro ele tem 590 litros de porta-malas — um dos maiores da categoria — e passa de 1.300 rebatendo os bancos. O entre-eixos de 2,72 m dá espaço de sobra atrás. Vamos até o carro: senta no banco de trás e me diz se falta alguma coisa.',
      },
      {
        trigger: '"Plug-in eu preciso instalar tomada em casa?"',
        answer:
          'Não precisa. O SHS deixa você rodar como híbrido comum, só abastecendo, e ele faz 15,1 km por litro assim. Quem instala a tomada ganha 60 km no elétrico e chega a 1.200 km somando os dois. É liberdade a mais, não amarra.',
      },
      {
        trigger: '"Nunca ouvi falar dessa marca."',
        answer:
          'A Omoda é do grupo Chery: 44 países, mais de 570 mil veículos vendidos. No Reino Unido fez 1,5% do mercado em menos de um ano; na Espanha, 20 mil carros em 17 meses. Aqui passamos de mil unidades em menos de três meses. E a assistência é nossa, com centro de peças em Cajamar.',
      },
      {
        trigger: '"É grande demais para a cidade."',
        answer:
          'Ele tem porte, e por isso vem com assistente de congestionamento, que assume aceleração, freio e direção abaixo de 60 km/h, além de câmera 540°. Na prática cansa menos que um carro menor sem esses recursos. Faz o test drive num horário de trânsito que você sente na hora.',
      },
    ],
    compliance:
      'Autonomia em modo elétrico, consumo, itens de série e garantia variam por versão. Confirme na ficha técnica oficial e na condição vigente antes de falar número com o cliente.',
    fotos: ['/carros/omoda-7-shs-p-1.jpg', '/carros/omoda-7-shs-p-2.jpg', '/carros/omoda-7-shs-p-3.jpg', '/carros/omoda-7-shs-p-4.jpg'],
    destaques: [
      { titulo: 'Massagem no banco no meio do trânsito', prova: 'Banco do passageiro VIP com massagem e função relax' },
      { titulo: 'A tela acompanha quem está dirigindo', prova: 'Multimídia de 15,6" 2.5K que desliza pelo painel' },
      { titulo: 'A rua fica do lado de fora', prova: 'Som Sony de 12 alto-falantes com 390 W RMS e sistema de aromas L\'Essence' },
      { titulo: 'O maior porta-malas da categoria', prova: 'Espaço de sobra para a família inteira e a bagagem' },
      { titulo: 'São Paulo a Salvador sem parar no posto', prova: 'Mais de 1.200 km somando tanque e bateria' },
      { titulo: 'Oito airbags e o carro dirigindo com você', prova: 'Pacote ADAS 2.5 completo e airbag central dianteiro' },
    ],
    durationSec: 45,
    gradient: ['#8b6cf0', '#2a1f5c'],
    versoes: [
      {
        nome: 'LUXURY',
        paraQuem: 'A de entrada do Omoda 7 — e já vem com a tela de 15,6" e o ADAS 2.5.',
        vemCom: [
          'Motor 1.5 TGDI SHS com transmissão DHT',
          'Bateria de 18,4 kWh',
          'Rodas de 19"',
          'Faróis em LED com função welcome e sensor crepuscular',
          'Lanternas lightning LED',
          'Espelhos aquecidos, com rebatimento e memória',
          'Teto solar wide-panorama',
          'Porta-malas elétrico',
          'Bancos com revestimento premium',
          'Bancos dianteiros elétricos e ventilados',
          'Banco do motorista com memória',
          'Volante multifuncional em couro',
          'Painel digital de 8,8"',
          'Central multimídia UHD 2.5K de 15,6"',
          'Carregador sem fio de 50 W com refrigeração',
          'Ar-condicionado dual zone',
          'Partida sem botão (contactless power-on)',
          '7 airbags — dianteiro, lateral, cortina e joelho',
          'ABS + VSC + TRC',
          'Câmera 540º',
          'Sensor de estacionamento dianteiro e traseiro',
          'TPMS — monitoramento de pressão dos pneus',
          'Pacote ADAS 2.5',
        ],
      },
      {
        nome: 'PRESTIGE',
        paraQuem: 'O banco do passageiro com massagem é o argumento — quem senta nele decide a compra.',
        herda: 'LUXURY',
        vemCom: [
          'Rodas de 20"',
          'Banco do passageiro VIP, com massagem e função relax',
          'Banco do motorista com ajuste lombar elétrico',
          'Aquecimento dos bancos dianteiros e do banco traseiro',
          'Volante com aquecimento',
          'Head-up display colorido',
          'Central multimídia UHD 2.5K de 15,6" com smart sliding',
          'Concert sound com 12 alto-falantes e 390 W RMS',
          'Airbag central dianteiro',
          'Charger indicator lights',
          "Sistema de fragrâncias L'Essence",
        ],
      },
    ],
    fichaPdf: '/docs/ramasa/ficha-omoda-7.pdf',
    ficha: [
      { label: 'Marca', value: 'Omoda (grupo Chery)' },
      { label: 'Versões', value: 'SHS-P Luxury · SHS-P Prestige' },
      { label: 'Tipo', value: 'Híbrido plug-in (SHS de 3ª geração) — roda como híbrido só abastecendo' },
      { label: 'Motor a combustão', value: '1.5 TGDI — 135 cv' },
      { label: 'Motor elétrico', value: '204 cv e 31,6 kgfm' },
      { label: '0 a 100 km/h', value: '8,4 segundos' },
      { label: 'Autonomia só no elétrico', value: '60 km' },
      { label: 'Autonomia total', value: 'até 1.200 km' },
      { label: 'Consumo sem carregar', value: '15,1 km/L' },
      { label: 'Eficiência térmica', value: '44,5% — um dos motores mais eficientes do mercado' },
      { label: 'Bateria', value: '18,4 kWh de lítio-ferro-fosfato (LFP)' },
      { label: 'Entre-eixos', value: '2.720 mm' },
      { label: 'Porta-malas', value: '590 L — um dos maiores da categoria; passa de 1.300 L rebatendo' },
      { label: 'Potência combinada', value: '279 cv e 37,2 kgfm' },
      { label: 'Dimensões', value: '4.660 mm de comprimento · 1.875 de largura · 1.670 de altura' },
      { label: 'Rodas', value: 'Liga leve de 19" na LUXURY e 20" na PRESTIGE' },
      { label: 'Telas', value: 'Multimídia Ultra HD 2.5K de 15,6" · painel de 8,88" · head-up display só na PRESTIGE' },
      { label: 'Som', value: 'Sony com 8 alto-falantes na LUXURY · Concert Sound System Sony com 12 na PRESTIGE' },
      { label: 'Cabine', value: 'Cancelamento de ruído ENC nas duas · fragrância Essence só na PRESTIGE' },
      { label: 'Cores', value: 'Branco Arctic · Prata Crest · Preto Andromeda · Cinza Theron — interior preto em todas' },
      { label: 'Exclusivo da PRESTIGE', value: 'Banco do passageiro com massagem e função Relax · indicador de carga na coluna C' },
      { label: 'Segurança', value: '7 airbags na LUXURY e 8 na PRESTIGE · câmera 540° · ADAS 2.5 com 18 recursos' },
      { label: 'Euro NCAP', value: 'Sem laudo publicado para o Omoda 7. Jaecoo 7 e Omoda 5 têm cinco estrelas; este ainda não foi testado — não empreste a nota de um pro outro.' },
      { label: 'Garantia', value: '7 anos ou 150.000 km no veículo · 8 anos ou 150.000 km na bateria de alta tensão · 5 anos ou 150.000 km na pintura e contra corrosão — sempre o que vier primeiro' },
      { label: 'Revisões', value: 'A cada 12 meses ou 10.000 km, o que vier primeiro' },
      { label: 'As três primeiras revisões', value: '1ª R$ 698,54 · 2ª R$ 1.379 · 3ª R$ 1.137,75 — R$ 3.215,29 nas três (preço fixo da marca, válido até 31/12/2026)' },
      { label: 'Garantia em uso comercial', value: '36 meses ou 100.000 km — vale para compra no CNPJ ou uso comercial' },
    ],
    storyboard: [
      { t: '0-5s', label: 'GANCHO', line: 'Ele tem o dinheiro. Mas acha que nessa faixa só marca conhecida entrega.' },
      { t: '5-15s', label: 'A ORDEM CERTA', line: 'Não comece pelo número. Sente ele dentro: tela deslizante de 15,6", som Sony de 12, o aroma do L’Essence.' },
      { t: '15-30s', label: 'O ARGUMENTO', line: 'Mostre o espaço: 590 litros de porta-malas, um dos maiores da categoria, e mais de 1.300 rebatendo. Depois compare equipado contra equipado — 8 airbags e ADAS com evasão inteligente. Veja onde o preço do concorrente para.' },
      { t: '30-40s', label: 'A OBJEÇÃO', line: '"Preciso de tomada em casa?" — para aproveitar o melhor dele, sim. Mas sem carregar ele roda como híbrido normal.' },
      { t: '40-45s', label: 'CTA', line: 'Test drive em horário de trânsito: o assistente de congestionamento vende sozinho.' },
    ],
    niveis: [
      {
        titulo: 'Por dentro',
        foco: 'Passo 4: é aqui que o topo de linha se justifica. Não corra.',
        storyboard: [
          { t: '0-8s', label: 'A REGRA', line: 'Este carro se vende sentado, não em pé. Leve ele para o banco do passageiro, não do motorista.' },
          { t: '8-20s', label: 'A MASSAGEM', line: 'Na PRESTIGE, o banco do passageiro tem massagem e função Relax. Ligue e fique quieto. É o momento que decide esta venda.' },
          { t: '20-32s', label: 'O SILÊNCIO', line: 'Vidros dianteiros duplos e cancelamento ativo de ruído ENC nas duas versões. Feche a porta e deixe ele ouvir a diferença.' },
          { t: '32-42s', label: 'O ESPAÇO', line: '2,72 m de entre-eixos e 590 litros de porta-malas — um dos maiores da categoria. Mais de 1.300 rebatendo os bancos.' },
          { t: '42-52s', label: 'O DETALHE', line: 'Na PRESTIGE, sistema de fragrância Essence. Teto solar wide panorama nas duas. Bancos com aquecimento, ventilação e memória.' },
        ],
      },
      {
        titulo: 'Cabine e tecnologia',
        foco: 'Passo 5: a tela deslizante e o som de 12 alto-falantes.',
        storyboard: [
          { t: '0-8s', label: 'A REGRA', line: 'Aqui a tecnologia é o produto. Mostre funcionando, uma coisa de cada vez.' },
          { t: '8-20s', label: 'A TELA', line: 'Multimídia Ultra HD 2.5K de 15,6" nas duas versões. Na PRESTIGE ela DESLIZA — mostre o movimento, é o item que mais surpreende.' },
          { t: '20-32s', label: 'O SOM', line: 'Concert Sound System da Sony com 12 alto-falantes na PRESTIGE; Sony com 8 na LUXURY. Leve uma música que você conheça bem.' },
          { t: '32-42s', label: 'O PAINEL', line: 'Painel digital de 8,88" nas duas, e head-up display colorido só na PRESTIGE. Smart Cabin com reconhecimento de voz multizona.' },
          { t: '42-52s', label: 'A SEGURANÇA', line: '8 airbags na PRESTIGE e 7 na LUXURY. ADAS 2.5 com 18 recursos, incluindo evasão inteligente e monitoramento de fadiga.' },
        ],
      },
      {
        titulo: 'Motorização',
        foco: 'Passo 6: plug-in de verdade, com 60 km só no elétrico.',
        storyboard: [
          { t: '0-8s', label: 'A DIFERENÇA', line: 'Este é SHS-P: carrega na tomada de verdade, diferente do Omoda 5. E isso é escolha, não obrigação.' },
          { t: '8-20s', label: 'O SISTEMA', line: '1.5 TGDI de 135 cv mais elétrico de 204, com 279 cv combinados e 37,2 kgfm. Bateria de 18,4 kWh.' },
          { t: '20-32s', label: 'A AUTONOMIA', line: '60 km só no elétrico — a semana inteira de trajeto urbano sem gastar gasolina. Somando tanque e bateria, mais de 1.200 km.' },
          { t: '32-42s', label: 'SEM CARREGAR', line: 'Se ele nunca ligar na tomada, o carro roda como híbrido comum e faz 15,1 km por litro. Diga isso: tira o medo de quem mora em prédio.' },
          { t: '42-52s', label: 'A RECARGA', line: 'Wallbox de 7 kW: 2h13. Tomada de casa: 5h13. Rápido de 80 kW: 22 minutos. Garantia de 8 anos ou 150.000 km na bateria.' },
        ],
      },
      {
        titulo: 'Vender o topo de linha',
        foco: 'A ordem certa da apresentação e os números que sustentam o preço.',
        storyboard: [
          { t: '0-8s', label: 'A ORDEM', line: 'Não comece pelo número. Sente o cliente dentro: tela de 15,6 deslizante, massagem no banco, o aroma do L Essence.' },
          { t: '8-18s', label: 'POR QUÊ', line: 'Nessa faixa ninguém compra ficha. Compra a sensação de ter acertado — e ela acontece sentado, não em pé olhando tabela.' },
          { t: '18-30s', label: 'AÍ SIM, O NÚMERO', line: '590 litros de porta-malas, um dos maiores da categoria. Oito airbags. Dezoito recursos de assistência. Garantia de oito anos.' },
          { t: '30-42s', label: 'EQUIPADO x EQUIPADO', line: 'Monte o concorrente com tudo isso e veja onde o preço dele para. É a única comparação honesta — e é a que ganha.' },
          { t: '42-52s', label: 'A REGRA', line: 'Nunca deprecie a marca que ele admira. Reconheça que é boa e mostre a conta. Respeito abre; deboche fecha.' },
          { t: '52-60s', label: 'CTA', line: 'Test drive em horário de trânsito: o assistente de congestionamento vende sozinho.' },
        ],
      },
      {
        titulo: 'Plug-in sem enrolação',
        foco: 'Explicar tomada, autonomia elétrica e uso real sem prometer o que não se cumpre.',
        storyboard: [
          { t: '0-6s', label: 'A DÚVIDA', line: 'Plug-in eu preciso instalar tomada em casa? É a pergunta que decide esse carro.' },
          { t: '6-18s', label: 'A RESPOSTA HONESTA', line: 'Pra aproveitar o melhor dele, sim: é a instalação em casa que faz o custo por quilômetro despencar.' },
          { t: '18-30s', label: 'O ALÍVIO', line: 'Mas não é obrigação. Se ele nunca carregar, o carro roda normalmente como híbrido. É liberdade a mais, não amarra.' },
          { t: '30-42s', label: 'O USO REAL', line: 'O desenho é esse: elétrico no dia a dia da cidade, gasolina quando pegar estrada. Sem ansiedade de autonomia.' },
          { t: '42-54s', label: 'O CUIDADO', line: 'Não prometa autonomia em modo elétrico nem tempo de recarga sem conferir a ficha da versão. Varia, e o cliente cobra.' },
          { t: '54-60s', label: 'CTA', line: 'Pergunte se ele tem garagem própria. A resposta muda a proposta inteira.' },
        ],
      },
    ],
  },

  // ===================== ROYAL ENFIELD BRASIL =====================
  //
  // Marca em DEMONSTRAÇÃO (ver soGss em brands.ts): só a GSS abre. O conteúdo
  // abaixo foi escrito a partir do que é público da marca até maio de 2026 e
  // serve para mostrar o app funcionando — quando a Royal Enfield mandar o
  // material oficial, ele troca isto linha por linha. Por isso toda ficha
  // termina com a linha "Fonte" avisando o vendedor.
  {
    id: 're-hunter-350',
    brand: 'royal',
    category: 'royal',
    // Foto oficial da marca (royalenfield.com/br/pt), baixada para o app.
    imageUrl: '/motos/hunter.jpg',
    fotos: ['/motos/hunter.jpg'],
    family: 're-j350',
    name: 'Hunter 350',
    tagline: 'A porta de entrada da Royal Enfield: 349 cc de motor de verdade, leve no trânsito e com o ronco que a marca tem desde sempre.',
    hook: 'O cliente quer uma moto com cara de moto — não mais uma 300 de plástico — mas tem medo de peso, de altura do banco e de manutenção de importada.',
    whatItIs:
      'A Hunter 350 é a roadster urbana da Royal Enfield: motor monocilíndrico de 349 cc da plataforma J, câmbio de 5 marchas, rodas de 17 polegadas nas duas pontas e postura ereta. Foi desenhada para a cidade — é a mais leve e a mais ágil da família 350 — sem abrir mão do jeito Royal Enfield de entregar torque embaixo, que é o que faz a moto andar no dia a dia sem precisar girar.',
    benefits: [
      'Motor de 349 cc com torque logo embaixo: anda em quinta a 60 km/h sem reclamar, que é onde a moto de cilindrada pequena sofre',
      'Rodas de 17 polegadas nas duas pontas — pneu fácil de achar e comportamento previsível na curva',
      'É a mais leve da família 350: no trânsito e na manobra da garagem, isso pesa mais que qualquer número de catálogo',
      'Freio a disco nas duas rodas com ABS de duplo canal',
      'Montada no Brasil, em Manaus — rede e peça sem depender de importação',
      'Visual que não envelhece: a pessoa compra a moto pelo desenho e continua gostando no terceiro ano',
    ],
    howToUse:
      'Comece perguntando para que ele vai usar a moto no dia a dia. Se a resposta for cidade, trajeto curto e estacionamento apertado, a Hunter é a resposta — e o argumento é peso e agilidade, não potência. Depois ponha o cliente sentado: o banco baixo resolve o medo de quem está saindo de uma moto menor.',
    forWho: 'Quem quer a primeira Royal Enfield, anda na cidade e não abre mão de uma moto com presença.',
    salesLine: 'Senta nela um minuto. O que decide essa moto é como ela se comporta parada no sinal e na primeira curva — e isso não dá pra explicar em ficha.',
    objections: [
      {
        trigger: '"Só 20 cavalos? Minha 300 japonesa tem mais."',
        answer:
          'Tem mesmo — e gira muito mais alto pra entregar. A conversa aqui é outra: o torque da Hunter chega embaixo, em giro de cidade. Na prática é menos troca de marcha, menos barulho de motor esticado e mais tranquilidade no trânsito. No test ride você sente isso na primeira saída de sinal.',
      },
      {
        trigger: '"Moto importada tem peça? E a revisão?"',
        answer:
          'A Royal Enfield monta no Brasil, em Manaus, e tem rede própria de concessionárias. Peça e revisão saem por aqui, com preço publicado pela marca. Se quiser, eu abro o plano de revisão agora e a gente olha junto item por item.',
      },
      {
        trigger: '"Ela é pesada? Não vou conseguir manobrar."',
        answer:
          'É a mais leve das 350 da marca, e o banco é baixo — o pé chega no chão com folga, que é o que dá segurança na manobra. Vamos fazer o teste que vale: você senta, tira do cavalete e anda dois metros comigo do lado. Em dez segundos a dúvida acaba.',
      },
      {
        trigger: '"Royal Enfield não é moto antiga?"',
        answer:
          'O desenho é clássico de propósito, a engenharia não: motor da geração J, freio a disco com ABS de duplo canal e montagem nacional. É moto nova com cara de moto de sempre — e é exatamente por isso que ela é escolhida.',
      },
      {
        trigger: '"E se eu quiser viajar com ela?"',
        answer:
          'Ela dá conta de estrada, mas a família tem moto mais indicada para isso: a Meteor 350, que é a de posição de cruiser e tanque maior, e a Himalayan 450, feita para viagem longa. Me diz quantas viagens por ano você faz que eu te mostro a que não vai te deixar na mão.',
      },
    ],
    compliance:
      'Conteúdo de demonstração, escrito a partir do material público da marca. Antes de falar número, item de série ou prazo com o cliente, confirme na ficha oficial da Royal Enfield Brasil e na condição vigente da loja.',
    durationSec: 45,
    gradient: ['#a4161a', '#5c0a0d'],
    destaques: [
      { titulo: 'Anda na cidade sem exigir nada de você', prova: 'Torque em giro baixo e a mais leve da família 350' },
      { titulo: 'Pé no chão na hora de manobrar', prova: 'Banco baixo e rodas de 17 polegadas nas duas pontas' },
      { titulo: 'Freia com segurança no molhado', prova: 'Disco nas duas rodas com ABS de duplo canal' },
      { titulo: 'Assistência sem depender de importação', prova: 'Montada em Manaus, com rede e peça no Brasil' },
    ],
    ficha: [
      { label: 'Marca', value: 'Royal Enfield' },
      { label: 'Segmento', value: 'Roadster urbana' },
      { label: 'Motor', value: 'Monocilíndrico 349 cc, plataforma J, refrigeração a ar e óleo' },
      { label: 'Potência', value: 'Cerca de 20 cv' },
      { label: 'Torque', value: 'Cerca de 27 Nm em giro baixo' },
      { label: 'Câmbio', value: '5 marchas' },
      { label: 'Freios', value: 'Disco nas duas rodas, ABS de duplo canal' },
      { label: 'Rodas', value: '17 polegadas na frente e atrás' },
      { label: 'Tanque', value: 'Cerca de 13 litros' },
      { label: 'Montagem', value: 'Manaus (AM)' },
      { label: 'Fonte', value: 'Números públicos da marca até maio de 2026 — CONFIRME na ficha oficial antes de falar com o cliente. Conteúdo de demonstração.' },
    ],
    storyboard: [
      { t: '0-8s', label: 'A PERGUNTA QUE ABRE', line: 'Antes de falar da moto, pergunte onde ela vai andar. Se a resposta for cidade, a Hunter já está na mesa.' },
      { t: '8-18s', label: 'O QUE ELE VAI SENTIR', line: 'Torque embaixo: anda em marcha alta a 60 por hora sem reclamar. É menos troca de marcha no trânsito.' },
      { t: '18-30s', label: 'O MEDO DE TODO MUNDO', line: 'Peso e altura do banco. É a mais leve das 350 e o pé chega no chão. Resolva isso com o cliente sentado, não com número.' },
      { t: '30-40s', label: 'A SEGURANÇA', line: 'Disco nas duas rodas com ABS de duplo canal, e roda 17 nas duas pontas: pneu fácil e comportamento previsível.' },
      { t: '40-45s', label: 'O FECHAMENTO', line: 'Marque o test ride. Esta moto se vende sentada, não no balcão.' },
    ],
    niveis: [
      {
        titulo: 'Contra o concorrente',
        foco: 'O que responder quando ele compara com a naked japonesa de 300 a 400 cc.',
        storyboard: [
          { t: '0-12s', label: 'A COMPARAÇÃO INEVITÁVEL', line: 'Ele vai citar potência de pico. Devolva com entrega: onde o torque aparece e quantas trocas de marcha ele faz num quarteirão.' },
          { t: '12-24s', label: 'O QUE A FICHA NÃO MOSTRA', line: 'Postura, ronco e desenho. Três coisas que decidem a compra de moto e não cabem em tabela — por isso o test ride é o argumento.' },
          { t: '24-36s', label: 'O QUE NÃO DIZER', line: 'Não ataque a marca japonesa. Quem compara já estudou: se você desmerecer, perde a confiança e a venda junto.' },
          { t: '36-45s', label: 'O DESEMPATE', line: 'Ofereça as duas experiências: a moto dele e a Hunter no mesmo dia. Quem sai andando costuma voltar decidido.' },
        ],
      },
      {
        titulo: 'Primeira moto grande',
        foco: 'Como conduzir quem está subindo de cilindrada e tem medo.',
        storyboard: [
          { t: '0-12s', label: 'O MEDO REAL', line: 'Não é potência: é derrubar na manobra e não alcançar o chão. Trate disso primeiro, sentado, antes de qualquer número.' },
          { t: '12-26s', label: 'O ROTEIRO DO TEST RIDE', line: 'Comece em rua sem movimento, peça duas frenagens e uma manobra em oito. Quem faz isso ganha confiança na hora.' },
          { t: '26-38s', label: 'O EQUIPAMENTO', line: 'Fale de capacete e luva como parte da compra, não como venda extra. Cliente que sai equipado volta pra revisão e indica a loja.' },
          { t: '38-45s', label: 'O COMBINADO', line: 'Termine com data: test ride marcado, com horário. Moto sem test ride marcado é moto que ele vai ver na concorrente.' },
        ],
      },
    ],
  },
  {
    id: 're-meteor-350',
    brand: 'royal',
    category: 'royal',
    // Foto oficial da marca (royalenfield.com/br/pt), baixada para o app.
    imageUrl: '/motos/meteor.jpg',
    fotos: ['/motos/meteor.jpg'],
    family: 're-j350',
    name: 'Meteor 350',
    tagline: 'A cruiser de 349 cc: posição relaxada, tanque maior e navegação no painel para quem quer estrada sem virar motoqueiro de expedição.',
    hook: 'O cliente quer sair da cidade no fim de semana, mas acha que para viajar precisa de uma moto enorme — e cara.',
    whatItIs:
      'A Meteor 350 é a cruiser da família J: mesmo motor de 349 cc da Hunter, mas com posição de pilotagem relaxada, guidão mais alto, banco mais confortável e tanque maior. Traz o Tripper, o mostrador redondo de navegação que espelha o trajeto do celular no painel — é a moto da marca para quem quer rodar 200, 300 quilômetros no domingo sem chegar quebrado.',
    benefits: [
      'Posição de cruiser: coluna ereta, pés à frente e guidão alto — é o que muda numa viagem de duas horas',
      'Tanque maior que o da Hunter: menos parada de posto no fim de semana',
      'Tripper: navegação por seta no painel, sem tirar o celular do bolso',
      'Mesmo motor de 349 cc com torque embaixo, que segura marcha alta na estrada',
      'Banco baixo para uma cruiser — dá segurança em quem está subindo de cilindrada',
      'Montada em Manaus, com rede no Brasil',
    ],
    howToUse:
      'Pergunte quantos fins de semana por mês ele sai da cidade. Se a resposta for um ou mais, a conversa é Meteor, não Hunter: o que decide aqui é conforto de estrada, não agilidade no trânsito. Mostre a posição de pilotagem com ele sentado e fale do Tripper na prática — "você não vai mais parar no acostamento pra olhar o mapa".',
    forWho: 'Quem quer estrada no fim de semana com conforto, sem partir para uma moto grande e pesada.',
    salesLine: 'Senta e repara na posição: joelho relaxado e coluna reta. É isso que você vai sentir depois de duas horas de estrada.',
    objections: [
      {
        trigger: '"349 cc aguenta estrada?"',
        answer:
          'Aguenta, e o que faz isso é o torque em giro baixo: ela segura velocidade de estrada sem o motor gritando. O ponto honesto é ultrapassagem em subida com garupa — aí você planeja. Se o seu uso for estrada pesada toda semana, a conversa muda para a Himalayan ou para a linha 650, e eu te mostro as duas.',
      },
      {
        trigger: '"Qual a diferença pra Hunter, se o motor é o mesmo?"',
        answer:
          'O motor é o mesmo; a moto, não. A Meteor é cruiser: guidão mais alto, pés à frente, banco mais confortável, tanque maior e o Tripper de navegação. A Hunter é urbana e mais leve. Uma ganha no trânsito, a outra ganha depois da primeira hora de estrada.',
      },
      {
        trigger: '"O que é esse tal de Tripper?"',
        answer:
          'É um segundo mostrador redondo no painel que mostra a seta do trajeto, espelhando o mapa do seu celular por Bluetooth. Serve para você não parar no acostamento para olhar o telefone. É daqueles itens que ninguém pede na loja e todo mundo usa na primeira viagem.',
      },
      {
        trigger: '"E para levar garupa?"',
        answer:
          'O banco e a posição são feitos para isso, e é aí que a Meteor se separa da Hunter. Traga a pessoa que vai na garupa no test ride — decidir isso na loja, com os dois sentados, evita a conversa chata depois da compra.',
      },
    ],
    compliance:
      'Conteúdo de demonstração, escrito a partir do material público da marca. Confirme itens de série, números e prazos na ficha oficial da Royal Enfield Brasil antes de falar com o cliente.',
    durationSec: 45,
    gradient: ['#8d1b1f', '#3d0709'],
    destaques: [
      { titulo: 'Chega inteiro depois de duas horas', prova: 'Posição de cruiser: guidão alto, pés à frente, banco largo' },
      { titulo: 'Menos parada no posto', prova: 'Tanque maior que o da Hunter' },
      { titulo: 'Não para mais para olhar o mapa', prova: 'Tripper: navegação por seta no painel' },
      { titulo: 'Garupa que quer voltar', prova: 'Banco e posição pensados para dois' },
    ],
    ficha: [
      { label: 'Marca', value: 'Royal Enfield' },
      { label: 'Segmento', value: 'Cruiser' },
      { label: 'Motor', value: 'Monocilíndrico 349 cc, plataforma J, refrigeração a ar e óleo' },
      { label: 'Potência', value: 'Cerca de 20 cv' },
      { label: 'Torque', value: 'Cerca de 27 Nm em giro baixo' },
      { label: 'Câmbio', value: '5 marchas' },
      { label: 'Navegação', value: 'Tripper — mostrador redondo com seta do trajeto, por Bluetooth' },
      { label: 'Freios', value: 'Disco nas duas rodas, ABS de duplo canal' },
      { label: 'Tanque', value: 'Cerca de 15 litros' },
      { label: 'Montagem', value: 'Manaus (AM)' },
      { label: 'Fonte', value: 'Números públicos da marca até maio de 2026 — CONFIRME na ficha oficial antes de falar com o cliente. Conteúdo de demonstração.' },
    ],
    storyboard: [
      { t: '0-8s', label: 'A PERGUNTA QUE ABRE', line: 'Quantos fins de semana por mês você sai da cidade? A resposta separa a Meteor da Hunter em dez segundos.' },
      { t: '8-20s', label: 'O QUE MUDA', line: 'Mesmo motor, moto diferente: guidão alto, pés à frente, banco largo e tanque maior. Conforto é o argumento, não potência.' },
      { t: '20-32s', label: 'O ITEM QUE ENCANTA', line: 'Tripper: a seta do trajeto no painel. Conte o benefício — nunca mais parar no acostamento pra olhar o celular.' },
      { t: '32-45s', label: 'O FECHAMENTO', line: 'Traga a garupa pro test ride. Cruiser se decide de dois, não de um.' },
    ],
  },
  {
    id: 're-classic-350',
    brand: 'royal',
    category: 'royal',
    // Foto oficial da marca (royalenfield.com/br/pt), baixada para o app.
    imageUrl: '/motos/classic.jpg',
    fotos: ['/motos/classic.jpg'],
    family: 're-j350',
    name: 'Classic 350',
    tagline: 'A moto que fez a marca: desenho de 1950 com motor da geração J e freio a disco com ABS. É a Royal Enfield que as pessoas reconhecem na rua.',
    hook: 'O cliente não está escolhendo uma moto: está escolhendo uma imagem. E fica com medo de comprar beleza e levar problema.',
    whatItIs:
      'A Classic 350 é o modelo que sustenta a marca no mundo inteiro: linhas de década de 1950, paralama largo, farol redondo e o mesmo motor monocilíndrico de 349 cc da plataforma J, com câmbio de 5 marchas e freio a disco com ABS de duplo canal. É a moto para quem quer o clássico de verdade, e não uma moto moderna com pintura antiga.',
    benefits: [
      'O desenho é o produto: é a moto da marca que as pessoas param na rua para olhar',
      'Motor da geração J, com torque em giro baixo e vibração muito menor que a das gerações antigas',
      'Freio a disco nas duas rodas com ABS de duplo canal',
      'Montada em Manaus: rede, peça e revisão com preço publicado no Brasil',
      'Aceita bagageiro, protetor de motor e banco de conforto de fábrica — o cliente monta a moto do jeito dele',
    ],
    howToUse:
      'Aqui a venda é emocional e o seu trabalho é dar segurança técnica para ela acontecer: deixe o cliente olhar, tirar foto e sentar. Depois traga o que ele precisa ouvir para se permitir comprar — ABS, motor da geração nova, rede no Brasil. Emoção fecha, técnica destrava.',
    forWho: 'Quem quer a Royal Enfield clássica pelo desenho e pelo som, e anda mais por prazer do que por necessidade.',
    salesLine: 'Essa é a moto que as pessoas reconhecem sem ler o nome no tanque. Vamos ligar ela?',
    objections: [
      {
        trigger: '"Moto antiga não vibra e quebra muito?"',
        answer:
          'O desenho é antigo, a mecânica não. O motor é da geração J, que nasceu justamente para resolver vibração e confiabilidade das gerações anteriores — e a montagem é nacional, com rede e peça no Brasil. É clássico no olhar e atual no que você não vê.',
      },
      {
        trigger: '"É muito pesada para o dia a dia."',
        answer:
          'Ela é mais encorpada que a Hunter, e isso aparece na manobra em garagem apertada. Duas perguntas resolvem: onde você guarda a moto e quanto anda no trânsito por dia. Se for trânsito pesado todo dia, a Hunter cumpre melhor — e eu prefiro te dizer isso agora do que você descobrir no segundo mês.',
      },
      {
        trigger: '"Consumo?"',
        answer:
          'É um monocilíndrico de 349 cc sem exigência de giro alto, então o consumo é de moto pequena, não de moto grande. O número exato eu te mostro na ficha oficial, porque prefiro te dar o dado certo a um número de cabeça.',
      },
      {
        trigger: '"Dá pra personalizar?"',
        answer:
          'É metade da graça da marca. Tem catálogo de fábrica de bagageiro, protetor de motor, banco de conforto, retrovisor e escapamento. Me diz como você imagina a sua e a gente monta a lista — o que dá para instalar já na entrega, sai na entrega.',
      },
    ],
    compliance:
      'Conteúdo de demonstração, escrito a partir do material público da marca. Confirme itens, números e disponibilidade de acessório na ficha oficial e com a loja antes de prometer ao cliente.',
    durationSec: 45,
    gradient: ['#6f1013', '#2b0507'],
    destaques: [
      { titulo: 'A moto que todo mundo reconhece', prova: 'Desenho clássico original da marca, farol redondo e paralama largo' },
      { titulo: 'Clássica de fora, atual por dentro', prova: 'Motor da geração J e ABS de duplo canal' },
      { titulo: 'Ela vira a moto do cliente', prova: 'Catálogo de fábrica de bagageiro, protetor, banco e escapamento' },
    ],
    ficha: [
      { label: 'Marca', value: 'Royal Enfield' },
      { label: 'Segmento', value: 'Clássica' },
      { label: 'Motor', value: 'Monocilíndrico 349 cc, plataforma J, refrigeração a ar e óleo' },
      { label: 'Potência', value: 'Cerca de 20 cv' },
      { label: 'Torque', value: 'Cerca de 27 Nm em giro baixo' },
      { label: 'Câmbio', value: '5 marchas' },
      { label: 'Freios', value: 'Disco nas duas rodas, ABS de duplo canal' },
      { label: 'Montagem', value: 'Manaus (AM)' },
      { label: 'Fonte', value: 'Números públicos da marca até maio de 2026 — CONFIRME na ficha oficial antes de falar com o cliente. Conteúdo de demonstração.' },
    ],
    storyboard: [
      { t: '0-10s', label: 'DEIXE OLHAR', line: 'Esta moto vende sozinha nos primeiros trinta segundos. Cale a boca e deixe o cliente olhar e tirar foto.' },
      { t: '10-22s', label: 'DESTRAVE A TÉCNICA', line: 'Depois do encanto vem o medo: vibra? quebra? Responda com motor da geração J, ABS e rede no Brasil.' },
      { t: '22-34s', label: 'A PERGUNTA HONESTA', line: 'Pergunte onde ele guarda a moto. Se for garagem apertada e trânsito diário, diga a verdade e mostre a Hunter.' },
      { t: '34-45s', label: 'O FECHAMENTO', line: 'Monte a moto com ele: bagageiro, protetor, banco. Cliente que escolhe acessório já decidiu comprar.' },
    ],
  },
  {
    id: 're-himalayan-450',
    brand: 'royal',
    category: 'royal',
    // Foto oficial da marca (royalenfield.com/br/pt), baixada para o app.
    imageUrl: '/motos/himalayan.jpg',
    fotos: ['/motos/himalayan.jpg'],
    family: 're-450',
    name: 'Himalayan 450',
    tagline: 'A trail de viagem da marca: motor Sherpa de 452 cc com refrigeração líquida, painel redondo com mapa do Google e ABS que desliga atrás.',
    hook: 'O cliente sonha com viagem longa e estrada de terra, mas acha que para isso precisa de uma trail gigante, pesada e de preço de carro.',
    whatItIs:
      'A Himalayan 450 é a moto de viagem da Royal Enfield: motor monocilíndrico Sherpa de 452 cc com refrigeração líquida e 6 marchas, suspensão de curso longo, roda dianteira de 21 polegadas e painel circular TFT que roda o mapa do Google direto na tela. Tem modos de pilotagem e ABS que pode ser desligado na roda traseira — que é o que a terra pede.',
    benefits: [
      'Motor Sherpa de 452 cc com refrigeração líquida: aguenta subida longa e calor sem perder rendimento',
      'Painel redondo TFT com o mapa do Google na tela — navegação de verdade, não só seta',
      'ABS desligável atrás e modos de pilotagem: a mesma moto para o asfalto e para a estrada de terra',
      'Roda dianteira de 21 polegadas e suspensão de curso longo, que é o que segura buraco e cascalho',
      'Tanque grande, feito para etapa longa entre postos',
      'Montada em Manaus, com rede no Brasil — viagem sem depender de importar peça',
    ],
    howToUse:
      'A venda começa pela viagem, não pela moto: pergunte qual foi a última que ele fez e qual está guardada na cabeça. Depois mostre os três itens que essa moto tem e a concorrência da faixa costuma cobrar à parte: navegação na tela, ABS desligável atrás e suspensão de curso longo. Termine perguntando quando ele quer sair na primeira.',
    forWho: 'Quem quer viajar de moto, inclusive fora do asfalto, sem carregar o peso e o preço de uma trail de mil cilindradas.',
    salesLine: 'Me conta a viagem que você quer fazer. Eu te mostro a moto que cabe nela — e o que precisa ir junto.',
    objections: [
      {
        trigger: '"452 cc é pouco para viajar?"',
        answer:
          'Para viagem real, o que cansa não é o pico de potência: é vibração, posição e autonomia. A Himalayan foi feita para isso, com refrigeração líquida, 6 marchas e tanque grande. Se a sua viagem for de dois com bagagem em rodovia pesada, eu te mostro também a linha 650 e a gente compara honestamente.',
      },
      {
        trigger: '"Nunca andei na terra. Vou conseguir?"',
        answer:
          'É exatamente por isso que essa moto tem modo de pilotagem e ABS que desliga só atrás — você começa no modo de asfalto e vai soltando conforme ganha confiança. Faça o primeiro test ride comigo no asfalto e o segundo num trecho de terra tranquilo.',
      },
      {
        trigger: '"Essa altura do banco não dá para mim."',
        answer:
          'É a pergunta certa e a resposta é sentar, não estimar. A marca tem opções de banco e ajuste — vamos medir com você em cima, do jeito que você vai pilotar, de bota. Se não ficar bom, eu te digo; moto que assusta na garagem não sai de casa.',
      },
      {
        trigger: '"Esse painel com Google Maps funciona mesmo?"',
        answer:
          'Funciona: o painel é uma tela redonda TFT e o mapa aparece nela, ligado ao seu celular. Na prática é o que muda a viagem — você para de fazer malabarismo com suporte de telefone no guidão, que é onde todo mundo perde o celular.',
      },
      {
        trigger: '"Quanto custa manter uma moto dessas?"',
        answer:
          'Revisão com preço publicado pela marca e rede no Brasil, com montagem em Manaus. Eu abro o plano de revisão agora e a gente vê intervalo por intervalo, para você comparar com a sua moto atual sem chute.',
      },
    ],
    compliance:
      'Conteúdo de demonstração, escrito a partir do material público da marca. Confirme itens de série, números, altura de banco e prazos na ficha oficial da Royal Enfield Brasil antes de falar com o cliente.',
    durationSec: 45,
    gradient: ['#b3541e', '#4a1f08'],
    destaques: [
      { titulo: 'A viagem sem planejar parada', prova: 'Tanque grande e motor Sherpa de 452 cc com refrigeração líquida' },
      { titulo: 'O mapa na moto, não no guidão', prova: 'Painel circular TFT com o Google Maps na tela' },
      { titulo: 'A mesma moto no asfalto e na terra', prova: 'Modos de pilotagem e ABS desligável na roda traseira' },
      { titulo: 'Buraco e cascalho sem susto', prova: 'Roda de 21 polegadas na frente e suspensão de curso longo' },
    ],
    ficha: [
      { label: 'Marca', value: 'Royal Enfield' },
      { label: 'Segmento', value: 'Trail de viagem' },
      { label: 'Motor', value: 'Monocilíndrico Sherpa 452 cc, refrigeração líquida' },
      { label: 'Potência', value: 'Cerca de 40 cv' },
      { label: 'Torque', value: 'Cerca de 40 Nm' },
      { label: 'Câmbio', value: '6 marchas' },
      { label: 'Painel', value: 'Circular TFT, com navegação do Google Maps' },
      { label: 'Pilotagem', value: 'Modos de pilotagem e ABS desligável na roda traseira' },
      { label: 'Rodas', value: '21 polegadas na frente, 17 atrás' },
      { label: 'Montagem', value: 'Manaus (AM)' },
      { label: 'Fonte', value: 'Números públicos da marca até maio de 2026 — CONFIRME na ficha oficial antes de falar com o cliente. Conteúdo de demonstração.' },
    ],
    storyboard: [
      { t: '0-10s', label: 'COMECE PELA VIAGEM', line: 'Pergunte qual viagem ele quer fazer. A moto entra depois — e entra como resposta, não como vitrine.' },
      { t: '10-22s', label: 'OS TRÊS ITENS', line: 'Navegação na tela, ABS que desliga atrás e suspensão de curso longo. É o que a faixa costuma cobrar à parte.' },
      { t: '22-34s', label: 'O MEDO DA TERRA', line: 'Modo de pilotagem existe pra isso: ele começa no asfalto e vai soltando. Ofereça o segundo test ride num trecho de terra.' },
      { t: '34-45s', label: 'O FECHAMENTO', line: 'Marque data da viagem, não só do test ride. Quem já tem a data marcada compra a moto que cabe nela.' },
    ],
    niveis: [
      {
        titulo: 'Equipar para viajar',
        foco: 'O que oferecer junto — e por que isso é serviço, não empurro.',
        storyboard: [
          { t: '0-12s', label: 'A REGRA', line: 'Ninguém viaja com a moto de fábrica. Malas, protetor de motor e bolsa de tanque não são extra: são o que faz a viagem acontecer.' },
          { t: '12-26s', label: 'A ORDEM CERTA', line: 'Ofereça na hora em que ele fala da viagem, nunca depois do preço fechado. Ali é serviço; depois vira venda casada.' },
          { t: '26-38s', label: 'O QUE SAI NA ENTREGA', line: 'O que dá pra instalar antes, instale antes. Moto entregue pronta pra viagem é a foto que ele manda pros amigos.' },
          { t: '38-45s', label: 'O COMBINADO', line: 'Liste com ele o que vai agora e o que fica pra depois. Lista escrita evita a briga do "achei que estava incluso".' },
        ],
      },
    ],
  },
  {
    id: 're-guerrilla-450',
    brand: 'royal',
    category: 'royal',
    // Foto oficial da marca (royalenfield.com/br/pt), baixada para o app.
    imageUrl: '/motos/guerrilla.jpg',
    fotos: ['/motos/guerrilla.jpg'],
    family: 're-450',
    name: 'Guerrilla 450',
    tagline: 'O motor Sherpa de 452 cc numa roadster de rua: a moto mais moderna da marca para quem anda na cidade e quer andar rápido.',
    hook: 'O cliente gosta da marca, mas acha que Royal Enfield é só moto clássica e lenta — e por isso nem entra na loja.',
    whatItIs:
      'A Guerrilla 450 pega o motor Sherpa de 452 cc com refrigeração líquida da Himalayan e coloca numa roadster de rua, com rodas de 17 polegadas nas duas pontas e postura urbana. É a Royal Enfield moderna: a que responde quando o cliente diz que a marca só faz moto de época.',
    benefits: [
      'Motor Sherpa de 452 cc com refrigeração líquida e 6 marchas — a base mais moderna da marca',
      'Rodas de 17 polegadas nas duas pontas: comportamento de roadster na curva e pneu fácil de achar',
      'Mais leve que a Himalayan, com a mesma força: é o que faz sentido no trânsito',
      'Painel digital com navegação (conforme versão)',
      'Montada em Manaus, com rede e peça no Brasil',
    ],
    howToUse:
      'Use a Guerrilla para quebrar a imagem de que a marca é só clássica. Se o cliente chegou olhando naked japonesa, esta é a moto que segura a conversa — motor moderno, peso de rua e a assinatura da marca. Leve para o test ride cedo: aqui o argumento é como ela anda.',
    forWho: 'Quem anda na cidade todo dia, quer motor moderno e não abre mão de desenho com personalidade.',
    salesLine: 'Se você acha que Royal Enfield é só moto antiga, senta nessa aqui dez minutos.',
    objections: [
      {
        trigger: '"Qual a diferença para a Himalayan, se o motor é o mesmo?"',
        answer:
          'O coração é o mesmo, o propósito não. A Himalayan é trail de viagem: roda 21 na frente, suspensão de curso longo, tanque grande. A Guerrilla é rua: roda 17 nas duas, mais leve e mais ágil no trânsito. Uma leva você para a estrada de terra, a outra para o dia a dia.',
      },
      {
        trigger: '"Royal Enfield não é marca de moto lenta?"',
        answer:
          'Essa é a moto que responde isso. Motor de 452 cc com refrigeração líquida e 6 marchas, na base mais nova da marca. Faça o test ride antes de falar qualquer número — dez minutos resolvem essa objeção melhor que dez argumentos.',
      },
      {
        trigger: '"Tem peça e assistência?"',
        answer:
          'Montagem em Manaus e rede própria no Brasil, com revisão de preço publicado. Se quiser, abro o plano de revisão agora e você compara com o da sua moto atual.',
      },
    ],
    compliance:
      'Conteúdo de demonstração, escrito a partir do material público da marca. Confirme itens de série e números na ficha oficial da Royal Enfield Brasil antes de falar com o cliente.',
    durationSec: 45,
    gradient: ['#c2410c', '#5c1d05'],
    destaques: [
      { titulo: 'A Royal Enfield que anda', prova: 'Motor Sherpa de 452 cc com refrigeração líquida e 6 marchas' },
      { titulo: 'Feita para o trânsito', prova: 'Rodas de 17 polegadas nas duas pontas e peso menor que o da Himalayan' },
      { titulo: 'Assistência no Brasil', prova: 'Montagem em Manaus, rede própria e revisão com preço publicado' },
    ],
    ficha: [
      { label: 'Marca', value: 'Royal Enfield' },
      { label: 'Segmento', value: 'Roadster' },
      { label: 'Motor', value: 'Monocilíndrico Sherpa 452 cc, refrigeração líquida' },
      { label: 'Potência', value: 'Cerca de 40 cv' },
      { label: 'Torque', value: 'Cerca de 40 Nm' },
      { label: 'Câmbio', value: '6 marchas' },
      { label: 'Rodas', value: '17 polegadas na frente e atrás' },
      { label: 'Montagem', value: 'Manaus (AM)' },
      { label: 'Fonte', value: 'Números públicos da marca até maio de 2026 — CONFIRME na ficha oficial antes de falar com o cliente. Conteúdo de demonstração.' },
    ],
    storyboard: [
      { t: '0-10s', label: 'A OBJEÇÃO QUE ABRE', line: 'Quando ele disser que a marca só faz moto antiga, é essa moto que você mostra. Não discuta: leve para o test ride.' },
      { t: '10-22s', label: 'O QUE ELA É', line: 'Motor Sherpa de 452 cc com refrigeração líquida numa roadster de rua. Roda 17 nas duas pontas, leve e ágil no trânsito.' },
      { t: '22-34s', label: 'CONTRA A HIMALAYAN', line: 'Mesma base, propósito oposto: uma é viagem e terra, a outra é cidade. Pergunte onde a moto vai dormir e andar.' },
      { t: '34-45s', label: 'O FECHAMENTO', line: 'Dez minutos no trânsito de verdade valem mais que qualquer comparativo impresso.' },
    ],
  },
  {
    id: 're-bear-650',
    brand: 'royal',
    category: 'royal',
    // Foto oficial da marca (royalenfield.com/br/pt), baixada para o app.
    imageUrl: '/motos/bear.jpg',
    fotos: ['/motos/bear.jpg'],
    family: 're-650',
    name: 'Bear 650',
    tagline: 'A scrambler de 648 cc: o motor de dois cilindros da linha 650 numa moto de estrada de terra, com roda de 19 na frente e escapamento alto.',
    hook: 'O cliente quer subir de cilindrada, mas acha que acima de 600 cc a moto vira brinquedo caro de manter.',
    whatItIs:
      'A Bear 650 é a scrambler da marca: o mesmo motor de dois cilindros paralelos de 648 cc da linha 650, agora numa moto com roda dianteira de 19 polegadas, escapamento alto e postura ereta. É a que entrega o que o cliente procura quando diz que quer "uma moto de verdade" — torque de estrada e som de twin — sem ficar presa ao asfalto.',
    benefits: [
      'Motor de dois cilindros de 648 cc: empurrada de estrada e ultrapassagem sem planejar',
      'Roda de 19 polegadas na frente e escapamento alto: encara estrada de terra sem virar moto de trilha',
      'Comportamento fácil para a cilindrada — é das 650 mais amigáveis para quem está subindo de moto',
      'Postura ereta, que é o que permite rodar horas sem dor de coluna',
      'Som de twin: parte da compra, e o cliente sabe disso',
      'Rede e peça no Brasil, com montagem nacional',
    ],
    howToUse:
      'Este é o upgrade de quem já tem uma 350 — e a melhor abordagem é a mais simples: convide para andar. Antes, pergunte que tipo de estrada ele faz e se anda com garupa. Se a resposta for viagem com duas pessoas e bagagem, a 650 deixa de ser desejo e vira recomendação técnica.',
    forWho: 'Quem já pilota, quer dois cilindros e faz estrada com frequência — sozinho ou de dois.',
    salesLine: 'Liga ela e escuta. Depois a gente conversa sobre o resto.',
    objections: [
      {
        trigger: '"650 não é demais para mim?"',
        answer:
          'Essa é das 650 mais fáceis de pilotar: entrega linear e postura ereta, sem aquele susto de moto esportiva. Ainda assim, quem decide é você no test ride — e se eu achar que ainda não é a hora, eu te digo e a gente olha a 350 com calma.',
      },
      {
        trigger: '"Manutenção de 650 é muito mais cara?"',
        answer:
          'É maior que a de uma 350, seria mentira dizer o contrário — são dois cilindros. Mas é revisão de preço publicado, com rede no Brasil. Vamos abrir os dois planos lado a lado agora, o da 350 e o da 650, para você decidir com número e não com medo.',
      },
      {
        trigger: '"Consumo deve ser alto."',
        answer:
          'É de twin de 650, não de moto pequena — e na estrada, em velocidade constante, ela se comporta bem. Prefiro te mostrar o número oficial na ficha a chutar: o que não vale é você descobrir a conta no segundo tanque.',
      },
      {
        trigger: '"Vale a pena trocar minha 350 por ela?"',
        answer:
          'Se o seu uso mudou — mais estrada, mais garupa, mais bagagem — vale. Se você anda no trânsito cinco dias por semana e viaja duas vezes por ano, a 350 continua sendo a moto certa, e eu não vou te empurrar a troca. Me diz como foram os seus últimos três meses de uso.',
      },
    ],
    compliance:
      'Conteúdo de demonstração, escrito a partir do material público da marca. Confirme números, itens e plano de revisão na ficha oficial da Royal Enfield Brasil antes de falar com o cliente.',
    durationSec: 45,
    gradient: ['#7f1d1d', '#2c0808'],
    destaques: [
      { titulo: 'Ultrapassa sem planejar', prova: 'Motor de dois cilindros, 648 cc, com torque de estrada' },
      { titulo: 'Fácil para uma 650', prova: 'Entrega linear e postura ereta' },
      { titulo: 'O som faz parte', prova: 'Twin paralelo — é o que o cliente procura quando diz "moto de verdade"' },
      { titulo: 'Sai do asfalto sem drama', prova: 'Roda de 19 na frente e escapamento alto' },
    ],
    ficha: [
      { label: 'Marca', value: 'Royal Enfield' },
      { label: 'Segmento', value: 'Scrambler de média cilindrada' },
      { label: 'Motor', value: 'Dois cilindros paralelos, 648 cc' },
      { label: 'Potência', value: 'Cerca de 47 cv' },
      { label: 'Torque', value: 'Cerca de 52 Nm' },
      { label: 'Câmbio', value: '6 marchas' },
      { label: 'Freios', value: 'Disco nas duas rodas, ABS de duplo canal' },
      { label: 'Rodas', value: '19 polegadas na frente, 17 atrás' },
      { label: 'Montagem', value: 'Manaus (AM)' },
      { label: 'Fonte', value: 'Números públicos da marca até maio de 2026 — CONFIRME na ficha oficial antes de falar com o cliente. Conteúdo de demonstração.' },
    ],
    storyboard: [
      { t: '0-10s', label: 'O CONVITE', line: 'Com a 650 não se argumenta: liga a moto e deixa o cliente ouvir. Esse é o primeiro argumento.' },
      { t: '10-22s', label: 'O QUE MUDA', line: 'Dois cilindros, 648 cc: ultrapassagem sem planejar e estrada com folga. É o degrau natural de quem tem uma 350.' },
      { t: '22-34s', label: 'A CONTA HONESTA', line: 'Manutenção de twin é maior que a de uma 350. Abra os dois planos lado a lado — sinceridade aqui fecha a venda.' },
      { t: '34-45s', label: 'O FECHAMENTO', line: 'Pergunte como foram os últimos três meses de uso dele. A resposta diz se é hora de subir de moto.' },
    ],
  },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

// (Removido o link do reel do Instagram das mensagens: o compartilhar agora
// manda o PRÓPRIO VÍDEO em anexo, então o link ficava repetido e ainda tirava a
// cliente da conversa.)

// De quem partiu o link — vira o rastreio (UTM) na URL de compra.
export interface BuyContext {
  medium?: string; // balconista | promotor | afiliado-geral | afiliado-saude
  code?: string; // código do afiliado, quando ele tiver
}

// Link de compra COM RASTREIO. O e-commerce é Shopify, que lê UTM nativamente:
// a Meraki abre o painel e vê que a venda veio do Eleva, de qual público e —
// quando houver programa de afiliados — de qual pessoa.
export function buyLinkFor(p: Product, ctx: BuyContext = {}): string | undefined {
  if (!p.buyUrl) return undefined;
  try {
    const u = new URL(p.buyUrl);
    u.searchParams.set('utm_source', 'eleva'); // veio do app
    if (ctx.medium) u.searchParams.set('utm_medium', ctx.medium); // qual público
    u.searchParams.set('utm_campaign', p.id); // qual produto
    if (ctx.code) u.searchParams.set('utm_content', ctx.code); // qual pessoa
    return u.toString();
  } catch {
    return p.buyUrl;
  }
}

export function withBuyLink(text: string, p: Product, ctx: BuyContext = {}): string {
  const link = buyLinkFor(p, ctx);
  return link ? `${text}\n\nPra comprar: ${link}` : text;
}

// A ficha técnica virada em mensagem — pra mandar no WhatsApp da cliente quando
// ela pergunta o que tem, quantos vem e quanto dura. Vai com o aviso de
// suplemento junto (é informação de produto indo pra consumidora).
export function buildFichaMessage(p: Product, ctx: BuyContext = {}): string {
  if (!p.ficha || !p.ficha.length) return '';
  const parts = [
    `*${p.name}*`,
    '_Ficha do produto_',
    '',
    p.ficha.map((r) => `*${r.label}:* ${r.value}`).join('\n'),
  ];
  if (p.compliance) parts.push('', p.compliance);
  return withBuyLink(parts.join('\n'), p, ctx);
}

// Monta o "conhecimento" dos produtos que vai como contexto pra IA de balcão.
// É SÓ o conteúdo já aprovado (o que é, benefícios, objeções, ficha, aviso) —
// a IA responde em cima disso e nada além. Ver api/eleva-ia.js.
export function productKnowledge(products: Product[]): string {
  return products
    .map((p) => {
      const benefits = p.benefits.map((b) => `- ${b}`).join('\n');
      const objs = p.objections
        .map((o) => `  • Se o cliente diz ${o.trigger}: ${o.answer}`)
        .join('\n');
      const ficha = (p.ficha || []).map((r) => `  - ${r.label}: ${r.value}`).join('\n');
      // AS VERSÕES. Sem elas a IA lia "JAECOO 7 ELITE = taxa 0%, entrada 80%"
      // na carta comercial e não fazia ideia do que é uma ELITE, quais versões
      // existem nem o que muda de uma pra outra — as cartas do mês são TODAS
      // organizadas por versão, então era garantido não bater com a aba de
      // Condições. A lista é cumulativa, e o `herda` vai junto: é assim que ela
      // responde "tudo da Luxury, mais isso aqui" em vez de repetir trinta itens.
      const versoes = (p.versoes || [])
        .map((v) => [
          `  - ${v.nome}: ${v.paraQuem}`,
          v.herda ? `    herda tudo da ${v.herda} e acrescenta:` : '    vem com:',
          `    ${v.vemCom.join(' · ')}`,
        ].join('\n'))
        .join('\n');
      // Os 5 destaques: benefício + a ficha que sustenta. É o par que o cliente
      // usa pra decidir, e a IA não tinha nenhum dos dois nesse formato.
      const dest = (p.destaques || [])
        .map((d) => `  - ${d.titulo}${d.prova ? ` (prova: ${d.prova})` : ''}`)
        .join('\n');
      return [
        `### ${p.name}`,
        p.tagline ? `Resumo: ${p.tagline}` : '',
        `O que é: ${p.whatItIs}`,
        `Para quem: ${p.forWho}`,
        `Benefícios (linguagem permitida):\n${benefits}`,
        dest ? `Destaques (benefício e a prova):\n${dest}` : '',
        versoes ? `Versões do modelo, da de entrada para a de topo:\n${versoes}` : '',
        objs ? `Objeções comuns e como responder:\n${objs}` : '',
        ficha ? `Ficha:\n${ficha}` : '',
        p.compliance ? `Aviso de enquadramento: ${p.compliance}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');
}

export function buildShareMessage(p: Product, ctx: BuyContext = {}): string {
  const benefits = p.benefits.slice(0, 3).map((b) => `✅ ${b}`).join('\n');
  return withBuyLink([
    `*${p.name}*`,
    '',
    p.hook,
    '',
    benefits,
    '',
    p.salesLine,
  ].join('\n'), p, ctx);
}

// Várias versões da mensagem pronta — todas puxam os BENEFÍCIOS, em ângulos
// diferentes. O botão "Compartilhar" gira entre elas: cada clique manda uma
// diferente, pra vendedora não repetir o mesmo texto com toda cliente.
export function buildShareVariants(p: Product, ctx: BuyContext = {}): string[] {
  const bens = p.benefits.filter(Boolean);
  const b = (i: number) => bens[bens.length ? i % bens.length : 0] || p.tagline;
  const variants: string[] = [];

  // 1) Benefícios em lista (o clássico)
  variants.push([
    `*${p.name}*`,
    '',
    bens.slice(0, 3).map((x) => `✅ ${x}`).join('\n'),
    '',
    p.salesLine,
  ].join('\n'));

  // 2) Dor → solução (usa o gancho)
  if (p.hook) {
    variants.push([
      p.hook,
      '',
      `O *${p.name}* te ajuda nisso:`,
      `✅ ${b(0)}`,
      `✅ ${b(1)}`,
      '',
      'Me chama que eu te explico.',
    ].join('\n'));
  }

  // 3) Curto e pessoal — um benefício forte
  variants.push([
    'Oi! Lembrei de você.',
    '',
    `*${p.name}* — ${b(0).toLowerCase()}.`,
    '',
    p.salesLine,
  ].join('\n'));

  // 4) Pra quem é
  if (p.forWho) {
    variants.push([
      'Isso aqui pode ser para você:',
      '',
      `*${p.name}*: ${p.tagline}`,
      `✅ ${b(1)}`,
      '',
      'Quer que eu te conte como usa?',
    ].join('\n'));
  }

  // 5) Objeção já respondida
  if (p.objections && p.objections.length) {
    const o = p.objections[0];
    variants.push([
      `Muita cliente me pergunta: ${o.trigger}`,
      '',
      o.answer,
      '',
      `*${p.name}* — me chama que eu te ajudo a escolher.`,
    ].join('\n'));
  }

  // 6) Só benefícios, direto ao ponto
  if (bens.length >= 2) {
    variants.push([
      `Sobre o *${p.name}*:`,
      '',
      `✅ ${b(0)}`,
      `✅ ${b(1)}`,
      bens[2] ? `✅ ${bens[2]}` : '',
      '',
      'Quer saber mais? Me chama.',
    ].filter(Boolean).join('\n'));
  }

  // Toda versão leva o vídeo E o link de compra rastreado — a cliente recebe a
  // mensagem, vê o vídeo e compra sem sair da conversa.
  return variants.map((v) => withBuyLink(v, p, ctx));
}
