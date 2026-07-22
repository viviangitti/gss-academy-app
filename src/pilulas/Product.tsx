import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageCircle, BadgeCheck, Clock, Target, ShieldCheck, ShoppingBag, ClipboardList, Send, FileText,
  ArrowUpRight, Play, Pause, Plus, Minus, Camera,
  Pencil, ChevronDown, UploadCloud, Check, Image as ImageIcon,
  Volume2,
} from 'lucide-react';
import { speak, stopSpeaking } from './data/speech';
import { NARRATION_TIMINGS } from './data/narrationTimings';
import { submitObjection, fetchMyObjections, objectionDate, type TeamObjection } from './data/objections';
import { buildShareVariants, buildFichaMessage, buyLinkFor, type BuyContext, type Product as ProductT } from './data/products';
import Quiz from './Quiz';
import { findProduct, hasVideo, getVideoObjectUrl, ensureVideoLoaded, setProductIG, setProductVideo, clearProductVideo, hasImage, getProductImageUrl, ensureImageLoaded, setProductImage, clearProductImage, useStore } from './data/store';
import { audienceVideoKey, getAudienceReel, setAudienceReel, useAudienceReels, audiencesForLine } from './data/audienceVideos';
import { pegarVideoPreparado, adotarVideo } from './data/videoGesture';
import { getAfiliadoCode } from './data/afiliadoCode';
import { recordView } from './data/tracking';
import { useAuth, audienceOf, type Audience } from './AuthContext';
import { useBrand } from './BrandContext';
import { isBalcao } from './data/brands';

// Duração de cada cena a partir da marcação de tempo do roteiro ("0-4s" → 4s).
function sceneMs(t: string): number {
  const m = t.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return Math.max(1800, (Number(m[2]) - Number(m[1])) * 1000);
  return 2600;
}

// Vídeos que AINDA usam legenda automática (.vtt gerado por transcrição). Quando
// a Mari manda o vídeo já editado COM legenda queimada, tiramos o nome daqui e
// apagamos o .vtt — senão apareceria legenda em cima de legenda.
const LEGENDA_AUTO = new Set([
  'glpen-nutri-energy-nutri',
  'glpen-nutri-energy-afiliado',
]);

function VideoMp4({ url }: { url: string }) {
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

function Reel({ product, previewAudience }: { product: ProductT; previewAudience?: Audience | null }) {
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

  const scene = product.storyboard[i];
  const ms = sceneMs(scene.t);
  const len = product.storyboard.length;

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
  const timings = NARRATION_TIMINGS[product.id];

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
    const line = product.storyboard[idx].line;
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
    if (!a.src.endsWith(`${product.id}.mp3`)) a.src = `/audio/narration/${product.id}.mp3`;
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
  if (variantMp4) return <VideoMp4 key={variantMp4} url={variantMp4} />;
  if (variantReel) {
    return <div className="wp-reel wp-reel--ig"><InstagramEmbed url={variantReel} /></div>;
  }
  if (staticAudienceVid) return <VideoMp4 key={staticAudienceVid} url={staticAudienceVid} />;
  if (baseMp4) return <VideoMp4 key={baseMp4} url={baseMp4} />;

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
            {product.storyboard.map((_, idx) => (
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
          <textarea className="wp-objadd-in" value={text} onChange={(e) => setText(e.target.value)} placeholder={'O que a cliente falou? Ex.: "tenho medo de misturar com meu remédio"'} rows={2} />
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
        <Pencil size={14} className="wp-ico" /> Trocar o vídeo desta pílula
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
          {temCapa && <img src={capaUrl} alt="capa do produto" className="wp-videdit-preview" />}
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
  // Quem está mandando — vira o rastreio na URL de compra (Shopify lê UTM).
  const buyCtx: BuyContext = {
    medium: audienceOf(user) ?? user?.role,
    code: getAfiliadoCode(user?.email),
  };
  const { id } = useParams();
  const product = id ? findProduct(id) : undefined;
  const [openObj, setOpenObj] = useState<number | null>(0);
  const [openFicha, setOpenFicha] = useState(false);
  const [shareIdx, setShareIdx] = useState(0);
  // Gestor: qual público ele está ASSISTINDO (null = o vídeo padrão).
  const [previewAud, setPreviewAud] = useState<Audience | null>(null);
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
        <p>Produto não encontrado.</p>
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

  const share = async () => {
    const variants = buildShareVariants(product, buyCtx);
    const text = variants[shareIdx % variants.length];
    setShareIdx((n) => n + 1); // próximo toque = próxima versão
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
      <Reel product={product} previewAudience={previewAud} />
      <GestorVideoEditor product={product} />

      <h1 className="wp-prod-name">{product.name}</h1>
      <p className="wp-prod-tag">{product.tagline}</p>

      <div className="wp-block">
        <span className="wp-block-label"><MessageCircle size={14} className="wp-ico" /> O que é</span>
        <p>{product.whatItIs}</p>
      </div>

      <div className="wp-block">
        <span className="wp-block-label"><BadgeCheck size={14} className="wp-ico" /> Benefícios para destacar</span>
        <ul className="wp-benefits">
          {product.benefits.map((b, idx) => (
            <li key={idx}>{b}</li>
          ))}
        </ul>
      </div>

      {/* Ficha técnica — consulta rápida no balcão. Fechada por padrão pra não
          competir com o conteúdo de venda; abre num toque. */}
      {product.ficha && product.ficha.length > 0 && (
        <div className="wp-ficha">
          <button className="wp-ficha-toggle" onClick={() => setOpenFicha((o) => !o)}>
            <ClipboardList size={15} className="wp-ico" /> Ficha do produto
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
              <span className="wp-block-label"><Clock size={14} className="wp-ico" /> Como usar</span>
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
              <button className="wp-obj-q" onClick={() => setOpenObj(openObj === idx ? null : idx)}>
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

      {!balcao && (
        <>
          <p className="wp-share-hint">A cada toque, o botão envia uma mensagem diferente — assim você não repete o mesmo texto com clientes diferentes.</p>
          <button className="wp-share" onClick={share}>
            <ArrowUpRight size={18} className="wp-ico" /> Compartilhar com a cliente
          </button>
        </>
      )}
    </div>
  );
}
