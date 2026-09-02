// O PLACAR REAL DO TIME.
//
// Por que existe: o ranking comparava a pessoa com oito colegas INVENTADOS,
// escritos no código (Camila Rocha da Drogaria São Paulo e companhia). Num
// showroom de carro isso saiu caro: o Walther fez 4 fichas e passou nos 4
// quizzes num dia — primeiro lugar do time por 140 pontos de diferença — e a
// tela dele mostrava QUARTO, atrás de três balconistas de farmácia que não
// existem. Quem mais se esforçou foi o mais desmotivado pela tela.
//
// Por que uma coleção separada, e não o elevaStats: para ler o elevaStats do
// time é preciso ser gestor, e com razão — lá tem nome, e-mail e o desempenho
// individual de cada um. Aqui vai só o mínimo de um placar:
//
//     { uid, brand, pontos, streak, mes }
//
// SEM NOME e SEM E-MAIL, de propósito. Assim a regra pode liberar a leitura
// para o time inteiro sem expor ninguém: o vendedor vê a escada e a distância
// para a posição de cima, não quem está na lanterna. Era essa a decisão de
// produto desde o começo — só que antes ela era cumprida com gente falsa.
//
// Cada pessoa publica só o próprio registro, junto do sync de estatísticas.
import { collection, doc, getDocs, query, setDoc, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { ehContaDeTeste } from './contasDeTeste';

const COL = 'elevaPlacar';

export interface LinhaPlacar {
  uid: string;
  pontos: number;
  streak: number;
  /** É o registro de quem está olhando a tela. */
  eu?: boolean;
}

/**
 * Publica a pontuação da pessoa. Best-effort: se falhar, o app segue igual —
 * o placar é motivação, não pode derrubar a tela.
 */
export function publicarPlacar(dados: { brand: string; pontos: number; streak: number; mes: string }): void {
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return;
  // O placar não guarda e-mail (é isso que permite o time inteiro ler sem
  // expor ninguém), então quem é conta de teste tem que ser barrado AQUI, na
  // publicação, enquanto a sessão ainda sabe de quem é a pontuação.
  if (ehContaDeTeste(auth?.currentUser?.email)) return;
  setDoc(
    doc(db, COL, uid),
    { uid, brand: dados.brand, pontos: dados.pontos, streak: dados.streak, mes: dados.mes, updatedAt: serverTimestamp() },
    { merge: true },
  ).catch(() => {
    /* offline ou sem permissão: tenta de novo na próxima ação */
  });
}

/**
 * A escada da marca no mês corrente, do mais pontos para o menos.
 *
 * Filtra pelo mês para que o placar de setembro não venha misturado com quem
 * parou de usar em agosto — o texto da tela promete que reinicia todo dia 1º.
 */
export async function carregarPlacar(brand: string, mes: string): Promise<LinhaPlacar[]> {
  if (!db) return [];
  const meuUid = auth?.currentUser?.uid;
  try {
    const q = query(collection(db, COL), where('brand', '==', brand), where('mes', '==', mes));
    // Com prazo. Sem rede ou sem sessão válida, o SDK do Firestore fica
    // tentando de novo sem nunca rejeitar — e a tela ficava em "Carregando o
    // placar do time…" para sempre. Seis segundos e a tela segue sem o pódio,
    // que é melhor do que uma promessa que nunca chega.
    const snap = await Promise.race([
      getDocs(q),
      new Promise<never>((_, rejeita) => setTimeout(() => rejeita(new Error('tempo esgotado')), 6000)),
    ]);
    const linhas: LinhaPlacar[] = [];
    snap.forEach((d) => {
      const v = d.data() as { uid?: string; pontos?: number; streak?: number };
      linhas.push({
        uid: v.uid || d.id,
        pontos: Number(v.pontos) || 0,
        streak: Number(v.streak) || 0,
        eu: d.id === meuUid,
      });
    });
    // Empate desempata pelo uid só para a ordem não dançar a cada carregamento.
    return linhas.sort((a, b) => b.pontos - a.pontos || a.uid.localeCompare(b.uid));
  } catch {
    return [];
  }
}
