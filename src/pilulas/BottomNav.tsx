import { NavLink } from 'react-router-dom';
import { BookOpen, Sparkles, Trophy, Tag } from 'lucide-react';

const TABS = [
  { to: '/eleva', label: 'Catálogo', icon: BookOpen, end: true },
  { to: '/eleva/missoes', label: 'Creators', icon: Sparkles, end: false },
  { to: '/eleva/ranking', label: 'Ranking', icon: Trophy, end: false },
  { to: '/eleva/ofertas', label: 'Ofertas', icon: Tag, end: false },
];

export default function BottomNav() {
  return (
    <nav className="wp-nav">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className="wp-nav-item">
          <t.icon size={20} />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
