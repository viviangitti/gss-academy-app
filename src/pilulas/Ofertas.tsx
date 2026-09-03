import { useEffect, useState } from 'react';
import { Tag, ArrowUpRight, FileText, Lock, Maximize2, X } from 'lucide-react';
import { useBrand } from './BrandContext';
import { isAuto } from './data/brands';
import { useAuth } from './AuthContext';
import { allOffers, useStore } from './data/store';
import { carregarCondicoes, condicoesDaMarca, abrirArquivo, useCondicoes, type Condicao } from './data/condicoes';

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
  useCondicoes();
  const { brandId } = useBrand();
  const { user } = useAuth();
  const auto = isAuto(brandId);
  const [aberta, setAberta] = useState<Condicao | null>(null);

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
  const condicoes = condicoesDaMarca(brandId);

  return (
    <div className="wp-ofertas">
      <div className="wp-of-hero">
        <h1 className="wp-of-title"><Tag size={19} className="wp-ico" /> {auto ? 'Condições comerciais' : 'Ofertas da semana'}</h1>
        <p className="wp-of-sub">
          {auto
            ? 'A tabela vigente, do jeito que a gerência publicou. Confira a validade antes de falar número com o cliente.'
            : 'As condições vigentes, prontas para você enviar à cliente.'}
        </p>
      </div>

      {/* ---- Tabelas e campanhas (print/PDF publicado pela gerência) ---- */}
      {condicoes.length > 0 && (
        <div className="wp-cond-list">
          {condicoes.map((c) => (
            <div key={c.id} className="wp-cond-card">
              <div className="wp-cond-head">
                <h3 className="wp-cond-title">{c.titulo}</h3>
                <span className="wp-cond-val">{c.validade}</span>
              </div>
              <span className="wp-cond-selo interno">
                <Lock size={12} className="wp-ico" /> Interno — passe só o número, não a folha
              </span>
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
