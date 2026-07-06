import { useState, type CSSProperties } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, ChevronDown, Check, LayoutDashboard, LogOut, Megaphone, X } from 'lucide-react';
import Catalog from './Catalog';
import Product from './Product';
import Ranking from './Ranking';
import Ofertas from './Ofertas';
import Missoes from './Missoes';
import Gestor from './Gestor';
import Login from './Login';
import Onboarding from './Onboarding';
import BottomNav from './BottomNav';
import { BrandProvider, useBrand } from './BrandContext';
import { AuthProvider, useAuth } from './AuthContext';
import { getRecado, useStore } from './data/store';
import './pilulas.css';

function BrandSwitcher() {
  const { brand, brandId, setBrand, brands } = useBrand();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="wp-brandsw">
      <button className="wp-brandsw-btn" onClick={() => setOpen((o) => !o)}>
        {brand.name}
        <ChevronDown size={14} className="wp-ico" />
      </button>
      {open && (
        <>
          <div className="wp-brandsw-backdrop" onClick={() => setOpen(false)} />
          <div className="wp-brandsw-menu">
            <div className="wp-brandsw-head">Suas marcas</div>
            {brands.map((b) => (
              <button
                key={b.id}
                className={`wp-brandsw-item ${b.id === brandId ? 'active' : ''}`}
                onClick={() => { setBrand(b.id); setOpen(false); }}
              >
                <span className="wp-brandsw-dot" style={{ background: b.accent }} />
                <span className="wp-brandsw-name">{b.name}</span>
                {b.id === brandId && <Check size={15} className="wp-ico" />}
              </button>
            ))}
            <div className="wp-brandsw-user">
              {user?.name} · {user?.role === 'gestor' ? 'Gestor(a)' : 'Vendedora'}
            </div>
            <button className="wp-brandsw-item" onClick={logout}>
              <LogOut size={15} className="wp-ico" />
              <span className="wp-brandsw-name">Sair</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function RequireGestor({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();
  return user?.role === 'gestor' ? children : <Navigate to="/eleva" replace />;
}

function RecadoBanner() {
  useStore();
  const { brand, brandId } = useBrand();
  const [dismissed, setDismissed] = useState<string>(() => {
    try { return localStorage.getItem('wp_recado_seen') || ''; } catch { return ''; }
  });
  const recado = getRecado(brandId);
  if (!recado || dismissed === recado) return null;
  return (
    <div className="wp-recado">
      <Megaphone size={16} className="wp-ico wp-recado-ic" />
      <span className="wp-recado-text"><b>{brand.name}:</b> {recado}</span>
      <button
        className="wp-recado-x"
        aria-label="Fechar recado"
        onClick={() => { try { localStorage.setItem('wp_recado_seen', recado); } catch { /* ignore */ } setDismissed(recado); }}
      ><X size={15} /></button>
    </div>
  );
}

function Header() {
  const location = useLocation();
  const onProduct = location.pathname.includes('/produto/');
  const { user } = useAuth();
  return (
    <header className="wp-header">
      <div className="wp-header-inner">
        {onProduct && (
          <Link to="/eleva" className="wp-back" aria-label="Voltar"><ArrowLeft size={20} className="wp-ico" /></Link>
        )}
        <span className="wp-logo-mark">eleva<ArrowUpRight size={17} strokeWidth={2.5} className="wp-logo-caret" /></span>
        <span className="wp-spacer" />
        {user?.role === 'gestor' && (
          <Link to="/eleva/gestor" className="wp-gear" aria-label="Painel do gestor" title="Painel do gestor">
            <LayoutDashboard size={18} />
          </Link>
        )}
        <BrandSwitcher />
      </div>
    </header>
  );
}

function Shell() {
  const location = useLocation();
  const onProduct = location.pathname.includes('/produto/');
  const { brand } = useBrand();
  const { user, loading } = useAuth();
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    try { return !!localStorage.getItem('wp_onboarded'); } catch { return true; }
  });
  const themeStyle = {
    '--wp-pink': brand.accent,
    '--wp-pink-deep': brand.accentDeep,
    '--wp-gold-light': brand.light,
    '--wp-on-accent': brand.onAccent,
  } as CSSProperties;

  if (loading) {
    return (
      <div className="wp-app" style={themeStyle}>
        <div className="wp-boot"><span className="wp-boot-spinner" /></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wp-app" style={themeStyle}>
        <Login />
      </div>
    );
  }

  const showOnboarding = user.role === 'vendedora' && !onboarded;

  return (
    <div className={`wp-app ${onProduct ? 'is-product' : ''}`} style={themeStyle}>
      {showOnboarding && (
        <Onboarding onFinish={() => { try { localStorage.setItem('wp_onboarded', '1'); } catch { /* ignore */ } setOnboarded(true); }} />
      )}
      <Header />
      {!onProduct && <RecadoBanner />}
      <main className="wp-main">
        <Routes>
          <Route path="/eleva" element={<Catalog />} />
          <Route path="/eleva/produto/:id" element={<Product />} />
          <Route path="/eleva/missoes" element={<Missoes />} />
          <Route path="/eleva/ranking" element={<Ranking />} />
          <Route path="/eleva/ofertas" element={<Ofertas />} />
          <Route path="/eleva/gestor" element={<RequireGestor><Gestor /></RequireGestor>} />
          <Route path="/pilulas/*" element={<Navigate to="/eleva" replace />} />
        </Routes>
      </main>
      {!onProduct && <BottomNav />}
    </div>
  );
}

export default function PilulasApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BrandProvider>
          <Shell />
        </BrandProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
