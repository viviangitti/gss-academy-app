import { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Users, Trash2, MessageCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadData, saveData, KEYS } from '../services/storage';
import type { Client, ClientMeeting } from '../types';
import './Clients.css';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const COMMON_OBJECTIONS = [
  '"Está muito caro"',
  '"Vou pensar"',
  '"Já tenho fornecedor"',
  '"Não é o momento"',
  '"Preciso falar com meu sócio"',
  '"Me envia por email"',
  '"O concorrente é mais barato"',
  '"Não tenho orçamento"',
];

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({ name: '', nomeFantasia: '', razaoSocial: '', cnpj: '', company: '', notes: '' });
  const [newMeeting, setNewMeeting] = useState<Partial<ClientMeeting>>({
    date: new Date().toISOString().split('T')[0],
    type: 'Reunião',
    outcome: '',
    objections: [],
    notes: '',
    value: 0,
  });

  useEffect(() => {
    setClients(loadData(KEYS.CLIENTS, []));
  }, []);

  const save = (updated: Client[]) => {
    setClients(updated);
    saveData(KEYS.CLIENTS, updated);
  };

  const addClient = () => {
    if (!newClient.name.trim()) return;
    const client: Client = {
      id: generateId(),
      name: newClient.name,
      nomeFantasia: newClient.nomeFantasia,
      razaoSocial: newClient.razaoSocial,
      cnpj: newClient.cnpj,
      company: newClient.company,
      notes: newClient.notes,
      objections: [],
      meetings: [],
      createdAt: Date.now(),
    };
    save([client, ...clients]);
    setNewClient({ name: '', nomeFantasia: '', razaoSocial: '', cnpj: '', company: '', notes: '' });
    setShowNewModal(false);
    setExpandedId(client.id);
  };

  const deleteClient = (id: string) => {
    save(clients.filter(c => c.id !== id));
  };

  const addMeeting = (clientId: string) => {
    const meeting: ClientMeeting = {
      date: newMeeting.date || new Date().toISOString().split('T')[0],
      type: newMeeting.type || 'Reunião',
      outcome: (newMeeting.outcome as ClientMeeting['outcome']) || '',
      objections: newMeeting.objections || [],
      notes: newMeeting.notes || '',
      value: newMeeting.value,
    };

    save(clients.map(c => {
      if (c.id !== clientId) return c;
      const allObjections = [...new Set([...c.objections, ...meeting.objections])];
      return { ...c, meetings: [meeting, ...c.meetings], objections: allObjections };
    }));

    setShowMeetingModal(null);
    setNewMeeting({ date: new Date().toISOString().split('T')[0], type: 'Reunião', outcome: '', objections: [], notes: '', value: 0 });
  };

  const toggleObjection = (obj: string) => {
    const current = newMeeting.objections || [];
    if (current.includes(obj)) {
      setNewMeeting({ ...newMeeting, objections: current.filter(o => o !== obj) });
    } else {
      setNewMeeting({ ...newMeeting, objections: [...current, obj] });
    }
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  // Objection frequency
  const objectionCount: Record<string, number> = {};
  clients.forEach(c => c.objections.forEach(o => {
    objectionCount[o] = (objectionCount[o] || 0) + 1;
  }));
  const topObjections = Object.entries(objectionCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="clients-page">
      {/* Stats */}
      {topObjections.length > 0 && (
        <div className="client-stats card">
          <h4><AlertTriangle size={14} /> Objeções mais frequentes</h4>
          <div className="stats-list">
            {topObjections.map(([obj, count]) => (
              <div key={obj} className="stat-item">
                <span>{obj}</span>
                <span className="stat-count">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="clients-header">
        <div className="search-bar">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNewModal(true)}>
          <Plus size={14} />
        </button>
      </div>

      {filtered.length === 0 && !search ? (
        <div className="empty-clients card">
          <Users size={32} />
          <p>Nenhum cliente cadastrado ainda.</p>
          <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
            <Plus size={14} /> Adicionar cliente
          </button>
        </div>
      ) : (
        <div className="clients-list">
          {filtered.map(client => {
            const isExpanded = expandedId === client.id;
            const lastMeeting = client.meetings[0];
            return (
              <div key={client.id} className="client-card card">
                <div className="client-header" onClick={() => setExpandedId(isExpanded ? null : client.id)}>
                  <div className="client-avatar-sm">{client.name.charAt(0)}</div>
                  <div className="client-info">
                    <h4>{client.name}</h4>
                    {(client.nomeFantasia || client.company) && <span className="client-company">{client.nomeFantasia || client.company}</span>}
                  </div>
                  {lastMeeting && <span className="client-last">{lastMeeting.date.split('-').reverse().join('/')}</span>}
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {isExpanded && (
                  <div className="client-details">
                    {/* Client details */}
                    {(client.cnpj || client.razaoSocial || client.nomeFantasia) && (
                      <div className="client-extra">
                        {client.nomeFantasia && <span><strong>Fantasia:</strong> {client.nomeFantasia}</span>}
                        {client.razaoSocial && <span><strong>Razão Social:</strong> {client.razaoSocial}</span>}
                        {client.cnpj && <span><strong>CNPJ:</strong> {client.cnpj}</span>}
                      </div>
                    )}

                    {/* Objections this client cited */}
                    {client.objections.length > 0 && (
                      <div className="client-objections">
                        <span className="detail-label">Objeções citadas:</span>
                        <div className="obj-tags">
                          {client.objections.map(o => <span key={o} className="obj-tag">{o}</span>)}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="client-actions-row">
                      <button className="btn btn-outline btn-sm" onClick={() => setShowMeetingModal(client.id)}>
                        <Plus size={12} /> Registrar reunião
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/ia-coach?cliente=${encodeURIComponent(client.name)}`)}>
                        <MessageCircle size={12} /> Perguntar à IA
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteClient(client.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Meeting history */}
                    {client.meetings.length > 0 && (
                      <div className="meeting-history">
                        <span className="detail-label">Histórico de reuniões:</span>
                        {client.meetings.slice(0, 5).map((m, i) => (
                          <div key={i} className="meeting-item">
                            <span className="meeting-date">{m.date.split('-').reverse().join('/')}</span>
                            <span className="meeting-type">{m.type}</span>
                            {m.outcome && <span className={`meeting-outcome ${m.outcome}`}>
                              {m.outcome === 'fechou' ? 'Fechou' : m.outcome === 'perdeu' ? 'Não avançou' : 'Acompanhamento'}
                            </span>}
                            {m.value ? <span className="meeting-value">R$ {m.value.toLocaleString()}</span> : null}
                          </div>
                        ))}
                      </div>
                    )}

                    {client.notes && <p className="client-notes">{client.notes}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New client modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Novo Cliente</h3>
            <div className="form-group">
              <label>Nome do contato</label>
              <input value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} placeholder="Nome da pessoa" />
            </div>
            <div className="form-group">
              <label>Nome Fantasia</label>
              <input value={newClient.nomeFantasia} onChange={e => setNewClient({ ...newClient, nomeFantasia: e.target.value })} placeholder="Nome fantasia da empresa" />
            </div>
            <div className="form-group">
              <label>Razão Social</label>
              <input value={newClient.razaoSocial} onChange={e => setNewClient({ ...newClient, razaoSocial: e.target.value })} placeholder="Razão social (opcional)" />
            </div>
            <div className="form-group">
              <label>CNPJ</label>
              <input value={newClient.cnpj} onChange={e => setNewClient({ ...newClient, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
            </div>
            <div className="form-group">
              <label>Empresa</label>
              <input value={newClient.company} onChange={e => setNewClient({ ...newClient, company: e.target.value })} placeholder="Empresa (se diferente do nome fantasia)" />
            </div>
            <div className="form-group">
              <label>Observações</label>
              <textarea value={newClient.notes} onChange={e => setNewClient({ ...newClient, notes: e.target.value })} rows={2} placeholder="Notas sobre o cliente..." />
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setShowNewModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={addClient}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting registration modal */}
      {showMeetingModal && (
        <div className="modal-overlay" onClick={() => setShowMeetingModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Registrar Reunião</h3>
            <div className="form-group">
              <label>Data</label>
              <input type="date" value={newMeeting.date} onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Resultado</label>
              <select value={newMeeting.outcome} onChange={e => setNewMeeting({ ...newMeeting, outcome: e.target.value as ClientMeeting['outcome'] })}>
                <option value="">Selecione</option>
                <option value="fechou">Fechou</option>
                <option value="acompanhamento">Precisa de acompanhamento</option>
                <option value="perdeu">Não avançou</option>
              </select>
            </div>
            <div className="form-group">
              <label>Valor (R$)</label>
              <input type="number" value={newMeeting.value || ''} onChange={e => setNewMeeting({ ...newMeeting, value: Number(e.target.value) })} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Objeções citadas</label>
              <div className="objection-chips">
                {COMMON_OBJECTIONS.map(obj => (
                  <button
                    key={obj}
                    className={`obj-chip ${(newMeeting.objections || []).includes(obj) ? 'active' : ''}`}
                    onClick={() => toggleObjection(obj)}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea value={newMeeting.notes} onChange={e => setNewMeeting({ ...newMeeting, notes: e.target.value })} rows={2} placeholder="O que foi discutido..." />
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setShowMeetingModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => addMeeting(showMeetingModal)}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
