// Pílulas de Produto — base de conteúdo
// Cada produto vira uma "pílula": conteúdo curto, focado em BENEFÍCIO,
// de uso duplo (treina a vendedora + ela compartilha com a cliente).
//
import { Dumbbell, Pill, Wind, Sparkles, Flower2, Car, Zap, Wrench, type LucideIcon } from 'lucide-react';
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
export type Category = 'performance' | 'capsulas' | 'respiratorio' | 'cosmeticos' | 'perfumaria' | 'jaecoo' | 'omoda' | 'acessorio';

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
  acessorio: { label: 'Acessórios', Icon: Wrench },
};

// Quais categorias o gestor pode escolher, por vertical. Sem isso a Ramasa via
// "Performance & Massa Magra" e "Vias Respiratórias" no cadastro do carro.
export const CATEGORIAS_AUTO: Category[] = ['jaecoo', 'omoda', 'acessorio'];
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
      { t: '30-40s', label: 'A VIRADA', line: 'Compare item a item: teto panorâmico, ADAS completo, tela de até 14,8 polegadas. Na concorrência isso é opcional.' },
      { t: '40-45s', label: 'CTA', line: 'Agende o test drive e mande a condição por escrito — ela tem validade.' },
    ],
    niveis: [
      {
        titulo: 'Contra o concorrente',
        foco: 'Os números que ganham do Haval, do Song Plus, do Corolla Cross e do Compass.',
        storyboard: [
          { t: '0-8s', label: 'A REGRA', line: 'Nunca fale mal do concorrente. Compare com número, que é o que o cliente consegue repetir em casa.' },
          { t: '8-20s', label: 'CONTRA O HAVAL', line: 'O porta-malas dele é maior, admita. Mas o nosso faz 15,1 km por litro contra 13,5, e as três primeiras revisões saem por 3.216 com preço fixo publicado. Mais som Sony e aquecimento de banco, que ele não tem.' },
          { t: '20-32s', label: 'CONTRA O SONG PLUS', line: 'Ele é mais espaçoso no entre-eixos. Nós temos um ano a mais de garantia e 17,4 centímetros de altura do solo contra 15. E ele depreciou 17,2% em 2025 — quarenta mil reais.' },
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
      { t: '15-30s', label: 'O ARGUMENTO', line: 'Resolvida a tomada, mostre o resto: painel de 24,6", som Sony, bancos ventilados e aquecidos, 7 airbags.' },
      { t: '30-40s', label: 'A VIRADA', line: 'Contra Corolla Cross e HR-V, compare item a item na mesma faixa. Aqui o pacote vem de série.' },
      { t: '40-45s', label: 'CTA', line: 'Leve pro test drive: economia de combustível se sente rodando, não na tabela.' },
    ],
    niveis: [
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
      { t: '30-40s', label: 'O ARGUMENTO', line: 'Aí sim: 24,6", head-up display, comando de voz, ADAS 2.5. E a conta de combustível saindo da vida dele.' },
      { t: '40-45s', label: 'CTA', line: 'Se o perfil não bater, ofereça o híbrido. Vender o carro errado volta como reclamação.' },
    ],
    niveis: [
      {
        titulo: 'Contra o concorrente elétrico',
        foco: 'O número que ganha de todos eles — e como usar sem parecer folheto.',
        storyboard: [
          { t: '0-8s', label: 'O NÚMERO', line: 'Guarde este: 345 km de autonomia pelo Inmetro. Os concorrentes diretos fazem 330, 319, 294 e 250.' },
          { t: '8-18s', label: 'POR QUE GANHA', line: 'Não é bateria maior por força bruta: o coeficiente aerodinâmico é 0,281, melhor que o deles. O carro corta o ar gastando menos.' },
          { t: '18-30s', label: 'A CONTA QUE FECHA', line: 'Primeira revisão: 459 reais. Cinco anos de revisão: 1.852. Sem óleo, sem filtro, sem correia. Peça pro cliente lembrar quanto pagou na última revisão dele.' },
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
      { t: '15-30s', label: 'O ARGUMENTO', line: 'Compare equipado contra equipado: 8 airbags, ADAS com evasão inteligente, plug-in com 18,4 kWh. Veja onde o preço do concorrente para.' },
      { t: '30-40s', label: 'A OBJEÇÃO', line: '"Preciso de tomada em casa?" — para aproveitar o melhor dele, sim. Mas sem carregar ele roda como híbrido normal.' },
      { t: '40-45s', label: 'CTA', line: 'Test drive em horário de trânsito: o assistente de congestionamento vende sozinho.' },
    ],
    niveis: [
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
      return [
        `### ${p.name}`,
        p.tagline ? `Resumo: ${p.tagline}` : '',
        `O que é: ${p.whatItIs}`,
        `Para quem: ${p.forWho}`,
        `Benefícios (linguagem permitida):\n${benefits}`,
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
