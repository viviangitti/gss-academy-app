import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, AlertCircle, Sparkles, Tag, Users, TrendingUp, Globe } from 'lucide-react';
import { fetchNewsByCategory } from '../services/news';
import { loadData, KEYS } from '../services/storage';
import { SEGMENTS } from '../types';
import type { NewsItem, UserProfile } from '../types';
import type { NewsCategory } from '../services/news';
import './News.css';

const CATEGORIES: { value: NewsCategory; label: string; icon: React.ComponentType<{ size?: number }>; desc: string }[] = [
  { value: 'tudo', label: 'Tudo', icon: Globe, desc: 'Todas as notícias do segmento' },
  { value: 'lancamentos', label: 'Lançamentos', icon: Sparkles, desc: 'Novidades, novos produtos e inovações' },
  { value: 'ofertas', label: 'Ofertas', icon: Tag, desc: 'Promoções, descontos e campanhas' },
  { value: 'concorrencia', label: 'Concorrência', icon: Users, desc: 'Movimentos dos concorrentes' },
  { value: 'mercado', label: 'Mercado', icon: TrendingUp, desc: 'Tendências e análises' },
];

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState('');
  const [category, setCategory] = useState<NewsCategory>('lancamentos');

  const loadNews = async (seg: string, cat: NewsCategory) => {
    setLoading(true);
    const items = await fetchNewsByCategory(seg as UserProfile['segment'], cat);
    setNews(items);
    setLoading(false);
  };

  useEffect(() => {
    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
    setSegment(profile.segment);
    if (profile.segment) {
      loadNews(profile.segment, category);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (cat: NewsCategory) => {
    setCategory(cat);
    if (segment) loadNews(segment, cat);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const segmentLabel = SEGMENTS.find(s => s.value === segment)?.label || '';
  const currentCategory = CATEGORIES.find(c => c.value === category);

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
        <button className="btn btn-outline btn-sm" onClick={() => loadNews(segment, category)} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {/* Category tabs */}
      <div className="news-categories">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              className={`news-cat-chip ${category === cat.value ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.value)}
            >
              <Icon size={13} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {currentCategory && (
        <p className="news-cat-desc">{currentCategory.desc}</p>
      )}

      {loading ? (
        <div className="news-loading">
          {[1, 2, 3].map(i => <div key={i} className="news-skeleton card" />)}
        </div>
      ) : news.length === 0 ? (
        <div className="news-empty card">
          <Newspaper size={32} />
          <p>Nenhuma notícia nesta categoria agora. Tente outra aba.</p>
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
