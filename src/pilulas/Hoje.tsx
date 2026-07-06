import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Play, Send, Flame, CalendarDays, ChevronRight, Copy, Check, ShieldCheck } from 'lucide-react';
import { allProducts, useStore } from './data/store';
import { buildShareMessage, type Product } from './data/products';
import { CALENDAR, CHANNELS } from './data/creatorContent';
import { getStats } from './data/tracking';
import { useBrand } from './BrandContext';
import { useAuth } from './AuthContext';
import PrimeirosPassos from './PrimeirosPassos';

// ---------- Busca "Me salva": acha a resposta pronta pelo que a cliente falou ----------
function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

interface Hit {
  product: Product;
  kind: 'objecao' | 'produto';
  trigger?: string; // o que a cliente falou (quando é objeção)
  answer?: string; // resposta pronta
}

// Casa por PALAVRAS (todas precisam aparecer, em qualquer ordem) — assim
// "achou caro" encontra "achei caro", "dor joelho" encontra o Moviben etc.
// Radical simples: corta sufixo comum de verbo/plural pra "achou"≈"achei".
function stem(w: string): string {
  return w.length > 4 ? w.replace(/(ou|ei|ar|er|ir|as|es|is|os|s)$/, '') : w;
}
function matches(blob: string, words: string[]): boolean {
  return words.every((w) => blob.includes(w) || (w.length > 3 && blob.includes(stem(w))));
}

function searchPills(query: string, products: Product[]): Hit[] {
  const q = norm(query.trim());
  if (q.length < 2) return [];
  const words = q.split(/\s+/).filter((w) => w.length >= 2);
  if (!words.length) return [];
  const hits: Hit[] = [];
  for (const p of products) {
    // 1º: objeções — o "me salva" de verdade (resposta pronta na tela)
    for (const o of p.objections) {
      if (matches(norm(o.trigger + ' ' + o.answer), words)) {
        hits.push({ product: p, kind: 'objecao', trigger: o.trigger, answer: o.answer });
      }
    }
    // 2º: o produto em si (nome, dor, benefício, pra quem é)
    const blob = norm(
      [p.name, p.tagline, p.hook, p.whatItIs, p.forWho, p.howToUse, ...p.benefits].join(' ')
    );
    if (matches(blob, words)) {
      hits.push({ product: p, kind: 'produto' });
    }
  }
  // Objeções primeiro; 1 resultado por produto/tipo; máx. 6
  const seen = new Set<string>();
  return hits
    .sort((a, b) => (a.kind === 'objecao' ? -1 : 1) - (b.kind === 'objecao' ? -1 : 1))
    .filter((h) => {
      const k = `${h.product.id}:${h.kind}:${h.trigger || ''}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 6);
}

function HitCard({ hit }: { hit: Hit }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(hit.answer || '').then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 1500); },
      () => {}
    );
  };
  if (hit.kind === 'objecao') {
    return (
      <div className="wp-td-hit">
        <span className="wp-td-hit-tag"><ShieldCheck size={12} className="wp-ico" /> Resposta pronta · {hit.product.name}</span>
        <p className="wp-td-hit-trigger">{hit.trigger}</p>
        <p className="wp-td-hit-answer">{hit.answer}</p>
        <div className="wp-td-hit-actions">
          <button className="wp-td-hit-copy" onClick={copy}>
            {copied ? <><Check size={14} className="wp-ico" /> Copiado</> : <><Copy size={14} className="wp-ico" /> Copiar resposta</>}
          </button>
          <Link to={`/eleva/produto/${hit.product.id}`} className="wp-td-hit-open">
            ver pílula <ChevronRight size={14} className="wp-ico" />
          </Link>
        </div>
      </div>
    );
  }
  return (
    <Link to={`/eleva/produto/${hit.product.id}`} className="wp-td-hit wp-td-hit-prod">
      <span className="wp-td-hit-tag"><Play size={12} className="wp-ico" /> Pílula · 30s</span>
      <p className="wp-td-hit-trigger">{hit.product.name}</p>
      <p className="wp-td-hit-answer">{hit.product.hook}</p>
    </Link>
  );
}

// ---------- Tela Hoje ----------
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export default function Hoje() {
  useStore();
  const navigate = useNavigate();
  const { brandId } = useBrand();
  const { user } = useAuth();
  const [q, setQ] = useState('');

  const products = useMemo(() => allProducts().filter((p) => p.brand === brandId), [brandId]);
  const hits = useMemo(() => searchPills(q, products), [q, products]);

  const stats = getStats();
  const firstName = (user?.name || '').split(' ')[0] || 'Você';

  // Pílula do dia: gira todo dia, determinística (mesmo produto o dia todo)
  const pill = products.length ? products[dayOfYear() % products.length] : undefined;

  // Post do dia: item do calendário pelo dia da semana
  const today = WEEKDAYS[new Date().getDay()];
  const post = CALENDAR.find((c) => c.day === today) || CALENDAR[0];
  const channel = CHANNELS.find((c) => c.id === post.channel);

  const sharePill = () => {
    if (!pill) return;
    const text = buildShareMessage(pill);
    if (navigator.share) {
      navigator.share({ text, title: pill.name }).catch(() => {});
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="wp-today">
      <div className="wp-td-head">
        <div>
          <h1 className="wp-td-hi">Oi, {firstName}!</h1>
          <p className="wp-td-sub">O que você precisa agora?</p>
        </div>
        {stats.streak > 0 && (
          <span className="wp-td-streak"><Flame size={14} className="wp-ico" /> {stats.streak} {stats.streak === 1 ? 'dia' : 'dias'}</span>
        )}
      </div>

      {/* Me salva: busca por dor/objeção/produto */}
      <div className="wp-td-search">
        <Search size={17} className="wp-ico wp-td-search-ic" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cliente perguntou? Digite: joelho, cansaço, caro…"
          aria-label="Buscar resposta pronta"
        />
      </div>
      {q.trim().length >= 2 && (
        <div className="wp-td-hits">
          {hits.length ? hits.map((h, i) => <HitCard key={i} hit={h} />) : (
            <p className="wp-td-nohit">Nada por aqui… tenta outra palavra (ex.: "sono", "ferro", "caro").</p>
          )}
        </div>
      )}

      {!q.trim() && (
        <>
          <PrimeirosPassos />

          {/* Pílula do dia */}
          {pill && (
            <div className="wp-td-card">
              <span className="wp-td-card-label"><Play size={13} className="wp-ico" /> Sua pílula de hoje · {pill.durationSec}s</span>
              <div
                className="wp-td-pill"
                style={{ background: `linear-gradient(135deg, ${pill.gradient[0]}, ${pill.gradient[1]})` }}
                onClick={() => navigate(`/eleva/produto/${pill.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/eleva/produto/${pill.id}`)}
              >
                <b className="wp-td-pill-name">{pill.name}</b>
                <p className="wp-td-pill-hook">{pill.hook}</p>
              </div>
              <div className="wp-td-row">
                <Link to={`/eleva/produto/${pill.id}`} className="wp-td-btn wp-td-btn-main">
                  <Play size={15} className="wp-ico" /> Assistir agora
                </Link>
                <button className="wp-td-btn" onClick={sharePill}>
                  <Send size={15} className="wp-ico" /> Mandar pra cliente
                </button>
              </div>
            </div>
          )}

          {/* O que postar hoje */}
          <div className="wp-td-card">
            <span className="wp-td-card-label"><CalendarDays size={13} className="wp-ico" /> O que postar hoje ({post.day})</span>
            <div className="wp-td-post">
              <span className="wp-td-post-chip" style={{ color: channel?.color }}>
                {channel && <channel.Icon size={13} className="wp-ico" />} {channel?.label} · {post.format}
              </span>
              <b className="wp-td-post-tema">{post.tema}</b>
              <p className="wp-td-post-dica">{post.roteiro[0]}</p>
            </div>
            <Link to="/eleva/missoes" className="wp-td-btn wp-td-btn-full">
              Ver o roteiro completo <ChevronRight size={15} className="wp-ico" />
            </Link>
          </div>

          <Link to="/eleva/catalogo" className="wp-td-all">
            Ver todos os produtos <ChevronRight size={14} className="wp-ico" />
          </Link>
        </>
      )}
    </div>
  );
}
