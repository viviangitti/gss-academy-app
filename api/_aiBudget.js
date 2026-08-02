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
// Quando o Firestore não está disponível (projeto sem FIREBASE_SERVICE_ACCOUNT),
// cai num contador EM MEMÓRIA por instância — mais fraco, mas não derruba a IA.
// Bloquear tudo por não conseguir contar é pior que contar por baixo: a proteção
// principal contra cobrança é a chave ser do nível gratuito, sem cartão.

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
// Contador de emergência, por instância da função. Vale só enquanto o container
// vive, então conta por baixo — é rede de segurança, não o teto principal.
const memoria = { dia: '', count: 0 };

function consumirNaMemoria(limite) {
  const dia = hojeSP();
  if (memoria.dia !== dia) {
    memoria.dia = dia;
    memoria.count = 0;
  }
  if (memoria.count >= limite) {
    return { ok: false, usado: memoria.count, limite, motivo: 'teto diário atingido (contagem local)' };
  }
  memoria.count += 1;
  return { ok: true, usado: memoria.count, limite, motivo: 'contagem local' };
}

export async function consumirChamadaIA() {
  const limite = limiteDiario();
  let db;
  try {
    db = getDb();
  } catch (e) {
    // Sem Firestore neste projeto: não dá pra contar globalmente, mas também
    // não faz sentido derrubar a IA por isso.
    return consumirNaMemoria(limite);
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
    // Firestore configurado mas falhou (rede, permissão): idem, contagem local.
    return consumirNaMemoria(limite);
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
