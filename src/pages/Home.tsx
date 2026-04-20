import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Target, Newspaper, ExternalLink, Star, ArrowRight, Plus, Check, X, Clock, CheckSquare, TrendingUp, Award, History, Activity } from 'lucide-react';
import { loadData, KEYS } from '../services/storage';
import { fetchNews } from '../services/news';
import { getFavorites } from '../services/favorites';
import { getDay, setFocusText, toggleFocus, removeFocus, addMeeting, removeMeeting, addTask, toggleTask, removeTask } from '../services/day';
import { getStats, addSale, getDailyAccumulation } from '../services/goal';
import { getWeekStats } from '../services/history';
import { markActive, getWelcomeBackMessage } from '../services/notifications';
import type { WeekStats } from '../services/history';
import { SEGMENTS } from '../types';
import type { UserProfile, NewsItem } from '../types';
import type { Favorite } from '../services/favorites';
import type { DayData } from '../services/day';
import type { GoalStats } from '../services/goal';
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

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}

export default function Home() {
  const navigate = useNavigate();
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [greeting, setGreeting] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [segmentLabel, setSegmentLabel] = useState('');
  const [favs, setFavs] = useState<Favorite[]>([]);
  const [day, setDay] = useState<DayData>({ date: '', focuses: [], meetings: [], tasks: [] });
  const [newMeeting, setNewMeeting] = useState({ time: '', title: '' });
  const [newTask, setNewTask] = useState('');
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [goal, setGoal] = useState(0);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null);
  const [welcomeBack, setWelcomeBack] = useState<string | null>(null);
  const [showAddSale, setShowAddSale] = useState(false);
  const [saleForm, setSaleForm] = useState({ amount: '', client: '' });

  const refreshStats = (g: number) => {
    setStats(getStats(g));
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '', monthlyGoal: 0 });
    if (profile.segment) {
      setSegmentLabel(SEGMENTS.find(s => s.value === profile.segment)?.label || '');
      fetchNews(profile.segment).then(items => setNews(items.slice(0, 3)));
    }
    const g = profile.monthlyGoal || 0;
    setGoal(g);
    refreshStats(g);

    setFavs(getFavorites().sort((a, b) => b.addedAt - a.addedAt).slice(0, 3));
    setDay(getDay());

    const ws = getWeekStats();
    if (ws.totalInteractions > 0) setWeekStats(ws);

    setWelcomeBack(getWelcomeBackMessage());
    markActive();
  }, []);

  const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '', monthlyGoal: 0 });
  const name = profile.name ? `, ${profile.name.split(' ')[0]}` : '';

  const handleFocusChange = (i: number, value: string) => {
    setDay(setFocusText(i, value));
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

  const handleRegisterSale = () => {
    const amount = Number(saleForm.amount);
    if (!amount || !saleForm.client.trim()) return;
    addSale(amount, saleForm.client);
    refreshStats(goal);
    setSaleForm({ amount: '', client: '' });
    setShowAddSale(false);
  };

  const pendingTasks = day.tasks.filter(t => !t.done).length;
  const totalTasks = day.tasks.length;
  const migratedFocuses = day.focuses.filter(f => f.fromYesterday && f.text.trim());

  // Micro-gráfico simples
  const chartData = stats && goal > 0 ? getDailyAccumulation() : [];
  const maxVal = Math.max(goal, ...chartData.map(d => d.accumulated), 1);

  return (
    <div className="home">
      <div className="greeting-card card">
        <h2>{greeting}{name}!</h2>
        <p className="greeting-date">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {welcomeBack && (
        <div className="welcome-back card" onClick={() => setWelcomeBack(null)}>
          <span>👋 {welcomeBack}</span>
          <X size={14} />
        </div>
      )}

      <button className="premeeting-btn" onClick={() => navigate('/pre-reuniao')}>
        <Zap size={18} />
        <span>Vou entrar numa reunião</span>
      </button>

      {/* Meta do mês */}
      {stats && goal > 0 && (
        <div className="day-section">
          <div className="day-section-header">
            <h3 className="section-title"><Award size={16} /> Meta do mês</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setShowAddSale(!showAddSale)}>
              <Plus size={12} /> Registrar venda
            </button>
          </div>

          {showAddSale && (
            <div className="new-sale card">
              <input
                type="number"
                placeholder="Valor R$"
                value={saleForm.amount}
                onChange={e => setSaleForm({ ...saleForm, amount: e.target.value })}
                className="sale-amount-input"
              />
              <input
                type="text"
                placeholder="Cliente"
                value={saleForm.client}
                onChange={e => setSaleForm({ ...saleForm, client: e.target.value })}
                className="sale-client-input"
              />
              <button className="btn btn-primary btn-sm" onClick={handleRegisterSale}>
                <Check size={14} />
              </button>
            </div>
          )}

          <div className="goal-card card">
            <div className="goal-numbers">
              <div>
                <span className="goal-value">{formatBRL(stats.monthTotal)}</span>
                <span className="goal-of">de {formatBRL(stats.goal)}</span>
              </div>
              <span className={`goal-pace goal-pace-${stats.pace}`}>
                {stats.pace === 'adiantado' && '🔥 Adiantado'}
                {stats.pace === 'no_ritmo' && '✅ No ritmo'}
                {stats.pace === 'atras' && '⚠️ Atrás'}
              </span>
            </div>

            <div className="goal-progress-bar">
              <div className="goal-progress-fill" style={{ width: `${stats.progress}%` }} />
            </div>

            <div className="goal-stats-row">
              <div>
                <span className="goal-stat-label">Progresso</span>
                <span className="goal-stat-value">{Math.round(stats.progress)}%</span>
              </div>
              <div>
                <span className="goal-stat-label">Dias restantes</span>
                <span className="goal-stat-value">{stats.daysLeft}</span>
              </div>
              <div>
                <span className="goal-stat-label">Por dia</span>
                <span className="goal-stat-value">{formatBRL(stats.dailyTarget)}</span>
              </div>
            </div>

            {/* Mini gráfico de acumulado */}
            {chartData.length > 1 && (
              <div className="goal-chart">
                <svg viewBox={`0 0 ${chartData.length * 20} 60`} preserveAspectRatio="none">
                  <polyline
                    points={chartData.map((d, i) => `${i * 20},${60 - (d.accumulated / maxVal) * 55}`).join(' ')}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Linha da meta */}
                  <line
                    x1="0"
                    y1={60 - (goal / maxVal) * 55}
                    x2={chartData.length * 20}
                    y2={60 - (goal / maxVal) * 55}
                    stroke="var(--text-soft)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                </svg>
                <span className="goal-chart-label">Acumulado de vendas no mês</span>
              </div>
            )}
          </div>
        </div>
      )}

      {stats && goal === 0 && (
        <div className="goal-setup card" onClick={() => navigate('/perfil')}>
          <TrendingUp size={18} />
          <div>
            <strong>Defina sua meta mensal</strong>
            <p>Configure no perfil para acompanhar seu progresso.</p>
          </div>
          <ArrowRight size={14} />
        </div>
      )}

      {/* Progresso semanal */}
      {weekStats && (
        <div className="day-section">
          <div className="day-section-header">
            <h3 className="section-title"><Activity size={16} /> Essa semana</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/historico')}>Ver histórico</button>
          </div>
          <div className="week-stats card">
            <div className="week-stat">
              <span className="week-stat-value">{weekStats.researches}</span>
              <span className="week-stat-label">Pesquisas</span>
            </div>
            <div className="week-stat">
              <span className="week-stat-value">{weekStats.messages}</span>
              <span className="week-stat-label">Mensagens</span>
            </div>
            <div className="week-stat">
              <span className="week-stat-value">{weekStats.meetings}</span>
              <span className="week-stat-label">Reuniões</span>
            </div>
            <div className="week-stat">
              <span className="week-stat-value">
                {weekStats.averageSimScore !== null ? weekStats.averageSimScore.toFixed(1) : weekStats.simulations}
              </span>
              <span className="week-stat-label">
                {weekStats.averageSimScore !== null ? 'Nota média' : 'Treinos'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* De ontem (pendentes) */}
      {migratedFocuses.length > 0 && (
        <div className="day-section">
          <h3 className="section-title"><History size={16} /> De ontem (pendentes)</h3>
          <div className="migrated-card card">
            {migratedFocuses.map((f, i) => {
              const realIndex = day.focuses.findIndex(x => x === f);
              return (
                <div key={i} className={`focus-row migrated ${f.done ? 'done' : ''}`}>
                  <button className="focus-check" onClick={() => setDay(toggleFocus(realIndex))}>
                    {f.done && <Check size={12} />}
                  </button>
                  <span className="migrated-text">{f.text}</span>
                  <button className="meeting-remove" onClick={() => setDay(removeFocus(realIndex))}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3 Focos do Dia */}
      <div className="day-section">
        <h3 className="section-title"><Target size={16} /> Seus 3 focos de hoje</h3>
        <div className="focuses card">
          {[0, 1, 2].map(i => {
            const f = day.focuses[i] || { text: '', done: false };
            return (
              <div key={i} className={`focus-row ${f.done ? 'done' : ''}`}>
                <button className="focus-check" onClick={() => setDay(toggleFocus(i))}>
                  {f.done ? <Check size={12} /> : <span className="focus-num">{i + 1}</span>}
                </button>
                <input
                  type="text"
                  placeholder={`Foco ${i + 1}...`}
                  value={f.text}
                  onChange={e => handleFocusChange(i, e.target.value)}
                  className="focus-input"
                />
              </div>
            );
          })}
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
            <input type="time" value={newMeeting.time} onChange={e => setNewMeeting({ ...newMeeting, time: e.target.value })} className="meeting-time-input" />
            <input type="text" placeholder="Cliente / reunião" value={newMeeting.title} onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })} className="meeting-title-input" />
            <button className="btn btn-primary btn-sm" onClick={handleAddMeeting}><Check size={14} /></button>
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
            <input type="text" placeholder="Adicionar tarefa..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTask()} className="task-input" />
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
