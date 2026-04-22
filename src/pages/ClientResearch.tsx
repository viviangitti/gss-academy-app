import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Building2, User as UserIcon, TrendingUp, AlertCircle, HelpCircle, Shield, BookOpen, RotateCcw, Copy, Check, Zap, Lightbulb } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadData, KEYS } from '../services/storage';
import { addHistory } from '../services/history';
import { SEGMENTS } from '../types';
import type { UserProfile } from '../types';
import ShareButton from '../components/ShareButton';
import OfflineState from '../components/OfflineState';
import { useOnline } from '../hooks/useOnline';
import './ClientResearch.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

type ClientType = 'pj' | 'pf';

interface Dossie {
  found: boolean;
  overview: string;
  sector: string;   // Para PJ: setor da empresa. Para PF: perfil/ocupação provável.
  size: string;     // Para PJ: porte. Para PF: perfil de consumo (ex: "alto padrão").
  context: string[];
  possiblePains: string[];
  smartQuestions: string[];
  likelyObjections: string[];
  recommendedApproach: string;
  approachReason: string;
}

const PJ_PROMPT = (query: string, vendorSegment: string, vendorRole: string) => `Você é um consultor de vendas B2B que prepara vendedores para uma reunião. O vendedor está preparando uma reunião de vendas com uma empresa cliente.

VENDEDOR:
- Cargo: ${vendorRole || 'vendedor'}
- Vende no segmento: ${vendorSegment || 'não especificado'}

EMPRESA CLIENTE (potencial comprador): ${query}

IMPORTANTE: O cliente pode ter qualquer ramo de atuação — o que importa é que ele é o COMPRADOR do que o vendedor vende. O dossiê deve ajudar a ENTENDER O CLIENTE como comprador, considerando:
- O ramo do cliente pode gerar demandas específicas pelo produto que o vendedor vende
- Ex: se vendedor vende carros de luxo e o cliente é dono de uma rede de alimentos, trate-o como empresário de alto padrão que pode querer carros para frota executiva ou uso pessoal

Responda EXATAMENTE neste formato JSON (sem markdown, sem crases), em português brasileiro. Se NÃO conhecer a empresa, marque found: false e dê orientações baseadas no que se pode inferir.

{
  "found": <true se conhece, false se não conhece ou só está inferindo>,
  "overview": "<o que a empresa faz em 1-2 frases>",
  "sector": "<setor/ramo de atuação do cliente>",
  "size": "<porte da empresa>",
  "context": ["<2-3 pontos: contexto do ramo do cliente E como isso se conecta com o que o vendedor vende>"],
  "possiblePains": ["<3-4 dores/necessidades que esse cliente pode ter E que o vendedor pode resolver>"],
  "smartQuestions": ["<5 perguntas de descoberta específicas para esse cliente comprando o produto do vendedor. Use 'vocês'>"],
  "likelyObjections": ["<2-3 objeções prováveis desse cliente>"],
  "recommendedApproach": "<Perguntas Estratégicas | Venda Consultiva | Venda Desafiadora | Qualificação em 4 Passos | Conexão e Confiança | Histórias que Vendem | Método Sanduíche | Fechamento Alternativo>",
  "approachReason": "<1 frase explicando por que essa técnica se adequa>"
}

NÃO inclua nenhum texto antes ou depois do JSON.`;

const PF_PROMPT = (query: string, vendorSegment: string, vendorRole: string) => `Você é um consultor de vendas que prepara vendedores para atender um cliente pessoa física. O vendedor vai conversar com um cliente individual que está considerando comprar o produto/serviço que ele vende.

VENDEDOR:
- Cargo: ${vendorRole || 'vendedor'}
- Vende no segmento: ${vendorSegment || 'não especificado'}

CLIENTE PESSOA FÍSICA: ${query}

Esse é um cliente individual (consumidor final). Pode ser:
- Uma pessoa cujo nome você reconhece publicamente (empresário, figura pública, profissional conhecido)
- Um nome qualquer sobre o qual o vendedor sabe algo (ex: "João Silva - engenheiro, casado, 2 filhos")
- Uma descrição de perfil (ex: "empresário do ramo alimentício, 45 anos")

IMPORTANTE:
- Se o nome for de alguém PÚBLICO, use o que você sabe sobre essa pessoa
- Se for um nome comum sem contexto, infira um PERFIL DE COMPRADOR realista para o produto do vendedor
- Foque no cliente como COMPRADOR do produto do vendedor — motivações, critérios de escolha, objeções típicas

Responda EXATAMENTE neste formato JSON (sem markdown, sem crases), em português brasileiro:

{
  "found": <true se conhece a pessoa publicamente, false se está inferindo perfil>,
  "overview": "<quem é a pessoa em 1-2 frases: ocupação, contexto de vida>",
  "sector": "<ocupação/perfil profissional provável>",
  "size": "<perfil de consumo: 'alto padrão' | 'médio-alto' | 'classe média' | 'popular'>",
  "context": ["<2-3 pontos: contexto de vida/profissão E como isso se conecta com a compra>"],
  "possiblePains": ["<3-4 necessidades/motivações que podem levar essa pessoa a comprar>"],
  "smartQuestions": ["<5 perguntas de descoberta para um cliente pessoa física. Use 'você'. Ex: 'Você vai usar mais no dia a dia ou em ocasiões específicas?'>"],
  "likelyObjections": ["<2-3 objeções típicas desse perfil de pessoa>"],
  "recommendedApproach": "<Perguntas Estratégicas | Venda Consultiva | Venda Desafiadora | Qualificação em 4 Passos | Conexão e Confiança | Histórias que Vendem | Método Sanduíche | Fechamento Alternativo>",
  "approachReason": "<1 frase explicando por que essa técnica se adequa>"
}

NÃO inclua nenhum texto antes ou depois do JSON.`;

export default function ClientResearch() {
  const navigate = useNavigate();
  const isOnline = useOnline();
  const [clientType, setClientType] = useState<ClientType>('pj');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dossie, setDossie] = useState<Dossie | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Se veio do histórico, carrega o dossiê já gerado
    const saved = sessionStorage.getItem('gss_history_open');
    if (saved) {
      try {
        const entry = JSON.parse(saved);
        if (entry.type === 'client_research' && entry.data) {
          setQuery(entry.title);
          setDossie(entry.data as Dossie);
          if (entry.clientType === 'pf') setClientType('pf');
        }
      } catch { /* ignore */ }
      sessionStorage.removeItem('gss_history_open');
    }
  }, []);

  const handlePrepareMeeting = () => {
    if (!dossie) return;
    const label = clientType === 'pj' ? 'Empresa' : 'Cliente';
    const note = `${label}: ${query}\n${dossie.overview}\n\nPossíveis dores/motivações:\n${dossie.possiblePains.map(p => `- ${p}`).join('\n')}\n\nPerguntas:\n${dossie.smartQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nObjeções prováveis:\n${dossie.likelyObjections.map(o => `- ${o}`).join('\n')}\n\nTécnica: ${dossie.recommendedApproach}`;
    localStorage.setItem('gss_premeeting_notes', note);
    navigate('/pre-reuniao');
  };

  const handleExample = () => {
    if (clientType === 'pj') {
      setQuery('Ambev');
    } else {
      setQuery('Empresário do ramo alimentício, 45 anos, interessado em carro de luxo');
    }
    setTimeout(() => handleSearch(), 100);
  };

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError('');
    setDossie(null);

    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
    const sLabel = SEGMENTS.find(s => s.value === profile.segment)?.label || '';
    const prompt = clientType === 'pj'
      ? PJ_PROMPT(query, sLabel, profile.role)
      : PF_PROMPT(query, sLabel, profile.role);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned) as Dossie;
      setDossie(parsed);

      addHistory({
        type: 'client_research',
        title: query,
        subtitle: `${clientType === 'pj' ? '🏢' : '👤'} ${parsed.sector}${parsed.size ? ' • ' + parsed.size : ''}`,
        preview: parsed.overview,
        data: { ...parsed, clientType },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setError(`A pesquisa ficou indisponível. ${msg ? `(${msg})` : ''} Toque para tentar de novo.`);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setQuery('');
    setDossie(null);
    setError('');
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* ignore */ }
  };

  const buildShareText = () => {
    if (!dossie) return '';
    const icon = clientType === 'pj' ? '🏢' : '👤';
    return [
      `📋 DOSSIÊ ${icon} — ${query}`,
      dossie.overview,
      '',
      '💡 Possíveis dores / motivações:',
      ...dossie.possiblePains.map(p => `• ${p}`),
      '',
      '❓ Perguntas para a reunião:',
      ...dossie.smartQuestions.map((q, i) => `${i + 1}. ${q}`),
      '',
      `🎯 Técnica recomendada: ${dossie.recommendedApproach}`,
    ].join('\n');
  };

  if (dossie) {
    const HeaderIcon = clientType === 'pj' ? Building2 : UserIcon;
    return (
      <div className="cresearch-page">
        <div className="dossie-header card">
          <div className="dossie-company">
            <HeaderIcon size={18} />
            <div>
              <h3>{query}</h3>
              <span className="dossie-sector">{dossie.sector} {dossie.size && `• ${dossie.size}`}</span>
            </div>
          </div>
          {!dossie.found && (
            <span className="dossie-badge">Inferido</span>
          )}
        </div>

        <div className="cresearch-section card">
          <p className="dossie-overview">{dossie.overview}</p>
        </div>

        {dossie.context.length > 0 && (
          <div className="cresearch-section card">
            <h4><TrendingUp size={15} /> Contexto</h4>
            <ul className="cresearch-list">
              {dossie.context.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        {dossie.possiblePains.length > 0 && (
          <div className="cresearch-section card">
            <h4><AlertCircle size={15} /> {clientType === 'pj' ? 'Possíveis dores' : 'Possíveis motivações'}</h4>
            <ul className="cresearch-list pains">
              {dossie.possiblePains.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        )}

        {dossie.smartQuestions.length > 0 && (
          <div className="cresearch-section card highlight">
            <div className="section-header">
              <h4><HelpCircle size={15} /> Perguntas inteligentes para a reunião</h4>
              <button
                className="copy-mini"
                onClick={() => handleCopy(dossie.smartQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n'), 'questions')}
              >
                {copied === 'questions' ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <ol className="cresearch-questions">
              {dossie.smartQuestions.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
          </div>
        )}

        {dossie.likelyObjections.length > 0 && (
          <div className="cresearch-section card">
            <h4><Shield size={15} /> Objeções prováveis</h4>
            <ul className="cresearch-list obj">
              {dossie.likelyObjections.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
        )}

        <div className="cresearch-approach card">
          <BookOpen size={18} />
          <div>
            <h4>Técnica recomendada</h4>
            <p className="approach-name">{dossie.recommendedApproach}</p>
            <p className="approach-reason">{dossie.approachReason}</p>
          </div>
        </div>

        <button className="btn btn-primary cresearch-prepare" onClick={handlePrepareMeeting}>
          <Zap size={16} /> Preparar reunião com {query}
        </button>

        <div className="cresearch-result-actions">
          <ShareButton text={buildShareText()} title={`Dossiê ${query}`} size={16} />
        </div>

        <button className="btn btn-outline cresearch-reset" onClick={handleReset}>
          <RotateCcw size={14} /> Pesquisar outro cliente
        </button>
      </div>
    );
  }

  const placeholder = clientType === 'pj'
    ? 'Ex: Alpha Tecnologia ou 12.345.678/0001-99'
    : 'Ex: João Silva - engenheiro, 40 anos';

  if (!isOnline) return <OfflineState feature="a Pesquisa de Cliente" />;

  return (
    <div className="cresearch-page">
      <div className="cresearch-hero card">
        <Search size={26} />
        <div>
          <h3>Pesquisa de Cliente</h3>
          <p>Dossiê completo do comprador em 10 segundos. Funciona pra empresa (PJ) ou pessoa física (PF).</p>
        </div>
      </div>

      {/* Toggle PJ / PF */}
      <div className="client-type-toggle">
        <button
          className={`type-opt ${clientType === 'pj' ? 'active' : ''}`}
          onClick={() => { setClientType('pj'); setQuery(''); }}
        >
          <Building2 size={14} /> Empresa
        </button>
        <button
          className={`type-opt ${clientType === 'pf' ? 'active' : ''}`}
          onClick={() => { setClientType('pf'); setQuery(''); }}
        >
          <UserIcon size={14} /> Pessoa
        </button>
      </div>

      <div className="cresearch-search">
        <div className="search-bar-big">
          <Search size={18} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            autoFocus
          />
        </div>
        <button
          className="btn btn-primary cresearch-analyze"
          onClick={handleSearch}
          disabled={!query.trim() || loading}
        >
          {loading ? (
            <><Sparkles size={16} className="spinning" /> Pesquisando...</>
          ) : (
            <><Sparkles size={16} /> Gerar dossiê</>
          )}
        </button>
      </div>

      {error && <div className="cresearch-error card" onClick={handleSearch}>{error}</div>}

      <button className="cresearch-example" onClick={handleExample}>
        <Lightbulb size={14} /> {clientType === 'pj' ? 'Ver exemplo com "Ambev"' : 'Ver exemplo: empresário de alimentos'}
      </button>

      <div className="cresearch-explainer card">
        <h4>O que você vai ver</h4>
        <ul>
          <li>📋 Resumo de quem é o cliente</li>
          <li>📊 Contexto e conexão com o que você vende</li>
          <li>💡 {clientType === 'pj' ? 'Dores que você pode resolver' : 'Motivações pra comprar'}</li>
          <li>❓ 5 perguntas inteligentes pra reunião</li>
          <li>🛡️ Objeções prováveis</li>
          <li>🎯 Técnica de vendas recomendada</li>
        </ul>
      </div>
    </div>
  );
}
