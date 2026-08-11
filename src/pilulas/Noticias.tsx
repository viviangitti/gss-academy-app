import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Newspaper, ExternalLink, RefreshCw, Globe, Users, Sparkles, TrendingUp, Tag, Zap } from 'lucide-react';
import { useBrand } from './BrandContext';
import { getBrand } from './data/brands';
import type { LucideIcon } from 'lucide-react';

// Notícias — o vendedor não pode ser pego de surpresa.
//
// No showroom o cliente chega tendo lido matéria de ontem: "vi que a chinesa vai
// baixar preço", "li que o imposto do elétrico subiu", "meu cunhado disse que a
// BYD tá dando mais desconto". Notícia só da própria marca não resolve isso — o
// que decide a conversa é o que o CONCORRENTE e o MERCADO estão fazendo.
//
// Por isso a tela é dividida em frentes, igual ao MAESTR.IA: concorrência,
// mercado, lançamentos, condições e eletrificados.
//
// Usa o /api/news, que já existia (proxy do Google Notícias, cache de 15 min,
// sem custo e sem guardar nada). Não é IA: é feed público.

interface Item {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
}

type Frente = 'tudo' | 'concorrencia' | 'mercado' | 'lancamentos' | 'condicoes' | 'eletrificados';

const FRENTES: { id: Frente; label: string; Icon: LucideIcon }[] = [
  { id: 'tudo', label: 'Tudo', Icon: Globe },
  { id: 'concorrencia', label: 'Concorrência', Icon: Users },
  { id: 'mercado', label: 'Mercado', Icon: TrendingUp },
  { id: 'lancamentos', label: 'Lançamentos', Icon: Sparkles },
  { id: 'condicoes', label: 'Condições', Icon: Tag },
  { id: 'eletrificados', label: 'Elétricos e híbridos', Icon: Zap },
];

// As buscas por marca e por frente.
//
// 'tudo' e 'lancamentos' falam da marca que a pessoa vende. 'concorrencia' fala
// de QUEM DISPUTA o mesmo cliente — no caso do Jaecoo/Omoda, os SUVs chineses e
// os japoneses/americanos da mesma faixa. Mercado e condições são do setor.
const BUSCAS: Record<string, Record<Frente, string>> = {
  ramasa: {
    tudo: 'Jaecoo OR Omoda OR "Caoa Chery" OR Chery carro Brasil',
    concorrencia:
      '(GWM OR Haval OR BYD OR "Great Wall" OR "Jeep Compass" OR "Corolla Cross" OR "Honda HR-V" OR "Volkswagen T-Cross") SUV Brasil',
    mercado:
      'mercado automotivo Brasil (emplacamentos OR Fenabrave OR "venda de carros" OR concessionárias OR "imposto de importação" carro)',
    lancamentos: '(lançamento OR estreia OR "chega ao Brasil") (SUV OR carro) Brasil 2026',
    condicoes:
      '(desconto OR "taxa zero" OR financiamento OR "tabela de preços" OR promoção) carro OR SUV Brasil',
    eletrificados: '(carro elétrico OR híbrido OR eletrificado) Brasil (venda OR preço OR recarga OR autonomia)',
  },
};

// Marca sem busca configurada ainda: usa o nome dela e o assunto do setor.
function buscaPadrao(nome: string, f: Frente): string {
  const base = `"${nome.split('·')[0].trim()}"`;
  const porFrente: Record<Frente, string> = {
    tudo: base,
    concorrencia: `${base} concorrente OR mercado`,
    mercado: `${base} mercado OR setor`,
    lancamentos: `${base} lançamento`,
    condicoes: `${base} promoção OR desconto`,
    eletrificados: base,
  };
  return porFrente[f];
}

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
  const [frente, setFrente] = useState<Frente>('tudo');
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const buscar = (f: Frente) => {
    const q = BUSCAS[brandId]?.[f] || buscaPadrao(marca, f);
    setCarregando(true);
    setErro('');
    setItens([]);
    fetch(`${API}?q=${encodeURIComponent(q)}&limit=14`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.status === 'ok' && Array.isArray(d.items)) setItens(d.items);
        else setErro('Não consegui carregar as notícias agora.');
      })
      .catch(() => setErro('Não consegui carregar as notícias agora.'))
      .finally(() => setCarregando(false));
  };

  useEffect(() => { buscar(frente); }, [brandId, frente]); // eslint-disable-line react-hooks/exhaustive-deps

  const legenda: Record<Frente, string> = {
    tudo: `O que saiu sobre ${marca} e as marcas que você vende.`,
    concorrencia: 'O que os concorrentes diretos estão anunciando. É o que o cliente compara com você.',
    mercado: 'Vendas, emplacamentos e regras do setor — o pano de fundo da negociação.',
    lancamentos: 'Modelos chegando ao mercado. Cliente pergunta sobre o que ainda nem chegou.',
    condicoes: 'Descontos, taxa e campanha que viraram notícia. Confirme sempre na tabela da casa.',
    eletrificados: 'Elétrico e híbrido: preço, autonomia e recarga. A dúvida mais nova do showroom.',
  };

  return (
    <div className="wp-news">
      <Link to="/eleva" className="wp-news-back">
        <ChevronLeft size={16} className="wp-ico" /> Voltar
      </Link>

      <div className="wp-news-hero">
        <div className="wp-news-hero-icon"><Newspaper size={18} className="wp-ico" /></div>
        <div>
          <h1 className="wp-news-title">Notícias</h1>
          <p className="wp-news-sub">{legenda[frente]}</p>
        </div>
        <button type="button" className="wp-news-refresh" onClick={() => buscar(frente)} aria-label="Atualizar">
          <RefreshCw size={16} className="wp-ico" />
        </button>
      </div>

      <div className="wp-news-frentes">
        {FRENTES.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`wp-news-frente ${frente === f.id ? 'on' : ''}`}
            onClick={() => setFrente(f.id)}
          >
            <f.Icon size={14} className="wp-ico" /> {f.label}
          </button>
        ))}
      </div>

      {carregando && <p className="wp-news-msg">Buscando…</p>}
      {erro && !carregando && <p className="wp-news-msg">{erro}</p>}
      {!carregando && !erro && itens.length === 0 && <p className="wp-news-msg">Nada novo nesta frente por enquanto.</p>}

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
        Notícias públicas do Google Notícias. Confirme qualquer informação de produto, preço ou
        condição na tabela oficial antes de repassar ao cliente.
      </p>
    </div>
  );
}
