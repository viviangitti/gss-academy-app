import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, Plus, UploadCloud, Check, ExternalLink, Users, Eye, Send, TrendingUp, CalendarDays, Flame, Video, Search, ChevronRight, ChevronDown, Receipt, Clock, X, Copy, Bell } from 'lucide-react';
import { useBrand } from './BrandContext';
import { CATEGORIES, type Category, type Product } from './data/products';
import type { OfferKind } from './data/offers';
import { CHANNELS, type Channel } from './data/creatorContent';
import { SEGMENTS, segmentLabel } from './data/segments';
import { topSearches } from './data/insights';
import { fetchTeam, buildReport, type TeamReport, type TeamPerson } from './data/teamStats';
import { CAMPANHA, prazoLabel } from './data/campanha';
import { fetchVendas, decidirVenda, rankVendedores, type Venda as VendaT } from './data/vendas';
import { allProducts, allOffers, allCalendar, allTrends, addProduct, addOffer, addCalendar, addTrend, hasVideo, setProductVideo, clearProductVideo, useStore } from './data/store';
import { audienceVideoKey, getAudienceReel, setAudienceReel, useAudienceReels, audiencesForLine } from './data/audienceVideos';
import type { Audience } from './AuthContext';


// ---------- Resultados: dado REAL do time (elevaStats) ----------
const ROLE_LB: Record<string, string> = {
  balconista: 'Balconistas', promotor: 'Promotores', afiliado: 'Afiliados', gestor: 'Gestores',
};
// Singular certo por papel — antes o código tirava só o último "s" do plural, o
// que gerava "Gestore" (de Gestores) e "Promotore" (de Promotores).
const ROLE_LB1: Record<string, string> = {
  balconista: 'Balconista', promotor: 'Promotor', afiliado: 'Afiliado', gestor: 'Gestor',
};

function Resultados({ brandId, products, buscas }: { brandId: string; products: Product[]; buscas: { term: string; count: number }[] }) {
  const [rep, setRep] = useState<TeamReport | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    const allowed = new Set(products.map((p) => p.id));
    fetchTeam(brandId)
      .then((people) => { if (vivo) { setRep(buildReport(people, allowed)); setErro(''); } })
      .catch(() => { if (vivo) setErro('Não consegui ler os dados do time.'); })
      .finally(() => { if (vivo) setCarregando(false); });
    return () => { vivo = false; };
    // products é determinado por brandId (catálogo da marca) — refetch só na troca de marca.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  if (carregando) return <div className="wp-gz-metrics"><p className="wp-gz-help" style={{ margin: 0 }}>Carregando os dados do time…</p></div>;
  if (erro) return <div className="wp-gz-metrics"><p className="wp-gz-help" style={{ margin: 0 }}>{erro}</p></div>;
  if (!rep || !rep.people.length) {
    return (
      <div className="wp-gz-metrics">
        <div className="wp-gz-metrics-head"><TrendingUp size={16} className="wp-ico" /> Resultados</div>
        <p className="wp-gz-help" style={{ margin: 0 }}>
          Ainda não há uso registrado. Assim que o time começar a assistir as pílulas, os números aparecem aqui —
          de verdade, sem exemplo.
        </p>
      </div>
    );
  }

  const campanha = CAMPANHA;
  const mesAtual = rep.months[rep.months.length - 1];
  const mesAnterior = rep.months[rep.months.length - 2];
  const delta = mesAnterior && mesAnterior.views > 0
    ? Math.round(((mesAtual.views - mesAnterior.views) / mesAnterior.views) * 100)
    : null;
  const maxMes = Math.max(1, ...rep.months.map((b) => b.views));
  const nome = (id: string) => products.find((p) => p.id === id)?.name || id;
  const topMax = Math.max(1, ...rep.topProducts.map((t) => t.views));
  const ativos = rep.byRole.reduce((n, r) => n + r.ativos, 0);

  return (
    <div className="wp-gz-metrics">
      <div className="wp-gz-metrics-head">
        <TrendingUp size={16} className="wp-ico" /> Resultados <span className="wp-gz-demo">· dado real</span>
      </div>

      <div className="wp-gz-kpis">
        <div className="wp-gz-kpi">
          <Users size={15} className="wp-ico" />
          <b>{ativos}</b><span>ativos no mês</span>
        </div>
        <div className="wp-gz-kpi">
          <Eye size={15} className="wp-ico" />
          <b>{mesAtual.views}</b><span>pílulas assistidas</span>
        </div>
        <div className="wp-gz-kpi">
          <Send size={15} className="wp-ico" />
          <b>{mesAtual.posts}</b><span>posts do time</span>
        </div>
      </div>

      {/* Mês a mês — sai dos eventos, que têm data */}
      <div className="wp-gz-top">
        <div className="wp-gz-top-head">
          <CalendarDays size={12} className="wp-ico" /> Mês a mês (pílulas assistidas)
          {delta !== null && (
            <span className={`wp-gz-delta ${delta >= 0 ? 'up' : 'down'}`}>
              {delta >= 0 ? '+' : ''}{delta}% vs {mesAnterior.label}
            </span>
          )}
        </div>
        {rep.months.map((b) => (
          <div key={b.id} className="wp-gz-bar-row">
            <span className="wp-gz-bar-name">{b.label}</span>
            <span className="wp-gz-bar-track">
              <span className="wp-gz-bar-fill" style={{ width: `${Math.round((b.views / maxMes) * 100)}%` }} />
            </span>
            <span className="wp-gz-bar-val">{b.views}</span>
          </div>
        ))}
      </div>

      {/* Por papel */}
      <div className="wp-gz-top">
        <div className="wp-gz-top-head"><Users size={12} className="wp-ico" /> Quem está usando, por acesso</div>
        {rep.byRole.map((r) => (
          <div key={r.role} className="wp-gz-bar-row">
            <span className="wp-gz-bar-name">{ROLE_LB[r.role] || r.role}</span>
            <span className="wp-gz-bar-track">
              <span className="wp-gz-bar-fill" style={{ width: `${Math.round((r.ativos / Math.max(1, r.total)) * 100)}%` }} />
            </span>
            <span className="wp-gz-bar-val">{r.ativos}/{r.total}</span>
          </div>
        ))}
      </div>

      {/* Ranking real */}
      {rep.ranking.length > 0 && (
        <div className="wp-gz-top">
          <div className="wp-gz-top-head"><Flame size={12} className="wp-ico" /> Quem mais se dedica no mês</div>
          {rep.ranking.map((r, i) => (
            <div key={r.name + i} className="wp-gz-rk">
              <span className="wp-gz-rk-pos">{i + 1}</span>
              <span className="wp-gz-rk-name">{r.name}<i>{ROLE_LB1[r.role] || r.role}</i></span>
              <span className="wp-gz-rk-val">{r.points} pts<i>{r.views} pílulas · {r.quiz} dominados</i></span>
            </div>
          ))}
        </div>
      )}

      {/* Produtos realmente assistidos */}
      {rep.topProducts.length > 0 && (
        <div className="wp-gz-top">
          <div className="wp-gz-top-head"><Eye size={12} className="wp-ico" /> Produtos mais assistidos</div>
          {rep.topProducts.map((t) => (
            <div key={t.id} className="wp-gz-bar-row">
              <span className="wp-gz-bar-name">{nome(t.id)}</span>
              <span className="wp-gz-bar-track">
                <span className="wp-gz-bar-fill" style={{ width: `${Math.round((t.views / topMax) * 100)}%` }} />
              </span>
              <span className="wp-gz-bar-val">{t.views}</span>
            </div>
          ))}
        </div>
      )}

      {/* O dado mais acionável — e agora com o botão pra agir */}
      {rep.semUso.length > 0 && (
        <div className="wp-gz-top">
          <div className="wp-gz-top-head">
            <Bell size={12} className="wp-ico" /> Cadastrou e nunca assistiu ({rep.semUso.length})
          </div>
          <p className="wp-gz-help" style={{ margin: '0 0 8px' }}>
            Toque em “Cobrar” pra copiar uma mensagem pronta e mandar no WhatsApp.
          </p>
          {rep.semUso.map((p) => (
            <CobrarPessoa key={p.uid} p={p} campanhaNome={campanha?.nome} prazo={campanha ? prazoLabel(campanha) : undefined} />
          ))}
        </div>
      )}

      <div className="wp-gz-top">
        <div className="wp-gz-top-head"><Search size={12} className="wp-ico" /> O que a ponta busca no “me salva” (objeções reais)</div>
        {buscas.length ? buscas.map((b) => (
          <div key={b.term} className="wp-gz-bar-row">
            <span className="wp-gz-bar-name">“{b.term}”</span>
            <span className="wp-gz-bar-track">
              <span className="wp-gz-bar-fill" style={{ width: `${Math.min(100, (b.count / (buscas[0]?.count || 1)) * 100)}%` }} />
            </span>
            <span className="wp-gz-bar-val">{b.count}</span>
          </div>
        )) : (
          <p className="wp-gz-help" style={{ margin: 0 }}>Ainda sem buscas registradas neste aparelho.</p>
        )}
      </div>
    </div>
  );
}



// ---------- Cobrança de um toque ----------
// O painel já dizia "3 pessoas nunca assistiram". Dado sem ação vira relatório.
// Aqui vira gestão: um toque copia a mensagem pronta pra chamar a pessoa.
function CobrarPessoa({ p, campanhaNome, prazo }: { p: TeamPerson; campanhaNome?: string; prazo?: string }) {
  const [copiado, setCopiado] = useState(false);
  const primeiro = (p.name || '').split(' ')[0] || 'Oi';
  // Aspas no nome da campanha de propósito: sem artigo, funciona pra qualquer
  // nome ("Lançamento GLPEN" é masculino, "Campanha X" é feminino).
  const msg = campanhaNome
    ? `Oi, ${primeiro}! Tudo bem? Vi que você ainda não começou a formação “${campanhaNome}” no Eleva — ${prazo}. São só 3 pílulas de 30 segundos e você já sai com o certificado. Qualquer dúvida me chama!`
    : `Oi, ${primeiro}! Tudo bem? Vi que você ainda não assistiu nenhuma pílula no Eleva. São vídeos de 30 segundos que ajudam muito na hora de vender. Dá uma olhada quando puder — qualquer dúvida me chama!`;
  const copiar = () => {
    navigator.clipboard?.writeText(msg).then(
      () => { setCopiado(true); setTimeout(() => setCopiado(false), 1800); },
      () => {}
    );
  };
  return (
    <div className="wp-gz-cob">
      <span className="wp-gz-cob-info">
        <b>{p.name}</b>
        <i>{ROLE_LB1[p.role] || p.role}{p.email ? ` · ${p.email}` : ''}</i>
      </span>
      <button className="wp-gz-cob-btn" onClick={copiar} title="Copiar mensagem pronta">
        {copiado ? <><Check size={13} className="wp-ico" /> Copiada</> : <><Copy size={13} className="wp-ico" /> Cobrar</>}
      </button>
    </div>
  );
}

// ---------- Vendas declaradas: a única janela pra venda de BALCÃO ----------
function Vendas({ brandId }: { brandId: string }) {
  const [vendas, setVendas] = useState<VendaT[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = () => {
    setCarregando(true);
    fetchVendas(brandId)
      .then((v) => { setVendas(v); setErro(''); })
      .catch(() => setErro('Não consegui ler as vendas.'))
      .finally(() => setCarregando(false));
  };
  useEffect(carregar, [brandId]);

  const decidir = async (id: string, st: 'aprovada' | 'recusada') => {
    setVendas((vs) => vs.map((v) => (v.id === id ? { ...v, status: st } : v))); // otimista
    try { await decidirVenda(id, st); } catch { carregar(); }
  };

  if (carregando) return <div className="wp-gz-metrics"><p className="wp-gz-help" style={{ margin: 0 }}>Carregando as vendas…</p></div>;
  if (erro) return <div className="wp-gz-metrics"><p className="wp-gz-help" style={{ margin: 0 }}>{erro}</p></div>;

  const pendentes = vendas.filter((v) => v.status === 'pendente');
  const rank = rankVendedores(vendas);
  const totalUn = vendas.filter((v) => v.status === 'aprovada').reduce((n, v) => n + v.qty, 0);

  return (
    <div className="wp-gz-metrics">
      <div className="wp-gz-metrics-head">
        <Receipt size={16} className="wp-ico" /> Vendas declaradas
        <span className="wp-gz-demo">· venda de balcão</span>
      </div>

      {!vendas.length ? (
        <p className="wp-gz-help" style={{ margin: 0 }}>
          Ninguém registrou venda ainda. Quando o time vender no balcão e declarar, aparece aqui pra você aprovar.
        </p>
      ) : (
        <>
          <div className="wp-gz-kpis">
            <div className="wp-gz-kpi"><Clock size={15} className="wp-ico" /><b>{pendentes.length}</b><span>a aprovar</span></div>
            <div className="wp-gz-kpi"><Check size={15} className="wp-ico" /><b>{totalUn}</b><span>unidades vendidas</span></div>
            <div className="wp-gz-kpi"><Users size={15} className="wp-ico" /><b>{rank.length}</b><span>vendendo</span></div>
          </div>

          {pendentes.length > 0 && (
            <div className="wp-gz-top">
              <div className="wp-gz-top-head"><Clock size={12} className="wp-ico" /> Aguardando sua aprovação</div>
              {pendentes.map((v) => (
                <div key={v.id} className="wp-gz-vd">
                  <span className="wp-gz-vd-info">
                    <b>{v.name}</b>
                    <i>{v.productName} · {v.qty} un. · cupom {v.cupom}</i>
                  </span>
                  <span className="wp-gz-vd-acts">
                    <button className="wp-gz-vd-no" onClick={() => decidir(v.id, 'recusada')} aria-label="Recusar"><X size={15} /></button>
                    <button className="wp-gz-vd-ok" onClick={() => decidir(v.id, 'aprovada')} aria-label="Aprovar"><Check size={15} /></button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {rank.length > 0 && (
            <div className="wp-gz-top">
              <div className="wp-gz-top-head"><TrendingUp size={12} className="wp-ico" /> Quem mais vende (só aprovadas)</div>
              {rank.slice(0, 8).map((r, i) => (
                <div key={r.name + i} className="wp-gz-rk">
                  <span className="wp-gz-rk-pos">{i + 1}</span>
                  <span className="wp-gz-rk-name">{r.name}<i>{ROLE_LB1[r.role] || r.role}</i></span>
                  <span className="wp-gz-rk-val">{r.qty} un.<i>{r.vendas} venda{r.vendas > 1 ? 's' : ''}</i></span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
    const cta = salesLine.trim() || 'Me chama que eu te explico.';
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
      <input value={salesLine} onChange={(e) => setSalesLine(e.target.value)} placeholder="Me chama que eu te explico." />

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
  const [segment, setSegment] = useState('todos');

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
      share: share.trim() || `*${title.trim()}*\n\nMe chama para garantir.`,
      segment: segment === 'todos' ? undefined : segment,
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
      <textarea value={share} onChange={(e) => setShare(e.target.value)} rows={3} placeholder="Texto que a vendedora envia à cliente." />

      <label className="wp-gz-label">Pra qual canal?</label>
      <select value={segment} onChange={(e) => setSegment(e.target.value)}>
        <option value="todos">Todos os canais</option>
        {SEGMENTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>

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
      <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex.: Rotina com o produto" />
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
      <input value={dica} onChange={(e) => setDica(e.target.value)} placeholder="A dica que faz a diferença." />
      <button className="wp-gz-submit" disabled={!valid} onClick={submit}><Check size={16} className="wp-ico" /> Publicar tendência</button>
    </div>
  );
}

// ---------- Vídeos por público: a função PRINCIPAL do gestor ----------
// Antes isso vivia só dentro da pílula, a 6 toques de distância — o gestor caía
// no Painel e a principal tarefa dele não estava aqui. Agora está: lista os
// produtos, mostra quanto falta e deixa preencher sem sair da tela.

function AudienceSlot({ productId, audience, label }: { productId: string; audience: Audience; label: string }) {
  useAudienceReels();
  const key = audienceVideoKey(productId, audience);
  const reel = getAudienceReel(productId, audience);
  const mp4 = hasVideo(key);
  const [ig, setIg] = useState(reel || '');
  const [saved, setSaved] = useState(false);
  const salvar = () => {
    clearProductVideo(key);
    setAudienceReel(productId, audience, ig);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };
  const subirMp4 = (f: File) => { setAudienceReel(productId, audience, ''); setIg(''); setProductVideo(key, f); };
  const tirar = () => { clearProductVideo(key); setAudienceReel(productId, audience, ''); setIg(''); };
  const ok = mp4 || !!reel;
  return (
    <div className="wp-gz-slot">
      <div className="wp-gz-slot-head">
        <span className={`wp-gz-slot-dot ${ok ? 'on' : ''}`}>{ok ? <Check size={11} /> : null}</span>
        <b>{label}</b>
        <span className="wp-gz-slot-st">{mp4 ? 'vídeo MP4' : reel ? 'reel do Instagram' : 'falta'}</span>
      </div>
      <div className="wp-gz-slot-body">
        <input
          value={ig}
          onChange={(e) => setIg(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="Cole o link do reel do Instagram"
        />
        <div className="wp-gz-slot-acts">
          <button className="wp-gz-slot-save" disabled={!ig.trim()} onClick={salvar}>
            {saved ? <><Check size={14} className="wp-ico" /> Salvo</> : 'Salvar'}
          </button>
          <label className="wp-gz-slot-mp4">
            <UploadCloud size={14} className="wp-ico" /> MP4
            <input type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) subirMp4(f); }} />
          </label>
          {ok && <button className="wp-gz-slot-clear" onClick={tirar}>Tirar</button>}
        </div>
      </div>
    </div>
  );
}

// Quantos públicos DESTE produto já têm vídeo (só os que o veem).
function countDone(p: Product): number {
  return audiencesForLine(p.line, p.brand).filter(
    (a) => hasVideo(audienceVideoKey(p.id, a.id)) || !!getAudienceReel(p.id, a.id)
  ).length;
}

function VideoProductRow({ p }: { p: Product }) {
  useAudienceReels();
  useStore();
  const [open, setOpen] = useState(false);
  const auds = audiencesForLine(p.line, p.brand);
  const done = countDone(p);
  return (
    <div className={`wp-gz-vp ${open ? 'open' : ''}`}>
      <button className="wp-gz-vp-head" onClick={() => setOpen((o) => !o)}>
        <span className="wp-gz-vp-name">{p.name}</span>
        <span className={`wp-gz-vp-count ${done === auds.length ? 'full' : ''}`}>{done}/{auds.length}</span>
        <ChevronDown size={16} className={`wp-ico wp-gz-vp-chev ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="wp-gz-vp-body">
          {auds.map((a) => (
            <AudienceSlot key={a.id} productId={p.id} audience={a.id} label={a.label} />
          ))}
        </div>
      )}
    </div>
  );
}

function videoTotals(products: Product[]) {
  const total = products.reduce((n, p) => n + audiencesForLine(p.line, p.brand).length, 0);
  const feitos = products.reduce((n, p) => n + countDone(p), 0);
  return { total, feitos };
}

function VideosPorPublico({ products }: { products: Product[] }) {
  useAudienceReels();
  useStore();
  const { total, feitos } = videoTotals(products);
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  return (
    <div className="wp-gz-block wp-gz-videos">
      <div className="wp-gz-block-head">
        <span className="wp-gz-block-title"><Video size={17} className="wp-ico" /> Vídeos por público</span>
        <span className={`wp-gz-vcount ${feitos === total ? 'full' : ''}`}>{feitos} de {total}</span>
      </div>
      <p className="wp-gz-help" style={{ marginTop: 0 }}>
        Cada público vê o vídeo dele. Quem não tiver o do público assiste o vídeo padrão do produto.
      </p>
      <div className="wp-gz-vbar"><span className="wp-gz-vbar-fill" style={{ width: `${pct}%` }} /></div>
      <div className="wp-gz-vlist">
        {products.map((p) => <VideoProductRow key={p.id} p={p} />)}
      </div>
    </div>
  );
}

function ProductRow({ p }: { p: Product }) {
  useStore();
  const uploaded = hasVideo(p.id);
  const meta = uploaded ? (
    <><Video size={12} className="wp-ico" /> vídeo MP4</>
  ) : p.instagramUrl ? (
    <><Video size={12} className="wp-ico" /> vídeo do Instagram</>
  ) : (
    CATEGORIES[p.category].label
  );
  // Abrir o produto = ir pra pílula, onde o gestor troca o vídeo direto na tela.
  return (
    <Link to={`/eleva/produto/${p.id}`} className="wp-gz-item wp-gz-item-btn">
      <span className="wp-gz-item-name">{p.name}</span>
      <span className="wp-gz-item-meta">{meta} <ChevronRight size={14} className="wp-ico" /></span>
    </Link>
  );
}

export default function Gestor() {
  useStore();
  const { brand, brandId } = useBrand();
  const [openForm, setOpenForm] = useState<'produto' | 'oferta' | 'calendario' | 'tendencia' | null>(null);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'resultados' | 'vendas' | 'conteudo'>('resultados');

  const products = allProducts().filter((p) => p.brand === brandId);
  const vids = videoTotals(products);
  const offers = allOffers().filter((o) => o.brand === brandId);
  const calendar = allCalendar(brandId);
  const trends = allTrends(brandId);
  const buscas = topSearches(5, brandId);

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
        <p className="wp-gz-hero-sub">Cadastre produtos, envie vídeos e crie ofertas. O que você publica aqui aparece na hora para o time.</p>
      </div>

      {toast && <div className="wp-gz-toast"><Check size={13} className="wp-ico" /> {toast} <Link to="/eleva/catalogo">ver no app <ExternalLink size={12} className="wp-ico" /></Link></div>}


      {/* Abas: o gestor tem dois trabalhos — ver resultado e colocar conteúdo. */}
      <div className="wp-gz-tabs">
        <button className={`wp-gz-tab ${tab === 'resultados' ? 'on' : ''}`} onClick={() => setTab('resultados')}>
          <TrendingUp size={15} className="wp-ico" /> Resultados
        </button>
        <button className={`wp-gz-tab ${tab === 'vendas' ? 'on' : ''}`} onClick={() => setTab('vendas')}>
          <Receipt size={15} className="wp-ico" /> Vendas
        </button>
        <button className={`wp-gz-tab ${tab === 'conteudo' ? 'on' : ''}`} onClick={() => setTab('conteudo')}>
          <Package size={15} className="wp-ico" /> Conteúdo
          {/* Contador de vídeos na aba — a tarefa principal não some por estar aqui dentro */}
          <span className={`wp-gz-tab-badge ${vids.feitos === vids.total ? 'full' : ''}`}>{vids.feitos}/{vids.total}</span>
        </button>
      </div>

      {tab === 'vendas' && <Vendas brandId={brandId} />}

      {tab === 'resultados' && <Resultados brandId={brandId} products={products} buscas={buscas} />}

      {tab === 'conteudo' && (<>
      {/* Vídeos por público vem PRIMEIRO — é a principal função do gestor */}
      <VideosPorPublico products={products} />

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
              <span className="wp-gz-item-meta">{o.segment ? `${o.tag} · ${segmentLabel(o.segment)}` : o.tag}</span>
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
      </>)}
    </div>
  );
}
