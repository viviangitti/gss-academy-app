// OS VALORES DA RAMASA DENTRO DO APP.
//
// O material de cultura do Grupo Ramasa (RA-zão · MA-gia · SA-tisfação, três
// pilares com nove valores) chegou em setembro de 2026. A decisão foi não
// pendurar o quadro numa tela: cada coisa que o app JÁ registra — assistir a
// pílula, responder com dado, registrar a objeção, conferir a campanha — passa
// a carimbar o valor que ela expressa. Cultura deixa de ser cartaz e vira o que
// foi feito.
//
// SÓ RAMASA, de propósito: estes são os valores DELES. Marca que não tem
// programa de cultura não ganha tela de cultura de outro cliente.
import type { BrandId } from './brands';
import type { CargoAuto } from './cargos';
import type { ElevaEventType } from './statsSync';

/**
 * O MESMO VALOR, O TRABALHO DE CADA UM.
 *
 * "Apaixonados por clientes" para quem está no salão é responder o lead em
 * cinco minutos; para a gerência é cobrar esse tempo; para acessórios é
 * oferecer como cuidado, não como item a mais na nota. Uma linha só, escrita
 * para o vendedor, é a maneira mais rápida de a cultura virar recado que não
 * é para mim — foi o que a Vivian apontou em 25/09/2026.
 */
export type GrupoCargo = 'ponta' | 'vendas' | 'acessorios' | 'leads' | 'qualidade';

export function grupoDoCargo(cargo?: CargoAuto, role?: string): GrupoCargo {
  switch (cargo) {
    case 'gerente-veiculos':
    case 'supervisor-vendas':
      return 'vendas';
    case 'gerente-acessorios':
    case 'lider-acessorios':
      return 'acessorios';
    case 'gerente-leads':
      return 'leads';
    case 'lider-qualidade':
    case 'diretor-qualidade':
      return 'qualidade';
    case 'vendedor-veiculos':
    case 'vendedor-acessorios':
    case 'executivo-leads':
    case 'fi':
      return 'ponta';
    default:
      // Gestor sem cargo declarado (a GSS, por exemplo) enxerga pela gerência
      // de vendas: é o recorte que fala do time inteiro.
      return role === 'gestor' ? 'vendas' : 'ponta';
  }
}

export type PilarId = 'razao' | 'magia' | 'satisfacao';

export interface Pilar {
  id: PilarId;
  nome: string;
  /** A sílaba do nome da empresa: RA · MA · SA. */
  sigla: string;
  lema: string;
  cor: string;
}

export interface Valor {
  id: string;
  pilar: PilarId;
  nome: string;
  /** O texto oficial do Grupo, como está no material. Não reescrever. */
  texto: string;
  /**
   * O que este valor significa DENTRO DO APP — por cargo. É a ponte entre a
   * frase da parede e o que a pessoa faz hoje; sem ela, valor é decoração.
   * `ponta` é obrigatório e serve de reserva para quem não tem linha própria.
   */
  noApp: { ponta: string } & Partial<Record<GrupoCargo, string>>;
  /** As ações que carimbam este valor quando acontecem. */
  eventos: ElevaEventType[];
}

export const PILARES: Pilar[] = [
  { id: 'razao', nome: 'Razão', sigla: 'RA', lema: 'Trabalhar de forma eficiente oferecendo soluções eficazes.', cor: '#1e6fd9' },
  { id: 'magia', nome: 'Magia', sigla: 'MA', lema: 'Encantar e surpreender a cada oportunidade.', cor: '#7a4fd4' },
  { id: 'satisfacao', nome: 'Satisfação', sigla: 'SA', lema: 'Garantir plena satisfação para criar defensores da marca.', cor: '#0f8a5f' },
];

export const VALORES: Valor[] = [
  {
    id: 'foco-resultados', pilar: 'razao', nome: 'Foco em resultados',
    texto: 'Cada um de nós contribui para o crescimento e a rentabilidade do negócio.',
    noApp: {
      ponta: 'Ofereça o acessório na hora certa e confira a campanha que está fechando — é ali que a loja ganha margem.',
      vendas: 'Abra o Painel e veja quem está sem uso: campanha só vira resultado se o time souber que ela existe.',
      acessorios: 'Confira se a lista de acessórios está com o preço certo. Preço errado no app é margem perdida no balcão.',
      leads: 'Olhe quantos leads viraram visita nesta semana. Lead sem próximo passo é investimento que virou custo.',
      qualidade: 'Revise o que está publicado: tabela vencida no ar é desconto dado sem ninguém decidir.',
    },
    eventos: ['acessorio'],
  },
  {
    id: 'senso-dono', pilar: 'razao', nome: 'Senso de dono',
    texto: 'Agimos com responsabilidade, cuidando da empresa como se fosse nossa.',
    noApp: {
      ponta: 'Registrou uma objeção nova no atendimento? Mande pelo app. Ela volta respondida para o time inteiro.',
      vendas: 'Responda as objeções que o time registrou. O que você responde volta publicado para todas as lojas.',
      acessorios: 'Tire do ar o acessório que saiu de linha antes que alguém ofereça o que não existe.',
      leads: 'Leve para a gerência a objeção que mais aparece no funil — ela vale para o salão também.',
      qualidade: 'Cuide do app como quem cuida da loja: as cinco frentes revisadas no primeiro dia útil.',
    },
    // Carimbado na mão quando a pessoa ENVIA uma objeção nova (não quando
    // consulta uma que já existe — consultar é "altos padrões").
    eventos: [],
  },
  {
    id: 'mais-com-menos', pilar: 'razao', nome: 'Mais com menos',
    texto: 'Trabalhamos de forma inteligente, otimizando recursos sem abrir mão da qualidade e resultado.',
    noApp: {
      ponta: 'Use o material que já está pronto no app em vez de refazer: o resumo do carro, a folha oficial e a ficha.',
      vendas: 'Antes de pedir material novo, veja o que já está publicado. Quase sempre já existe — e já está certo.',
      acessorios: 'Uma lista certa no app evita vinte perguntas no grupo. É esse o trabalho inteligente.',
      leads: 'Use os scripts da Jornada em vez de escrever do zero a cada lead.',
      qualidade: 'Tire do ar o que está duplicado: duas versões do mesmo documento custam confiança.',
    },
    eventos: ['doc_open'],
  },
  {
    id: 'apaixonados', pilar: 'magia', nome: 'Apaixonados por clientes',
    texto: 'Nossa paixão por pessoas nos move a entregar mais do que produtos: entregamos experiências.',
    noApp: {
      ponta: 'Responda o lead online pela Jornada, na etapa certa — e mande o material antes de ele pedir.',
      vendas: 'Cobre o tempo de resposta do time: lead online responde em minutos ou não responde mais.',
      acessorios: 'Ofereça o acessório como cuidado com o carro dele, não como item a mais na nota.',
      leads: 'Nenhum lead sem resposta hoje. Devolva ao executivo o que ficou parado.',
      qualidade: 'Transforme o que o cliente reclamou em resposta publicada — é assim que o time inteiro melhora.',
    },
    eventos: ['jornada_script', 'jornada_onepage'],
  },
  {
    id: 'melhoria-continua', pilar: 'magia', nome: 'Melhoria contínua',
    texto: 'Estamos sempre em busca de aprender, evoluir e aperfeiçoar o que fazemos.',
    noApp: {
      ponta: 'Assista à pílula do carro antes do atendimento — inclusive a do carro que você acha que já sabe.',
      vendas: 'Veja no Painel quem estudou e quem parou. Quem parou não avisa.',
      acessorios: 'Estude o acessório como se estuda o carro: quem explica o benefício vende sem dar desconto.',
      leads: 'Estude o carro que mais chega pelo funil antes de responder o próximo lead dele.',
      qualidade: 'Confira se o conteúdo publicado continua verdadeiro. Conteúdo velho ensina errado.',
    },
    eventos: ['pill_view', 'video_play'],
  },
  {
    id: 'clientes-merecem', pilar: 'magia', nome: 'Nossos clientes merecem os melhores',
    texto: 'Atender bem é consequência do prazer que temos em fazer o nosso melhor todos os dias.',
    noApp: {
      ponta: 'Mande a folha do cliente pelo app: sai com foto, ficha e o seu contato — igual, venha da loja que vier.',
      vendas: 'Confira o que o time está mandando. Material igual em todas as lojas é promessa igual em todas elas.',
      acessorios: 'Mande a foto e o que o acessório resolve, não só o preço.',
      leads: 'Mande o resumo do carro já no primeiro contato: o cliente decide com o que está na mão dele.',
      qualidade: 'Garanta que a folha oficial no app é a última versão que a marca publicou.',
    },
    eventos: ['onepage'],
  },
  {
    id: 'altos-padroes', pilar: 'satisfacao', nome: 'Altos padrões',
    texto: 'A excelência que buscamos nasce da vontade constante de crescer e evoluir.',
    noApp: {
      ponta: 'Responda a objeção com o dado que está no app, não com achismo. Número fecha; adjetivo adia.',
      vendas: 'Leve para a reunião a objeção que o time mais consultou: é o que o mercado está perguntando.',
      acessorios: 'Preço certo é padrão. Confira antes que alguém prometa errado na frente do cliente.',
      leads: 'Responda com número e prazo. "Em breve" não é resposta.',
      qualidade: 'Revise carro, condição, acessório, documento e objeção. É a sua revisão que segura o padrão.',
    },
    // Abrir a quebra de objeção JÁ é um evento do app ('objecao'): é o vendedor
    // buscando o dado antes de responder. É exatamente este valor.
    eventos: ['objecao'],
  },
  {
    id: 'firme-discordar', pilar: 'satisfacao', nome: 'Ser firme e discordar',
    texto: 'Entendemos que discordar com respeito fortalece decisões mais justas e ambientes mais saudáveis.',
    noApp: {
      ponta: 'Abra a condição vigente antes de falar número. Prometer o que a tabela não tem é o oposto de ser firme.',
      vendas: 'Publique a tabela do mês, tire a anterior do ar — e diga não ao que ela não cobre.',
      acessorios: 'Segure o preço da tabela. Desconto combinado no corredor vira prejuízo no fechamento.',
      leads: 'Discorde com respeito quando o lead pedir o impossível, e ofereça o que existe de verdade.',
      qualidade: 'Aponte o que está errado no app mesmo quando incomoda. É para isso que a revisão existe.',
    },
    // Carimbado na mão quando a pessoa abre uma condição publicada (Ofertas).
    eventos: [],
  },
  {
    id: 'melhor-melhorando', pilar: 'satisfacao', nome: 'Ser o melhor e estar melhorando',
    texto: 'Acreditamos que crescer como equipe é o caminho para alcançar resultados ainda maiores.',
    noApp: {
      ponta: 'Acerte o quiz e abra o próximo nível do carro. Quem domina o básico é quem pode subir.',
      vendas: 'Olhe a formação do time: quantos dominaram o carro do mês? É esse número que vira venda.',
      acessorios: 'Domine a linha inteira, não só os três que mais saem.',
      leads: 'Feche a formação dos carros que mais chegam pelo funil.',
      qualidade: 'Termine a trilha: quem revisa precisa conhecer o que está revisando.',
    },
    eventos: ['quiz_pass'],
  },
];

/** A marca tem programa de cultura no app? Hoje só a Ramasa. */
export function temValores(brand: BrandId): boolean {
  return brand === 'ramasa';
}

export function pilar(id: PilarId): Pilar {
  return PILARES.find((p) => p.id === id) || PILARES[0];
}

export function valoresDoPilar(id: PilarId): Valor[] {
  return VALORES.filter((v) => v.pilar === id);
}

export function valorPorId(id: string): Valor | undefined {
  return VALORES.find((v) => v.id === id);
}

/**
 * A SEMANA DO ANO — a mesma conta do ritual semanal (ver rituais.ts).
 * Serve para girar o valor da semana sem ninguém precisar escolher.
 */
export function semanaDoAno(d: Date): number {
  const q = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const diaSemana = q.getUTCDay() || 7;
  q.setUTCDate(q.getUTCDate() + 4 - diaSemana);
  const inicio = new Date(Date.UTC(q.getUTCFullYear(), 0, 1));
  return Math.ceil(((q.getTime() - inicio.getTime()) / 86400000 + 1) / 7);
}

/**
 * O VALOR DESTA SEMANA.
 *
 * Gira sozinho, na ordem do material (Razão, Magia, Satisfação, três de cada):
 * nove valores, nove semanas, e recomeça. Ninguém precisa lembrar de trocar —
 * e o time sabe que na segunda tem valor novo.
 */
export function valorDaSemana(hoje = new Date()): Valor {
  return VALORES[semanaDoAno(hoje) % VALORES.length];
}

/** A linha "no app" DESTE cargo — com a do vendedor como reserva. */
export function linhaNoApp(valor: Valor, cargo?: CargoAuto, role?: string): string {
  return valor.noApp[grupoDoCargo(cargo, role)] || valor.noApp.ponta;
}

/** O valor que ESTA ação carimba, se houver. */
export function valorDoEvento(type: ElevaEventType): Valor | undefined {
  return VALORES.find((v) => v.eventos.includes(type));
}

/** Quantas vezes cada PILAR foi praticado, a partir da contagem por valor. */
export function pilaresDe(porValor: Record<string, number> | undefined): Record<PilarId, number> {
  const soma: Record<PilarId, number> = { razao: 0, magia: 0, satisfacao: 0 };
  for (const [id, n] of Object.entries(porValor || {})) {
    const v = valorPorId(id);
    if (v) soma[v.pilar] += n || 0;
  }
  return soma;
}
