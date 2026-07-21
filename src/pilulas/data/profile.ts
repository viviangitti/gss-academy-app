// Perfil do usuário guardado NA CONTA (Firestore), não no aparelho — assim o papel
// (gestor/vendedora), o nome e o canal valem em qualquer celular onde a pessoa logar.
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Role, AffiliateType } from '../AuthContext';
import { normalizeRole } from './roles';
import type { SegmentId } from './segments';
import { BRANDS, type BrandId } from './brands';

export interface ElevaProfile {
  role: Role; // o perfil PRINCIPAL — é o que o app usa pra montar a experiência
  roles?: Role[]; // todos os perfis marcados no cadastro (a pessoa pode ser mais de um)
  name?: string;
  segment?: SegmentId | '';
  affiliateType?: AffiliateType | ''; // só quando role === 'afiliado'
  brands?: BrandId[]; // marca(s) que a pessoa vê — ex.: ['dsp'] p/ Drogaria São Paulo
}

export async function getElevaProfile(uid: string): Promise<ElevaProfile | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'elevaUsers', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    const role: Role = normalizeRole(d.role) ?? 'balconista';
    const at = d.affiliateType;
    const rawBrands = Array.isArray(d.brands) ? d.brands : undefined;
    const brands = rawBrands?.filter((b: unknown) => BRANDS.some((x) => x.id === b)) as BrandId[] | undefined;
    return {
      role,
      name: typeof d.name === 'string' ? d.name : undefined,
      segment: typeof d.segment === 'string' ? (d.segment as SegmentId | '') : undefined,
      affiliateType: at === 'geral' || at === 'saude' ? at : undefined,
      brands: brands && brands.length ? brands : undefined,
    };
  } catch {
    return null;
  }
}

// Atualiza SÓ o nome (merge) — sem tocar em papel/marcas. Usado no Perfil.
export async function updateElevaName(uid: string, name: string): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'elevaUsers', uid), { name: name.trim(), updatedAt: serverTimestamp() }, { merge: true });
  } catch { /* offline / sem permissão */ }
}

export async function setElevaProfile(uid: string, p: ElevaProfile): Promise<void> {
  if (!db) return;
  try {
    await setDoc(
      doc(db, 'elevaUsers', uid),
      {
        role: p.role,
        roles: p.roles || [p.role],
        name: p.name || '',
        segment: p.segment || '',
        affiliateType: p.affiliateType || '',
        brands: p.brands || [],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    /* offline / sem permissão: o localStorage cobre neste aparelho */
  }
}
