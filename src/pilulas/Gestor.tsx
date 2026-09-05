import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, Plus, UploadCloud, Check, ExternalLink, Users, Eye, Send, TrendingUp, CalendarDays, Flame, Video, Search, ChevronRight, ChevronDown, Copy, Bell, MessageCircle, Mail, FileText, Trash2, ClipboardList, GraduationCap, FolderOpen, EyeOff, Pencil, ChevronUp, X, RotateCcw, Undo2, CalendarClock } from 'lucide-react';
import { useBrand } from './BrandContext';
import { isAuto } from './data/brands';
import { cargoLabel, podeMexerEmAcessorios } from './data/cargos';
import { vocab } from './data/vocabulario';
import { useAuth } from './AuthContext';
import { CATEGORIES, CATEGORIAS_AUTO, CATEGORIAS_SAUDE, nivelVideoKey, type Category, type Product } from './data/products';
import type { OfferKind } from './data/offers';
import { CHANNELS, type Channel } from './data/creatorContent';
import { SEGMENTS, segmentLabel } from './data/segments';
import { topSearches } from './data/insights';
import { fetchTeam, buildReport, type TeamReport, type TeamPerson } from './data/teamStats';
import { CAMPANHA, prazoLabel } from './data/campanha';
import { allProducts, allOffers, allCalendar, allTrends, addProduct, addOffer, addCalendar, addTrend, hasVideo, setProductVideo, clearProductVideo, useStore } from './data/store';
import { DOCUMENTOS, PRATELEIRAS, type PrateleiraId } from './data/documentos';
import { enviarDocNuvem, carregarDocsNuvem, docsNuvemDaMarca, apagarDocNuvem, type DocNuvem } from './data/docsUpload';
import { carregarOcultos, ocultosDaMarca, alternarOculto, useDocsOcultos } from './data/docsOcultos';
import { atualizarCondicao, aposentarVarias, jaPublicada, abrirArquivo, type Condicao } from './data/condicoes';
import { lerCarta, pareceAcessorio, textoDeValidade, type PaginaCarta } from './data/cartaPdf';
import { acessoriosParaGestao, acessorioOculto, precoLabel, precoDe, ORIGENS, type Acessorio, type OrigemAcessorio } from './data/acessorios';
import { carregarAjustesAcessorios, salvarPreco, salvarEdicao, ocultarAcessorio, salvarOrdemAcessorios, edicaoDe, useAjustesAcessorios, salvarAcessorioNovo, apagarAcessorioNovo, idParaAcessorio, novosDaMarca } from './data/ajustesAcessorios';
import { publicarCondicao, apagarCondicao, prepararArquivo, carregarCondicoes, condicoesDaMarca, estaVencida, useCondicoes, vaiAteAVirada, type ArquivoPronto } from './data/condicoes';
import { audienceVideoKey, getAudienceReel, setAudienceReel, useAudienceReels, audiencesForLine } from './data/audienceVideos';
import { fetchObjections, objectionDate, responderObjecao, type TeamObjection } from './data/objections';
import { buscarArgumentos, destacarArgumento, apagarArgumento, palavrasQueSeRepetem, type Argumento } from './data/argumentos';
import { carregarDestaques, salvarDestaques, useDestaquesTime, type DestaqueItem } from './data/destaquesTime';
import { buscarLeads, type Lead } from './data/leads';
import type { BrandId } from './data/brands';
import type { Audience } from './AuthContext';


// ---------- Resultados: dado REAL do time (elevaStats) ----------
const ROLE_LB: Record<string, string> = {
  balconista: 'Balconistas', promotor: 'Promotores', afiliado: 'Afiliados', gestor: 'Gestores',
  // Cargos da concessionária — o agrupamento passa a vir por cargo quando ele
  // existe (ver buildReport).
  'vendedor-veiculos': 'Vendedores de veículos', 'vendedor-acessorios': 'Vendedores de acessórios',
  'gerente-veiculos': 'Gerentes de vendas', 'gerente-acessorios': 'Gerentes de acessórios',
  'lider-acessorios': 'Supervisores de acessórios', 'gerente-qualidade': 'Qualidade',
  'executivo-leads': 'Executivos de leads', 'gerente-leads': 'Gerentes de leads',
};
// Singular certo por papel — antes o código tirava só o último "s" do plural, o
// que gerava "Gestore" (de Gestores) e "Promotore" (de Promotores).
const ROLE_LB1: Record<string, string> = {
  balconista: 'Balconista', promotor: 'Promotor', afiliado: 'Afiliado', gestor: 'Gestor',
};

/**
 * O nome do GRUPO na barra (plural).
 *
 * Na concessionária os papéis do vertical farmácia são traduzidos ANTES de
 * consultar a tabela: lá não existe balconista nem "gestor" — existe vendedor
 * e gerente. Os cargos novos (vendedor-veiculos etc.) já chegam certos e
 * passam direto.
 */
function comoChamarGrupo(chave: string, auto: boolean): string {
  if (auto) {
    if (chave === 'balconista') return 'Vendedores';
    if (chave === 'gestor') return 'Gerentes';
  }
  return ROLE_LB[chave] || chave;
}

/**
 * Como chamar a pessoa no Painel.
 *
 * O cargo manda quando existe. Sem ele (registro antigo, de antes de o cargo
 * ser gravado), traduz o papel para a palavra da casa: numa concessionária não
 * existe balconista — existe vendedor.
 */
function comoChamar(role: string, cargo: string | undefined, auto: boolean): string {
  if (cargo) return cargoLabel(cargo) || cargo;
  if (!auto) return ROLE_LB1[role] || role;
  if (role === 'balconista') return 'Vendedor(a)';
  if (role === 'gestor') return 'Gerente';
  return ROLE_LB1[role] || role;
}

// Encurta um texto SEM cortar palavra pela metade: prefere terminar numa frase
// completa; se não der, na última palavra inteira.
function resumo(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max);
  const frase = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('! '), corte.lastIndexOf('? '));
  if (frase > max * 0.5) return corte.slice(0, frase + 1);
  const palavra = corte.lastIndexOf(' ');
  return (palavra > 0 ? corte.slice(0, palavra) : corte).trimEnd();
}

function Resultados({ brandId, products, buscas }: { brandId: string; products: Product[]; buscas: { term: string; count: number }[] }) {
  const v = vocab(brandId as BrandId);
  const auto = isAuto(brandId as BrandId);
  // Denominador: quantos itens têm nível pra destravar. Sem isso a barra
  // mediria contra o catálogo inteiro e ninguém chegaria a 100%.
  const niveis = { total: products.filter((p) => p.niveis?.length).length };
  const [rep, setRep] = useState<TeamReport | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    const allowed = new Set(products.map((p) => p.id));
    fetchTeam(brandId)
      .then((people) => { if (vivo) { setRep(buildReport(people, allowed)); setErro(''); } })
      .catch((e: unknown) => {
        if (!vivo) return;
        // Duas falhas MUITO diferentes davam a mesma frase. "Sem internet" a
        // pessoa resolve sozinha; "e-mail ainda não liberado" ela não tem como
        // adivinhar — e é o que acontece com todo gerente novo, porque ler o
        // time depende de uma lista publicada nas regras do Firestore, não do
        // cargo escolhido no cadastro.
        const negado = (e as { code?: string })?.code === 'permission-denied';
        setErro(negado
          ? 'Seu acesso ao Painel ainda não foi liberado. Avise a Vivian: falta soltar o seu e-mail para ler os dados do time. O resto do app funciona normalmente.'
          : 'Não consegui ler os dados do time. Confira a internet e tente de novo.');
      })
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
          Ainda não há uso registrado. Assim que o time começar a assistir os vídeos, os números aparecem aqui —
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
          <b>{mesAtual.views}</b><span>{v.pilulas} assistid{v.pilula === 'vídeo' ? 'os' : 'as'}</span>
        </div>
        <div className="wp-gz-kpi">
          <Send size={15} className="wp-ico" />
          <b>{mesAtual.posts}</b><span>posts do time</span>
        </div>
      </div>

      {/* Mês a mês — sai dos eventos, que têm data */}
      <div className="wp-gz-top">
        <div className="wp-gz-top-head">
          <CalendarDays size={12} className="wp-ico" /> Mês a mês ({v.pilulas} assistid{v.pilula === 'vídeo' ? 'os' : 'as'})
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
            <span className="wp-gz-bar-name">{comoChamarGrupo(r.role, auto)}</span>
            <span className="wp-gz-bar-track">
              <span className="wp-gz-bar-fill" style={{ width: `${Math.round((r.ativos / Math.max(1, r.total)) * 100)}%` }} />
            </span>
            <span className="wp-gz-bar-val">{r.ativos}/{r.total}</span>
          </div>
        ))}
      </div>

      {/* QUEM AINDA NÃO MONTOU O CARTÃO.
          O material que vai pro cliente sai com o contato do vendedor, e cada
          um preenche o seu — a gerência não digita isso por ninguém. O que a
          gerência precisa é saber quem ainda não fez, pra cobrar. */}
      {auto && rep.semCartao.length > 0 && (
        <div className="wp-gz-top">
          <div className="wp-gz-top-head">
            <Send size={12} className="wp-ico" /> Ainda sem contato no material do cliente
          </div>
          <p className="wp-gz-help" style={{ margin: '0 0 8px' }}>
            O material que essas pessoas mandam sai sem WhatsApp — o cliente encaminha pra
            família e ninguém sabe pra quem responder. Cada uma preenche o seu em Perfil.
          </p>
          {rep.semCartao.map((p) => (
            <div key={p.name} className="wp-gz-item">
              <span className="wp-gz-item-name">
                {p.name}<i className="wp-gz-cargo">{comoChamar(p.role, p.cargo, auto)}</i>
              </span>
              <span className="wp-gz-item-meta">falta preencher</span>
            </div>
          ))}
        </div>
      )}

      {/* EM QUE NÍVEL CADA PESSOA ESTÁ.
          Prometi isso quando propus os níveis e tinha ficado de fora: sem esta
          visão o gestor sabe quantos vídeos o time viu, mas não sabe quem já
          consegue enfrentar o concorrente e quem ainda trava no básico — que é
          a informação que muda o treino da semana. */}
      {niveis.total > 0 && rep.ranking.length > 0 && (
        <div className="wp-gz-top">
          <div className="wp-gz-top-head">
            <GraduationCap size={12} className="wp-ico" /> Em que nível cada um está
          </div>
          <p className="wp-gz-help" style={{ margin: '0 0 8px' }}>
            O nível 2 só abre depois do quiz do nível 1. Quem está em 1 ainda não domina o básico —
            é com esse que vale sentar.
          </p>
          {rep.ranking.map((r, i) => {
            const dominados = Math.min(r.quiz, niveis.total);
            const pct = Math.round((dominados / niveis.total) * 100);
            return (
              <div key={`n${r.name}${i}`} className="wp-gz-niv">
                <span className="wp-gz-niv-nome">
                  {r.name}<i className="wp-gz-cargo">{comoChamar(r.role, r.cargo, auto)}</i>
                </span>
                <span className="wp-gz-niv-barra"><i style={{ width: `${pct}%` }} /></span>
                <span className="wp-gz-niv-val">
                  {dominados}/{niveis.total}
                  <i>{dominados === 0 ? 'no básico' : dominados >= niveis.total ? 'tudo destravado' : 'avançando'}</i>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Ranking real */}
      {rep.ranking.length > 0 && (
        <div className="wp-gz-top">
          <div className="wp-gz-top-head"><Flame size={12} className="wp-ico" /> Quem mais se dedica no mês</div>
          {rep.ranking.map((r, i) => (
            <div key={r.name + i} className="wp-gz-rk">
              <span className="wp-gz-rk-pos">{i + 1}</span>
              <span className="wp-gz-rk-name">{r.name}<i>{comoChamar(r.role, r.cargo, auto)}</i></span>
              <span className="wp-gz-rk-val">{r.points} pts<i>{r.views} {v.pilulas} · {r.quiz} dominados</i></span>
            </div>
          ))}
        </div>
      )}

      {/* Produtos realmente assistidos */}
      {rep.topProducts.length > 0 && (
        <div className="wp-gz-top">
          <div className="wp-gz-top-head"><Eye size={12} className="wp-ico" /> {v.item === 'carro' ? 'Carros' : 'Produtos'} mais assistidos</div>
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
            <CobrarPessoa key={p.uid} p={p} campanhaNome={campanha?.nome} prazo={campanha ? prazoLabel(campanha) : undefined} auto={auto} />
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

// Uma objeção da ponta, com o campo de RESPOSTA do gestor.
//
// É aqui que o ciclo fecha. Antes o gestor lia a objeção e não tinha o que
// fazer com ela dentro do app: respondia no grupo do WhatsApp, e sumia. Agora
// ele escreve a resposta e publica — ela aparece dentro do produto, pra todo o
// time, e o próximo vendedor que ouvir a mesma frase já acha pronto.
function ObjecaoLinha({ o }: { o: TeamObjection }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState(o.resposta || '');
  const [salvando, setSalvando] = useState(false);
  const [publicada, setPublicada] = useState(!!o.publicada);

  const publicar = async () => {
    if (!texto.trim() || salvando) return;
    setSalvando(true);
    try {
      await responderObjecao(o.id, texto, true);
      setPublicada(true);
      setAberto(false);
    } catch { /* offline: o gestor tenta de novo */ }
    setSalvando(false);
  };

  const tirarDoAr = async () => {
    setSalvando(true);
    try {
      await responderObjecao(o.id, texto, false);
      setPublicada(false);
    } catch { /* ignore */ }
    setSalvando(false);
  };

  return (
    <div className="wp-gz-obj">
      <p className="wp-gz-obj-q">“{o.text}”</p>
      {o.answer && <p className="wp-gz-obj-a">Respondeu na hora: {o.answer}</p>}
      <span className="wp-gz-obj-meta">
        {objectionDate(o.at)} · {o.productName} · {o.byName}{o.byRole ? ` (${o.byRole})` : ''}
      </span>

      {publicada && !aberto && (
        <div className="wp-gz-obj-pub">
          <span className="wp-gz-obj-selo"><Check size={12} className="wp-ico" /> No app do time</span>
          <p>{texto}</p>
          <div className="wp-gz-obj-acoes">
            <button type="button" onClick={() => setAberto(true)}>Editar</button>
            <button type="button" onClick={tirarDoAr} disabled={salvando}>Tirar do ar</button>
          </div>
        </div>
      )}

      {!publicada && !aberto && (
        <button type="button" className="wp-gz-obj-responder" onClick={() => setAberto(true)}>
          <MessageCircle size={13} className="wp-ico" /> Responder e mandar pro time
        </button>
      )}

      {aberto && (
        <div className="wp-gz-obj-form">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            placeholder="A resposta que você quer que o time use quando ouvir isso."
          />
          <p className="wp-gz-help" style={{ margin: 0 }}>
            Ao publicar, esta resposta aparece dentro do produto para todo o time. Escreva do jeito
            que você quer ouvir no showroom.
          </p>
          <div className="wp-gz-obj-acoes">
            <button type="button" className="on" onClick={publicar} disabled={!texto.trim() || salvando}>
              {salvando ? 'Publicando…' : 'Publicar pro time'}
            </button>
            <button type="button" onClick={() => setAberto(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// AS RESPOSTAS DO FORMULÁRIO "argumentos matadores", agrupadas por carro.
//
// Aqui não é lista de recado: é onde a opinião vira evidência. As palavras que
// mais SE REPETEM aparecem em cima — se cinco de sete pessoas escreveram "teto
// solar", isso não é gosto de ninguém, é o que funciona no showroom. O gestor
// destaca as melhores e elas voltam pra dentro do carro.
function ArgumentosPanel({ brandId, products }: { brandId: string; products: Product[] }) {
  const [args, setArgs] = useState<Argumento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    buscarArgumentos(brandId as BrandId)
      .then((r) => { if (vivo) setArgs(r); })
      .finally(() => { if (vivo) setCarregando(false); });
    return () => { vivo = false; };
  }, [brandId]);

  useDestaquesTime();
  const [usados, setUsados] = useState<Record<string, DestaqueItem[]>>({});
  useEffect(() => {
    products.forEach((p) => {
      carregarDestaques(p.id).then((itens) => setUsados((u) => ({ ...u, [p.id]: itens }))).catch(() => {});
    });
  }, [products]);

  // Promove uma frase do time a destaque do carro. É o "um toque": a resposta
  // da rua vira o que o cliente lê, sem passar por código nem por mim.
  const usar = async (produtoId: string, frase: string) => {
    const atuais = usados[produtoId] || [];
    if (atuais.length >= 5) return;
    const novos = [...atuais, { titulo: frase.slice(0, 90) }];
    setUsados((u) => ({ ...u, [produtoId]: novos }));
    try { await salvarDestaques(produtoId, novos); } catch { /* offline */ }
  };

  const tirar = async (produtoId: string, i: number) => {
    const novos = (usados[produtoId] || []).filter((_, k) => k !== i);
    setUsados((u) => ({ ...u, [produtoId]: novos }));
    try { await salvarDestaques(produtoId, novos); } catch { /* offline */ }
  };

  const alternar = async (a: Argumento) => {
    const novo = !a.destacado;
    setArgs((lista) => lista.map((x) => (x.id === a.id ? { ...x, destacado: novo } : x)));
    try { await destacarArgumento(a.id, novo); } catch { /* offline: tenta de novo depois */ }
  };

  if (carregando) return null;

  const comResposta = products.filter((p) => args.some((a) => a.productId === p.id));

  return (
    <div className="wp-gz-top">
      <div className="wp-gz-top-head">
        <MessageCircle size={12} className="wp-ico" /> Argumentos “matadores” — o que o time respondeu
        {args.length > 0 && <span className="wp-gz-obj-count">{args.length}</span>}
      </div>

      {!args.length && (
        <p className="wp-gz-help" style={{ margin: 0 }}>
          Ninguém respondeu ainda. Mande o link no grupo: <b>gsseleva.com.br/argumentos</b> — abre
          sem login, leva dois minutos e cai aqui.
        </p>
      )}

      {comResposta.map((p) => {
        const doCarro = args.filter((a) => a.productId === p.id);
        const repetidas = palavrasQueSeRepetem(doCarro);
        const abertoAqui = aberto === p.id;
        return (
          <div key={p.id} className="wp-gz-arg-carro">
            <button type="button" className="wp-gz-arg-head" onClick={() => setAberto(abertoAqui ? null : p.id)}>
              <b>{p.name}</b>
              <span>{doCarro.length} {doCarro.length === 1 ? 'resposta' : 'respostas'}</span>
              <ChevronDown size={15} className={`wp-ico ${abertoAqui ? 'wp-gz-arg-open' : ''}`} />
            </button>

            {repetidas.length > 0 && (
              <div className="wp-gz-arg-nuvem">
                {repetidas.map((r) => (
                  <span key={r.termo} className="wp-gz-arg-termo">
                    {r.termo} <i>{r.vezes}×</i>
                  </span>
                ))}
              </div>
            )}

            {abertoAqui && (
              <div className="wp-gz-destaq">
                <b>Destaques deste carro ({usados[p.id]?.length || 0}/5)</b>
                <p>
                  É o que aparece na tela do carro E no material que o vendedor manda pro cliente.
                  Toque em <i>usar</i> numa resposta abaixo pra incluir. Vazio = fica o texto de fábrica.
                </p>
                {(usados[p.id] || []).map((it, i) => (
                  <span key={i} className="wp-gz-destaq-item">
                    {it.titulo}
                    <button type="button" onClick={() => tirar(p.id, i)} aria-label="Tirar">
                      <X size={12} className="wp-ico" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {abertoAqui && doCarro.map((a) => (
              <div key={a.id} className={`wp-gz-arg ${a.destacado ? 'on' : ''}`}>
                <ol>
                  {a.pontos.map((pt, i) => (
                    <li key={i}>
                      {pt}
                      <button
                        type="button"
                        className="wp-gz-usar"
                        disabled={(usados[p.id]?.length || 0) >= 5 || (usados[p.id] || []).some((u) => u.titulo === pt.slice(0, 90))}
                        onClick={() => usar(p.id, pt)}
                      >
                        usar
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="wp-gz-arg-pe">
                  <span>{a.byName}{a.byRole ? ` · ${a.byRole}` : ''}</span>
                  <button
                    type="button"
                    className="wp-gz-del"
                    aria-label="Apagar esta resposta"
                    onClick={() => {
                      if (!confirm(`Apagar a resposta de ${a.byName}?`)) return;
                      apagarArgumento(a.id).then(() => setArgs((l) => l.filter((x) => x.id !== a.id)));
                    }}
                  >
                    <Trash2 size={13} className="wp-ico" />
                  </button>
                  <button type="button" onClick={() => alternar(a)}>
                    {a.destacado
                      ? <><Check size={12} className="wp-ico" /> no app do time</>
                      : 'Mandar pro time'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Objeções que a PONTA registrou na pílula (ponto de contato). Dado da nuvem.
function ObjectionsPanel({ brandId }: { brandId: string }) {
  const [objs, setObjs] = useState<TeamObjection[]>([]);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    fetchObjections(brandId as BrandId)
      .then((r) => { if (vivo) setObjs(r); })
      .finally(() => { if (vivo) setCarregando(false); });
    return () => { vivo = false; };
  }, [brandId]);
  if (carregando) return null;
  return (
    <div className="wp-gz-top">
      <div className="wp-gz-top-head">
        <MessageCircle size={12} className="wp-ico" /> Objeções da ponta — histórico
        {objs.length > 0 && <span className="wp-gz-obj-count">{objs.length}</span>}
      </div>
      {objs.length ? objs.map((o) => (
        <ObjecaoLinha key={o.id} o={o} />
      )) : (
        <p className="wp-gz-help" style={{ margin: 0 }}>Ninguém registrou objeção nova ainda. Quando o time registrar (“Recebeu uma objeção nova?”), aparece aqui.</p>
      )}
    </div>
  );
}



// ---------- Cobrança de um toque ----------
// O painel já dizia "3 pessoas nunca assistiram". Dado sem ação vira relatório.
// Aqui vira gestão: um toque copia a mensagem pronta pra chamar a pessoa.
function CobrarPessoa({ p, campanhaNome, prazo, auto }: { p: TeamPerson; campanhaNome?: string; prazo?: string; auto: boolean }) {
  const [copiado, setCopiado] = useState(false);
  const primeiro = (p.name || '').split(' ')[0] || 'Oi';
  // Aspas no nome da campanha de propósito: sem artigo, funciona pra qualquer
  // nome ("Lançamento GLPEN" é masculino, "Campanha X" é feminino).
  const msg = campanhaNome
    ? `Oi, ${primeiro}! Tudo bem? Vi que você ainda não começou a formação “${campanhaNome}” no Eleva — ${prazo}. São só 3 vídeos curtos e você já sai com o certificado. Qualquer dúvida me chama!`
    : `Oi, ${primeiro}! Tudo bem? Vi que você ainda não assistiu nenhum vídeo no Eleva. São vídeos curtos que ajudam muito na hora de vender. Dá uma olhada quando puder — qualquer dúvida me chama!`;
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
        <i>{comoChamar(p.role, p.cargo, auto)}{p.email ? ` · ${p.email}` : ''}</i>
      </span>
      <button className="wp-gz-cob-btn" onClick={copiar} title="Copiar mensagem pronta">
        {copiado ? <><Check size={13} className="wp-ico" /> Copiada</> : <><Copy size={13} className="wp-ico" /> Cobrar</>}
      </button>
    </div>
  );
}

const GRADIENT: Record<Category, [string, string]> = {
  performance: ['#12B5A5', '#0B5563'],
  capsulas: ['#6d5dfc', '#2a2356'],
  respiratorio: ['#0ea5e9', '#075985'],
  cosmeticos: ['#f7b733', '#d96d2b'],
  perfumaria: ['#ff5fa2', '#9b2c63'],
  jaecoo: ['#1e6fd9', '#0f3a75'],
  omoda: ['#5f6fd6', '#221f52'],
  acessorio: ['#64748b', '#27303f'],
};

function ProductForm({ brand, onDone }: { brand: BrandId; onDone: (name: string, naNuvem: boolean) => void }) {
  // A concessionária cadastra CARRO e ACESSÓRIO, não suplemento: rótulo,
  // exemplo e lista de categorias mudam junto. O formulário é o mesmo — o que
  // muda é a língua que ele fala.
  const auto = isAuto(brand);
  const v = vocab(brand);
  const cats = auto ? CATEGORIAS_AUTO : CATEGORIAS_SAUDE;
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(auto ? 'jaecoo' : 'performance');
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
    const cta = salesLine.trim()
      || (auto ? 'Quer dar uma volta com ele pra sentir?' : 'Me chama que eu te explico.');
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
      // Resumo curto: corta na última frase/palavra inteira, nunca no meio dela.
      tagline: resumo(whatItIs, 140),
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
    // Espera a nuvem responder antes de dizer que publicou. Antes a tela
    // sempre dizia "o time já vê" — mesmo quando o cadastro tinha ficado só
    // neste aparelho, que era o caso de todos.
    addProduct(product, video).then((naNuvem) => onDone(product.name, naNuvem));
  };

  return (
    <div className="wp-gz-form">
      <label className="wp-gz-label">Nome {auto ? 'do modelo ou acessório' : 'do produto'}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={auto ? 'Ex.: Omoda 5 ou Engate removível' : 'Ex.: GLPEN Nutri Muscle'} />

      <label className="wp-gz-label">Categoria</label>
      <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
        {cats.map((k) => (
          <option key={k} value={k}>{CATEGORIES[k].label}</option>
        ))}
      </select>

      <label className="wp-gz-label">Gancho {auto ? '(o que trava a venda)' : '(a dor/desejo da cliente)'}</label>
      <input value={hook} onChange={(e) => setHook(e.target.value)} placeholder={auto ? 'Ex.: O cliente gostou, mas trava em "e a revenda?"' : 'Ex.: Cabelo caindo e unha que não cresce?'} />

      <label className="wp-gz-label">O que é (1–2 frases)</label>
      <textarea value={whatItIs} onChange={(e) => setWhatItIs(e.target.value)} rows={3} placeholder={auto ? 'O essencial do modelo, sem ficha técnica.' : 'O essencial do produto, sem bula.'} />

      <label className="wp-gz-label">{auto ? 'Pontos fortes (um por linha)' : 'Benefícios (um por linha)'}</label>
      <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={3} placeholder={auto ? 'Pacote de série cheio para a faixa...\nRede de assistência no Brasil...' : 'Auxilia na...\nContribui para...'} />

      <label className="wp-gz-label">Frase de venda / CTA</label>
      <input value={salesLine} onChange={(e) => setSalesLine(e.target.value)} placeholder={auto ? 'Quer dar uma volta com ele pra sentir?' : 'Me chama que eu te explico.'} />

      <label className="wp-gz-label">Vídeo {auto ? '' : 'da pílula '}— escolha UMA opção</label>
      <label className="wp-gz-upload">
        <UploadCloud size={18} className="wp-ico" />
        {video ? video.name : `1) Subir um vídeo MP4 ${auto ? 'do modelo' : 'do produto'}`}
        <input type="file" accept="video/*" hidden onChange={(e) => setVideo(e.target.files?.[0] || null)} />
      </label>
      <p className="wp-gz-or">ou</p>
      <input value={igUrl} onChange={(e) => setIgUrl(e.target.value)} placeholder="2) Colar o link de um reel do Instagram" />
      <p className="wp-gz-help">Se colar o reel do Instagram, ele vira o vídeo que a pessoa assiste. Se subir um MP4, o reel (se houver) aparece como prova social.</p>

      <button className="wp-gz-submit" disabled={!valid} onClick={submit}>
        <Check size={16} className="wp-ico" /> Publicar {v.item}
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
  // Automotivo
  { value: 'taxa', label: 'Taxa / financiamento' },
  { value: 'bonus', label: 'Bônus de troca' },
  { value: 'estoque', label: 'Estoque / pronta entrega' },
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

// CONDIÇÃO COMERCIAL: o gestor SOBE a tabela, não redigita.
// Ele já recebe o print no grupo ou o PDF da campanha. Fazer ele traduzir
// aquilo em "% de desconto" custa tempo e erra número — e número errado no
// showroom vira promessa que a concessionária não cumpre.
function CondicaoForm({ brand, editando, onDone }: {
  brand: BrandId;
  /** Quando vem preenchido, o formulário CORRIGE em vez de publicar. */
  editando?: Condicao;
  onDone: (t: string) => void;
}) {
  const [titulo, setTitulo] = useState(editando?.titulo || '');
  const [validade, setValidade] = useState(editando?.validade || '');
  const [observacao, setObservacao] = useState(editando?.observacao || '');
  // O TEXTO QUE A IA LÊ desta folha.
  //
  // A folha é IMAGEM: o time olha e entende. A IA não enxerga imagem — ela lê
  // este resumo, escrito quando a carta foi publicada. Se ele saiu errado, o
  // Tira-dúvida responde errado com toda a confiança do mundo, e ninguém tinha
  // como descobrir: o campo não aparecia em lugar nenhum do app.
  const [resumoIA, setResumoIA] = useState(editando?.resumo || '');
  // A CHAMADA QUE PODE SER ANUNCIADA, e de qual carro é. Só isto vira arte pro
  // cliente — o miolo da folha (entrada, trade-in, rebate) não sai daqui.
  const [chamada, setChamada] = useState(editando?.chamada || '');
  const [produtoId, setProdutoId] = useState(editando?.produtoId || '');
  const carrosDaCasa = allProducts().filter((p) => p.brand === brand);
  const [categoria, setCategoria] = useState<'veiculo' | 'acessorio' | 'campanha'>(editando?.categoria || 'veiculo');
  const [venceEm, setVenceEm] = useState(editando?.venceEm || '');
  // O texto de validade nasce da data. Eram dois campos dizendo a mesma coisa,
  // e o gerente tinha que escrever à mão o que a carta já diz — some quando ele
  // decide escrever o dele.
  const [escreveuValidade, setEscreveuValidade] = useState(!!editando?.validade);
  // Enquanto ninguém escolher à mão, o app decide pelo título e pelo nome do
  // arquivo. A arte de kit chega como print, sem texto pra ler — mas o nome
  // ("kit-premium-sound.jpg") e o título que a pessoa digita dizem tudo.
  const [escolheuCategoria, setEscolheuCategoria] = useState(!!editando);
  const [arq, setArq] = useState<ArquivoPronto | null>(null);
  const [erro, setErro] = useState('');
  const [subindo, setSubindo] = useState(false);
  // Folha repetida: o app reconhece o arquivo e pergunta antes de duplicar.
  const [repetida, setRepetida] = useState<Condicao | null>(null);
  // "Substituir a carta do mês": aposenta o que já está nesta prateleira.
  const [substituir, setSubstituir] = useState(false);
  // A folha que já está no ar — quem corrige o título precisa VER o que tem
  // dentro. Sem isso é fechar, olhar, e abrir de novo.
  const [folhaAtual, setFolhaAtual] = useState('');
  // Carta de várias páginas: uma folha por página, com título já sugerido.
  const [paginas, setPaginas] = useState<PaginaCarta[] | null>(null);
  const [lendo, setLendo] = useState(false);
  const [feitas, setFeitas] = useState(0);

  useEffect(() => {
    if (!editando) return;
    let vivo = true;
    abrirArquivo(editando).then((u) => { if (vivo && u) setFolhaAtual(u); });
    return () => { vivo = false; };
  }, [editando]);

  const escolher = async (f: File | undefined) => {
    if (!f) return;
    setErro('');
    setPaginas(null);
    setArq(null);
    try {
      setLendo(true);
      // Antes de tudo: é uma carta comercial de várias páginas? Se for, ela
      // não vira UMA condição — vira uma por modelo, que é como o vendedor
      // procura.
      const pgs = await lerCarta(f, brand).catch(() => [] as PaginaCarta[]);
      if (pgs.length > 1) {
        setPaginas(pgs);
        // Reaproveitar o arquivo inteiro é o erro mais comum: subir de novo pra
        // "corrigir o título" e acabar com o dobro de cards.
        const repetidas = pgs.filter((pg) => jaPublicada(brand, pg.arquivo)).length;
        if (repetidas) setRepetida({ ...(jaPublicada(brand, pgs[0].arquivo) as Condicao), titulo: `${repetidas} de ${pgs.length} páginas já estão publicadas` });
        // A carta diz de quando até quando vale: a data E o texto entram
        // preenchidos, e a gerência só confere.
        if (!venceEm && pgs[0].venceEm) setVenceEm(pgs[0].venceEm);
        if (!escreveuValidade && pgs[0].validade) setValidade(pgs[0].validade);
        return;
      }
      const pronto = await prepararArquivo(f);
      setArq(pronto);
      setRepetida(jaPublicada(brand, pronto.arquivo, editando?.id) || null);
      if (!escolheuCategoria) setCategoria(pareceAcessorio(pronto.nomeArquivo, titulo) ? 'acessorio' : 'veiculo');
    } catch (e) {
      setArq(null);
      setErro(e instanceof Error ? e.message : 'Não consegui ler o arquivo.');
    } finally {
      setLendo(false);
    }
  };

  const mexer = (n: number, mud: Partial<PaginaCarta>) =>
    setPaginas((ps) => (ps || []).map((p) => (p.n === n ? { ...p, ...mud } : p)));

  const escolhidas = (paginas || []).filter((p) => p.incluir);

  /** Publica uma folha por página marcada, na ordem — a mais nova fica no topo. */
  const publicarCarta = async () => {
    if (!escolhidas.length) return;
    setSubindo(true);
    setErro('');
    setFeitas(0);
    try {
      // SUBSTITUIR: aposenta o que já está na prateleira ANTES de publicar o
      // novo. Antes era virar o mês em duas operações, e entre uma e outra o
      // time via a carta velha e a nova ao mesmo tempo.
      if (substituir) {
        const prateleiras = new Set(escolhidas.map((p) => p.categoria));
        const velhas = condicoesDaMarca(brand)
          .filter((c) => prateleiras.has((c.categoria || 'veiculo') as typeof escolhidas[number]['categoria']))
          .map((c) => c.id);
        if (velhas.length) await aposentarVarias(velhas);
      }
      for (const p of [...escolhidas].reverse()) {
        await publicarCondicao({
          brand,
          titulo: p.titulo.trim(),
          validade: validade.trim() || 'confirmar validade com a gerência',
          observacao: observacao.trim() || undefined,
          categoria: p.categoria,
          venceEm: venceEm || undefined,
          resumo: p.resumo,
          arquivo: p.arquivo,
          tipo: 'imagem',
          nomeArquivo: `${p.titulo.trim().slice(0, 60)}.jpg`,
        });
        setFeitas((k) => k + 1);
      }
      onDone(`${escolhidas.length} condições`);
    } catch {
      setErro('Não consegui publicar todas. Confira a internet — as que já subiram estão no ar.');
    } finally {
      setSubindo(false);
    }
  };

  // Corrigindo, o arquivo é opcional: quase toda correção é de texto ou data.
  const valid = titulo.trim().length > 2 && (!!arq || !!editando);

  const submit = async () => {
    if (!valid) return;
    setSubindo(true);
    setErro('');
    try {
      if (editando) {
        await atualizarCondicao(editando.id, {
          titulo: titulo.trim(),
          validade: validade.trim() || 'confirmar validade com a gerência',
          observacao: observacao.trim() || undefined,
          categoria,
          venceEm: venceEm || undefined,
          resumo: resumoIA.trim() || undefined,
          chamada: chamada.trim() || undefined,
          produtoId: produtoId || undefined,
          ...(arq ? { arquivo: arq.arquivo, tipo: arq.tipo, nomeArquivo: arq.nomeArquivo } : {}),
        });
        onDone(titulo.trim());
        return;
      }
      if (!arq) return;
      await publicarCondicao({
        brand,
        titulo: titulo.trim(),
        validade: validade.trim() || 'confirmar validade com a gerência',
        observacao: observacao.trim() || undefined,
        categoria,
        venceEm: venceEm || undefined,
        arquivo: arq.arquivo,
        tipo: arq.tipo,
        nomeArquivo: arq.nomeArquivo,
      });
      onDone(titulo.trim());
    } catch (e) {
      // SEM PERMISSÃO NÃO É SEM INTERNET.
      //
      // Quem tem cargo de gerente abre o Painel e o formulário, mas só grava se
      // o e-mail estiver liberado nas regras do Firestore. Sem separar os dois
      // casos, o gerente lê "confira a internet", troca de wi-fi, tenta de novo
      // e conclui que o app está quebrado — quando o que falta é uma linha que
      // só eu posso soltar.
      const semPermissao = (e as { code?: string })?.code === 'permission-denied';
      setErro(semPermissao
        ? 'Seu acesso ainda não libera publicar aqui. Avise a Vivian para soltar o seu e-mail — o resto do app segue funcionando.'
        : editando
          ? 'Não consegui salvar a correção. Confira a internet e tente de novo.'
          : 'Não consegui publicar agora. Confira a internet e tente de novo.');
    } finally {
      setSubindo(false);
    }
  };

  return (
    <div className="wp-gz-form">
      <label className="wp-gz-label">
        {editando ? 'Trocar a folha (opcional)' : 'Print ou PDF da tabela'}
      </label>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => escolher(e.target.files?.[0])}
      />
      <p className="wp-gz-hint">
        {editando
          ? 'Deixe em branco para manter a folha que já está no ar. Só escolha um arquivo se a imagem mudou.'
          : 'Pode ser o print do grupo, a foto da planilha ou o PDF da campanha. A imagem é reduzida automaticamente para abrir rápido no celular do time.'}
      </p>
      {lendo && <p className="wp-gz-hint">Lendo o arquivo…</p>}

      {/* A folha que já está no ar. Quem corrige o título precisa ver o que tem
          dentro — sem isto é fechar, olhar e abrir de novo. */}
      {editando && folhaAtual && (
        <div className="wp-gz-folha-atual">
          <img src={folhaAtual} alt="Folha publicada" />
          <span>É esta folha que está no ar. Ela continua, a menos que você escolha outro arquivo.</span>
        </div>
      )}

      {/* Folha repetida. Não bloqueia: avisa e deixa decidir — às vezes a
          mesma arte vale pra duas prateleiras de propósito. */}
      {repetida && (
        <p className="wp-gz-repetida">
          <b>Esta folha já está publicada</b> como “{repetida.titulo}”.
          Se a ideia é corrigir, feche isto e use o lápis dela — publicar de novo
          deixa as duas no ar, e o vendedor não sabe qual é a boa.
        </p>
      )}

      {paginas && (
        <div className="wp-gz-carta">
          <p className="wp-gz-carta-tit">
            {paginas.length} páginas — cada uma vira uma condição
          </p>
          <p className="wp-gz-hint">
            O título veio do que está escrito na própria página. Corrija o que estiver
            errado e desmarque o que não deve ir (capa, verso). O <b>rebate da rede</b> é
            tapado na imagem automaticamente — nenhum número é redigitado.
          </p>
          {paginas.map((p) => (
            <div key={p.n} className={`wp-gz-pg ${p.incluir ? '' : 'off'}`}>
              <img src={p.arquivo} alt={`Página ${p.n}`} />
              <div className="wp-gz-pg-campos">
                <label className="wp-gz-check">
                  <input type="checkbox" checked={p.incluir} onChange={(e) => mexer(p.n, { incluir: e.target.checked })} />
                  <span>publicar a página {p.n}</span>
                </label>
                <input
                  value={p.titulo}
                  onChange={(e) => mexer(p.n, { titulo: e.target.value })}
                  disabled={!p.incluir}
                  aria-label={`Título da página ${p.n}`}
                />
                <select
                  value={p.categoria}
                  onChange={(e) => mexer(p.n, { categoria: e.target.value as 'veiculo' | 'acessorio' | 'campanha' })}
                  disabled={!p.incluir}
                  aria-label={`Categoria da página ${p.n}`}
                >
                  <option value="veiculo">Veículo</option>
                  <option value="acessorio">Acessório</option>
                  <option value="campanha">Campanha</option>
                </select>
                <span className="wp-gz-pg-meta">
                  {Math.round(p.bytes / 1024)} KB
                  {p.rebates > 0 && <b> · {p.rebates === 1 ? '1 rebate tapado' : `${p.rebates} rebates tapados`}</b>}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {arq && (
        <div className="wp-gz-anexo">
          {arq.tipo === 'imagem'
            ? <img src={arq.arquivo} alt="Pré-visualização da tabela" />
            : <span className="wp-gz-anexo-pdf"><FileText size={20} className="wp-ico" /> {arq.nomeArquivo}</span>}
          <span className="wp-gz-anexo-meta">{Math.round(arq.bytes / 1024)} KB</span>
        </div>
      )}

      {!paginas && (<>
        <label className="wp-gz-label">Título</label>
        <input
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            if (!escolheuCategoria) {
              setCategoria(pareceAcessorio(e.target.value, arq?.nomeArquivo) ? 'acessorio' : 'veiculo');
            }
          }}
          placeholder="Ex.: Tabela Jaecoo — campanha de agosto"
        />
      </>)}

      {paginas && (
        <label className="wp-gz-check">
          <input type="checkbox" checked={substituir} onChange={(e) => setSubstituir(e.target.checked)} />
          <span>
            <b>Substituir o que já está nesta prateleira</b>
            <small>
              As condições que estão no ar saem da tela do time assim que estas subirem.
              Elas não são apagadas: ficam aqui no Painel, marcadas como vencidas.
            </small>
          </span>
        </label>
      )}

      <label className="wp-gz-label">Vale até quando{paginas ? ' (vale para todas)' : ''}</label>
      <input
        type="date"
        value={venceEm}
        onChange={(e) => {
          setVenceEm(e.target.value);
          if (!escreveuValidade) setValidade(e.target.value ? textoDeValidade(e.target.value) : '');
        }}
      />
      {/* UM TOQUE PRA VIRADA DO MÊS.
          A carta nova chega no primeiro dia útil, e é nesse dia que a velha tem
          que sair. Digitar a data à mão todo mês é o tipo de coisa que se
          esquece num sábado — e aí o vendedor abre o app na segunda com a taxa
          do mês passado na tela. O botão calcula, inclusive pulando feriado. */}
      <button
        type="button"
        className="wp-gz-virada"
        onClick={() => {
          const d = vaiAteAVirada();
          setVenceEm(d);
          if (!escreveuValidade) setValidade(textoDeValidade(d));
        }}
      >
        <CalendarClock size={13} className="wp-ico" /> Até a virada do mês
        <i>{vaiAteAVirada().split('-').reverse().join('/')}</i>
      </button>
      <p className="wp-gz-hint">
        É o único campo que importa aqui. Depois desta data a condição <b>sai sozinha</b> da
        tela do time — ninguém precisa lembrar de apagar. Ela continua no Painel, marcada
        como vencida, pra você trocar pela nova. Em branco, fica no ar até você tirar.
        O botão acima marca o dia certo pra ela sair quando a carta do mês seguinte
        entrar — pulando fim de semana e feriado.
      </p>

      <details className="wp-gz-avancado">
        <summary>Escrever a validade com outras palavras</summary>
        <label className="wp-gz-label">Texto que o vendedor lê no card</label>
        <input
          value={validade}
          onChange={(e) => { setEscreveuValidade(true); setValidade(e.target.value); }}
          placeholder="Ex.: enquanto durar o estoque"
        />
        <p className="wp-gz-hint">
          Já vem pronto pela data acima. Só mexa quando a condição não for por data —
          &ldquo;enquanto durar o estoque&rdquo;, &ldquo;até acabar a série&rdquo;.
        </p>
      </details>

      {!paginas && (<>
        <label className="wp-gz-label">É condição de quê?</label>
        <select
          value={categoria}
          onChange={(e) => { setEscolheuCategoria(true); setCategoria(e.target.value as 'veiculo' | 'acessorio' | 'campanha'); }}
        >
          <option value="veiculo">Veículo — taxa, entrada, bônus, trade-in</option>
          <option value="acessorio">Acessório — kit, película, proteção, som</option>
          <option value="campanha">Campanha da casa — meta, premiação, ação interna</option>
        </select>
        <p className="wp-gz-hint">
          {escolheuCategoria ? 'Você escolheu — ' : 'Sugerido pelo título e pelo arquivo, dá pra trocar. '}
          Separa as duas listas na tela do time: a do carro entra na negociação, a do
          acessório entra depois do sim.
        </p>
      </>)}
      <p className="wp-gz-hint">
        Toda condição publicada aqui é <b>interna</b>. O app não oferece encaminhar
        nenhuma delas — o vendedor passa o número ao cliente, não a folha.
      </p>

      <label className="wp-gz-label">Observação para o time (opcional){paginas ? ' — vale para todas' : ''}</label>
      <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={2} placeholder="Ex.: bônus de troca só com avaliação presencial." />

      {/* A ARTE PRO CLIENTE. Fica junto da observação porque é a mesma pergunta
          feita ao contrário: "o que o time precisa saber" e "o que o cliente
          pode ver". Só na correção — na publicação em lote a pessoa está
          subindo sete folhas de uma vez, e escrever sete chamadas ali faria ela
          escrever sete frases ruins. */}
      {editando && editando.categoria !== 'campanha' && (
        <details className="wp-gz-avancado">
          <summary>Arte para o cliente{chamada.trim() ? '' : ' — não liberada'}</summary>
          <p className="wp-gz-hint" style={{ marginTop: 8 }}>
            A folha desta condição é <b>interna</b> e continua sem botão de enviar. O que sai
            daqui é uma peça de anúncio: foto do carro, três destaques e a frase que você
            escrever abaixo. <b>Entrada, bônus de troca, rebate e preço não entram</b> — nem por
            engano, o gerador não recebe esses campos.
          </p>

          <label className="wp-gz-label">Chamada — a frase que pode ser anunciada</label>
          <input
            value={chamada}
            maxLength={70}
            onChange={(e) => setChamada(e.target.value)}
            placeholder="Ex.: Taxa 0% em até 24x"
          />
          <p className="wp-gz-hint">
            É a manchete da própria carta, a mesma que a montadora anuncia. Em branco, o
            botão não aparece pro time — e é assim que tem que ser quando não há nada
            aprovado pra anunciar.
          </p>

          <label className="wp-gz-label">De qual carro é</label>
          <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
            <option value="">— escolha o modelo —</option>
            {carrosDaCasa.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <p className="wp-gz-hint">
            De onde vêm a foto e os três destaques da arte. Sem modelo, a peça sai com o
            título da condição e sem foto.
          </p>
        </details>
      )}

      {/* O TEXTO QUE A IA LÊ. Só na correção — na publicação ele nasce sozinho
          da leitura do PDF.

          A folha é IMAGEM: o time abre e entende. A IA não enxerga imagem, ela
          lê ISTO. Enquanto o campo não aparecia em lugar nenhum, um número
          errado aqui virava resposta errada com toda a confiança do mundo, e
          não havia como descobrir a não ser perguntando pra ela e desconfiando.
          Agora dá pra abrir a folha ao lado e conferir linha por linha. */}
      {editando && (
        <details className="wp-gz-avancado" open={!resumoIA.trim()}>
          <summary>O que a IA lê desta folha{resumoIA.trim() ? '' : ' — vazio!'}</summary>
          <p className="wp-gz-hint" style={{ marginTop: 8 }}>
            A folha acima é imagem, e a IA não enxerga imagem: ela responde a partir
            <b> deste texto</b>. Se o Tira-dúvida falar um número que não bate com a folha,
            é aqui que se corrige. Compare com a folha e ajuste — vale a linha exata,
            do jeito que está escrito lá.
          </p>
          <textarea
            value={resumoIA}
            onChange={(e) => setResumoIA(e.target.value)}
            rows={10}
            placeholder={'LINHA OMODA 5 — carta de setembro, válida de 03/09 a 02/10/2026.\n\n[OMODA 5 LUXURY]\n- A · TAXA SUBSIDIADA = Taxa 0%, entrada 70% · 24x\n- B · TRADE-IN = R$ 8.000, no seminovo do cliente'}
          />
          <p className="wp-gz-hint">
            {resumoIA.trim()
              ? `${resumoIA.trim().length} caracteres — cabem 3.000. Uma linha por opção, com o rótulo na frente, é o formato que a IA erra menos.`
              : 'VAZIO: hoje a IA responde sobre esta folha só pelo título e pela observação. Cole aqui o conteúdo dela.'}
          </p>
        </details>
      )}

      {erro && <p className="wp-gz-erro">{erro}</p>}

      {paginas ? (
        <button className="wp-gz-submit" disabled={!escolhidas.length || subindo} onClick={publicarCarta}>
          <Check size={16} className="wp-ico" />
          {subindo
            ? `Publicando… ${feitas}/${escolhidas.length}`
            : `Publicar ${escolhidas.length === 1 ? '1 condição' : `${escolhidas.length} condições`}`}
        </button>
      ) : (
        <button className="wp-gz-submit" disabled={!valid || subindo} onClick={submit}>
          <Check size={16} className="wp-ico" />
          {editando
            ? (subindo ? 'Salvando…' : 'Salvar alterações')
            : (subindo ? 'Publicando…' : 'Publicar condição')}
        </button>
      )}
    </div>
  );
}

// PUBLICAR DOCUMENTO — sem depender de mim e sem plano pago.
//
// O arquivo é partido em pedaços e guardado no Firestore (ver data/docsUpload).
// Do lado de cá o que importa é a barra: um guia de 5 MB no 4G leva um tempo, e
// gestor sem retorno na tela desiste no meio e sobe metade.
function DocumentoForm({ brand, onDone }: { brand: BrandId; onDone: (t: string) => void }) {
  const [titulo, setTitulo] = useState('');
  const [paraQue, setParaQue] = useState('');
  const [prateleira, setPrateleira] = useState<PrateleiraId>('venda');
  const [interno, setInterno] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [erro, setErro] = useState('');

  const valid = titulo.trim().length > 2 && !!arquivo;

  const enviar = async () => {
    if (!valid || !arquivo || pct !== null) return;
    setErro('');
    setPct(0);
    try {
      await enviarDocNuvem({ brand, prateleira, titulo, paraQue, interno, arquivo }, setPct);
      onDone(titulo.trim());
    } catch {
      setErro('Não consegui publicar. Confira a internet e tente de novo.');
    } finally {
      setPct(null);
    }
  };

  return (
    <div className="wp-gz-form">
      <label className="wp-gz-label">Arquivo (PDF)</label>
      <input type="file" accept="application/pdf,image/*" onChange={(e) => setArquivo(e.target.files?.[0] || null)} />
      {arquivo && <p className="wp-gz-hint">{Math.round(arquivo.size / 1024 / 1024 * 10) / 10} MB</p>}

      <label className="wp-gz-label">Título</label>
      <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Guia de venda — Omoda 5" />

      <label className="wp-gz-label">Para que serve</label>
      <input
        value={paraQue}
        onChange={(e) => setParaQue(e.target.value)}
        placeholder="Uma linha, do ponto de vista de quem vai abrir."
      />

      <label className="wp-gz-label">Prateleira</label>
      <select value={prateleira} onChange={(e) => setPrateleira(e.target.value as PrateleiraId)}>
        {PRATELEIRAS.map((pr) => <option key={pr.id} value={pr.id}>{pr.titulo}</option>)}
      </select>

      <label className="wp-gz-check">
        <input type="checkbox" checked={interno} onChange={(e) => setInterno(e.target.checked)} />
        <span>
          Material interno — traz custo, margem ou política de preço.
          <i>O app avisa o time pra não encaminhar ao cliente.</i>
        </span>
      </label>

      {pct !== null && (
        <div className="wp-gz-prog"><span style={{ width: `${pct}%` }} /><b>{pct}%</b></div>
      )}
      {erro && <p className="wp-gz-erro">{erro}</p>}

      <button className="wp-gz-submit" disabled={!valid || pct !== null} onClick={enviar}>
        <Check size={16} className="wp-ico" /> {pct !== null ? 'Publicando…' : 'Publicar documento'}
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
  // Um vídeo de 12 MB são 20 escritas na nuvem. Sem barra, a gerência acha que
  // travou e aperta de novo — e aí sobem dois.
  const [pct, setPct] = useState<number | null>(null);
  const [aviso, setAviso] = useState('');
  const salvar = () => {
    clearProductVideo(key);
    setAudienceReel(productId, audience, ig);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };
  const subirMp4 = (f: File) => {
    setAudienceReel(productId, audience, '');
    setIg('');
    setAviso('');
    setPct(0);
    setProductVideo(key, f, setPct).then((naNuvem) => {
      setPct(null);
      if (!naNuvem) setAviso('Ficou só neste aparelho: a nuvem não respondeu. Suba de novo com internet.');
    });
  };
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
          <label className={`wp-gz-slot-mp4 ${pct !== null ? 'ocupado' : ''}`}>
            <UploadCloud size={14} className="wp-ico" />
            {pct !== null ? `${pct}%` : 'MP4'}
            <input type="file" accept="video/*" hidden disabled={pct !== null}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) subirMp4(f); }} />
          </label>
          {ok && pct === null && <button className="wp-gz-slot-clear" onClick={tirar}>Tirar</button>}
        </div>
        {pct !== null && (
          <div className="wp-gz-slot-barra"><i style={{ width: `${pct}%` }} /></div>
        )}
        {aviso && <p className="wp-gz-slot-aviso">{aviso}</p>}
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


// Contatos que chegaram pelo formulário da landing. É informação do NEGÓCIO da
// GSS, não da marca — por isso só quem toca a GSS vê, e não todo gestor.
const DONOS_GSS = ['viviangitti23@gmail.com'];

function Interessados({ email }: { email?: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [aberto, setAberto] = useState(false);
  const podeVer = !!email && DONOS_GSS.includes(email.trim().toLowerCase());

  useEffect(() => {
    if (podeVer) buscarLeads().then(setLeads).catch(() => {});
  }, [podeVer]);

  if (!podeVer || !leads.length) return null;
  return (
    <div className="wp-gz-block">
      <button type="button" className="wp-objadd-head" onClick={() => setAberto((o) => !o)}>
        <span className="wp-gz-block-title"><Mail size={17} className="wp-ico" /> Marcas interessadas ({leads.length})</span>
        <ChevronDown size={16} className={`wp-ico wp-objadd-chev ${aberto ? 'open' : ''}`} />
      </button>
      {aberto && (
        <div className="wp-gz-leads">
          {leads.map((l) => (
            <div key={l.id} className="wp-gz-lead">
              <b>{l.empresa || 'Sem empresa'}</b>
              <span>{l.nome} · {l.email}{l.whatsapp ? ` · ${l.whatsapp}` : ''}</span>
              {l.mensagem && <p>&ldquo;{l.mensagem}&rdquo;</p>}
              <i>{l.criadoEm ? l.criadoEm.toLocaleDateString('pt-BR') : ''}</i>
            </div>
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

function VideosPorPublico({ products: todos }: { products: Product[] }) {
  useAudienceReels();
  useStore();
  // Produto sem público próprio (ex.: os de balcão na Meraki, que ainda não tem
  // balconista) não entra na lista — virava um monte de linha "0/0" sem ação.
  const products = todos.filter((p) => audiencesForLine(p.line, p.brand).length > 0);
  const { total, feitos } = videoTotals(products);
  if (!products.length) return null;
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  return (
    <div className="wp-gz-block wp-gz-videos">
      <div className="wp-gz-block-head">
        <span className="wp-gz-block-title"><Video size={17} className="wp-ico" /> Vídeos por público</span>
        <span className={`wp-gz-vcount ${feitos === total ? 'full' : ''}`}>{feitos} de {total}</span>
      </div>
      <p className="wp-gz-help" style={{ marginTop: 0 }}>
        Cada público vê o vídeo dele. Quem não tiver o do público assiste o vídeo padrão.
      </p>
      <div className="wp-gz-vbar"><span className="wp-gz-vbar-fill" style={{ width: `${pct}%` }} /></div>
      <div className="wp-gz-vlist">
        {products.map((p) => <VideoProductRow key={p.id} p={p} />)}
      </div>
    </div>
  );
}


// CADASTRAR UM ACESSÓRIO QUE NÃO ESTÁ NO CÓDIGO.
//
// Os 27 do catálogo vieram dos comunicados da montadora e da tabela da loja.
// Mas a loja lança serviço novo o tempo todo, e até aqui isso virava pedido pra
// mim — com o acessório fora do app até eu ter tempo de mexer no código.
//
// Os campos são os que decidem uma venda de acessório, e nenhum a mais:
// o que resolve, como oferecer, quanto custa, de onde vem, o código pra pedir
// e em que carros entra. Foto e vídeo sobem depois, na tela do próprio item —
// mesmo caminho dos outros.
function NovoAcessorio({ brand, jaExistem, onPronto }: {
  brand: BrandId;
  jaExistem: string[];
  onPronto: (nome: string) => void;
}) {
  const [f, setF] = useState({
    nome: '', origem: 'loja' as OrigemAcessorio, beneficio: '', comoOferecer: '',
    preco: '', observacao: '', codigos: '',
  });
  const [carros, setCarros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const doGrupo = allProducts().filter((p) => p.brand === brand);

  const valido = f.nome.trim().length > 2 && f.beneficio.trim().length > 5;

  const salvar = async () => {
    if (!valido) return;
    setSalvando(true); setErro('');
    try {
      const id = idParaAcessorio(f.nome, jaExistem);
      const n = Number(f.preco.replace(/[^\d]/g, ''));
      await salvarAcessorioNovo(brand, id, {
        nome: f.nome.trim(),
        origem: f.origem,
        beneficio: f.beneficio.trim(),
        comoOferecer: f.comoOferecer.trim() || 'Ofereça no fechamento, junto com a entrega.',
        preco: Number.isFinite(n) && n > 0 ? n : undefined,
        aplicaEm: carros,
        // "Omoda 5: 08JD1N50T19" — uma linha por modelo, do jeito que vem no
        // comunicado. Linha sem dois-pontos é ignorada em vez de virar lixo.
        codigos: f.codigos.split('\n').map((l) => {
          const [modelo, ...resto] = l.split(':');
          const pn = resto.join(':').trim();
          return modelo && pn ? { modelo: modelo.trim(), pn } : null;
        }).filter(Boolean) as { modelo: string; pn: string }[],
        observacao: f.observacao.trim() || undefined,
        criadoEm: Date.now(),
      });
      onPronto(f.nome.trim());
    } catch (e) {
      setErro((e as { code?: string })?.code === 'permission-denied'
        ? 'Seu acesso ainda não libera criar acessório. Avise a Vivian.'
        : 'Não consegui salvar. Confira a internet.');
    } finally { setSalvando(false); }
  };

  return (
    <div className="wp-gz-form wp-gz-acform">
      <label className="wp-gz-label">Nome do acessório</label>
      <input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Ex.: Insulfilm térmico premium" autoFocus />

      <label className="wp-gz-label">De onde vem</label>
      <select value={f.origem} onChange={(e) => setF({ ...f, origem: e.target.value as OrigemAcessorio })}>
        <option value="loja">{ORIGENS.loja.label} — serviço que a loja instala</option>
        <option value="fabrica">{ORIGENS.fabrica.label} — pedida por código, entra na garantia</option>
      </select>

      <label className="wp-gz-label">O que resolve pro cliente</label>
      <textarea rows={2} value={f.beneficio} onChange={(e) => setF({ ...f, beneficio: e.target.value })} placeholder="Uma frase. É o que aparece embaixo do nome no catálogo." />

      <label className="wp-gz-label">Como oferecer</label>
      <textarea rows={3} value={f.comoOferecer} onChange={(e) => setF({ ...f, comoOferecer: e.target.value })} placeholder="A hora certa de oferecer e pra que cliente." />

      <label className="wp-gz-label">Preço (opcional)</label>
      <input inputMode="numeric" value={f.preco} onChange={(e) => setF({ ...f, preco: e.target.value })} placeholder="em branco = sob consulta" />

      <label className="wp-gz-label">Entra em quais carros</label>
      <div className="wp-gz-carros">
        {doGrupo.map((p) => (
          <label key={p.id} className={`wp-gz-carro ${carros.includes(p.id) ? 'on' : ''}`}>
            <input
              type="checkbox"
              checked={carros.includes(p.id)}
              onChange={(e) => setCarros((c) => (e.target.checked ? [...c, p.id] : c.filter((x) => x !== p.id)))}
            />
            {p.name}
          </label>
        ))}
      </div>
      <p className="wp-gz-help">É o que faz ele aparecer DENTRO do carro, que é onde o acessório se vende.</p>

      <label className="wp-gz-label">Código de peça (opcional, um por linha)</label>
      <textarea
        rows={3} value={f.codigos}
        onChange={(e) => setF({ ...f, codigos: e.target.value })}
        placeholder={'Omoda 5: 08JD1N50T19CHEN001\nJaecoo 7: 08W01N30T1EJPY001'}
      />
      <p className="wp-gz-help">Modelo, dois-pontos, código. Serviço da loja não tem — pode deixar vazio.</p>

      <label className="wp-gz-label">Observação (opcional)</label>
      <input value={f.observacao} onChange={(e) => setF({ ...f, observacao: e.target.value })} placeholder="ex.: só para as versões com teto solar" />

      {erro && <p className="wp-gz-erro">{erro}</p>}
      <div className="wp-gz-acform-fim">
        <button type="button" className="wp-gz-preco-ok" disabled={!valido || salvando} onClick={salvar}>
          {salvando ? 'Publicando…' : 'Publicar — o time já vê'}
        </button>
      </div>
      <p className="wp-gz-help">
        Depois de publicar, abra o acessório no catálogo pra subir a foto — sem foto ninguém oferece,
        porque não dá pra imaginar.
      </p>
    </div>
  );
}

// UMA LINHA DE ACESSÓRIO — preço no toque, e o resto atrás do lápis.
//
// Começou só com o preço, porque é o campo que muda toda hora e mandar a
// gerência abrir formulário pra trocar um número é a fricção que faz ela não
// trocar. Isso continua: toque no valor e pronto.
//
// O que faltava era o RESTO. Nome errado, benefício desatualizado, item que a
// loja parou de vender, a ordem da vitrine — nada disso tinha dono na tela, e
// virava pedido pra mim. Agora tem: o lápis abre a ficha inteira, a lixeira
// tira de cartaz e as setas arrumam a fila.
//
// O código de peça, a foto e os carros compatíveis NÃO estão aqui de propósito:
// PN errado o vendedor pede a peça errada, e isso se confere no comunicado da
// montadora, não no chute. Foto se troca na tela do próprio acessório.
function LinhaAcessorio({
  a, brand, i, total, onMover, abrirJa, daGerencia,
}: {
  a: Acessorio;
  brand: BrandId;
  i: number;
  total: number;
  onMover: (de: number, passo: number) => void;
  /** Veio do botão "Editar" lá na tela do acessório: já abre a ficha. */
  abrirJa?: boolean;
  /** Criado aqui no Painel (não vem do código) — este dá pra apagar de vez. */
  daGerencia?: boolean;
}) {
  const [modo, setModo] = useState<null | 'preco' | 'ficha'>(abrirJa ? 'ficha' : null);
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const oculto = acessorioOculto(a.id);
  const editado = !!edicaoDe(a.id);

  // A ficha inteira, começando pelo que está na tela hoje (já corrigido).
  const [f, setF] = useState({
    nome: a.nome, beneficio: a.beneficio, comoOferecer: a.comoOferecer,
    observacao: a.observacao || '', origem: a.origem as OrigemAcessorio,
  });

  const recado = (e: unknown) =>
    (e as { code?: string })?.code === 'permission-denied'
      ? 'Seu acesso ainda não libera mexer em acessório. Avise a Vivian.'
      : 'Não consegui salvar. Confira a internet.';

  const abrirPreco = () => {
    setErro('');
    setValor(String(precoDe(a) ?? ''));
    setModo('preco');
  };

  const abrirFicha = () => {
    setErro('');
    setF({
      nome: a.nome, beneficio: a.beneficio, comoOferecer: a.comoOferecer,
      observacao: a.observacao || '', origem: a.origem,
    });
    setModo('ficha');
  };

  const salvarValor = async () => {
    setSalvando(true); setErro('');
    try {
      const n = Number(String(valor).replace(/[^\d]/g, ''));
      await salvarPreco(brand, a.id, Number.isFinite(n) && n > 0 ? n : undefined);
      setModo(null);
    } catch (e) { setErro(recado(e)); } finally { setSalvando(false); }
  };

  const salvarFicha = async () => {
    if (!f.nome.trim()) { setErro('O nome não pode ficar vazio — é o que o time lê no card.'); return; }
    setSalvando(true); setErro('');
    try {
      await salvarEdicao(brand, a.id, f);
      setModo(null);
    } catch (e) { setErro(recado(e)); } finally { setSalvando(false); }
  };

  const voltarAoOriginal = async () => {
    if (!confirm(`Voltar "${a.nome}" ao texto original do catálogo? O preço corrigido continua.`)) return;
    setSalvando(true); setErro('');
    try {
      await salvarEdicao(brand, a.id, null);
      setModo(null);
    } catch (e) { setErro(recado(e)); } finally { setSalvando(false); }
  };

  const apagarDeVez = async () => {
    if (!confirm(`Apagar "${a.nome}" de vez?\n\nEste acessório foi criado aqui, então some para sempre — preço, texto e posição junto. Não tem como desfazer.\n\nSe é só porque saiu de linha, use a lixeira: tira da vitrine e dá pra trazer de volta.`)) return;
    try { await apagarAcessorioNovo(brand, a.id); } catch (e) { setErro(recado(e)); }
  };

  const tirarOuVoltar = async () => {
    const pergunta = oculto
      ? `Colocar "${a.nome}" de volta na vitrine? O time volta a ver.`
      : `Tirar "${a.nome}" da vitrine? O time deixa de ver — no catálogo, dentro do carro e na IA. Você pode trazer de volta aqui.`;
    if (!confirm(pergunta)) return;
    try {
      await ocultarAcessorio(brand, a.id, !oculto);
    } catch (e) { setErro(recado(e)); }
  };

  return (
    <div>
      <div className={`wp-gz-item wp-gz-acitem ${oculto ? 'wp-gz-item-off' : ''}`}>
        <span className="wp-gz-item-name">
          {a.nome}
          {oculto && <span className="wp-gz-fora">fora da vitrine</span>}
          {!oculto && editado && <span className="wp-gz-fora wp-gz-fora--ok">editado</span>}
          {!oculto && !editado && daGerencia && <span className="wp-gz-fora wp-gz-fora--ok">da loja</span>}
        </span>
        {/* Preço à esquerda, ferramentas à direita, em faixa própria: com o nome
            na mesma linha os quatro ícones quebravam e a lixeira caía sozinha
            embaixo, parecendo botão de outra coisa. */}
        <span className="wp-gz-item-meta wp-gz-acmeta">
          <button type="button" className="wp-gz-preco" onClick={abrirPreco}>
            {precoLabel(a)} <Pencil size={12} className="wp-ico" />
          </button>
          <span className="wp-gz-acbtns">
          <button
            type="button" className="wp-gz-del" title="Subir na lista"
            aria-label={`Subir ${a.nome} na lista`}
            disabled={i === 0} onClick={() => onMover(i, -1)}
          >
            <ChevronUp size={14} className="wp-ico" />
          </button>
          <button
            type="button" className="wp-gz-del" title="Descer na lista"
            aria-label={`Descer ${a.nome} na lista`}
            disabled={i === total - 1} onClick={() => onMover(i, 1)}
          >
            <ChevronDown size={14} className="wp-ico" />
          </button>
          <button
            type="button" className="wp-gz-del" title="Editar nome e textos"
            aria-label={`Editar ${a.nome}`}
            onClick={() => (modo === 'ficha' ? setModo(null) : abrirFicha())}
          >
            <Pencil size={14} className="wp-ico" />
          </button>
          <button
            type="button" className="wp-gz-del"
            title={oculto ? 'Colocar de volta' : 'Tirar da vitrine'}
            aria-label={oculto ? `Colocar ${a.nome} de volta` : `Tirar ${a.nome} da vitrine`}
            onClick={tirarOuVoltar}
          >
            {oculto ? <Undo2 size={14} className="wp-ico" /> : <Trash2 size={14} className="wp-ico" />}
          </button>
          {/* Apagar DE VEZ só existe pro que foi criado aqui. O do código não
              tem como sair do código — pra ele a lixeira acima é o certo, e ela
              volta atrás. */}
          {daGerencia && (
            <button
              type="button" className="wp-gz-del" title="Apagar de vez"
              aria-label={`Apagar ${a.nome} de vez`} onClick={apagarDeVez}
            >
              <X size={14} className="wp-ico" />
            </button>
          )}
          </span>
        </span>
      </div>

      {modo === 'preco' && (
        <span className="wp-gz-preco-form">
          <input
            type="text" inputMode="numeric" value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="em branco = sob consulta"
            aria-label={`Preço de ${a.nome}`} autoFocus
          />
          <button type="button" className="wp-gz-preco-ok" disabled={salvando} onClick={salvarValor}>
            {salvando ? '…' : 'Salvar'}
          </button>
          <button type="button" className="wp-gz-preco-x" onClick={() => setModo(null)}>Cancelar</button>
          {erro && <small className="wp-gz-erro">{erro}</small>}
        </span>
      )}

      {modo === 'ficha' && (
        <div className="wp-gz-form wp-gz-acform">
          <label className="wp-gz-label">Nome do acessório</label>
          <input
            value={f.nome} autoFocus
            onChange={(e) => setF({ ...f, nome: e.target.value })}
          />

          <label className="wp-gz-label">O que resolve pro cliente</label>
          <textarea
            rows={2} value={f.beneficio}
            onChange={(e) => setF({ ...f, beneficio: e.target.value })}
          />
          <p className="wp-gz-help">É a frase que aparece embaixo do nome no catálogo. Curta.</p>

          <label className="wp-gz-label">Como oferecer</label>
          <textarea
            rows={4} value={f.comoOferecer}
            onChange={(e) => setF({ ...f, comoOferecer: e.target.value })}
          />
          <p className="wp-gz-help">O que o vendedor lê antes de falar com o cliente. Diga a hora certa de oferecer.</p>

          <label className="wp-gz-label">Observação (opcional)</label>
          <input
            value={f.observacao}
            placeholder="ex.: só para as versões com teto solar"
            onChange={(e) => setF({ ...f, observacao: e.target.value })}
          />

          <label className="wp-gz-label">De onde vem</label>
          <select
            value={f.origem}
            onChange={(e) => setF({ ...f, origem: e.target.value as OrigemAcessorio })}
          >
            <option value="fabrica">{ORIGENS.fabrica.label} — pedida por código, entra na garantia</option>
            <option value="loja">{ORIGENS.loja.label} — serviço que a loja instala</option>
          </select>
          <p className="wp-gz-help">
            Muda o grupo em que ele aparece no catálogo. É o que evita o vendedor prometer
            "sai hoje" numa peça que vem de pedido.
          </p>

          {/* O PREÇO não fica aqui de propósito: ele já tem um lugar só dele, no
              toque em cima do valor. Dois campos pro mesmo número é como o preço
              do tapete acabou velho na tela do time. */}
          <p className="wp-gz-help">
            O preço se corrige tocando no valor, ali em cima. Código de peça, foto e
            carros compatíveis não se mexem aqui — PN errado faz o vendedor pedir a peça errada.
          </p>

          {erro && <p className="wp-gz-erro">{erro}</p>}
          <div className="wp-gz-acform-fim">
            <button type="button" className="wp-gz-preco-ok" disabled={salvando} onClick={salvarFicha}>
              {salvando ? 'Salvando…' : 'Salvar — o time já vê'}
            </button>
            <button type="button" className="wp-gz-preco-x" onClick={() => setModo(null)}>Cancelar</button>
            {editado && (
              <button type="button" className="wp-gz-voltar" disabled={salvando} onClick={voltarAoOriginal}>
                <RotateCcw size={13} className="wp-ico" /> Voltar ao original
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ p }: { p: Product }) {
  useStore();
  const uploaded = hasVideo(p.id);
  // Quantos episódios da trilha já têm vídeo. Sem isso, um carro com seis
  // níveis e um vídeo só parecia pronto na lista do Painel.
  const eps = (p.niveis || []).length;
  const gravados = (p.niveis || []).filter((_, k) => hasVideo(nivelVideoKey(p.id, k + 2))).length;
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
      <span className="wp-gz-item-meta">
        {meta}
        {eps > 0 && <span className="wp-gz-eps"> · trilha {gravados}/{eps}</span>}
        {' '}<ChevronRight size={14} className="wp-ico" />
      </span>
    </Link>
  );
}

export default function Gestor() {
  const { user } = useAuth();
  useStore();
  const { brand, brandId } = useBrand();
  const [openForm, setOpenForm] = useState<'produto' | 'oferta' | 'condicao' | 'documento' | 'calendario' | 'tendencia' | null>(null);
  // Qual condição está aberta para correção (o formulário abre abaixo dela).
  const [editandoCond, setEditandoCond] = useState<string | null>(null);
  // Veio de "Editar" lá da tela do time: abre na aba certa, com a condição
  // aberta e rolada até ela. Sem isso o atalho jogava a pessoa no topo do
  // Painel e ela tinha que procurar de novo.
  useEffect(() => {
    const alvo = new URLSearchParams(window.location.search).get('editar');
    if (!alvo) return;
    setTab('conteudo');
    setEditandoCond(alvo);
    const t = setTimeout(() => {
      document.querySelector('.wp-gz-form')?.scrollIntoView({ block: 'center' });
    }, 400);
    return () => clearTimeout(t);
  }, []);
  // O mesmo atalho, vindo da tela do acessório.
  const [acessorioAlvo, setAcessorioAlvo] = useState<string | null>(null);
  useEffect(() => {
    const alvo = new URLSearchParams(window.location.search).get('acessorio');
    if (!alvo) return;
    setTab('conteudo');
    setAcessorioAlvo(alvo);
    const t = setTimeout(() => {
      document.querySelector('.wp-gz-acform')?.scrollIntoView({ block: 'center' });
    }, 500);
    return () => clearTimeout(t);
  }, []);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'resultados' | 'vendas' | 'conteudo'>('resultados');

  useCondicoes();
  useEffect(() => { carregarCondicoes(brandId); }, [brandId]);
  const condicoes = condicoesDaMarca(brandId);
  const [docsNuvem, setDocsNuvem] = useState<DocNuvem[]>([]);
  useEffect(() => { carregarDocsNuvem(brandId).then(setDocsNuvem).catch(() => {}); }, [brandId]);
  // Os PDFs que vieram no app também precisam sair de cartaz sozinhos: a lista
  // do Painel só tinha lixeira pro que a gerência subiu, e não havia nada.
  useDocsOcultos();
  useEffect(() => { carregarOcultos(brandId); }, [brandId]);
  const escondidos = ocultosDaMarca(brandId);
  const docsDoApp = DOCUMENTOS.filter((d) => d.brand === brandId);
  useAjustesAcessorios();
  useEffect(() => { carregarAjustesAcessorios(brandId); }, [brandId]);
  const acessoriosDaCasa = acessoriosParaGestao(brandId);
  // Mexer no catálogo de acessórios é do supervisor e do gerente de acessórios
  // (ver data/cargos). Os outros gestores continuam VENDO a lista com os preços
  // — é informação de trabalho — mas sem os botões.
  const podeAcess = podeMexerEmAcessorios(user);
  const [novoAcess, setNovoAcess] = useState(false);
  // Quais acessórios foram criados aqui — só esses podem ser apagados de vez.
  const criadosAqui = novosDaMarca(brandId);
  const auto = isAuto(brandId);

  const products = allProducts().filter((p) => p.brand === brandId);
  const vids = videoTotals(products);
  const offers = allOffers().filter((o) => o.brand === brandId);
  const calendar = allCalendar(brandId);
  const trends = allTrends(brandId);
  const buscas = topSearches(5, brandId);

  /**
   * Troca duas condições de lugar e GRAVA a posição de todas.
   *
   * Grava a lista inteira, não só as duas: metade com ordem e metade sem faz a
   * lista dançar sozinha na próxima abertura, porque quem não tem ordem cai no
   * critério de data.
   */
  const reordenar = (lista: Condicao[], de: number, passo: number) => {
    const para = de + passo;
    if (para < 0 || para >= lista.length) return;
    const nova = [...lista];
    [nova[de], nova[para]] = [nova[para], nova[de]];
    nova.forEach((c, i) => { atualizarCondicao(c.id, { ordem: i }).catch(() => {}); });
  };

  /**
   * Troca dois acessórios de lugar e GRAVA a fila inteira.
   *
   * A troca acontece DENTRO do grupo (fábrica ou loja), que é como o time vê no
   * catálogo — mover um item de fábrica pra cima de um item de loja não mudaria
   * nada na tela dele, e a gerência ficaria clicando à toa.
   */
  const moverAcessorio = (grupo: Acessorio[], gi: number, passo: number) => {
    const alvo = grupo[gi + passo];
    if (!alvo) return;
    const ids = acessoriosDaCasa.map((x) => x.id);
    const a = ids.indexOf(grupo[gi].id);
    const b = ids.indexOf(alvo.id);
    if (a < 0 || b < 0) return;
    [ids[a], ids[b]] = [ids[b], ids[a]];
    salvarOrdemAcessorios(brandId, ids).catch(() => {});
  };

  const done = (label: string, what: string, naNuvem = true, verbo = 'publicado') => {
    setOpenForm(null);
    setToast(naNuvem
      ? `${what} "${label}" ${verbo} — o time já vê.`
      : `"${label}" foi salvo só neste aparelho: a nuvem não respondeu. Abra de novo com internet para publicar pro time.`);
    setTimeout(() => setToast(''), naNuvem ? 4000 : 8000);
  };

  return (
    <div className="wp-gestor">
      <div className="wp-gz-hero">
        <span className="wp-gz-hero-tag">PAINEL DO GESTOR</span>
        <h1 className="wp-gz-hero-title">Gestão da marca {brand.name}</h1>
        <p className="wp-gz-hero-sub">
          {auto
            ? 'Cadastre carros e acessórios, envie vídeos e publique a tabela vigente. O que você publica aqui aparece na hora para o time.'
            : 'Cadastre produtos, envie vídeos e crie ofertas. O que você publica aqui aparece na hora para o time.'}
        </p>
      </div>

      {toast && <div className="wp-gz-toast"><Check size={13} className="wp-ico" /> {toast} <Link to="/eleva/catalogo">ver no catálogo <ExternalLink size={12} className="wp-ico" /></Link></div>}


      {/* Abas: o gestor tem dois trabalhos — ver resultado e colocar conteúdo. */}
      <div className="wp-gz-tabs">
        <button className={`wp-gz-tab ${tab === 'resultados' ? 'on' : ''}`} onClick={() => setTab('resultados')}>
          <TrendingUp size={15} className="wp-ico" /> Resultados
        </button>
        <button className={`wp-gz-tab ${tab === 'conteudo' ? 'on' : ''}`} onClick={() => setTab('conteudo')}>
          <Package size={15} className="wp-ico" /> Conteúdo
          {/* Contador de vídeos na aba — a tarefa principal não some por estar aqui dentro */}
          <span className={`wp-gz-tab-badge ${vids.feitos === vids.total ? 'full' : ''}`}>{vids.feitos}/{vids.total}</span>
        </button>
      </div>

      {/* As objeções ficam FORA do <Resultados> de propósito: são outra fonte de
          dados. Estavam dentro, e quando a leitura dos números do time falhava
          (sem internet no showroom, ou uma soluçada do Firestore) o bloco
          inteiro sumia — o gestor perdia as objeções junto, sem entender por
          quê. Cada bloco cai sozinho agora. */}
      {tab === 'resultados' && (
        <>
          <Interessados email={user?.email} />
          <Resultados brandId={brandId} products={products} buscas={buscas} />
          {auto && <ArgumentosPanel brandId={brandId} products={products} />}
          <ObjectionsPanel brandId={brandId} />
        </>
      )}

      {tab === 'conteudo' && (<>
      {/* Vídeos por público vem PRIMEIRO — é a principal função do gestor */}
      <VideosPorPublico products={products} />

      {/* Produtos */}
      <div className="wp-gz-block">
        <div className="wp-gz-block-head">
          <span className="wp-gz-block-title"><Package size={17} className="wp-ico" /> {auto ? 'Carros' : 'Produtos'} ({products.length})</span>
          <button className="wp-gz-add" onClick={() => setOpenForm(openForm === 'produto' ? null : 'produto')}>
            <Plus size={15} className="wp-ico" /> {auto ? 'Novo item' : 'Novo produto'}
          </button>
        </div>
        {openForm === 'produto' && <ProductForm brand={brandId} onDone={(n, ok) => done(n, 'Produto', ok)} />}
        <div className="wp-gz-list">
          {products.map((p) => <ProductRow key={p.id} p={p} />)}
        </div>
      </div>

      {/* ACESSÓRIOS — bloco próprio.
          Antes o bloco se chamava "Carros e acessórios" e listava só os carros:
          os 27 acessórios não apareciam em lugar nenhum do Painel, e o preço
          deles só mudava se alguém me pedisse. */}
      {auto && (
        <div className="wp-gz-block">
          <div className="wp-gz-block-head">
            <span className="wp-gz-block-title"><Package size={17} className="wp-ico" /> Acessórios ({acessoriosDaCasa.length})</span>
            {podeAcess && (
              <button className="wp-gz-add" onClick={() => setNovoAcess((v) => !v)}>
                <Plus size={15} className="wp-ico" /> {novoAcess ? 'Fechar' : 'Novo acessório'}
              </button>
            )}
          </div>
          {podeAcess && novoAcess && (
            <NovoAcessorio
              brand={brandId}
              jaExistem={acessoriosDaCasa.map((a) => a.id)}
              onPronto={(nome) => { setNovoAcess(false); done(nome, 'Acessório'); }}
            />
          )}
          <p className="wp-gz-help" style={{ marginTop: 0 }}>
            {podeAcess
              ? 'Toque no preço para corrigir. O lápis abre nome e textos, as setas arrumam a ordem da vitrine e a lixeira tira de cartaz sem apagar — dá pra trazer de volta.'
              : 'A tabela de acessórios é mantida pelo supervisor e pelo gerente de acessórios. Aqui você consulta o valor vigente.'}
          </p>
          {/* AS DUAS LISTAS, iguais às do catálogo do time. Na tela deles a
              separação evita prometer "sai hoje" numa peça de pedido; aqui ela
              serve pra ordem fazer sentido — o que você sobe neste grupo é o que
              sobe na vitrine dele. */}
          {(['fabrica', 'loja'] as OrigemAcessorio[]).map((origem) => {
            const grupo = acessoriosDaCasa.filter((a) => a.origem === origem);
            if (!grupo.length) return null;
            return (
              <div key={origem} className="wp-gz-acgrupo">
                <span className="wp-gz-acgrupo-nome">{ORIGENS[origem].label} ({grupo.length})</span>
                <div className="wp-gz-list">
                  {grupo.map((a, i) => (
                    podeAcess ? (
                      <LinhaAcessorio
                        key={a.id}
                        a={a}
                        brand={brandId}
                        i={i}
                        total={grupo.length}
                        abrirJa={acessorioAlvo === a.id}
                        onMover={(de, passo) => moverAcessorio(grupo, de, passo)}
                        daGerencia={!!criadosAqui[a.id]}
                      />
                    ) : (
                      <div key={a.id} className={`wp-gz-item ${acessorioOculto(a.id) ? 'wp-gz-item-off' : ''}`}>
                        <span className="wp-gz-item-name">
                          {a.nome}
                          {acessorioOculto(a.id) && <span className="wp-gz-fora">fora da vitrine</span>}
                        </span>
                        <span className="wp-gz-item-meta">{precoLabel(a)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Condições comerciais (automotivo): a tabela sobe como print/PDF */}
      {auto && (
        <div className="wp-gz-block">
          <div className="wp-gz-block-head">
            <span className="wp-gz-block-title"><ClipboardList size={17} className="wp-ico" /> Condições comerciais ({condicoes.length})</span>
            <button className="wp-gz-add" onClick={() => setOpenForm(openForm === 'condicao' ? null : 'condicao')}>
              <UploadCloud size={15} className="wp-ico" /> Subir tabela
            </button>
          </div>
          {openForm === 'condicao' && !editandoCond && (
            <CondicaoForm brand={brandId} onDone={(t) => done(t, 'Condição')} />
          )}
          <div className="wp-gz-list">
            {condicoes.map((c, i) => (
              <div key={c.id}>
                <div className={`wp-gz-item ${estaVencida(c) ? 'wp-gz-item-off' : ''}`}>
                  <span className="wp-gz-item-name">
                    {c.titulo}
                    {estaVencida(c) && <span className="wp-gz-fora">vencida — fora do ar</span>}
                  </span>
                  <span className="wp-gz-item-meta">
                    {c.validade}
                    {/* CORRIGIR sem apagar. Antes, errar a data ou o título
                        custava apagar e subir de novo — e a condição sumia da
                        tela do time no meio do expediente, junto com a folha. */}
                    {/* ORDEM. A lista sai por data de publicação, que é a ordem
                        do PDF — não a que o vendedor precisa. O Jaecoo 7 é o
                        carro mais consultado e caía em quinto só por ter sido a
                        quinta página do arquivo. */}
                    <button
                      type="button"
                      className="wp-gz-del"
                      aria-label={`Subir ${c.titulo} na lista`}
                      title="Subir na lista"
                      disabled={i === 0}
                      onClick={() => reordenar(condicoes, i, -1)}
                    >
                      <ChevronUp size={14} className="wp-ico" />
                    </button>
                    <button
                      type="button"
                      className="wp-gz-del"
                      aria-label={`Descer ${c.titulo} na lista`}
                      title="Descer na lista"
                      disabled={i === condicoes.length - 1}
                      onClick={() => reordenar(condicoes, i, 1)}
                    >
                      <ChevronDown size={14} className="wp-ico" />
                    </button>
                    <button
                      type="button"
                      className="wp-gz-del"
                      aria-label={`Editar ${c.titulo}`}
                      title="Editar"
                      onClick={() => { setOpenForm(null); setEditandoCond(editandoCond === c.id ? null : c.id); }}
                    >
                      <Pencil size={14} className="wp-ico" />
                    </button>
                    <button
                      type="button"
                      className="wp-gz-del"
                      aria-label={`Apagar ${c.titulo}`}
                      title="Apagar"
                      onClick={() => { if (confirm(`Apagar "${c.titulo}"? O time deixa de ver esta tabela.`)) apagarCondicao(c.id); }}
                    >
                      <Trash2 size={14} className="wp-ico" />
                    </button>
                  </span>
                </div>
                {editandoCond === c.id && (
                  <CondicaoForm
                    key={`edit-${c.id}`}
                    brand={brandId}
                    editando={c}
                    onDone={(t) => { setEditandoCond(null); done(t, 'Condição', true, 'corrigida'); }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentos — o repositório que o gestor alimenta sozinho */}
      <div className="wp-gz-block">
        <div className="wp-gz-block-head">
          <span className="wp-gz-block-title"><FolderOpen size={17} className="wp-ico" /> Documentos da marca ({docsDoApp.length - escondidos.length + docsNuvem.length})</span>
          <button className="wp-gz-add" onClick={() => setOpenForm(openForm === 'documento' ? null : 'documento')}>
            <UploadCloud size={15} className="wp-ico" /> Publicar
          </button>
        </div>
        {openForm === 'documento' && (
          <DocumentoForm brand={brandId} onDone={(t) => { done(t, 'Documento'); carregarDocsNuvem(brandId).then(setDocsNuvem); }} />
        )}
        <div className="wp-gz-list">
          {docsNuvem.map((d) => (
            <div key={d.id} className="wp-gz-item">
              <span className="wp-gz-item-name">{d.titulo}</span>
              <span className="wp-gz-item-meta">
                {Math.round(d.bytes / 1024 / 1024 * 10) / 10} MB
                <button
                  type="button"
                  className="wp-gz-del"
                  aria-label={`Apagar ${d.titulo}`}
                  onClick={() => {
                    if (!confirm(`Apagar "${d.titulo}"? O time deixa de ver este documento.`)) return;
                    apagarDocNuvem(d).then(() => setDocsNuvem(docsNuvemDaMarca(brandId)));
                  }}
                >
                  <Trash2 size={14} className="wp-ico" />
                </button>
              </span>
            </div>
          ))}
          {/* Os que vieram no app. Não têm lixeira de propósito: são material
              oficial da montadora e apagar seria perda. Tirar de cartaz é
              reversível — um clique tira do time, outro devolve. */}
          {docsDoApp.map((d) => {
            const off = escondidos.includes(d.id);
            return (
              <div key={d.id} className={`wp-gz-item ${off ? 'wp-gz-item-off' : ''}`}>
                <span className="wp-gz-item-name">
                  {d.titulo}
                  {off && <span className="wp-gz-fora">fora do ar</span>}
                </span>
                <span className="wp-gz-item-meta">
                  {d.paginas} pág.
                  <button
                    type="button"
                    className="wp-gz-del"
                    aria-label={off ? `Voltar ${d.titulo} para o time` : `Tirar ${d.titulo} do ar`}
                    title={off ? 'Voltar para o time' : 'Tirar do ar'}
                    onClick={() => {
                      if (!off && !confirm(`Tirar "${d.titulo}" do ar? O time deixa de ver — dá pra voltar depois.`)) return;
                      alternarOculto(brandId, d.id).catch(() => alert('Não consegui salvar agora. Confira a internet e tente de novo.'));
                    }}
                  >
                    {off ? <Eye size={14} className="wp-ico" /> : <EyeOff size={14} className="wp-ico" />}
                  </button>
                </span>
              </div>
            );
          })}
          {!docsNuvem.length && !docsDoApp.length && (
            <p className="wp-gz-help" style={{ margin: 0 }}>
              Ficha técnica, guia de venda, comunicado da montadora. O time abre pelo app, na tela Documentos.
            </p>
          )}
        </div>
      </div>

      {/* Ofertas — no automotivo NÃO existe: a condição comercial é a tabela que
          a gerência sobe, no bloco acima. Manter os dois criava dois lugares
          pra mesma informação, e o time acabaria olhando o desatualizado. */}
      {!auto && (
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
      )}

      {/* Calendário e Tendências são de CREATOR (Reels, status, caixinha do
          Instagram): fazem sentido pra afiliada e revendedora, não pra
          concessionária — quem posta pela Ramasa é o marketing, não o vendedor. */}
      {!auto && (<>
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
      </>)}
    </div>
  );
}
