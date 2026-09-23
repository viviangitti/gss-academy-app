// OS RITUAIS DO MÊS — o que cada cargo confere, quando, e o ok que fica gravado.
//
// Pedido da Vivian (18/09/2026). O problema que ele resolve é velho e conhecido
// da loja: condição vencida continua no ar, lista de acessório envelhece, e
// campanha fecha sem o vendedor perceber. Ninguém errou de propósito — só não
// havia hora marcada para conferir.
//
// Agora há: cada cargo tem a sua conferência, ela aparece na janela certa do
// mês, e o "ok" fica registrado com nome, cargo e horário. Sem o registro, a
// gerência não tem como saber se foi feito — e "achei que alguém tinha visto"
// foi exatamente o que aconteceu com a tabela de setembro.
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { isAuto, type BrandId } from './brands';
import type { CargoAuto } from './cargos';

export interface Ritual {
  id: string;
  cargos: CargoAuto[];
  titulo: string;
  /** Quando ele cobra, em palavras — aparece no pop-up. */
  quando: string;
  porQue: string;
  /** O que precisa estar conferido. Todos marcados para o ok liberar. */
  itens: string[];
  botao: string;
  ondeIr?: { rota: string; rotulo: string };
  /** Hoje está dentro da janela de cobrança? */
  janela(hoje: Date): boolean;
  /** O ciclo que este ok cobre. Dois oks no mesmo ciclo contam como um. */
  ciclo(hoje: Date): string;
}

const competencia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const ultimoDiaDoMes = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

/**
 * O primeiro dia ÚTIL do mês.
 *
 * Dia 1 caindo no sábado, a cobrança no dia 1 seria um lembrete para ninguém —
 * e na segunda já estaria "atrasada" sem culpa de quem confere.
 */
export function primeiroDiaUtil(d: Date): number {
  for (let dia = 1; dia <= 7; dia += 1) {
    const semana = new Date(d.getFullYear(), d.getMonth(), dia).getDay();
    if (semana !== 0 && semana !== 6) return dia;
  }
  return 1;
}

export const RITUAIS: Ritual[] = [
  {
    id: 'qualidade-revisao',
    cargos: ['lider-qualidade', 'diretor-qualidade'],
    titulo: 'Revisão do mês',
    quando: 'No primeiro dia útil do mês',
    porQue:
      'Informação errada no app vira informação errada na frente do cliente. Esta revisão é o que garante que o que está no ar é o que a loja pratica hoje.',
    itens: [
      'Carros: ficha, fotos e vídeos conferidos, sem versão fora de linha',
      'Condições: a tabela deste mês está no ar e a do mês passado saiu',
      'Acessórios: lista por carro, preços e o que saiu de linha',
      'Documentos: o que está publicado é a versão atual',
      'Objeções do time: as novas foram respondidas e publicadas',
    ],
    botao: 'Revisei — está tudo certo',
    ondeIr: { rota: '/eleva/catalogo', rotulo: 'Abrir o catálogo' },
    janela: (hoje) => {
      const inicio = primeiroDiaUtil(hoje);
      const dia = hoje.getDate();
      return dia >= inicio && dia <= inicio + 4;
    },
    ciclo: competencia,
  },
  {
    id: 'vendedor-campanha',
    cargos: ['vendedor-veiculos', 'vendedor-acessorios', 'fi', 'executivo-leads'],
    titulo: 'A campanha está fechando',
    quando: 'Nos dias 14 e 30',
    porQue:
      'Campanha que ninguém acompanha vira surpresa no fim do mês. O meio do mês e a véspera do fechamento são as duas horas em que ainda dá tempo de virar.',
    itens: [
      'Vi qual campanha está valendo e o dia em que ela fecha',
      'Sei quanto falta para a minha meta',
      'Falei hoje com pelo menos um cliente que estava parado',
    ],
    botao: 'Vi a campanha',
    ondeIr: { rota: '/eleva/ofertas?grupo=campanha', rotulo: 'Ver a campanha' },
    janela: (hoje) => {
      const dia = hoje.getDate();
      const ultimo = ultimoDiaDoMes(hoje);
      return (dia >= 14 && dia <= 16) || dia >= Math.min(30, ultimo);
    },
    ciclo: (hoje) => `${competencia(hoje)}-${hoje.getDate() <= 20 ? 'q1' : 'q2'}`,
  },
  {
    id: 'vendas-condicoes',
    cargos: ['gerente-veiculos', 'supervisor-vendas'],
    titulo: 'Condições do mês',
    quando: 'Entre os dias 1 e 5',
    porQue:
      'O time vende com o que está no app. Tabela vencida no ar é o vendedor prometendo o que a loja já não pratica — e o cliente cobrando depois.',
    itens: [
      'Publiquei a tabela da montadora deste mês, com a validade certa',
      'Tirei do ar a tabela do mês passado',
      'Atualizei as campanhas internas de incentivo do time',
    ],
    botao: 'Atualizado — pode valer',
    ondeIr: { rota: '/eleva/gestor', rotulo: 'Abrir o painel' },
    janela: (hoje) => hoje.getDate() <= 5,
    ciclo: competencia,
  },
  {
    id: 'acessorios-lista',
    cargos: ['gerente-acessorios', 'lider-acessorios'],
    titulo: 'Acessórios do mês',
    quando: 'Entre os dias 1 e 5',
    porQue:
      'Acessório sem preço certo o vendedor não oferece; o que saiu de linha ele oferece sem saber. Os dois custam venda — e o segundo custa a confiança do cliente.',
    itens: [
      'Conferi a lista de acessórios de cada carro',
      'Tirei do ar o que saiu de linha ou está sem estoque',
      'Conferi os preços com a tabela da loja',
    ],
    botao: 'Atualizado — pode valer',
    ondeIr: { rota: '/eleva/gestor', rotulo: 'Abrir o painel' },
    janela: (hoje) => hoje.getDate() <= 5,
    ciclo: competencia,
  },
];

/**
 * Os rituais da marca. Hoje só a concessionária tem cargos e calendário de
 * mês — na farmácia e na revenda não existe tabela da montadora nem campanha
 * com data de fechamento.
 */
export function rituaisDaMarca(brand: BrandId): Ritual[] {
  return isAuto(brand) ? RITUAIS : [];
}

/** O ritual que cobra ESTE cargo HOJE, se houver. */
export function ritualDeHoje(brand: BrandId, cargo: CargoAuto | undefined, hoje = new Date()): Ritual | null {
  if (!cargo) return null;
  return rituaisDaMarca(brand).find((r) => r.cargos.includes(cargo) && r.janela(hoje)) || null;
}

export interface Confirmacao {
  em: string;      // ISO
  nome?: string;
  cargo?: string;
  ritual: string;
  ciclo: string;
}

const chave = (ritualId: string, ciclo: string) => `${ritualId}|${ciclo}`;
const KEY_LOCAL = 'wp_rituais_ok';

/** O que já foi confirmado NESTE aparelho — resposta instantânea e offline. */
function okLocal(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY_LOCAL) || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

export function confirmadoLocal(ritualId: string, ciclo: string): boolean {
  return !!okLocal()[chave(ritualId, ciclo)];
}

/** O que a CONTA já confirmou — vale em qualquer aparelho onde a pessoa logar. */
export async function confirmacoesDaConta(uid: string): Promise<Record<string, Confirmacao>> {
  if (!db) return {};
  try {
    const snap = await getDoc(doc(db, 'elevaRituais', uid));
    const d = snap.exists() ? snap.data() : null;
    return (d?.oks as Record<string, Confirmacao>) || {};
  } catch {
    return {};
  }
}

/**
 * Grava o ok. Fica no aparelho na hora (o pop-up some mesmo sem rede) e na
 * conta, que é de onde a gerência vai cobrar quem não conferiu.
 */
export async function confirmar(
  uid: string | undefined,
  ritual: Ritual,
  quem: { nome?: string; cargo?: string; brand: BrandId },
  hoje = new Date(),
): Promise<void> {
  const ciclo = ritual.ciclo(hoje);
  const k = chave(ritual.id, ciclo);
  try {
    localStorage.setItem(KEY_LOCAL, JSON.stringify({ ...okLocal(), [k]: hoje.toISOString() }));
  } catch {
    /* modo anônimo: vale só nesta sessão */
  }
  if (!db || !uid) return;
  const registro: Confirmacao = { em: hoje.toISOString(), nome: quem.nome, cargo: quem.cargo, ritual: ritual.id, ciclo };
  try {
    await setDoc(
      doc(db, 'elevaRituais', uid),
      { uid, nome: quem.nome || '', cargo: quem.cargo || '', brand: quem.brand, oks: { [k]: registro } },
      { merge: true },
    );
  } catch {
    /* sem rede ou sem permissão: fica o registro local */
  }
}
