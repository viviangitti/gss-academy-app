import { useEffect, useState } from 'react';
import { Tag, ArrowUpRight, FileText, Lock, Maximize2, X } from 'lucide-react';
import { useBrand } from './BrandContext';
import { isAuto } from './data/brands';
import { useAuth } from './AuthContext';
import { allOffers, useStore } from './data/store';
import { carregarCondicoes, condicoesDaMarca, useCondicoes, type Condicao } from './data/condicoes';

function shareOffer(text: string) {
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

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
  const offers = allOffers().filter(
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
          <p className="wp-cond-aviso">
            <Lock size={13} className="wp-ico" />
            Material interno. Não encaminhe a tabela ao cliente — passe só o número que vale para ele.
          </p>
          {condicoes.map((c) => (
            <div key={c.id} className="wp-cond-card">
              <div className="wp-cond-head">
                <h3 className="wp-cond-title">{c.titulo}</h3>
                <span className="wp-cond-val">{c.validade}</span>
              </div>
              <button type="button" className="wp-cond-thumb" onClick={() => setAberta(c)}>
                {c.tipo === 'imagem' ? (
                  <img src={c.arquivo} alt={c.titulo} />
                ) : (
                  <span className="wp-cond-pdf"><FileText size={26} className="wp-ico" /> {c.nomeArquivo}</span>
                )}
                <span className="wp-cond-zoom"><Maximize2 size={14} className="wp-ico" /> Abrir</span>
              </button>
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
