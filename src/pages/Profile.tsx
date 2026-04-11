import { useState, useEffect } from 'react';
import { User, Building2, Briefcase, Save, ExternalLink, Factory } from 'lucide-react';
import { loadData, saveData, KEYS } from '../services/storage';
import { SEGMENTS } from '../types';
import type { UserProfile } from '../types';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({ name: '', role: '', company: '', segment: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadData(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' }));
  }, []);

  const handleSave = () => {
    saveData(KEYS.PROFILE, profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="profile-page">
      <div className="profile-avatar">
        <div className="avatar-circle">
          <User size={36} />
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
          <span className="form-hint">Personaliza objeções, scripts e notícias do seu mercado</span>
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
        <p>Versão 2.0.0</p>
      </div>
    </div>
  );
}
