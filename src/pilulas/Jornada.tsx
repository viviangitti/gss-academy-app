// A JORNADA DO ATENDIMENTO — o que escrever agora, e o que mandar depois.
//
// O lead online chega e o vendedor trava em duas coisas: o que responder neste
// minuto e o que mandar em seguida. Esta tela põe as duas na ordem em que o
// atendimento acontece de verdade — do primeiro contato à entrega — e em cada
// etapa entrega a mensagem pronta para copiar e a folha para compartilhar.
//
// Os nomes (cliente, carro, vendedor, loja) ficam no aparelho de quem atende,
// em localStorage. O app não tem por que guardar no banco o nome do cliente de
// ninguém, e quem atende não quer digitar o próprio nome oito vezes por dia.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Copy, Check, Share2, ArrowRight, Route as RotaIcon, Square, CheckSquare } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';
import { getBrand } from './data/brands';
import { lojaLabel } from './data/lojas';
import { CAMPOS, etapasDaMarca, type Etapa } from './data/jornada';
import { acessoriosDaMarca, ORIGENS } from './data/acessorios';
import { mandarPagina } from './data/jornadaPagina';
import { getElevaProfile, updateElevaWhatsapp } from './data/profile';
import { registraUso } from './data/tracking';
import { auth } from '../services/firebase';

const KEY = 'wp_jornada_campos';

export default function Jornada() {
  const { user } = useAuth();
  const { brandId } = useBrand();
  const marca = getBrand(brandId);
  const etapas = etapasDaMarca(brandId);

  const [campos, setCampos] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, string>;
    } catch {
      return {};
    }
  });
  const [aberta, setAberta] = useState<string>(etapas[0]?.id || '');
  const [copiado, setCopiado] = useState('');
  // O que já foi conferido no lembrete da entrega. Vale enquanto a tela está
  // aberta: é uma conferência por cliente, não um estado que deva sobreviver.
  const [conferido, setConferido] = useState<string[]>([]);
  const [gerando, setGerando] = useState('');
  const [aviso, setAviso] = useState('');

  // O contato sai no rodapé da folha. undefined = ainda carregando o perfil.
  const [whats, setWhats] = useState<string | undefined>(undefined);
  const [foto, setFoto] = useState('');
  const [pedindoZap, setPedindoZap] = useState<Etapa | null>(null);
  const [zapNovo, setZapNovo] = useState('');
  const [salvandoZap, setSalvandoZap] = useState(false);

  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      setWhats('');
      return;
    }
    getElevaProfile(uid)
      .then((p) => {
        setWhats(p?.whatsapp || '');
        setFoto(p?.foto || '');
      })
      .catch(() => setWhats(''));
  }, []);

  /**
   * Abre a etapa ancorando no COMEÇO dela.
   *
   * Sem isto a etapa abre e a tela fica no FIM da mensagem: o vendedor vê o
   * último parágrafo e acha que o script começa ali. É a mesma reclamação que
   * o time fez do Tira-dúvida ("deveria ancorar no início e não no final").
   *
   * A conta tem que acontecer DEPOIS que a etapa abriu. Na primeira tentativa
   * eu rolava no mesmo clique, com requestAnimationFrame: o texto ainda não
   * estava na tela, a posição era a do tamanho antigo e a etapa parava 578px
   * acima do topo — pior do que antes. Por isso vive num efeito, que roda com
   * o tamanho final já montado.
   *
   * O desconto de 66px é o cabeçalho fixo de 54px mais um respiro; sem ele o
   * título abre escondido atrás dele. E o `tocou` evita rolar sozinho quando a
   * tela abre com a etapa 1 já aberta — aí o lugar certo é o topo da página.
   */
  const tocou = useRef(false);

  const abrir = (id: string) => {
    const fechando = aberta === id;
    tocou.current = !fechando;
    setAberta(fechando ? '' : id);
  };

  useEffect(() => {
    if (!tocou.current || !aberta) return;
    tocou.current = false;
    const el = document.getElementById(`etapa-${aberta}`);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 66, behavior: 'smooth' });
  }, [aberta]);

  const guardar = (chave: string, valor: string) => {
    const novo = { ...campos, [chave]: valor };
    setCampos(novo);
    try {
      localStorage.setItem(KEY, JSON.stringify(novo));
    } catch {
      /* modo anônimo: vale só nesta sessão */
    }
  };

  // Sem o nome preenchido, o script mostra o lugar dele entre colchetes — é o
  // padrão dos roteiros da casa, e deixa claro o que falta antes de enviar.
  const valor = (chave: string) => {
    const digitado = (campos[chave] || '').trim();
    if (digitado) return digitado;
    if (chave === 'vendedor' && user?.name) return user.name.split(' ')[0];
    // A loja do cadastro ganha do nome do grupo: é ela que o cliente conhece.
    if (chave === 'loja') return lojaLabel(user?.loja) || marca.name.split('·')[0].trim();
    const campo = CAMPOS.find((c) => c.chave === chave);
    return `[${campo ? campo.rotulo.toLowerCase() : chave}]`;
  };

  const preencher = (t: string) => t.replace(/\{(\w+)\}/g, (_, c: string) => valor(c));

  // Os acessórios vêm da lista viva — com o que a gerência corrigiu e sem o
  // que ela tirou do ar. Nome só: preço não vai em material de cliente.
  const acessorios = etapas.length ? acessoriosDaMarca(brandId) : [];

  const blocosDoOnePage = (e: Etapa) => {
    if (e.onePage.fonte === 'acessorios') {
      return (['fabrica', 'loja'] as const)
        .map((o) => ({
          titulo: ORIGENS[o].label,
          itens: acessorios.filter((a) => a.origem === o).slice(0, 5).map((a) => a.nome),
        }))
        .filter((b) => b.itens.length);
    }
    return (e.onePage.blocos || []).map((b) => ({ titulo: b.titulo, itens: b.itens.map(preencher) }));
  };

  const copiar = (texto: string, marcador: string, etapaId: string) => {
    navigator.clipboard?.writeText(texto).then(
      () => {
        setCopiado(marcador);
        setTimeout(() => setCopiado(''), 1600);
      },
      () => {},
    );
    registraUso('jornada_script', etapaId);
  };

  const mandar = async (e: Etapa, contato?: string | null) => {
    if (gerando) return;
    if (contato === undefined && whats === '') {
      setZapNovo('');
      setPedindoZap(e);
      return;
    }
    const zap = contato === null ? '' : (contato ?? whats ?? '');
    const op = e.onePage;
    setGerando(e.id);
    setAviso('');
    try {
      const r = await mandarPagina(
        {
          titulo: op.titulo,
          linha: preencher(op.linha),
          blocos: blocosDoOnePage(e),
          rodape: op.rodape ? preencher(op.rodape) : undefined,
          marca: marca.name,
          loja: valor('loja'),
          accent: marca.accent,
          accentDeep: marca.accentDeep,
          vendedor: valor('vendedor'),
          whatsapp: zap,
          fotoVendedor: foto,
        },
        `${op.titulo} — ${preencher(op.linha)}`,
      );
      registraUso('jornada_onepage', e.id);
      if (r === 'baixou') setAviso('PDF baixado: está na sua pasta de downloads.');
    } catch {
      setAviso('Não consegui montar a folha agora. Tenta de novo em instantes.');
    } finally {
      setGerando('');
    }
  };

  if (!etapas.length) {
    return (
      <div className="wp-jn">
        <Link to="/eleva" className="wp-news-back">
          <ChevronLeft size={16} className="wp-ico" /> Voltar
        </Link>
        <p className="wp-news-msg">A jornada do atendimento existe hoje só para concessionária.</p>
      </div>
    );
  }

  return (
    <div className="wp-jn">
      <Link to="/eleva" className="wp-news-back">
        <ChevronLeft size={16} className="wp-ico" /> Voltar
      </Link>

      <header className="wp-news-hero">
        <span className="wp-news-hero-icon">
          <RotaIcon size={20} />
        </span>
        <div>
          <h1 className="wp-news-title">Jornada</h1>
          <p className="wp-news-sub">
            Do primeiro contato à entrega. Em cada etapa, a mensagem pronta para copiar e a folha para mandar ao cliente.
          </p>
        </div>
      </header>

      <section className="wp-jn-campos">
        <p className="wp-jn-campos-tit">Preencha uma vez — entra em todos os scripts</p>
        <div className="wp-jn-grade">
          {CAMPOS.map((c) => (
            <label className="wp-jn-campo" key={c.chave}>
              <span>{c.rotulo}</span>
              <input
                value={campos[c.chave] || ''}
                onChange={(ev) => guardar(c.chave, ev.target.value)}
                placeholder={c.chave === 'vendedor' || c.chave === 'loja' ? valor(c.chave) : `ex.: ${c.exemplo}`}
                aria-label={c.rotulo}
              />
            </label>
          ))}
        </div>
      </section>

      {aviso && <p className="wp-jn-aviso">{aviso}</p>}

      <ol className="wp-jn-linha">
        {etapas.map((e) => {
          const abertaAgora = aberta === e.id;
          const script = preencher(e.script);
          const retomada = preencher(e.semResposta);
          return (
            <li className={`wp-jn-etapa ${abertaAgora ? 'open' : ''}`} key={e.id} id={`etapa-${e.id}`}>
              <span className="wp-jn-num">{e.numero}</span>
              <button type="button" className="wp-jn-cab" onClick={() => abrir(e.id)}>
                <span className="wp-jn-cab-txt">
                  <b>{e.titulo}</b>
                  <i>{e.tempo}</i>
                </span>
                <ChevronDown size={18} className={`wp-jn-seta ${abertaAgora ? 'open' : ''}`} />
              </button>

              {abertaAgora && (
                <div className="wp-jn-corpo">
                  <p className="wp-jn-obj">{e.objetivo}</p>

                  <div className="wp-jn-bloco">
                    <p className="wp-jn-rotulo">Mensagem pronta</p>
                    <pre className="wp-jn-script">{script}</pre>
                    <button type="button" className="wp-jn-copiar" onClick={() => copiar(script, `${e.id}:script`, e.id)}>
                      {copiado === `${e.id}:script` ? (
                        <>
                          <Check size={15} className="wp-ico" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={15} className="wp-ico" /> Copiar mensagem
                        </>
                      )}
                    </button>
                  </div>

                  <div className="wp-jn-bloco">
                    <p className="wp-jn-rotulo">One page para o cliente</p>
                    <p className="wp-jn-op-tit">{e.onePage.titulo}</p>
                    <p className="wp-jn-op-linha">{preencher(e.onePage.linha)}</p>
                    {e.onePage.tipo === 'proprio' ? (
                      <button type="button" className="wp-jn-mandar" disabled={gerando === e.id} onClick={() => mandar(e)}>
                        {gerando === e.id ? (
                          'Montando a folha…'
                        ) : (
                          <>
                            <Share2 size={15} className="wp-ico" /> Compartilhar o one page
                          </>
                        )}
                      </button>
                    ) : (
                      <>
                        <p className="wp-jn-como">{e.onePage.leva?.comoFazer}</p>
                        <Link className="wp-jn-mandar wp-jn-mandar--leva" to={e.onePage.leva?.rota || '/eleva'}>
                          {e.onePage.leva?.botao} <ArrowRight size={15} className="wp-ico" />
                        </Link>
                      </>
                    )}
                  </div>

                  {e.atalhos === 'acessorios' && acessorios.length > 0 && (
                    <div className="wp-jn-bloco">
                      <p className="wp-jn-rotulo">Abrir o acessório no app</p>
                      <p className="wp-jn-op-linha">
                        Cada um abre com foto, o que resolve pro cliente e como oferecer — e dá pra mandar de lá mesmo.
                      </p>
                      <div className="wp-jn-chips">
                        {acessorios.slice(0, 12).map((a) => (
                          <Link className="wp-jn-chip" key={a.id} to={`/eleva/acessorio/${a.id}`}>
                            {a.nome}
                          </Link>
                        ))}
                      </div>
                      {acessorios.length > 12 && (
                        <Link className="wp-jn-mandar wp-jn-mandar--leva" to="/eleva/catalogo">
                          Ver os {acessorios.length} acessórios <ArrowRight size={15} className="wp-ico" />
                        </Link>
                      )}
                    </div>
                  )}

                  {e.lembrete && (
                    <div className="wp-jn-lembrete">
                      <p className="wp-jn-rotulo">{e.lembrete.titulo} · só para você</p>
                      <ul className="wp-jn-check">
                        {e.lembrete.itens.map((it, i) => {
                          const chave = `${e.id}:${i}`;
                          const marcado = conferido.includes(chave);
                          return (
                            <li key={chave}>
                              <button
                                type="button"
                                className={`wp-jn-check-item ${marcado ? 'ok' : ''}`}
                                onClick={() =>
                                  setConferido((c) => (marcado ? c.filter((x) => x !== chave) : [...c, chave]))
                                }
                              >
                                {marcado ? <CheckSquare size={17} className="wp-ico" /> : <Square size={17} className="wp-ico" />}
                                <span>{it}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      {e.lembrete.nota && <p className="wp-jn-lembrete-nota">{e.lembrete.nota}</p>}
                    </div>
                  )}

                  <p className="wp-jn-por">
                    <b>Por que funciona.</b> {e.porQue}
                  </p>

                  <div className="wp-jn-retomada">
                    <p className="wp-jn-rotulo">Se ele não responder</p>
                    <pre className="wp-jn-script">{retomada}</pre>
                    <button
                      type="button"
                      className="wp-jn-copiar"
                      onClick={() => copiar(retomada, `${e.id}:retomada`, `${e.id}|retomada`)}
                    >
                      {copiado === `${e.id}:retomada` ? (
                        <>
                          <Check size={15} className="wp-ico" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={15} className="wp-ico" /> Copiar retomada
                        </>
                      )}
                    </button>
                  </div>

                  <p className="wp-jn-sinal">Pode avançar quando: {e.sinal}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <p className="wp-jn-rodape">
        Valores, taxas e prazos não entram em script nem em folha: quem fala número é você, com a condição vigente aberta.
      </p>

      {pedindoZap && (
        <div className="wp-zap-lb" role="dialog" aria-label="Falta o seu WhatsApp">
          <div className="wp-zap-folha" onClick={(ev) => ev.stopPropagation()}>
            <span className="wp-zap-puxador" />
            <b className="wp-zap-tit">Falta o seu WhatsApp</b>
            <p className="wp-zap-txt">
              A folha sai com o seu contato no rodapé. Sem ele, o cliente encaminha pra família e ninguém sabe pra quem
              responder.
            </p>
            <input
              className="wp-zap-campo"
              type="tel"
              inputMode="tel"
              autoFocus
              value={zapNovo}
              onChange={(ev) => setZapNovo(ev.target.value)}
              placeholder="(11) 9 0000-0000"
              aria-label="Seu WhatsApp"
            />
            <button
              type="button"
              className="wp-zap-ok"
              disabled={zapNovo.replace(/\D/g, '').length < 10 || salvandoZap}
              onClick={async () => {
                const uid = auth?.currentUser?.uid;
                const numero = zapNovo.trim();
                const etapa = pedindoZap;
                setSalvandoZap(true);
                if (uid) await updateElevaWhatsapp(uid, numero).catch(() => {});
                setWhats(numero);
                setSalvandoZap(false);
                setPedindoZap(null);
                if (etapa) mandar(etapa, numero);
              }}
            >
              {salvandoZap ? 'Salvando…' : 'Salvar e mandar'}
            </button>
            <button
              type="button"
              className="wp-zap-pular"
              onClick={() => {
                const etapa = pedindoZap;
                setPedindoZap(null);
                if (etapa) mandar(etapa, null);
              }}
            >
              Mandar sem o meu contato
            </button>
            <p className="wp-zap-nota">Preenche uma vez e vale pra todas as folhas.</p>
          </div>
        </div>
      )}
    </div>
  );
}
