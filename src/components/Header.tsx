import { useLocation } from 'react-router-dom';
import './Header.css';

const titles: Record<string, string> = {
  '/': 'GSS Academy',
  '/calendario': 'Calendário',
  '/checklists': 'Checklists',
  '/ia-coach': 'IA Coach',
  '/perfil': 'Perfil',
};

export default function Header() {
  const location = useLocation();
  const title = titles[location.pathname] || 'GSS Academy';
  const isHome = location.pathname === '/';

  return (
    <header className="header">
      <div className="header-content">
        {isHome ? (
          <div className="header-brand">
            <div className="header-logo">GSS</div>
            <span className="header-subtitle">Maestria em Vendas</span>
          </div>
        ) : (
          <h1 className="header-title">{title}</h1>
        )}
      </div>
    </header>
  );
}
