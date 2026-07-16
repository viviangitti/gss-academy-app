import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { BrandId } from './data/brands';
import { mySegment, type SegmentId } from './data/segments';
import { onAuthChange, signOut as fbSignOut, type AuthUser } from '../services/auth';
import { firebaseEnabled } from '../services/firebase';
import { storedRole, setStoredRole, storedAffiliateType } from './data/roles';
import { getElevaProfile, type ElevaProfile } from './data/profile';

// Papéis de acesso. 'balconista' era chamado de 'vendedora' até 2026-07 — quem
// tem o papel antigo salvo é migrado na leitura (ver normalizeRole em roles.ts).
export type Role = 'gestor' | 'balconista' | 'promotor' | 'afiliado';
// Subtipo do afiliado: geral (comum) x profissional da saúde.
export type AffiliateType = 'geral' | 'saude';

// PÚBLICO DE CONTEÚDO — define QUAL vídeo a pessoa vê em cada produto.
// O conteúdo do afiliado é diferente do do promotor, que é diferente do do balconista.
export type Audience = 'balconista' | 'promotor' | 'afiliado-geral' | 'afiliado-saude';

export interface User {
  name: string;
  email: string;
  role: Role;
  brands: BrandId[]; // empresas que a pessoa pode ver
  segment?: SegmentId; // canal de onde veio (etiqueta do link/QR de convite)
  affiliateType?: AffiliateType; // só para role === 'afiliado'
}

// De qual público essa pessoa faz parte (pra escolher o vídeo do produto).
export function audienceOf(user: Pick<User, 'role' | 'affiliateType'> | null | undefined): Audience | null {
  if (!user) return null;
  if (user.role === 'afiliado') return user.affiliateType === 'saude' ? 'afiliado-saude' : 'afiliado-geral';
  if (user.role === 'promotor') return 'promotor';
  if (user.role === 'balconista') return 'balconista';
  return null; // gestor vê o vídeo padrão
}

// GESTORES AUTORIZADOS — controla quem entra no Painel do Gestor e vê os campos
// de subir vídeo. Quem loga com um e-mail desta lista vira gestor; qualquer
// outro entra como balconista.
// Para adicionar outro gestor: inclua o e-mail aqui (minúsculo) E em isGestor()
// no firestore.eleva.rules — senão a pessoa vê os campos mas não salva na nuvem.
const GESTOR_EMAILS = ['maria26@gmail.com', 'viviangitti23@gmail.com'];

function roleFor(email: string, profile: ElevaProfile | null): Role {
  const e = email.trim().toLowerCase();
  // Prioridade: e-mail na lista de autorizados > perfil salvo NA CONTA (Firestore,
  // vale em qualquer aparelho) > perfil salvo neste aparelho (cache) > vendedora.
  if (GESTOR_EMAILS.includes(e)) return 'gestor';
  return profile?.role ?? storedRole(e) ?? 'balconista';
}

function affiliateTypeFor(email: string, profile: ElevaProfile | null): AffiliateType | undefined {
  const fromProfile = profile?.affiliateType;
  if (fromProfile === 'geral' || fromProfile === 'saude') return fromProfile;
  return storedAffiliateType(email) ?? undefined;
}

// Por enquanto só a Meraki está ativa — todo mundo vê a Meraki.
const DEFAULT_BRANDS: BrandId[] = ['meraki'];

function toUser(fb: AuthUser, profile: ElevaProfile | null): User {
  const email = fb.email || '';
  const role = roleFor(email, profile);
  return {
    name: profile?.name || fb.displayName || (email ? email.split('@')[0] : 'Você'),
    email,
    role,
    brands: DEFAULT_BRANDS,
    segment: profile?.segment || mySegment(),
    affiliateType: role === 'afiliado' ? (affiliateTypeFor(email, profile) ?? 'geral') : undefined,
  };
}

interface Ctx {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Enquanto o Firebase resolve a sessão, mostramos um carregando (evita piscar o login).
  const [loading, setLoading] = useState<boolean>(firebaseEnabled);

  useEffect(() => {
    // Atalho SÓ de desenvolvimento (vite dev): permite simular um usuário via
    // localStorage 'wp_dev_user' p/ testar papéis sem Firebase. No build de
    // produção import.meta.env.DEV é false e este bloco nem existe.
    if (import.meta.env.DEV) {
      try {
        const raw = localStorage.getItem('wp_dev_user');
        if (raw) {
          setUser(JSON.parse(raw) as User);
          setLoading(false);
          return;
        }
      } catch { /* ignore */ }
    }
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }
    const unsub = onAuthChange(async (fb) => {
      if (!fb) {
        setUser(null);
        setLoading(false);
        return;
      }
      // Busca o perfil NA CONTA (Firestore). Espera até 3.5s; se demorar (rede ruim),
      // cai pro cache local pra não travar no carregando.
      let profile: ElevaProfile | null = null;
      try {
        profile = await Promise.race([
          getElevaProfile(fb.uid),
          new Promise<null>((r) => setTimeout(() => r(null), 3500)),
        ]);
      } catch { /* ignore */ }
      // Espelha o papel da conta neste aparelho (cache pra próxima abertura).
      if (profile && fb.email) setStoredRole(fb.email, profile.role, profile.affiliateType);
      setUser(toUser(fb, profile));
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = () => {
    fbSignOut();
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, logout }}>{children}</AuthCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): Ctx {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}
