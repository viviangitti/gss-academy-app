import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Target, Newspaper, ExternalLink, Star, ArrowRight } from 'lucide-react';
import { loadData, KEYS } from '../services/storage';
import { fetchNews } from '../services/news';
import { getFavorites } from '../services/favorites';
import { SEGMENTS } from '../types';
import type { UserProfile, NewsItem } from '../types';
import type { Favorite } from '../services/favorites';
import './Home.css';

const TIPS = [
  'Comece cada dia revisando suas 3 metas principais de vendas.',
  'Escute mais do que fala. O cliente que fala, compra.',
  'Faça o acompanhamento em até 24h. Velocidade fecha negócios.',
  'Prepare pelo menos 3 respostas para cada objeção comum.',
  'Rituais diários criam consistência. Consistência gera resultados.',
  'Pergunte "O que te impede de fechar hoje?" para acelerar decisões.',
  'Comemore cada pequena vitória com sua equipe.',
  'Revise seus números toda sexta-feira para ajustar a rota.',
  'Antes de qualquer reunião, use o modo Pré-reunião do app.',
  'Conheça as objeções do seu segmento como a palma da mão.',
];

export default function Home() {
  const navigate = useNavigate();
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [greeting, setGreeting] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [segmentLabel, setSegmentLabel] = useState('');
  const [favs, setFavs] = useState<Favorite[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
    if (profile.segment) {
      setSegmentLabel(SEGMENTS.find(s => s.value === profile.segment)?.label || '');
      fetchNews(profile.segment).then(items => setNews(items.slice(0, 3)));
    }
    setFavs(getFavorites().sort((a, b) => b.addedAt - a.addedAt).slice(0, 3));
  }, []);

  const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
  const name = profile.name ? `, ${profile.name.split(' ')[0]}` : '';

  return (
    <div className="home">
      <div className="greeting-card card">
        <h2>{greeting}{name}!</h2>
        <p className="greeting-date">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <button className="premeeting-btn" onClick={() => navigate('/pre-reuniao')}>
        <Zap size={18} />
        <span>Vou entrar numa reunião</span>
      </button>

      <div className="tip-card card">
        <div className="tip-icon"><Target size={18} /></div>
        <p className="tip-text">{tip}</p>
      </div>

      {favs.length > 0 && (
        <div className="home-favs">
          <div className="news-section-header">
            <h3 className="section-title"><Star size={16} /> Seus favoritos</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/favoritos')}>Ver todos</button>
          </div>
          {favs.map(f => (
            <button key={`${f.type}-${f.id}`} className="home-fav-item card" onClick={() => {
              const route = f.type === 'objection' ? '/objecoes'
                : f.type === 'script' ? '/scripts'
                : f.type === 'technique' ? '/tecnicas'
                : '/scripts';
              navigate(route);
            }}>
              <span>{f.label}</span>
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
      )}

      {news.length > 0 && (
        <div className="home-news">
          <div className="news-section-header">
            <h3 className="section-title"><Newspaper size={16} /> {segmentLabel}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/noticias')}>Ver mais</button>
          </div>
          {news.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="home-news-item card">
              <h4>{item.title}</h4>
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
