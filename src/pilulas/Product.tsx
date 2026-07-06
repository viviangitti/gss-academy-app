import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageCircle, BadgeCheck, Clock, Target, ShieldCheck,
  ArrowUpRight, Play, Pause, Plus, Minus, Camera,
} from 'lucide-react';
import { buildShareMessage, type Product as ProductT } from './data/products';
import { findProduct, hasVideo, getVideoObjectUrl, ensureVideoLoaded, useStore } from './data/store';
import { recordView } from './data/tracking';

// Duração de cada cena a partir da marcação de tempo do roteiro ("0-4s" → 4s).
function sceneMs(t: string): number {
  const m = t.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return Math.max(1800, (Number(m[2]) - Number(m[1])) * 1000);
  return 2600;
}

function Reel({ product }: { product: ProductT }) {
  useStore(); // re-renderiza quando o vídeo do IndexedDB termina de carregar
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hasVideo(product.id)) ensureVideoLoaded(product.id);
  }, [product.id]);

  const videoUrl = getVideoObjectUrl(product.id) || product.videoUrl;
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

  // Prioridade do vídeo da pílula: MP4 enviado > reel do Instagram > storyboard animado.
  if (videoUrl) {
    return (
      <div className="wp-reel wp-reel--video" style={{ background: '#000' }}>
        <video className="wp-reel-videoel" src={videoUrl} autoPlay muted loop playsInline controls />
      </div>
    );
  }

  if (product.instagramUrl) {
    return (
      <div className="wp-reel wp-reel--ig">
        <InstagramEmbed url={product.instagramUrl} />
      </div>
    );
  }

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

function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    const w = window as unknown as { instgrm?: { Embeds?: { process: () => void } } };
    const run = () => w.instgrm?.Embeds?.process();
    if (w.instgrm) { run(); return; }
    const ID = 'instagram-embed-js';
    const existing = document.getElementById(ID) as HTMLScriptElement | null;
    if (existing) { run(); return; }
    const s = document.createElement('script');
    s.id = ID;
    s.async = true;
    s.src = 'https://www.instagram.com/embed.js';
    s.addEventListener('load', run);
    document.body.appendChild(s);
  }, [url]);
  return (
    <blockquote
      className="instagram-media wp-ig"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
    >
      <a href={url} target="_blank" rel="noreferrer" className="wp-ig-fallback">Ver no Instagram <ArrowUpRight size={13} className="wp-ico" /></a>
    </blockquote>
  );
}

export default function Product() {
  const { id } = useParams();
  const product = id ? findProduct(id) : undefined;
  const [openObj, setOpenObj] = useState<number | null>(0);
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
        <Link to="/eleva" className="wp-btn wp-btn-outline">Voltar ao catálogo</Link>
      </div>
    );
  }

  const share = () => {
    const text = buildShareMessage(product);
    if (navigator.share) {
      navigator.share({ text, title: product.name }).catch(() => {});
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="wp-product">
      <Reel product={product} />

      <h1 className="wp-prod-name">{product.name}</h1>
      <p className="wp-prod-tag">{product.tagline}</p>

      <div className="wp-block">
        <span className="wp-block-label"><MessageCircle size={14} className="wp-ico" /> O que é</span>
        <p>{product.whatItIs}</p>
      </div>

      <div className="wp-block">
        <span className="wp-block-label"><BadgeCheck size={14} className="wp-ico" /> Benefícios pra destacar</span>
        <ul className="wp-benefits">
          {product.benefits.map((b, idx) => (
            <li key={idx}>{b}</li>
          ))}
        </ul>
      </div>

      <div className="wp-row">
        <div className="wp-block wp-half">
          <span className="wp-block-label"><Clock size={14} className="wp-ico" /> Como usar</span>
          <p>{product.howToUse}</p>
        </div>
        <div className="wp-block wp-half">
          <span className="wp-block-label"><Target size={14} className="wp-ico" /> Pra quem é</span>
          <p>{product.forWho}</p>
        </div>
      </div>

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

      {mp4 && product.instagramUrl && (
        <div className="wp-block">
          <span className="wp-block-label"><Camera size={14} className="wp-ico" /> Prova social</span>
          <InstagramEmbed url={product.instagramUrl} />
        </div>
      )}

      {product.compliance && (
        <div className="wp-compliance">
          <strong>Atenção (fale certo):</strong> {product.compliance}
        </div>
      )}

      <div className="wp-salesline">“{product.salesLine}”</div>

      <button className="wp-share" onClick={share}>
        <ArrowUpRight size={18} className="wp-ico" /> Compartilhar com a cliente
      </button>
    </div>
  );
}
