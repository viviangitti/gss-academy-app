// Contatos de marcas interessadas, vindos do formulário da landing.
//
// Quem preenche NÃO está logado — a regra do Firestore deixa criar (e só criar)
// nesta coleção, com o formato travado. Ler, editar e apagar, só gestor.
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

export interface Lead {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  whatsapp: string;
  mensagem: string;
  criadoEm?: Date;
}

export interface NovoLead {
  nome: string;
  empresa: string;
  email: string;
  whatsapp: string;
  mensagem: string;
}

// Os mesmos limites da regra do Firestore. Cortar aqui evita o formulário ser
// recusado pelo servidor por causa de um campo grande demais.
function limite(s: string, max: number): string {
  return s.trim().slice(0, max);
}

export async function enviarLead(l: NovoLead): Promise<boolean> {
  if (!db) return false;
  try {
    await addDoc(collection(db, 'elevaLeads'), {
      nome: limite(l.nome, 80),
      empresa: limite(l.empresa, 120),
      email: limite(l.email, 120),
      whatsapp: limite(l.whatsapp, 40),
      mensagem: limite(l.mensagem, 800),
      criadoEm: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function buscarLeads(): Promise<Lead[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, 'elevaLeads'), orderBy('criadoEm', 'desc')));
    return snap.docs.map((d) => {
      const x = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        nome: String(x.nome || ''),
        empresa: String(x.empresa || ''),
        email: String(x.email || ''),
        whatsapp: String(x.whatsapp || ''),
        mensagem: String(x.mensagem || ''),
        criadoEm: (x.criadoEm as { toDate?: () => Date })?.toDate?.(),
      };
    });
  } catch {
    return [];
  }
}
