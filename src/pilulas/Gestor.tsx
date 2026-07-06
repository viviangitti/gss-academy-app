import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, Plus, UploadCloud, Check, ExternalLink, Users, Eye, Send, TrendingUp, CalendarDays, Flame, Megaphone, Video } from 'lucide-react';
import { useBrand } from './BrandContext';
import { CATEGORIES, type Category, type Product } from './data/products';
import type { OfferKind } from './data/offers';
import { CHANNELS, type Channel } from './data/creatorContent';
import { allProducts, allOffers, allCalendar, allTrends, addProduct, addOffer, addCalendar, addTrend, setProductIG, setProductVideo, clearProductVideo, hasVideo, getRecado, setRecado, useStore } from './data/store';

// Métricas da marca (dados de demonstração — em produção vêm do backend/Firestore).
const METRICS: Record<string, {
  vendedoras: number; assistidas: number; missoes: number; uplift: number;
  top: { name: string; views: number }[];
}> = {
  meraki: {
    vendedoras: 34, assistidas: 512, missoes: 87, uplift: 38,
    top: [
      { name: 'GLPEN Nutri Muscle', views: 210 },
      { name: 'Ative-Fer', views: 120 },
      { name: 'Moviben', views: 68 },
    ],
  },
  wepink: {
    vendedoras: 58, assistidas: 903, missoes: 156, uplift: 41,
    top: [
      { name: 'Cabelos & Unhas', views: 380 },
      { name: 'Sérum Facial Glow', views: 240 },
      { name: 'Body Splash Pink', views: 155 },
    ],
  },
};

const GRADIENT: Record<Category, [string, string]> = {
  performance: ['#12B5A5', '#0B5563'],
  capsulas: ['#6d5dfc', '#2a2356'],
  respiratorio: ['#0ea5e9', '#075985'],
  cosmeticos: ['#f7b733', '#d96d2b'],
  perfumaria: ['#ff5fa2', '#9b2c63'],
};

function ProductForm({ brand, onDone }: { brand: string; onDone: (name: string) => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('performance');
  const [hook, setHook] = useState('');
  const [whatItIs, setWhatItIs] = useState('');
  const [benefits, setBenefits] = useState('');
  const [salesLine, setSalesLine] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [igUrl, setIgUrl] = useState('');

  const valid = name.trim() && hook.trim() && whatItIs.trim();

  const submit = () => {
    if (!valid) return;
    const id = 'p-' + Date.now();
    const bens = benefits.split('\n').map((s) => s.trim()).filter(Boolean);
    const cta = salesLine.trim() || 'Me chama que eu te explico 💬';
    const storyboard = [
      { t: '0-5s', label: 'GANCHO', line: hook.trim() },
      ...(bens[0] ? [{ t: '5-15s', label: 'BENEFÍCIO', line: bens[0] }] : []),
      ...(bens[1] ? [{ t: '15-24s', label: 'BENEFÍCIO', line: bens[1] }] : []),
      { t: '24-30s', label: 'CTA', line: cta },
    ];
    const product: Product = {
      id,
      brand: brand as Product['brand'],
      name: name.trim(),
      category,
      tagline: whatItIs.trim().slice(0, 140),
      hook: hook.trim(),
      whatItIs: whatItIs.trim(),
      benefits: bens.length ? bens : ['Benefício a preencher'],
      howToUse: '',
      forWho: '',
      salesLine: cta,
      objections: [],
      durationSec: 30,
      gradient: GRADIENT[category],
      storyboard,
      instagramUrl: igUrl.trim().split('?')[0].trim() || undefined,
    };
    addProduct(product, video);
    onDone(product.name);
  };

  return (
    <div className="wp-gz-form">
      <label className="wp-gz-label">Nome do produto</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: GLPEN Nutri Muscle" />

      <label className="wp-gz-label">Categoria</label>
      <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
        {Object.entries(CATEGORIES).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>

      <label className="wp-gz-label">Gancho (a dor/desejo da cliente)</label>
      <input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="Ex.: Cabelo caindo e unha que não cresce?" />

      <label className="wp-gz-label">O que é (1–2 frases)</label>
      <textarea value={whatItIs} onChange={(e) => setWhatItIs(e.target.value)} rows={3} placeholder="O essencial do produto, sem bula." />

      <label className="wp-gz-label">Benefícios (um por linha)</label>
      <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={3} placeholder={'Auxilia na...\nContribui para...'} />

      <label className="wp-gz-label">Frase de venda / CTA</label>
      <input value={salesLine} onChange={(e) => setSalesLine(e.target.value)} placeholder="Me chama que eu te explico 💬" />

      <label className="wp-gz-label">Vídeo da pílula — escolha UMA opção</label>
      <label className="wp-gz-upload">
        <UploadCloud size={18} className="wp-ico" />
        {video ? video.name : '1) Subir um vídeo MP4 do produto'}
        <input type="file" accept="video/*" hidden onChange={(e) => setVideo(e.target.files?.[0] || null)} />
      </label>
      <p className="wp-gz-or">ou</p>
      <input value={igUrl} onChange={(e) => setIgUrl(e.target.value)} placeholder="2) Colar o link de um reel do Instagram" />
      <p className="wp-gz-help">Se colar o reel do Instagram, ele vira o vídeo que a pessoa assiste. Se subir um MP4, o reel (se houver) aparece como prova social.</p>

      <button className="wp-gz-submit" disabled={!valid} onClick={submit}>
        <Check size={16} className="wp-ico" /> Publicar produto
      </button>
      {!valid && <p className="wp-gz-hint">Preencha nome, gancho e "o que é".</p>}
    </div>
  );
}

const OFFER_KINDS: { value: OfferKind; label: string }[] = [
  { value: 'desconto', label: 'Desconto' },
  { value: 'combo', label: 'Combo' },
  { value: 'frete', label: 'Frete grátis' },
  { value: 'brinde', label: 'Brinde' },
];

function OfferForm({ brand, onDone }: { brand: string; onDone: (t: string) => void }) {
  const [tag, setTag] = useState('');
  const [tagKind, setTagKind] = useState<OfferKind>('desconto');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [until, setUntil] = useState('');
  const [share, setShare] = useState('');

  const valid = tag.trim() && title.trim();

  const submit = () => {
    if (!valid) return;
    addOffer({
      brand: brand as 'meraki' | 'wepink',
      tag: tag.trim(),
      tagKind,
      title: title.trim(),
      desc: desc.trim(),
      until: until.trim() || 'por tempo limitado',
      share: share.trim() || `*${title.trim()}*\n\nMe chama pra garantir 💬`,
    });
    onDone(title.trim());
  };

  return (
    <div className="wp-gz-form">
      <div className="wp-gz-row">
        <div>
          <label className="wp-gz-label">Selo (curto)</label>
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="30% OFF" />
        </div>
        <div>
          <label className="wp-gz-label">Tipo</label>
          <select value={tagKind} onChange={(e) => setTagKind(e.target.value as OfferKind)}>
            {OFFER_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </div>
      </div>

      <label className="wp-gz-label">Título</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Cabelos & Unhas — 1º pote" />

      <label className="wp-gz-label">Descrição</label>
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="O que a cliente ganha e por quê." />

      <label className="wp-gz-label">Validade</label>
      <input value={until} onChange={(e) => setUntil(e.target.value)} placeholder="até domingo" />

      <label className="wp-gz-label">Mensagem pronta de WhatsApp</label>
      <textarea value={share} onChange={(e) => setShare(e.target.value)} rows={3} placeholder="Texto que a vendedora manda pra cliente." />

      <button className="wp-gz-submit" disabled={!valid} onClick={submit}>
        <Check size={16} className="wp-ico" /> Publicar oferta
      </button>
    </div>
  );
}

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function CalendarForm({ brand, onDone }: { brand: string; onDone: (t: string) => void }) {
  const [day, setDay] = useState('Seg');
  const [channel, setChannel] = useState<Channel>('instagram');
  const [format, setFormat] = useState('');
  const [tema, setTema] = useState('');
  const [roteiro, setRoteiro] = useState('');
  const valid = tema.trim();
  const submit = () => {
    if (!valid) return;
    addCalendar({
      brand: brand as 'meraki' | 'wepink',
      day, channel,
      format: format.trim() || 'Post',
      tema: tema.trim(),
      roteiro: roteiro.split('\n').map((s) => s.trim()).filter(Boolean),
    });
    onDone(tema.trim());
  };
  return (
    <div className="wp-gz-form">
      <div className="wp-gz-row">
        <div>
          <label className="wp-gz-label">Dia</label>
          <select value={day} onChange={(e) => setDay(e.target.value)}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select>
        </div>
        <div>
          <label className="wp-gz-label">Canal</label>
          <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
            {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <label className="wp-gz-label">Formato</label>
      <input value={format} onChange={(e) => setFormat(e.target.value)} placeholder="Reels, Stories, Caixinha..." />
      <label className="wp-gz-label">Tema do conteúdo</label>
      <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex.: Antes e depois do produto" />
      <label className="wp-gz-label">Roteiro (um passo por linha)</label>
      <textarea value={roteiro} onChange={(e) => setRoteiro(e.target.value)} rows={3} placeholder={'Gancho...\nVirada...\nCTA...'} />
      <button className="wp-gz-submit" disabled={!valid} onClick={submit}><Check size={16} className="wp-ico" /> Publicar no calendário</button>
    </div>
  );
}

function TrendForm({ brand, onDone }: { brand: string; onDone: (t: string) => void }) {
  const [channel, setChannel] = useState<Channel>('instagram');
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dica, setDica] = useState('');
  const valid = title.trim();
  const submit = () => {
    if (!valid) return;
    addTrend({
      brand: brand as 'meraki' | 'wepink',
      id: 't-' + Date.now(),
      channel,
      tag: tag.trim() || 'Trend',
      title: title.trim(),
      desc: desc.trim(),
      dica: dica.trim(),
    });
    onDone(title.trim());
  };
  return (
    <div className="wp-gz-form">
      <div className="wp-gz-row">
        <div>
          <label className="wp-gz-label">Canal</label>
          <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
            {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="wp-gz-label">Etiqueta</label>
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Reels, Caixinha..." />
        </div>
      </div>
      <label className="wp-gz-label">Título da tendência</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Ex.: Transição "antes/depois"' />
      <label className="wp-gz-label">Descrição</label>
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Como fazer o conteúdo." />
      <label className="wp-gz-label">Dica</label>
      <input value={dica} onChange={(e) => setDica(e.target.value)} placeholder="O pulo do gato pra viralizar." />
      <button className="wp-gz-submit" disabled={!valid} onClick={submit}><Check size={16} className="wp-ico" /> Publicar tendência</button>
    </div>
  );
}

function ProductRow({ p }: { p: Product }) {
  useStore();
  const [open, setOpen] = useState(false);
  const [ig, setIg] = useState(p.instagramUrl || '');
  const [saved, setSaved] = useState(false);
  const [vidName, setVidName] = useState('');
  const uploaded = hasVideo(p.id);
  const meta = uploaded ? (
    <><Video size={12} className="wp-ico" /> vídeo MP4</>
  ) : p.instagramUrl ? (
    <><Video size={12} className="wp-ico" /> vídeo do Instagram</>
  ) : (
    CATEGORIES[p.category].label
  );
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1600); };
  return (
    <div className="wp-gz-prod">
      <button className="wp-gz-item wp-gz-item-btn" onClick={() => setOpen((o) => !o)}>
        <span className="wp-gz-item-name">{p.name}</span>
        <span className="wp-gz-item-meta">{meta}</span>
      </button>
      {open && (
        <div className="wp-gz-prod-edit">
          <label className="wp-gz-label">Vídeo da pílula — escolha UMA opção</label>
          <label className="wp-gz-upload">
            <UploadCloud size={18} className="wp-ico" />
            {vidName || (uploaded ? 'Trocar o vídeo MP4' : '1) Subir um vídeo MP4')}
            <input
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { setProductVideo(p.id, f); setVidName(f.name); flash(); } }}
            />
          </label>
          <p className="wp-gz-or">ou</p>
          <input value={ig} onChange={(e) => setIg(e.target.value)} placeholder="2) Colar o link de um reel do Instagram" />
          <p className="wp-gz-help">O que você colocar aqui vira o vídeo que a pessoa assiste. Sem vídeo, aparece a prévia animada padrão.</p>
          <button className="wp-gz-submit" style={{ marginTop: 8 }} onClick={() => { setProductIG(p.id, ig); flash(); }}>
            {saved ? <><Check size={16} className="wp-ico" /> Salvo</> : 'Salvar reel do Instagram'}
          </button>
          {(uploaded || p.instagramUrl) && (
            <button
              className="wp-gz-add"
              style={{ marginTop: 8, background: 'var(--wp-bg)', color: 'var(--wp-soft)' }}
              onClick={() => { clearProductVideo(p.id); setProductIG(p.id, ''); setIg(''); setVidName(''); }}
            >
              Tirar o vídeo (voltar pro padrão)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Gestor() {
  useStore();
  const { brand, brandId } = useBrand();
  const [openForm, setOpenForm] = useState<'produto' | 'oferta' | 'calendario' | 'tendencia' | null>(null);
  const [toast, setToast] = useState('');

  const products = allProducts().filter((p) => p.brand === brandId);
  const offers = allOffers().filter((o) => o.brand === brandId);
  const calendar = allCalendar(brandId);
  const trends = allTrends(brandId);
  const m = METRICS[brandId];
  const topMax = Math.max(...m.top.map((t) => t.views));
  const [recadoText, setRecadoText] = useState(getRecado(brandId));

  const done = (label: string, what: string) => {
    setOpenForm(null);
    setToast(`${what} "${label}" publicado — já está no app.`);
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="wp-gestor">
      <div className="wp-gz-hero">
        <span className="wp-gz-hero-tag">PAINEL DO GESTOR</span>
        <h1 className="wp-gz-hero-title">Gestão da marca {brand.name}</h1>
        <p className="wp-gz-hero-sub">Cadastre produtos, suba vídeos e crie ofertas. Sai daqui, aparece na hora pro time.</p>
      </div>

      {toast && <div className="wp-gz-toast"><Check size={13} className="wp-ico" /> {toast} <Link to="/eleva">ver no app <ExternalLink size={12} className="wp-ico" /></Link></div>}

      {/* Recado pro time */}
      <div className="wp-gz-block">
        <div className="wp-gz-block-head">
          <span className="wp-gz-block-title"><Megaphone size={17} className="wp-ico" /> Recado pro time</span>
        </div>
        <div className="wp-gz-form">
          <textarea
            value={recadoText}
            onChange={(e) => setRecadoText(e.target.value)}
            rows={2}
            placeholder="Ex.: Meninas, foco no GLPEN essa semana! Quem bater 5 posts ganha brinde 🎁"
          />
          <div className="wp-gz-row" style={{ marginTop: 10 }}>
            <button className="wp-gz-submit" style={{ marginTop: 0 }} onClick={() => { setRecado(brandId, recadoText.trim()); setToast('Recado publicado pro time.'); setTimeout(() => setToast(''), 4000); }}>
              <Send size={15} className="wp-ico" /> Publicar recado
            </button>
            {getRecado(brandId) && (
              <button className="wp-gz-add" style={{ background: 'var(--wp-bg)', color: 'var(--wp-soft)' }} onClick={() => { setRecado(brandId, ''); setRecadoText(''); }}>
                Tirar do ar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="wp-gz-metrics">
        <div className="wp-gz-metrics-head"><TrendingUp size={16} className="wp-ico" /> Métricas da semana</div>
        <div className="wp-gz-kpis">
          <div className="wp-gz-kpi">
            <Users size={16} className="wp-ico wp-gz-kpi-ic" />
            <b>{m.vendedoras}</b><span>vendedoras ativas</span>
          </div>
          <div className="wp-gz-kpi">
            <Eye size={16} className="wp-ico wp-gz-kpi-ic" />
            <b>{m.assistidas}</b><span>pílulas assistidas</span>
          </div>
          <div className="wp-gz-kpi">
            <Send size={16} className="wp-ico wp-gz-kpi-ic" />
            <b>{m.missoes}</b><span>posts de creator</span>
          </div>
        </div>
        <div className="wp-gz-uplift">
          <b>+{m.uplift}%</b> — vendedora que assiste pílula vende mais que a que não assiste
        </div>
        <div className="wp-gz-top">
          <div className="wp-gz-top-head">Produtos mais assistidos</div>
          {m.top.map((t) => (
            <div key={t.name} className="wp-gz-bar-row">
              <span className="wp-gz-bar-name">{t.name}</span>
              <span className="wp-gz-bar-track">
                <span className="wp-gz-bar-fill" style={{ width: `${(t.views / topMax) * 100}%` }} />
              </span>
              <span className="wp-gz-bar-val">{t.views}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Produtos */}
      <div className="wp-gz-block">
        <div className="wp-gz-block-head">
          <span className="wp-gz-block-title"><Package size={17} className="wp-ico" /> Produtos ({products.length})</span>
          <button className="wp-gz-add" onClick={() => setOpenForm(openForm === 'produto' ? null : 'produto')}>
            <Plus size={15} className="wp-ico" /> Novo produto
          </button>
        </div>
        {openForm === 'produto' && <ProductForm brand={brandId} onDone={(n) => done(n, 'Produto')} />}
        <div className="wp-gz-list">
          {products.map((p) => <ProductRow key={p.id} p={p} />)}
        </div>
      </div>

      {/* Ofertas */}
      <div className="wp-gz-block">
        <div className="wp-gz-block-head">
          <span className="wp-gz-block-title"><Tag size={17} className="wp-ico" /> Ofertas ({offers.length})</span>
          <button className="wp-gz-add" onClick={() => setOpenForm(openForm === 'oferta' ? null : 'oferta')}>
            <Plus size={15} className="wp-ico" /> Nova oferta
          </button>
        </div>
        {openForm === 'oferta' && <OfferForm brand={brandId} onDone={(t) => done(t, 'Oferta')} />}
        <div className="wp-gz-list">
          {offers.map((o, i) => (
            <div key={i} className="wp-gz-item">
              <span className="wp-gz-item-name">{o.title}</span>
              <span className="wp-gz-item-meta">{o.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendário de conteúdo */}
      <div className="wp-gz-block">
        <div className="wp-gz-block-head">
          <span className="wp-gz-block-title"><CalendarDays size={17} className="wp-ico" /> Calendário ({calendar.length})</span>
          <button className="wp-gz-add" onClick={() => setOpenForm(openForm === 'calendario' ? null : 'calendario')}>
            <Plus size={15} className="wp-ico" /> Nova ideia
          </button>
        </div>
        {openForm === 'calendario' && <CalendarForm brand={brandId} onDone={(t) => done(t, 'Conteúdo')} />}
        <div className="wp-gz-list">
          {calendar.slice(0, 8).map((c, i) => (
            <div key={i} className="wp-gz-item">
              <span className="wp-gz-item-name">{c.day} · {c.tema}</span>
              <span className="wp-gz-item-meta">{c.format}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tendências */}
      <div className="wp-gz-block">
        <div className="wp-gz-block-head">
          <span className="wp-gz-block-title"><Flame size={17} className="wp-ico" /> Tendências ({trends.length})</span>
          <button className="wp-gz-add" onClick={() => setOpenForm(openForm === 'tendencia' ? null : 'tendencia')}>
            <Plus size={15} className="wp-ico" /> Nova tendência
          </button>
        </div>
        {openForm === 'tendencia' && <TrendForm brand={brandId} onDone={(t) => done(t, 'Tendência')} />}
        <div className="wp-gz-list">
          {trends.slice(0, 8).map((t, i) => (
            <div key={i} className="wp-gz-item">
              <span className="wp-gz-item-name">{t.title}</span>
              <span className="wp-gz-item-meta">{t.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
