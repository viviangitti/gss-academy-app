import { useState, useEffect } from 'react';
import { Trophy, CalendarCheck, Target, TrendingUp, Flame, AlertTriangle } from 'lucide-react';
import { loadData, KEYS } from '../services/storage';
import { getPoints, getLevel } from '../services/gamification';
import type { CalendarEvent, Task, Client, UserProfile } from '../types';
import './Dashboard.css';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}

export default function Dashboard() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState(0);

  useEffect(() => {
    setEvents(loadData(KEYS.EVENTS, []));
    setTasks(loadData(KEYS.TASKS, []));
    setClients(loadData(KEYS.CLIENTS, []));
    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '', monthlyGoal: 0 });
    setMonthlyGoal(profile.monthlyGoal || 0);
  }, []);

  const points = getPoints();
  const level = getLevel(points.total);
  const today = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const weekStart = thisWeekStart.toISOString().split('T')[0];

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Metrics
  const weekEvents = events.filter(e => e.date >= weekStart && e.date <= today && e.category === 'reuniao');
  const weekScheduled = events.filter(e => e.date >= weekStart && e.category === 'reuniao');
  const monthClosed = events.filter(e => e.date.startsWith(monthPrefix) && e.outcome === 'fechou');
  const monthClosedValue = monthClosed.reduce((s, e) => s + (e.value || 0), 0);
  const pendingTasks = tasks.filter(t => t.status === 'pendente');
  const overdueTasks = pendingTasks.filter(t => t.dueDate < today);

  // Top objections from clients
  const objectionCount: Record<string, number> = {};
  clients.forEach(c => c.objections.forEach(o => { objectionCount[o] = (objectionCount[o] || 0) + 1; }));
  const topObjections = Object.entries(objectionCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const goalProgress = monthlyGoal > 0 ? Math.min((monthClosedValue / monthlyGoal) * 100, 100) : 0;

  return (
    <div className="dashboard-page">
      {/* Level */}
      <div className="dash-level card">
        <Trophy size={20} />
        <div className="dash-level-info">
          <strong>Nível {level.level} — {level.title}</strong>
          <span>{points.total} pontos</span>
        </div>
        {points.streak > 1 && <span className="streak-badge">{points.streak} dias</span>}
      </div>

      {/* Goal */}
      {monthlyGoal > 0 && (
        <div className="dash-card card">
          <div className="dash-card-header">
            <Target size={16} />
            <span>Meta Mensal</span>
          </div>
          <div className="dash-goal">
            <span className="dash-goal-value">{formatCurrency(monthClosedValue)}</span>
            <span className="dash-goal-of">de {formatCurrency(monthlyGoal)}</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${goalProgress}%` }} /></div>
        </div>
      )}

      {/* Stats grid */}
      <div className="dash-grid">
        <div className="dash-stat card">
          <CalendarCheck size={18} />
          <span className="dash-stat-value">{weekEvents.length}/{weekScheduled.length}</span>
          <span className="dash-stat-label">Reuniões da semana</span>
        </div>
        <div className="dash-stat card">
          <TrendingUp size={18} />
          <span className="dash-stat-value">{monthClosed.length}</span>
          <span className="dash-stat-label">Fechamentos do mês</span>
        </div>
        <div className="dash-stat card">
          <Flame size={18} />
          <span className="dash-stat-value">{points.streak}</span>
          <span className="dash-stat-label">Dias consecutivos</span>
        </div>
        <div className="dash-stat card">
          <AlertTriangle size={18} />
          <span className={`dash-stat-value ${overdueTasks.length > 0 ? 'danger' : ''}`}>{pendingTasks.length}</span>
          <span className="dash-stat-label">Tarefas pendentes</span>
        </div>
      </div>

      {/* Top objections */}
      {topObjections.length > 0 && (
        <div className="dash-section card">
          <h4 className="section-title">Objeções mais frequentes</h4>
          {topObjections.map(([obj, count]) => (
            <div key={obj} className="dash-objection">
              <span>{obj}</span>
              <div className="obj-bar-wrap">
                <div className="obj-bar" style={{ width: `${(count / topObjections[0][1]) * 100}%` }} />
              </div>
              <span className="obj-count">{count}x</span>
            </div>
          ))}
        </div>
      )}

      {/* Pending tasks */}
      {pendingTasks.length > 0 && (
        <div className="dash-section card">
          <h4 className="section-title">Tarefas pendentes</h4>
          {pendingTasks.slice(0, 5).map(task => (
            <div key={task.id} className={`dash-task ${task.dueDate < today ? 'overdue' : ''}`}>
              <span>{task.title}</span>
              <span className="task-due">{task.dueDate.split('-').reverse().join('/')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
