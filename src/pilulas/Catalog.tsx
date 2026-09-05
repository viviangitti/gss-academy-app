import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Maximize2, X, Wrench } from 'lucide-react';
import { CATEGORIES, visibleProducts, duracaoLabel, type Category } from './data/products';
import { allProducts, hasImage, getProductImageUrl, ensureImageLoaded, useStore } from './data/store';
import { useBrand } from './BrandContext';
import { ehNovo } from './data/novidades';
import { acessoriosDaMarca, acessoriosPorOrigem, ORIGENS, precoLabel, type Acessorio, type OrigemAcessorio } from './data/acessorios';
import { isAuto } from './data/brands';
import { useAuth } from './AuthContext';
import { usePrecosAcessorios } from './data/precosAcessorios';

// Ordem em que as categorias aparecem. Categoria fora desta lista NÃO é
// renderizada — foi o que sumiu com o catálogo da Ramasa quando 'suv' entrou.
const ORDER: Category[] = ['performance', 'capsulas', 'respiratorio', 'cosmeticos', 'perfumaria', 'jaecoo', 'omoda', 'acessorio'];

export default function Catalog() {
  // Re-renderiza quando o preço corrigido chega da nuvem: sem isto a tela
  // fica com o número do catálogo até alguém trocar de aba.
  usePrecosAcessorios();
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
        {/* A copy antiga falava do FORMATO do app ("um carro por vez, em
            minutos") — e tinha vindo traduzida da versão de farmácia. Quem abre
            esta tela não está pensando no formato: está com um cliente que
            passou a noite pesquisando. É esse o problema que a frase precisa
            reconhecer. */}
        <h1 className="wp-hero-title">
          {isAuto(brandId) ? 'O cliente já pesquisou. Você tem a resposta.' : 'Um produto por vez, em minutos.'}
        </h1>
        <p className="wp-hero-sub">
          {isAuto(brandId)
            ? 'Em cada carro: o que destacar, o que responder na objeção e o material pronto pra mandar.'
            : 'Aprenda o benefício, quebre a objeção e envie a resposta pronta à cliente — sem sair daqui.'}
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
            {/* Acessório usa o MESMO card do carro: mesma grade, mesma foto em
                cima, mesmo nome e mesma linha de baixo. O que muda é o selo — no
                carro é a duração do vídeo, aqui é o preço, que é o número que
                importa no fechamento. Formato diferente fazia o acessório
                parecer item de segunda categoria na mesma tela. */}
            {/* Duas listas, e a separação não é organização: é o que evita o
                vendedor prometer "sai hoje" numa peça que vem de pedido, ou
                mandar o cliente colocar película na rua. */}
            {cat === 'acessorio' && acessorios.length > 0 && (['fabrica', 'loja'] as OrigemAcessorio[]).map((origem) => {
              const daOrigem = acessoriosPorOrigem(brandId, origem);
              if (!daOrigem.length) return null;
              return (
              <div key={origem} className="wp-acess-grupo">
                <div className="wp-acess-grupo-cab">
                  <h3 className="wp-acess-grupo-nome">{ORIGENS[origem].label}</h3>
                  {ORIGENS[origem].nota && (
                    <p className="wp-acess-grupo-nota">{ORIGENS[origem].nota}</p>
                  )}
                </div>
                <div className="wp-grid">
                {daOrigem.map((a) => (
                  <Link key={a.id} to={`/eleva/acessorio/${a.id}`} className="wp-card">
                    <div className={`wp-card-thumb wp-card-thumb--acess ${a.foto ? '' : 'wp-card-thumb--semfoto'}`}>
                      {a.foto
                        ? <img src={a.foto} alt={a.nome} className="wp-card-img wp-card-img--acess" loading="lazy" />
                        : <Wrench size={40} strokeWidth={1.5} className="wp-card-emoji" />}
                      <span className="wp-card-dur wp-card-dur--preco">{precoLabel(a)}</span>
                      {/* A lupa amplia sem sair da tela: o vendedor quer conferir
                          a peça, não abrir a ficha inteira. */}
                      {a.foto && (
                        <button
                          type="button"
                          className="wp-card-lupa"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAmpliada(a); }}
                          aria-label={`Ampliar foto de ${a.nome}`}
                        >
                          <Maximize2 size={13} className="wp-ico" />
                        </button>
                      )}
                    </div>
                    <div className="wp-card-body">
                      <h3 className="wp-card-name">{a.nome}</h3>
                      <p className="wp-card-tag">{a.beneficio}</p>
                    </div>
                  </Link>
                ))}
                </div>
              </div>
              );
            })}
            {!items.length && cat !== 'acessorio' && (
              <p className="wp-section-vazio">
                Nada cadastrado nesta seção ainda.
              </p>
            )}
            <div className="wp-grid">
              {items.map((p) => {
                const CardIcon = CATEGORIES[p.category].Icon;
                // A galeria do modelo também serve de capa. Sem isto o carro
                // aparecia como gradiente e ícone no catálogo, enquanto o
                // acessório ao lado tinha foto — e o carro é o item principal.
                // Ordem: capa que o gestor subiu > imageUrl > 1ª foto da galeria.
                const capa = getProductImageUrl(p.id) || p.imageUrl || p.fotos?.[0];
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
