// Exclusão da conta e dos dados pessoais (LGPD, direito à eliminação).
//
// A política promete exclusão em até 30 dias; aqui a pessoa faz na hora.
//
// O que acontece com cada coisa:
//   - elevaStats/{uid}  → APAGADO (uso: pílulas, pontos, ofensiva, eventos)
//   - elevaUsers/{uid}  → APAGADO (perfil: nome, papel, marcas)
//   - elevaObjections   → ANONIMIZADO, não apagado. A objeção em si é conteúdo
//     de trabalho da marca ("cliente reclamou do gosto"), e apagá-la tiraria da
//     gestão um aprendizado legítimo. O que sai é o que liga a objeção à PESSOA:
//     nome e e-mail. Fica o texto, sem dono.
//   - conta do Firebase → APAGADA (o login deixa de existir)
//   - dados locais deste aparelho → APAGADOS
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { deleteUser } from 'firebase/auth';

export type ResultadoExclusao =
  | { ok: true }
  | { ok: false; motivo: 'precisa-entrar-de-novo' | 'falhou'; detalhe?: string };

/** Limpa o que o app guardou NESTE aparelho (não depende de rede). */
function limparLocal(): void {
  try {
    const apagar: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('wp_')) apagar.push(k);
    }
    apagar.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* modo anônimo: nada a fazer */
  }
}

export async function excluirConta(): Promise<ResultadoExclusao> {
  const u = auth?.currentUser;
  if (!u) return { ok: false, motivo: 'falhou', detalhe: 'ninguém logado' };
  const uid = u.uid;
  const email = u.email || '';

  try {
    if (db) {
      // 1) Objeções: tira o vínculo com a pessoa, preserva o conteúdo.
      if (email) {
        try {
          const snap = await getDocs(query(collection(db, 'elevaObjections'), where('byEmail', '==', email)));
          await Promise.all(
            snap.docs.map((d) => updateDoc(d.ref, { byName: 'Conta removida', byEmail: '' }).catch(() => {})),
          );
        } catch {
          /* sem permissão/offline: segue — o resto da exclusão é mais importante */
        }
      }
      // 2) Uso e perfil: apagados.
      await deleteDoc(doc(db, 'elevaStats', uid)).catch(() => {});
      await deleteDoc(doc(db, 'elevaUsers', uid)).catch(() => {});
    }

    // 3) A conta em si. O Firebase exige login recente pra apagar — se a sessão
    //    for antiga, ele recusa e a pessoa precisa sair e entrar de novo.
    await deleteUser(u);

    limparLocal();
    return { ok: true };
  } catch (e) {
    const code = (e as { code?: string })?.code || '';
    if (code === 'auth/requires-recent-login') {
      return { ok: false, motivo: 'precisa-entrar-de-novo' };
    }
    return { ok: false, motivo: 'falhou', detalhe: (e as { message?: string })?.message };
  }
}
