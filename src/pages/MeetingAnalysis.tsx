import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Sparkles, RotateCcw, Users, Shield, ArrowRight, AlertTriangle, Target, Edit3, Trash2, CheckSquare, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { addHistory } from '../services/history';
import { addTask } from '../services/day';
import ShareButton from '../components/ShareButton';
import SpeakButton from '../components/SpeakButton';
import OfflineState from '../components/OfflineState';
import { useOnline } from '../hooks/useOnline';
import './MeetingAnalysis.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

interface Analysis {
  summary: string;
  quality: number; // 1-5
  participants: string[];
  objections: string[];
  nextSteps: string[];
  warnings: string[];
  nextAction: string;
}

const ANALYSIS_PROMPT = (transcript: string) => `Você é um coach de vendas sênior. O vendedor acabou de sair de uma reunião e está te contando como foi. Analise o relato e extraia os pontos importantes.

RELATO DO VENDEDOR:
"""
${transcript}
"""

Responda EXATAMENTE neste formato JSON (sem markdown, sem crases), em português brasileiro:

{
  "summary": "<resumo da reunião em 1-2 frases, objetivo>",
  "quality": <qualidade da reunião de 1 a 5>,
  "participants": ["<pessoas mencionadas com papel se houver, ex: 'João (decisor)', 'Maria (compradora)'>"],
  "objections": ["<objeções que surgiram na reunião, em frases diretas>"],
  "nextSteps": ["<próximos passos acordados - ações concretas com prazo se houver>"],
  "warnings": ["<pontos de atenção ou sinais de alerta, ex: 'comprou de concorrente antes'>"],
  "nextAction": "<sua recomendação mais importante em 1-2 frases: o que o vendedor deve fazer agora para avançar o negócio>"
}

Se o relato não tiver informação para um campo, retorne array vazio [].
Seja DIRETO e PRÁTICO. Nada de generalidades.
NÃO inclua nenhum texto antes ou depois do JSON.`;

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SavedMeeting {
  transcript: string;
  analysis: Analysis;
}

export default function MeetingAnalysis() {
  const navigate = useNavigate();
  const isOnline = useOnline();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [manualEdit, setManualEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState('');
  const [hasSupport, setHasSupport] = useState(true);
  const [tasksCreated, setTasksCreated] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const shouldRecordRef = useRef(false); // controla reinício automático
  const restartScheduledRef = useRef(false); // evita duplo reinício (onerror + onend)

  useEffect(() => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRec) {
      setHasSupport(false);
    }

    // Restaura do histórico se veio de lá
    const saved = sessionStorage.getItem('gss_history_open');
    if (saved) {
      try {
        const entry = JSON.parse(saved);
        if (entry.type === 'meeting_analysis' && entry.data) {
          const data = entry.data as SavedMeeting;
          setTranscript(data.transcript);
          finalTranscriptRef.current = data.transcript;
          setAnalysis(data.analysis);
        }
      } catch { /* ignore */ }
      sessionStorage.removeItem('gss_history_open');
    }
  }, []);

  const handleExample = () => {
    setManualEdit(true);
    const exampleText = 'A reunião com a Alpha foi interessante. O João é o diretor e pareceu bem interessado. Já a Maria, que é a compradora, bateu muito na questão do preço, disse que temos que melhorar. Eles já viram 3 propostas de concorrentes. Combinamos que eu vou enviar o comparativo com nosso concorrente principal até sexta e marcar nova reunião na segunda.';
    setTranscript(exampleText);
    finalTranscriptRef.current = exampleText;
  };

  const handleCreateTasks = () => {
    if (!analysis) return;
    analysis.nextSteps.forEach(step => {
      addTask(step);
    });
    setTasksCreated(true);
    setTimeout(() => navigate('/'), 1500);
  };

  const startSession = () => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRec) return;

    const rec = new SpeechRec();
    rec.continuous = false; // false = mais compatível com mobile
    rec.interimResults = true;
    rec.lang = 'pt-BR';

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + ' ';
        } else {
          interimText += result[0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current);
      setInterim(interimText);
    };

    rec.onerror = () => {
      // onerror sempre é seguido de onend — deixa o onend cuidar do reinício
    };

    rec.onend = () => {
      setInterim('');
      if (shouldRecordRef.current && !restartScheduledRef.current) {
        restartScheduledRef.current = true;
        setTimeout(() => {
          restartScheduledRef.current = false;
          if (shouldRecordRef.current) startSession();
        }, 150);
      } else if (!shouldRecordRef.current) {
        setIsRecording(false);
      }
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch { /* já estava rodando */ }
  };

  const startRecording = () => {
    setError('');
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRec) {
      setError('Seu navegador não suporta gravação de voz. Use o campo de texto abaixo.');
      setManualEdit(true);
      return;
    }
    shouldRecordRef.current = true;
    setIsRecording(true);
    startSession();
  };

  const stopRecording = () => {
    shouldRecordRef.current = false;  // impede reinício automático
    recognitionRef.current?.abort();  // abort() = para imediatamente
    setIsRecording(false);
    setInterim('');
  };

  const handleAnalyze = async () => {
    const fullText = transcript.trim();
    if (!fullText || loading) return;
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      const result = await model.generateContent(ANALYSIS_PROMPT(fullText));
      const text = result.response.text().trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned) as Analysis;
      setAnalysis(parsed);

      // Salvar no histórico
      addHistory({
        type: 'meeting_analysis',
        title: parsed.summary.slice(0, 60),
        subtitle: `Qualidade ${parsed.quality}/5`,
        preview: fullText.slice(0, 140),
        data: { transcript: fullText, analysis: parsed } as SavedMeeting,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setError(`A análise ficou indisponível. ${msg ? `(${msg})` : ''} Toque para tentar de novo.`);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setTranscript('');
    setInterim('');
    setAnalysis(null);
    setError('');
    finalTranscriptRef.current = '';
    setManualEdit(false);
  };

  const handleTranscriptChange = (v: string) => {
    setTranscript(v);
    finalTranscriptRef.current = v;
  };

  const buildShareText = () => {
    if (!analysis) return '';
    const parts = [
      `📋 RESUMO DA REUNIÃO`,
      analysis.summary,
      '',
    ];
    if (analysis.participants.length) {
      parts.push('👥 Participantes:');
      analysis.participants.forEach(p => parts.push(`• ${p}`));
      parts.push('');
    }
    if (analysis.objections.length) {
      parts.push('💬 Objeções:');
      analysis.objections.forEach(o => parts.push(`• ${o}`));
      parts.push('');
    }
    if (analysis.nextSteps.length) {
      parts.push('✅ Próximos passos:');
      analysis.nextSteps.forEach(s => parts.push(`• ${s}`));
      parts.push('');
    }
    if (analysis.nextAction) {
      parts.push(`🎯 Próxima ação recomendada: ${analysis.nextAction}`);
    }
    return parts.join('\n');
  };

  const qualityLabel = (q: number) => {
    if (q >= 5) return { text: 'Excelente', color: 'excellent' };
    if (q >= 4) return { text: 'Boa', color: 'good' };
    if (q >= 3) return { text: 'Razoável', color: 'ok' };
    if (q >= 2) return { text: 'Difícil', color: 'bad' };
    return { text: 'Muito difícil', color: 'bad' };
  };

  if (analysis) {
    const q = qualityLabel(analysis.quality);
    return (
      <div className="manalysis-page">
        {/* Quality */}
        <div className={`manalysis-quality card ${q.color}`}>
          <div className="quality-stars">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className={`star ${i <= analysis.quality ? 'filled' : ''}`}>★</span>
            ))}
          </div>
          <div className="quality-info">
            <span className="quality-label">{q.text}</span>
            <p className="quality-summary">{analysis.summary}</p>
          </div>
        </div>

        {/* Participants */}
        {analysis.participants.length > 0 && (
          <div className="manalysis-section card">
            <h4><Users size={15} /> Participantes</h4>
            <ul className="manalysis-list">
              {analysis.participants.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        )}

        {/* Objections */}
        {analysis.objections.length > 0 && (
          <div className="manalysis-section card">
            <h4><Shield size={15} /> Objeções que surgiram</h4>
            <ul className="manalysis-list obj">
              {analysis.objections.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
        )}

        {/* Next steps */}
        {analysis.nextSteps.length > 0 && (
          <div className="manalysis-section card">
            <h4><ArrowRight size={15} /> Próximos passos combinados</h4>
            <ul className="manalysis-list steps">
              {analysis.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <div className="manalysis-section card warning">
            <h4><AlertTriangle size={15} /> Pontos de atenção</h4>
            <ul className="manalysis-list">
              {analysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {/* Next action */}
        {analysis.nextAction && (
          <div className="manalysis-next-action card">
            <Target size={18} />
            <div>
              <h4>Próxima ação recomendada</h4>
              <p>{analysis.nextAction}</p>
            </div>
          </div>
        )}

        {analysis.nextSteps.length > 0 && (
          <button
            className={`btn ${tasksCreated ? 'btn-copied' : 'btn-primary'} manalysis-create-tasks`}
            onClick={handleCreateTasks}
            disabled={tasksCreated}
          >
            {tasksCreated ? (
              <><CheckSquare size={16} /> Tarefas criadas! Indo para o Dia...</>
            ) : (
              <><CheckSquare size={16} /> Virar próximos passos em tarefas do dia</>
            )}
          </button>
        )}

        <div className="manalysis-result-actions">
          <ShareButton text={buildShareText()} title="Resumo da reunião" size={16} />
          <SpeakButton text={buildShareText().replace(/[📋👥💬✅🎯•]/g, '')} size={16} />
        </div>

        <button className="btn btn-outline manalysis-reset" onClick={handleReset}>
          <RotateCcw size={14} /> Analisar outra reunião
        </button>
      </div>
    );
  }

  if (!isOnline) return <OfflineState feature="a Análise de Reunião" />;
  if (!API_KEY) return <OfflineState feature="a Análise de Reunião" subtitle="Configuração de IA indisponível. Fale com o suporte." />;

  return (
    <div className="manalysis-page">
      <div className="manalysis-hero card">
        <Mic size={26} />
        <div>
          <h3>Análise pós-reunião</h3>
          <p>Conte como foi a reunião em 1-2 minutos. A IA extrai resumo, objeções e próximos passos.</p>
        </div>
      </div>

      {!manualEdit ? (
        <>
          {/* Recording area */}
          <div className={`manalysis-recorder card ${isRecording ? 'recording' : ''}`}>
            {!isRecording && !transcript && (
              <div className="recorder-empty">
                <button className="record-btn" onClick={startRecording} disabled={!hasSupport}>
                  <Mic size={28} />
                </button>
                <p className="recorder-hint">
                  {hasSupport ? 'Toque para começar a gravar' : 'Seu navegador não suporta gravação. Use o botão abaixo.'}
                </p>
                <div className="recorder-options">
                  {!hasSupport && (
                    <button className="btn btn-outline btn-sm" onClick={() => setManualEdit(true)}>
                      <Edit3 size={12} /> Digitar no lugar
                    </button>
                  )}
                  <button className="manalysis-example" onClick={handleExample}>
                    <Lightbulb size={12} /> Ver exemplo
                  </button>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="recorder-active">
                <button className="record-btn recording" onClick={stopRecording}>
                  <Square size={24} fill="currentColor" />
                </button>
                <p className="recorder-hint recording">
                  <span className="pulse-dot" /> Gravando... toque para parar
                </p>
                <div className="transcript-live">
                  <p>{transcript}<span className="interim">{interim}</span></p>
                </div>
              </div>
            )}

            {!isRecording && transcript && (
              <div className="recorder-done">
                <div className="transcript-final">
                  <h5>Seu relato:</h5>
                  <p>{transcript}</p>
                </div>
                <div className="recorder-done-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setManualEdit(true)}>
                    <Edit3 size={12} /> Editar
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={handleReset}>
                    <Trash2 size={12} /> Apagar
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={startRecording}>
                    <Mic size={12} /> Continuar
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="form-group">
          <label className="manalysis-label">Relato da reunião</label>
          <textarea
            value={transcript}
            onChange={e => handleTranscriptChange(e.target.value)}
            rows={10}
            placeholder="Escreva aqui como foi a reunião..."
            className="manalysis-textarea"
          />
        </div>
      )}

      <button
        className="btn btn-primary manalysis-analyze"
        onClick={handleAnalyze}
        disabled={!transcript.trim() || loading || isRecording}
      >
        {loading ? (
          <><Sparkles size={16} className="spinning" /> Analisando...</>
        ) : (
          <><Sparkles size={16} /> Analisar reunião</>
        )}
      </button>

      {error && <div className="manalysis-error card" onClick={handleAnalyze}>{error}</div>}
    </div>
  );
}
