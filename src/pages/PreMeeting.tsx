import { useState, useEffect } from 'react';
import { Zap, Check, ChevronDown, ChevronUp, Shield, BookOpen, User, Search } from 'lucide-react';
import { getObjections } from '../services/content';
import { TECHNIQUES } from '../services/content';
import { loadData, KEYS } from '../services/storage';
import type { UserProfile, Client } from '../types';
import type { Objection } from '../services/content';
import './PreMeeting.css';

const PRE_MEETING_CHECKLIST = [
  'Revisei o histórico do cliente',
  'Tenho o objetivo da reunião claro',
  'Preparei perguntas de descoberta',
  'Sei quais objeções esperar',
  'Tenho proposta/material pronto',
  'Confirmei horário e participantes',
];

export default function PreMeeting() {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [showObjections, setShowObjections] = useState(false);
  const [showTechniques, setShowTechniques] = useState(false);
  const [topObjections, setTopObjections] = useState<Objection[]>([]);
  const [expandedObj, setExpandedObj] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientPicker, setShowClientPicker] = useState(false);

  useEffect(() => {
    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
    const all = getObjections(profile.segment);
    setTopObjections(all.slice(0, 5));
    setClients(loadData(KEYS.CLIENTS, []));
  }, []);

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientPicker(false);
    setClientSearch('');
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.company.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const progress = Math.round((checkedItems.size / PRE_MEETING_CHECKLIST.length) * 100);
  const topTechniques = TECHNIQUES.slice(0, 3);

  return (
    <div className="premeeting-page">
      <div className="premeeting-hero card">
        <Zap size={28} />
        <div>
          <h3>Modo Pré-reunião</h3>
          <p>Prepare-se em 2 minutos</p>
        </div>
      </div>

      {/* Client briefing - F2.5 */}
      {clients.length > 0 && (
        <div className="premeeting-section">
          <div className="section-toggle" onClick={() => setShowClientPicker(!showClientPicker)}>
            <h4 className="section-title"><User size={16} /> {selectedClient ? selectedClient.name : 'Selecionar cliente'}</h4>
            {showClientPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showClientPicker && (
            <div className="client-picker card">
              <div className="search-bar" style={{ marginBottom: 8 }}>
                <Search size={14} />
                <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Buscar..." />
              </div>
              {filteredClients.map(c => (
                <button key={c.id} className="picker-item" onClick={() => selectClient(c)}>
                  <span className="picker-name">{c.name}</span>
                  {c.company && <span className="picker-company">{c.company}</span>}
                </button>
              ))}
            </div>
          )}

          {selectedClient && (
            <div className="briefing-card card">
              <h4 className="briefing-title">Resumo — {selectedClient.name}</h4>
              <div className="briefing-points">
                <div className="briefing-point">
                  <span className="briefing-label">Empresa:</span>
                  <span>{selectedClient.company || '—'}</span>
                </div>
                {selectedClient.meetings.length > 0 && (
                  <div className="briefing-point">
                    <span className="briefing-label">Última reunião:</span>
                    <span>{selectedClient.meetings[0].date.split('-').reverse().join('/')} — {selectedClient.meetings[0].outcome === 'fechou' ? 'Fechou' : selectedClient.meetings[0].outcome === 'perdeu' ? 'Não avançou' : selectedClient.meetings[0].outcome === 'acompanhamento' ? 'Acompanhamento' : 'Sem registro'}</span>
                  </div>
                )}
                {selectedClient.objections.length > 0 && (
                  <div className="briefing-point">
                    <span className="briefing-label">Objeções citadas:</span>
                    <div className="briefing-tags">
                      {selectedClient.objections.map(o => <span key={o} className="briefing-tag">{o}</span>)}
                    </div>
                  </div>
                )}
                {selectedClient.meetings.length > 0 && selectedClient.meetings[0].value && (
                  <div className="briefing-point">
                    <span className="briefing-label">Valor em jogo:</span>
                    <span className="briefing-value">R$ {selectedClient.meetings[0].value.toLocaleString()}</span>
                  </div>
                )}
                {selectedClient.notes && (
                  <div className="briefing-point">
                    <span className="briefing-label">Notas:</span>
                    <span>{selectedClient.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Checklist */}
      <div className="premeeting-section">
        <h4 className="section-title">Checklist Rápido</h4>
        <div className="premeeting-progress">
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <span>{progress}%</span>
        </div>
        <div className="quick-checklist card">
          {PRE_MEETING_CHECKLIST.map((item, i) => (
            <div key={i} className={`quick-check-item ${checkedItems.has(i) ? 'checked' : ''}`} onClick={() => toggleCheck(i)}>
              <div className="quick-check-box">
                {checkedItems.has(i) && <Check size={12} />}
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Objections */}
      <div className="premeeting-section">
        <div className="section-toggle" onClick={() => setShowObjections(!showObjections)}>
          <h4 className="section-title"><Shield size={16} /> Objeções Frequentes</h4>
          {showObjections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {showObjections && (
          <div className="mini-objections">
            {topObjections.map(obj => (
              <div key={obj.id} className="mini-obj card">
                <div className="mini-obj-header" onClick={() => setExpandedObj(expandedObj === obj.id ? null : obj.id)}>
                  <strong>{obj.objection}</strong>
                  {expandedObj === obj.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
                {expandedObj === obj.id && (
                  <div className="mini-obj-responses">
                    {obj.responses.map((r, i) => (
                      <p key={i}><strong>{i + 1}.</strong> {r}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Techniques */}
      <div className="premeeting-section">
        <div className="section-toggle" onClick={() => setShowTechniques(!showTechniques)}>
          <h4 className="section-title"><BookOpen size={16} /> Técnicas Rápidas</h4>
          {showTechniques ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {showTechniques && (
          <div className="mini-techniques">
            {topTechniques.map(tech => (
              <div key={tech.id} className="mini-tech card">
                <span className="technique-icon">{tech.icon}</span>
                <div>
                  <strong>{tech.name}</strong>
                  <p>{tech.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
