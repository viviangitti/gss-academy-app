import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import { useBrand } from './BrandContext';
import { getBrand } from './data/brands';

// Notícias da marca — o vendedor não pode ser pego de surpresa.
//
// No showroom, o cliente chega tendo lido matéria de ontem ("vi que a marca vai
// lançar X", "li que teve recall"). Quem não acompanha perde a conversa.
//
// Usa o /api/news, que já existia (proxy do Google Notícias, cache de 15 min,
// sem custo e sem guardar nada). Não é IA: é feed público.

interface Item {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
}

// O que buscar por marca. Aspas fazem o Google tratar como expressão.
const BUSCA: Record<string, string> = {
  ramasa: 'Jaecoo OR Omoda OR "Caoa Chery" carro Brasil',
};

const API = import.meta.env.DEV ? 'https://eleva-five.vercel.app/api/news' : '/api/news';

function quando(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 60) return `há ${Math.max(1, min)} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h}h`;
  const dias = Math.round(h / 24);
  return dias === 1 ? 'ontem' : `há ${dias} dias`;
}

// O título do Google News vem com " - Fonte" no fim. Separa pra exibir a fonte.
function separaFonte(t: string): { titulo: string; fonte: string } {
  const i = t.lastIndexOf(' - ');
  if (i > 20) return { titulo: t.slice(0, i), fonte: t.slice(i + 3) };
  return { titulo: t, fonte: '' };
}

export default function Noticias() {
  const { brandId } = useBrand();
  const marca = getBrand(brandId).name;
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const buscar = () => {
    const q = BUSCA[brandId];
    if (!q) {
      setCarregando(false);
      setErro('Esta marca ainda não tem busca de notícias configurada.');
      return;
    }
    setCarregando(true);
    setErro('');
    fetch(`${API}?q=${encodeURIComponent(q)}&limit=12`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.status === 'ok' && Array.isArray(d.items)) setItens(d.items);
        else setErro('Não consegui carregar as notícias agora.');
      })
      .catch(() => setErro('Não consegui carregar as notícias agora.'))
      .finally(() => setCarregando(false));
  };

  useEffect(buscar, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="wp-news">
      <Link to="/eleva" className="wp-news-back">
        <ChevronLeft size={16} className="wp-ico" /> Voltar
      </Link>

      <div className="wp-news-hero">
        <div className="wp-news-hero-icon"><Newspaper size={18} className="wp-ico" /></div>
        <div>
          <h1 className="wp-news-title">Notícias</h1>
          <p className="wp-news-sub">O que saiu sobre {marca} e as marcas que você vende. Chegue no cliente sabendo.</p>
        </div>
        <button type="button" className="wp-news-refresh" onClick={buscar} aria-label="Atualizar">
          <RefreshCw size={16} className="wp-ico" />
        </button>
      </div>

      {carregando && <p className="wp-news-msg">Buscando…</p>}
      {erro && !carregando && <p className="wp-news-msg">{erro}</p>}
      {!carregando && !erro && itens.length === 0 && <p className="wp-news-msg">Nada novo por enquanto.</p>}

      <div className="wp-news-list">
        {itens.map((it, i) => {
          const { titulo, fonte } = separaFonte(it.title || '');
          return (
            <a key={i} className="wp-news-item" href={it.link} target="_blank" rel="noopener noreferrer">
              <b>{titulo}</b>
              <span>
                {fonte && <i>{fonte}</i>}
                {fonte && quando(it.pubDate) && ' · '}
                {quando(it.pubDate)}
              </span>
              <ExternalLink size={14} className="wp-ico wp-news-ext" />
            </a>
          );
        })}
      </div>

      <p className="wp-news-foot">
        Notícias públicas do Google Notícias. Confirme qualquer informação de produto na
        tabela oficial antes de repassar ao cliente.
      </p>
    </div>
  );
}
