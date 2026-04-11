import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RotateCcw } from 'lucide-react';
import { sendMessage, resetChat } from '../services/gemini';
import { loadData, saveData, KEYS } from '../services/storage';
import type { ChatMessage } from '../types';
import './AICoach.css';

const QUICK_PROMPTS = [
  'Como rebater objeção de preço?',
  'Roteiro para ligação fria',
  'Técnicas de fechamento',
  'Como motivar minha equipe?',
  'Roteiro de reunião de vendas',
  'Como qualificar um cliente potencial?',
];

const API_KEY = 'AIzaSyB2kyZkx-6yJ88YqsYNXcBMv67s1GjERLg';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function AICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadData(KEYS.CHAT_HISTORY, []));
  }, []);

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
    setLoading(true);

    try {
      const response = await sendMessage(msg, API_KEY);
      const assistantMsg: ChatMessage = { id: generateId(), role: 'assistant', content: response, timestamp: Date.now() };
      const final = [...updated, assistantMsg];
      setMessages(final);
      saveData(KEYS.CHAT_HISTORY, final);
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
    saveData(KEYS.CHAT_HISTORY, []);
    resetChat();
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="ai-coach-page">
      {messages.length === 0 ? (
        <div className="ai-welcome">
          <div className="ai-welcome-icon">
            <Sparkles size={40} />
          </div>
          <h3>Consultor de Vendas</h3>
          <p>Seu assistente especialista em vendas, negociação e liderança comercial.</p>

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
              <div
                className="msg-content"
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}
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
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre vendas..."
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
