import { useEffect, useState, type CSSProperties } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, ChevronDown, Check, LayoutDashboard } from 'lucide-react';
import Hoje from './Hoje';
import Catalog from './Catalog';
import Product from './Product';
import Ranking from './Ranking';
import Ofertas from './Ofertas';
import Missoes from './Missoes';
import Trilha from './Trilha';
import Sobre from './Sobre';
import Gestor from './Gestor';
import Login from './Login';
import Onboarding from './Onboarding';
import BottomNav from './BottomNav';
import { BrandProvider, useBrand } from './BrandContext';
import { AuthProvider, useAuth } from './AuthContext';
import Perfil from './Perfil';
import { stageSegmentFromUrl } from './data/segments';
import { setStatsMeta } from './data/statsSync';
import './pilulas.css';

// Iniciais pro avatar do cabeçalho.
function inits(name?: string): string {
  const p = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '?';
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}

function BrandSwitcher() {
  const { brand, brandId, setBrand, brands } = useBrand();
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

// Afiliado tem tudo, menos Ofertas (preço/promoção é de quem vende na farmácia).
function BlockAfiliado({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();
  return user?.role === 'afiliado' ? <Navigate to="/eleva" replace /> : children;
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const onProduct = location.pathname.includes('/produto/');
  const { user } = useAuth();
  // Voltar = volta pra tela de onde a pessoa veio (Hoje, busca, catálogo, painel).
  // Se caiu direto no produto (link/QR, sem histórico), cai no catálogo.
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/eleva/catalogo');
  };
  return (
    <header className="wp-header">
      <div className="wp-header-inner">
        {onProduct && (
          <button type="button" onClick={goBack} className="wp-back" aria-label="Voltar"><ArrowLeft size={20} className="wp-ico" /></button>
        )}
        <span className="wp-logo-mark">eleva<ArrowUpRight size={17} strokeWidth={2.5} className="wp-logo-caret" /></span>
        <span className="wp-spacer" />
        {user?.role === 'gestor' && (
          <Link to="/eleva/gestor" className="wp-gear" aria-label="Painel do gestor" title="Painel do gestor">
            <LayoutDashboard size={18} />
          </Link>
        )}
        <Link to="/eleva/perfil" className="wp-avatar" aria-label="Seu perfil" title="Seu perfil">
          {inits(user?.name)}
        </Link>
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
  // Marca/papel/nome viajam junto com os stats que vão pro Sistema de Gestão
  useEffect(() => {
    setStatsMeta({ brand: brand.id, role: user?.role, name: user?.name });
  }, [brand.id, user?.role, user?.name]);
  // Ao trocar de tela, volta pro topo (senão o produto abria no meio/fim da página).
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
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

  const showOnboarding = user.role !== 'gestor' && !onboarded;

  return (
    <div className={`wp-app ${onProduct ? 'is-product' : ''}`} style={themeStyle}>
      {showOnboarding && (
        <Onboarding onFinish={() => { try { localStorage.setItem('wp_onboarded', '1'); } catch { /* ignore */ } setOnboarded(true); }} />
      )}
      <Header />
      <main className="wp-main">
        <Routes>
          {/* Gestor entra direto no painel (o trabalho dele é colocar conteúdo);
              a vendedora abre no "Hoje" (consumir, postar e compartilhar). */}
          <Route path="/eleva" element={user.role === 'gestor' ? <Navigate to="/eleva/gestor" replace /> : <Hoje />} />
          <Route path="/eleva/catalogo" element={<Catalog />} />
          <Route path="/eleva/produto/:id" element={<Product />} />
          <Route path="/eleva/missoes" element={<Missoes />} />
          <Route path="/eleva/trilha" element={<Trilha />} />
          <Route path="/eleva/sobre" element={<Sobre />} />
          <Route path="/eleva/perfil" element={<Perfil />} />
          <Route path="/eleva/ranking" element={<Ranking />} />
          <Route path="/eleva/ofertas" element={<BlockAfiliado><Ofertas /></BlockAfiliado>} />
          <Route path="/eleva/gestor" element={<RequireGestor><Gestor /></RequireGestor>} />
          <Route path="/pilulas/*" element={<Navigate to="/eleva" replace />} />
        </Routes>
      </main>
      {!onProduct && <BottomNav />}
    </div>
  );
}

export default function PilulasApp() {
  // Se a pessoa chegou por um link/QR de convite (?convite=farmacia), guarda a
  // etiqueta de canal ANTES do login — o cadastro já entra segmentado.
  stageSegmentFromUrl();
  // Identidade própria: a aba do navegador diz "Eleva", não "MAESTR.IA".
  // Só roda na árvore do Eleva (não toca no app de coaching).
  useEffect(() => {
    document.title = 'Eleva — produto que vende na ponta';
  }, []);
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
