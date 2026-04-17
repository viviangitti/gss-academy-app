import { useNavigate } from 'react-router-dom';
import { Swords, Zap } from 'lucide-react';
import './Content.css';

const MENU_ITEMS = [
  { path: '/pre-reuniao', icon: Zap, label: 'Pré-reunião', desc: 'Prepare-se em 2 minutos antes de cada encontro', color: '#c9a84c' },
  { path: '/treino', icon: Swords, label: 'Simulador', desc: 'Treine objeções com um cliente virtual', color: '#8b5cf6' },
];

export default function TrainingHub() {
  const navigate = useNavigate();

  return (
    <div className="content-page">
      <div className="content-grid">
        {MENU_ITEMS.map(item => (
          <button key={item.path} className="content-item card" onClick={() => navigate(item.path)}>
            <div className="content-icon" style={{ background: `${item.color}15`, color: item.color }}>
              <item.icon size={22} />
            </div>
            <h4>{item.label}</h4>
            <p>{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
