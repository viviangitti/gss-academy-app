import { useNavigate } from 'react-router-dom';
import { Shield, FileText, BookOpen, CheckSquare, Newspaper, Zap } from 'lucide-react';
import { loadData, KEYS } from '../services/storage';
import { SEGMENTS } from '../types';
import type { UserProfile } from '../types';
import './Content.css';

const MENU_ITEMS = [
  { path: '/objecoes', icon: Shield, label: 'Objeções', desc: 'Respostas prontas para cada objeção', color: '#ef4444' },
  { path: '/scripts', icon: FileText, label: 'Scripts', desc: 'Templates de abordagem e follow-up', color: '#3b82f6' },
  { path: '/tecnicas', icon: BookOpen, label: 'Técnicas', desc: 'SPIN, BANT, Challenger e mais', color: '#8b5cf6' },
  { path: '/checklists', icon: CheckSquare, label: 'Checklists', desc: 'Rituais e preparação de reuniões', color: '#22c55e' },
  { path: '/noticias', icon: Newspaper, label: 'Notícias', desc: 'Novidades do seu mercado', color: '#f59e0b' },
  { path: '/pre-reuniao', icon: Zap, label: 'Pré-reunião', desc: 'Prepare-se em 2 minutos', color: '#c9a84c' },
];

export default function Content() {
  const navigate = useNavigate();
  const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
  const segmentLabel = profile.segment ? SEGMENTS.find(s => s.value === profile.segment)?.label : '';

  return (
    <div className="content-page">
      {segmentLabel && (
        <div className="content-segment">
          Conteúdo personalizado para: <strong>{segmentLabel}</strong>
        </div>
      )}

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
