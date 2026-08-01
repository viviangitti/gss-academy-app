import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles } from 'lucide-react';
import { allProducts } from './data/store';
import { visibleProducts, productKnowledge } from './data/products';
import { useBrand } from './BrandContext';
import { useAuth } from './AuthContext';
import { getBrand } from './data/brands';
import { aiAuthHeaders } from '../lib/aiProxy';

type Msg = { role: 'user' | 'assistant'; content: string };

// Em dev (vite) as funções /api não rodam local — aponta pra produção pra testar.
const API_URL = import.meta.env.DEV ? 'https://eleva-five.vercel.app/api/eleva-ia' : '/api/eleva-ia';

const SUGESTOES = [
  'Quais os benefícios do Ômega 3?',
  'Qual a diferença do Plus pro comum?',
  'Cliente reclamou do gosto de peixe',
  'Pra que serve a melatonina com triptofano?',
];

export default function AssistenteBalcao() {
  const { brandId } = useBrand();
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const fimRef = useRef<HTMLDivElement | null>(null);

  const produtos = useMemo(
    () => visibleProducts(allProducts().filter((p) => p.brand === brandId), user?.role),
    [brandId, user?.role]
  );
  const contexto = useMemo(() => productKnowledge(produtos), [produtos]);
  const marca = getBrand(brandId).name;

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  const enviar = async (texto: string) => {
    const pergunta = texto.trim();
    if (!pergunta || loading) return;
    setErro('');
    setInput('');
    const historico = msgs;
    setMsgs((m) => [...m, { role: 'user', content: pergunta }]);
    setLoading(true);
    try {
      const r = await fetch(API_URL, {
        method: 'POST',
        headers: await aiAuthHeaders(),
        body: JSON.stringify({ message: pergunta, history: historico, context: contexto }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'falhou');
      setMsgs((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setErro('Não consegui responder agora. Tenta de novo em instantes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wp-ia">
      <Link to="/eleva" className="wp-ia-back"><ChevronLeft size={16} className="wp-ico" /> Voltar</Link>

      <div className="wp-ia-hero">
        <div className="wp-ia-hero-icon"><Sparkles size={18} className="wp-ico" /></div>
        <div>
          <h1 className="wp-ia-title">Tira-dúvida do balcão</h1>
          <p className="wp-ia-sub">Pergunte sobre os produtos {marca}. Responde só com o conteúdo aprovado — pra você atender rápido.</p>
        </div>
      </div>

      <div className="wp-ia-disc">
        Uso interno de apoio. Não é orientação médica: dose, uso com remédios e doença ficam com o rótulo e o farmacêutico.
      </div>

      <div className="wp-ia-thread">
        {msgs.length === 0 && (
          <div className="wp-ia-empty">
            <p className="wp-ia-empty-t">Como posso ajudar no atendimento?</p>
            <div className="wp-ia-sugs">
              {SUGESTOES.map((s) => (
                <button key={s} type="button" className="wp-ia-sug" onClick={() => enviar(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, idx) => (
          <div key={idx} className={`wp-ia-msg ${m.role}`}>{m.content}</div>
        ))}

        {loading && <div className="wp-ia-msg assistant wp-ia-typing"><span></span><span></span><span></span></div>}
        {erro && <p className="wp-ia-err">{erro}</p>}
        <div ref={fimRef} />
      </div>

      <div className="wp-ia-bar">
        <input
          className="wp-ia-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar(input)}
          placeholder="Escreva sua dúvida…"
          aria-label="Sua dúvida"
        />
        <button type="button" className="wp-ia-send" onClick={() => enviar(input)} disabled={!input.trim() || loading} aria-label="Enviar">
          <Send size={18} className="wp-ico" />
        </button>
      </div>
    </div>
  );
}
