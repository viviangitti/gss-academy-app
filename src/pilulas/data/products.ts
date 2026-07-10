// Pílulas de Produto — base de conteúdo
// Cada produto vira uma "pílula": conteúdo curto, focado em BENEFÍCIO,
// de uso duplo (treina a vendedora + ela compartilha com a cliente).
//
import { Dumbbell, Pill, Wind, Sparkles, Flower2, type LucideIcon } from 'lucide-react';
import type { BrandId } from './brands';
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

export interface Product {
  id: string;
  brand: BrandId;
  name: string;
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
  instagramUrl?: string; // link de um reel/post público do IG — prova social (só o gestor cadastra)
  imageUrl?: string; // foto de capa (URL hospedada; upload local fica no IndexedDB)
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
    brand: 'meraki',
    name: 'GLPEN Nutri Muscle',
    imageUrl: 'https://drogal.vtexassets.com/arquivos/ids/279281-600-600?v=639141832073530000',
    instagramUrl: 'https://www.instagram.com/reel/DZiG3EQOXzi',
    category: 'performance',
    tagline: 'Proteína de alto valor biológico com leucina, creatina, eletrólitos e vitaminas em uma dose — apoio à massa magra durante o emagrecimento.',
    hook: 'Quem emagrece com a medicação da caneta também pode perder massa magra no caminho. Dá para cuidar disso.',
    whatItIs:
      'Num emagrecimento acelerado, o corpo pode perder não apenas gordura, mas também massa magra — e é a massa magra que sustenta a força, a firmeza e a disposição do dia a dia. O GLPEN Nutri Muscle foi pensado para acompanhar essa fase: proteína de alto valor biológico, leucina, creatina, eletrólitos e vitaminas em uma única dose, para apoiar quem está emagrecendo com orientação profissional.',
    benefits: [
      'Proteína de alto valor biológico, que contribui para a manutenção da massa muscular',
      'Leucina e creatina, aliadas do treino de força',
      'Eletrólitos e vitaminas que auxiliam a disposição quando a alimentação está reduzida',
      'Uma dose por dia — prático mesmo quando o apetite está baixo',
    ],
    howToUse:
      'Uma dose por dia, de preferência após o treino de força. O suplemento é um apoio: quem preserva a massa magra é a combinação de proteína adequada, treino de força e acompanhamento profissional.',
    forWho:
      'Pessoas em processo de emagrecimento com medicação (como semaglutida ou tirzepatida), sob orientação profissional, que querem cuidar da massa magra e da disposição.',
    salesLine: 'Emagrecer cuidando da massa magra faz diferença no resultado. Quer que eu te explique como ele entra na sua rotina?',
    objections: [
      {
        trigger: '"A caneta já emagrece, pra que tomar isso?"',
        answer:
          'A medicação auxilia na perda de peso, mas essa perda pode incluir massa magra, e não só gordura. O GLPEN oferece proteína, leucina e creatina para apoiar a manutenção da massa muscular ao longo do processo — sempre junto do treino de força e da orientação do seu profissional de saúde.',
      },
      {
        trigger: '"Achei caro."',
        answer:
          'Entendo. Vale pensar nele como parte do cuidado com o resultado: preservar a massa magra ajuda na força, na firmeza e na manutenção do peso ao longo do tempo. Se quiser, eu te mostro o custo por dose e a gente vê se cabe na sua rotina.',
      },
      {
        trigger: '"Já tomo whey, está de bom tamanho."',
        answer:
          'O whey é uma ótima fonte de proteína. A diferença aqui é que, além da proteína, a dose traz leucina, creatina, eletrólitos e vitaminas — pensado para quem está comendo menos por causa da medicação. É uma opção mais completa para essa fase específica.',
      },
    ],
    compliance:
      'Suplemento alimentar. Não é medicamento e não substitui acompanhamento médico ou nutricional nem uma alimentação equilibrada. Uso de medicação: consulte seu profissional de saúde.',
    durationSec: 34,
    gradient: ['#12B5A5', '#0B5563'],
    storyboard: [
      { t: '0-4s', label: 'GANCHO', line: 'Emagrecer rápido pode custar massa magra. Dá para cuidar disso.' },
      { t: '4-10s', label: 'O PORQUÊ', line: 'A perda de peso nem sempre é só de gordura — a massa magra também pode ir junto.' },
      { t: '10-16s', label: 'O PRODUTO', line: 'GLPEN Nutri Muscle: proteína de alto valor, leucina e creatina em uma dose.' },
      { t: '16-23s', label: 'O APOIO', line: 'Apoia a manutenção da massa muscular, junto do treino e da orientação profissional.' },
      { t: '23-29s', label: 'NA PRÁTICA', line: 'Uma dose por dia — prático mesmo com o apetite reduzido.' },
      { t: '29-34s', label: 'CTA', line: 'Quer saber se faz sentido para você? Me chama.' },
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
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

// Se o produto tem um reel do Instagram, o link do VÍDEO vai junto na mensagem —
// a cliente assiste sem sair do WhatsApp. (Só entra quando existe vídeo de verdade.)
export function withVideoLink(text: string, p: Product): string {
  return p.instagramUrl ? `${text}\n\nVeja o vídeo do produto: ${p.instagramUrl}` : text;
}

export function buildShareMessage(p: Product): string {
  const benefits = p.benefits.slice(0, 3).map((b) => `✅ ${b}`).join('\n');
  return withVideoLink([
    `*${p.name}*`,
    '',
    p.hook,
    '',
    benefits,
    '',
    p.salesLine,
  ].join('\n'), p);
}

// Várias versões da mensagem pronta — todas puxam os BENEFÍCIOS, em ângulos
// diferentes. O botão "Compartilhar" gira entre elas: cada clique manda uma
// diferente, pra vendedora não repetir o mesmo texto com toda cliente.
export function buildShareVariants(p: Product): string[] {
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

  // O link do vídeo (reel) vai em toda versão — a cliente recebe a mensagem E o vídeo.
  return variants.map((v) => withVideoLink(v, p));
}
