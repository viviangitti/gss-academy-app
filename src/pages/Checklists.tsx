import { useState, useEffect } from 'react';
import { Check, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { loadData, saveData, KEYS } from '../services/storage';
import type { Checklist, ChecklistItem } from '../types';
import './Checklists.css';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const DEFAULT_TEMPLATES: Checklist[] = [
  {
    id: 'tpl-1',
    title: 'Antes da Reunião de Vendas',
    icon: '🎯',
    isTemplate: true,
    items: [
      { id: '1', text: 'Revisar histórico do cliente no sistema de gestão', checked: false },
      { id: '2', text: 'Preparar proposta/apresentação atualizada', checked: false },
      { id: '3', text: 'Listar objeções comuns e respostas', checked: false },
      { id: '4', text: 'Definir objetivo da reunião (fechamento, qualificação, etc)', checked: false },
      { id: '5', text: 'Verificar disponibilidade de amostras/demos', checked: false },
      { id: '6', text: 'Pesquisar notícias recentes do cliente', checked: false },
      { id: '7', text: 'Confirmar horário e participantes', checked: false },
      { id: '8', text: 'Preparar perguntas de descoberta (Situação, Problema, Implicação, Necessidade)', checked: false },
    ],
  },
  {
    id: 'tpl-2',
    title: 'Ritual Matinal do Líder',
    icon: '☀️',
    isTemplate: true,
    items: [
      { id: '1', text: 'Revisar metas do dia e da semana', checked: false },
      { id: '2', text: 'Analisar pipeline e oportunidades quentes', checked: false },
      { id: '3', text: 'Verificar agenda e compromissos do dia', checked: false },
      { id: '4', text: 'Enviar mensagem motivacional para o time', checked: false },
      { id: '5', text: 'Identificar 3 ações prioritárias', checked: false },
      { id: '6', text: 'Revisar follow-ups pendentes', checked: false },
    ],
  },
  {
    id: 'tpl-3',
    title: 'Preparação para Negociação',
    icon: '🤝',
    isTemplate: true,
    items: [
      { id: '1', text: 'Definir sua melhor alternativa caso não feche', checked: false },
      { id: '2', text: 'Mapear decisores e influenciadores', checked: false },
      { id: '3', text: 'Preparar faixa de preço/condições', checked: false },
      { id: '4', text: 'Listar benefícios e diferenciais', checked: false },
      { id: '5', text: 'Preparar cases de sucesso similares', checked: false },
      { id: '6', text: 'Antecipar objeções e preparar contornos', checked: false },
      { id: '7', text: 'Definir concessões possíveis e limites', checked: false },
      { id: '8', text: 'Ensaiar pitch de valor (2 minutos)', checked: false },
    ],
  },
  {
    id: 'tpl-4',
    title: 'Acompanhamento Pós-reunião',
    icon: '📋',
    isTemplate: true,
    items: [
      { id: '1', text: 'Enviar email de agradecimento em até 2h', checked: false },
      { id: '2', text: 'Registrar informações no sistema de gestão', checked: false },
      { id: '3', text: 'Enviar materiais prometidos', checked: false },
      { id: '4', text: 'Agendar próximo passo no calendário', checked: false },
      { id: '5', text: 'Atualizar status da oportunidade', checked: false },
      { id: '6', text: 'Compartilhar insights com o time', checked: false },
    ],
  },
  {
    id: 'tpl-5',
    title: 'Fechamento de Mês',
    icon: '📊',
    isTemplate: true,
    items: [
      { id: '1', text: 'Revisar todas as oportunidades abertas', checked: false },
      { id: '2', text: 'Priorizar deals com maior probabilidade', checked: false },
      { id: '3', text: 'Fazer follow-up em propostas pendentes', checked: false },
      { id: '4', text: 'Atualizar previsão de vendas no sistema de gestão', checked: false },
      { id: '5', text: 'Reunião 1:1 com cada vendedor', checked: false },
      { id: '6', text: 'Identificar deals que precisam de suporte', checked: false },
      { id: '7', text: 'Preparar relatório de performance', checked: false },
      { id: '8', text: 'Planejar ações para o próximo mês', checked: false },
    ],
  },
];

export default function Checklists() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const saved = loadData<Checklist[]>(KEYS.CHECKLISTS, []);
    if (saved.length === 0) {
      setChecklists(DEFAULT_TEMPLATES);
      saveData(KEYS.CHECKLISTS, DEFAULT_TEMPLATES);
    } else {
      setChecklists(saved);
    }
  }, []);

  const save = (updated: Checklist[]) => {
    setChecklists(updated);
    saveData(KEYS.CHECKLISTS, updated);
  };

  const toggleItem = (checklistId: string, itemId: string) => {
    save(checklists.map(cl =>
      cl.id === checklistId
        ? { ...cl, items: cl.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item) }
        : cl
    ));
  };

  const resetChecklist = (checklistId: string) => {
    save(checklists.map(cl =>
      cl.id === checklistId
        ? { ...cl, items: cl.items.map(item => ({ ...item, checked: false })) }
        : cl
    ));
  };

  const deleteChecklist = (id: string) => {
    save(checklists.filter(cl => cl.id !== id));
  };

  const addChecklist = () => {
    if (!newTitle.trim()) return;
    const newCl: Checklist = {
      id: generateId(),
      title: newTitle,
      icon: '📝',
      items: [{ id: generateId(), text: 'Novo item', checked: false }],
    };
    save([...checklists, newCl]);
    setNewTitle('');
    setShowNewModal(false);
    setExpandedId(newCl.id);
  };

  const addItem = (checklistId: string) => {
    save(checklists.map(cl =>
      cl.id === checklistId
        ? { ...cl, items: [...cl.items, { id: generateId(), text: '', checked: false }] }
        : cl
    ));
  };

  const updateItemText = (checklistId: string, itemId: string, text: string) => {
    save(checklists.map(cl =>
      cl.id === checklistId
        ? { ...cl, items: cl.items.map(item => item.id === itemId ? { ...item, text } : item) }
        : cl
    ));
  };

  const removeItem = (checklistId: string, itemId: string) => {
    save(checklists.map(cl =>
      cl.id === checklistId
        ? { ...cl, items: cl.items.filter(item => item.id !== itemId) }
        : cl
    ));
  };

  const getProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0;
    return Math.round((items.filter(i => i.checked).length / items.length) * 100);
  };

  return (
    <div className="checklists-page">
      <div className="checklists-header">
        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
          <Plus size={16} /> Nova Checklist
        </button>
      </div>

      <div className="checklists-list">
        {checklists.map(cl => {
          const progress = getProgress(cl.items);
          const isExpanded = expandedId === cl.id;
          return (
            <div key={cl.id} className="checklist-card card">
              <div className="checklist-header" onClick={() => setExpandedId(isExpanded ? null : cl.id)}>
                <span className="checklist-icon">{cl.icon}</span>
                <div className="checklist-info">
                  <h4>{cl.title}</h4>
                  <div className="checklist-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="progress-text">{progress}%</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {isExpanded && (
                <div className="checklist-items">
                  {cl.items.map(item => (
                    <div key={item.id} className={`checklist-item ${item.checked ? 'checked' : ''}`}>
                      <button className="check-btn" onClick={() => toggleItem(cl.id, item.id)}>
                        {item.checked && <Check size={12} />}
                      </button>
                      <input
                        className="item-text-input"
                        value={item.text}
                        onChange={e => updateItemText(cl.id, item.id, e.target.value)}
                        placeholder="Descreva o item..."
                      />
                      <button className="remove-item" onClick={() => removeItem(cl.id, item.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="checklist-footer">
                    <button className="btn btn-outline btn-sm" onClick={() => addItem(cl.id)}>
                      <Plus size={12} /> Item
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => resetChecklist(cl.id)}>
                      <RotateCcw size={12} /> Reset
                    </button>
                    {!cl.isTemplate && (
                      <button className="btn btn-sm btn-danger" onClick={() => deleteChecklist(cl.id)}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Nova Checklist</h3>
            <div className="form-group">
              <label>Nome</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Preparação para feira" />
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setShowNewModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={addChecklist}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
