// Teto DIÁRIO de chamadas de IA — a trava que é NOSSA.
//
// Por que existe: o "orçamento" do Google Cloud é só um alerta. A própria
// documentação diz que um budget de alertas "não limita automaticamente o uso
// ou o gasto". Foi por isso que um limite de R$20 não impediu R$60 de sumirem.
//
// Aqui o teto é real: um contador no Firestore, compartilhado por todas as
// instâncias da função. Passou do limite do dia, ninguém mais chama o Gemini —
// nem usuário logado, nem robô, nem bug em loop.
//
// FALHA FECHADA: se o contador não puder ser lido/gravado, a chamada é negada.
// Prefere-se o app sem IA por alguns minutos a uma conta surpresa.

import { getDb } from './_firebase.js';

const DOC = 'elevaMeta/aiUsage';
// Com ~10 usuários, 300/dia é folgado (30 por pessoa por dia). Ajuste pela env
// AI_DAILY_LIMIT se o uso legítimo crescer.
const LIMITE_PADRAO = 300;

function hojeSP() {
  // Dia no fuso de São Paulo, pra virar a meia-noite certa.
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

export function limiteDiario() {
  const n = parseInt(process.env.AI_DAILY_LIMIT || '', 10);
  return Number.isFinite(n) && n > 0 ? n : LIMITE_PADRAO;
}

/**
 * Consome 1 chamada do teto do dia.
 * @returns {Promise<{ok: boolean, usado: number, limite: number, motivo?: string}>}
 */
export async function consumirChamadaIA() {
  const limite = limiteDiario();
  let db;
  try {
    db = getDb();
  } catch (e) {
    return { ok: false, usado: -1, limite, motivo: 'contador indisponível' };
  }

  const ref = db.doc(DOC);
  const dia = hojeSP();

  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const d = snap.exists ? snap.data() : null;
      // Dia novo (ou primeiro uso): zera o contador.
      const usadoAntes = d && d.day === dia ? Number(d.count || 0) : 0;

      if (usadoAntes >= limite) {
        return { ok: false, usado: usadoAntes, limite, motivo: 'teto diário atingido' };
      }
      tx.set(ref, { day: dia, count: usadoAntes + 1, updatedAt: new Date().toISOString() });
      return { ok: true, usado: usadoAntes + 1, limite };
    });
  } catch (e) {
    return { ok: false, usado: -1, limite, motivo: 'contador indisponível' };
  }
}

/**
 * Guard pronto pra usar no handler. Responde 429 e devolve false quando estourou.
 * Uso:  if (!(await guardBudget(res))) return;
 */
export async function guardBudget(res) {
  const r = await consumirChamadaIA();
  if (!r.ok) {
    res.status(429).json({
      error: 'Limite diário de IA atingido. Tente de novo amanhã.',
      detalhe: r.motivo,
      usado: r.usado,
      limite: r.limite,
    });
    return false;
  }
  return true;
}
