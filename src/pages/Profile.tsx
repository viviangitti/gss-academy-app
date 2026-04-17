import { useState, useEffect, useRef } from 'react';
import { User, Building2, Briefcase, Save, ExternalLink, Factory, Target, Trophy, Download, Upload } from 'lucide-react';
import { loadData, saveData, KEYS } from '../services/storage';
import { getPoints, getLevel, checkDailyLogin } from '../services/gamification';
import { SEGMENTS } from '../types';
import type { UserProfile } from '../types';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({ name: '', role: '', company: '', segment: '', monthlyGoal: 0 });
  const [saved, setSaved] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(loadData(KEYS.PROFILE, { name: '', role: '', company: '', segment: '', monthlyGoal: 0 }));
    checkDailyLogin();
  }, []);

  const handleSave = () => {
    saveData(KEYS.PROFILE, profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data: Record<string, unknown> = {};
    Object.values(KEYS).forEach(key => {
      const val = localStorage.getItem(key);
      if (val) data[key] = JSON.parse(val);
    });
    data['gss_onboarding_done'] = localStorage.getItem('gss_onboarding_done');

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gss-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'gss_onboarding_done') {
            localStorage.setItem(key, value as string);
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }
        });
        setImportStatus('Dados restaurados! Recarregando...');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setImportStatus('Erro ao importar. Arquivo inválido.');
        setTimeout(() => setImportStatus(''), 3000);
      }
    };
    reader.readAsText(file);
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
        <h3 className="section-title">Maestr.IA em Vendas</h3>
        <a href="https://gssacademy.vercel.app" target="_blank" rel="noopener noreferrer" className="link-card card">
          <div className="link-info">
            <h4>GSS Academy</h4>
            <p>Acesse o curso completo</p>
          </div>
          <ExternalLink size={16} />
        </a>
      </div>

      <div className="backup-section">
        <h3 className="section-title">Seus dados</h3>
        <div className="backup-buttons">
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={16} /> Exportar dados
          </button>
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Importar dados
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
        {importStatus && <p className="import-status">{importStatus}</p>}
        <p className="backup-hint">Exporte seus dados como backup. Importe para restaurar em outro dispositivo.</p>
      </div>

      <div className="app-info">
        <p>Maestr.IA em Vendas</p>
        <p>Versão 3.1.0</p>
      </div>
    </div>
  );
}
