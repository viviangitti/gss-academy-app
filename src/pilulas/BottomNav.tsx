import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Sparkles, Trophy, Tag, LayoutDashboard, Eye, GraduationCap } from 'lucide-react';
import { useAuth } from './AuthContext';

// Abas por papel: a vendedora consome/posta/compartilha; o gestor só coloca conteúdo
// (Painel) e pode espiar como o time vê (Ver app).
const VENDEDORA_TABS = [
  { to: '/eleva', label: 'Hoje', icon: Home, end: true },
  { to: '/eleva/catalogo', label: 'Catálogo', icon: BookOpen, end: false },
  { to: '/eleva/missoes', label: 'Postar', icon: Sparkles, end: false },
  { to: '/eleva/ranking', label: 'Ranking', icon: Trophy, end: false },
  { to: '/eleva/ofertas', label: 'Ofertas', icon: Tag, end: false },
];

const GESTOR_TABS = [
  { to: '/eleva/gestor', label: 'Painel', icon: LayoutDashboard, end: false },
  { to: '/eleva/catalogo', label: 'Ver como o time', icon: Eye, end: false },
];

// Afiliado: tem tudo, MENOS Ofertas (preço/promoção é assunto de quem vende na
// farmácia). Ele posta, mas no Ranking dele só conta a Formação (ver Missoes).
const AFILIADO_TABS = [
  { to: '/eleva', label: 'Hoje', icon: Home, end: true },
  { to: '/eleva/catalogo', label: 'Catálogo', icon: BookOpen, end: false },
  { to: '/eleva/missoes', label: 'Postar', icon: Sparkles, end: false },
  { to: '/eleva/trilha', label: 'Formação', icon: GraduationCap, end: false },
  { to: '/eleva/ranking', label: 'Ranking', icon: Trophy, end: false },
];

export default function BottomNav() {
  const { user } = useAuth();
  const tabs =
    user?.role === 'gestor' ? GESTOR_TABS :
    user?.role === 'afiliado' ? AFILIADO_TABS :
    VENDEDORA_TABS; // balconista e promotor: tudo
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
