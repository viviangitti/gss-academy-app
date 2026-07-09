// Perfil do usuário guardado NA CONTA (Firestore), não no aparelho — assim o papel
// (gestor/vendedora), o nome e o canal valem em qualquer celular onde a pessoa logar.
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Role } from '../AuthContext';
import type { SegmentId } from './segments';

export interface ElevaProfile {
  role: Role;
  name?: string;
  segment?: SegmentId | '';
}

export async function getElevaProfile(uid: string): Promise<ElevaProfile | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'elevaUsers', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      role: d.role === 'gestor' ? 'gestor' : 'vendedora',
      name: typeof d.name === 'string' ? d.name : undefined,
      segment: typeof d.segment === 'string' ? (d.segment as SegmentId | '') : undefined,
    };
  } catch {
    return null;
  }
}

export async function setElevaProfile(uid: string, p: ElevaProfile): Promise<void> {
  if (!db) return;
  try {
    await setDoc(
      doc(db, 'elevaUsers', uid),
      { role: p.role, name: p.name || '', segment: p.segment || '', updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch {
    /* offline / sem permissão: o localStorage cobre neste aparelho */
  }
}
