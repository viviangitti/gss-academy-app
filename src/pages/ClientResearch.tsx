import { useState } from 'react';
import { Search, Sparkles, Building2, TrendingUp, AlertCircle, HelpCircle, Shield, BookOpen, RotateCcw, Copy, Check } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadData, KEYS } from '../services/storage';
import { SEGMENTS } from '../types';
import type { UserProfile } from '../types';
import ShareButton from '../components/ShareButton';
import './ClientResearch.css';

// Removido ShareButton duplicado

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

interface Dossie {
  found: boolean;
  overview: string;
  sector: string;
  size: string;
  context: string[];
  possiblePains: string[];
  smartQuestions: string[];
  likelyObjections: string[];
  recommendedApproach: string;
  approachReason: string;
}

const RESEARCH_PROMPT = (query: string, mySegment: string) => `Você é um consultor de vendas B2B que prepara vendedores para reuniões. O vendedor vai fazer uma reunião e precisa de um dossiê rápido sobre a empresa cliente.

EMPRESA / CNPJ PESQUISADO: ${query}
SEGMENTO DO VENDEDOR: ${mySegment || 'não especificado'}

Responda EXATAMENTE neste formato JSON (sem markdown, sem crases), em português brasileiro. Se NÃO conhecer a empresa, marque found: false e dê orientações GENÉRICAS baseadas no tipo provável de negócio (ex: pelo nome "Transportadora X" você pode inferir que é logística).

{
  "found": <true se conhece a empresa com certeza, false se não conhece ou só está inferindo>,
  "overview": "<o que a empresa faz em 1-2 frases. Se não conhece, infira pelo nome ou diga 'sem informação pública'>",
  "sector": "<setor de atuação>",
  "size": "<porte provável, ex: 'pequena/média/grande empresa' ou 'sem informação'>",
  "context": ["<2-3 pontos sobre contexto: tendências do setor, possíveis movimentos, desafios comuns>"],
  "possiblePains": ["<3-4 dores prováveis baseadas no perfil de empresa/setor>"],
  "smartQuestions": ["<5 perguntas INTELIGENTES de descoberta, específicas para esse tipo de negócio. Use 'vocês' na 2ª pessoa. Evite genéricas como 'qual seu desafio?'>"],
  "likelyObjections": ["<2-3 objeções que esse perfil de cliente costuma dar>"],
  "recommendedApproach": "<nome da técnica de vendas recomendada: Perguntas Estratégicas, Venda Consultiva, Venda Desafiadora, Qualificação em 4 Passos, Conexão e Confiança, Histórias que Vendem, Método Sanduíche, ou Fechamento Alternativo>",
  "approachReason": "<1 frase explicando por que essa técnica se adequa a esse cliente>"
}

IMPORTANTE:
- Seja HONESTO: se não tem info pública da empresa, deixe found: false
- Ainda assim preencha com base no que se pode INFERIR do nome/contexto
- Se parece CNPJ mas não tem info, infira pelo setor possível
- As perguntas inteligentes devem ser ESPECÍFICAS, não clichês
- NÃO inclua nenhum texto antes ou depois do JSON`;

export default function ClientResearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dossie, setDossie] = useState<Dossie | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError('');
    setDossie(null);

    const profile = loadData<UserProfile>(KEYS.PROFILE, { name: '', role: '', company: '', segment: '' });
    const sLabel = SEGMENTS.find(s => s.value === profile.segment)?.label || '';

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      const result = await model.generateContent(RESEARCH_PROMPT(query, sLabel));
      const text = result.response.text().trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned) as Dossie;
      setDossie(parsed);
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
    return [
      `📋 DOSSIÊ — ${query}`,
      dossie.overview,
      '',
      '💡 Possíveis dores:',
      ...dossie.possiblePains.map(p => `• ${p}`),
      '',
      '❓ Perguntas para a reunião:',
      ...dossie.smartQuestions.map((q, i) => `${i + 1}. ${q}`),
      '',
      `🎯 Técnica recomendada: ${dossie.recommendedApproach}`,
    ].join('\n');
  };

  if (dossie) {
    return (
      <div className="cresearch-page">
        {/* Header do dossiê */}
        <div className="dossie-header card">
          <div className="dossie-company">
            <Building2 size={18} />
            <div>
              <h3>{query}</h3>
              <span className="dossie-sector">{dossie.sector} {dossie.size && `• ${dossie.size}`}</span>
            </div>
          </div>
          {!dossie.found && (
            <span className="dossie-badge">Inferido</span>
          )}
        </div>

        {/* Overview */}
        <div className="cresearch-section card">
          <p className="dossie-overview">{dossie.overview}</p>
        </div>

        {/* Contexto */}
        {dossie.context.length > 0 && (
          <div className="cresearch-section card">
            <h4><TrendingUp size={15} /> Contexto do mercado</h4>
            <ul className="cresearch-list">
              {dossie.context.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        {/* Possíveis dores */}
        {dossie.possiblePains.length > 0 && (
          <div className="cresearch-section card">
            <h4><AlertCircle size={15} /> Possíveis dores</h4>
            <ul className="cresearch-list pains">
              {dossie.possiblePains.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        )}

        {/* Perguntas inteligentes */}
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

        {/* Objeções prováveis */}
        {dossie.likelyObjections.length > 0 && (
          <div className="cresearch-section card">
            <h4><Shield size={15} /> Objeções prováveis</h4>
            <ul className="cresearch-list obj">
              {dossie.likelyObjections.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
        )}

        {/* Técnica recomendada */}
        <div className="cresearch-approach card">
          <BookOpen size={18} />
          <div>
            <h4>Técnica recomendada</h4>
            <p className="approach-name">{dossie.recommendedApproach}</p>
            <p className="approach-reason">{dossie.approachReason}</p>
          </div>
        </div>

        <div className="cresearch-result-actions">
          <ShareButton text={buildShareText()} title={`Dossiê ${query}`} size={16} />
        </div>

        <button className="btn btn-outline cresearch-reset" onClick={handleReset}>
          <RotateCcw size={14} /> Pesquisar outra empresa
        </button>
      </div>
    );
  }

  return (
    <div className="cresearch-page">
      <div className="cresearch-hero card">
        <Search size={26} />
        <div>
          <h3>Pesquisa de Cliente</h3>
          <p>Antes da reunião, descubra tudo em 10 segundos. Nome da empresa ou CNPJ.</p>
        </div>
      </div>

      <div className="cresearch-search">
        <div className="search-bar-big">
          <Search size={18} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Ex: Alpha Tecnologia ou 12.345.678/0001-99"
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

      <div className="cresearch-explainer card">
        <h4>O que você vai ver</h4>
        <ul>
          <li>📋 Resumo do que a empresa faz</li>
          <li>📊 Contexto do mercado dela</li>
          <li>💡 Possíveis dores que pode resolver</li>
          <li>❓ 5 perguntas inteligentes para fazer</li>
          <li>🛡️ Objeções prováveis</li>
          <li>🎯 Técnica de vendas recomendada</li>
        </ul>
      </div>
    </div>
  );
}
