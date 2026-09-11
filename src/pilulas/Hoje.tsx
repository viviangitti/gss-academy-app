import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Play, Send, Flame, CalendarDays, ChevronRight, Copy, Check, ShieldCheck, GraduationCap, Bell, Infinity as InfinityIcon, Sparkles, Trophy, X } from 'lucide-react';
import { allProducts, useStore } from './data/store';
import { buildShareMessage, visibleProducts, duracaoLabel, type Product } from './data/products';
import { getAfiliadoCode } from './data/afiliadoCode';
import { audienceOf } from './AuthContext';
import { CALENDAR, CHANNELS } from './data/creatorContent';
import { getStats } from './data/tracking';
import { getTrilha } from './data/trilha';
import { isAuto, isBalcao } from './data/brands';
import { vocab } from './data/vocabulario';
import { mandarMaterial } from './data/materialCliente';
import { auth } from '../services/firebase';
import { naoVistos } from './data/novidades';
import { campanhaPara, prazoLabel, diasRestantes } from './data/campanha';
import { getAbout } from './data/about';
import { watchedToday, notifState, enableNotif, maybeNotify } from './data/lembrete';
import { logSearch } from './data/insights';
import { useBrand } from './BrandContext';
import { useAuth } from './AuthContext';
import PrimeirosPassos from './PrimeirosPassos';
import { carregarCondicoes, useCondicoes } from './data/condicoes';
import { lembreteCampanha, mostrarPopupHoje, dispensarPopupHoje, quando, diaMes, frase } from './data/lembreteCampanha';

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
            ver {vocab(hit.product.brand).pilula} <ChevronRight size={14} className="wp-ico" />
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
      <span className="wp-td-hit-open">ver {vocab(hit.product.brand).pilula} <ChevronRight size={14} className="wp-ico" /></span>
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
  const campanha = campanhaPara(user?.role, brandId);
  const balcao = isBalcao(brandId); // farmácia: sem postar/enviar/venda
  const auto = isAuto(brandId);     // concessionária: sem postar; a língua muda
  const v = vocab(brandId);
  const novos = naoVistos(products);
  const didToday = watchedToday();
  const firstName = (user?.name || '').split(' ')[0] || 'Você';

  // A CAMPANHA DA CASA, lida das condições que a gerência publicou. A faixa fica
  // enquanto houver disputa aberta; o pop-up só na reta final, uma vez por dia,
  // e nunca pro gestor — ele publicou, não precisa ser lembrado.
  useCondicoes();
  useEffect(() => { if (auto) carregarCondicoes(brandId); }, [brandId, auto]);
  const lembrete = auto ? lembreteCampanha(brandId) : null;
  const [popup, setPopup] = useState(false);
  useEffect(() => {
    setPopup(user?.role !== 'gestor' && mostrarPopupHoje(lembrete));
  }, [lembrete?.condicao.id, lembrete?.disputa.ate, user?.role]); // eslint-disable-line react-hooks/exhaustive-deps
  const fecharPopup = () => { if (lembrete) dispensarPopupHoje(lembrete); setPopup(false); };

  // Pílula do dia: gira todo dia, determinística (mesmo produto o dia todo)
  const pill = products.length ? products[dayOfYear() % products.length] : undefined;

  // Post do dia: item do calendário pelo dia da semana
  const today = WEEKDAYS[new Date().getDay()];
  const post = CALENDAR.find((c) => c.day === today) || CALENDAR[0];
  const channel = CHANNELS.find((c) => c.id === post.channel);

  // MANDA O MESMO MATERIAL DA TELA DO CARRO.
  //
  // Este botão mandava só um texto de WhatsApp — sem PDF, sem foto, sem os
  // destaques e sem o contato do vendedor. Na tela do carro, o botão de mesmo
  // nome mandava o one-page completo. O cliente recebia material bom ou material
  // pobre conforme a tela em que o vendedor tocou, e ninguém tinha como saber:
  // o caminho da tela inicial nem registrava evento.
  //
  // A montagem virou um módulo só (data/materialCliente), e as duas telas
  // chamam de lá. No automotivo vai o one-page; na farmácia segue o texto, que
  // é o que faz sentido lá.
  const [mandando, setMandando] = useState(false);
  const [avisoEnvio, setAvisoEnvio] = useState('');
  const sharePill = async () => {
    if (!pill || mandando) return;
    const text = buildShareMessage(pill, { medium: audienceOf(user) ?? user?.role, code: getAfiliadoCode(user?.email) });
    if (!auto) {
      if (navigator.share) { navigator.share({ text, title: pill.name }).catch(() => {}); return; }
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      return;
    }
    setMandando(true);
    setAvisoEnvio('');
    try {
      const r = await mandarMaterial({
        product: pill, brandId, variante: 'cliente',
        vendedor: user?.name, uid: auth?.currentUser?.uid, texto: text,
      });
      if (r === 'baixou') setAvisoEnvio('PDF baixado: está na sua pasta de downloads.');
    } catch {
      setAvisoEnvio('Não consegui montar o material agora. Tente pela tela do carro.');
    } finally {
      setMandando(false);
    }
  };

  return (
    <div className="wp-today">
      {popup && lembrete && (
        <div className="wp-camppop-fundo" role="dialog" aria-modal="true" aria-label="Lembrete da campanha" onClick={fecharPopup}>
          <div className="wp-camppop" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="wp-camppop-x" onClick={fecharPopup} aria-label="Fechar"><X size={18} className="wp-ico" /></button>
            <span className="wp-camppop-ic"><Trophy size={28} className="wp-ico" /></span>
            <span className="wp-camppop-prazo">
              {lembrete.dias === 0 ? 'Último dia' : lembrete.dias === 1 ? 'Falta 1 dia' : `Faltam ${lembrete.dias} dias`}
            </span>
            <h3>{lembrete.disputa.nome}</h3>
            {lembrete.disputa.regra && <p>{frase(lembrete.disputa.regra)}</p>}
            <p>Fecha {quando(lembrete)}, {diaMes(lembrete.disputa.ate)}.</p>
            {lembrete.disputa.premio && (
              <div className="wp-camppop-premio">Prêmio<b>{lembrete.disputa.premio}</b></div>
            )}
            <Link to="/eleva/ofertas?grupo=campanha" className="wp-camppop-ok" onClick={fecharPopup}>Ver a campanha</Link>
            <button type="button" className="wp-camppop-nao" onClick={fecharPopup}>Agora não</button>
          </div>
        </div>
      )}
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
          placeholder={auto ? 'O que o cliente falou? Ex.: revenda, caro' : 'O que a cliente falou? Ex.: joelho, caro'}
          aria-label="Buscar resposta pronta"
        />
      </div>
      {q.trim().length >= 2 && (
        <div className="wp-td-hits">
          {hits.length ? hits.map((h, i) => <HitCard key={i} hit={h} />) : (
            <p className="wp-td-nohit">Nada encontrado. Tente outra palavra {auto ? '(ex.: "revenda", "garantia", "caro")' : '(ex.: "sono", "ferro", "caro")'}.</p>
          )}
        </div>
      )}

      {!q.trim() && (
        <>
          {/* A CAMPANHA DA CASA — a disputa que está valendo agora. Toca e cai
              direto nas campanhas, na aba Condições. */}
          {lembrete && (
            <Link to="/eleva/ofertas?grupo=campanha" className="wp-td-campfaixa">
              <span className="wp-td-campfaixa-ic"><Trophy size={20} className="wp-ico" /></span>
              <span className="wp-td-campfaixa-txt">
                <b>{lembrete.disputa.nome} {lembrete.dias === 0 ? 'termina hoje' : `termina ${quando(lembrete)}`}</b>
                <i>
                  {lembrete.disputa.regra ? frase(lembrete.disputa.regra) + ' ' : ''}
                  {lembrete.disputa.premio ? `Prêmio: ${lembrete.disputa.premio}.` : ''}
                </i>
              </span>
              <span className="wp-td-campfaixa-dias">
                {lembrete.dias === 0 ? <b>hoje</b> : <><b>{lembrete.dias}</b>{lembrete.dias === 1 ? 'dia' : 'dias'}</>}
              </span>
            </Link>
          )}

          {/* Lembrete diário — mantém a ofensiva viva */}
          <div className="wp-td-lembrete">
            <span className="wp-td-lb-flame"><Flame size={18} className="wp-ico" /> {stats.streak}</span>
            <div className="wp-td-lb-txt">
              <b>{didToday ? 'Dia garantido!' : 'Mantenha sua sequência'}</b>
              <span>{didToday ? 'Volte amanhã para somar mais um dia.' : `Assista a um ${v.pilula} hoje para manter a sequência.`}</span>
            </div>
            {notif !== 'granted' && notif !== 'unsupported' && (
              <button className="wp-td-lb-bell" onClick={ligarLembrete}>
                <Bell size={14} className="wp-ico" /> Lembrar
              </button>
            )}
            {notif === 'granted' && <span className="wp-td-lb-on"><Check size={14} className="wp-ico" /> Ativo</span>}
          </div>

          {/* Novidade = o que ESTA pessoa ainda não abriu. Some sozinho quando
              ela assiste, e reaparece quando o gestor publica conteúdo novo —
              sem ninguém ter que marcar nada. */}
          {novos.length > 0 && (
            <Link to="/eleva/catalogo" className="wp-td-novos">
              <Sparkles size={16} className="wp-ico" />
              <span>
                <b>{novos.length === 1 ? `1 ${v.item} novo pra você` : `${novos.length} ${v.itens} novos pra você`}</b>
                <i>{novos.slice(0, 3).map((p) => p.name).join(' · ')}{novos.length > 3 ? '…' : ''}</i>
              </span>
              <ChevronRight size={16} className="wp-ico" />
            </Link>
          )}

          {/* O ranking não tem aba no automotivo (a barra já tem cinco), e ficava
              inalcançável — existia e ninguém chegava nele. Este cartão é a
              porta: mostra o essencial (pontos e ofensiva) e leva pra tela. */}
          {!balcao && (
            <Link to="/eleva/ranking" className="wp-td-rank">
              <Trophy size={16} className="wp-ico" />
              <span>
                <b>Seu lugar no ranking</b>
                <i>{stats.weekPoints} pontos no mês · {stats.streak} {stats.streak === 1 ? 'dia seguido' : 'dias seguidos'}</i>
              </span>
              <ChevronRight size={16} className="wp-ico" />
            </Link>
          )}

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
              <span className="wp-td-card-label"><Play size={13} className="wp-ico" /> {auto ? 'Seu vídeo de hoje' : 'Sua pílula de hoje'} · {duracaoLabel(pill)}</span>
              <div
                className="wp-td-pill"
                data-produto={pill.id}
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
                  <button className="wp-td-btn" onClick={sharePill} disabled={mandando}>
                    <Send size={15} className="wp-ico" />
                    {mandando ? 'Preparando…' : (auto ? 'Enviar ao cliente' : 'Enviar à cliente')}
                  </button>
                )}
              </div>
              {avisoEnvio && <p className="wp-td-aviso">{avisoEnvio}</p>}
            </div>
          )}

          {/* O que postar hoje — não aparece no balcão nem na concessionária:
              nos dois quem posta pela marca é outra área, não quem atende. */}
          {!balcao && !auto && (
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
            Ver todos os {v.itens} <ChevronRight size={14} className="wp-ico" />
          </Link>
        </>
      )}
    </div>
  );
}
