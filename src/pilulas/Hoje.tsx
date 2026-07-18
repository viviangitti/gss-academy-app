import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Play, Send, Flame, CalendarDays, ChevronRight, Copy, Check, ShieldCheck, GraduationCap, Bell, Receipt, Infinity as InfinityIcon, Sparkles } from 'lucide-react';
import { allProducts, useStore } from './data/store';
import { buildShareMessage, visibleProducts, type Product } from './data/products';
import { getAfiliadoCode } from './data/afiliadoCode';
import { audienceOf } from './AuthContext';
import { CALENDAR, CHANNELS } from './data/creatorContent';
import { getStats } from './data/tracking';
import { getTrilha } from './data/trilha';
import { isBalcao } from './data/brands';
import { campanhaPara, prazoLabel, diasRestantes } from './data/campanha';
import { getAbout } from './data/about';
import { watchedToday, notifState, enableNotif, maybeNotify } from './data/lembrete';
import { logSearch } from './data/insights';
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

// Busca AMPLA: não exige todas as palavras — rankeia por quantas batem. Assim
// "perdendo massa magra" acha o GLPEN pelas palavras "massa/magra", ignorando
// conectores. Radical simples: "achou"≈"achei", plural etc.
const STOP = new Set([
  'que', 'com', 'sem', 'por', 'pra', 'para', 'uma', 'uns', 'umas', 'meu', 'minha', 'meus', 'minhas',
  'dos', 'das', 'nos', 'nas', 'ele', 'ela', 'eles', 'elas', 'tem', 'ter', 'foi', 'vai', 'sua', 'seu',
  'isso', 'esse', 'essa', 'este', 'esta', 'aqui', 'ali', 'mais', 'muito', 'muita', 'ser', 'estou',
  'nao', 'sim', 'the', 'and', 'voce', 'cliente', 'pessoa', 'sobre',
]);
function stem(w: string): string {
  return w.length > 4 ? w.replace(/(ou|ei|ar|er|ir|as|es|is|os|s)$/, '') : w;
}
function hasWord(blob: string, w: string): boolean {
  return blob.includes(w) || (w.length > 3 && blob.includes(stem(w)));
}
function score(blob: string, words: string[]): number {
  let n = 0;
  for (const w of words) if (hasWord(blob, w)) n++;
  return n;
}

interface ScoredHit extends Hit { score: number; }

function searchPills(query: string, products: Product[]): Hit[] {
  const q = norm(query.trim());
  if (q.length < 2) return [];
  // palavras significativas: 3+ letras e fora da lista de conectores
  const words = q.split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w));
  if (!words.length) return [];
  const hits: ScoredHit[] = [];
  for (const p of products) {
    // objeções — o "me salva" de verdade (resposta pronta na tela)
    for (const o of p.objections) {
      const s = score(norm(o.trigger + ' ' + o.answer), words);
      if (s > 0) hits.push({ product: p, kind: 'objecao', trigger: o.trigger, answer: o.answer, score: s });
    }
    // o produto em si (nome, dor, benefício, pra quem é)
    const blob = norm([p.name, p.tagline, p.hook, p.whatItIs, p.forWho, p.howToUse, ...p.benefits].join(' '));
    // Se o NOME do produto bate, o card de benefícios vem forte na frente —
    // é o caso "digitei o nome do produto, quero ver os benefícios".
    const nameMatch = score(norm(p.name), words);
    const s = score(blob, words) + nameMatch * 5;
    if (s > 0) hits.push({ product: p, kind: 'produto', score: s });
  }
  // Mais palavras batidas primeiro; no empate, resposta pronta (objeção) na frente.
  const seen = new Set<string>();
  return hits
    .sort((a, b) => (b.score - a.score) || ((a.kind === 'objecao' ? 0 : 1) - (b.kind === 'objecao' ? 0 : 1)))
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
      <span className="wp-td-hit-tag"><Play size={12} className="wp-ico" /> {hit.product.name} · benefícios</span>
      <ul className="wp-td-hit-bens">
        {hit.product.benefits.slice(0, 4).map((b, i) => (
          <li key={i}><Check size={13} className="wp-ico" /> {b}</li>
        ))}
      </ul>
      <span className="wp-td-hit-open">ver pílula (30s) <ChevronRight size={14} className="wp-ico" /></span>
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
  const { brandId, brand } = useBrand();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [notif, setNotif] = useState(notifState());

  // Afiliado só vê a linha GLPEN (pílula do dia e busca saem só dela).
  const products = useMemo(
    () => visibleProducts(allProducts().filter((p) => p.brand === brandId), user?.role),
    [brandId, user?.role]
  );
  const hits = useMemo(() => searchPills(q, products), [q, products]);

  // Trocou de marca? Limpa a busca — senão o texto da marca anterior fica no
  // campo e o próximo termo entra colado (ex.: "emagrecer" + "colesterol").
  useEffect(() => { setQ(''); }, [brandId]);

  // Inteligência de mercado: o que a ponta busca = as objeções reais do cliente.
  useEffect(() => {
    if (q.trim().length >= 3) logSearch(q, brandId);
  }, [q, brandId]);

  // Lembrete diário: se ligou notificação e não assistiu hoje, avisa (1x/dia).
  useEffect(() => { maybeNotify(); }, []);
  const ligarLembrete = async () => setNotif(await enableNotif());

  const stats = getStats();
  const trilha = getTrilha(brandId, user?.role);
  const campanha = campanhaPara(user?.role);
  const balcao = isBalcao(brandId); // farmácia: sem postar/enviar/venda
  const didToday = watchedToday();
  const firstName = (user?.name || '').split(' ')[0] || 'Você';

  // Pílula do dia: gira todo dia, determinística (mesmo produto o dia todo)
  const pill = products.length ? products[dayOfYear() % products.length] : undefined;

  // Post do dia: item do calendário pelo dia da semana
  const today = WEEKDAYS[new Date().getDay()];
  const post = CALENDAR.find((c) => c.day === today) || CALENDAR[0];
  const channel = CHANNELS.find((c) => c.id === post.channel);

  const sharePill = () => {
    if (!pill) return;
    const text = buildShareMessage(pill, { medium: audienceOf(user) ?? user?.role, code: getAfiliadoCode(user?.email) });
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
          placeholder="O que a cliente falou? Ex.: joelho, caro"
          aria-label="Buscar resposta pronta"
        />
      </div>
      {/* Assistente de balcão (IA) — atalho pra tirar dúvida em linguagem natural */}
      {balcao && !q.trim() && (
        <Link to="/eleva/assistente" className="wp-td-ia">
          <span className="wp-td-ia-ic"><Sparkles size={18} className="wp-ico" /></span>
          <span className="wp-td-ia-txt">
            <b>Tira-dúvida do balcão</b>
            <small>Pergunte à IA sobre os produtos — resposta rápida e certa</small>
          </span>
          <ChevronRight size={18} className="wp-ico wp-td-ia-chev" />
        </Link>
      )}
      {q.trim().length >= 2 && (
        <div className="wp-td-hits">
          {hits.length ? hits.map((h, i) => <HitCard key={i} hit={h} />) : (
            <p className="wp-td-nohit">Nada encontrado. Tente outra palavra (ex.: "sono", "ferro", "caro").</p>
          )}
        </div>
      )}

      {!q.trim() && (
        <>
          {/* Lembrete diário — mantém a ofensiva viva */}
          <div className="wp-td-lembrete">
            <span className="wp-td-lb-flame"><Flame size={18} className="wp-ico" /> {stats.streak}</span>
            <div className="wp-td-lb-txt">
              <b>{didToday ? 'Dia garantido!' : 'Mantenha sua sequência'}</b>
              <span>{didToday ? 'Volte amanhã para somar mais um dia.' : 'Assista a uma pílula hoje para manter a sequência.'}</span>
            </div>
            {notif !== 'granted' && notif !== 'unsupported' && (
              <button className="wp-td-lb-bell" onClick={ligarLembrete}>
                <Bell size={14} className="wp-ico" /> Lembrar
              </button>
            )}
            {notif === 'granted' && <span className="wp-td-lb-on"><Check size={14} className="wp-ico" /> Ativo</span>}
          </div>

          <PrimeirosPassos />

          {/* Trilha de formação — progresso + continuar */}
          {trilha.total > 0 && (
            <Link to="/eleva/trilha" className={`wp-td-card wp-td-trilha ${campanha && !trilha.complete ? 'wp-td-camp' : ''}`}>
              <span className="wp-td-card-label">
                <GraduationCap size={13} className="wp-ico" />
                {campanha ? campanha.nome : 'Sua trilha de formação'}
                {/* Prazo é o que tira a trilha do "faço qualquer dia" */}
                {campanha && !trilha.complete && (
                  <b className={`wp-td-prazo ${diasRestantes(campanha.ate) <= 3 ? 'urg' : ''}`}>
                    {prazoLabel(campanha)}
                  </b>
                )}
              </span>
              <div className="wp-td-trilha-row">
                <div className="wp-td-trilha-bar"><span style={{ width: `${trilha.pct}%`, background: brand.accent }} /></div>
                <b className="wp-td-trilha-num">{trilha.mastered}/{trilha.total}</b>
              </div>
              <span className="wp-td-trilha-cta">
                {trilha.complete
                  ? 'Trilha completa — pegue seu certificado'
                  : `Continuar: ${trilha.next?.name ?? ''}`}
                <ChevronRight size={14} className="wp-ico" />
              </span>
            </Link>
          )}

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
                {!balcao && (
                  <button className="wp-td-btn" onClick={sharePill}>
                    <Send size={15} className="wp-ico" /> Enviar à cliente
                  </button>
                )}
              </div>
            </div>
          )}

          {/* O que postar hoje — não aparece no balcão (não posta) */}
          {!balcao && (
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
          )}

          {/* Registrar venda — não no balcão (foco é preparar, não reportar). */}
          {!balcao && user?.role !== 'afiliado' && (
            <Link to="/eleva/venda" className="wp-td-venda">
              <Receipt size={17} className="wp-ico" />
              <span>Registrar uma venda<i>Vendeu no balcão? Conta pra gente — é assim que a Meraki vê o seu resultado</i></span>
              <ChevronRight size={16} className="wp-ico" />
            </Link>
          )}

          {/* Quem é a marca — contexto institucional pra vender com segurança */}
          {getAbout(brandId) && (
            <Link to="/eleva/sobre" className="wp-td-card wp-td-sobre">
              <span className="wp-td-card-label"><InfinityIcon size={13} className="wp-ico" /> Sobre a {brand.name}</span>
              <b className="wp-td-sobre-tit">Quem é a {brand.name}?</b>
              <span className="wp-td-sobre-sub">
                Propósito, valores e por que indicar. <ChevronRight size={14} className="wp-ico" />
              </span>
            </Link>
          )}

          <Link to="/eleva/catalogo" className="wp-td-all">
            Ver todos os produtos <ChevronRight size={14} className="wp-ico" />
          </Link>
        </>
      )}
    </div>
  );
}
