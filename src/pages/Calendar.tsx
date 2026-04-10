import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2, Edit3 } from 'lucide-react';
import { loadData, saveData, KEYS } from '../services/storage';
import type { CalendarEvent } from '../types';
import './Calendar.css';

const CATEGORIES = [
  { value: 'reuniao', label: 'Reunião', color: '#3b82f6' },
  { value: 'ritual', label: 'Ritual', color: '#f59e0b' },
  { value: 'followup', label: 'Follow-up', color: '#22c55e' },
  { value: 'treinamento', label: 'Treinamento', color: '#8b5cf6' },
] as const;

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({ title: '', time: '09:00', category: 'reuniao' as CalendarEvent['category'], notes: '' });

  useEffect(() => {
    setEvents(loadData(KEYS.EVENTS, []));
  }, []);

  const save = (updated: CalendarEvent[]) => {
    setEvents(updated);
    saveData(KEYS.EVENTS, updated);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const hasEvents = (day: number) => events.some(e => e.date === getDateStr(day));
  const dayEvents = events.filter(e => e.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const openNewEvent = () => {
    setEditingEvent(null);
    setForm({ title: '', time: '09:00', category: 'reuniao', notes: '' });
    setShowModal(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setForm({ title: event.title, time: event.time, category: event.category, notes: event.notes || '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingEvent) {
      save(events.map(e => e.id === editingEvent.id ? { ...e, ...form, date: selectedDate } : e));
    } else {
      save([...events, { id: generateId(), date: selectedDate, ...form }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    save(events.filter(e => e.id !== id));
  };

  return (
    <div className="calendar-page">
      <div className="cal-header card">
        <button className="cal-nav" onClick={prevMonth}><ChevronLeft size={20} /></button>
        <h3 className="cal-month">
          {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <button className="cal-nav" onClick={nextMonth}><ChevronRight size={20} /></button>
      </div>

      <div className="cal-grid card">
        <div className="cal-weekdays">
          {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="cal-days">
          {days.map((day, i) => (
            <button
              key={i}
              className={`cal-day ${day ? '' : 'empty'} ${day && getDateStr(day) === selectedDate ? 'selected' : ''} ${day && getDateStr(day) === today ? 'today' : ''}`}
              onClick={() => day && setSelectedDate(getDateStr(day))}
              disabled={!day}
            >
              {day}
              {day && hasEvents(day) && <span className="cal-dot" />}
            </button>
          ))}
        </div>
      </div>

      <div className="cal-events">
        <div className="cal-events-header">
          <h3 className="section-title">
            {new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </h3>
          <button className="btn btn-primary btn-sm" onClick={openNewEvent}>
            <Plus size={14} /> Novo
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <p className="empty-state">Nenhum evento neste dia</p>
        ) : (
          dayEvents.map(event => (
            <div key={event.id} className="event-card card">
              <div className="event-header">
                <span className="event-time">{event.time}</span>
                <span className={`badge badge-${event.category}`}>
                  {CATEGORIES.find(c => c.value === event.category)?.label}
                </span>
                <div className="event-actions">
                  <button onClick={() => openEditEvent(event)}><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(event.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <h4 className="event-name">{event.title}</h4>
              {event.notes && <p className="event-notes">{event.notes}</p>}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</h3>
            <div className="form-group">
              <label>Título</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Reunião com equipe" />
            </div>
            <div className="form-group">
              <label>Horário</label>
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as CalendarEvent['category'] })}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Observações</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Notas adicionais..." />
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
