import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles, Mic, Square } from 'lucide-react';
import { allProducts } from './data/store';
import { visibleProducts, productKnowledge } from './data/products';
import { useBrand } from './BrandContext';
import { useAuth } from './AuthContext';
import { getBrand, isAuto, isBalcao } from './data/brands';
import { aiAuthHeaders } from '../lib/aiProxy';
import { saberDeVenda } from './data/vendaSaber';
import { criarDitado, ditadoDisponivel } from './data/ditado';

type Msg = { role: 'user' | 'assistant'; content: string };

// Em dev (vite) as funções /api não rodam local — aponta pra produção pra testar.
const API_URL = import.meta.env.DEV ? 'https://eleva-five.vercel.app/api/eleva-ia' : '/api/eleva-ia';

// Sugestões por marca: dar exemplo de produto que a pessoa NÃO tem no catálogo
// só ensina a errar. Balcão pergunta pra atender; afiliado pergunta pra vender.
const SUGESTOES_BALCAO = [
  'Quais os benefícios do Ômega 3?',
  'Qual a diferença do Plus pro comum?',
  'Cliente reclamou do gosto de peixe',
  'Pra que serve a melatonina com triptofano?',
];

const SUGESTOES_REVENDA = [
  'Quais os benefícios do GLPEN Nutri Muscle?',
  'Qual a diferença do Muscle pro Energy?',
  'Cliente disse que já toma whey',
  'Pra que serve o Ultra AZ?',
];

// Concessionária: quem pergunta está com o cliente na frente. As dúvidas são de
// negociação e objeção, não de bula.
const SUGESTOES_AUTO = [
  'O cliente disse "é chinês, né?"',
  'Como comparo com o concorrente item a item?',
  'Ele falou que vai pesquisar e volta',
  'Como conduzo pro test drive?',
];

export default function AssistenteBalcao() {
  const { brandId } = useBrand();
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);
  const fimRef = useRef<HTMLDivElement | null>(null);
  const ditadoRef = useRef<ReturnType<typeof criarDitado> | null>(null);

  const produtos = useMemo(
    () => visibleProducts(allProducts().filter((p) => p.brand === brandId), user?.role),
    [brandId, user?.role]
  );
  // No automotivo a IA recebe DUAS coisas: o conteúdo do produto e o arsenal de
  // venda do MAESTR.IA (objeções já testadas, o erro comum que queima a venda,
  // técnicas de condução e roteiros). Sem isso ela sabia o carro e não sabia
  // vender — e quem está no showroom trava na objeção, não na ficha técnica.
  const contexto = useMemo(() => {
    const produto = productKnowledge(produtos);
    if (!isAuto(brandId)) return produto;
    return `${produto}\n\n${saberDeVenda('automotivo')}`;
  }, [produtos, brandId]);
  const marca = getBrand(brandId).name;
  // Três realidades diferentes: balcão de farmácia atende, revenda (Meraki)
  // fala com a cliente, concessionária negocia carro. O aviso de rodapé muda
  // junto — falar de rótulo e farmacêutico pra quem vende carro é ruído.
  const ehBalcao = isBalcao(brandId);
  const ehAuto = isAuto(brandId);
  const SUGESTOES = ehAuto ? SUGESTOES_AUTO : ehBalcao ? SUGESTOES_BALCAO : SUGESTOES_REVENDA;
  const titulo = ehBalcao ? 'Tira-dúvida do balcão' : 'Tira-dúvida';
  const subtitulo = ehAuto
    ? `Pergunte sobre os modelos e acessórios ${marca}, e sobre como conduzir a negociação. Responde só com o conteúdo aprovado.`
    : ehBalcao
    ? `Pergunte sobre os produtos ${marca}. Responde só com o conteúdo aprovado — pra você atender rápido.`
    : `Pergunte sobre os produtos ${marca}. Responde só com o conteúdo aprovado — pra você vender com segurança.`;
  const vazioTitulo = ehAuto ? 'O que o cliente perguntou?' : ehBalcao ? 'Como posso ajudar no atendimento?' : 'O que a cliente perguntou?';
  const aviso = ehAuto
    ? 'Uso interno de apoio. Preço, taxa, bônus de troca e prazo de entrega saem da tabela vigente em Condições comerciais — nunca desta tela.'
    : 'Uso interno de apoio. Não é orientação médica: dose, uso com remédios e doença ficam com o rótulo e o farmacêutico.';
  const perfilIA = ehAuto ? 'auto' : ehBalcao ? 'balcao' : 'revenda';

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
        body: JSON.stringify({ message: pergunta, history: historico, context: contexto, perfil: perfilIA }),
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

  // Falar em vez de digitar. No showroom a pessoa está de pé, com o cliente ao
  // lado — digitar a objeção inteira não acontece. A transcrição é a do próprio
  // navegador (grátis, ao vivo): não passa pela nossa IA e não gasta crédito.
  const alternarGravacao = () => {
    if (gravando) {
      ditadoRef.current?.parar();
      return;
    }
    setErro('');
    const d = criarDitado({
      aoTexto: (t) => setInput(t),
      aoFim: () => setGravando(false),
      aoErro: (m) => { setErro(m); setGravando(false); },
    });
    if (!d) {
      setErro('Este navegador não transcreve áudio. No celular, use o microfone do teclado.');
      return;
    }
    ditadoRef.current = d;
    setGravando(true);
    d.iniciar();
  };

  useEffect(() => () => ditadoRef.current?.parar(), []);

  return (
    <div className="wp-ia">
      <Link to="/eleva" className="wp-ia-back"><ChevronLeft size={16} className="wp-ico" /> Voltar</Link>

      <div className="wp-ia-hero">
        <div className="wp-ia-hero-icon"><Sparkles size={18} className="wp-ico" /></div>
        <div>
          <h1 className="wp-ia-title">{titulo}</h1>
          <p className="wp-ia-sub">{subtitulo}</p>
        </div>
      </div>

      <div className="wp-ia-disc">{aviso}</div>

      <div className="wp-ia-thread">
        {msgs.length === 0 && (
          <div className="wp-ia-empty">
            <p className="wp-ia-empty-t">{vazioTitulo}</p>
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
        {ditadoDisponivel() && (
          <button
            type="button"
            className={`wp-ia-mic ${gravando ? 'on' : ''}`}
            onClick={alternarGravacao}
            aria-label={gravando ? 'Parar de gravar' : 'Falar em vez de digitar'}
            title={gravando ? 'Parar' : 'Falar em vez de digitar'}
          >
            {gravando ? <Square size={16} className="wp-ico" /> : <Mic size={18} className="wp-ico" />}
          </button>
        )}
        <input
          className="wp-ia-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar(input)}
          placeholder={gravando ? 'Ouvindo… pode falar' : 'Escreva ou toque no microfone'}
          aria-label="Sua dúvida"
        />
        <button type="button" className="wp-ia-send" onClick={() => enviar(input)} disabled={!input.trim() || loading} aria-label="Enviar">
          <Send size={18} className="wp-ico" />
        </button>
      </div>
    </div>
  );
}
