// Pílulas de Produto — base de conteúdo
// Cada produto vira uma "pílula": conteúdo curto, focado em BENEFÍCIO,
// de uso duplo (treina a vendedora + ela compartilha com a cliente).
//
import { Dumbbell, Pill, Sparkles, Flower2, type LucideIcon } from 'lucide-react';
import type { BrandId } from './brands';
//
// Regra de ouro (compliance ANVISA p/ suplementos): benefício sempre no
// enquadramento "auxilia / contribui / ajuda a", NUNCA "cura / trata / emagrece".

export type Category = 'performance' | 'capsulas' | 'cosmeticos' | 'perfumaria';

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
}

export const CATEGORIES: Record<Category, { label: string; Icon: LucideIcon }> = {
  performance: { label: 'Performance & Massa Magra', Icon: Dumbbell },
  capsulas: { label: 'Cápsulas & Vitaminas', Icon: Pill },
  cosmeticos: { label: 'Cosméticos & Skincare', Icon: Sparkles },
  perfumaria: { label: 'Perfumaria', Icon: Flower2 },
};

export const PRODUCTS: Product[] = [
  // ───────────────────────── CARRO-CHEFE MERAKI ─────────────────────────
  {
    id: 'glpen-nutri-muscle',
    brand: 'meraki',
    name: 'GLPEN Nutri Muscle',
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

  // ───────────────────────── PRODUTO-PILOTO (completo) ─────────────────────────
  {
    id: 'cabelos-e-unhas',
    brand: 'wepink',
    name: 'Cabelos & Unhas',
    category: 'capsulas',
    tagline: 'Suplemento em cápsula com 18 vitaminas e minerais + L-Cisteína, ácido hialurônico e silício orgânico.',
    hook: 'Cabelo caindo, sem brilho, unha que descasca e não cresce?',
    whatItIs:
      'Deixa eu te falar por que seu cabelo cai mais do que devia: falta nutriente. Essa cápsula pequena junta 18 vitaminas e minerais + L-Cisteína, ácido hialurônico e silício orgânico — o combustível que o fio precisa pra parar de cair e a unha voltar a crescer. É cuidar do cabelo por dentro, não só passar creme por fora.',
    benefits: [
      'Auxilia na manutenção de cabelos e unhas saudáveis',
      'Contribui para a formação normal de colágeno (Vitamina C)',
      'Ajuda a reduzir o cansaço e a fadiga (Ferro e Vitaminas do complexo B)',
      'Cápsula pequena, 1x ao dia — fácil de manter na rotina',
    ],
    howToUse: '1 cápsula por dia, com água, de preferência junto a uma refeição. Resultado vem com constância: o ciclo do cabelo pede uns 90 dias.',
    forWho:
      'Mulheres que sentem o cabelo enfraquecido (pós-parto, troca de estação, química no cabelo) e quem vive quebrando ou descascando a unha.',
    salesLine: 'Cansada de olhar o cabelo no ralo? Em uns 90 dias essa história muda — e o primeiro pote já é o começo. Me chama que eu te explico como tomar certinho 💛',
    objections: [
      {
        trigger: '"É caro."',
        answer:
          'Pensa por dose: dá menos que um cafezinho por dia. E é 1 pote = 1 mês cuidando de cabelo E unha ao mesmo tempo — sai mais em conta que comprar tratamento separado pra cada um.',
      },
      {
        trigger: '"Será que funciona mesmo?"',
        answer:
          'O suplemento entrega os nutrientes que o corpo precisa pra manter cabelo e unha fortes. Não é mágica de 3 dias: o cabelo tem ciclo de uns 90 dias. Quem usa certinho por 3 potes sente a diferença na queda e no crescimento da unha.',
      },
      {
        trigger: '"Posso tomar com outros remédios / anticoncepcional?"',
        answer:
          'É um suplemento alimentar, não um medicamento. Mas se você usa medicação contínua ou está grávida/amamentando, o ideal é confirmar com seu médico — eu te passo a tabela nutricional pra mostrar pra ele.',
      },
    ],
    compliance:
      'Suplemento alimentar. Não contém glúten. Não é medicamento e não substitui uma alimentação equilibrada. Gestantes, lactantes e pessoas em uso de medicamentos: consultar profissional de saúde.',
    durationSec: 30,
    gradient: ['#e6007e', '#7a1750'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Cabelo caindo no ralo e unha que não cresce de jeito nenhum?' },
      { t: '3-8s', label: 'O PRODUTO', line: 'Conhece a cápsula Cabelos & Unhas: 18 vitaminas num pote só.' },
      { t: '8-14s', label: 'BENEFÍCIO 1', line: 'Auxilia na manutenção de cabelos e unhas fortes e saudáveis.' },
      { t: '14-20s', label: 'BENEFÍCIO 2', line: 'Com Vitamina C, Ferro e complexo B pra dar aquele up no visual.' },
      { t: '20-27s', label: 'COMO USAR', line: 'É 1 cápsula por dia. Pequenininha, fácil de engolir, e pronto.' },
      { t: '27-30s', label: 'CTA', line: 'Quer começar o seu? Me chama que eu te explico tudo 💬' },
    ],
  },

  // ───────────────────────── Cápsulas & Vitaminas ─────────────────────────
  {
    id: 'omega-3',
    brand: 'meraki',
    name: 'Ômega 3 Odor Free',
    category: 'capsulas',
    tagline: 'Óleo de peixe com EPA e DHA, tecnologia Odor Free (sem aquele "gosto de peixe") e toque de morango.',
    hook: 'Toma ômega 3 mas odeia o gosto que repete o dia todo?',
    whatItIs: 'Sabe o ômega que todo mundo compra e larga na gaveta porque repete o dia todo? Esse não. É óleo de peixe rico em EPA e DHA, com tecnologia Odor Free e um toque de morango — o ômega que você toma sem enjoar. E ômega que você toma é ômega que funciona.',
    benefits: [
      'Fonte de EPA e DHA, que contribuem para o funcionamento normal do coração',
      'Auxilia na manutenção de níveis saudáveis de triglicerídeos',
      'Cápsula pequena e sem sabor/odor desagradável — fácil de manter todo dia',
    ],
    howToUse: 'Conforme indicação do rótulo, com água, junto a uma refeição.',
    forWho: 'Quem quer cuidar do coração e do cérebro, e quem já desistiu de ômega por causa do gosto.',
    salesLine: 'Chega de pote encostado na gaveta. Esse é o ômega que você realmente toma todo dia — te mando o link? 💬',
    objections: [
      { trigger: '"Já tomo um mais barato."', answer: 'O barato costuma repetir e aí ninguém toma — pote encalha na gaveta. Esse é Odor Free: você toma sem enjoar, então de fato faz efeito por usar todo dia.' },
      { trigger: '"Pra que serve mesmo?"', answer: 'EPA e DHA ajudam coração, cérebro e a manter os triglicerídeos saudáveis. É cuidado de dentro pra fora.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento. Não substitui uma alimentação equilibrada e hábitos de vida saudáveis.',
    durationSec: 25,
    gradient: ['#ff7eb3', '#b03a6e'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Ômega 3 que repete o dia todo? Esquece.' },
      { t: '3-10s', label: 'O PRODUTO', line: 'Esse aqui é Odor Free, com toque de morango. Sem gosto de peixe.' },
      { t: '10-20s', label: 'BENEFÍCIO', line: 'EPA e DHA pra cuidar do coração e do cérebro, fácil de tomar todo dia.' },
      { t: '20-25s', label: 'CTA', line: 'Quer experimentar? Me chama 💬' },
    ],
  },
  {
    id: 'melatonina',
    brand: 'meraki',
    name: 'Melatonina + Triptofano',
    category: 'capsulas',
    tagline: 'Combinação para o ritual do sono, com melatonina e triptofano.',
    hook: 'Deita e fica rolando na cama sem conseguir desligar a cabeça?',
    whatItIs: 'Você deita e a cabeça continua a mil? A melatonina + triptofano é tipo o "botão de desligar" natural do corpo — ajuda a desacelerar e pegar no sono, sem aquele indutor pesado. É o ritual da noite que você tava precisando.',
    benefits: [
      'A melatonina contribui para reduzir o tempo necessário para adormecer',
      'Apoia uma rotina de sono mais regular',
      'Prático: faz parte do seu ritual da noite',
    ],
    howToUse: 'Conforme o rótulo, pouco antes de dormir. Combine com menos tela e luz baixa.',
    forWho: 'Quem demora a pegar no sono e quer criar uma rotina noturna melhor.',
    salesLine: 'Cansada de encarar o teto às 2 da manhã? Bora montar seu ritual de sono — te explico como usar 🌙',
    objections: [
      { trigger: '"Vou ficar dependente?"', answer: 'Melatonina é um hormônio que o seu próprio corpo já produz — o suplemento só ajuda no ritual. Não é tarja preta nem indutor pesado.' },
      { trigger: '"Posso tomar todo dia?"', answer: 'Siga o rótulo. Se você usa alguma medicação ou tem condição de saúde, vale alinhar com seu médico antes.' },
    ],
    compliance: 'Suplemento alimentar. Não é medicamento. Gestantes, lactantes e pessoas em uso de medicação: consultar profissional de saúde.',
    durationSec: 22,
    gradient: ['#6d5dfc', '#2a2356'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Cabeça a mil na hora de dormir?' },
      { t: '3-12s', label: 'O PRODUTO', line: 'Melatonina + triptofano pra ajudar a desacelerar e pegar no sono.' },
      { t: '12-22s', label: 'CTA', line: 'Quer dormir melhor essa semana? Me chama 💬' },
    ],
  },

  // ───────────────────────── Cosméticos & Skincare ─────────────────────────
  {
    id: 'serum-facial',
    brand: 'wepink',
    name: 'Sérum Facial Glow',
    category: 'cosmeticos',
    tagline: 'Sérum hidratante com ativos que dão viço e sensação de pele renovada.',
    hook: 'Pele cansada, sem aquele viço de pele descansada?',
    whatItIs: 'Sabe aquela pele de quem "dormiu bem" mesmo quando você não dormiu? É isso que esse sérum entrega: hidratação e luminosidade numa textura leve, que absorve na hora e ainda faz a make assentar lisinha. Glow instantâneo, sem parecer oleosa.',
    benefits: [
      'Hidrata e dá sensação imediata de pele mais viçosa',
      'Textura leve, absorve rápido e não deixa a pele oleosa',
      'Ótima base antes da make — a pele fica lisinha',
    ],
    howToUse: 'Pela manhã e à noite, na pele limpa, antes do hidratante. Poucas gotas já espalham bem.',
    forWho: 'Quem quer um glow natural no dia a dia e uma make que assenta melhor.',
    salesLine: 'Quer ver sua pele com aquele viço logo depois de aplicar? Te mostro como usar antes da make ✨',
    objections: [
      { trigger: '"Tenho pele oleosa, vai brilhar."', answer: 'A textura é leve e absorve rápido — hidratação não é a mesma coisa que oleosidade. Pele bem hidratada até controla melhor o excesso de óleo.' },
      { trigger: '"Já tenho hidratante."', answer: 'O sérum entra ANTES do hidratante: ele leva o ativo mais fundo e o hidratante sela. Um potencializa o outro.' },
    ],
    durationSec: 20,
    gradient: ['#f7b733', '#d96d2b'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Pele apagada? Bora acender esse glow.' },
      { t: '3-12s', label: 'O PRODUTO', line: 'Sérum leve que hidrata e dá viço na hora, antes da make.' },
      { t: '12-20s', label: 'CTA', line: 'Quer testar? Me chama que eu te mostro 💬' },
    ],
  },

  // ───────────────────────── Perfumaria ─────────────────────────
  {
    id: 'body-splash',
    brand: 'wepink',
    name: 'Body Splash Pink',
    category: 'perfumaria',
    tagline: 'Body splash com fixação surpreendente e aquele rastro marcante.',
    hook: 'Body splash que some em 10 minutos? Cansei disso também.',
    whatItIs: 'Cansada de body splash que evapora antes de você sair de casa? Esse aqui fixa muito acima da média e deixa um rastro que dura o dia — daquele que faz a pessoa virar e perguntar "amiga, que cheiro é esse?". Vira a sua assinatura.',
    benefits: [
      'Fixação acima do esperado pra um body splash',
      'Cheiro marcante que vira a sua assinatura',
      'Borrifa e pronto — perfeito pra retocar ao longo do dia',
    ],
    howToUse: 'Borrife no corpo após o banho e nos pontos de pulso. Carregue na bolsa pra retocar.',
    forWho: 'Quem ama estar sempre cheirosa e quer um perfume que as pessoas elogiam.',
    salesLine: 'Quer um cheiro que as pessoas param pra elogiar? Te conto qual combina com você 💐',
    objections: [
      { trigger: '"Body splash não fixa."', answer: 'Esse é o pulo do gato: ele tem fixação bem acima da média. Aplica na pele hidratada que o rastro dura ainda mais.' },
      { trigger: '"Tenho vários perfumes."', answer: 'Esse é pra ser o do dia a dia — leve, gostoso, que você usa sem dó. O caro a gente guarda; esse a gente vive.' },
    ],
    durationSec: 18,
    gradient: ['#ff5fa2', '#9b2c63'],
    storyboard: [
      { t: '0-3s', label: 'GANCHO', line: 'Cansada de body splash que evapora?' },
      { t: '3-12s', label: 'O PRODUTO', line: 'Esse fixa de verdade e deixa rastro o dia inteiro.' },
      { t: '12-18s', label: 'CTA', line: 'Quer saber qual cheiro é a sua cara? Me chama 💬' },
    ],
  },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function buildShareMessage(p: Product): string {
  const benefits = p.benefits.slice(0, 3).map((b) => `✅ ${b}`).join('\n');
  return [
    `✨ *${p.name}* ✨`,
    '',
    p.hook,
    '',
    benefits,
    '',
    p.salesLine,
  ].join('\n');
}
