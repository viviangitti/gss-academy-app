import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { BrandId } from './data/brands';
import { mySegment, type SegmentId } from './data/segments';
import { invitedBrand } from './data/brandInvite';
import { onAuthChange, signOut as fbSignOut, type AuthUser } from '../services/auth';
import { setStatsAccount } from './data/tracking';
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

// PAPÉIS DEFINIDOS PELA MARCA — mandam mais que o que a pessoa escolheu no
// cadastro. Serve pra dois casos:
//   1) gestor: só quem está aqui vê o Painel e os campos de vídeo;
//   2) corrigir/definir o papel de quem já se cadastrou (ex.: entrou como
//      balconista antes de o papel "afiliado" existir).
//
// ATENÇÃO: pra GESTOR, o e-mail também precisa entrar em isGestor() no
// firestore.eleva.rules — senão a pessoa vê os campos mas a nuvem recusa a
// escrita, e ela acha que salvou.
const ROLE_OVERRIDES: Record<string, { role: Role; affiliateType?: AffiliateType; brands?: BrandId[] }> = {
  // Vivian: gestora das DUAS marcas — troca no seletor do topo.
  'maria26@gmail.com': { role: 'gestor', brands: ['meraki', 'dsp'] },
  'viviangitti23@gmail.com': { role: 'gestor', brands: ['meraki', 'dsp'] },
  // Silene: Gmail é a conta de GESTORA (as duas marcas); Hotmail é a de AFILIADA.
  // ATENÇÃO: a conta real dela é "mendesdesouza" (sem "angelo"). O endereço com
  // "angelo" fica aqui só por segurança, caso ela use os dois.
  'silene.mendesdesouza@gmail.com': { role: 'gestor', brands: ['meraki', 'dsp'] },
  'silene.mendesangelodesouza@gmail.com': { role: 'gestor', brands: ['meraki', 'dsp'] },
  'silene_mendes@hotmail.com': { role: 'afiliado', affiliateType: 'geral' },
};

function overrideFor(email: string) {
  return ROLE_OVERRIDES[email.trim().toLowerCase()];
}

function roleFor(email: string, profile: ElevaProfile | null): Role {
  const e = email.trim().toLowerCase();
  // Prioridade: papel definido pela marca > perfil salvo NA CONTA (Firestore,
  // vale em qualquer aparelho) > perfil salvo neste aparelho (cache) > balconista.
  const ov = overrideFor(e);
  if (ov) return ov.role;
  return profile?.role ?? storedRole(e) ?? 'balconista';
}

function affiliateTypeFor(email: string, profile: ElevaProfile | null): AffiliateType | undefined {
  // O que a marca definiu manda — inclusive sobre o que a pessoa escolheu no
  // cadastro (ex.: entrou como balconista antes de o papel afiliado existir).
  const ov = overrideFor(email);
  if (ov?.affiliateType) return ov.affiliateType;
  const fromProfile = profile?.affiliateType;
  if (fromProfile === 'geral' || fromProfile === 'saude') return fromProfile;
  return storedAffiliateType(email) ?? undefined;
}

const DEFAULT_BRANDS: BrandId[] = ['meraki'];

// De qual marca a pessoa faz parte: definido pela marca (override) > perfil na
// conta (Firestore) > convite por link (?marca=dsp) > Meraki.
function brandsFor(email: string, profile: ElevaProfile | null): BrandId[] {
  const ov = overrideFor(email);
  if (ov?.brands?.length) return ov.brands;
  if (profile?.brands?.length) return profile.brands;
  const inv = invitedBrand();
  if (inv) return [inv];
  return DEFAULT_BRANDS;
}

function toUser(fb: AuthUser, profile: ElevaProfile | null): User {
  const email = fb.email || '';
  const role = roleFor(email, profile);
  return {
    name: profile?.name || fb.displayName || (email ? email.split('@')[0] : 'Você'),
    email,
    role,
    brands: brandsFor(email, profile),
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
          const u = JSON.parse(raw) as User;
          setStatsAccount(u.email || null);
          setUser(u);
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
        setStatsAccount(null);
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
      // ANTES do setUser: as telas leem os pontos já no primeiro render, e
      // precisam ler os da conta certa.
      setStatsAccount(fb.email || fb.uid);
      setUser(toUser(fb, profile));
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = () => {
    fbSignOut();
    setStatsAccount(null);
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
