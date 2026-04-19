import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Target, Newspaper, ExternalLink, Star, ArrowRight, Plus, Check, X, Clock, CheckSquare } from 'lucide-react';
import { loadData, KEYS } from '../services/storage';
import { fetchNews } from '../services/news';
import { getFavorites } from '../services/favorites';
import { getDay, setFocus, addMeeting, removeMeeting, addTask, toggleTask, removeTask } from '../services/day';
import { SEGMENTS } from '../types';
import type { UserProfile, NewsItem } from '../types';
import type { Favorite } from '../services/favorites';
import type { DayData } from '../services/day';
import './Home.css';

const TIPS = [
  'Comece cada dia revisando suas 3 metas principais de vendas.',
  'Escute mais do que fala. O cliente que fala, compra.',
  'Faça o acompanhamento em até 24h. Velocidade fecha negócios.',
  'Prepare pelo menos 3 respostas para cada objeção comum.',
  'Rituais diários criam consistência. Consistência gera resultados.',
  'Pergunte "O que te impede de fechar hoje?" para acelerar decisões.',
  'Comemore cada pequena vitória com sua equipe.',
  'Revise seus números toda sexta-feira para ajustar a rota.',
  'Antes de qualquer reunião, use o modo Pré-reunião do app.',
  'Conheça as objeções do seu segmento como a palma da mão.',
];

export default function Home() {
  const navigate = useNavigate();
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [greeting, setGreeting] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [segmentLabel, setSegmentLabel] = useState('');
  const [favs, setFavs] = useState<Favorite[]>([]);
  const [day, setDay] = useState<DayData>({ date: '', focuses: ['', '', ''], meetings: [], tasks: [] });
  const [newMeeting, setNewMeeting] = useState({ time: '', title: '' });
  const [newTask, setNewTask] = useState('');
  const [showNewMeeting, setShowNewMeeting] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
    if (profile.segment) {
      setSegmentLabel(SEGMENTS.find(s => s.value === profile.segment)?.label || '');
      fetchNews(profile.segment).then(items => setNews(items.slice(0, 3)));
    }
    setFavs(getFavorites().sort((a, b) => b.addedAt - a.addedAt).slice(0, 3));
    setDay(getDay());
  }, []);

  const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
  const name = profile.name ? `, ${profile.name.split(' ')[0]}` : '';

  const handleFocusChange = (i: number, value: string) => {
    setDay(setFocus(i, value));
  };

  const handleAddMeeting = () => {
    if (!newMeeting.title.trim() || !newMeeting.time) return;
    setDay(addMeeting(newMeeting));
    setNewMeeting({ time: '', title: '' });
    setShowNewMeeting(false);
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setDay(addTask(newTask.trim()));
    setNewTask('');
  };

  const pendingTasks = day.tasks.filter(t => !t.done).length;
  const totalTasks = day.tasks.length;

  return (
    <div className="home">
      <div className="greeting-card card">
        <h2>{greeting}{name}!</h2>
        <p className="greeting-date">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <button className="premeeting-btn" onClick={() => navigate('/pre-reuniao')}>
        <Zap size={18} />
        <span>Vou entrar numa reunião</span>
      </button>

      {/* 3 Focos do Dia */}
      <div className="day-section">
        <h3 className="section-title"><Target size={16} /> Seus 3 focos de hoje</h3>
        <div className="focuses card">
          {[0, 1, 2].map(i => (
            <div key={i} className="focus-row">
              <span className="focus-num">{i + 1}</span>
              <input
                type="text"
                placeholder={`Foco ${i + 1}...`}
                value={day.focuses[i] || ''}
                onChange={e => handleFocusChange(i, e.target.value)}
                className="focus-input"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reuniões de hoje */}
      <div className="day-section">
        <div className="day-section-header">
          <h3 className="section-title"><Clock size={16} /> Reuniões de hoje</h3>
          <button className="btn btn-outline btn-sm" onClick={() => setShowNewMeeting(!showNewMeeting)}>
            <Plus size={12} /> Nova
          </button>
        </div>

        {showNewMeeting && (
          <div className="new-meeting card">
            <input
              type="time"
              value={newMeeting.time}
              onChange={e => setNewMeeting({ ...newMeeting, time: e.target.value })}
              className="meeting-time-input"
            />
            <input
              type="text"
              placeholder="Cliente / reunião"
              value={newMeeting.title}
              onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
              className="meeting-title-input"
            />
            <button className="btn btn-primary btn-sm" onClick={handleAddMeeting}>
              <Check size={14} />
            </button>
          </div>
        )}

        {day.meetings.length === 0 && !showNewMeeting ? (
          <div className="day-empty">Nenhuma reunião agendada para hoje.</div>
        ) : (
          <div className="meetings-list">
            {day.meetings.map(m => (
              <div key={m.id} className="meeting-item card">
                <span className="meeting-time">{m.time}</span>
                <span className="meeting-title">{m.title}</span>
                <button className="meeting-remove" onClick={() => setDay(removeMeeting(m.id))}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tarefas do dia */}
      <div className="day-section">
        <div className="day-section-header">
          <h3 className="section-title">
            <CheckSquare size={16} /> Tarefas
            {totalTasks > 0 && <span className="task-counter">{totalTasks - pendingTasks}/{totalTasks}</span>}
          </h3>
        </div>

        <div className="tasks-card card">
          {day.tasks.map(t => (
            <div key={t.id} className={`task-row ${t.done ? 'done' : ''}`}>
              <button className="task-check" onClick={() => setDay(toggleTask(t.id))}>
                {t.done && <Check size={12} />}
              </button>
              <span className="task-text">{t.text}</span>
              <button className="task-remove" onClick={() => setDay(removeTask(t.id))}>
                <X size={12} />
              </button>
            </div>
          ))}
          <div className="task-add-row">
            <input
              type="text"
              placeholder="Adicionar tarefa..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              className="task-input"
            />
            <button className="task-add-btn" onClick={handleAddTask} disabled={!newTask.trim()}>
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="tip-card card">
        <div className="tip-icon"><Target size={18} /></div>
        <p className="tip-text">{tip}</p>
      </div>

      {favs.length > 0 && (
        <div className="home-favs">
          <div className="news-section-header">
            <h3 className="section-title"><Star size={16} /> Seus favoritos</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/favoritos')}>Ver todos</button>
          </div>
          {favs.map(f => (
            <button key={`${f.type}-${f.id}`} className="home-fav-item card" onClick={() => {
              const route = f.type === 'objection' ? '/objecoes'
                : f.type === 'script' ? '/scripts'
                : f.type === 'technique' ? '/tecnicas'
                : '/scripts';
              navigate(route);
            }}>
              <span>{f.label}</span>
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
      )}

      {news.length > 0 && (
        <div className="home-news">
          <div className="news-section-header">
            <h3 className="section-title"><Newspaper size={16} /> {segmentLabel}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/noticias')}>Ver mais</button>
          </div>
          {news.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="home-news-item card">
              <h4>{item.title}</h4>
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
