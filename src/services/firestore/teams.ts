// Times: admin cria, vendedores entram via código
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Team {
  id: string;
  name: string;
  code: string;       // Ex: GSS-A7K2
  adminId: string;
  memberIds: string[];
  createdAt?: number;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem O/0/I/1 pra evitar confusão
  let code = 'GSS-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createTeam(adminUid: string, name: string): Promise<Team> {
  if (!db) throw new Error('Firebase não configurado');
  // Gera um código único (tenta até 5x)
  let code = generateCode();
  for (let i = 0; i < 5; i++) {
    const found = await findTeamByCode(code);
    if (!found) break;
    code = generateCode();
  }
  const ref = doc(collection(db, 'teams'));
  const team: Team = {
    id: ref.id,
    name,
    code,
    adminId: adminUid,
    memberIds: [adminUid],
  };
  await setDoc(ref, { ...team, createdAt: serverTimestamp() });
  return team;
}

export async function findTeamByCode(code: string): Promise<Team | null> {
  if (!db) return null;
  const q = query(collection(db, 'teams'), where('code', '==', code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<Team, 'id'>) };
}

export async function joinTeamByCode(uid: string, code: string): Promise<Team> {
  const team = await findTeamByCode(code);
  if (!team) throw new Error('Código de time inválido.');
  if (!db) throw new Error('Firebase não configurado');
  await updateDoc(doc(db, 'teams', team.id), {
    memberIds: arrayUnion(uid),
  });
  return team;
}

export async function getTeam(teamId: string): Promise<Team | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'teams', teamId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Team, 'id'>) };
}
