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
import Privacidade from './Privacidade';
import Noticias from './Noticias';
import Documentos from './Documentos';
import Acessorio from './Acessorio';
import FormArgumentos from './FormArgumentos';
import Landing from './Landing';
import Onboarding from './Onboarding';
import BottomNav from './BottomNav';
import AvisosApp from './AvisosApp';
import { carregarPrecos } from './data/precosAcessorios';
import { BrandProvider, useBrand } from './BrandContext';
import { AuthProvider, useAuth, audienceOf } from './AuthContext';
import Perfil from './Perfil';
import Ficha from './Ficha';
import { stageSegmentFromUrl } from './data/segments';
import { stageBrandFromUrl, invitedBrand } from './data/brandInvite';
import { isAuto, isBalcao, type BrandId } from './data/brands';
import { setStatsMeta, podaEventos } from './data/statsSync';
import { getElevaProfile } from './data/profile';
import { auth } from '../services/firebase';
import { loadAudienceReels } from './data/audienceVideos';
import { prepararVideo, videoDoProduto } from './data/videoGesture';
import './pilulas.css';
import { carregarProdutosNuvem } from './data/produtosNuvem';
import { carregarIndiceVideos } from './data/videosNuvem';
import { avisarMudanca } from './data/store';

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

/**
 * Fecha para a concessionária o que é conteúdo de creator de farmácia.
 *
 * O menu do automotivo já não mostrava "Postar" — quem posta pela loja é o
 * marketing, não o vendedor. Só que esconder o botão não fecha a porta: a rota
 * continuava abrindo por URL, e lá dentro estão o calendário e as tendências
 * de conteúdo, que são "de fábrica" (sem marca) e escritos para revenda de
 * farmácia. Um vendedor da Ramasa que caísse ali veria pauta de Instagram de
 * suplemento dentro do app da Jaecoo.
 */
function BlockAuto({ children }: { children: React.ReactElement }) {
  const { brandId } = useBrand();
  return isAuto(brandId) ? <Navigate to="/eleva" replace /> : children;
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const onProduct = location.pathname.includes('/produto/');
  const { user } = useAuth();
  // Voltar = volta pra tela de onde a pessoa veio DENTRO do app (Hoje, busca,
  // catálogo, painel).
  //
  // Antes isso era window.history.back(). O problema: history.length conta o
  // histórico da ABA INTEIRA, incluindo páginas de antes do Eleva. Quem abria o
  // produto por link, ou recarregava a página, tinha length > 1 sem ter tela
  // nenhuma do app pra trás — e o "voltar" ou saía do app ou não fazia nada.
  // Era o "clico e não vai" que voltou pela terceira vez.
  //
  // Agora o app guarda ele mesmo a última tela visitada. Nunca depende do
  // histórico do navegador, e sempre muda de tela.
  const telaAnterior = useRef<string | null>(null);
  const telaAtual = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname === telaAtual.current) return;
    // De produto pra produto não conta: voltar tem que sair da pílula.
    if (!telaAtual.current.includes('/produto/')) telaAnterior.current = telaAtual.current;
    telaAtual.current = location.pathname;
  }, [location.pathname]);

  // Guarda contra voltar DUAS telas: o toque dispara 'pointerdown' e, logo
  // depois, o 'click' — e os dois chamam goBack.
  const ultimoVoltar = useRef(0);
  const goBack = () => {
    const agora = Date.now();
    if (agora - ultimoVoltar.current < 700) return;
    ultimoVoltar.current = agora;
    const anterior = telaAnterior.current;
    // Sem tela anterior (link direto, QR, recarregou): cai no lugar onde este
    // conteúdo mora — painel pra quem é gestor, catálogo pro resto.
    const padrao = user?.role === 'gestor' ? '/eleva/gestor' : '/eleva/catalogo';
    navigate(anterior && !anterior.includes('/produto/') ? anterior : padrao);
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
  const navigate = useNavigate();
  const onProduct = location.pathname.includes('/produto/');
  const { brand, brandId } = useBrand();

  // O PREÇO CORRIGIDO VALE PRO APP INTEIRO, não só pro Painel.
  //
  // O Lucas corrigiu o estribo e a Vivian continuou vendo o preço velho: a
  // busca dos preços na nuvem só existia dentro do Painel, então quem abria a
  // tela do acessório sem passar por lá ficava com o número do catálogo pra
  // sempre. Correção que não chega na ponta é correção que não aconteceu.
  useEffect(() => { carregarPrecos(brandId); }, [brandId]);
  const { user, loading } = useAuth();
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    try { return !!localStorage.getItem('wp_onboarded'); } catch { return true; }
  });
  // Um endereço só: gsseleva.com.br. Clicar em "Entrar" troca a vitrine pela
  // tela de login SEM mudar o endereço na barra do navegador.
  const [verLogin, setVerLogin] = useState(false);
  // Marca/papel/nome viajam junto com os stats que vão pro Sistema de Gestão
  useEffect(() => {
    setStatsMeta({ brand: brand.id, role: user?.role, cargo: user?.cargo, name: user?.name });
    // "Cartão pronto" = tem WhatsApp preenchido. É o que o material do cliente
    // precisa pra sair com o contato certo, e o que a gerência precisa saber
    // pra cobrar quem ainda não fez.
    const uid = auth?.currentUser?.uid;
    if (uid) getElevaProfile(uid).then((pf) => setStatsMeta({ cartaoPronto: !!pf?.whatsapp?.trim() })).catch(() => {});
    // `cargo` PRECISA estar aqui: ele chega junto com o perfil, que às vezes
    // carrega depois deste efeito rodar. Sem a dependência, o cargo nunca era
    // gravado nos stats dessas pessoas e o Painel voltava a mostrar o papel
    // genérico — exatamente o problema que a gerência apontou.
  }, [brand.id, user?.role, user?.cargo, user?.name]);
  // Puxa da nuvem os vídeos que o gestor configurou por público — é o que faz o
  // link chegar no celular do time, e não só no aparelho de quem cadastrou.
  useEffect(() => {
    if (!user) return;
    loadAudienceReels();
  }, [user]);
  // E os carros/acessórios que a gerência cadastrou. Sem isto, o cadastro fica
  // no aparelho de quem cadastrou e o time nunca vê — que era o caso até aqui.
  useEffect(() => {
    if (!user) return;
    carregarProdutosNuvem(brand.id, avisarMudanca);
    // E o índice de vídeos: sem ele o app não sabe que existe vídeo na nuvem e
    // cai no storyboard, como se nada tivesse sido gravado.
    carregarIndiceVideos().then(avisarMudanca).catch(() => {});
    // O histórico de ações só cresce (arrayUnion não remove). Sem esta poda,
    // um dia o doc bate no limite de 1 MB e TODO o sync passa a falhar calado.
    podaEventos();
  }, [user, brand.id]);
  // Depois de entrar, cai na HOME — não na tela em que o navegador tinha
  // parado da última vez (era isso que fazia o login abrir direto no Perfil).
  // Exceção: link de produto compartilhado no WhatsApp, que a pessoa abriu de
  // propósito e deve continuar valendo depois do login.
  // Só vale quando a pessoa passou PELA TELA DE LOGIN agora. Recarregar a
  // página com a sessão já aberta não pode tirar ninguém de onde estava.
  const veioDoLogin = useRef(false);
  useEffect(() => {
    if (!user || !veioDoLogin.current) return;
    veioDoLogin.current = false;
    if (!location.pathname.startsWith('/eleva/produto/')) navigate('/eleva', { replace: true });
    // location.pathname é lido no momento do login, de propósito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // A VITRINE por endereço fixo. gsseleva.com.br já mostra a vitrine pra quem
  // não está logado, mas quem USA o app fica logado e cairia direto no app —
  // sem isso a Vivian não conseguiria abrir a própria vitrine numa reunião.
  // É também o link pra mandar pra uma marca interessada.
  if (location.pathname.startsWith('/argumentos') || location.pathname.startsWith('/eleva/argumentos')) {
    return <FormArgumentos />;
  }

  if (location.pathname.startsWith('/eleva/vitrine')) {
    return <Landing onEntrar={() => navigate('/eleva', { replace: true })} />;
  }

  if (!user) {
    // A política de privacidade tem que abrir SEM login: o link dela fica no
    // rodapé da tela de entrada e na caixa de aceite do cadastro — quem ainda
    // não tem conta é justamente quem precisa lê-la antes de aceitar.
    // O FORMULÁRIO ABERTO tem que abrir SEM login — é um link de WhatsApp pra
    // quem ainda nem tem conta. Vale nos dois endereços: o curto, que é o que a
    // gerência manda, e o de dentro do app.
    if (location.pathname.startsWith('/argumentos') || location.pathname.startsWith('/eleva/argumentos')) {
      return <FormArgumentos />;
    }
    if (location.pathname.startsWith('/eleva/privacidade')) {
      return (
        <div className="wp-app" style={themeStyle}>
          <Privacidade />
        </div>
      );
    }
    // Quem NÃO está logado vê a vitrine — é a porta de entrada do gsseleva.com.br,
    // como em qualquer site. Duas exceções vão direto pro login/cadastro:
    // quem chegou por link de convite (?marca=), que já foi convidado por alguém,
    // e quem salvou /eleva/entrar nos favoritos. O botão "Entrar" da vitrine
    // não muda o endereço: troca a tela ali mesmo, em gsseleva.com.br.
    // Fora do .wp-app de propósito: o app tem largura de celular (480px) e a
    // vitrine precisa da tela inteira no computador.
    if (!verLogin && !invitedBrand() && !location.pathname.startsWith('/eleva/entrar')) {
      return <Landing onEntrar={() => setVerLogin(true)} />;
    }
    veioDoLogin.current = true; // entrou pela tela de login: ao logar, vai pra home
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
        <Onboarding auto={isAuto(brand.id)} onFinish={() => { try { localStorage.setItem('wp_onboarded', '1'); } catch { /* ignore */ } setOnboarded(true); }} />
      )}
      <Header />
      <main className="wp-main">
        <Routes>
          {/* Gestor entra direto no painel (o trabalho dele é colocar conteúdo);
              a vendedora abre no "Hoje" (consumir, postar e compartilhar). */}
          <Route path="/eleva" element={user.role === 'gestor' ? <Navigate to="/eleva/gestor" replace /> : <Hoje />} />
          <Route path="/eleva/catalogo" element={<Catalog />} />
          <Route path="/eleva/produto/:id" element={<Product />} />
          <Route path="/eleva/missoes" element={<BlockBalcao><BlockAuto><Missoes /></BlockAuto></BlockBalcao>} />
          <Route path="/eleva/trilha" element={<Trilha />} />
          <Route path="/eleva/sobre" element={<Sobre />} />
          <Route path="/eleva/perfil" element={<Perfil />} />
          <Route path="/eleva/assistente" element={<AssistenteBalcao />} />
          <Route path="/eleva/ficha/:id" element={<Ficha />} />
          <Route path="/eleva/ranking" element={<BlockBalcao><Ranking /></BlockBalcao>} />
          <Route path="/eleva/ofertas" element={<BlockBalcao><BlockAfiliado><Ofertas /></BlockAfiliado></BlockBalcao>} />
          <Route path="/eleva/gestor" element={<RequireGestor><Gestor /></RequireGestor>} />
          <Route path="/eleva/privacidade" element={<Privacidade />} />
          <Route path="/eleva/noticias" element={<Noticias />} />
          <Route path="/eleva/documentos" element={<Documentos />} />
          <Route path="/eleva/acessorio/:id" element={<Acessorio />} />
          <Route path="/pilulas/*" element={<Navigate to="/eleva" replace />} />
          {/* Link antigo ou telas que saíram do ar (ex.: /eleva/venda) caem na
              home em vez de deixar a tela vazia. */}
          <Route path="*" element={<Navigate to="/eleva" replace />} />
        </Routes>
      </main>
      <AvisosApp />
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
