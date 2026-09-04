import { Link } from 'react-router-dom';
import { Printer, ArrowLeft, ChevronLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useBrand } from './BrandContext';
import { ORIGENS, type Acessorio } from './data/acessorios';
import { findProduct, getProductImageUrl, hasImage, ensureImageLoaded, useStore } from './data/store';
import { nomeParaCliente } from './data/nomeArquivo';

// A ficha do ACESSÓRIO — o mesmo papel que a do carro, para o mesmo uso: o
// vendedor aperta "Salvar em PDF" e manda pro cliente no WhatsApp.
//
// O QUE NÃO ENTRA AQUI, de propósito:
//
//   Preço. Muda por campanha e por pacote; folha velha na mão do cliente vira
//   promessa que a loja não cumpre. Quem responde preço é a tabela do dia.
//
//   Código de peça e comissão. São da operação, não do cliente. O vendedor vê
//   os dois na tela do acessório, dentro do app.
//
// O que entra é o que decide a compra: o que o acessório resolve, se é peça de
// fábrica ou serviço da loja (muda prazo e garantia) e em que carros encaixa.
export default function FichaAcessorio({ a }: { a: Acessorio }) {
  useStore();
  const { brand } = useBrand();
  const carros = a.aplicaEm.map((pid) => findProduct(pid)).filter(Boolean);
  const foto = getProductImageUrl(a.id) || a.foto;

  useEffect(() => { if (hasImage(a.id)) ensureImageLoaded(a.id); }, [a.id]);

  // O navegador batiza o PDF com o título da página — sem isto o cliente
  // recebia um anexo com o nome do site. Restaura ao sair.
  useEffect(() => {
    const anterior = document.title;
    document.title = nomeParaCliente(a.nome, 'ficha do acessório');
    return () => { document.title = anterior; };
  }, [a.nome]);

  return (
    <div className="wp-fk-wrap">
      <div className="wp-fk-bar">
        <Link to={`/eleva/acessorio/${a.id}`} className="wp-fk-back">
          <ArrowLeft size={16} className="wp-ico" /> Voltar
        </Link>
        <button className="wp-fk-print" onClick={() => window.print()}>
          <Printer size={16} className="wp-ico" /> Salvar em PDF / Imprimir
        </button>
      </div>
      <p className="wp-fk-hint">
        Toque em <b>Salvar em PDF</b>. No celular, escolha "Imprimir" e depois "Salvar em PDF" — aí é só
        enviar o arquivo pro cliente. A folha sai sem preço e sem código de peça.
      </p>

      <article className="wp-fk">
        <header className="wp-fk-head">
          <div>
            <span className="wp-fk-brand">{brand.name}</span>
            <span className="wp-fk-kind">Acessório</span>
          </div>
        </header>

        <div className="wp-fk-hero">
          {foto && <img src={foto} alt={a.nome} className="wp-fk-img" />}
          <div>
            <h1 className="wp-fk-name">{a.nome}</h1>
            <p className="wp-fk-tag">{a.beneficio}</p>
          </div>
        </div>

        <table className="wp-fk-table">
          <tbody>
            <tr>
              <th>Tipo</th>
              <td className="wp-fk-versoes">{ORIGENS[a.origem].label}</td>
            </tr>
            {carros.length > 0 && (
              <tr>
                <th>Entra em</th>
                <td className="wp-fk-versoes">{carros.map((c) => c!.name).join(' · ')}</td>
              </tr>
            )}
            <tr>
              <th>Instalação</th>
              <td>{ORIGENS[a.origem].nota}</td>
            </tr>
          </tbody>
        </table>

        {a.observacao && (
          <section className="wp-fk-sec">
            <h2>Bom saber</h2>
            <p>{a.observacao}</p>
          </section>
        )}

        <footer className="wp-fk-foot">
          <span className="wp-fk-url">{brand.name}</span>
        </footer>
      </article>

      <Link to={`/eleva/acessorio/${a.id}`} className="wp-fk-back wp-fk-voltar-baixo">
        <ChevronLeft size={16} className="wp-ico" /> Voltar ao acessório
      </Link>
    </div>
  );
}
