// A CONVERSA DO TIRA-DÚVIDA, guardada no aparelho.
//
// Até aqui ela vivia só na memória da tela: trocar de aba, atender um cliente e
// voltar, ou o iOS descarregar a página em segundo plano — e a conversa sumia
// inteira. No showroom isso acontece o tempo todo: a pessoa pergunta, o cliente
// chega, ela volta dez minutos depois e começa do zero.
//
// POR PESSOA E POR MARCA. Numa loja o mesmo aparelho passa de mão em mão, e a
// conversa de um vendedor não é assunto do outro — ela tem o caso do cliente
// dele dentro. Trocar de conta ou de marca abre a conversa daquela combinação,
// não a última que alguém deixou aberta.
//
// FICA NO APARELHO, não na nuvem. É rascunho de trabalho com relato de cliente
// dentro; subir isso pro Firestore criaria um arquivo de conversas do time que
// ninguém pediu e que eu teria que proteger.
import { hojeEmBrasilia } from './diaAtual';

/**
 * `at` é o carimbo de QUANDO a mensagem foi dita. Ele viaja junto para o
 * servidor e é o que permite marcar como "[dd/mm]" o que foi dito noutro dia,
 * para o coach não repetir data velha como se fosse hoje (regra 5 em
 * api/_coach.js).
 *
 * É opcional, e FICA VAZIO quando não se sabe: as conversas gravadas antes
 * desta versão não têm carimbo nenhum, e herdar o `em` do pacote seria mentir
 * — `em` é a hora da ÚLTIMA gravação, não a de cada mensagem, e na conversa que
 * causou o bug ele diria "hoje" para uma resposta do dia 25. Sem carimbo o
 * servidor sabe que não sabe, e é ele quem decide o que fazer com isso.
 */
export type MsgIA = { role: 'user' | 'assistant'; content: string; at?: number };

const PREFIXO = 'wp_ia_conversa';
/** O mesmo teto do servidor (_coach.js corta em 40) — guardar mais é lixo. */
const MAX_MSGS = 40;
/** localStorage estoura em ~5 MB no total do app. 200 KB por conversa é folga. */
const MAX_BYTES = 200_000;
/**
 * VALIDADE. A conversa não tinha nenhuma: só o botão "Nova conversa" apagava,
 * e quem nunca aperta carregava para a IA, por semanas, prazos e condições de
 * outro mês. Sete dias mantém o que serve de verdade — "aquilo que a gente
 * falou ontem" — e joga fora o que só atrapalha.
 */
const VALIDADE_MS = 7 * 86400000;

function chave(brandId: string, email?: string | null): string {
  return `${PREFIXO}:${brandId}:${(email || 'anon').trim().toLowerCase()}`;
}

interface Guardado {
  msgs: MsgIA[];
  /** Quando a última mensagem entrou — a tela avisa se a conversa é de outro dia. */
  em: number;
}

export function lerConversa(brandId: string, email?: string | null): Guardado {
  try {
    const cru = localStorage.getItem(chave(brandId, email));
    if (!cru) return { msgs: [], em: 0 };
    const g = JSON.parse(cru) as Guardado;
    const em = Number(g?.em) || 0;
    const msgs = Array.isArray(g?.msgs)
      ? g.msgs.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      : [];

    // A CONVERSA ANTIGA NÃO É APAGADA.
    //
    // Cheguei a fazer isso — quem não tivesse carimbo perdia a conversa inteira
    // na primeira abertura depois do conserto — e era troca ruim: o módulo
    // existe justamente para a pessoa voltar dez minutos depois e achar o caso
    // do cliente ali (ver o topo do arquivo), e apagar tudo para ganhar uma
    // dica que o servidor já tem em triplicado é preço alto demais. Mensagem
    // sem carimbo segue viva e segue sendo mandada; quem lida com a falta de
    // data é o servidor, que tem três defesas de relógio que não dependem
    // dela.
    //
    // O que some é só o que VENCEU: passados sete dias, aquilo não é mais
    // "o que a gente falou ontem", é prazo e condição de outro mês indo junto
    // na pergunta de hoje.
    const corte = Date.now() - VALIDADE_MS;
    const vivas = msgs.filter((m) => {
      const at = Number(m.at);
      return !Number.isFinite(at) || at <= 0 || at >= corte;
    });
    if (!vivas.length) return { msgs: [], em: 0 };
    return { msgs: vivas.slice(-MAX_MSGS), em };
  } catch {
    return { msgs: [], em: 0 };
  }
}

export function gravarConversa(brandId: string, email: string | null | undefined, msgs: MsgIA[]): void {
  try {
    const k = chave(brandId, email);
    if (!msgs.length) { localStorage.removeItem(k); return; }
    // Corta pelo fim até caber: uma resposta muito longa não pode derrubar o
    // histórico inteiro por estouro de cota.
    // O carimbo vem de quem criou a mensagem (AssistenteBalcao), não daqui:
    // gravar é uma coisa que acontece muitas vezes depois, e carimbar na
    // gravação faria toda mensagem antiga virar mensagem de agora.
    let corte = msgs.slice(-MAX_MSGS);
    let texto = JSON.stringify({ msgs: corte, em: Date.now() });
    while (texto.length > MAX_BYTES && corte.length > 2) {
      corte = corte.slice(2);
      texto = JSON.stringify({ msgs: corte, em: Date.now() });
    }
    localStorage.setItem(k, texto);
  } catch {
    /* cota cheia: a conversa segue na tela, só não sobrevive ao recarregar */
  }
}

export function limparConversa(brandId: string, email?: string | null): void {
  try { localStorage.removeItem(chave(brandId, email)); } catch { /* ignore */ }
}

/** "hoje" / "ontem" / "04/09" — só aparece quando a conversa não é de hoje. */
export function deQuandoEh(em: number): string {
  if (!em) return '';
  // Comparado no fuso da loja, não no do aparelho: o celular que voltou de
  // viagem com o fuso trocado dizia "hoje" para conversa de ontem.
  const dia = hojeEmBrasilia(new Date(em));
  if (dia === hojeEmBrasilia()) return '';
  if (dia === hojeEmBrasilia(new Date(Date.now() - 86400000))) return 'ontem';
  const [, m, d] = dia.split('-');
  return `${d}/${m}`;
}
