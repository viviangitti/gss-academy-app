// Pílulas de Produto — base de conteúdo
// Cada produto vira uma "pílula": conteúdo curto, focado em BENEFÍCIO,
// de uso duplo (treina a vendedora + ela compartilha com a cliente).
//
import { Dumbbell, Pill, Wind, Sparkles, Flower2, type LucideIcon } from 'lucide-react';
import type { BrandId } from './brands';
import type { Audience } from '../AuthContext';
//
// Regra de ouro (compliance ANVISA p/ suplementos): benefício sempre no
// enquadramento "auxilia / contribui / ajuda a", NUNCA "cura / trata / emagrece".
// Para MEDICAMENTOS (ex.: acetilcisteína, expectorantes): copy factual, sem
// promessa, sempre remetendo à bula/rótulo e à orientação profissional.

export type Category = 'performance' | 'capsulas' | 'respiratorio' | 'cosmeticos' | 'perfumaria';

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
  storyboard: Scene[]; // roteiro do vídeo de 30s
  videoUrl?: string; // MP4 real da pílula (quando o gestor sobe um vídeo)
  audienceVideos?: Partial<Record<Audience, string>>; // MP4 pronto POR PÚBLICO (bundled em /public/videos) — ex.: vídeos da Mari
  instagramUrl?: string; // link de um reel/post público do IG — prova social (só o gestor cadastra)
  imageUrl?: string; // foto de capa (URL hospedada; upload local fica no IndexedDB)
  buyUrl?: string; // e-commerce oficial — a cliente compra direto
  ficha?: FichaRow[]; // ficha técnica p/ consulta rápida no balcão
}

// Linha que o AFILIADO enxerga. Hoje ele só trabalha a GLPEN — o resto do
// portfólio (Hyaluvita, Moviben, Resfben...) é assunto de balconista/promotor.
export const AFILIADO_LINE = 'glpen';

// Filtra o catálogo pelo que o papel pode ver. Afiliado só vê a linha GLPEN;
// balconista, promotor e gestor veem tudo.
export function visibleProducts(products: Product[], role?: string): Product[] {
  if (role === 'afiliado') return products.filter((p) => p.line === AFILIADO_LINE);
  return products;
}

export const CATEGORIES: Record<Category, { label: string; Icon: LucideIcon }> = {
  performance: { label: 'Performance & Massa Magra', Icon: Dumbbell },
  capsulas: { label: 'Suplementos & Vitaminas', Icon: Pill },
  respiratorio: { label: 'Vias Respiratórias', Icon: Wind },
  cosmeticos: { label: 'Cosméticos & Skincare', Icon: Sparkles },
  perfumaria: { label: 'Perfumaria', Icon: Flower2 },
};

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
