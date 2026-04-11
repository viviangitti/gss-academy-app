import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Shield, AlertTriangle, Copy, Check } from 'lucide-react';
import { getObjections, STAGES } from '../services/content';
import { loadData, KEYS } from '../services/storage';
import { SEGMENTS } from '../types';
import type { UserProfile } from '../types';
import type { Objection, Stage } from '../services/content';
import SpeakButton from '../components/SpeakButton';
import './Objections.css';

export default function Objections() {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [segmentLabel, setSegmentLabel] = useState('');
  const [stageFilter, setStageFilter] = useState<Stage | ''>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
    setObjections(getObjections(profile.segment));
    setSegmentLabel(SEGMENTS.find(s => s.value === profile.segment)?.label || '');
  }, []);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* fallback */ }
  };

  const filtered = objections.filter(o => {
    const matchesSearch = !search ||
      o.objection.toLowerCase().includes(search.toLowerCase()) ||
      o.responses.some(r => r.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = !stageFilter || o.stage === stageFilter || !o.stage;
    return matchesSearch && matchesStage;
  });

  // Group by objection text to avoid duplicates in list (stage variants are sub-items)
  const grouped = filtered.reduce<Record<string, Objection[]>>((acc, obj) => {
    const key = obj.objection;
    if (!acc[key]) acc[key] = [];
    acc[key].push(obj);
    return acc;
  }, {});

  return (
    <div className="objections-page">
      <div className="objections-intro card">
        <Shield size={20} />
        <p>Respostas prontas para as objeções mais comuns. Consulte antes de reuniões e negociações.</p>
      </div>

      {segmentLabel && (
        <span className="objections-segment">Personalizado para: {segmentLabel}</span>
      )}

      {/* Stage filter chips */}
      <div className="stage-chips">
        {STAGES.map(s => (
          <button
            key={s.value}
            className={`stage-chip ${stageFilter === s.value ? 'active' : ''}`}
            onClick={() => setStageFilter(s.value as Stage | '')}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <Search size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar objeção..."
        />
      </div>

      <div className="objections-list">
        {Object.entries(grouped).map(([objText, variants]) => {
          const main = variants.find(v => !v.stage) || variants[0];
          const isExpanded = expandedId === main.id;
          const isSegment = main.segment !== 'geral';
          const stageVariants = variants.filter(v => v.stage);

          return (
            <div key={main.id} className={`objection-card card ${isSegment ? 'segment-specific' : ''}`}>
              <div className="objection-header" onClick={() => setExpandedId(isExpanded ? null : main.id)}>
                <h4>{objText}</h4>
                <div className="objection-meta">
                  {isSegment && <span className="badge badge-reuniao">Seu segmento</span>}
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isExpanded && (
                <div className="objection-body">
                  {/* Quick response cards */}
                  {main.quickResponses && main.quickResponses.length > 0 && (
                    <div className="quick-cards-section">
                      <span className="quick-cards-label">Respostas rápidas</span>
                      <div className="quick-cards-scroll">
                        {main.quickResponses.map((qr, i) => (
                          <div key={i} className="quick-card">
                            <p>{qr}</p>
                            <div className="quick-card-actions">
                              <button
                                className="copy-mini"
                                onClick={(e) => { e.stopPropagation(); handleCopy(qr, `${main.id}-q${i}`); }}
                              >
                                {copiedId === `${main.id}-q${i}` ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                              <SpeakButton text={qr} size={14} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common mistake */}
                  {main.commonMistake && (
                    <div className="common-mistake">
                      <AlertTriangle size={14} />
                      <div>
                        <strong>O que NÃO fazer:</strong>
                        <p>{main.commonMistake}</p>
                      </div>
                    </div>
                  )}

                  {/* Full responses */}
                  <div className="objection-responses">
                    <span className="responses-label">Respostas completas</span>
                    {main.responses.map((response, i) => (
                      <div key={i} className="response-item">
                        <span className="response-number">{i + 1}</span>
                        <p>{response}</p>
                        <SpeakButton text={response} size={14} />
                      </div>
                    ))}
                  </div>

                  {/* Stage variants */}
                  {stageVariants.length > 0 && (
                    <div className="stage-variants">
                      <span className="responses-label">Por momento da venda</span>
                      {stageVariants.map(variant => (
                        <div key={variant.id} className="stage-variant">
                          <span className="stage-badge">
                            {STAGES.find(s => s.value === variant.stage)?.label}
                          </span>
                          {variant.quickResponses?.map((qr, i) => (
                            <div key={i} className="stage-response">
                              <p>{qr}</p>
                              <SpeakButton text={qr} size={14} />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
