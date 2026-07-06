import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { BrandId } from './data/brands';
import { onAuthChange, signOut as fbSignOut, type AuthUser } from '../services/auth';
import { firebaseEnabled } from '../services/firebase';

export type Role = 'gestor' | 'vendedora';
export interface User {
  name: string;
  email: string;
  role: Role;
  brands: BrandId[]; // empresas que a pessoa pode ver
}

// GESTORES AUTORIZADOS — controla quem entra no Painel do Gestor. Quem loga com
// um e-mail desta lista vira gestor; qualquer outro entra como vendedora.
// Para adicionar outro gestor, inclua o e-mail aqui (em minúsculo) e publique.
const GESTOR_EMAILS = ['viviangitti@gmail.com', 'viviangitti23@gmail.com'];

function roleFor(email: string): Role {
  return GESTOR_EMAILS.includes(email.trim().toLowerCase()) ? 'gestor' : 'vendedora';
}

// Por enquanto só a Meraki está ativa — todo mundo vê a Meraki.
const DEFAULT_BRANDS: BrandId[] = ['meraki'];

function toUser(fb: AuthUser): User {
  const email = fb.email || '';
  return {
    name: fb.displayName || (email ? email.split('@')[0] : 'Você'),
    email,
    role: roleFor(email),
    brands: DEFAULT_BRANDS,
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
    const unsub = onAuthChange((fb) => {
      setUser(fb ? toUser(fb) : null);
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
