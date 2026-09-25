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
import type { ElevaEventType } from './statsSync';

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
   * O que este valor significa DENTRO DO APP, nesta semana. É a ponte entre a
   * frase da parede e o que a pessoa faz hoje — sem ela, valor é decoração.
   */
  noApp: string;
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
    noApp: 'Ofereça o acessório na hora certa e confira a campanha que está fechando — é ali que a loja ganha margem.',
    eventos: ['acessorio'],
  },
  {
    id: 'senso-dono', pilar: 'razao', nome: 'Senso de dono',
    texto: 'Agimos com responsabilidade, cuidando da empresa como se fosse nossa.',
    noApp: 'Registrou uma objeção nova no atendimento? Mande pelo app. Ela volta respondida para o time inteiro.',
    // Carimbado na mão quando a pessoa ENVIA uma objeção nova (não quando
    // consulta uma que já existe — consultar é "altos padrões").
    eventos: [],
  },
  {
    id: 'mais-com-menos', pilar: 'razao', nome: 'Mais com menos',
    texto: 'Trabalhamos de forma inteligente, otimizando recursos sem abrir mão da qualidade e resultado.',
    noApp: 'Use o material que já está pronto no app em vez de refazer: o resumo do carro, a folha oficial e a ficha.',
    eventos: ['doc_open'],
  },
  {
    id: 'apaixonados', pilar: 'magia', nome: 'Apaixonados por clientes',
    texto: 'Nossa paixão por pessoas nos move a entregar mais do que produtos: entregamos experiências.',
    noApp: 'Responda o lead online pela Jornada, na etapa certa — e mande o material antes de ele pedir.',
    eventos: ['jornada_script', 'jornada_onepage'],
  },
  {
    id: 'melhoria-continua', pilar: 'magia', nome: 'Melhoria contínua',
    texto: 'Estamos sempre em busca de aprender, evoluir e aperfeiçoar o que fazemos.',
    noApp: 'Assista à pílula do carro antes do atendimento — inclusive a do carro que você acha que já sabe.',
    eventos: ['pill_view', 'video_play'],
  },
  {
    id: 'clientes-merecem', pilar: 'magia', nome: 'Nossos clientes merecem os melhores',
    texto: 'Atender bem é consequência do prazer que temos em fazer o nosso melhor todos os dias.',
    noApp: 'Mande a folha do cliente pelo app: sai com foto, ficha e o seu contato — igual, venha da loja que vier.',
    eventos: ['onepage'],
  },
  {
    id: 'altos-padroes', pilar: 'satisfacao', nome: 'Altos padrões',
    texto: 'A excelência que buscamos nasce da vontade constante de crescer e evoluir.',
    noApp: 'Responda a objeção com o dado que está no app, não com achismo. Número fecha; adjetivo adia.',
    // Abrir a quebra de objeção JÁ é um evento do app ('objecao'): é o vendedor
    // buscando o dado antes de responder. É exatamente este valor.
    eventos: ['objecao'],
  },
  {
    id: 'firme-discordar', pilar: 'satisfacao', nome: 'Ser firme e discordar',
    texto: 'Entendemos que discordar com respeito fortalece decisões mais justas e ambientes mais saudáveis.',
    noApp: 'Abra a condição vigente antes de falar número. Prometer o que a tabela não tem é o oposto de ser firme.',
    // Carimbado na mão quando a pessoa abre uma condição publicada (Ofertas).
    eventos: [],
  },
  {
    id: 'melhor-melhorando', pilar: 'satisfacao', nome: 'Ser o melhor e estar melhorando',
    texto: 'Acreditamos que crescer como equipe é o caminho para alcançar resultados ainda maiores.',
    noApp: 'Acerte o quiz e abra o próximo nível do carro. Quem domina o básico é quem pode subir.',
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
