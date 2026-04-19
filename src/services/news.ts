import type { Segment, NewsItem } from '../types';

export type NewsCategory = 'tudo' | 'lancamentos' | 'ofertas' | 'concorrencia' | 'mercado';

export interface CategorizedNewsItem extends NewsItem {
  category: NewsCategory;
}

// Termos base por segmento
const SEGMENT_BASE: Record<string, string> = {
  farmaceutico: 'farmacêutica medicamentos laboratório',
  automotivo: 'automotivo carros veículos concessionária',
  automotivo_luxo: 'carros luxo premium Porsche BMW Mercedes Audi',
  tecnologia: 'tecnologia software SaaS plataforma',
  varejo: 'varejo retail lojas shopping consumo',
  imobiliario: 'imobiliário imóveis construtoras incorporadora',
  financeiro: 'mercado financeiro bancos seguros fintech',
  industria: 'indústria manufatura produção',
  saude: 'saúde clínicas hospitais estética',
  educacao: 'educação ensino escolas edtech',
  servicos: 'serviços consultoria empresarial',
  agro: 'agronegócio agricultura safra commodities',
  energia: 'energia renovável sustentabilidade solar',
};

// Modificadores por categoria
const CATEGORY_MODIFIERS: Record<NewsCategory, string> = {
  tudo: '',
  lancamentos: 'lançamento novo produto inovação estreia',
  ofertas: 'promoção desconto oferta campanha condição especial',
  concorrencia: 'concorrentes disputa mercado estratégia movimento',
  mercado: 'mercado tendência análise crescimento',
};

async function fetchFromGoogleNews(query: string, limit: number): Promise<NewsItem[]> {
  const encoded = encodeURIComponent(query);
  const rssUrl = `https://news.google.com/rss/search?q=${encoded}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=${limit}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (data.status !== 'ok') return [];
    return data.items.map((item: { title: string; link: string; pubDate: string; description: string }) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description?.replace(/<[^>]*>/g, '').slice(0, 150) || '',
    }));
  } catch {
    return [];
  }
}

// Compatível com versão anterior (Home ainda usa)
export async function fetchNews(segment: Segment): Promise<NewsItem[]> {
  if (!segment) return [];
  const base = SEGMENT_BASE[segment] || segment;
  return fetchFromGoogleNews(base, 10);
}

// Nova função: busca por categoria
export async function fetchNewsByCategory(segment: Segment, category: NewsCategory): Promise<NewsItem[]> {
  if (!segment) return [];
  const base = SEGMENT_BASE[segment] || segment;
  const modifier = CATEGORY_MODIFIERS[category];
  const query = modifier ? `${base} ${modifier}` : base;
  return fetchFromGoogleNews(query, 10);
}

// Busca tudo em paralelo e agrupa por categoria
export async function fetchAllCategories(segment: Segment): Promise<Record<NewsCategory, NewsItem[]>> {
  if (!segment) {
    return { tudo: [], lancamentos: [], ofertas: [], concorrencia: [], mercado: [] };
  }

  const categories: NewsCategory[] = ['tudo', 'lancamentos', 'ofertas', 'concorrencia', 'mercado'];
  const results = await Promise.all(categories.map(cat => fetchNewsByCategory(segment, cat)));

  return {
    tudo: results[0],
    lancamentos: results[1],
    ofertas: results[2],
    concorrencia: results[3],
    mercado: results[4],
  };
}
