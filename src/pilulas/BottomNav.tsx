import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Sparkles, Tag, LayoutDashboard, Eye, GraduationCap, MessageCircleQuestion, Newspaper, FolderOpen } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';
import { isBalcao, isAuto } from './data/brands';

// Abas por papel: a vendedora consome/posta/compartilha; o gestor só coloca conteúdo
// (Painel) e pode espiar como o time vê (Ver app).
const VENDEDORA_TABS = [
  { to: '/eleva', label: 'Hoje', icon: Home, end: true },
  { to: '/eleva/catalogo', label: 'Catálogo', icon: BookOpen, end: false },
  { to: '/eleva/assistente', label: 'Tira-dúvida', icon: MessageCircleQuestion, end: false },
  { to: '/eleva/missoes', label: 'Postar', icon: Sparkles, end: false },
  { to: '/eleva/ofertas', label: 'Ofertas', icon: Tag, end: false },
];

const GESTOR_TABS = [
  { to: '/eleva/gestor', label: 'Painel', icon: LayoutDashboard, end: false },
  { to: '/eleva/catalogo', label: 'Ver como time', icon: Eye, end: false },
  { to: '/eleva/assistente', label: 'Tira-dúvida', icon: MessageCircleQuestion, end: false },
];

// Gestor numa marca de balcão (Sorocaps): também pode abrir o Tira-dúvida da
// marca que gerencia, pra testar/conferir a IA.
const GESTOR_BALCAO_TABS = [
  { to: '/eleva/gestor', label: 'Painel', icon: LayoutDashboard, end: false },
  { to: '/eleva/catalogo', label: 'Ver como time', icon: Eye, end: false },
  { to: '/eleva/assistente', label: 'Tira-dúvida', icon: MessageCircleQuestion, end: false },
];

// Afiliado: tem tudo, MENOS Ofertas (preço/promoção é assunto de quem vende na
// farmácia). Ele posta, mas no Ranking dele só conta a Formação (ver Missoes).
const AFILIADO_TABS = [
  { to: '/eleva', label: 'Hoje', icon: Home, end: true },
  { to: '/eleva/catalogo', label: 'Catálogo', icon: BookOpen, end: false },
  { to: '/eleva/assistente', label: 'Tira-dúvida', icon: MessageCircleQuestion, end: false },
  { to: '/eleva/missoes', label: 'Postar', icon: Sparkles, end: false },
  { to: '/eleva/trilha', label: 'Formação', icon: GraduationCap, end: false },
];

// Vertical AUTOMOTIVO (showroom): o vendedor precisa do carro, da condição
// comercial vigente e da notícia do dia — cliente chega tendo lido matéria.
// Sem "Postar": quem posta pela concessionária é o marketing, não o vendedor.
const AUTO_TABS = [
  { to: '/eleva', label: 'Hoje', icon: Home, end: true },
  { to: '/eleva/catalogo', label: 'Carros', icon: BookOpen, end: false },
  { to: '/eleva/ofertas', label: 'Condições', icon: Tag, end: false },
  { to: '/eleva/noticias', label: 'Notícias', icon: Newspaper, end: false },
  { to: '/eleva/documentos', label: 'Documentos', icon: FolderOpen, end: false },
  { to: '/eleva/assistente', label: 'Tira-dúvida', icon: MessageCircleQuestion, end: false },
];

// Gestor numa marca automotiva: painel + espiar como o time vê + notícias.
// 'Condições' está aqui porque quem PUBLICA a tabela precisa conferir como ela
// chegou no celular do vendedor — abrir, dar zoom, ver se o número está legível.
// Sem essa aba, a gerência subia o print e nunca via o resultado.
const GESTOR_AUTO_TABS = [
  { to: '/eleva/gestor', label: 'Painel', icon: LayoutDashboard, end: false },
  { to: '/eleva/catalogo', label: 'Ver como time', icon: Eye, end: false },
  { to: '/eleva/ofertas', label: 'Condições', icon: Tag, end: false },
  { to: '/eleva/noticias', label: 'Notícias', icon: Newspaper, end: false },
  { to: '/eleva/documentos', label: 'Documentos', icon: FolderOpen, end: false },
  { to: '/eleva/assistente', label: 'Tira-dúvida', icon: MessageCircleQuestion, end: false },
];

// Modo balcão (farmácia): o foco é preparar o atendimento. Sem postar, ranking
// nem ofertas — só assistir os produtos, as objeções e a formação.
const BALCAO_TABS = [
  { to: '/eleva', label: 'Hoje', icon: Home, end: true },
  { to: '/eleva/catalogo', label: 'Catálogo', icon: BookOpen, end: false },
  { to: '/eleva/assistente', label: 'Tira-dúvida', icon: MessageCircleQuestion, end: false },
  { to: '/eleva/trilha', label: 'Formação', icon: GraduationCap, end: false },
];

export default function BottomNav() {
  const { user } = useAuth();
  const { brandId } = useBrand();
  const balcao = isBalcao(brandId);
  const auto = isAuto(brandId);
  const tabs =
    auto ? (user?.role === 'gestor' ? GESTOR_AUTO_TABS : AUTO_TABS) :
    user?.role === 'gestor' ? (balcao ? GESTOR_BALCAO_TABS : GESTOR_TABS) :
    balcao ? BALCAO_TABS : // farmácia: enxuto, independe do papel
    user?.role === 'afiliado' ? AFILIADO_TABS :
    VENDEDORA_TABS; // balconista e promotor (revenda): tudo
  return (
    <nav className={`wp-nav ${tabs.length >= 6 ? 'wp-nav--6' : ''}`}>
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className="wp-nav-item">
          <t.icon size={20} />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
