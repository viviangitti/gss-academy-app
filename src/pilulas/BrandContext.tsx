import { createContext, useContext, useState, type ReactNode } from 'react';
import { BRANDS, getBrand, type Brand, type BrandId } from './data/brands';
import { useAuth } from './AuthContext';

const KEY = 'wp_brand';

function stored(): BrandId | null {
  try {
    const v = localStorage.getItem(KEY);
    return v && BRANDS.some((b) => b.id === v) ? (v as BrandId) : null;
  } catch {
    return null;
  }
}

interface Ctx {
  brand: Brand;
  brandId: BrandId;
  setBrand: (id: BrandId) => void;
  brands: Brand[]; // só as empresas que a pessoa escolheu no login
}

const BrandCtx = createContext<Ctx | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // empresas disponíveis = as que a pessoa escolheu (fallback: todas, ex. na tela de login).
  // Guard: se o filtro zerar (ex.: usuário só com marca já desativada), volta pra todas —
  // senão available[0] seria undefined e a UI crasharia.
  const filtered = user?.brands?.length ? BRANDS.filter((b) => user.brands.includes(b.id)) : BRANDS;
  const available = filtered.length ? filtered : BRANDS;

  const [brandId, setBrandId] = useState<BrandId>(() => stored() ?? available[0].id);
  // garante que a marca ativa é uma das disponíveis
  const effectiveId = available.some((b) => b.id === brandId) ? brandId : available[0].id;

  const setBrand = (id: BrandId) => {
    setBrandId(id);
    try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  };

  return (
    <BrandCtx.Provider value={{ brand: getBrand(effectiveId), brandId: effectiveId, setBrand, brands: available }}>
      {children}
    </BrandCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBrand(): Ctx {
  const ctx = useContext(BrandCtx);
  if (!ctx) throw new Error('useBrand fora do BrandProvider');
  return ctx;
}
