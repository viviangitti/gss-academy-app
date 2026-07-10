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
    tagline: 'O guarda-costas do seu músculo enquanto a caneta faz o resto: proteína de alto valor + leucina, creatina, eletrólitos e vitaminas numa dose só.',
    hook: 'A caneta te emagrece — e derrete seu músculo junto. Ninguém te avisou, né?',
    whatItIs:
      'Deixa eu te contar um perigo que quase ninguém comenta: quando você emagrece na caneta, boa parte do que some não é gordura — é MÚSCULO. E músculo perdido é flacidez, cansaço e efeito sanfona batendo na porta. O GLPEN Nutri Muscle é o guarda-costas que segura esse músculo: proteína de alto valor, leucina, creatina, eletrólitos e vitaminas numa dose só, pra você perder gordura sem perder o corpo que tanto suou.',
    benefits: [
      'Segura a massa magra que a caneta tende a levar embora (proteína de alto valor biológico)',
      'Leucina + creatina: os guarda-costas do músculo no treino de força',
      'Eletrólitos e vitaminas pra você não apagar de cansaço comendo pouco',
      '1 dose por dia — funciona até quando a fome some por causa da caneta',
    ],
    howToUse:
      '1 dose por dia, de preferência depois do treino de força. A conta é simples: a caneta tira a gordura, o GLPEN + musculação seguram o músculo. Um sem o outro é meio caminho — e meio caminho é flacidez.',
    forWho:
      'Toda mulher que está na caneta (semaglutida, tirzepatida) e NÃO quer o combo "magra e flácida": quer emagrecer firme, com energia e sem efeito sanfona.',
    salesLine: 'Você suou pra emagrecer — não deixa seu músculo ir embora de graça. Me chama aqui que em 2 minutos eu monto o seu 👊',
    objections: [
      {
        trigger: '"A caneta já emagrece, pra que tomar isso?"',
        answer:
          'A caneta emagrece — mas ela não escolhe o que sai. Até 40% do peso que você perde pode ser MÚSCULO, não gordura. O GLPEN é justamente o que faz a balança descer sem o seu corpo murchar junto. Você quer magra, não murcha.',
      },
      {
        trigger: '"Achei caro."',
        answer:
          'Caro é emagrecer e ficar flácida — aí vem preenchimento, bioestimulador, roupa nova. O GLPEN sai por menos que um lanche por dia pra proteger o corpo que você está construindo. Isso não é gasto, é seguro de músculo.',
      },
      {
        trigger: '"Já tomo whey, tá de bom tamanho."',
        answer:
          'Whey é UM pedaço da história. Aqui você tem proteína + leucina + creatina + eletrólitos numa dose só, pensado pra quem come pouco na caneta. É o whey com propósito — não mais um pote encostado na prateleira.',
      },
    ],
    compliance:
      'Suplemento alimentar. Não é medicamento e não substitui acompanhamento médico ou nutricional nem uma alimentação equilibrada. Uso de medicação: consulte seu profissional de saúde.',
    durationSec: 34,
    gradient: ['#12B5A5', '#0B5563'],
    storyboard: [
      { t: '0-4s', label: 'GANCHO', line: 'Cuidado: a caneta pode te deixar magra E flácida ao mesmo tempo.' },
      { t: '4-10s', label: 'O INIMIGO', line: 'Até 40% do peso que você perde na caneta pode ser músculo — não gordura.' },
      { t: '10-16s', label: 'A VIRADA', line: 'O GLPEN Nutri Muscle segura esse músculo: proteína, leucina e creatina numa dose.' },
      { t: '16-23s', label: 'A PROMESSA', line: 'Aí você emagrece FIRME: com energia, sem flacidez e sem efeito sanfona.' },
      { t: '23-29s', label: 'É SIMPLES', line: 'É 1 por dia. Fácil até quando a caneta tira a sua fome.' },
      { t: '29-34s', label: 'CTA', line: 'Suou pra emagrecer? Não deixa o músculo ir junto. Me chama 👊' },
    ],
  },

  // ───────────────────── Suplementos & Vitaminas (MERAKI) ─────────────────────
  {
    id: 'hyaluvita-shot',
    brand: 'meraki',
    name: 'Hyaluvita Shot',
    imageUrl: 'https://hyaluvita.com.br/cdn/shop/files/Design_sem_nome_29_1.png?v=1727861365',
    instagramUrl: 'https://www.instagram.com/reel/C7ZU0uDMz0N',
    category: 'cosmeticos',
    tagline: 'Ácido hialurônico + colágeno Verisol + vitaminas A, C e E num sachê — beleza de dentro pra fora, 1x por dia.',
    hook: 'Gasta uma fortuna em creme, mas por dentro não cuida de nada? A pele também se alimenta.',
    whatItIs:
      'Sabe aquela pele que parece "iluminada de dentro"? Ela não vem só do creme — vem também do que você põe pra dentro. O Hyaluvita Shot junta ácido hialurônico + colágeno Verisol + vitaminas A, C e E num sachê que você dissolve na água e toma 1x por dia. É a dermatologia nutritiva: cuidar da pele, do cabelo e das unhas de dentro pra fora, na dose certa e com sabor gostoso.',
    benefits: [
      'Ácido hialurônico + colágeno Verisol: contribuem para a hidratação e a firmeza da pele',
      'Vitaminas A, C e E — antioxidantes que auxiliam a saúde da pele',
      'Também favorece cabelo e unhas: beleza de dentro pra fora',
      'Sachê prático, 1x ao dia, sem glúten, lactose ou açúcar — sabor que dá vontade de manter',
    ],
    howToUse:
      'Dissolva 1 sachê em água, 1 vez ao dia, conforme o rótulo. O sabor é gostoso e a rotina é fácil de manter — e é a constância do dia a dia que traz o resultado.',
    forWho:
      'Quem quer cuidar de pele, cabelo e unhas de dentro pra fora e cansou de gastar só em creme.',
    salesLine: 'Beleza começa de dentro — pele, cabelo e unha agradecem. Quer que eu te conte como encaixar 1 sachê na sua rotina? ✨',
    objections: [
      { trigger: '"Colágeno tomado funciona mesmo?"', answer: 'O Verisol é um colágeno com estudos de biodisponibilidade, e aqui ele vem junto com ácido hialurônico e vitaminas A, C e E. O segredo é a constância: tomando todo dia, você contribui para a firmeza e a hidratação da pele de dentro pra fora.' },
      { trigger: '"Já tomo colágeno."', answer: 'Que ótimo! O diferencial daqui é a combinação num sachê só: colágeno Verisol + ácido hialurônico + vitaminas antioxidantes, na dose certa. Menos potinho, menos conta na cabeça — um sachê e pronto.' },
      { trigger: '"Achei caro."', answer: 'Pensa que é 1 sachê por dia cuidando de pele, cabelo e unha ao mesmo tempo, de dentro pra fora. Costuma sair bem menos que um bom sérum ou uma sessão de procedimento — e você mantém todo dia.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento e não substitui uma alimentação equilibrada nem acompanhamento profissional. Resultados variam de pessoa para pessoa.',
    durationSec: 30,
    gradient: ['#7a3f9e', '#4a2270'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Gasta uma fortuna em creme, mas por dentro não cuida?' },
      { t: '3-10s', label: 'O PORQUÊ', line: 'A pele também se alimenta: ácido hialurônico, colágeno e vitaminas fazem falta de dentro.' },
      { t: '10-20s', label: 'O PRODUTO', line: 'Hyaluvita Shot: hialurônico + colágeno Verisol + vitaminas num sachê, 1x ao dia.' },
      { t: '20-30s', label: 'CTA', line: 'Quer beleza de dentro pra fora? Me chama ✨' },
    ],
  },
  {
    id: 'hyaluvita-duo-collagen',
    brand: 'meraki',
    name: 'Hyaluvita Duo Collagen',
    imageUrl: 'https://hyaluvita.com.br/cdn/shop/files/1Duocollagen_7b46bf2a-8dbb-474f-b508-694212937066.jpg',
    category: 'cosmeticos',
    tagline: 'Dois colágenos (Verisol 2,5g + hidrolisado 10g) com silício orgânico, vitamina C, E, zinco e cromo — pó sabor limão.',
    hook: 'Fez o procedimento, gastou uma nota — e não deu ao corpo a matéria-prima pra construir o colágeno?',
    whatItIs:
      'Procedimento estético que estimula colágeno (bioestimulador, laser, microagulhamento) é só o ESTÍMULO — quem constrói o colágeno depois é o seu corpo. E pra construir, ele precisa de matéria-prima. O Duo Collagen junta 2,5g de colágeno Verisol + 10g de colágeno hidrolisado + 500mg de silício orgânico (Nutricolin), com vitamina C, vitamina E, zinco e cromo. É o "material de obra" que acompanha o que você já investiu — sabor limão, 1 dose por dia.',
    benefits: [
      'Dois colágenos numa dose só: Verisol (2,5g) + colágeno hidrolisado (10g)',
      'Silício orgânico Nutricolin (500mg) + vitamina C, que contribui para a formação normal de colágeno',
      'Vitamina E, zinco e cromo — antioxidantes que auxiliam pele, cabelos e unhas',
      'Pó sabor limão que dissolve na água: fácil de manter todo dia',
    ],
    howToUse:
      'Dissolva 2 medidas (15g) em 200ml de água, 1x ao dia — de preferência em jejum ou com bom intervalo das refeições. Costuma ser orientado por pelo menos 3 meses após o procedimento.',
    forWho:
      'Quem fez (ou vai fazer) procedimento estético que estimula colágeno e quer dar ao corpo a matéria-prima pra construir o resultado.',
    salesLine: 'O procedimento é o estímulo — quem constrói o colágeno é você. Quer que eu te explique como tomar? 💧',
    objections: [
      { trigger: '"Colágeno em pó funciona mesmo?"', answer: 'O Verisol é um peptídeo de colágeno com estudos, e aqui ele vem junto da vitamina C, que contribui para a formação normal do colágeno. Não é mágica: é matéria-prima + constância. Por isso a orientação costuma ser de 3 meses pra cima.' },
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
      { t: '20-28s', label: 'CTA', line: 'Quer proteger o que você já investiu? Me chama 💧' },
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
      'Cabelo, unha e pele são construídos de dentro pra fora — e pra construir, o corpo precisa de nutriente. O Hyaluvita Silício traz silício orgânico Nutricolin (uma das formas mais biodisponíveis), biotina em dose alta, vitamina D, ferro, zinco e vitaminas do complexo B (B6, B9 e B12). É 1 cápsula por dia pra dar ao corpo o que ele usa pra fazer fio forte, unha firme e pele com mais densidade.',
    benefits: [
      'Silício orgânico Nutricolin — contribui para a firmeza e a densidade da pele',
      'Biotina em dose alta: auxilia na manutenção de cabelos e unhas normais',
      'Ferro e zinco, que contribuem para cabelos e unhas normais',
      '1 cápsula ao dia, uso adulto — 90 cápsulas por pote',
    ],
    howToUse:
      '1 cápsula ao dia, de preferência em jejum (o silício costuma absorver melhor assim). Consulte médico ou nutricionista para orientação individual.',
    forWho:
      'Quem reclama de queda de cabelo, unha fraca que quebra e descasca, e quer pele mais firme — cuidando de dentro pra fora.',
    salesLine: 'Cabelo e unha se constroem de dentro. Quer que eu te conte a rotina de 1 cápsula por dia? 💜',
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
      { t: '20-28s', label: 'CTA', line: 'Quer fio forte e unha firme? Me chama 💜' },
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
      'Quem convive com manchas e melasma, já usa protetor solar e quer somar um cuidado antioxidante de dentro pra fora.',
    salesLine: 'Mancha pede constância — por dentro e por fora. Quer que eu te explique como ele entra na sua rotina? ☀️',
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
      { t: '20-28s', label: 'CTA', line: 'Some ao seu protetor e à sua dermato. Me chama ☀️' },
    ],
  },
  {
    id: 're-hidraben',
    brand: 'meraki',
    name: 'Re-Hidraben',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/10/Re-Hiudraben-Sabor-AguadeCoco.jpg',
    category: 'capsulas',
    tagline: 'Repositor de água e eletrólitos (sódio, potássio, zinco) em sachê — água de coco, laranja, uva ou natural.',
    hook: 'Bebeu água mas continua com dor de cabeça, moleza e boca seca? Água pura não repõe sal.',
    whatItIs:
      'Sabe quando você bebe água e mesmo assim fica mole, com dor de cabeça e aquela sensação de "não hidrata"? É que junto com o líquido o corpo perde SAIS — sódio, potássio, zinco — e água pura não repõe isso. O Re-Hidraben devolve água E eletrólitos na medida certa, em 4 sabores que descem fácil. É a hidratação que realmente chega na célula.',
    benefits: [
      'Repõe água e eletrólitos (sódio, potássio e zinco) perdidos no calor, no treino e no mal-estar',
      'Ajuda o corpo a recuperar a disposição mais rápido do que água pura',
      'Com zinco, que contribui para o funcionamento normal do sistema imune',
      '4 sabores (água de coco, laranja, uva e natural) — a família toda toma sem reclamar',
    ],
    howToUse:
      'Dissolva 1 sachê em água conforme o rótulo. Ótimo depois do treino, em dia de calor forte ou quando bate mal-estar com o corpo desidratado.',
    forWho:
      'Quem treina e sua muito, quem passa o dia no calor e a família em dias de mal-estar com muita perda de líquido.',
    salesLine: 'Água sozinha não dá conta — hidratação de verdade tem sal na medida certa. Te falo qual sabor é o queridinho? 💧',
    objections: [
      { trigger: '"Água pura não resolve?"', answer: 'Resolve a sede, não a hidratação completa. Quando você sua ou passa mal, perde sódio e potássio junto — e é isso que dá a moleza e a dor de cabeça. O Re-Hidraben repõe os dois.' },
      { trigger: '"É tipo isotônico de mercado?"', answer: 'A ideia é parecida, mas a fórmula é focada em repor eletrólitos com menos açúcar e ainda leva zinco. E você escolhe o sabor que todo mundo toma numa boa.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento. Em caso de diarreia persistente ou desidratação intensa, procure um médico.',
    durationSec: 24,
    gradient: ['#12b5a5', '#0b7285'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Bebe água e continua com dor de cabeça e moleza?' },
      { t: '3-9s', label: 'O PORQUÊ', line: 'Água pura não repõe o sal que o corpo perde — sódio, potássio, zinco.' },
      { t: '9-17s', label: 'O PRODUTO', line: 'O Re-Hidraben devolve água E eletrólitos, em 4 sabores que descem fácil.' },
      { t: '17-24s', label: 'CTA', line: 'Quer testar qual sabor é a sua cara? Me chama 💧' },
    ],
  },
  {
    id: 'moviben',
    brand: 'meraki',
    name: 'Moviben',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/10/Moviben.jpg',
    category: 'capsulas',
    tagline: 'Suporte completo pras articulações: colágeno tipo 2, glucosamina, condroitina, curcumina, MSM, cálcio, magnésio e vitamina D3.',
    hook: 'Joelho estalando, dificuldade de levantar da cadeira, medo de "travar" com a idade?',
    whatItIs:
      'Articulação boa é liberdade: subir escada, brincar com o neto, treinar sem medo. O Moviben junta num comprimido só o time completo que a articulação pede — colágeno tipo 2, glucosamina, condroitina, curcumina, MSM, cálcio, magnésio e vitamina D3 — pra apoiar a mobilidade de quem não quer parar.',
    benefits: [
      'Reúne colágeno tipo 2, glucosamina e condroitina — nutrientes ligados à saúde articular',
      'Com curcumina e MSM, que complementam o cuidado com músculos e articulações',
      'Cálcio, magnésio e vitamina D3, que contribuem para a manutenção de ossos normais',
      'Um comprimido concentrado — praticidade pra manter todo dia',
    ],
    howToUse: 'Conforme o rótulo, todo dia, junto a uma refeição. Resultado de articulação é constância: pensa em meses, não em dias.',
    forWho:
      'Pessoas 40+ que sentem as articulações pesando, quem treina forte e quer proteger joelho e ombro, e quem quer se mexer sem medo de travar.',
    salesLine: 'Articulação boa é liberdade pra viver sem pedir licença pro corpo. Bora cuidar disso todo dia? Me chama 💪',
    objections: [
      { trigger: '"Já tomo colágeno."', answer: 'Colágeno sozinho é um pedaço. O Moviben junta colágeno tipo 2 + glucosamina + condroitina + curcumina + minerais num comprimido — o pacote completo da articulação, não só uma parte.' },
      { trigger: '"Isso é coisa de idoso?"', answer: 'É coisa de quem quer se mexer bem — atleta usa pra proteger o joelho, quem vive na correria usa pra não travar. Cuidar antes é melhor que remediar depois.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento e não trata doenças articulares. Dor persistente: procure seu médico.',
    durationSec: 30,
    gradient: ['#f59e0b', '#b45309'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Joelho estalando e aquele medo de travar com a idade?' },
      { t: '3-10s', label: 'O PRODUTO', line: 'Moviben: colágeno tipo 2, glucosamina, condroitina e minerais num comprimido.' },
      { t: '10-18s', label: 'BENEFÍCIO', line: 'O time completo pra apoiar a mobilidade e a qualidade de vida.' },
      { t: '18-24s', label: 'É SIMPLES', line: 'Um por dia, todo dia. Articulação gosta é de constância.' },
      { t: '24-30s', label: 'CTA', line: 'Bora deixar o corpo livre pra se mexer? Me chama 💪' },
    ],
  },
  {
    id: 'probiativ',
    brand: 'meraki',
    name: 'ProbiAtiv',
    category: 'capsulas',
    imageUrl: 'https://farmaciaindiana.vtexassets.com/arquivos/ids/342113-600-600?v=638737771515070000',
    tagline: 'Probiótico em comprimido pra equilibrar a flora intestinal e apoiar a digestão e a imunidade.',
    hook: 'Intestino preso, inchaço depois de comer, aquela sensação de "nada digere"?',
    whatItIs:
      'Seu intestino é o seu segundo cérebro — quando ele desregula, vem inchaço, preguiça digestiva e até a imunidade cai. O ProbiAtiv repõe as bactérias do bem que equilibram a flora intestinal, pra digestão funcionar redonda e o corpo absorver melhor o que você come.',
    benefits: [
      'Ajuda a equilibrar a flora intestinal (as bactérias do bem)',
      'Apoia uma digestão mais leve e regular',
      'Intestino equilibrado contribui para a absorção de nutrientes e para a imunidade',
      'Comprimido prático — 1 na rotina e pronto',
    ],
    howToUse: 'Conforme o rótulo, de preferência no mesmo horário todo dia. Combine com mais água e fibras.',
    forWho: 'Quem vive com intestino preso ou solto, quem sente inchaço após as refeições e quem usou antibiótico e quer reequilibrar a flora.',
    salesLine: 'Intestino em dia muda o seu dia inteiro — menos inchaço, mais leveza. Te explico como começar? 💚',
    objections: [
      { trigger: '"Iogurte não faz o mesmo?"', answer: 'Iogurte ajuda, mas a quantidade de bactérias vivas é imprevisível e vem com açúcar. O probiótico entrega as cepas certas na dose certa, todo dia igual.' },
      { trigger: '"Preciso tomar pra sempre?"', answer: 'Depende do seu intestino. Muita gente usa por um período pra reequilibrar (ex.: depois de antibiótico) e mantém conforme sente a diferença.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento. Sintomas persistentes: procure orientação profissional.',
    durationSec: 26,
    gradient: ['#22c55e', '#15803d'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Inchaço depois de comer e intestino que não colabora?' },
      { t: '3-12s', label: 'O PRODUTO', line: 'ProbiAtiv repõe as bactérias do bem que equilibram a flora intestinal.' },
      { t: '12-20s', label: 'BENEFÍCIO', line: 'Digestão mais leve, corpo absorvendo melhor e imunidade em dia.' },
      { t: '20-26s', label: 'CTA', line: 'Quer o intestino trabalhando a seu favor? Me chama 💚' },
    ],
  },
  {
    id: 'ative-fer',
    brand: 'meraki',
    name: 'Ative-Fer',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/10/AtivFer.jpg',
    category: 'capsulas',
    tagline: 'Ferro bisglicinato em cápsula — a forma de ferro mais suave pro estômago — contra o cansaço da falta de ferro.',
    hook: 'Cansaço que não passa nem dormindo, palidez, cabelo caindo e falta de ar em coisa simples?',
    whatItIs:
      'Aquele cansaço que dorme e acorda igual, a palidez, o cabelo caindo, a falta de ar subindo uma escada — muitas vezes é ferro baixo, super comum na mulher. O Ative-Fer usa ferro bisglicinato, a forma mais suave pro estômago (sem a azia e a prisão de ventre do ferro comum), pra repor o ferro e trazer a energia de volta.',
    benefits: [
      'Ferro na forma bisglicinato — melhor absorção e mais suave pro estômago',
      'O ferro contribui para reduzir o cansaço e a fadiga',
      'Apoia o transporte normal de oxigênio no corpo — mais disposição',
      'Sem o desconforto (azia e prisão de ventre) típico do ferro tradicional',
    ],
    howToUse: 'Conforme o rótulo. Ferro absorve melhor junto de vitamina C e longe de café e leite.',
    forWho: 'Mulheres com menstruação intensa, gestantes (com acompanhamento), vegetarianos e quem vive cansado mesmo dormindo bem.',
    salesLine: 'Se o cansaço não passa nem dormindo, o problema pode ser ferro — e isso tem solução. Me chama que eu te explico ✨',
    objections: [
      { trigger: '"Ferro me dá enjoo e prende o intestino."', answer: 'Esse é o problema do ferro comum. O Ative-Fer é ferro bisglicinato, justamente a forma mais suave — feita pra quem não tolera o ferro tradicional.' },
      { trigger: '"Como sei se preciso?"', answer: 'Cansaço que não passa, palidez, unha fraca e falta de ar são sinais. O ideal é um exame de sangue — mas repor ferro de forma suave já é um cuidado que faz diferença pra muita mulher.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento. Anemia deve ser diagnosticada e acompanhada por um médico.',
    durationSec: 28,
    gradient: ['#ef4444', '#991b1b'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Cansaço que não passa nem dormindo bem?' },
      { t: '3-10s', label: 'A CAUSA', line: 'Muitas vezes é ferro baixo — super comum na mulher.' },
      { t: '10-20s', label: 'O PRODUTO', line: 'Ative-Fer é ferro bisglicinato: repõe o ferro sem azia nem prender o intestino.' },
      { t: '20-28s', label: 'CTA', line: 'Bora trazer a energia de volta? Me chama ✨' },
    ],
  },
  {
    id: 'flenoben',
    brand: 'meraki',
    name: 'Flenoben',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/12/Flenoben.jpg',
    category: 'capsulas',
    tagline: 'Suporte pra circulação das pernas, com riboflavina — pra aquela sensação de pernas pesadas e inchadas no fim do dia.',
    hook: 'Fim do dia com as pernas pesadas, inchadas, marca da meia e vontade de erguer o pé?',
    whatItIs:
      'Sabe aquele fim de dia com a perna pesada, inchada e a marquinha da meia? É a circulação pedindo ajuda. O Flenoben apoia a microcirculação das pernas pra aliviar essa sensação de peso e inchaço — pra você chegar em casa com a perna leve, não implorando pra sentar.',
    benefits: [
      'Apoia a circulação e a sensação de leveza nas pernas',
      'Ajuda a amenizar a sensação de peso e inchaço no fim do dia',
      'Com riboflavina (vitamina B2), que contribui para o metabolismo normal de energia',
      'Cápsula prática pra quem fica muito tempo em pé ou sentado',
    ],
    howToUse: 'Conforme o rótulo, todo dia. Combine com pausas pra mexer as pernas e boa hidratação.',
    forWho: 'Quem passa o dia em pé (balcão, salão, cozinha) ou muito tempo sentado, e sente as pernas pesarem e incharem no fim do dia.',
    salesLine: 'Chega em casa com a perna implorando pra sentar? Bora deixar ela mais leve. Te explico como usar 🦵',
    objections: [
      { trigger: '"Isso é pra varizes?"', answer: 'O Flenoben é um suplemento que apoia a circulação e a leveza das pernas no dia a dia. Quadro de varizes é avaliação médica — o cuidado diário caminha junto, não substitui o médico.' },
      { trigger: '"Só levantar a perna não resolve?"', answer: 'Ajuda na hora, mas volta. O cuidado por dentro apoia a circulação todo dia — junto com pausinhas pra mexer as pernas, o combo funciona bem melhor.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento e não trata doenças venosas. Dor, varizes ou inchaço persistente: procure um médico.',
    durationSec: 26,
    gradient: ['#6366f1', '#3730a3'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Fim do dia com as pernas pesadas e inchadas?' },
      { t: '3-12s', label: 'O PRODUTO', line: 'Flenoben apoia a microcirculação pra aliviar o peso e o inchaço das pernas.' },
      { t: '12-20s', label: 'PRA QUEM', line: 'Perfeito pra quem passa o dia em pé ou sentado demais.' },
      { t: '20-26s', label: 'CTA', line: 'Quer chegar em casa com a perna leve? Me chama 🦵' },
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
    tagline: 'Linha de alívio pra garganta e vias respiratórias: pastilhas com mel, vitamina C, zinco e romã; e xarope com guaco.',
    hook: 'Garganta arranhando, aquele pigarro chato e a tosse que não larga do seu pé?',
    whatItIs:
      'Aquele começo de garganta arranhando e o pigarro que não larga? A linha Resfben dá o alívio: pastilhas com mel, vitamina C, zinco e concentrado de romã pra confortar a garganta, e o xarope com guaco pra ajudar a soltar o catarro. Cuidado pras vias respiratórias no capricho.',
    benefits: [
      'Pastilhas com mel, vitamina C, zinco e romã — alívio e conforto pra garganta',
      'Xarope com guaco, tradicional aliado das vias respiratórias',
      'Zinco e vitamina C contribuem para o funcionamento normal do sistema imune',
      'Formatos práticos pra ter na bolsa e em casa na estação da tosse',
    ],
    howToUse: 'Pastilhas: dissolva na boca conforme o rótulo. Xarope: siga a indicação da embalagem. Leia sempre o rótulo/bula.',
    forWho: 'Quem sente a garganta no limite em dia de ar seco ou ar-condicionado, e a família na época de resfriado e tosse.',
    salesLine: 'Começou a garganta arranhando? Melhor agir cedo. Te falo qual da linha combina com o seu caso 🍯',
    objections: [
      { trigger: '"Pastilha resolve mesmo?"', answer: 'A pastilha traz alívio e conforto pra garganta com mel, zinco e vitamina C — ótima pro dia a dia. Se a tosse é com catarro, o xarope com guaco entra pra ajudar a soltar.' },
      { trigger: '"Posso dar pros meus filhos?"', answer: 'Tem versão infantil (xarope sabor morango). Confira sempre a indicação de idade no rótulo — e criança pequena e gestante, melhor confirmar com o profissional.' },
    ],
    compliance: 'Siga sempre as orientações do rótulo/bula. Em caso de sintomas persistentes ou febre, procure um médico. Respeite as indicações de idade.',
    durationSec: 26,
    gradient: ['#f97316', '#9a3412'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Garganta arranhando e o pigarro que não larga?' },
      { t: '3-12s', label: 'O PRODUTO', line: 'Linha Resfben: pastilha com mel, vitamina C e zinco, e xarope com guaco.' },
      { t: '12-20s', label: 'BENEFÍCIO', line: 'Alívio e conforto pra garganta e uma mãozinha nas vias respiratórias.' },
      { t: '20-26s', label: 'CTA', line: 'Melhor agir cedo. Te falo qual encaixa no seu caso 🍯' },
    ],
  },
  {
    id: 'acetilcisteina',
    brand: 'meraki',
    name: 'Acetilcisteína Meraki',
    imageUrl: 'https://merakifarma.com.br/wp-content/uploads/2024/10/ACETILCISTEINA-soluvel.jpg',
    category: 'respiratorio',
    tagline: 'Mucolítico (xarope, solúvel ou efervescente 600mg) que ajuda a fluidificar o catarro e facilitar a respiração.',
    hook: 'Tosse carregada, aquele catarro preso que não sobe nem desce?',
    whatItIs:
      'Aquela tosse "cheia", com o catarro preso que não sobe nem desce, irrita qualquer um. A Acetilcisteína é um mucolítico: ajuda a deixar a secreção mais fininha e mais fácil de eliminar — pra respiração dar aquela aliviada. Tem em xarope, solúvel e efervescente, do jeito que fica melhor pra você. É medicamento: use conforme a bula.',
    benefits: [
      'Ajuda a fluidificar o catarro, facilitando a eliminação',
      'Diferentes formatos: xarope (20 e 40mg/ml), solúvel e efervescente 600mg',
      'Sabores que facilitam o uso (morango, laranja)',
      'Aliado nas fases de tosse com secreção (tosse produtiva)',
    ],
    howToUse: 'Uso conforme a bula e a orientação do farmacêutico ou médico. Respeite a dose e a idade indicadas.',
    forWho: 'Quem está com tosse produtiva (com catarro) e quer ajudar o corpo a eliminar a secreção — sempre lendo a bula.',
    salesLine: 'Catarro preso deixando a tosse pior? Te explico qual formato encaixa melhor no seu caso 💬',
    objections: [
      { trigger: '"É remédio? Posso tomar por conta?"', answer: 'É um medicamento isento de prescrição, mas é medicamento. Leia a bula, respeite a dose e a idade — em dúvida, fale com o farmacêutico. Sintoma que não melhora ou febre: procure o médico.' },
      { trigger: '"Serve pra qualquer tosse?"', answer: 'É indicado pra tosse COM catarro (produtiva), pra ajudar a soltar a secreção. Tosse seca é outra história — por isso vale confirmar o tipo antes.' },
    ],
    compliance: 'Medicamento. Ao persistirem os sintomas, um médico deverá ser consultado. Leia a bula. Não exceda a dose recomendada. Respeite a indicação de idade.',
    durationSec: 24,
    gradient: ['#0ea5e9', '#075985'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Tosse carregada e catarro preso que não sobe nem desce?' },
      { t: '3-12s', label: 'O PRODUTO', line: 'A Acetilcisteína é mucolítico: ajuda a afinar o catarro pra eliminar mais fácil.' },
      { t: '12-19s', label: 'FORMATOS', line: 'Tem xarope, solúvel e efervescente — do jeito que fica melhor pra você.' },
      { t: '19-24s', label: 'CTA', line: 'Leia a bula e me chama que eu te oriento o formato 💬' },
    ],
  },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

// Se o produto tem um reel do Instagram, o link do VÍDEO vai junto na mensagem —
// a cliente assiste sem sair do WhatsApp. (Só entra quando existe vídeo de verdade.)
export function withVideoLink(text: string, p: Product): string {
  return p.instagramUrl ? `${text}\n\n🎥 Vê o vídeo: ${p.instagramUrl}` : text;
}

export function buildShareMessage(p: Product): string {
  const benefits = p.benefits.slice(0, 3).map((b) => `✅ ${b}`).join('\n');
  return withVideoLink([
    `✨ *${p.name}* ✨`,
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
    `✨ *${p.name}* ✨`,
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
      'Me chama aqui que eu te explico 💬',
    ].join('\n'));
  }

  // 3) Curto e pessoal — um benefício forte
  variants.push([
    'Oi! Lembrei de você 💬',
    '',
    `*${p.name}* — ${b(0).toLowerCase()}.`,
    '',
    p.salesLine,
  ].join('\n'));

  // 4) Pra quem é
  if (p.forWho) {
    variants.push([
      'Isso aqui é pra você 👇',
      '',
      `*${p.name}*: ${p.tagline}`,
      `✅ ${b(1)}`,
      '',
      'Quer que eu te conte como usa? 💬',
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
      `*${p.name}* — me chama que te ajudo a escolher 💬`,
    ].join('\n'));
  }

  // 6) Só benefícios, direto ao ponto
  if (bens.length >= 2) {
    variants.push([
      `*${p.name}* na real 👀`,
      '',
      `✅ ${b(0)}`,
      `✅ ${b(1)}`,
      bens[2] ? `✅ ${bens[2]}` : '',
      '',
      'Quer o seu? Me chama 💛',
    ].filter(Boolean).join('\n'));
  }

  // O link do vídeo (reel) vai em toda versão — a cliente recebe a mensagem E o vídeo.
  return variants.map((v) => withVideoLink(v, p));
}
