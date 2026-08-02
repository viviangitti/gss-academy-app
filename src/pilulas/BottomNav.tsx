import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Sparkles, Tag, LayoutDashboard, Eye, GraduationCap, MessageCircleQuestion } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';
import { isBalcao } from './data/brands';

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
  const tabs =
    user?.role === 'gestor' ? (balcao ? GESTOR_BALCAO_TABS : GESTOR_TABS) :
    balcao ? BALCAO_TABS : // farmácia: enxuto, independe do papel
    user?.role === 'afiliado' ? AFILIADO_TABS :
    VENDEDORA_TABS; // balconista e promotor (revenda): tudo
  return (
    <nav className="wp-nav">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className="wp-nav-item">
          <t.icon size={20} />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
