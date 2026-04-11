import { Flame, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { URGENCY_TRIGGERS } from '../services/content';
import SpeakButton from '../components/SpeakButton';
import './Urgency.css';

export default function Urgency() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* fallback */ }
  };

  return (
    <div className="urgency-page">
      <div className="urgency-intro card">
        <Flame size={20} />
        <p>Frases que criam urgência legítima sem ser apelativo. Use com responsabilidade para acelerar decisões.</p>
      </div>

      <div className="urgency-list">
        {URGENCY_TRIGGERS.map(trigger => (
          <div key={trigger.id} className="urgency-category card">
            <div className="urgency-cat-header">
              <span className="urgency-icon">{trigger.icon}</span>
              <h4>{trigger.category}</h4>
            </div>
            <div className="urgency-phrases">
              {trigger.phrases.map((phrase, i) => (
                <div key={i} className="urgency-phrase">
                  <p>{phrase}</p>
                  <div className="urgency-actions">
                    <button
                      className="copy-mini"
                      onClick={() => handleCopy(phrase, `${trigger.id}-${i}`)}
                    >
                      {copiedId === `${trigger.id}-${i}` ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    <SpeakButton text={phrase} size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
