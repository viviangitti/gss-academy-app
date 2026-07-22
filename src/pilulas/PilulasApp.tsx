import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, ChevronDown, Check, LayoutDashboard } from 'lucide-react';
import Hoje from './Hoje';
import AssistenteBalcao from './AssistenteBalcao';
import Catalog from './Catalog';
import Product from './Product';
import Ranking from './Ranking';
import Ofertas from './Ofertas';
import Missoes from './Missoes';
import Trilha from './Trilha';
import Sobre from './Sobre';
import Gestor from './Gestor';
import Login from './Login';
import Landing from './Landing';
import Onboarding from './Onboarding';
import BottomNav from './BottomNav';
import { BrandProvider, useBrand } from './BrandContext';
import { AuthProvider, useAuth, audienceOf } from './AuthContext';
import Perfil from './Perfil';
import Ficha from './Ficha';
import Venda from './Venda';
import { stageSegmentFromUrl } from './data/segments';
import { stageBrandFromUrl, invitedBrand } from './data/brandInvite';
import { isBalcao, type BrandId } from './data/brands';
import { setStatsMeta } from './data/statsSync';
import { loadAudienceReels } from './data/audienceVideos';
import { prepararVideo, videoDoProduto } from './data/videoGesture';
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
  const navigate = useNavigate();
  // Trocar de marca muda TUDO (catálogo, time, metas). Ficar na mesma tela — um
  // produto da Meraki, por exemplo — não faz sentido depois de virar Sorocaps:
  // volta pra tela inicial. 'replace' pra que o voltar não caia na marca antiga.
  const trocar = (id: BrandId) => {
    setOpen(false);
    if (id === brandId) return;
    setBrand(id);
    navigate('/eleva', { replace: true });
  };
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
                onClick={() => trocar(b.id)}
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

// Modo balcão (farmácia): sem postar, ranking, ofertas nem registrar venda —
// o foco é preparar o atendimento (catálogo + objeções + formação).
function BlockBalcao({ children }: { children: React.ReactElement }) {
  const { brandId } = useBrand();
  return isBalcao(brandId) ? <Navigate to="/eleva" replace /> : children;
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const onProduct = location.pathname.includes('/produto/');
  const { user } = useAuth();
  // Voltar = volta pra tela de onde a pessoa veio (Hoje, busca, catálogo, painel).
  // Se caiu direto no produto (link/QR, sem histórico), cai no catálogo.
  // Guarda contra voltar DUAS telas: o toque dispara 'pointerdown' e, logo
  // depois, o 'click' — e os dois chamam goBack.
  const ultimoVoltar = useRef(0);
  const goBack = () => {
    const agora = Date.now();
    if (agora - ultimoVoltar.current < 700) return;
    ultimoVoltar.current = agora;
    if (window.history.length > 1) navigate(-1);
    else navigate('/eleva/catalogo');
  };
  // Dispara no TOQUE, não no clique. Com vídeo tocando o iOS às vezes engolia o
  // 'click' (a camada do vídeo fica por cima na hora de decidir quem recebeu o
  // toque) e o botão parecia travado. 'pointerdown' chega antes disso.
  const voltarNoToque = (e: React.PointerEvent) => { e.preventDefault(); goBack(); };
  return (
    <header className="wp-header">
      <div className="wp-header-inner">
        {onProduct && (
          <button type="button" onPointerDown={voltarNoToque} onClick={goBack} className="wp-back" aria-label="Voltar"><ArrowLeft size={20} className="wp-ico" /></button>
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
  // Vitrine pública. Quem já entrou alguma vez neste aparelho pula direto pro
  // login — a landing é pra quem está chegando, não pra quem usa todo dia.
  const [mostrarLanding, setMostrarLanding] = useState<boolean>(() => {
    try { return !localStorage.getItem('wp_ja_entrou'); } catch { return true; }
  });
  // Marca/papel/nome viajam junto com os stats que vão pro Sistema de Gestão
  useEffect(() => {
    setStatsMeta({ brand: brand.id, role: user?.role, name: user?.name });
  }, [brand.id, user?.role, user?.name]);
  // Puxa da nuvem os vídeos que o gestor configurou por público — é o que faz o
  // link chegar no celular do time, e não só no aparelho de quem cadastrou.
  useEffect(() => {
    if (!user) return;
    loadAudienceReels();
    // Entrou uma vez neste aparelho: nas próximas, abre direto no login/app.
    try { localStorage.setItem('wp_ja_entrou', '1'); } catch { /* ignore */ }
  }, [user]);
  // O vídeo da pílula precisa começar AQUI, no toque que abre o produto: é o
  // único momento em que o navegador libera áudio. Um ouvinte só, no app
  // inteiro, cobre todos os cards (catálogo, pílula do dia, trilha, busca) sem
  // ter que mexer em cada um deles.
  useEffect(() => {
    if (!user) return;
    const aoTocar = (e: PointerEvent) => {
      const alvo = e.target as HTMLElement | null;
      const card = alvo?.closest?.('a[href*="/eleva/produto/"], [data-produto]') as HTMLElement | null;
      if (!card) return;
      const id = card.dataset.produto
        || card.getAttribute('href')?.split('/eleva/produto/')[1]?.split(/[?#]/)[0];
      if (!id) return;
      const url = videoDoProduto(id, audienceOf(user));
      if (url) prepararVideo(url);
    };
    // Fase de captura: garante que a gente chega antes de qualquer handler que
    // possa parar a propagação do evento.
    document.addEventListener('pointerdown', aoTocar, true);
    return () => document.removeEventListener('pointerdown', aoTocar, true);
  }, [user]);

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
    // Quem chega por link de convite (?marca=) já foi convidado por alguém —
    // vitrine não faz sentido: vai direto pro cadastro.
    // Fora do .wp-app de propósito: o app tem largura de celular (480px) e a
    // vitrine precisa da tela inteira no computador.
    if (mostrarLanding && !invitedBrand()) {
      return <Landing onEntrar={() => setMostrarLanding(false)} />;
    }
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
          <Route path="/eleva/missoes" element={<BlockBalcao><Missoes /></BlockBalcao>} />
          <Route path="/eleva/trilha" element={<Trilha />} />
          <Route path="/eleva/sobre" element={<Sobre />} />
          <Route path="/eleva/perfil" element={<Perfil />} />
          <Route path="/eleva/assistente" element={<AssistenteBalcao />} />
          <Route path="/eleva/ficha/:id" element={<Ficha />} />
          <Route path="/eleva/venda" element={<BlockBalcao><BlockAfiliado><Venda /></BlockAfiliado></BlockBalcao>} />
          <Route path="/eleva/ranking" element={<BlockBalcao><Ranking /></BlockBalcao>} />
          <Route path="/eleva/ofertas" element={<BlockBalcao><BlockAfiliado><Ofertas /></BlockAfiliado></BlockBalcao>} />
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
  stageBrandFromUrl();
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
