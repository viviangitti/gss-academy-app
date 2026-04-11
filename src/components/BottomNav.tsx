import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, BookOpen, MessageCircle, User } from 'lucide-react';
import './BottomNav.css';

const CONTENT_PATHS = ['/conteudo', '/objecoes', '/scripts', '/tecnicas', '/checklists', '/noticias', '/pre-reuniao'];

const tabs = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/calendario', icon: CalendarDays, label: 'Agenda' },
  { path: '/conteudo', icon: BookOpen, label: 'Conteúdo' },
  { path: '/ia-coach', icon: MessageCircle, label: 'IA Coach' },
  { path: '/perfil', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {tabs.map(({ path, icon: Icon, label }) => {
        const isActive = path === '/conteudo'
          ? CONTENT_PATHS.includes(location.pathname)
          : location.pathname === path;
        return (
          <button
            key={path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
