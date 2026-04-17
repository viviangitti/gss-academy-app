import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RotateCcw, Mic, MicOff, Swords } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sendMessage, resetChat } from '../services/gemini';
import { loadData, saveData, KEYS } from '../services/storage';
import type { ChatMessage, Client } from '../types';
import SpeakButton from '../components/SpeakButton';
import './AICoach.css';

const QUICK_PROMPTS = [
  'Como responder à objeção de preço?',
  'Roteiro para ligação fria',
  'Técnicas de fechamento',
  'Como motivar minha equipe?',
  'Roteiro de reunião de vendas',
  'Como qualificar um cliente potencial?',
];

const API_KEY = 'AIzaSyADE7zlJ0Edm3Q25t0FQ8-evnCUXuFn9e0';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function parseSuggestions(text: string): { clean: string; suggestions: string[] } {
  const match = text.match(/\[SUGESTÕES?:\s*(.+?)\]/i);
  if (!match) return { clean: text, suggestions: [] };
  const suggestions = match[1].split('|').map(s => s.trim()).filter(Boolean);
  const clean = text.replace(/\[SUGESTÕES?:\s*.+?\]/i, '').trim();
  return { clean, suggestions };
}

export default function AICoach() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientName = searchParams.get('cliente');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [clientContext, setClientContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!clientName) {
      setMessages(loadData(KEYS.CHAT_HISTORY, []));
    } else {
      // Load client context for AI memory
      const allClients = loadData<Client[]>(KEYS.CLIENTS, []);
      const client = allClients.find(c => c.name === clientName);
      if (client) {
        const ctx = [
          `Cliente: ${client.name} (${client.company})`,
          client.objections.length > 0 ? `Objeções já citadas: ${client.objections.join(', ')}` : '',
          client.meetings.length > 0 ? `Última reunião: ${client.meetings[0].date} — ${client.meetings[0].outcome || 'sem registro'}` : '',
          client.notes ? `Notas: ${client.notes}` : '',
        ].filter(Boolean).join('\n');
        setClientContext(ctx);
        resetChat();
      }
    }
  }, [clientName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: msg, timestamp: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setSuggestions([]);
    setLoading(true);

    const contextPrefix = clientContext ? `[Contexto do cliente:\n${clientContext}]\n\n` : '';
    const promptWithSuggestions = contextPrefix + msg + '\n\n(Ao final da resposta, inclua exatamente neste formato: [SUGESTÕES: pergunta 1 | pergunta 2 | pergunta 3] com 2-3 perguntas que o vendedor poderia fazer ao cliente em seguida)';

    try {
      const response = await sendMessage(promptWithSuggestions, API_KEY);
      const { clean, suggestions: newSuggestions } = parseSuggestions(response);
      setSuggestions(newSuggestions);

      const assistantMsg: ChatMessage = { id: generateId(), role: 'assistant', content: clean, timestamp: Date.now() };
      const final = [...updated, assistantMsg];
      setMessages(final);
      saveData(KEYS.CHAT_HISTORY, final);

      if (autoSpeak && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(clean.replace(/\*\*/g, '').replace(/\*/g, ''));
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;
        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find(v => v.lang.startsWith('pt'));
        if (ptVoice) utterance.voice = ptVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Erro ao processar';
      const errorMsg: ChatMessage = { id: generateId(), role: 'assistant', content: `Desculpe, ocorreu um erro: ${errMsg}`, timestamp: Date.now() };
      const final = [...updated, errorMsg];
      setMessages(final);
      saveData(KEYS.CHAT_HISTORY, final);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setSuggestions([]);
    saveData(KEYS.CHAT_HISTORY, []);
    resetChat();
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setAutoSpeak(true);
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const hasSpeechRecognition = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  return (
    <div className="ai-coach-page">
      {messages.length === 0 ? (
        <div className="ai-welcome">
          <div className="ai-welcome-icon">
            <Sparkles size={40} />
          </div>
          <h3>{clientName ? `Sobre: ${clientName}` : 'Pergunte ao Especialista'}</h3>
          <p>{clientName ? 'A IA já conhece o histórico deste cliente.' : 'Tire dúvidas sobre vendas, negociação e liderança comercial.'}</p>

          <button className="roleplay-cta" onClick={() => navigate('/treino')}>
            <Swords size={18} />
            <span>Treinar objeções com simulação</span>
          </button>

          <div className="quick-prompts">
            <p className="quick-label">Sugestões rápidas:</p>
            {QUICK_PROMPTS.map(prompt => (
              <button key={prompt} className="quick-btn" onClick={() => handleSend(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="messages">
          <button className="clear-chat" onClick={handleClear}>
            <RotateCcw size={12} /> Nova conversa
          </button>
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              {msg.role === 'assistant' && <div className="msg-avatar"><Sparkles size={14} /></div>}
              <div className="msg-bubble">
                <div
                  className="msg-content"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
                {msg.role === 'assistant' && (
                  <div className="msg-actions">
                    <SpeakButton text={msg.content.replace(/\*\*/g, '').replace(/\*/g, '')} size={14} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <div className="suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="message assistant">
              <div className="msg-avatar"><Sparkles size={14} /></div>
              <div className="msg-content typing">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="input-area">
        <div className="input-wrapper">
          {hasSpeechRecognition && (
            <button
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? 'Ouvindo...' : 'Pergunte sobre vendas...'}
            disabled={loading}
          />
          <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() || loading}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
