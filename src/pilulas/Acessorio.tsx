import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Package, Copy, Check, Car, Maximize2, X } from 'lucide-react';
import { useState } from 'react';
import { ACESSORIOS, ORIGENS, precoLabel } from './data/acessorios';
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
  const [ampliada, setAmpliada] = useState(false);

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

      {a.foto && (
        <button type="button" className="wp-acp-foto" onClick={() => setAmpliada(true)} aria-label="Ampliar foto">
          <img src={a.foto} alt={a.nome} />
          <span className="wp-cond-zoom"><Maximize2 size={13} className="wp-ico" /> Ampliar</span>
        </button>
      )}
      {ampliada && a.foto && (
        <div className="wp-foto-lb" onClick={() => setAmpliada(false)} role="dialog" aria-label={a.nome}>
          <button type="button" className="wp-cond-lb-x" aria-label="Fechar"><X size={20} className="wp-ico" /></button>
          <img src={a.foto} alt={a.nome} onClick={(e) => e.stopPropagation()} />
          <span className="wp-foto-lb-cap">{a.nome} · {precoLabel(a)}</span>
        </div>
      )}

      <div className="wp-acp-hero">
        <span className="wp-acp-tag"><Package size={13} className="wp-ico" /> {ORIGENS[a.origem].label}</span>
        <h1 className="wp-acp-nome">{a.nome}</h1>
        <span className="wp-acp-preco">{precoLabel(a)}</span>
        {a.preco && <span className="wp-acp-preco-obs">preço público sugerido</span>}
        {/* Prazo e garantia mudam com a origem — dito aqui, antes de o vendedor
            prometer data de entrega pro cliente. */}
        {ORIGENS[a.origem].nota && (
          <span className="wp-acp-origem">{ORIGENS[a.origem].nota}</span>
        )}
      </div>

      <div className="wp-block">
        <span className="wp-block-label">O que resolve pro cliente</span>
        <p className="wp-acp-benef">{a.beneficio}</p>
      </div>

      {a.videoUrl && (
        <div className="wp-block">
          <span className="wp-block-label">Vídeo de 45s</span>
          <video className="wp-acp-video" src={a.videoUrl} controls playsInline preload="metadata" />
        </div>
      )}

      {/* O roteiro aparece mesmo sem o vídeo pronto: as cinco batidas JÁ são o
          treinamento. Quem lê sabe abrir a conversa, reconhecer o cliente certo
          e responder a objeção — o vídeo reforça, não substitui. */}
      {a.roteiro && a.roteiro.length > 0 && (
        <div className="wp-block">
          <span className="wp-block-label">
            {a.videoUrl ? 'O roteiro do vídeo' : 'Roteiro — como apresentar em 45s'}
          </span>
          <ol className="wp-acp-roteiro">
            {a.roteiro.map((c) => (
              <li key={c.t}>
                <span className="wp-acp-rot-cab">
                  <b>{c.label}</b><i>{c.t}</i>
                </span>
                <span className="wp-acp-rot-linha">{c.line}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

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
