import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { getObjections } from '../services/content';
import { loadData, KEYS } from '../services/storage';
import { SEGMENTS } from '../types';
import type { UserProfile } from '../types';
import type { Objection } from '../services/content';
import './Objections.css';

export default function Objections() {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [segmentLabel, setSegmentLabel] = useState('');

  useEffect(() => {
    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
    setObjections(getObjections(profile.segment));
    setSegmentLabel(SEGMENTS.find(s => s.value === profile.segment)?.label || '');
  }, []);

  const filtered = objections.filter(o =>
    o.objection.toLowerCase().includes(search.toLowerCase()) ||
    o.responses.some(r => r.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="objections-page">
      <div className="objections-intro card">
        <Shield size={20} />
        <p>Respostas prontas para as objeções mais comuns. Consulte antes de reuniões e negociações.</p>
      </div>

      {segmentLabel && (
        <span className="objections-segment">Personalizado para: {segmentLabel}</span>
      )}

      <div className="search-bar">
        <Search size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar objeção..."
        />
      </div>

      <div className="objections-list">
        {filtered.map(obj => {
          const isExpanded = expandedId === obj.id;
          const isSegment = obj.segment !== 'geral';
          return (
            <div key={obj.id} className={`objection-card card ${isSegment ? 'segment-specific' : ''}`}>
              <div className="objection-header" onClick={() => setExpandedId(isExpanded ? null : obj.id)}>
                <h4>{obj.objection}</h4>
                <div className="objection-meta">
                  {isSegment && <span className="badge badge-reuniao">Seu segmento</span>}
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isExpanded && (
                <div className="objection-responses">
                  {obj.responses.map((response, i) => (
                    <div key={i} className="response-item">
                      <span className="response-number">{i + 1}</span>
                      <p>{response}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
