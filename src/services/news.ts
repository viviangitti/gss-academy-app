import type { Segment, NewsItem } from '../types';

const SEGMENT_KEYWORDS: Record<string, string> = {
  farmaceutico: 'indústria farmacêutica medicamentos',
  automotivo: 'indústria automotiva carros veículos',
  automotivo_luxo: 'carros luxo premium Porsche BMW Mercedes Audi',
  tecnologia: 'tecnologia software inovação digital',
  varejo: 'varejo retail consumo lojas',
  imobiliario: 'mercado imobiliário imóveis construção',
  financeiro: 'mercado financeiro bancos seguros fintech',
  industria: 'indústria manufatura produção fábricas',
  saude: 'saúde clínicas hospitais estética',
  educacao: 'educação ensino escolas edtech',
  servicos: 'serviços consultoria empresarial',
  agro: 'agronegócio agricultura safra commodities',
  energia: 'energia renovável sustentabilidade solar',
};

export async function fetchNews(segment: Segment): Promise<NewsItem[]> {
  if (!segment) return [];

  const query = encodeURIComponent(SEGMENT_KEYWORDS[segment] || segment);
  const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=10`;

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
