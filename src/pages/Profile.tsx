import { useState, useEffect } from 'react';
import { User, Building2, Briefcase, Save, ExternalLink, Factory, Target, Trophy } from 'lucide-react';
import { loadData, saveData, KEYS } from '../services/storage';
import { getPoints, getLevel, checkDailyLogin } from '../services/gamification';
import { SEGMENTS } from '../types';
import type { UserProfile } from '../types';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({ name: '', role: '', company: '', segment: '', monthlyGoal: 0 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadData(KEYS.PROFILE, { name: '', role: '', company: '', segment: '', monthlyGoal: 0 }));
    checkDailyLogin();
  }, []);

  const handleSave = () => {
    saveData(KEYS.PROFILE, profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const points = getPoints();
  const level = getLevel(points.total);

  return (
    <div className="profile-page">
      <div className="profile-avatar">
        <div className="avatar-circle">
          <User size={36} />
        </div>
      </div>

      {/* Gamification card */}
      <div className="level-card card">
        <div className="level-header">
          <Trophy size={20} />
          <div>
            <span className="level-title">Nível {level.level} — {level.title}</span>
            <span className="level-points">{points.total} pontos</span>
          </div>
          {points.streak > 1 && (
            <span className="streak-badge">{points.streak} dias seguidos</span>
          )}
        </div>
        <div className="level-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${level.progress}%` }} />
          </div>
          <span className="level-next">Próximo nível: {level.nextLevel} pts</span>
        </div>
      </div>

      <div className="profile-form card">
        <div className="form-group">
          <label><User size={14} /> Nome</label>
          <input
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            placeholder="Seu nome completo"
          />
        </div>
        <div className="form-group">
          <label><Briefcase size={14} /> Cargo</label>
          <input
            value={profile.role}
            onChange={e => setProfile({ ...profile, role: e.target.value })}
            placeholder="Ex: Líder Comercial"
          />
        </div>
        <div className="form-group">
          <label><Building2 size={14} /> Empresa</label>
          <input
            value={profile.company}
            onChange={e => setProfile({ ...profile, company: e.target.value })}
            placeholder="Nome da empresa"
          />
        </div>
        <div className="form-group">
          <label><Factory size={14} /> Segmento</label>
          <select
            value={profile.segment}
            onChange={e => setProfile({ ...profile, segment: e.target.value as UserProfile['segment'] })}
          >
            {SEGMENTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <span className="form-hint">Personaliza objeções, roteiros e notícias do seu mercado</span>
        </div>
        <div className="form-group">
          <label><Target size={14} /> Meta mensal (R$)</label>
          <input
            type="number"
            value={profile.monthlyGoal || ''}
            onChange={e => setProfile({ ...profile, monthlyGoal: Number(e.target.value) || 0 })}
            placeholder="Ex: 100000"
          />
          <span className="form-hint">Acompanhe o progresso na agenda</span>
        </div>
        <button className={`btn btn-primary save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
          <Save size={16} /> {saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      <div className="profile-links">
        <h3 className="section-title">Maestria em Vendas</h3>
        <a href="https://gssacademy.vercel.app" target="_blank" rel="noopener noreferrer" className="link-card card">
          <div className="link-info">
            <h4>GSS Academy</h4>
            <p>Acesse o curso completo</p>
          </div>
          <ExternalLink size={16} />
        </a>
      </div>

      <div className="app-info">
        <p>GSS Academy - App do Líder</p>
        <p>Versão 3.0.0</p>
      </div>
    </div>
  );
}
