import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthChange, type AuthUser } from '../services/auth';
import { firebaseEnabled } from '../services/firebase';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  firebaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  firebaseEnabled: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }
    const unsub = onAuthChange(u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, firebaseEnabled }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
