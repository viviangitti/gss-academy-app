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
export type MsgIA = { role: 'user' | 'assistant'; content: string };

const PREFIXO = 'wp_ia_conversa';
/** O mesmo teto do servidor (_coach.js corta em 40) — guardar mais é lixo. */
const MAX_MSGS = 40;
/** localStorage estoura em ~5 MB no total do app. 200 KB por conversa é folga. */
const MAX_BYTES = 200_000;

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
    const msgs = Array.isArray(g?.msgs)
      ? g.msgs.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      : [];
    return { msgs: msgs.slice(-MAX_MSGS), em: Number(g?.em) || 0 };
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
  const d = new Date(em);
  const hoje = new Date();
  const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (mesmoDia(d, hoje)) return '';
  const ontem = new Date(hoje.getTime() - 86400000);
  if (mesmoDia(d, ontem)) return 'ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
