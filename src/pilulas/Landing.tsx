import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, MessageCircle, Send, GraduationCap, LayoutDashboard, Volume2, Play } from 'lucide-react';

// Porta de entrada pública do Eleva. Quem chega aqui é de dois tipos muito
// diferentes — o time de uma marca que já usa (quer só logar) e uma marca
// avaliando a ferramenta (quer entender e falar com a gente). Por isso são dois
// CTAs, e não um.
//
// A demonstração é o produto acontecendo, não um print: o mesmo vídeo, a mesma
// objeção e a mesma mensagem de WhatsApp que a afiliada da Meraki usa hoje.

const CONTATO = 'viviangitti23@gmail.com';

// Conteúdo REAL do GLPEN Nutri Muscle (Meraki) — o mesmo que está no app.
const OBJECAO = 'A caneta já emagrece, pra que tomar isso?';
const RESPOSTA =
  'A medicação atua no peso, mas não escolhe o que sai: cerca de 30% do peso perdido pode ser de músculos. O Muscle traz HMB, arginina e glutamina para apoiar a preservação muscular — sempre junto do treino de força e da orientação do seu profissional de saúde.';

function Fone() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [tocando, setTocando] = useState(false);
  // O React aplica a propriedade `muted` DEPOIS de criar o elemento — quando o
  // Chrome avalia o autoplay, o vídeo ainda conta como "com som" e é bloqueado.
  // Silenciar e dar play na mão, no primeiro render, resolve.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => { /* aparelho bloqueou: fica o botão de play */ });
  }, []);
  const alternar = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play(); setTocando(true); } else { v.pause(); setTocando(false); }
  };
  return (
    <div className="wp-lp-fone">
      <div className="wp-lp-fone-tela">
        <div className="wp-lp-fone-top">
          <span className="wp-lp-fone-marca">eleva<ArrowUpRight size={11} strokeWidth={3} /></span>
          <span className="wp-lp-fone-brand">Meraki</span>
        </div>
        <button type="button" className="wp-lp-fone-video" onClick={alternar} aria-label={tocando ? 'Pausar' : 'Tocar'}>
          {/* onPlay/onPause: se o aparelho bloquear o autoplay (iOS em economia
              de bateria), o botão de play precisa aparecer de verdade. */}
          <video
            // defaultMuted é o que grava o atributo `muted` no HTML. Sem ele o
            // React só define a propriedade, e o Chrome já decidiu bloquear o
            // autoplay antes disso.
            ref={(el) => {
              ref.current = el;
              if (el) { el.defaultMuted = true; el.muted = true; }
            }}
            src="/videos/lp-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setTocando(true)}
            onPause={() => setTocando(false)}
          />
          {!tocando && <span className="wp-lp-fone-play"><Play size={20} /></span>}
        </button>
        <div className="wp-lp-fone-legenda">
          <span className="wp-lp-fone-cc">GLPEN Nutri Muscle</span>
          <span className="wp-lp-fone-sub">HMB, arginina e glutamina — para quem emagrece com a caneta</span>
        </div>
        <div className="wp-lp-fone-cta"><Send size={13} /> Compartilhar com a cliente</div>
      </div>
    </div>
  );
}

export default function Landing({ onEntrar }: { onEntrar: () => void }) {
  return (
    <div className="wp-lp">
      <header className="wp-lp-nav">
        <span className="wp-lp-logo">eleva<ArrowUpRight size={15} strokeWidth={3} className="wp-lp-caret" /></span>
        <button type="button" className="wp-lp-nav-entrar" onClick={onEntrar}>Entrar</button>
      </header>

      <section className="wp-lp-hero">
        <div className="wp-lp-hero-txt">
          <p className="wp-lp-kicker">Educação de produto · GSS</p>
          <h1>
            A cliente pergunta.<br />
            Sua vendedora <em>já sabe</em> responder.
          </h1>
          <p className="wp-lp-sub">
            O Eleva coloca o seu produto na mão de quem vende: um vídeo curto, a resposta pronta para
            cada objeção e a mensagem para mandar na hora. Sem apostila, sem treinamento remarcado.
          </p>
          <div className="wp-lp-ctas">
            <button type="button" className="wp-lp-btn wp-lp-btn--gold" onClick={onEntrar}>
              Entrar na minha conta <ArrowRight size={16} />
            </button>
            <a className="wp-lp-btn wp-lp-btn--ghost" href={`mailto:${CONTATO}?subject=Quero%20o%20Eleva%20para%20a%20minha%20marca`}>
              Quero para a minha marca
            </a>
          </div>
          <p className="wp-lp-nota">
            É isto que a sua vendedora vê. Rodando de verdade, com um produto da <b>Meraki</b>.
          </p>
        </div>
        <div className="wp-lp-hero-fone"><Fone /></div>
      </section>

      <section className="wp-lp-fluxo">
        <p className="wp-lp-eyebrow">O caminho inteiro, dentro do app</p>
        <div className="wp-lp-passos">
          <div className="wp-lp-passo">
            <span className="wp-lp-passo-tag"><MessageCircle size={13} /> A cliente falou</span>
            <p className="wp-lp-passo-fala">“{OBJECAO}”</p>
          </div>
          <div className="wp-lp-passo wp-lp-passo--resp">
            <span className="wp-lp-passo-tag">A resposta que ela lê</span>
            <p>{RESPOSTA}</p>
          </div>
          <div className="wp-lp-passo">
            <span className="wp-lp-passo-tag"><Send size={13} /> E manda no WhatsApp</span>
            <p className="wp-lp-passo-zap">
              Vídeo do produto + texto pronto, num toque. A cliente recebe explicado.
            </p>
          </div>
        </div>
        <p className="wp-lp-fonte">
          Objeção e resposta reais do GLPEN Nutri Muscle, como estão no app da Meraki hoje.
        </p>
      </section>

      <section className="wp-lp-blocos">
        <div className="wp-lp-bloco">
          <GraduationCap size={20} className="wp-lp-bico" />
          <h3>A pessoa aprende e prova que aprendeu</h3>
          <p>
            Cada produto tem a pílula, os benefícios e as objeções. No fim, um quiz montado do próprio
            conteúdo — quem acerta marca o produto como dominado e caminha para o certificado da marca.
          </p>
        </div>
        <div className="wp-lp-bloco">
          <LayoutDashboard size={20} className="wp-lp-bico" />
          <h3>Você enxerga o time de verdade</h3>
          <p>
            Quem assistiu, quem parou no meio, qual produto ninguém abriu, o que a ponta anda buscando —
            e as objeções novas que a sua vendedora ouve no balcão e registra ali mesmo.
          </p>
        </div>
        <div className="wp-lp-bloco">
          <Volume2 size={20} className="wp-lp-bico" />
          <h3>Cada público vê o vídeo dele</h3>
          <p>
            O que o afiliado precisa ouvir não é o que o nutricionista precisa ouvir. O mesmo produto
            entrega o vídeo certo para cada perfil — e o balconista recebe a versão de balcão.
          </p>
        </div>
      </section>

      <section className="wp-lp-marca">
        <p className="wp-lp-eyebrow">Sua marca, não a nossa</p>
        <h2>O Eleva veste a identidade de quem contrata.</h2>
        <p className="wp-lp-marca-sub">
          Cor, nome, catálogo e certificado são da marca. Quem usa vê a sua empresa — a GSS fica por trás.
          Hoje o app roda com duas marcas ao mesmo tempo, cada uma com o seu time e os seus números.
        </p>
        <div className="wp-lp-chips">
          <span className="wp-lp-chip wp-lp-chip--meraki">Meraki</span>
          <span className="wp-lp-chip wp-lp-chip--dsp">Sorocaps · Drogaria São Paulo</span>
          <span className="wp-lp-chip wp-lp-chip--vazio">a sua marca aqui</span>
        </div>
      </section>

      <section className="wp-lp-final">
        <h2>Quer ver com os seus produtos?</h2>
        <p>
          Me manda a linha que você quer treinar. Eu monto uma pílula do seu produto e te mostro
          funcionando — no seu celular, com a sua marca.
        </p>
        <div className="wp-lp-ctas wp-lp-ctas--centro">
          <a className="wp-lp-btn wp-lp-btn--gold" href={`mailto:${CONTATO}?subject=Quero%20o%20Eleva%20para%20a%20minha%20marca`}>
            Falar com a GSS <ArrowRight size={16} />
          </a>
          <button type="button" className="wp-lp-btn wp-lp-btn--ghost" onClick={onEntrar}>
            Já tenho conta
          </button>
        </div>
      </section>

      <footer className="wp-lp-rodape">
        <span className="wp-lp-logo wp-lp-logo--peq">eleva<ArrowUpRight size={12} strokeWidth={3} className="wp-lp-caret" /></span>
        <span>GSS · Educação de produto que vende na ponta</span>
      </footer>
    </div>
  );
}
