import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckSquare, MessageCircle, TrendingUp, Clock, Target } from 'lucide-react';
import { loadData, KEYS } from '../services/storage';
import type { CalendarEvent } from '../types';
import './Home.css';

const TIPS = [
  'Comece cada dia revisando suas 3 metas principais de vendas.',
  'Escute mais do que fala. O cliente que fala, compra.',
  'Faça follow-up em até 24h. Velocidade fecha negócios.',
  'Prepare pelo menos 3 respostas para cada objeção comum.',
  'Rituais diários criam consistência. Consistência gera resultados.',
  'Pergunte "O que te impede de fechar hoje?" para acelerar decisões.',
  'Comemore cada pequena vitória com sua equipe.',
  'Revise seus números toda sexta-feira para ajustar a rota.',
];

export default function Home() {
  const navigate = useNavigate();
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const events = loadData<CalendarEvent[]>(KEYS.EVENTS, []);
    const today = new Date().toISOString().split('T')[0];
    setTodayEvents(events.filter(e => e.date === today).sort((a, b) => a.time.localeCompare(b.time)));
  }, []);

  const profile = loadData(KEYS.PROFILE, { name: '' });
  const name = profile.name ? `, ${profile.name.split(' ')[0]}` : '';

  return (
    <div className="home">
      <div className="greeting-card card">
        <h2>{greeting}{name}!</h2>
        <p className="greeting-date">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="tip-card card">
        <div className="tip-icon"><Target size={18} /></div>
        <p className="tip-text">{tip}</p>
      </div>

      {todayEvents.length > 0 && (
        <div className="today-events">
          <h3 className="section-title"><Clock size={16} /> Hoje na Agenda</h3>
          {todayEvents.slice(0, 3).map(event => (
            <div key={event.id} className="event-mini card" onClick={() => navigate('/calendario')}>
              <span className="event-time">{event.time}</span>
              <span className="event-title">{event.title}</span>
              <span className={`badge badge-${event.category}`}>{event.category}</span>
            </div>
          ))}
        </div>
      )}

      <div className="quick-actions">
        <h3 className="section-title">Acesso Rápido</h3>
        <div className="actions-grid">
          <button className="action-card card" onClick={() => navigate('/calendario')}>
            <CalendarDays size={24} />
            <span>Agenda</span>
          </button>
          <button className="action-card card" onClick={() => navigate('/checklists')}>
            <CheckSquare size={24} />
            <span>Checklists</span>
          </button>
          <button className="action-card card" onClick={() => navigate('/ia-coach')}>
            <MessageCircle size={24} />
            <span>IA Coach</span>
          </button>
          <button className="action-card card" onClick={() => navigate('/ia-coach')}>
            <TrendingUp size={24} />
            <span>Objeções</span>
          </button>
        </div>
      </div>
    </div>
  );
}
