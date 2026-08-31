import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageCircle, BadgeCheck, Clock, Target, ShieldCheck, ShoppingBag, ClipboardList, Send, FileText,
  ArrowUpRight, Play, Pause, Plus, Minus, Camera,
  Pencil, ChevronDown, UploadCloud, Check, Image as ImageIcon,
  Volume2, FileDown, BookOpen, Users, Lock, ChevronRight, Package, Maximize2, Layers, X } from 'lucide-react';
import { speak, stopSpeaking } from './data/speech';
import { NARRATION_TIMINGS } from './data/narrationTimings';
import { submitObjection, fetchMyObjections, fetchPublicadas, objectionDate, type TeamObjection } from './data/objections';
import { buildShareVariants, buildFichaMessage, buyLinkFor, type BuyContext, type Product as ProductT } from './data/products';
import Quiz from './Quiz';
import { findProduct, hasVideo, getVideoObjectUrl, ensureVideoLoaded, setProductIG, setProductVideo, clearProductVideo, hasImage, getProductImageUrl, ensureImageLoaded, setProductImage, clearProductImage, useStore } from './data/store';
import { audienceVideoKey, getAudienceReel, setAudienceReel, useAudienceReels, audiencesForLine } from './data/audienceVideos';
import { pegarVideoPreparado, adotarVideo } from './data/videoGesture';
import { getAfiliadoCode } from './data/afiliadoCode';
import { recordView, isQuizDone, registraUso } from './data/tracking';
import { useAuth, audienceOf, type Audience } from './AuthContext';
import { useBrand } from './BrandContext';
import { getBrand, isAuto, isBalcao } from './data/brands';
import { vocab } from './data/vocabulario';
import { gerarMaterial, compartilharMaterial } from './data/onePage';
import { acessoriosPara, precoLabel, type Acessorio } from './data/acessorios';
import { carregarDestaques, destaquesDoTime, useDestaquesTime } from './data/destaquesTime';
import { getElevaProfile } from './data/profile';
import { auth } from '../services/firebase';

// Duração de cada cena a partir da marcação de tempo do roteiro ("0-4s" → 4s).
function sceneMs(t: string): number {
  const m = t.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return Math.max(1800, (Number(m[2]) - Number(m[1])) * 1000);
  return 2600;
}

// Vídeos que ainda usam legenda automática (.vtt gerado por transcrição).
// Hoje: nenhum — todos os vídeos vieram editados, com a legenda já no vídeo.
// Se um dia entrar um vídeo sem legenda, basta gerar o .vtt e pôr o nome aqui;
// o mecanismo de exibição continua de pé.
const LEGENDA_AUTO = new Set<string>([]);

function VideoMp4({ url, productId }: { url: string; productId: string }) {
  // Legenda (CC) só pros vídeos que ainda não vieram editados com legenda.
  const base = url.startsWith('/videos/') ? url.split('/videos/')[1].replace(/\.mp4$/, '') : '';
  const vtt = base && LEGENDA_AUTO.has(base) ? `/videos/${base}.vtt` : null;
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [cc, setCc] = useState('');
  // Player que já começou a tocar COM SOM lá no toque do card (ver
  // data/videoGesture.ts). Se ele existe, esta tela adota o elemento em vez de
  // criar outro — interromper e recomeçar é justamente o que faz o navegador
  // cortar o áudio.
  const [adotado] = useState(() => pegarVideoPreparado(url));
  const [muted, setMuted] = useState(!adotado);

  // Encaixa o player adotado na tela e cuida dele daqui pra frente.
  useEffect(() => {
    const host = hostRef.current;
    if (!adotado || !host) return;
    adotarVideo(adotado);
    adotado.className = 'wp-reel-videoel';
    vidRef.current = adotado;
    if (vtt && !adotado.querySelector('track')) {
      const t = document.createElement('track');
      t.kind = 'captions';
      t.srclang = 'pt';
      t.label = 'Português';
      t.src = vtt;
      adotado.appendChild(t);
    }
    host.appendChild(adotado);
    // Em desenvolvimento o React monta/desmonta/monta: a limpeza pausa o vídeo
    // e a segunda montagem precisa retomar. Em produção isso nem chega a rodar.
    if (adotado.paused) adotado.play().catch(() => {});
    setMuted(adotado.muted);
    return () => {
      adotado.pause();
      adotado.remove();
    };
  }, [adotado, vtt]);

  // Sem player adotado (link direto, recarregar a página, produto aberto pelo
  // seletor do gestor): tenta com som e, se o navegador negar, fica mudo com o
  // botão "Ativar som".
  useEffect(() => {
    if (adotado) return;
    const v = vidRef.current;
    if (!v) return;
    let cancelado = false;
    v.muted = false;
    v.play()
      .then(() => { if (!cancelado) setMuted(false); })
      .catch(() => {
        if (cancelado) return;
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    return () => { cancelado = true; };
  }, [url, adotado]);
  // Vídeo tocando COM SOM = a pessoa está assistindo de verdade.
  //
  // O autoplay mudo não vale como sinal: acontece sozinho, sem ninguém pedir.
  // Sem som pode ser o celular no bolso enquanto a tela ficou aberta. Os três
  // caminhos que ligam o áudio — player adotado do toque no card, autoplay com
  // som aceito pelo navegador e o botão "Ativar som" — passam todos por aqui.
  useEffect(() => {
    if (!muted) registraUso('video_play', productId);
  }, [muted, productId]);

  // Lê a legenda ativa e mostra num overlay próprio (o render nativo fica atrás
  // dos controles e some no fundo). mode='hidden': parseia mas não desenha.
  useEffect(() => {
    const v = vidRef.current;
    if (!v || !vtt) return;
    const t = v.textTracks[0];
    if (!t) return;
    t.mode = 'hidden';
    const onChange = () => {
      const cue = t.activeCues && t.activeCues[0];
      setCc(cue ? (cue as VTTCue).text : '');
    };
    t.addEventListener('cuechange', onChange);
    return () => t.removeEventListener('cuechange', onChange);
  }, [vtt]);
  // Ativa o som (toque do usuário) e recomeça do início pra não perder nada.
  const ativarSom = () => {
    const v = vidRef.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(() => {});
    setMuted(false);
  };
  return (
    <div className="wp-reel wp-reel--video" style={{ background: '#000' }}>
      {/* Abre tocando (mudo — regra do navegador) com legenda. Um toque em
          "Ativar som" liga o áudio do início. */}
      {/* SEM default: senão o navegador desenha a legenda nativa E a nossa (fica
          dobrada). O efeito acima põe mode='hidden' — carrega as cues sem desenhar. */}
      {/* Adotado: o player veio do toque, já tocando com som — só encaixamos.
          Senão, criamos aqui. muted={muted} preso ao estado, senão o React
          devolveria o vídeo pro mudo no primeiro re-render depois do som. */}
      {adotado ? (
        <div ref={hostRef} className="wp-reel-videohost" />
      ) : (
        <video ref={vidRef} className="wp-reel-videoel" src={url} autoPlay muted={muted} playsInline controls preload="auto">
          {vtt && <track kind="captions" srcLang="pt" label="Português" src={vtt} />}
        </video>
      )}
      {muted && (
        <button type="button" className="wp-reel-unmute" onClick={ativarSom}>
          <Volume2 size={16} className="wp-ico" /> Ativar som
        </button>
      )}
      {cc && <div className="wp-reel-cc">{cc}</div>}
    </div>
  );
}

function Reel({ product, previewAudience, nivel }: { product: ProductT; previewAudience?: Audience | null; nivel: number }) {
  // Nível 1 é o storyboard do produto; do 2 em diante vem de `niveis`.
  const roteiro = nivel === 1 ? product.storyboard : (product.niveis?.[nivel - 2]?.storyboard ?? product.storyboard);
  // Cada nível tem o seu MP3: {id}.mp3 pro 1, {id}-n2.mp3 pro 2, e assim por diante.
  const audioId = nivel === 1 ? product.id : `${product.id}-n${nivel}`;
  useStore(); // re-renderiza quando o vídeo do IndexedDB termina de carregar
  useAudienceReels(); // ...e quando os links do gestor chegam da nuvem
  const { user } = useAuth();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [narrate, setNarrate] = useState(false); // locução pela voz do navegador
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Refs pra ler o estado atual DENTRO dos callbacks (onEnd da fala, cliques) sem
  // depender de re-render — essencial pro iOS, que só fala dentro do gesto.
  const iRef = useRef(0);
  const narrateRef = useRef(false);
  const playRef = useRef(true);
  const narrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cada público vê o vídeo dele (balconista / promotor / afiliado geral /
  // afiliado saúde). Sem vídeo do público, cai no vídeo padrão do produto.
  // previewAudience: o gestor escolhe qual público quer ASSISTIR (ele não tem
  // público próprio, então sem isso só veria o vídeo padrão).
  const audience = previewAudience ?? audienceOf(user);
  const avKey = audience ? audienceVideoKey(product.id, audience) : null;

  useEffect(() => {
    if (avKey && hasVideo(avKey)) ensureVideoLoaded(avKey);
    if (hasVideo(product.id)) ensureVideoLoaded(product.id);
  }, [product.id, avKey]);

  const variantMp4 = avKey ? getVideoObjectUrl(avKey) : undefined;
  const variantReel = audience ? getAudienceReel(product.id, audience) : undefined;
  // Vídeo PRONTO por público (bundled em /public/videos — ex.: vídeos da Mari).
  const staticAudienceVid = audience ? product.audienceVideos?.[audience] : undefined;
  const baseMp4 = getVideoObjectUrl(product.id) || product.videoUrl;

  const scene = roteiro[i];
  const ms = sceneMs(scene.t);
  const len = roteiro.length;

  // Mantém os refs em dia com o estado (usados dentro dos callbacks).
  useEffect(() => { iRef.current = i; }, [i]);
  useEffect(() => { playRef.current = playing; }, [playing]);
  useEffect(() => { narrateRef.current = narrate; }, [narrate]);

  // Avanço por TEMPO — só quando NÃO está narrando (aí quem conduz é a voz).
  useEffect(() => {
    if (!playing || narrate) return;
    timer.current = setTimeout(() => {
      setI((prev) => (prev + 1) % len);
    }, ms);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [i, playing, ms, narrate, len]);

  // Marcas de início de cada cena no MP3 único da pílula (voz Francisca).
  const timings = NARRATION_TIMINGS[audioId];

  // Para a locução de vez: pausa o áudio, tira os listeners, cala a voz de
  // reserva e mata o timer.
  const haltNarration = () => {
    if (narrateTimer.current) clearTimeout(narrateTimer.current);
    narrateTimer.current = null;
    const a = audioRef.current;
    if (a) { a.ontimeupdate = null; a.onended = null; a.onerror = null; a.pause(); }
    stopSpeaking();
  };

  // Sincroniza o slide pelo tempo do áudio: mostra a última cena já começada.
  const syncSlide = () => {
    const a = audioRef.current;
    if (!a || !timings) return;
    let idx = 0;
    for (let k = 0; k < timings.length; k++) if (a.currentTime >= timings[k] - 0.05) idx = k;
    if (idx !== iRef.current) { iRef.current = idx; setI(idx); }
  };

  // RESERVA: voz do navegador, cena a cena (só se faltar o MP3/timings). Avanço
  // não depende só do onEnd (que congela no Chrome): timer estimado garante.
  const speakFrom = (idx: number) => {
    if (!narrateRef.current || !playRef.current) return;
    iRef.current = idx;
    setI(idx);
    const line = roteiro[idx].line;
    let advanced = false;
    const next = () => {
      if (advanced) return;
      advanced = true;
      if (narrateTimer.current) clearTimeout(narrateTimer.current);
      if (!narrateRef.current || !playRef.current) return;
      speakFrom((idx + 1) % len);
    };
    speak(line, next);
    narrateTimer.current = setTimeout(next, Math.max(3000, line.length * 75 + 800));
  };

  // PREFERIDO: UM MP3 por pílula (voz Francisca). Um único play() dentro do
  // toque → o iOS libera e as cenas seguintes NÃO precisam de novo gesto (era o
  // bug: só a 1ª cena tocava). Os slides seguem o tempo do áudio.
  const startAudioNarration = () => {
    const a = audioRef.current;
    if (!a || !timings) { speakFrom(iRef.current); return; }
    a.ontimeupdate = syncSlide;
    a.onended = () => { narrateRef.current = false; setNarrate(false); haltNarration(); };
    a.onerror = () => { a.onerror = null; speakFrom(iRef.current); };
    if (!a.src.endsWith(`${audioId}.mp3`)) a.src = `/audio/narration/${audioId}.mp3`;
    const pr = a.play();
    if (pr && typeof pr.catch === 'function') pr.catch(() => speakFrom(iRef.current));
  };

  // Liga/desliga a locução — chamado no toque do botão.
  const toggleNarrate = (e: MouseEvent) => {
    e.stopPropagation(); // não pausa o reel ao tocar no botão
    if (narrateRef.current) {
      narrateRef.current = false;
      setNarrate(false);
      haltNarration();
    } else {
      narrateRef.current = true;
      playRef.current = true;
      setNarrate(true);
      setPlaying(true);
      startAudioNarration(); // toca já, dentro do gesto → destrava no iOS
    }
  };

  // Toque no reel pausa/retoma — e, se narrando, para/retoma a locução junto.
  const togglePlay = () => {
    const np = !playRef.current;
    playRef.current = np;
    setPlaying(np);
    if (!narrateRef.current) return;
    const a = audioRef.current;
    if (timings && a) {
      if (np) { const pr = a.play(); if (pr && pr.catch) pr.catch(() => {}); }
      else a.pause();
    } else {
      if (np) speakFrom(iRef.current);
      else haltNarration();
    }
  };

  // Sai da pílula (ou troca pra vídeo) → cala a voz e mata o timer.
  useEffect(() => () => haltNarration(), []);

  // Prioridade: [público] upload MP4 > reel do IG > MP4 pronto por público (bundled)
  //           > [base] MP4 > reel base > storyboard animado.
  if (variantMp4) return <VideoMp4 key={variantMp4} url={variantMp4} productId={product.id} />;
  if (variantReel) {
    return <div className="wp-reel wp-reel--ig"><InstagramEmbed url={variantReel} /></div>;
  }
  if (staticAudienceVid) return <VideoMp4 key={staticAudienceVid} url={staticAudienceVid} productId={product.id} />;
  if (baseMp4) return <VideoMp4 key={baseMp4} url={baseMp4} productId={product.id} />;

  if (product.instagramUrl) {
    return (
      <div className="wp-reel wp-reel--ig">
        <InstagramEmbed url={product.instagramUrl} />
      </div>
    );
  }

  // Sem vídeo: o storyboard animado (a foto NÃO entra aqui — é só capa do catálogo).
  return (
    <>
      <div
        className="wp-reel"
        style={{ background: `linear-gradient(160deg, ${product.gradient[0]}, ${product.gradient[1]})` }}
        onClick={togglePlay}
      >
        <div className="wp-reel-glow" />
        {/* Áudio pronto (voz neural Francisca). preload=none: só baixa ao tocar. */}
        <audio ref={audioRef} preload="none" hidden />
        <div className="wp-reel-top">
          <span className="wp-reel-badge" key={`b${i}`}>{scene.label}</span>
          <span className="wp-reel-time">{scene.t}</span>
        </div>

        <div className="wp-reel-caption" key={i}>
          {scene.line}
        </div>

        <div className="wp-reel-bottom">
          <div className="wp-reel-bars">
            {roteiro.map((_, idx) => (
              <span key={idx} className={`wp-reel-bar ${idx < i ? 'done' : ''}`}>
                {idx === i && (
                  <span
                    className="wp-reel-bar-fill"
                    style={{ animationDuration: `${ms}ms`, animationPlayState: playing ? 'running' : 'paused' }}
                  />
                )}
              </span>
            ))}
          </div>
          <div className="wp-reel-hint">
            {playing ? <Pause size={11} className="wp-ico" /> : <Play size={11} className="wp-ico" />}
            {playing ? ' toque p/ pausar' : ' toque p/ tocar'}
          </div>
        </div>
      </div>

      {/* Botão SEPARADO abaixo da pílula — sem se confundir com o toque no card. */}
      <button
        type="button"
        className={`wp-reel-listen ${narrate ? 'on' : ''}`}
        onClick={toggleNarrate}
      >
        {narrate ? <Pause size={16} className="wp-ico" /> : <Volume2 size={16} className="wp-ico" />}
        {narrate ? 'Parar narração' : 'Ouvir a locução'}
      </button>
    </>
  );
}

// Seletor do GESTOR: assiste o vídeo de cada público sem precisar sair da conta.
// Mostra também quais públicos JÁ TÊM vídeo e quais ainda faltam.
function AudiencePreview({ product, value, onChange }: {
  product: ProductT;
  value: Audience | null;
  onChange: (a: Audience | null) => void;
}) {
  useStore();
  useAudienceReels();
  // Qual ARQUIVO cada público vê (mesma ordem de prioridade do Reel). Serve pra
  // não contar duas vezes o mesmo vídeo — o "geral" costuma ser igual ao de um
  // dos públicos.
  const srcDoPublico = (a: Audience): string | null => {
    const k = audienceVideoKey(product.id, a);
    if (hasVideo(k)) return `enviado:${k}`;
    return getAudienceReel(product.id, a) || product.audienceVideos?.[a] || null;
  };
  const srcGeral = hasVideo(product.id) ? `enviado:${product.id}` : product.videoUrl || null;

  // Todo público que TEM vídeo entra na lista, com o nome do público — é assim
  // que o gestor acha "o do afiliado" e "o do profissional da saúde". Público
  // sem vídeo nenhum não aparece (poluía e parecia troca de perfil).
  const comVideo = audiencesForLine(product.line, product.brand)
    .map((a) => ({ ...a, src: srcDoPublico(a.id) }))
    .filter((a) => a.src);

  // "Geral" só aparece se for MESMO um vídeo à parte. Quando o vídeo geral é o
  // mesmo de um público (caso comum), ele já está na lista com o nome certo.
  const geralAvulso = !!srcGeral && !comVideo.some((a) => a.src === srcGeral);
  const total = comVideo.length + (geralAvulso ? 1 : 0);

  // Nada pra escolher (o produto tem um vídeo só): não mostra seletor nenhum.
  if (total < 2) return null;

  return (
    <div className="wp-audprev">
      <span className="wp-audprev-t">
        Este produto tem {total} vídeos. Assista o de cada público:
      </span>
      <div className="wp-audprev-row">
        {geralAvulso && (
          <button
            type="button"
            className={`wp-audprev-b ${value === null ? 'on' : ''}`}
            onClick={() => onChange(null)}
          >
            Geral
          </button>
        )}
        {comVideo.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`wp-audprev-b ${value === a.id || (value === null && a.src === srcGeral) ? 'on' : ''}`}
            onClick={() => onChange(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Campo pra a PONTA registrar uma objeção nova (que não está na pílula). Vira um
// ponto de contato: cai no painel do gestor. O gestor também vê e pode registrar
// (ele ouve objeção em visita/treinamento) — o histórico completo fica no Painel.
function ObjectionSubmit({ product }: { product: ProductT }) {
  const { brandId } = useBrand();
  const auto = isAuto(brandId);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [minhas, setMinhas] = useState<TeamObjection[]>([]);

  // Confirmação: carrega o que ESTA pessoa já registrou neste produto.
  const recarregarMinhas = useCallback(() => {
    fetchMyObjections(product.id, user?.email).then(setMinhas).catch(() => {});
  }, [product.id, user?.email]);
  useEffect(() => { if (open) recarregarMinhas(); }, [open, recarregarMinhas]);

  const enviar = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    const ok = await submitObjection(
      { brand: brandId, productId: product.id, productName: product.name, text, answer },
      { name: user?.name, role: user?.role },
    );
    setBusy(false);
    if (ok) {
      setSent(true); setText(''); setAnswer('');
      recarregarMinhas(); // aparece na lista dela = prova de que chegou
      setTimeout(() => setSent(false), 4000);
    }
  };

  return (
    <div className="wp-block">
      <button type="button" className="wp-objadd-head" onClick={() => setOpen((o) => !o)}>
        <span className="wp-block-label"><MessageCircle size={14} className="wp-ico" /> Recebeu uma objeção nova?</span>
        <ChevronDown size={16} className={`wp-ico wp-objadd-chev ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="wp-objadd">
          <p className="wp-objadd-hint">Ouviu do cliente uma objeção que não está aqui em cima? Registre — chega direto pra gestão.</p>
          {/* LGPD: o campo é texto livre e convida a escrever o caso da pessoa
              que foi atendida. Na saúde o risco é grande — relato de saúde de
              terceiro é dado sensível e ninguém consentiu. Na concessionária o
              risco é outro (nome, telefone, situação financeira), então o aviso
              muda junto. Ele vem ANTES do campo, não depois. */}
          <p className="wp-objadd-aviso">
            {auto
              ? 'Escreva só a objeção, sem o nome do cliente e sem dado pessoal dele.'
              : 'Escreva só a objeção, sem nome da cliente e sem dado de saúde dela.'}
          </p>
          <textarea
            className="wp-objadd-in"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={auto
              ? 'O que o cliente falou? Ex.: "meu cunhado disse que chinês não tem revenda"'
              : 'O que a cliente falou? Ex.: "tenho medo de misturar com remédio"'}
            rows={2}
          />
          <textarea className="wp-objadd-in" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Como você respondeu? (opcional)" rows={2} />
          <button type="button" className="wp-objadd-btn" onClick={enviar} disabled={busy || !text.trim()}>
            {sent ? <><Check size={15} className="wp-ico" /> Registrada! Valeu 👏</> : busy ? 'Enviando…' : 'Registrar objeção'}
          </button>

          {/* Confirmação: o que ela já mandou (prova de que chegou na gestão) */}
          {minhas.length > 0 && (
            <div className="wp-objmine">
              <span className="wp-objmine-t"><Check size={12} className="wp-ico" /> Recebidas de você ({minhas.length})</span>
              {minhas.map((o) => (
                <div key={o.id} className="wp-objmine-item">
                  <p>“{o.text}”</p>
                  <span>{objectionDate(o.at) || 'agora'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Monta o link de embed do reel: tira query/barra final e acrescenta /embed.
// Ex.: instagram.com/reel/ABC123  ->  instagram.com/reel/ABC123/embed
function igEmbedSrc(url: string): string {
  const clean = url.split('?')[0].replace(/\/+$/, '');
  if (/\/embed$/.test(clean)) return clean;
  return `${clean}/embed`;
}

// Mostra o reel DENTRO do app num iframe — o vídeo aparece e toca ali mesmo,
// sem mandar a pessoa pro Instagram (o embed.js só mostrava miniatura + link).
function InstagramEmbed({ url }: { url: string }) {
  return (
    <div className="wp-ig-frame">
      <iframe
        src={igEmbedSrc(url)}
        title="Reel do Instagram"
        className="wp-ig-iframe"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        scrolling="no"
      />
      <a href={url} target="_blank" rel="noreferrer" className="wp-ig-open">
        abrir no Instagram <ArrowUpRight size={12} className="wp-ico" />
      </a>
    </div>
  );
}

// Uma linha de upload por público (reel do IG ou MP4).
function AudienceVideoRow({ productId, audience, label }: { productId: string; audience: Audience; label: string }) {
  useAudienceReels();
  const key = audienceVideoKey(productId, audience);
  const [ig, setIg] = useState(getAudienceReel(productId, audience) || '');
  const [saved, setSaved] = useState(false);
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1600); };
  const hasMp4 = hasVideo(key);
  const reel = getAudienceReel(productId, audience);
  const status = hasMp4 ? 'vídeo MP4' : reel ? 'reel do Instagram' : 'nenhum (usa o vídeo padrão)';
  const salvarReel = () => { clearProductVideo(key); setAudienceReel(productId, audience, ig); flash(); };
  const subirMp4 = (f: File) => { setAudienceReel(productId, audience, ''); setIg(''); setProductVideo(key, f); flash(); };
  const tirar = () => { clearProductVideo(key); setAudienceReel(productId, audience, ''); setIg(''); flash(); };
  return (
    <div className="wp-avrow">
      <p className="wp-avrow-lb">{label} <span className="wp-videdit-cap">— {status}</span></p>
      <input
        className="wp-videdit-input"
        value={ig}
        onChange={(e) => setIg(e.target.value)}
        onFocus={(e) => e.target.select()}
        placeholder="Link do reel do Instagram"
      />
      <button className="wp-videdit-save" disabled={!ig.trim()} onClick={salvarReel}>
        {saved ? <><Check size={15} className="wp-ico" /> Salvo!</> : 'Salvar reel'}
      </button>
      <label className="wp-videdit-mp4">
        <UploadCloud size={16} className="wp-ico" />
        {hasMp4 ? 'Trocar por um MP4' : 'Ou subir um vídeo MP4'}
        <input type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) subirMp4(f); }} />
      </label>
      {(hasMp4 || reel) && (
        <button className="wp-videdit-remove" onClick={tirar}>Tirar (usar o vídeo padrão)</button>
      )}
    </div>
  );
}

// Editor de vídeo direto na pílula — SÓ o gestor vê. Trocar o vídeo aqui,
// no próprio produto, sem ir ao painel.
function GestorVideoEditor({ product }: { product: ProductT }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [ig, setIg] = useState(product.instagramUrl || '');
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (hasImage(product.id)) ensureImageLoaded(product.id); }, [product.id]);
  if (user?.role !== 'gestor') return null;
  const uploaded = hasVideo(product.id);
  const videoAgora = uploaded ? 'vídeo MP4' : product.instagramUrl ? 'reel do Instagram' : 'prévia animada (padrão)';
  const capaUrl = getProductImageUrl(product.id) || product.imageUrl;
  const temCapa = !!capaUrl;
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const salvarReel = () => { clearProductVideo(product.id); setProductIG(product.id, ig); flash(); };
  const subirMp4 = (f: File) => { setProductIG(product.id, ''); setProductVideo(product.id, f); setIg(''); flash(); };
  const tirar = () => { clearProductVideo(product.id); setProductIG(product.id, ''); setIg(''); };
  return (
    <div className="wp-videdit">
      <button className="wp-videdit-toggle" onClick={() => setOpen((o) => !o)}>
        <Pencil size={14} className="wp-ico" /> Trocar o vídeo daqui
        <ChevronDown size={16} className={`wp-ico wp-videdit-chev ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="wp-videdit-body">
          <p className="wp-videdit-now">Vídeo agora: <b>{videoAgora}</b></p>
          <input
            className="wp-videdit-input"
            value={ig}
            onChange={(e) => setIg(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Cole aqui o link do reel do Instagram"
          />
          <p className="wp-videdit-help">Toque no campo que ele já seleciona o link antigo — cole o novo por cima.</p>
          <button className="wp-videdit-save" disabled={!ig.trim()} onClick={salvarReel}>
            {saved ? <><Check size={15} className="wp-ico" /> Vídeo trocado!</> : 'Salvar vídeo do Instagram'}
          </button>
          <label className="wp-videdit-mp4">
            <UploadCloud size={16} className="wp-ico" />
            {uploaded ? 'Trocar por um MP4' : 'Ou subir um vídeo MP4'}
            <input type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) subirMp4(f); }} />
          </label>
          {(uploaded || product.instagramUrl) && (
            <button className="wp-videdit-remove" onClick={tirar}>Tirar o vídeo (voltar pro padrão)</button>
          )}
          <p className="wp-videdit-help">Esse é o <b>vídeo padrão</b> — vale pra quem não tiver vídeo do público dela.</p>

          <div className="wp-videdit-divider" />
          <p className="wp-videdit-now">Vídeo por público <span className="wp-videdit-cap">— cada um vê o conteúdo dele</span></p>
          {audiencesForLine(product.line, product.brand).map((a) => (
            <AudienceVideoRow key={a.id} productId={product.id} audience={a.id} label={a.label} />
          ))}

          <div className="wp-videdit-divider" />
          <p className="wp-videdit-now">Foto de capa <span className="wp-videdit-cap">— aparece no card do catálogo</span></p>
          {temCapa && <img src={capaUrl} alt="capa" className="wp-videdit-preview" />}
          <label className="wp-videdit-mp4">
            <ImageIcon size={16} className="wp-ico" />
            {temCapa ? 'Trocar a foto de capa' : 'Subir uma foto de capa'}
            <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setProductImage(product.id, f); flash(); } }} />
          </label>
          {temCapa && (
            <button className="wp-videdit-remove" onClick={() => clearProductImage(product.id)}>Tirar a foto de capa</button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Product() {
  useStore(); // re-renderiza quando o gestor troca o vídeo
  const { user } = useAuth();
  const { brandId } = useBrand();
  const balcao = isBalcao(brandId); // farmácia: sem compartilhar/enviar pra cliente
  const auto = isAuto(brandId);
  const v = vocab(brandId);
  // Quem está mandando — vira o rastreio na URL de compra (Shopify lê UTM).
  const buyCtx: BuyContext = {
    medium: audienceOf(user) ?? user?.role,
    code: getAfiliadoCode(user?.email),
  };
  const { id } = useParams();
  const product = id ? findProduct(id) : undefined;
  const [openObj, setOpenObj] = useState<number | null>(0);
  const [openFicha, setOpenFicha] = useState(false);
  const [openVers, setOpenVers] = useState(false);
  const [versAberta, setVersAberta] = useState<string | null>(null);
  const [verTodosAcess, setVerTodosAcess] = useState(false);
  const [shareIdx, setShareIdx] = useState(0);
  // Gestor: qual público ele está ASSISTINDO (null = o vídeo padrão).
  const [previewAud, setPreviewAud] = useState<Audience | null>(null);
  // One-page: qual versão está sendo montada, e o WhatsApp que vai nela.
  const [nivel, setNivel] = useState(1);
  const temNiveis = !!product?.niveis?.length;
  const quizFeito = product ? isQuizDone(product.id) : false;
  const [gerando, setGerando] = useState<'cliente' | 'estudo' | null>(null);
  const [avisoOp, setAvisoOp] = useState('');
  const [whats, setWhats] = useState<string>('');
  const [fotoVend, setFotoVend] = useState<string>('');
  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    getElevaProfile(uid).then((pf) => { setWhats(pf?.whatsapp || ''); setFotoVend(pf?.foto || ''); }).catch(() => {});
  }, [user?.email]);
  const semContato = !whats.trim();
  const acessorios = product ? acessoriosPara(product.id) : [];
  // Se a gerência montou os destaques a partir do que o time respondeu, é essa
  // lista que vale — na tela e no material do cliente.
  useDestaquesTime();
  useEffect(() => { if (product) carregarDestaques(product.id).catch(() => {}); }, [product?.id]);
  const doTime = product ? destaquesDoTime(product.id) : [];
  const [fotoAmpliada, setFotoAmpliada] = useState<Acessorio | null>(null);
  // As objeções que o gestor respondeu e publicou, deste produto.
  const [publicadas, setPublicadas] = useState<TeamObjection[]>([]);
  useEffect(() => {
    let vivo = true;
    fetchPublicadas(brandId)
      .then((r) => { if (vivo) setPublicadas(r.filter((o) => o.productId === id)); })
      .catch(() => {});
    return () => { vivo = false; };
  }, [brandId, id]);
  // Se tem MP4, o Instagram vira "prova social" (bônus). Se não tem MP4, o
  // reel do Instagram já é o vídeo principal lá em cima — não repete aqui.
  const mp4 = product ? getVideoObjectUrl(product.id) || product.videoUrl : undefined;

  // Conta a pílula assistida (alimenta o ranking "quem vê mais")
  useEffect(() => {
    if (product) recordView(product.id);
  }, [product]);

  if (!product) {
    return (
      <div className="wp-empty">
        <p>Não encontrei este item.</p>
        <Link to="/eleva/catalogo" className="wp-btn wp-btn-outline">Voltar ao catálogo</Link>
      </div>
    );
  }

  // Manda só a ficha (fatos secos) — quando a cliente pergunta o que tem,
  // quantos vem, quanto dura. Mesmo caminho do compartilhar: share nativo no
  // celular, WhatsApp web no computador.
  const sendFicha = () => {
    const text = buildFichaMessage(product, buyCtx);
    if (!text) return;
    if (navigator.share) {
      navigator.share({ text, title: `${product.name} — ficha` }).catch(() => {});
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Monta o one-page e manda. A foto usada é a capa que o gestor subiu; sem
  // capa, o desenho cai numa versão tipográfica (feia é não ter arquivo nenhum).
  const material = async (variante: 'cliente' | 'estudo', textoPronto?: string) => {
    if (!product || gerando) return;
    setGerando(variante);
    setAvisoOp('');
    try {
      const marca = getBrand(brandId);
      const m = await gerarMaterial({
        product,
        variante,
        marca: marca.name,
        vendedor: user?.name,
        whatsapp: whats,
        fotoVendedor: fotoVend,
        capa: getProductImageUrl(product.id) || product.imageUrl,
        fotos: product.fotos,
        destaques: doTime.length ? doTime : undefined,
        accent: marca.accent,
        accentDeep: marca.accentDeep,
      });
      const texto = textoPronto ?? (variante === 'cliente'
        ? `${product.name} — ${product.tagline}\n\n${product.salesLine}`
        : `${product.name} — material de estudo (uso interno).`);
      const r = await compartilharMaterial(m, texto);
      // O one-page saindo para um cliente é o trabalho acontecendo — o único
      // sinal no app que não é estudo, e sim atendimento.
      registraUso('onepage', `${product.id}|${variante}`);
      if (r === 'baixou') setAvisoOp('PDF baixado: está na sua pasta de downloads.');
    } catch {
      setAvisoOp('Não consegui montar o material agora. Tenta de novo em instantes.');
    } finally {
      setGerando(null);
    }
  };

  const share = async () => {
    const variants = buildShareVariants(product, buyCtx);
    const text = variants[shareIdx % variants.length];
    setShareIdx((n) => n + 1); // próximo toque = próxima versão

    // NO AUTOMOTIVO, ESTE BOTÃO MANDA O ONE-PAGE.
    //
    // Ele é o botão grande, verde, fixo no rodapé — o que o vendedor aperta.
    // Mandava só a mensagem, enquanto o material de verdade ficava num botão
    // discreto no meio da página. O cliente recebia texto solto de um lado e a
    // folha do outro, dependendo de qual botão o vendedor achou primeiro.
    // Agora os dois mandam a mesma coisa; muda só o texto que vai junto, que
    // aqui gira a cada toque pra não repetir a mesma frase com clientes
    // diferentes.
    if (auto) {
      await material('cliente', text);
      return;
    }
    // VÍDEO + texto: manda o MP4 do público junto da mensagem (share nativo com
    // arquivo). Se o aparelho não suportar arquivo, cai no texto (como antes).
    const aud = audienceOf(user);
    const vurl = (aud && product.audienceVideos?.[aud])
      || (product.videoUrl?.startsWith('/videos/') ? product.videoUrl : null);
    if (vurl && typeof navigator.canShare === 'function') {
      try {
        const resp = await fetch(vurl);
        const blob = await resp.blob();
        const file = new File([blob], `${product.name}.mp4`, { type: 'video/mp4' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text, title: product.name });
          return;
        }
      } catch { /* sem suporte a arquivo → cai pro texto */ }
    }
    if (navigator.share) {
      navigator.share({ text, title: product.name }).catch(() => {});
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="wp-product">
      {user?.role === 'gestor' && <AudiencePreview product={product} value={previewAud} onChange={setPreviewAud} />}
      {/* NÍVEIS: mesma pílula curta, em camadas. O seguinte só abre depois do
          quiz — quem não domina o básico não avança, e o gestor consegue ver
          em que camada cada pessoa está. */}
      {temNiveis && (
        <div className="wp-niveis">
          {[1, ...(product.niveis || []).map((_, k) => k + 2)].map((n) => {
            const bloqueado = n > 1 && !quizFeito;
            const info = n === 1 ? null : product.niveis?.[n - 2];
            return (
              <button
                key={n}
                type="button"
                className={`wp-nivel ${nivel === n ? 'on' : ''} ${bloqueado ? 'lock' : ''}`}
                onClick={() => !bloqueado && setNivel(n)}
                title={bloqueado ? 'Acerte o quiz do nível 1 para abrir' : info?.foco}
              >
                {bloqueado && <Lock size={12} className="wp-ico" />}
                <b>Nível {n}</b>
                <i>{n === 1 ? 'O essencial' : info?.titulo}</i>
              </button>
            );
          })}
        </div>
      )}
      {temNiveis && nivel > 1 && (
        <p className="wp-nivel-foco">{product.niveis?.[nivel - 2]?.foco}</p>
      )}
      {temNiveis && !quizFeito && (
        <p className="wp-nivel-aviso">Acerte o quiz aqui embaixo para abrir os próximos níveis.</p>
      )}

      <Reel key={nivel} product={product} previewAudience={previewAud} nivel={nivel} />
      <GestorVideoEditor product={product} />

      <h1 className="wp-prod-name">{product.name}</h1>
      <p className="wp-prod-tag">{product.tagline}</p>

      <div className="wp-block">
        <span className="wp-block-label"><MessageCircle size={14} className="wp-ico" /> O que é</span>
        <p>{product.whatItIs}</p>
      </div>

      <div className="wp-block">
        <span className="wp-block-label">
          <BadgeCheck size={14} className="wp-ico" />
          {doTime.length ? 'O que o time diz que fecha' : auto ? 'Pontos fortes para destacar' : 'Benefícios para destacar'}
        </span>
        {/* A lista do TIME ganha da de fábrica quando existe — era só o rótulo
            que mudava, e a lista continuava a do código: dizia "o que o time diz
            que fecha" mostrando texto que o time nunca escreveu. */}
        <ul className="wp-benefits">
          {(doTime.length ? doTime.map((d) => d.titulo) : product.benefits).map((b, idx) => (
            <li key={idx}>{b}</li>
          ))}
        </ul>
      </div>

      {/* VERSÕES — fica ANTES da ficha técnica de propósito.
          A primeira pergunta real do cliente no showroom não é quantos litros
          tem o porta-malas, é "e a de cima, o que muda?". Quem responde isso na
          hora, sem folhear catálogo, sobe o ticket sem empurrar nada. */}
      {product.versoes && product.versoes.length > 0 && (
        <div className="wp-vers">
          <button className="wp-ficha-toggle" onClick={() => setOpenVers((o) => !o)}>
            <Layers size={15} className="wp-ico" /> Versões — o que muda de uma pra outra
            <ChevronDown size={16} className={`wp-ico wp-ficha-chev ${openVers ? 'open' : ''}`} />
          </button>
          {openVers && (
            <div className="wp-vers-lista">
              {/* Cada versão abre sozinha. A pergunta do showroom é "o que a de
                  cima tem a mais" — nove itens. Abrir tudo de uma vez entrega
                  trinta e sete e a pessoa fecha antes de achar a resposta. */}
              {product.versoes.map((v) => {
                const aberta = versAberta === v.nome;
                return (
                  <div className={`wp-vers-item ${aberta ? 'aberta' : ''}`} key={v.nome}>
                    <button
                      type="button"
                      className="wp-vers-cab"
                      onClick={() => setVersAberta(aberta ? null : v.nome)}
                      aria-expanded={aberta}
                    >
                      <span className="wp-vers-cab-txt">
                        <span className="wp-vers-nome">{v.nome}</span>
                        <span className="wp-vers-quem">{v.paraQuem}</span>
                      </span>
                      <span className="wp-vers-conta">
                        {v.herda ? `+${v.vemCom.length}` : `${v.vemCom.length} itens`}
                        <ChevronDown size={15} className={`wp-ico wp-ficha-chev ${aberta ? 'open' : ''}`} />
                      </span>
                    </button>
                    {aberta && (
                      <>
                        {v.herda && <p className="wp-vers-herda">Tudo da {v.herda}, mais:</p>}
                        <ul className="wp-vers-itens">
                          {v.vemCom.map((x, i) => <li key={i}>{x}</li>)}
                        </ul>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ficha técnica — consulta rápida no balcão. Fechada por padrão pra não
          competir com o conteúdo de venda; abre num toque. */}
      {product.ficha && product.ficha.length > 0 && (
        <div className="wp-ficha">
          <button className="wp-ficha-toggle" onClick={() => setOpenFicha((o) => !o)}>
            <ClipboardList size={15} className="wp-ico" /> Ficha {auto ? 'técnica' : 'do produto'}
            <ChevronDown size={16} className={`wp-ico wp-ficha-chev ${openFicha ? 'open' : ''}`} />
          </button>
          {openFicha && (
            <>
              <dl className="wp-ficha-list">
                {product.ficha.map((r) => (
                  <div className="wp-ficha-row" key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="wp-ficha-acts">
                {!balcao && (
                  <button className="wp-ficha-send" onClick={sendFicha}>
                    <Send size={15} className="wp-ico" /> Enviar no WhatsApp
                  </button>
                )}
                <Link to={`/eleva/ficha/${product.id}`} className="wp-ficha-pdf">
                  <FileText size={15} className="wp-ico" /> {balcao ? 'Abrir ficha (PDF)' : 'Ver em PDF'}
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {(product.howToUse.trim() || product.forWho.trim()) && (
        <div className="wp-row">
          {product.howToUse.trim() && (
            <div className="wp-block wp-half">
              <span className="wp-block-label"><Clock size={14} className="wp-ico" /> {auto ? 'Como abordar' : 'Como usar'}</span>
              <p>{product.howToUse}</p>
            </div>
          )}
          {product.forWho.trim() && (
            <div className="wp-block wp-half">
              <span className="wp-block-label"><Target size={14} className="wp-ico" /> Para quem é</span>
              <p>{product.forWho}</p>
            </div>
          )}
        </div>
      )}

      {product.objections.length > 0 && (
      <div className="wp-block">
        <span className="wp-block-label"><ShieldCheck size={14} className="wp-ico" /> Quebra de objeções</span>
        <div className="wp-objections">
          {product.objections.map((o, idx) => (
            <div className={`wp-obj ${openObj === idx ? 'open' : ''}`} key={idx}>
              <button
                className="wp-obj-q"
                onClick={() => {
                  // Qual objeção o vendedor foi buscar diz o que o cliente
                  // está perguntando no showroom — é a pauta do treinamento.
                  if (openObj !== idx) registraUso('objecao', `${product.id}|${o.trigger}`);
                  setOpenObj(openObj === idx ? null : idx);
                }}
              >
                <span>{o.trigger}</span>
                <span className="wp-obj-chev">{openObj === idx ? <Minus size={16} /> : <Plus size={16} />}</span>
              </button>
              {openObj === idx && <p className="wp-obj-a">{o.answer}</p>}
            </div>
          ))}
        </div>
      </div>
      )}

      <ObjectionSubmit product={product} />

      <Quiz product={product} />

      {mp4 && product.instagramUrl && (
        <div className="wp-block">
          <span className="wp-block-label"><Camera size={14} className="wp-ico" /> Prova social</span>
          <InstagramEmbed url={product.instagramUrl} />
        </div>
      )}

      {/* O que veio DA RUA e o gestor respondeu. Fica logo depois das objeções
          de fábrica de propósito: pro vendedor, as duas coisas são a mesma —
          "o cliente falou isso, o que eu respondo?". A diferença é que estas
          aqui vieram do time dele, nesta loja, neste mês. */}
      {publicadas.length > 0 && (
        <div className="wp-block">
          <span className="wp-block-label"><Users size={14} className="wp-ico" /> Veio do time — respondido pela gestão</span>
          {publicadas.map((o) => (
            <div key={o.id} className="wp-time-obj">
              <p className="wp-time-obj-q">“{o.text}”</p>
              <p className="wp-time-obj-a">{o.resposta}</p>
              {o.byName && <span className="wp-time-obj-meta">trazida por {o.byName.split(' ')[0]}</span>}
            </div>
          ))}
        </div>
      )}

      {product.compliance && (
        <div className="wp-compliance">
          <strong>Atenção (como comunicar):</strong> {product.compliance}
        </div>
      )}

      <div className="wp-salesline">“{product.salesLine}”</div>

      {/* Link de compra, com rastreio de quem mandou. */}
      {product.buyUrl && (
        <a className="wp-buy" href={buyLinkFor(product, buyCtx)} target="_blank" rel="noreferrer">
          <ShoppingBag size={17} className="wp-ico" /> Comprar no site oficial
        </a>
      )}

      {/* A SEGUNDA VENDA. O acessório aparece DENTRO do carro de propósito: lista
          separada ninguém abre, mas com o cliente já decidido pelo modelo, ver
          que existe estribo iluminado é o que faz o vendedor oferecer. Cada um
          entra pelo benefício, não pela descrição da peça. */}
      {auto && acessorios.length > 0 && (
        <div className="wp-block">
          <span className="wp-block-label"><Package size={14} className="wp-ico" /> Leve com ele</span>
          <p className="wp-acess-intro">Ofereça no fechamento, com o carro já escolhido. O código é o que você usa pra pedir.</p>
          {/* Cortado em quatro de propósito. Este bloco aparece na hora do
              fechamento, e vinte e um itens numa lista só não é oferta, é
              catálogo — o vendedor rola, desiste e não oferece nenhum. Os
              quatro primeiros são os de conversa mais fácil; o resto continua
              a um toque. */}
          {(verTodosAcess ? acessorios : acessorios.slice(0, 4)).map((a) => (
            <div key={a.id} className="wp-acess">
              {a.foto && (
                <button type="button" className="wp-acess-mini wp-acess-mini--card" onClick={() => setFotoAmpliada(a)} aria-label={`Ampliar foto de ${a.nome}`}>
                  <img src={a.foto} alt={a.nome} loading="lazy" />
                  <span className="wp-acess-lupa"><Maximize2 size={11} className="wp-ico" /></span>
                </button>
              )}
              <div className="wp-acess-topo">
                <Link to={`/eleva/acessorio/${a.id}`} className="wp-acess-nome">{a.nome}</Link>
                <span className="wp-acess-preco">{precoLabel(a)}</span>
              </div>
              <p className="wp-acess-benef">{a.beneficio}</p>
              <details className="wp-acess-mais">
                <summary>Como oferecer e o código</summary>
                <p>{a.comoOferecer}</p>
                {a.observacao && <p className="wp-acess-obs">{a.observacao}</p>}
                <ul className="wp-acess-pns">
                  {a.codigos.map((c) => (
                    <li key={c.pn}><i>{c.modelo}</i> <code>{c.pn}</code></li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
          {acessorios.length > 4 && (
            <button type="button" className="wp-acess-todos" onClick={() => setVerTodosAcess((v) => !v)}>
              {verTodosAcess
                ? 'Mostrar menos'
                : `Ver os outros ${acessorios.length - 4} acessórios`}
            </button>
          )}
        </div>
      )}

      {/* O ONE-PAGE. No automotivo é o material que o vendedor manda de verdade:
          sai com o nome e o WhatsApp DELE, então ele quer mandar. */}
      {auto && (
        <div className="wp-op">
          <span className="wp-block-label"><FileDown size={14} className="wp-ico" /> Material pronto</span>
          <button className="wp-op-btn wp-op-btn--main" onClick={() => material('cliente')} disabled={!!gerando}>
            <Send size={17} className="wp-ico" />
            {gerando === 'cliente' ? 'Preparando…' : 'Mandar one-page pro cliente'}
          </button>
          <button className="wp-op-btn" onClick={() => material('estudo')} disabled={!!gerando}>
            <BookOpen size={16} className="wp-ico" />
            {gerando === 'estudo' ? 'Preparando…' : 'Versão de estudo (uso interno)'}
          </button>
          {semContato ? (
            // Texto solto não resolve: a pessoa lê, concorda e não vai. O caminho
            // tem que estar aqui, no momento em que ela quer mandar o material.
            <Link to="/eleva/perfil" className="wp-op-falta">
              <span>Seu material vai sair sem contato. Preencha uma vez e vale pra todos os carros.</span>
              <b>Completar meu cartão <ChevronRight size={14} className="wp-ico" /></b>
            </Link>
          ) : (
            <p className="wp-op-hint">
              O PDF já chega com a folha em miniatura na conversa — e é o que o cliente imprime e leva pra casa.
            </p>
          )}
          {avisoOp && <p className="wp-op-aviso">{avisoOp}</p>}
        </div>
      )}

      {fotoAmpliada?.foto && (
        <div className="wp-foto-lb" onClick={() => setFotoAmpliada(null)} role="dialog" aria-label={fotoAmpliada.nome}>
          <button type="button" className="wp-cond-lb-x" aria-label="Fechar"><X size={20} className="wp-ico" /></button>
          <img src={fotoAmpliada.foto} alt={fotoAmpliada.nome} onClick={(e) => e.stopPropagation()} />
          <span className="wp-foto-lb-cap">{fotoAmpliada.nome} · {precoLabel(fotoAmpliada)}</span>
        </div>
      )}

      {!balcao && (
        <>
          <p className="wp-share-hint">
            {auto
              ? 'Vai o one-page em PDF com a mensagem. A cada toque a mensagem muda — assim você não repete o mesmo texto com clientes diferentes.'
              : 'A cada toque, o botão envia uma mensagem diferente — assim você não repete o mesmo texto com clientes diferentes.'}
          </p>
          <button className="wp-share" onClick={share} disabled={!!gerando}>
            <ArrowUpRight size={18} className="wp-ico" />
            {gerando ? 'Preparando o material…' : `Compartilhar com ${v.aCliente}`}
          </button>
        </>
      )}
    </div>
  );
}
