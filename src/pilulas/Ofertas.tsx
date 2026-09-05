import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowUpRight, FileText, Lock, Maximize2, X, Car, Wrench, Megaphone, Pencil, Trash2, CalendarClock, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { useBrand } from './BrandContext';
import { isAuto } from './data/brands';
import { useAuth } from './AuthContext';
import ArteCondicao, { dadosDaArte, type DadosArte } from './ArteCondicao';
import { allOffers, useStore } from './data/store';
import { carregarCondicoes, condicoesDaMarca, abrirArquivo, apagarCondicao, apagarVarias, atualizarVarias, estaVencida, useCondicoes, type Condicao } from './data/condicoes';

function shareOffer(text: string) {
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

// NADA daqui vai pro cliente — nem a tabela da montadora, nem a arte de kit.
// Existiu um botão de encaminhar e uma caixinha "esta peça pode ir para o
// cliente", pensados pra arte de campanha. Só que toda peça que passa por aqui
// tem número: rebate da rede na carta comercial, "de/por" no kit de acessório.
// Preço muda e a peça encaminhada não muda junto. Quem fala número com o
// cliente é o vendedor, na hora, olhando a condição vigente.
// As duas portas da tela, na ordem em que a venda acontece.
//
// Por que porta e não seção: no showroom o vendedor abre Condições com o
// cliente do lado, e precisa chegar na folha em dois toques. Empilhadas numa
// tela só, as sete folhas da carta empurram os kits pra baixo e ele rola o mês
// inteiro pra achar a película. Aqui ele escolhe o assunto e vê só ele.
const GRUPOS = [
  { chave: 'veiculo' as const, titulo: 'Veículos', Icone: Car,
    sub: 'Taxa, entrada, bônus e trade-in. É o que entra na negociação do carro.' },
  { chave: 'acessorio' as const, titulo: 'Acessórios', Icone: Wrench,
    sub: 'Kits, proteção, som e película. Entram depois do sim, na mesma visita.' },
  { chave: 'campanha' as const, titulo: 'Campanhas da casa', Icone: Megaphone,
    sub: 'Meta, premiação e ação interna do mês. Não é conversa com cliente — é o que você disputa.' },
];

function quando(ts: number): string {
  const dias = Math.floor((Date.now() - ts) / 86400000);
  if (dias <= 0) return 'publicada hoje';
  if (dias === 1) return 'publicada ontem';
  return `publicada há ${dias} dias`;
}

// A tabela aberta em tela cheia. No showroom o vendedor precisa dar zoom nos
// números — por isso a imagem abre grande e o PDF vai pro visualizador nativo.
function Lightbox({ c, onFechar }: { c: Condicao; onFechar: () => void }) {
  return (
    <div className="wp-cond-lb" onClick={onFechar} role="dialog" aria-label={c.titulo}>
      <button type="button" className="wp-cond-lb-x" onClick={onFechar} aria-label="Fechar">
        <X size={20} className="wp-ico" />
      </button>
      {c.tipo === 'imagem' ? (
        <img src={c.arquivo} alt={c.titulo} onClick={(e) => e.stopPropagation()} />
      ) : (
        <iframe src={c.arquivo} title={c.titulo} onClick={(e) => e.stopPropagation()} />
      )}
    </div>
  );
}

/**
 * AS AÇÕES DA SEÇÃO INTEIRA.
 *
 * O lápis de cada card resolve corrigir UMA condição. O que não tinha jeito era
 * a seção: a carta comercial vira sete folhas, e no fim do mês eram sete
 * toques na lixeira, ou sete edições de data, uma por uma, no celular. Quem faz
 * isso uma vez faz; na segunda, deixa a carta velha no ar.
 *
 * Fica fechada por padrão e só aparece pra gestor: é ação em lote, não é coisa
 * pra estar no caminho de quem só quer consultar.
 */
function AcoesDaSecao({ titulo, itens }: { titulo: string; itens: Condicao[] }) {
  const [aberta, setAberta] = useState(false);
  const [data, setData] = useState('');
  const [ocupado, setOcupado] = useState('');
  const [aviso, setAviso] = useState('');
  const ids = itens.map((c) => c.id);
  const n = ids.length;
  if (!n) return null;

  const mudarValidade = async () => {
    if (!data || ocupado) return;
    setOcupado('data'); setAviso('');
    const feitas = await atualizarVarias(ids, {
      venceEm: data,
      validade: `Válida até ${data.split('-').reverse().join('/')}`,
    });
    setOcupado('');
    // Conta o que SUBIU, não o que mudou na tela. Se a nuvem recusar, a tela
    // local já mudou e diria "pronto" mentindo — na próxima abertura o dado da
    // nuvem volta por cima e a gerência acha que o app desfez sozinho.
    setAviso(feitas === n
      ? `Pronto: ${n} com validade até ${data.split('-').reverse().join('/')}.`
      : feitas === 0
        ? 'Não consegui salvar na nuvem. Confira a internet e tente de novo.'
        : `${feitas} de ${n} salvas. Tente de novo para as que faltaram.`);
  };

  const apagarTudo = async () => {
    if (ocupado) return;
    const ok = confirm(
      `Apagar TODAS as ${n} condições de ${titulo}?\n\n`
      + `As folhas vão junto e não dá pra desfazer.\n\n`
      + `Se é porque venceram, use a validade acima — elas somem da tela do time e ficam guardadas no Painel.`,
    );
    if (!ok) return;
    setOcupado('apagar'); setAviso('');
    const feitas = await apagarVarias(ids);
    setOcupado('');
    setAviso(feitas === n
      ? `${n} apagadas.`
      : feitas === 0
        ? 'Não consegui apagar na nuvem. Confira a internet e tente de novo.'
        : `${feitas} de ${n} apagadas. Tente de novo para as que faltaram.`);
  };

  return (
    <div className="wp-cond-secao">
      <button type="button" className="wp-cond-secao-abre" onClick={() => setAberta((o) => !o)}>
        {aberta ? '–' : '+'} Mexer nas {n} de uma vez
      </button>
      {aberta && (
        <div className="wp-cond-secao-corpo">
          <label className="wp-cond-secao-rot"><CalendarClock size={13} className="wp-ico" /> Valem até quando</label>
          <div className="wp-cond-secao-linha">
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            <button type="button" disabled={!data || !!ocupado} onClick={mudarValidade}>
              {ocupado === 'data' ? 'Aplicando…' : `Aplicar às ${n}`}
            </button>
          </div>
          <p className="wp-cond-secao-dica">
            Depois dessa data elas saem sozinhas da tela do time e ficam guardadas no Painel,
            marcadas como vencidas. É o caminho para trocar a carta do mês.
          </p>
          <button type="button" className="wp-cond-secao-apagar" disabled={!!ocupado} onClick={apagarTudo}>
            <Trash2 size={13} className="wp-ico" /> {ocupado === 'apagar' ? 'Apagando…' : `Apagar as ${n} de ${titulo}`}
          </button>
          {aviso && <p className="wp-cond-secao-aviso">{aviso}</p>}
        </div>
      )}
    </div>
  );
}

/**
 * A folha da condição. A lista chega sem os arquivos — são megabytes, e baixar
 * treze de uma vez pra mostrar miniatura era o que travava a tela no 4G. Cada
 * card baixa a sua quando aparece, e o botão já funciona antes de terminar.
 */
function Folha({ c, onAbrir }: { c: Condicao; onAbrir: (c: Condicao) => void }) {
  const [url, setUrl] = useState(c.arquivo || '');
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (url) return;
    let vivo = true;
    abrirArquivo(c).then((u) => {
      if (!vivo) return;
      if (u) setUrl(u); else setErro(true);
    });
    return () => { vivo = false; };
  }, [c, url]);

  const abrir = () => { if (url) onAbrir({ ...c, arquivo: url }); };

  return (
    <button type="button" className="wp-cond-thumb" onClick={abrir} disabled={!url}>
      {c.tipo === 'imagem' && url ? (
        <img src={url} alt={c.titulo} />
      ) : (
        <span className="wp-cond-pdf">
          <FileText size={26} className="wp-ico" />
          {erro ? 'sem internet para abrir a folha' : url ? c.nomeArquivo : 'carregando a folha…'}
        </span>
      )}
      <span className="wp-cond-zoom"><Maximize2 size={14} className="wp-ico" /> Abrir</span>
    </button>
  );
}

export default function Ofertas() {
  useStore(); // re-renderiza quando o gestor cria oferta
  // Qual arte está aberta. Uma por vez — é uma peça pra mandar, não uma galeria.
  const [arte, setArte] = useState<DadosArte | null>(null);
  useCondicoes();
  const { brandId } = useBrand();
  const { user } = useAuth();
  const auto = isAuto(brandId);
  const [aberta, setAberta] = useState<Condicao | null>(null);
  const [grupo, setGrupo] = useState<'veiculo' | 'acessorio' | 'campanha' | null>(null);

  useEffect(() => { carregarCondicoes(brandId); }, [brandId]);

  const seg = user?.segment;
  // Oferta segmentada só aparece pro canal certo; sem etiqueta, vê tudo.
  // No automotivo não há cards de oferta: a condição é a tabela que a gerência
  // publica. Dois lugares pra mesma informação garante que alguém vai olhar o
  // desatualizado e prometer o que não vale mais.
  const offers = auto
    ? []
    : allOffers().filter(
        (o) => o.brand === brandId && (!o.segment || o.segment === 'todos' || !seg || o.segment === seg)
      );
  // Vencida NÃO aparece pro vendedor. A carta vira no dia 2 e a nova chega no
  // primeiro dia útil; no meio disso, tabela velha na tela é promessa que a
  // loja não cumpre. Ela continua na lista do Painel, marcada, pra gerência
  // trocar — some da ponta, não do controle.
  const condicoes = condicoesDaMarca(brandId).filter((c) => !estaVencida(c));

  return (
    <div className="wp-ofertas">
      {arte && <ArteCondicao dados={arte} onFechar={() => setArte(null)} />}
      <div className="wp-of-hero">
        <h1 className="wp-of-title"><Tag size={19} className="wp-ico" /> {auto ? 'Condições comerciais' : 'Ofertas da semana'}</h1>
        <p className="wp-of-sub">
          {auto
            ? 'A tabela vigente, do jeito que a gerência publicou. Confira a validade antes de falar número com o cliente.'
            : 'As condições vigentes, prontas para você enviar à cliente.'}
        </p>
      </div>

      {/* ---- Tabelas e campanhas (print/PDF publicado pela gerência) ---- */}
      {auto && condicoes.length > 0 && !grupo && (
        <div className="wp-cond-portas">
          {GRUPOS.map(({ chave, titulo, sub, Icone }) => {
            const n = condicoes.filter((c) => (c.categoria || 'veiculo') === chave).length;
            return (
              <button key={chave} type="button" className="wp-cond-porta" onClick={() => setGrupo(chave)}>
                <span className="wp-cond-porta-ic"><Icone size={22} className="wp-ico" /></span>
                <span className="wp-cond-porta-txt">
                  <b>{titulo} <i>{n}</i></b>
                  <small>{sub}</small>
                </span>
                <ChevronRight size={18} className="wp-ico wp-cond-porta-seta" />
              </button>
            );
          })}
        </div>
      )}

      {auto && grupo && (() => {
        const g = GRUPOS.find((x) => x.chave === grupo)!;
        const doGrupo = condicoes.filter((c) => (c.categoria || 'veiculo') === grupo);
        return (
          <>
            <button type="button" className="wp-cond-voltar" onClick={() => setGrupo(null)}>
              <ChevronLeft size={16} className="wp-ico" /> Condições
            </button>
            <div className="wp-cond-grupo-head">
              <h2 className="wp-cond-grupo-tit"><g.Icone size={18} className="wp-ico" /> {g.titulo} <span>{doGrupo.length}</span></h2>
              <p className="wp-cond-grupo-sub">{g.sub}</p>
            </div>
            {user?.role === 'gestor' && <AcoesDaSecao titulo={g.titulo} itens={doGrupo} />}
            {!doGrupo.length && (
              <p className="wp-cond-vazio">
                Nada publicado em {g.titulo.toLowerCase()} ainda. A gerência sobe pelo Painel e aparece aqui na hora.
              </p>
            )}
            <div className="wp-cond-list">
              {doGrupo.map((c) => (
                <div key={c.id} className="wp-cond-card">
                  <div className="wp-cond-head">
                    <h3 className="wp-cond-title">{c.titulo}</h3>
                    <span className="wp-cond-val">{c.validade}</span>
                    <span className="wp-cond-selo interno">
                      <Lock size={12} className="wp-ico" /> Interno — passe só o número, não a folha
                    </span>
                  </div>
                  <Folha c={c} onAbrir={setAberta} />
                  {c.observacao && <p className="wp-cond-obs">{c.observacao}</p>}
                  {/* ARTE PRO CLIENTE. Só aparece quando a gerência escreveu a
                      chamada aprovada — sem ela não há o que anunciar, e o
                      vendedor não decide isso sozinho. A folha continua sem
                      botão de enviar: ela é interna e segue interna. */}
                  {dadosDaArte(c, brandId) && (
                    <button
                      type="button"
                      className="wp-cond-arte"
                      onClick={() => setArte(dadosDaArte(c, brandId))}
                    >
                      <ImageIcon size={14} className="wp-ico" /> Arte para o cliente
                    </button>
                  )}
                  <span className="wp-cond-rodape">
                    <span className="wp-cond-quando">{quando(c.criadoEm)}</span>
                    {/* Quem publica vê o erro AQUI, na tela do time — não no
                        Painel. Sem este atalho ele decorava o caminho
                        (Painel › Conteúdo › rolar até a condição) ou desistia. */}
                    {user?.role === 'gestor' && (
                      <span className="wp-cond-acoes">
                        <Link className="wp-cond-editar" to={`/eleva/gestor?editar=${c.id}`}>
                          <Pencil size={13} className="wp-ico" /> Editar
                        </Link>
                        {/* Apagar leva a FOLHA junto e não tem volta. Por isso a
                            confirmação diz o que se perde, e não só "tem
                            certeza?" — aqui é uma tela de consulta, onde a
                            pessoa está com o polegar passando. */}
                        <button
                          type="button"
                          className="wp-cond-editar wp-cond-remover"
                          onClick={() => {
                            if (!confirm(`Apagar "${c.titulo}"?\n\nO time deixa de ver, e a folha é apagada junto — não dá pra desfazer.\n\nSe é só porque venceu, use Editar e mude a data.`)) return;
                            apagarCondicao(c.id);
                          }}
                        >
                          <Trash2 size={13} className="wp-ico" /> Apagar
                        </button>
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </>
        );
      })()}

      {/* Marca que não é automotiva não tem as duas portas: cai na lista direta. */}
      {!auto && condicoes.length > 0 && (
        <div className="wp-cond-list">
          {condicoes.map((c) => (
            <div key={c.id} className="wp-cond-card">
              <div className="wp-cond-head">
                <h3 className="wp-cond-title">{c.titulo}</h3>
                <span className="wp-cond-val">{c.validade}</span>
                <span className="wp-cond-selo interno">
                  <Lock size={12} className="wp-ico" /> Interno — passe só o número, não a folha
                </span>
              </div>
              <Folha c={c} onAbrir={setAberta} />
              {c.observacao && <p className="wp-cond-obs">{c.observacao}</p>}
              <span className="wp-cond-quando">{quando(c.criadoEm)}</span>
            </div>
          ))}
        </div>
      )}

      {auto && condicoes.length === 0 && (
        <p className="wp-cond-vazio">
          Nenhuma tabela publicada ainda. A gerência sobe o print ou o PDF da campanha pelo Painel,
          e ela aparece aqui na hora.
        </p>
      )}

      <div className="wp-of-list">
        {offers.map((o, i) => (
          <div key={i} className="wp-of-card">
            <div className="wp-of-head">
              <span className={`wp-of-tag k-${o.tagKind}`}>{o.tag}</span>
              <span className="wp-of-until">{o.until}</span>
            </div>
            <h3 className="wp-of-name">{o.title}</h3>
            <p className="wp-of-desc">{o.desc}</p>
            <button className="wp-of-share" onClick={() => shareOffer(o.share)}>
              <ArrowUpRight size={15} className="wp-ico" /> {auto ? 'Mandar para o cliente' : 'Mandar oferta à cliente'}
            </button>
          </div>
        ))}
      </div>

      {aberta && <Lightbox c={aberta} onFechar={() => setAberta(null)} />}
    </div>
  );
}
