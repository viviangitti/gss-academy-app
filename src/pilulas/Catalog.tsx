import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Maximize2, X } from 'lucide-react';
import { CATEGORIES, visibleProducts, duracaoLabel, type Category } from './data/products';
import { allProducts, hasImage, getProductImageUrl, ensureImageLoaded, useStore } from './data/store';
import { useBrand } from './BrandContext';
import { ehNovo } from './data/novidades';
import { acessoriosDaMarca, precoLabel, type Acessorio } from './data/acessorios';
import { isAuto } from './data/brands';
import { useAuth } from './AuthContext';

// Ordem em que as categorias aparecem. Categoria fora desta lista NÃO é
// renderizada — foi o que sumiu com o catálogo da Ramasa quando 'suv' entrou.
const ORDER: Category[] = ['performance', 'capsulas', 'respiratorio', 'cosmeticos', 'perfumaria', 'jaecoo', 'omoda', 'acessorio'];

export default function Catalog() {
  useStore(); // re-renderiza quando o gestor cadastra produto
  const { brandId } = useBrand();
  const { user } = useAuth();
  // Afiliado só vê a linha GLPEN.
  const catalog = visibleProducts(allProducts().filter((p) => p.brand === brandId), user?.role);
  const acessorios = acessoriosDaMarca(brandId);
  const [ampliada, setAmpliada] = useState<Acessorio | null>(null);
  // carrega as fotos de capa (IndexedDB) pra usar no card
  useEffect(() => {
    catalog.forEach((p) => { if (hasImage(p.id)) ensureImageLoaded(p.id); });
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="wp-catalog">
      {ampliada && (
        <div className="wp-foto-lb" onClick={() => setAmpliada(null)} role="dialog" aria-label={ampliada.nome}>
          <button type="button" className="wp-cond-lb-x" aria-label="Fechar"><X size={20} className="wp-ico" /></button>
          <img src={ampliada.foto} alt={ampliada.nome} onClick={(e) => e.stopPropagation()} />
          <span className="wp-foto-lb-cap">{ampliada.nome} · {precoLabel(ampliada)}</span>
        </div>
      )}
      <div className="wp-hero">
        <h1 className="wp-hero-title">{isAuto(brandId) ? 'Um carro por vez, em minutos.' : 'Um produto por vez, em minutos.'}</h1>
        <p className="wp-hero-sub">
          {isAuto(brandId) ? 'Conheça o carro, quebre a objeção e mande a condição pro cliente — sem sair daqui.' : 'Aprenda o benefício, quebre a objeção e envie a resposta pronta à cliente — sem sair daqui.'}
        </p>
      </div>

      {ORDER.map((cat) => {
        const items = catalog.filter((p) => p.category === cat);
        // Acessório é a segunda venda da concessionária (engate, película, som,
        // proteção) e some fácil da conversa. A seção aparece mesmo vazia, com o
        // recado de onde cadastrar — senão ninguém descobre que ela existe.
        if (!items.length && !(cat === 'acessorio' && isAuto(brandId) && acessorios.length > 0)) return null;
        const CatIcon = CATEGORIES[cat].Icon;
        return (
          <section key={cat} className="wp-section">
            <h2 className="wp-section-title">
              <CatIcon size={18} className="wp-section-emoji" />
              {CATEGORIES[cat].label}
            </h2>
            {/* Acessório é outro tipo de item: tem código de peça, preço público
                e vale pra vários modelos. Por isso não é um card de carro — é
                uma linha com o benefício na frente e o código a um toque. */}
            {cat === 'acessorio' && acessorios.length > 0 && (
              <div className="wp-acess-lista">
                {acessorios.map((a) => (
                  <div key={a.id} className="wp-acess-linha">
                    {/* A miniatura é botão à parte: tocar nela AMPLIA a foto, tocar
                        no resto abre o acessório. Acessório sem foto ninguém
                        oferece — o vendedor não consegue imaginar a peça. */}
                    {a.foto && (
                      <button
                        type="button"
                        className="wp-acess-mini"
                        onClick={(e) => { e.preventDefault(); setAmpliada(a); }}
                        aria-label={`Ampliar foto de ${a.nome}`}
                      >
                        <img src={a.foto} alt={a.nome} loading="lazy" />
                        <span className="wp-acess-lupa"><Maximize2 size={11} className="wp-ico" /></span>
                      </button>
                    )}
                    <Link to={`/eleva/acessorio/${a.id}`} className="wp-acess-linha-txt">
                      <b>{a.nome}</b>
                      <i>{a.beneficio}</i>
                    </Link>
                    <span className="wp-acess-linha-preco">{precoLabel(a)}</span>
                  </div>
                ))}
              </div>
            )}
            {!items.length && cat !== 'acessorio' && (
              <p className="wp-section-vazio">
                Nada cadastrado nesta seção ainda.
              </p>
            )}
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
                      <h3 className="wp-card-name">
                        {p.name}
                        {ehNovo(p.id) && <span className="wp-novo">novo</span>}
                      </h3>
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
