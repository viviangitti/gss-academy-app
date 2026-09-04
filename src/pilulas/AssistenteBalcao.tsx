import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles, Mic, Square } from 'lucide-react';
import { allProducts } from './data/store';
import { visibleProducts, productKnowledge } from './data/products';
import { useBrand } from './BrandContext';
import { useAuth } from './AuthContext';
import { getBrand, isAuto, isBalcao } from './data/brands';
import { aiAuthHeaders } from '../lib/aiProxy';
import { criarDitado, ditadoDisponivel } from './data/ditado';
import { montarMemoria, type MemoriaCoach } from './data/memoriaCoach';
import { carregarCondicoes } from './data/condicoes';

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

/**
 * O modelo escreve em markdown; a tela mostrava os asteriscos.
 *
 * "temos a **Premiação de setembro** válida até..." chegava assim mesmo no
 * celular do gerente — com os dois asteriscos, como se o app estivesse quebrado.
 * Aqui só o negrito é traduzido, que é o único que ele usa de verdade; o resto
 * do texto passa como está, sem HTML e sem risco.
 */
function emNegrito(texto: string): React.ReactNode {
  const partes = String(texto).split(/\*\*(.+?)\*\*/gs);
  return partes.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));
}

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
  // Daqui pro servidor vai só o CONTEÚDO DOS PRODUTOS. O arsenal de venda
  // (objeções testadas, técnicas, roteiros) e o método GSS ficam em api/_coach.js
  // — é propriedade intelectual e não pode viajar no pacote do navegador.
  const contexto = useMemo(() => productKnowledge(produtos), [produtos]);
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

  // A memória (quem é a pessoa, o que ela viu, o que ouviu do cliente, a
  // condição vigente) é o que faz o coach parecer que conhece quem pergunta.
  // Busca uma vez por marca; se falhar, a conversa segue sem ela.
  const [memoria, setMemoria] = useState<MemoriaCoach | null>(null);
  useEffect(() => {
    let vivo = true;
    carregarCondicoes(brandId).finally(() => {
      montarMemoria({ brandId, nome: user?.name, email: user?.email, role: user?.role, segmento: user?.segment })
        .then((m) => { if (vivo) setMemoria(m); })
        .catch(() => {});
    });
    return () => { vivo = false; };
  }, [brandId, user?.name, user?.email, user?.role, user?.segment]);

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
        body: JSON.stringify({
          message: pergunta,
          history: historico,
          context: contexto,
          perfil: perfilIA,
          gestor: user?.role === 'gestor',
          memoria: memoria || {},
          app: 'Eleva',
        }),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || `falha ${r.status}`);
      if (!data?.reply) throw new Error('A IA respondeu em branco. Tenta perguntar de outro jeito.');
      setMsgs((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      // MOSTRA O QUE O SERVIDOR DISSE.
      //
      // Antes toda falha virava a mesma frase — "Não consegui responder agora"
      // — e o vendedor mandava print pra gerência, que mandava pra mim, e eu
      // não tinha o que ler. Sem internet, congestionamento e teto do dia
      // atingido pedem três atitudes diferentes; a tela precisa dizer qual é.
      const msg = e instanceof Error ? e.message : '';
      const semRede = typeof navigator !== 'undefined' && navigator.onLine === false;
      setErro(
        semRede
          ? 'Você está sem internet. A resposta também está no carro, em Objeções.'
          : msg && !/^falha \d+$/.test(msg)
            ? msg
            : 'Não consegui responder agora. Tenta de novo em instantes.',
      );
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

  const podeFalar = ditadoDisponivel();
  // Campo vazio → microfone. Digitou → avião. Gravando → parar.
  const mostrarMic = podeFalar && (gravando || !input.trim());

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
          <div key={idx} className={`wp-ia-msg ${m.role}`}>{emNegrito(m.content)}</div>
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
          placeholder={gravando ? 'Ouvindo… pode falar' : podeFalar ? 'Escreva ou toque no microfone' : 'Escreva sua dúvida…'}
          aria-label="Sua dúvida"
        />
        {/* Um botão só, na direita, como no WhatsApp: microfone enquanto o campo
            está vazio, avião assim que tem texto. Enquanto grava vira o quadrado
            de parar. Dois botões lado a lado faziam a pessoa procurar qual é. */}
        {mostrarMic ? (
          <button
            type="button"
            className={`wp-ia-send wp-ia-mic ${gravando ? 'on' : ''}`}
            onClick={alternarGravacao}
            aria-label={gravando ? 'Parar de gravar' : 'Falar em vez de digitar'}
            title={gravando ? 'Parar' : 'Falar em vez de digitar'}
          >
            {gravando ? <Square size={16} className="wp-ico" /> : <Mic size={19} className="wp-ico" />}
          </button>
        ) : (
          <button type="button" className="wp-ia-send" onClick={() => enviar(input)} disabled={!input.trim() || loading} aria-label="Enviar">
            <Send size={18} className="wp-ico" />
          </button>
        )}
      </div>
    </div>
  );
}
