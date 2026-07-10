import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { CATEGORIES, type Category } from './data/products';
import { allProducts, hasImage, getProductImageUrl, ensureImageLoaded, useStore } from './data/store';
import { useBrand } from './BrandContext';

const ORDER: Category[] = ['performance', 'capsulas', 'respiratorio', 'cosmeticos', 'perfumaria'];

export default function Catalog() {
  useStore(); // re-renderiza quando o gestor cadastra produto
  const { brandId } = useBrand();
  const catalog = allProducts().filter((p) => p.brand === brandId);
  // carrega as fotos de capa (IndexedDB) pra usar no card
  useEffect(() => {
    catalog.forEach((p) => { if (hasImage(p.id)) ensureImageLoaded(p.id); });
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="wp-catalog">
      <div className="wp-hero">
        <h1 className="wp-hero-title">Cada produto em 30 segundos.</h1>
        <p className="wp-hero-sub">
          Aprenda o benefício, quebre a objeção e envie a resposta pronta à cliente — tudo num app só.
        </p>
      </div>

      {ORDER.map((cat) => {
        const items = catalog.filter((p) => p.category === cat);
        if (!items.length) return null;
        const CatIcon = CATEGORIES[cat].Icon;
        return (
          <section key={cat} className="wp-section">
            <h2 className="wp-section-title">
              <CatIcon size={18} className="wp-section-emoji" />
              {CATEGORIES[cat].label}
            </h2>
            <div className="wp-grid">
              {items.map((p) => {
                const CardIcon = CATEGORIES[p.category].Icon;
                const capa = getProductImageUrl(p.id) || p.imageUrl;
                return (
                  <Link key={p.id} to={`/eleva/produto/${p.id}`} className="wp-card">
                    <div
                      className="wp-card-thumb"
                      style={capa ? undefined : { background: `linear-gradient(150deg, ${p.gradient[0]}, ${p.gradient[1]})` }}
                    >
                      {capa && <img src={capa} alt={p.name} className="wp-card-img" />}
                      <span className="wp-card-dur"><Play size={10} className="wp-ico" /> {p.durationSec}s</span>
                      {!capa && <CardIcon size={44} strokeWidth={1.5} className="wp-card-emoji" />}
                    </div>
                    <div className="wp-card-body">
                      <h3 className="wp-card-name">{p.name}</h3>
                      <p className="wp-card-tag">{p.hook}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
