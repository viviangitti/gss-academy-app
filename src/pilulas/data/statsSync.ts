// Espelha no Firestore o que a pessoa faz no Eleva (pílulas, quiz, missões).
//
// Por quê: tracking.ts guarda tudo em localStorage — ótimo pro app (offline,
// instantâneo), mas invisível pro Sistema de Gestão. Aqui mandamos uma cópia
// AGREGADA pro servidor, sem travar a UI (falha silenciosa = app segue igual).
//
// Coleção: elevaStats/{uid} — 1 doc por pessoa, com agregados + eventos recentes.
// Nada de dado sensível: só o que a pessoa fez dentro do app.
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { publicarPlacar } from './placar';
import { pilaresDe } from './valores';
import type { Stats } from './tracking';

/**
 * O que o app registra.
 *
 * Os três primeiros valem ponto e movem o placar. Os outros não pontuam: estão
 * aqui só para responder o que o relatório de uso não conseguia responder.
 *
 * `pill_view` marca a ABERTURA da ficha, no instante em que a tela monta — não
 * diz se a pessoa assistiu ao vídeo. Era o único sinal que existia, então
 * "vídeos assistidos" no Painel sempre foi, na verdade, "fichas abertas".
 * `video_play` separa uma coisa da outra.
 *
 * `quiz_start` e `quiz_fail` existem porque zero aprovação tem duas leituras
 * opostas — ninguém tenta, ou todo mundo tenta e erra — e cada uma pede uma
 * correção diferente.
 *
 * `acessorio` cobre um ponto cego inteiro: a tela do acessório nunca registrou
 * nada. Quem vende acessório podia estar no app o dia todo e aparecer zerado no
 * relatório — inclusive a gerente de acessórios. Não pontua porque o placar de
 * hoje é de pílula; dar ponto aqui mudaria o ranking, e isso é decisão de
 * produto, não de instrumentação.
 */
export type ElevaEventType =
  | 'pill_view'
  | 'quiz_pass'
  | 'mission_done'
  | 'quiz_start'
  | 'quiz_fail'
  | 'video_play'
  | 'doc_open'
  | 'onepage'
  | 'objecao'
  | 'acessorio'
  // Jornada do atendimento: copiar o script de uma etapa e mandar o one page
  // dela. Tipos próprios de propósito — entrassem como 'onepage' e o relatório
  // semanal contaria folha de etapa como material de carro enviado ao cliente.
  | 'jornada_script'
  | 'jornada_onepage';

// Um doc do Firestore para em 1 MB. Cada evento pesa ~120 bytes, então o teto
// real seria perto de 8 mil — mas quando estourasse, o setDoc passaria a falhar
// e o catch abaixo engoliria o erro: os stats simplesmente parariam de subir,
// sem ninguém perceber. 400 dá meses de folga e mantém o doc em ~50 KB.
const MAX_EVENTS = 400;

interface SyncMeta {
  brand?: string;
  role?: string;
  /** A unidade do grupo. O painel separa o time por ela. */
  loja?: string;
  /**
   * O cargo da concessionária (vendedor de veículos, gerente de acessórios…).
   *
   * Vai junto porque o Painel lê o time por aqui, e o PAPEL por baixo é o do
   * vertical farmácia — "balconista". Numa concessionária não existe
   * balconista: a gerência abria o Painel e via o time inteiro classificado
   * com uma palavra que ninguém usa na loja.
   */
  cargo?: string;
  name?: string;
  /**
   * A pessoa já preencheu o contato que sai no material do cliente?
   *
   * Vai junto com os stats de propósito: a regra do Firestore deixa o gestor
   * ler elevaStats do time, mas NÃO deixa ler o perfil de ninguém (e nem deve —
   * lá tem dado pessoal). Assim a gerência consegue ver quem ainda não montou
   * o cartão, sem ver o telefone de ninguém.
   */
  cartaoPronto?: boolean;
}

let meta: SyncMeta = {};

/**
 * Chamado pelo app quando sabe marca/papel/nome (ver PilulasApp).
 *
 * IGNORA O QUE VEM VAZIO. `{ ...meta, ...m }` copia a CHAVE, não só o valor:
 * uma chamada com `cargo: undefined` — que é o normal enquanto o perfil ainda
 * está carregando — apagava o cargo que já se sabia. Esquecer é pior do que
 * não ter aprendido: o que vier depois grava vazio por cima do bom.
 */
export function setStatsMeta(m: SyncMeta): void {
  const limpo: SyncMeta = {};
  for (const [k, v] of Object.entries(m)) {
    if (v !== undefined && v !== null && v !== '') (limpo as Record<string, unknown>)[k] = v;
  }
  meta = { ...meta, ...limpo };
}

/**
 * Manda o agregado + o evento novo pro Firestore.
 * Best-effort: qualquer erro é engolido — o app nunca quebra por causa disso.
 */
export function syncStats(stats: Stats, event: { type: ElevaEventType; id: string; points: number }): void {
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return;

  // QUEM É A PESSOA — só entra quando se sabe.
  //
  // Isto era `cargo: meta.cargo || ''` e, com merge: true, uma sincronização
  // feita antes de o perfil carregar APAGAVA o cargo que o cadastro tinha
  // acabado de escolher. Dezessete pessoas da Ramasa ficaram sem cargo no
  // elevaStats tendo cargo no perfil, e três sem loja; o relatório diário e o
  // Painel leem daqui, então eles passaram semanas dizendo que o time não
  // tinha preenchido o que o time tinha preenchido. É a mesma família do
  // `brand` vazio que fez o Painel contar 29 pessoas em vez de 34.
  //
  // Campo vazio não é uma resposta. Não escreve nada: o que já está gravado
  // continua, e a próxima sincronização com dado bom corrige.
  const quemE: Record<string, string | boolean> = {};
  const seTiver = (chave: string, valor: string | undefined | null) => {
    if (valor) quemE[chave] = valor;
  };
  seTiver('name', meta.name || auth?.currentUser?.displayName || '');
  seTiver('email', auth?.currentUser?.email || '');
  seTiver('role', meta.role);
  seTiver('cargo', meta.cargo);
  // A UNIDADE. Faltava aqui: o SyncMeta declarava `loja`, o PilulasApp
  // passava `loja: user.loja` — e o payload nunca gravava. O Painel ganhou a
  // barra "Todas as lojas / Tiger Goiânia / ..." em 23/09 e ela nunca teve
  // o que mostrar, porque a barra só aparece quando há mais de uma loja NO
  // TIME, e o time chegava inteiro sem loja.
  seTiver('loja', meta.loja);
  seTiver('brand', meta.brand);
  // Booleano é diferente: `false` é uma resposta de verdade ("ainda não montou
  // o cartão"), então só fica de fora quando ninguém decidiu nada.
  if (typeof meta.cartaoPronto === 'boolean') quemE.cartaoPronto = meta.cartaoPronto;

  const payload = {
    uid,
    ...quemE,
    totals: {
      views: stats.totalViews,
      missions: stats.totalMissions,
      quizPassed: Object.keys(stats.perQuiz).length,
      streak: stats.streak,
    },
    month: {
      id: stats.week, // tracking.ts usa mês como período do ranking
      views: stats.weekViews,
      points: stats.weekPoints,
      missions: stats.weekMissions,
    },
    // Os pilares do mês (Ramasa). Vão somados por pilar, não valor por valor:
    // o Painel mostra a cultura da equipe, e nome de valor pessoa a pessoa
    // viraria planilha de julgamento.
    pilares: pilaresDe(stats.perValor),
    lastActiveAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    events: arrayUnion({
      type: event.type,
      id: event.id,
      points: event.points,
      at: new Date().toISOString(), // serverTimestamp() não funciona dentro de array
    }),
  };

  setDoc(doc(db, 'elevaStats', uid), payload, { merge: true }).catch(() => {
    /* offline ou sem permissão: ignora, o localStorage continua sendo a verdade do app */
  });

  // E o placar, que é público pro time. Vai separado porque o elevaStats só o
  // gestor pode ler — e o ranking precisa chegar em quem vende (ver placar.ts).
  publicarPlacar({
    brand: meta.brand || '',
    pontos: stats.weekPoints,
    streak: stats.streak,
    mes: stats.week,
  });
}

/**
 * Corta o array de eventos quando passa do teto.
 *
 * `arrayUnion` só empilha — nunca remove. Sem esta poda o doc cresce para
 * sempre até bater no limite de 1 MB, e a partir daí todo sync falha calado.
 * Roda uma vez no boot e reescreve o array já cortado.
 */
export async function podaEventos(): Promise<void> {
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return;
  try {
    const ref = doc(db, 'elevaStats', uid);
    const snap = await getDoc(ref);
    const events = snap.data()?.events;
    if (!Array.isArray(events) || events.length <= MAX_EVENTS) return;
    await setDoc(ref, { events: events.slice(-MAX_EVENTS) }, { merge: true });
  } catch {
    /* sem permissão ou offline: fica pra próxima abertura do app */
  }
}
