import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, CheckSquare, MessageCircle, User } from 'lucide-react';
import './BottomNav.css';

const tabs = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/calendario', icon: CalendarDays, label: 'Agenda' },
  { path: '/checklists', icon: CheckSquare, label: 'Checklists' },
  { path: '/ia-coach', icon: MessageCircle, label: 'IA Coach' },
  { path: '/perfil', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {tabs.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
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
