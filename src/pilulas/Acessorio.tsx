import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Package, Copy, Check, Car } from 'lucide-react';
import { useState } from 'react';
import { ACESSORIOS, precoLabel } from './data/acessorios';
import { findProduct } from './data/store';

// A tela do ACESSÓRIO. Antes o card levava pro carro compatível — atalho meu
// que enganava: a pessoa clicava em "estribo iluminado" e caía no Jaecoo 7.
//
// Aqui o conteúdo é o do acessório mesmo, na ordem em que ele se vende: o que
// resolve pro cliente, como oferecer, em que carros entra e o código pra pedir.
export default function Acessorio() {
  const { id } = useParams();
  const a = ACESSORIOS.find((x) => x.id === id);
  const [copiado, setCopiado] = useState('');

  if (!a) {
    return (
      <div className="wp-empty">
        <p>Não encontrei este acessório.</p>
        <Link to="/eleva/catalogo" className="wp-empty-link">Ver o catálogo</Link>
      </div>
    );
  }

  const copiar = (pn: string) => {
    navigator.clipboard?.writeText(pn).then(
      () => { setCopiado(pn); setTimeout(() => setCopiado(''), 1800); },
      () => {}
    );
  };

  const carros = a.aplicaEm.map((pid) => findProduct(pid)).filter(Boolean);

  return (
    <div className="wp-acp">
      <Link to="/eleva/catalogo" className="wp-news-back">
        <ChevronLeft size={16} className="wp-ico" /> Voltar
      </Link>

      <div className="wp-acp-hero">
        <span className="wp-acp-tag"><Package size={13} className="wp-ico" /> Acessório original</span>
        <h1 className="wp-acp-nome">{a.nome}</h1>
        <span className="wp-acp-preco">{precoLabel(a)}</span>
        {a.preco && <span className="wp-acp-preco-obs">preço público sugerido</span>}
      </div>

      <div className="wp-block">
        <span className="wp-block-label">O que resolve pro cliente</span>
        <p className="wp-acp-benef">{a.beneficio}</p>
      </div>

      <div className="wp-block">
        <span className="wp-block-label">Como oferecer</span>
        <p className="wp-acp-texto">{a.comoOferecer}</p>
        {a.observacao && <p className="wp-acp-obs">{a.observacao}</p>}
      </div>

      {carros.length > 0 && (
        <div className="wp-block">
          <span className="wp-block-label"><Car size={14} className="wp-ico" /> Entra nestes carros</span>
          <div className="wp-acp-carros">
            {carros.map((c) => (
              <Link key={c!.id} to={`/eleva/produto/${c!.id}`} className="wp-acp-carro">
                {c!.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="wp-block">
        <span className="wp-block-label">Código para pedir</span>
        <p className="wp-acp-texto">Toque para copiar. É o que você usa no sistema.</p>
        <ul className="wp-acess-pns">
          {a.codigos.map((c) => (
            <li key={c.pn}>
              <i>{c.modelo}</i>
              <button type="button" className="wp-acp-pn" onClick={() => copiar(c.pn)}>
                <code>{c.pn}</code>
                {copiado === c.pn ? <Check size={13} className="wp-ico" /> : <Copy size={13} className="wp-ico" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="wp-news-foot">
        Preço público sugerido pela montadora. Confirme o valor e a disponibilidade vigentes
        com a gerência antes de fechar com o cliente.
      </p>
    </div>
  );
}
