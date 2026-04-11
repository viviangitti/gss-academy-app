import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Header.css';

const titles: Record<string, string> = {
  '/': 'GSS Academy',
  '/calendario': 'Calendário',
  '/conteudo': 'Conteúdo',
  '/checklists': 'Listas',
  '/objecoes': 'Objeções',
  '/scripts': 'Roteiros',
  '/tecnicas': 'Técnicas',
  '/noticias': 'Notícias',
  '/gatilhos': 'Gatilhos de Urgência',
  '/treino': 'Simulador de Treino',
  '/cronometro': 'Cronômetro',
  '/pre-reuniao': 'Pré-reunião',
  '/ia-coach': 'Pergunte à IA',
  '/perfil': 'Perfil',
};

const SUB_PAGES = ['/objecoes', '/scripts', '/tecnicas', '/checklists', '/noticias', '/gatilhos', '/treino', '/cronometro', '/pre-reuniao'];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = titles[location.pathname] || 'GSS Academy';
  const isHome = location.pathname === '/';
  const isSubPage = SUB_PAGES.includes(location.pathname);

  return (
    <header className="header">
      <div className="header-content">
        {isHome ? (
          <div className="header-brand">
            <div className="header-logo">GSS</div>
            <span className="header-subtitle">Maestria em Vendas</span>
          </div>
        ) : (
          <div className="header-nav">
            {isSubPage && (
              <button className="header-back" onClick={() => navigate('/conteudo')}>
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="header-title">{title}</h1>
          </div>
        )}
      </div>
    </header>
  );
}
