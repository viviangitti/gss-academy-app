// A MEMÓRIA que o Tira-dúvida recebe sobre quem está perguntando.
//
// É a peça 2 do método GSS: sem ela o coach é genérico — é aqui que mora metade
// do valor percebido. O app já sabe quem é a pessoa, o que ela assistiu, quais
// objeções ela ouviu na rua e qual condição a gerência publicou. Faltava juntar
// isso e mandar junto com a pergunta.
//
// IMPORTANTE: daqui só saem DADOS. As instruções (o método) vivem no servidor,
// em api/_coach.js, e nunca passam pelo navegador.
import { getStats } from './tracking';
import { fetchObjections, fetchMyObjections, type TeamObjection } from './objections';
import { condicoesDaMarca, estaVencida } from './condicoes';
import { allOffers } from './store';
import { campanhaPara, ateLabel } from './campanha';
import { getBrand, isAuto, type BrandId } from './brands';
import { acessoriosDaMarca, precoLabel } from './acessorios';
import { documentosDaMarca } from './documentos';
import type { Role } from '../AuthContext';

export type Tom = 'direto' | 'motivador' | 'tecnico';

const TOM_KEY = 'wp_tom_coach';

export function getTom(): Tom {
  try {
    const t = localStorage.getItem(TOM_KEY);
    if (t === 'direto' || t === 'motivador' || t === 'tecnico') return t;
  } catch { /* modo anônimo */ }
  return 'direto';
}

export function setTom(t: Tom): void {
  try { localStorage.setItem(TOM_KEY, t); } catch { /* ignore */ }
}

export interface MemoriaCoach {
  nome?: string;
  cargo?: string;
  empresa?: string;
  segmento?: string;
  metas?: string;
  tom: Tom;
  atividades: { titulo: string; detalhe?: string; quando?: string }[];
  falas: { texto: string; quando?: string }[];
  casos: { rotulo: string; texto: string }[];
  condicoes: { titulo: string; detalhe?: string }[];
  ofertas: { titulo: string; detalhe?: string }[];
  /** Acessórios do catálogo: o que é e o que resolve. */
  acessorios: { titulo: string; detalhe?: string }[];
  /** O que existe em Documentos — pra IA mandar abrir o certo, não inventar. */
  documentos: { titulo: string; detalhe?: string }[];
}

const CARGO: Record<string, string> = {
  gestor: 'Gestor(a) / gerência',
  vendedor: 'Vendedor(a)',
  gerente: 'Gerente',
  balconista: 'Balconista',
  promotor: 'Promotor(a)',
  afiliado: 'Afiliado(a) / revenda',
};

function haQuantoTempo(d?: Date): string {
  if (!d) return '';
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  return `há ${Math.round(dias / 30)} meses`;
}

// Objeção registrada pela ponta vira DUAS coisas no contexto: a fala da própria
// pessoa (o que ela ouviu do cliente) e, quando ela contou como respondeu, um
// caso da equipe. Sempre anonimizado — nome e e-mail nunca saem daqui.
function comoCaso(o: TeamObjection): { rotulo: string; texto: string } | null {
  if (!o.answer?.trim()) return null;
  return {
    rotulo: `OBJEÇÃO CONTORNADA "${o.text.trim().slice(0, 60)}"`,
    texto: `${o.productName ? `${o.productName}: ` : ''}${o.answer.trim()}`,
  };
}

/**
 * Monta a memória. Tudo é best-effort: se a nuvem não responder, o que já dá
 * pra saber pelo aparelho continua indo. Contexto pobre é melhor que erro.
 *
 * Só o gestor recebe os casos da equipe inteira — é a mesma regra do painel, e
 * está no Firestore, não só aqui. Vendedor leva os casos que ele mesmo viveu.
 */
export async function montarMemoria(opts: {
  brandId: BrandId;
  nome?: string;
  email?: string;
  role?: Role;
  segmento?: string;
}): Promise<MemoriaCoach> {
  const { brandId, nome, email, role, segmento } = opts;
  const marca = getBrand(brandId);
  const auto = isAuto(brandId);
  const stats = getStats();

  const atividades: MemoriaCoach['atividades'] = [];
  const dominados = Object.keys(stats.perQuiz || {}).length;
  if (stats.weekViews) atividades.push({ titulo: `${stats.weekViews} vídeos assistidos neste mês`, detalhe: `${stats.weekPoints} pontos` });
  if (dominados) atividades.push({ titulo: `${dominados} ${auto ? 'carros' : 'produtos'} com o quiz acertado` });
  if (stats.streak > 1) atividades.push({ titulo: `${stats.streak} dias seguidos usando o app` });
  if (!stats.totalViews) atividades.push({ titulo: 'Ainda não assistiu nenhum vídeo no app' });

  // Objeções: as próprias (falas) e, pro gestor, as do time (casos).
  let minhas: TeamObjection[] = [];
  let doTime: TeamObjection[] = [];
  try {
    if (role === 'gestor') doTime = (await fetchObjections(brandId)).slice(0, 20);
    else if (email) minhas = (await fetchMyObjections('', email)).filter((o) => o.brand === brandId).slice(0, 12);
  } catch { /* offline: segue sem */ }

  // fetchMyObjections filtra por produto; com '' não volta nada. Quando o
  // gestor puxa o time, as dele já estão dentro.
  const fonteFalas = role === 'gestor' ? doTime : minhas;
  const falas = fonteFalas
    .filter((o) => o.text?.trim())
    .slice(0, 12)
    .map((o) => ({ texto: o.text.trim().slice(0, 200), quando: haQuantoTempo(o.at) }));

  const casos = (role === 'gestor' ? doTime : minhas)
    .map(comoCaso)
    .filter((c): c is { rotulo: string; texto: string } => !!c)
    .slice(0, 20);

  const campanha = campanhaPara(role, brandId);

  return {
    nome,
    cargo: CARGO[role || ''] || undefined,
    empresa: marca.name,
    segmento: auto ? 'automotivo' : segmento || 'saúde e suplementos',
    metas: campanha ? `${campanha.nome} — até ${ateLabel(campanha)}` : undefined,
    tom: getTom(),
    atividades,
    falas,
    casos,
    // TODAS as condições no ar, não as cinco mais novas.
    //
    // Com o corte em 5, o Cristiano perguntou da campanha do Omoda 5 e a IA
    // respondeu falando de acessórios: as cinco mais recentes eram a tabela de
    // acessórios que o Lucas tinha acabado de subir, e a carta de setembro nem
    // chegou até ela. São 14 linhas de texto curto — cabe.
    //
    // Vencida fica de fora: citar condição que saiu do ar é pior que não citar.
    condicoes: condicoesDaMarca(brandId)
      .filter((c) => !estaVencida(c))
      .map((c) => ({
        titulo: c.titulo,
        detalhe: [
          c.categoria === 'campanha' ? 'campanha interna' : c.categoria === 'acessorio' ? 'acessório' : 'veículo',
          c.validade,
          c.observacao,
          // O conteúdo da folha, quando existe. É o que faz a IA responder
          // "taxa 0%, entrada 70%" em vez de mandar abrir.
          c.resumo,
        ].filter(Boolean).join(' · ') || undefined,
      })),
    // O catálogo de acessórios: a IA não tinha nenhum, e o vendedor de
    // acessórios é metade do time.
    // Vai a lista CORRIGIDA pela gerência, e sem o que saiu de linha: a IA
    // citando nome velho ou item que a loja não vende mais é a mesma falha do
    // preço desatualizado na tela — só que com a voz de quem sabe.
    acessorios: auto
      ? acessoriosDaMarca(brandId).map((a) => ({
          titulo: a.nome,
          // O preço VAI, agora que a gerência mantém ele: a tabela de acessório
          // é publicada pra loja, e "quanto é o rack?" é a pergunta número um.
          // Preço de VEÍCULO continua fora — esse não existe aqui.
          detalhe: [`preço ${precoLabel(a)}`, a.beneficio, a.comoOferecer].filter(Boolean).join(' · ') || undefined,
        }))
      : [],
    // Só o índice: título e pra que serve. Assim ela manda abrir o documento
    // certo em vez de tentar responder de cabeça o que está no PDF.
    documentos: documentosDaMarca(brandId).map((d) => ({
      titulo: d.titulo,
      detalhe: [d.interno ? 'INTERNO' : '', d.paraQue].filter(Boolean).join(' · ') || undefined,
    })),
    // No automotivo não existe card de oferta: a condição é a tabela publicada.
    ofertas: auto
      ? []
      : allOffers().filter((o) => o.brand === brandId).slice(0, 5).map((o) => ({
          titulo: o.title,
          detalhe: [o.tag, o.until, o.desc].filter(Boolean).join(' · ').slice(0, 200),
        })),
  };
}
