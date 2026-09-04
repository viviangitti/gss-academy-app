// DIÁRIO DE FALHAS DA IA.
//
// Por que existe: em 04/09/2026 o time avisou duas vezes que "a IA não está
// funcionando", e nas duas eu tive que adivinhar. A tela sabia dizer uma frase
// só, o servidor não guardava nada, e o print que chegava por WhatsApp não
// distinguia falta de internet de congestionamento de teto do dia.
//
// Cada falha vira uma linha em `elevaFalhasIA`: quem, quando, por quê. Ler leva
// segundos e acaba com o chute.
//
// É best-effort de propósito: se o registro falhar, a resposta ao vendedor NÃO
// pode ser afetada. Guardar o log nunca vale mais que atender.
import { getDb } from './_firebase.js';

export async function anotarFalhaIA({ uid, motivo, status, modelos }) {
  try {
    const db = getDb();
    await db.collection('elevaFalhasIA').add({
      uid: uid || null,
      motivo: String(motivo || '').slice(0, 300),
      status: status || 0,
      modelos: modelos || null,
      quando: new Date().toISOString(),
    });
  } catch {
    /* sem Firestore ou sem permissão: segue o jogo */
  }
}
