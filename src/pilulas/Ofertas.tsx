import { Tag, ArrowUpRight } from 'lucide-react';
import { useBrand } from './BrandContext';
import { useAuth } from './AuthContext';
import { allOffers, useStore } from './data/store';

function shareOffer(text: string) {
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export default function Ofertas() {
  useStore(); // re-renderiza quando o gestor cria oferta
  const { brandId } = useBrand();
  const { user } = useAuth();
  const seg = user?.segment;
  // Oferta segmentada só aparece pro canal certo; sem etiqueta, vê tudo.
  const offers = allOffers().filter(
    (o) => o.brand === brandId && (!o.segment || o.segment === 'todos' || !seg || o.segment === seg)
  );
  return (
    <div className="wp-ofertas">
      <div className="wp-of-hero">
        <h1 className="wp-of-title"><Tag size={19} className="wp-ico" /> Ofertas da semana</h1>
        <p className="wp-of-sub">As condições de agora, prontas pra você mandar pra cliente.</p>
      </div>

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
              <ArrowUpRight size={15} className="wp-ico" /> Mandar oferta pra cliente
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
