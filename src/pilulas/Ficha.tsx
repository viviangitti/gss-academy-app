import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, ShoppingBag } from 'lucide-react';
import { findProduct, getProductImageUrl, hasImage, ensureImageLoaded, useStore } from './data/store';
import { buyLinkFor, type BuyContext } from './data/products';
import { getAfiliadoCode } from './data/afiliadoCode';
import { useAuth, audienceOf } from './AuthContext';
import { useBrand } from './BrandContext';
import { isAuto } from './data/brands';
import { useEffect } from 'react';

// Ficha do produto como DOCUMENTO — feita pra virar PDF (Imprimir > Salvar em PDF).
// Renderiza dos mesmos dados do app: se a ficha mudar ali, o PDF muda junto.
// Nunca vira arquivo solto desatualizado.
export default function Ficha() {
  useStore();
  const { id } = useParams();
  const { user } = useAuth();
  const { brand } = useBrand();
  const product = id ? findProduct(id) : undefined;

  useEffect(() => {
    if (product && hasImage(product.id)) ensureImageLoaded(product.id);
  }, [product]);

  // O NOME DO ARQUIVO QUE CHEGA NO CLIENTE.
  //
  // Aqui o PDF nasce do "Imprimir > Salvar em PDF" do navegador, e o navegador
  // batiza o arquivo com o título da página. Como o título era o do site, o
  // cliente recebia no WhatsApp um anexo chamado "Eleva — produto que vende na
  // ponta.pdf": o nome da ferramenta interna do vendedor, com slogan e tudo.
  //
  // Trocando o título enquanto esta tela está aberta, o arquivo sai como
  // "Omoda 5 SHS-H — ficha técnica.pdf". Restaura ao sair pra não vazar o nome
  // do carro no título das outras telas.
  const tipoFicha = product && isAuto(product.brand) ? 'ficha técnica' : 'ficha do produto';
  useEffect(() => {
    if (!product) return;
    const anterior = document.title;
    document.title = `${product.name} — ${tipoFicha}`;
    return () => { document.title = anterior; };
  }, [product, tipoFicha]);

  if (!product || !product.ficha?.length) {
    return (
      <div className="wp-empty">
        <p>Este item ainda não tem ficha.</p>
        <Link to="/eleva/catalogo" className="wp-btn wp-btn-outline">Voltar ao catálogo</Link>
      </div>
    );
  }

  const ctx: BuyContext = {
    medium: audienceOf(user) ?? user?.role,
    code: getAfiliadoCode(user?.email),
  };
  const buy = buyLinkFor(product, ctx);
  const capa = getProductImageUrl(product.id) || product.imageUrl;

  return (
    <div className="wp-fk-wrap">
      {/* Barra de ações — some na impressão */}
      <div className="wp-fk-bar">
        <Link to={`/eleva/produto/${product.id}`} className="wp-fk-back">
          <ArrowLeft size={16} className="wp-ico" /> Voltar
        </Link>
        <button className="wp-fk-print" onClick={() => window.print()}>
          <Printer size={16} className="wp-ico" /> Salvar em PDF / Imprimir
        </button>
      </div>
      <p className="wp-fk-hint">
        Toque em <b>Salvar em PDF</b>. No celular, escolha "Imprimir" e depois "Salvar em PDF" — aí é só
        enviar o arquivo pro cliente.
      </p>

      {/* O documento */}
      <article className="wp-fk">
        <header className="wp-fk-head">
          <div>
            <span className="wp-fk-brand">{brand.name}</span>
            <span className="wp-fk-kind">{isAuto(product.brand) ? 'Ficha técnica' : 'Ficha do produto'}</span>
          </div>
          {/* Sem a marca do Eleva. Esta folha vai pro cliente, e quem assina
              ela é a concessionária — não a ferramenta que o vendedor usa por
              dentro. O nome da loja já está aqui do lado esquerdo. */}
        </header>

        <div className="wp-fk-hero">
          {capa && <img src={capa} alt={product.name} className="wp-fk-img" />}
          <div>
            <h1 className="wp-fk-name">{product.name}</h1>
            <p className="wp-fk-tag">{product.tagline}</p>
          </div>
        </div>

        <table className="wp-fk-table">
          <tbody>
            {product.ficha.map((r) => (
              <tr key={r.label}>
                <th>{r.label}</th>
                {/* A linha das VERSÕES sai em caixa alta junto com o nome do
                    carro: é o par que o cliente procura primeiro na folha. */}
                <td className={/vers/i.test(r.label) ? 'wp-fk-versoes' : undefined}>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {product.benefits.length > 0 && (
          <section className="wp-fk-sec">
            <h2>Benefícios</h2>
            <ul className="wp-fk-bens">
              {product.benefits.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </section>
        )}

        {product.forWho.trim() && (
          <section className="wp-fk-sec">
            <h2>Para quem é</h2>
            <p>{product.forWho}</p>
          </section>
        )}

        {product.compliance && (
          <p className="wp-fk-compliance">{product.compliance}</p>
        )}

        <footer className="wp-fk-foot">
          {buy && (
            <a href={buy} target="_blank" rel="noreferrer" className="wp-fk-buy">
              <ShoppingBag size={14} className="wp-ico" /> Comprar no site oficial
            </a>
          )}
          <span className="wp-fk-url">{buy ? buy.split('?')[0] : brand.name}</span>
        </footer>
      </article>
    </div>
  );
}
