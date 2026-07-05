import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BrandId } from './data/brands';

export type Role = 'gestor' | 'vendedora';
export interface User {
  name: string;
  email: string;
  role: Role;
  brands: BrandId[]; // empresas que a pessoa escolheu ver
}

const KEY = 'wp_user';

function initial(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

interface Ctx {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(initial);
  const login = (u: User) => {
    setUser(u);
    try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* ignore */ }
  };
  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  };
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): Ctx {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}
