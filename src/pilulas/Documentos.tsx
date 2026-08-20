import { Link } from 'react-router-dom';
import { ChevronLeft, FileText, Lock, ExternalLink, FolderOpen } from 'lucide-react';
import { useBrand } from './BrandContext';
import { PRATELEIRAS, documentosDaMarca } from './data/documentos';
import { carregarDocsNuvem, docsNuvemDaMarca, abrirDocNuvem, type DocNuvem } from './data/docsUpload';
import { useEffect, useState } from 'react';

// O REPOSITÓRIO. Separado das pílulas de propósito: aqui é o material que se
// lê sentado — guia de 35 páginas, ficha completa, comunicado da montadora.
// A pílula é pra usar em pé, com o cliente do lado; isto é pra estudar antes.
// Documento que o gestor subiu vive em pedaços no Firestore — abrir é remontar.
// Por isso ele é um botão com estado, e não um link: precisa mostrar que está
// baixando (5 MB no 4G demora, e barra parada faz a pessoa achar que travou).
function DocDaNuvem({ d }: { d: DocNuvem }) {
  const [pct, setPct] = useState<number | null>(null);
  const [erro, setErro] = useState('');

  const abrir = async () => {
    if (pct !== null) return;
    setErro('');
    setPct(0);
    try {
      const url = await abrirDocNuvem(d, setPct);
      window.open(url, '_blank', 'noopener');
    } catch {
      setErro('Não consegui abrir agora. Confira a internet e tente de novo.');
    } finally {
      setPct(null);
    }
  };

  return (
    <button type="button" className="wp-doc" onClick={abrir}>
      <span className="wp-doc-ic"><FileText size={17} className="wp-ico" /></span>
      <span className="wp-doc-txt">
        <b>
          {d.titulo}
          {d.interno && <span className="wp-doc-selo"><Lock size={10} className="wp-ico" /> interno</span>}
        </b>
        <i>{d.paraQue}</i>
        <small>
          {pct !== null ? `baixando… ${pct}%` : `${Math.round(d.bytes / 1024 / 1024 * 10) / 10} MB · publicado pela gerência`}
        </small>
        {erro && <small style={{ color: '#d33b3b' }}>{erro}</small>}
      </span>
      <ExternalLink size={15} className="wp-ico wp-doc-ext" />
    </button>
  );
}

export default function Documentos() {
  const { brandId, brand } = useBrand();
  const docs = documentosDaMarca(brandId);
  const [daNuvem, setDaNuvem] = useState<DocNuvem[]>([]);
  useEffect(() => {
    let vivo = true;
    carregarDocsNuvem(brandId).then((r) => { if (vivo) setDaNuvem(r); }).catch(() => {});
    setDaNuvem(docsNuvemDaMarca(brandId));
    return () => { vivo = false; };
  }, [brandId]);

  return (
    <div className="wp-docs">
      <Link to="/eleva" className="wp-news-back">
        <ChevronLeft size={16} className="wp-ico" /> Voltar
      </Link>

      <div className="wp-news-hero">
        <div className="wp-news-hero-icon"><FolderOpen size={18} className="wp-ico" /></div>
        <div>
          <h1 className="wp-news-title">Documentos</h1>
          <p className="wp-news-sub">O material oficial da {brand.name}, do jeito que a marca mandou.</p>
        </div>
      </div>

      {!docs.length && !daNuvem.length && (
        <p className="wp-cond-vazio">Nenhum documento publicado para esta marca ainda.</p>
      )}

      {PRATELEIRAS.map((pr) => {
        const daPrateleira = docs.filter((d) => d.prateleira === pr.id);
        const nuvemAqui = daNuvem.filter((d) => d.prateleira === pr.id);
        if (!daPrateleira.length && !nuvemAqui.length) return null;
        return (
          <section key={pr.id} className="wp-docs-sec">
            <h2 className="wp-docs-sec-tit">{pr.titulo}</h2>
            <p className="wp-docs-sec-sub">{pr.descricao}</p>
            {daPrateleira.map((d) => (
              <a key={d.id} className="wp-doc" href={d.arquivo} target="_blank" rel="noopener noreferrer">
                <span className="wp-doc-ic"><FileText size={17} className="wp-ico" /></span>
                <span className="wp-doc-txt">
                  <b>
                    {d.titulo}
                    {d.interno && <span className="wp-doc-selo"><Lock size={10} className="wp-ico" /> interno</span>}
                  </b>
                  <i>{d.paraQue}</i>
                  <small>{d.paginas} {d.paginas === 1 ? 'página' : 'páginas'} · atualizado em {d.atualizado}</small>
                </span>
                <ExternalLink size={15} className="wp-ico wp-doc-ext" />
              </a>
            ))}
            {nuvemAqui.map((d) => <DocDaNuvem key={d.id} d={d} />)}
          </section>
        );
      })}

      <p className="wp-news-foot">
        Documentos marcados como <b>internos</b> trazem custo de reposição, margem e política de preço.
        Use para se preparar — não encaminhe ao cliente.
      </p>
    </div>
  );
}
