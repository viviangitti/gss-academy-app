import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadData, saveData, KEYS } from '../services/storage';
import { addPoints } from '../services/gamification';
import type { Task } from '../types';
import './Timer.css';

const API_KEY = 'AIzaSyADE7zlJ0Edm3Q25t0FQ8-evnCUXuFn9e0';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function Timer() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(30); // minutos
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Vibrate if available
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          // Alert at 15min and 5min
          if (prev === 15 * 60 || prev === 5 * 60) {
            if ('vibrate' in navigator) navigator.vibrate(200);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    setTimeLeft(duration * 60);
    setIsRunning(true);
    setHasStarted(true);
  };

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setHasStarted(false);
    setTimeLeft(0);
    setShowOutcome(false);
  };

  const endMeeting = () => {
    setIsRunning(false);
    setShowOutcome(true);
  };

  const generateSummary = async () => {
    if (!meetingNotes.trim()) return;
    setLoadingSummary(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      const result = await model.generateContent(
        `Resuma esta anotação de reunião de vendas em EXATAMENTE 3 pontos curtos (1 frase cada). Formato:\n1. O que foi discutido\n2. Próximo passo\n3. Objeções ou pontos de atenção\n\nFale em português brasileiro. Sem introdução, só os 3 pontos.\n\nAnotação: "${meetingNotes}"`
      );
      setAiSummary(result.response.text());
    } catch {
      setAiSummary('O resumo ficou indisponível. Toque para tentar de novo.');
    }
    setLoadingSummary(false);
  };

  const handleOutcome = (outcome: 'fechou' | 'acompanhamento' | 'perdeu') => {
    addPoints('registro_reuniao');

    if (outcome === 'acompanhamento' && taskTitle.trim()) {
      const tasks = loadData<Task[]>(KEYS.TASKS, []);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const newTask: Task = {
        id: generateId(),
        title: taskTitle,
        dueDate: tomorrow.toISOString().split('T')[0],
        status: 'pendente',
        createdAt: Date.now(),
      };
      saveData(KEYS.TASKS, [...tasks, newTask]);
    }

    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalSeconds = duration * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const isWarning = timeLeft <= 15 * 60 && timeLeft > 5 * 60 && hasStarted;
  const isDanger = timeLeft <= 5 * 60 && timeLeft > 0 && hasStarted;
  const isFinished = timeLeft === 0 && hasStarted;

  if (showOutcome) {
    return (
      <div className="timer-page">
        <div className="outcome-card card">
          <h3>Como foi a reunião?</h3>

          <div className="outcome-options">
            <button className="outcome-btn fechou" onClick={() => handleOutcome('fechou')}>
              <Check size={24} />
              <span>Fechei!</span>
            </button>
            <button className="outcome-btn perdeu" onClick={() => handleOutcome('perdeu')}>
              <X size={24} />
              <span>Não avançou</span>
            </button>
          </div>

          <div className="outcome-followup">
            <button className="outcome-btn acompanhamento" onClick={() => {
              if (!taskTitle.trim()) {
                setTaskTitle('Enviar proposta');
              }
              handleOutcome('acompanhamento');
            }}>
              <ArrowRight size={24} />
              <span>Precisa de acompanhamento</span>
            </button>
            <input
              className="followup-input"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="Próximo passo: ex. Enviar proposta até terça"
            />
          </div>

          {/* Meeting notes + AI summary - F3.4 */}
          <div className="outcome-notes">
            <label>O que aconteceu? (opcional)</label>
            <textarea
              value={meetingNotes}
              onChange={e => setMeetingNotes(e.target.value)}
              rows={3}
              placeholder="Anote os pontos principais da reunião..."
            />
            {meetingNotes.trim() && !aiSummary && (
              <button className="btn btn-outline btn-sm summary-btn" onClick={generateSummary} disabled={loadingSummary}>
                <Sparkles size={14} /> {loadingSummary ? 'Gerando...' : 'Gerar resumo com IA'}
              </button>
            )}
            {aiSummary && (
              <div className="ai-summary">
                <strong><Sparkles size={12} /> Resumo da reunião:</strong>
                <p>{aiSummary}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timer-page">
      {!hasStarted ? (
        <div className="timer-setup">
          <h3>Duração da reunião</h3>
          <div className="duration-options">
            {[15, 30, 45, 60].map(min => (
              <button
                key={min}
                className={`duration-btn ${duration === min ? 'active' : ''}`}
                onClick={() => setDuration(min)}
              >
                {min} min
              </button>
            ))}
          </div>
          <button className="btn btn-primary start-btn" onClick={startTimer}>
            <Play size={20} /> Iniciar Reunião
          </button>
        </div>
      ) : (
        <div className="timer-running">
          {/* Circular progress */}
          <div className={`timer-circle ${isWarning ? 'warning' : ''} ${isDanger ? 'danger' : ''} ${isFinished ? 'finished' : ''}`}>
            <svg viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle
                cx="100" cy="100" r="90" fill="none"
                stroke={isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--accent)'}
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="timer-display">
              <span className="timer-time">{formatTime(timeLeft)}</span>
              <span className="timer-label">
                {isFinished ? 'Tempo esgotado!' : isDanger ? 'Finalize!' : isWarning ? 'Atenção' : 'Em reunião'}
              </span>
            </div>
          </div>

          <div className="timer-controls">
            <button className="timer-ctrl-btn" onClick={resetTimer}>
              <RotateCcw size={20} />
            </button>
            <button className="timer-ctrl-btn primary" onClick={togglePause}>
              {isRunning ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button className="timer-ctrl-btn end" onClick={endMeeting}>
              <Check size={20} />
            </button>
          </div>

          <p className="timer-hint">
            {isRunning ? 'Toque para pausar' : 'Toque para continuar'}
          </p>
        </div>
      )}
    </div>
  );
}
