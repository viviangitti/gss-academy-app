import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { CATEGORIES, visibleProducts, duracaoLabel, type Category } from './data/products';
import { allProducts, hasImage, getProductImageUrl, ensureImageLoaded, useStore } from './data/store';
import { useBrand } from './BrandContext';
import { isAuto } from './data/brands';
import { useAuth } from './AuthContext';

// Ordem em que as categorias aparecem. Categoria fora desta lista NÃO é
// renderizada — foi o que sumiu com o catálogo da Ramasa quando 'suv' entrou.
const ORDER: Category[] = ['performance', 'capsulas', 'respiratorio', 'cosmeticos', 'perfumaria', 'suv', 'eletrificado'];

export default function Catalog() {
  useStore(); // re-renderiza quando o gestor cadastra produto
  const { brandId } = useBrand();
  const { user } = useAuth();
  // Afiliado só vê a linha GLPEN.
  const catalog = visibleProducts(allProducts().filter((p) => p.brand === brandId), user?.role);
  // carrega as fotos de capa (IndexedDB) pra usar no card
  useEffect(() => {
    catalog.forEach((p) => { if (hasImage(p.id)) ensureImageLoaded(p.id); });
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="wp-catalog">
      <div className="wp-hero">
        <h1 className="wp-hero-title">{isAuto(brandId) ? 'Um carro por vez, em minutos.' : 'Um produto por vez, em minutos.'}</h1>
        <p className="wp-hero-sub">
          {isAuto(brandId) ? 'Conheça o carro, quebre a objeção e mande a condição pro cliente — sem sair daqui.' : 'Aprenda o benefício, quebre a objeção e envie a resposta pronta à cliente — sem sair daqui.'}
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
                      <span className="wp-card-dur"><Play size={10} className="wp-ico" /> {duracaoLabel(p)}</span>
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
