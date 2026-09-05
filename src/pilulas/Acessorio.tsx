import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Package, Copy, Check, Car, Maximize2, X, Image as ImageIcon, Video, FileText, Pencil, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { acessorioPorId, acessorioOculto, ORIGENS, precoLabel } from './data/acessorios';
import {
  findProduct, hasImage, getProductImageUrl, ensureImageLoaded, setProductImage, clearProductImage,
  hasVideo, getVideoObjectUrl, ensureVideoLoaded, setProductVideo, clearProductVideo, useStore,
} from './data/store';
import { registraUso } from './data/tracking';
import { useAuth } from './AuthContext';
import { useAjustesAcessorios } from './data/ajustesAcessorios';
import { podeMexerEmAcessorios } from './data/cargos';

/**
 * O editor de foto e vídeo do acessório, só pra gestão.
 *
 * Existe pelo mesmo motivo do editor do carro: quem conhece o acessório é quem
 * vende acessório, e essa pessoa não mexe em código. Sem isto, cada foto nova
 * dependia de alguém abrir o repositório.
 *
 * Foto e vídeo vão pra NUVEM. Antes ficavam no IndexedDB de quem subiu: a
 * gerente via na tela dela e o time seguia com o card vazio.
 */
function EditorAcessorio({ id, nome }: { id: string; nome: string }) {
  const [aberto, setAberto] = useState(false);
  const [pct, setPct] = useState<number | null>(null);
  const [aviso, setAviso] = useState('');
  const temFoto = hasImage(id);
  const temVideo = hasVideo(id);

  const subirFoto = async (f: File) => {
    setAviso('');
    const naNuvem = await setProductImage(id, f);
    setAviso(naNuvem
      ? 'Foto publicada — o time inteiro já vê.'
      : 'A foto ficou só neste aparelho: não consegui publicar agora. Tente de novo com internet melhor.');
  };

  const subirVideo = (f: File) => {
    setAviso('');
    setPct(0);
    setProductVideo(id, f, setPct)
      .then((naNuvem) => setAviso(naNuvem
        ? 'Vídeo publicado — o time inteiro já vê.'
        : 'O vídeo ficou só neste aparelho: não consegui publicar agora.'))
      .finally(() => setPct(null));
  };

  return (
    <div className="wp-videdit">
      <button className="wp-videdit-toggle" onClick={() => setAberto(!aberto)}>
        <Pencil size={14} className="wp-ico" /> {aberto ? 'Fechar' : `Foto e vídeo de ${nome}`}
      </button>
      {aberto && (
        <div className="wp-videdit-body">
          <p className="wp-videdit-now">Foto <span className="wp-videdit-cap">— aparece no card e na ficha</span></p>
          <label className="wp-videdit-mp4">
            <ImageIcon size={16} className="wp-ico" />
            {temFoto ? 'Trocar a foto' : 'Subir uma foto'}
            <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) subirFoto(f); }} />
          </label>
          {temFoto && <button className="wp-videdit-remove" onClick={() => clearProductImage(id)}>Tirar a foto</button>}

          <div className="wp-videdit-divider" />
          <p className="wp-videdit-now">Vídeo de 45s <span className="wp-videdit-cap">— o mesmo formato das pílulas</span></p>
          <label className="wp-videdit-mp4">
            <Video size={16} className="wp-ico" />
            {temVideo ? 'Trocar o vídeo' : 'Subir o vídeo'}
            <input type="file" accept="video/*" hidden disabled={pct !== null} onChange={(e) => { const f = e.target.files?.[0]; if (f) subirVideo(f); }} />
          </label>
          {pct !== null && (
            <div className="wp-gz-slot-barra"><span style={{ width: `${pct}%` }} /></div>
          )}
          {temVideo && pct === null && <button className="wp-videdit-remove" onClick={() => clearProductVideo(id)}>Tirar o vídeo</button>}
          {aviso && <p className="wp-videdit-help">{aviso}</p>}
        </div>
      )}
    </div>
  );
}

// A tela do ACESSÓRIO. Antes o card levava pro carro compatível — atalho meu
// que enganava: a pessoa clicava em "estribo iluminado" e caía no Jaecoo 7.
//
// Aqui o conteúdo é o do acessório mesmo, na ordem em que ele se vende: o que
// resolve pro cliente, como oferecer, em que carros entra e o código pra pedir.
export default function Acessorio() {
  // Re-renderiza quando o preço corrigido chega da nuvem: sem isto a tela
  // fica com o número do catálogo até alguém trocar de aba.
  useAjustesAcessorios();
  useStore(); // redesenha quando a foto ou o vídeo da nuvem chega
  const { id } = useParams();
  const { user } = useAuth();
  const a = id ? acessorioPorId(id) : undefined;
  const [copiado, setCopiado] = useState('');
  const [ampliada, setAmpliada] = useState(false);

  // Ponto cego que existia desde o começo: esta tela não registrava nada. Quem
  // vive de acessório podia usar o app todo dia e sair zerado no relatório.
  useEffect(() => {
    if (id) registraUso('acessorio', id);
  }, [id]);

  // Foto e vídeo publicados pela gerência moram na nuvem — puxa quando abre.
  useEffect(() => {
    if (!id) return;
    if (hasImage(id)) ensureImageLoaded(id);
    if (hasVideo(id)) ensureVideoLoaded(id);
  }, [id]);

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
  // A foto publicada pela gerência ganha da que veio junto com o app.
  const foto = getProductImageUrl(a.id) || a.foto;
  const video = getVideoObjectUrl(a.id) || a.videoUrl;
  // Quem responde pelo catálogo de acessórios. Gerente de vendas e gerente de
  // leads abrem o mesmo Painel, mas a tabela de acessório não é deles.
  const podeMexer = podeMexerEmAcessorios(user);
  const oculto = acessorioOculto(a.id);

  return (
    <div className="wp-acp">
      <Link to="/eleva/catalogo" className="wp-news-back">
        <ChevronLeft size={16} className="wp-ico" /> Voltar
      </Link>

      {/* SAIU DA VITRINE. O link direto continua abrindo (alguém pode ter
          salvo), então a tela avisa em vez de fingir que está tudo normal — e
          o vendedor não oferece o que a loja não vende mais. */}
      {oculto && (
        <p className="wp-acp-fora">
          <EyeOff size={14} className="wp-ico" /> Este acessório saiu da vitrine. Não ofereça
          sem falar com a gerência de acessórios.
        </p>
      )}

      {foto && (
        <button type="button" className="wp-acp-foto" onClick={() => setAmpliada(true)} aria-label="Ampliar foto">
          <img src={foto} alt={a.nome} />
          <span className="wp-cond-zoom"><Maximize2 size={13} className="wp-ico" /> Ampliar</span>
        </button>
      )}
      {ampliada && foto && (
        <div className="wp-foto-lb" onClick={() => setAmpliada(false)} role="dialog" aria-label={a.nome}>
          <button type="button" className="wp-cond-lb-x" aria-label="Fechar"><X size={20} className="wp-ico" /></button>
          <img src={foto} alt={a.nome} onClick={(e) => e.stopPropagation()} />
          <span className="wp-foto-lb-cap">{a.nome}</span>
        </div>
      )}

      <div className="wp-acp-hero">
        <span className="wp-acp-tag"><Package size={13} className="wp-ico" /> {ORIGENS[a.origem].label}</span>
        <h1 className="wp-acp-nome">{a.nome}</h1>
        <span className="wp-acp-preco">{precoLabel(a)}</span>
        {/* PREÇO DE REFERÊNCIA, e a tela diz isso. Pacote com desconto e prazo
            de validade vive em Condições, publicado pela gerência com a data —
            é lá que está o número do dia. Sem este aviso o vendedor via R$ 9.000
            aqui, outro valor na condição vigente, e não sabia qual valia. */}
        {a.preco && (
          <span className="wp-acp-preco-obs">
            preço de referência · <Link to="/eleva/ofertas">veja a condição vigente</Link>
          </span>
        )}
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

      {/* A ficha do acessório, igual à do carro: vira PDF pelo Imprimir e vai
          pro cliente com a marca da loja, sem preço. */}
      <Link to={`/eleva/ficha/${a.id}`} className="wp-acp-ficha">
        <FileText size={15} className="wp-ico" /> Ficha técnica para o cliente
      </Link>

      {/* EDITAR, igual às condições: o botão fica onde a pessoa está olhando o
          item, não escondido no Painel. Leva pro Painel já com a ficha aberta. */}
      {podeMexer && (
        <div className="wp-acp-gestao">
          <Link className="wp-cond-editar" to={`/eleva/gestor?acessorio=${a.id}`}>
            <Pencil size={13} className="wp-ico" /> Editar nome, textos, preço e ordem
          </Link>
          <EditorAcessorio id={a.id} nome={a.nome} />
        </div>
      )}

      {video && (
        <div className="wp-block">
          <span className="wp-block-label">Vídeo de 45s</span>
          <video className="wp-acp-video" src={video} controls playsInline preload="metadata" />
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

      {/* Serviço da loja não tem código de peça — o bloco vazio ficava na tela
          com um título e nada embaixo, parecendo que faltou carregar. */}
      {a.codigos.length > 0 && (
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
      )}

      <p className="wp-news-foot">
        Preço público sugerido pela montadora. Confirme o valor e a disponibilidade vigentes
        com a gerência antes de fechar com o cliente.
      </p>
    </div>
  );
}
