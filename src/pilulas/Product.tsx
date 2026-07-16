import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageCircle, BadgeCheck, Clock, Target, ShieldCheck, ShoppingBag, ClipboardList, Send,
  ArrowUpRight, Play, Pause, Plus, Minus, Camera,
  Pencil, ChevronDown, UploadCloud, Check, Image as ImageIcon,
} from 'lucide-react';
import { buildShareVariants, buildFichaMessage, buyLinkFor, type BuyContext, type Product as ProductT } from './data/products';
import Quiz from './Quiz';
import { findProduct, hasVideo, getVideoObjectUrl, ensureVideoLoaded, setProductIG, setProductVideo, clearProductVideo, hasImage, getProductImageUrl, ensureImageLoaded, setProductImage, clearProductImage, useStore } from './data/store';
import { audienceVideoKey, getAudienceReel, setAudienceReel, useAudienceReels, AUDIENCES } from './data/audienceVideos';
import { getAfiliadoCode } from './data/afiliadoCode';
import { recordView } from './data/tracking';
import { useAuth, audienceOf, type Audience } from './AuthContext';

// Duração de cada cena a partir da marcação de tempo do roteiro ("0-4s" → 4s).
function sceneMs(t: string): number {
  const m = t.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return Math.max(1800, (Number(m[2]) - Number(m[1])) * 1000);
  return 2600;
}

function VideoMp4({ url }: { url: string }) {
  return (
    <div className="wp-reel wp-reel--video" style={{ background: '#000' }}>
      <video className="wp-reel-videoel" src={url} autoPlay muted loop playsInline controls />
    </div>
  );
}

function Reel({ product }: { product: ProductT }) {
  useStore(); // re-renderiza quando o vídeo do IndexedDB termina de carregar
  useAudienceReels(); // ...e quando os links do gestor chegam da nuvem
  const { user } = useAuth();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cada público vê o vídeo dele (balconista / promotor / afiliado geral /
  // afiliado saúde). Sem vídeo do público, cai no vídeo padrão do produto.
  const audience = audienceOf(user);
  const avKey = audience ? audienceVideoKey(product.id, audience) : null;

  useEffect(() => {
    if (avKey && hasVideo(avKey)) ensureVideoLoaded(avKey);
    if (hasVideo(product.id)) ensureVideoLoaded(product.id);
  }, [product.id, avKey]);

  const variantMp4 = avKey ? getVideoObjectUrl(avKey) : undefined;
  const variantReel = audience ? getAudienceReel(product.id, audience) : undefined;
  const baseMp4 = getVideoObjectUrl(product.id) || product.videoUrl;

  const scene = product.storyboard[i];
  const ms = sceneMs(scene.t);

  useEffect(() => {
    if (!playing) return;
    timer.current = setTimeout(() => {
      setI((prev) => (prev + 1) % product.storyboard.length);
    }, ms);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [i, playing, ms, product.storyboard.length]);

  // Prioridade: [afiliado] vídeo do tipo (MP4 > reel) > [base] MP4 > reel > storyboard animado.
  if (variantMp4) return <VideoMp4 url={variantMp4} />;
  if (variantReel) {
    return <div className="wp-reel wp-reel--ig"><InstagramEmbed url={variantReel} /></div>;
  }
  if (baseMp4) return <VideoMp4 url={baseMp4} />;

  if (product.instagramUrl) {
    return (
      <div className="wp-reel wp-reel--ig">
        <InstagramEmbed url={product.instagramUrl} />
      </div>
    );
  }

  // Sem vídeo: o storyboard animado (a foto NÃO entra aqui — é só capa do catálogo).
  return (
    <div
      className="wp-reel"
      style={{ background: `linear-gradient(160deg, ${product.gradient[0]}, ${product.gradient[1]})` }}
      onClick={() => setPlaying((p) => !p)}
    >
      <div className="wp-reel-glow" />
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
          {AUDIENCES.map((a) => (
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
  // Quem está mandando — vira o rastreio na URL de compra (Shopify lê UTM).
  const buyCtx: BuyContext = {
    medium: audienceOf(user) ?? user?.role,
    code: getAfiliadoCode(user?.email),
  };
  const { id } = useParams();
  const product = id ? findProduct(id) : undefined;
  const [openObj, setOpenObj] = useState<number | null>(0);
  const [openFicha, setOpenFicha] = useState(false);
  const [fichaSent, setFichaSent] = useState(false);
  const [shareIdx, setShareIdx] = useState(0);
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
    setFichaSent(true);
    setTimeout(() => setFichaSent(false), 1800);
  };

  const share = () => {
    const variants = buildShareVariants(product, buyCtx);
    const text = variants[shareIdx % variants.length];
    setShareIdx((n) => n + 1); // próximo toque = próxima versão
    if (navigator.share) {
      navigator.share({ text, title: product.name }).catch(() => {});
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="wp-product">
      <Reel product={product} />
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
              <button className="wp-ficha-send" onClick={sendFicha}>
                {fichaSent ? <><Check size={15} className="wp-ico" /> Ficha copiada!</> : <><Send size={15} className="wp-ico" /> Enviar esta ficha para a cliente</>}
              </button>
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

      <p className="wp-share-hint">A cada toque, o botão envia uma mensagem diferente — assim você não repete o mesmo texto com clientes diferentes.</p>

      <button className="wp-share" onClick={share}>
        <ArrowUpRight size={18} className="wp-ico" /> Compartilhar com a cliente
      </button>
    </div>
  );
}
