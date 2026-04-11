import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchNews } from '../services/news';
import { loadData, KEYS } from '../services/storage';
import { SEGMENTS } from '../types';
import type { NewsItem, UserProfile } from '../types';
import './News.css';

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState('');

  const loadNews = async (seg: string) => {
    setLoading(true);
    const items = await fetchNews(seg as UserProfile['segment']);
    setNews(items);
    setLoading(false);
  };

  useEffect(() => {
    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
    setSegment(profile.segment);
    if (profile.segment) {
      loadNews(profile.segment);
    } else {
      setLoading(false);
    }
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const segmentLabel = SEGMENTS.find(s => s.value === segment)?.label || '';

  if (!segment) {
    return (
      <div className="news-page">
        <div className="news-empty card">
          <AlertCircle size={32} />
          <h3>Configure seu segmento</h3>
          <p>Vá em <strong>Perfil</strong> e selecione seu segmento de atuação para receber notícias personalizadas do seu mercado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="news-header">
        <div>
          <h3 className="section-title"><Newspaper size={16} /> Notícias</h3>
          <span className="news-segment">{segmentLabel}</span>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => loadNews(segment)} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Atualizar
        </button>
      </div>

      {loading ? (
        <div className="news-loading">
          {[1, 2, 3].map(i => <div key={i} className="news-skeleton card" />)}
        </div>
      ) : news.length === 0 ? (
        <div className="news-empty card">
          <Newspaper size={32} />
          <p>Nenhuma notícia encontrada para este segmento.</p>
        </div>
      ) : (
        <div className="news-list">
          {news.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="news-card card">
              <h4 className="news-title">{item.title}</h4>
              {item.description && <p className="news-desc">{item.description}</p>}
              <div className="news-footer">
                <span className="news-date">{formatDate(item.pubDate)}</span>
                <ExternalLink size={12} />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
