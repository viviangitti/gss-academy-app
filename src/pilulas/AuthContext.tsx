import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { BrandId } from './data/brands';
import { mySegment, type SegmentId } from './data/segments';
import { onAuthChange, signOut as fbSignOut, type AuthUser } from '../services/auth';
import { firebaseEnabled } from '../services/firebase';
import { storedRole, setStoredRole } from './data/roles';
import { getElevaProfile, type ElevaProfile } from './data/profile';

export type Role = 'gestor' | 'vendedora';
export interface User {
  name: string;
  email: string;
  role: Role;
  brands: BrandId[]; // empresas que a pessoa pode ver
  segment?: SegmentId; // canal de onde veio (etiqueta do link/QR de convite)
}

// GESTORES AUTORIZADOS — controla quem entra no Painel do Gestor. Quem loga com
// um e-mail desta lista vira gestor; qualquer outro entra como vendedora.
// Para adicionar outro gestor, inclua o e-mail aqui (em minúsculo) e publique.
// viviangitti@gmail.com entra como VENDEDORA (a pedido); gestor fica no 23.
const GESTOR_EMAILS = ['viviangitti23@gmail.com'];

function roleFor(email: string, profile: ElevaProfile | null): Role {
  const e = email.trim().toLowerCase();
  // Prioridade: e-mail na lista de autorizados > perfil salvo NA CONTA (Firestore,
  // vale em qualquer aparelho) > perfil salvo neste aparelho (cache) > vendedora.
  if (GESTOR_EMAILS.includes(e)) return 'gestor';
  return profile?.role ?? storedRole(e) ?? 'vendedora';
}

// Por enquanto só a Meraki está ativa — todo mundo vê a Meraki.
const DEFAULT_BRANDS: BrandId[] = ['meraki'];

function toUser(fb: AuthUser, profile: ElevaProfile | null): User {
  const email = fb.email || '';
  return {
    name: profile?.name || fb.displayName || (email ? email.split('@')[0] : 'Você'),
    email,
    role: roleFor(email, profile),
    brands: DEFAULT_BRANDS,
    segment: profile?.segment || mySegment(),
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
      if (profile && fb.email) setStoredRole(fb.email, profile.role);
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
