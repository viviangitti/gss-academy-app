// COMPARAR OS CARROS DA CASA, QUANTOS O VENDEDOR QUISER.
//
// Pedido da Mariana em 13/10/2026: "acho legal dar pra comparar com todos de
// uma única vez — ele seleciona quantos quiser".
//
// O problema nunca foi selecionar vários; foi caber em 390px. Cinco colunas num
// celular dão 78px cada — menos que a palavra "autorrecarregável". Então:
//
//   · a coluna de rótulo fica PARADA e os carros deslizam por baixo, como
//     planilha no celular: o nome da linha nunca sai da tela;
//   · a coluna tem largura de um terço exato da pista, com trava de encaixe
//     (scroll-snap). A Vivian reprovou a primeira versão justamente por isso —
//     a terceira coluna entrava pela metade e o texto saía picado na borda.
//
// NENHUM CARRO GANHA, e isso é decisão de produto, não falta de opinião. Os
// cinco são da casa: um comparativo com vencedor ensina o vendedor a derrubar
// metade do próprio estoque na frente do cliente. Por isso a última linha diz
// para QUEM cada carro é, em vez de apontar um melhor.
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Check, ArrowRight, ChevronRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { concorrentesDaMarca, CARRO_DAS_FOLHAS, type Concorrente } from './data/concorrentes';
import FolhaConcorrente from './FolhaConcorrente';
import { useBrand } from './BrandContext';
import { comparaveisDaMarca, LINHAS } from './data/comparativo';

export default function Comparar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { brandId } = useBrand();
  const [params] = useSearchParams();

  const carros = useMemo(() => comparaveisDaMarca(brandId, user?.role), [brandId, user?.role]);

  // Quem chega pela ficha de um carro já encontra ele marcado: veio de lá para
  // comparar COM ele, não para montar a seleção do zero.
  const veioDe = params.get('de');
  const [marcados, setMarcados] = useState<string[]>(() => {
    const inicial = carros.map((c) => c.id);
    if (veioDe && inicial.includes(veioDe)) return [veioDe];
    return inicial;
  });
  const [comparando, setComparando] = useState(false);
  // O CONCORRENTE É OUTRO CAMINHO, não mais uma coluna. As folhas que o Gerson
  // mandou são peça pronta da marca, Jaecoo 5 contra um de cada vez — não dá
  // para somar na tabela da casa (ver data/concorrentes.ts). Então escolher um
  // concorrente ABRE A FOLHA dele, e só.
  const [folha, setFolha] = useState<Concorrente | null>(null);

  const alterna = (id: string) =>
    setMarcados((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  // A ordem das colunas é a do catálogo, não a dos toques: dois vendedores que
  // escolhem os mesmos carros têm que ver a mesma tabela.
  const escolhidos = carros.filter((c) => marcados.includes(c.id));
  const todos = marcados.length === carros.length;
  // As folhas só existem para o carro que a marca comparou. Numa marca sem
  // folha nenhuma a seção não aparece — melhor que um título vazio.
  const folhas = useMemo(() => concorrentesDaMarca(brandId), [brandId]);
  const temFolhas = folhas.length > 0 && carros.some((c) => c.id.startsWith(CARRO_DAS_FOLHAS));

  if (carros.length < 2) {
    return (
      <div className="wp-cmp">
        <button type="button" className="wp-cond-voltar" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} className="wp-ico" /> Voltar
        </button>
        <p className="wp-cmp-vazio">Esta marca ainda não tem dois modelos para comparar.</p>
      </div>
    );
  }

  if (folha) return <FolhaConcorrente c={folha} onFechar={() => setFolha(null)} />;

  if (!comparando) {
    return (
      <div className="wp-cmp">
        <button type="button" className="wp-cond-voltar" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} className="wp-ico" /> Voltar
        </button>
        <h1 className="wp-cmp-tit">Comparar modelos</h1>
        <p className="wp-cmp-sub">Marque quantos quiser. Dá para ver todos de uma vez.</p>

        <button
          type="button"
          className="wp-cmp-todos"
          onClick={() => setMarcados(todos ? [] : carros.map((c) => c.id))}
        >
          {todos ? 'Limpar seleção' : `Selecionar os ${carros.length}`}
          <span className={`wp-cmp-ck${todos ? ' on' : ''}`}>{todos && <Check size={13} />}</span>
        </button>

        {carros.map((c) => {
          const on = marcados.includes(c.id);
          return (
            <button key={c.id} type="button" className={`wp-cmp-op${on ? ' on' : ''}`} onClick={() => alterna(c.id)}>
              <span className="wp-cmp-tx">
                <b>{c.nome}</b>
                <span>{c.valores.tipo} · {c.valores.malas}</span>
              </span>
              <span className={`wp-cmp-ck${on ? ' on' : ''}`}>{on && <Check size={13} />}</span>
            </button>
          );
        })}

        {temFolhas && (
          <>
            <p className="wp-cmp-sub wp-cmp-conc-tit">
              <b>Concorrentes do Jaecoo 5</b><br />
              Folha pronta da marca, um a um. Toque para abrir e mandar pro cliente.
            </p>
            {folhas.map((c) => (
              <button key={c.id} type="button" className="wp-cmp-op" onClick={() => setFolha(c)}>
                <span className="wp-cmp-tx">
                  <b>{c.nome}</b>
                  <span>{c.versao}</span>
                </span>
                <ChevronRight size={16} className="wp-ico" />
              </button>
            ))}
          </>
        )}

        <button
          type="button"
          className="wp-cmp-ir"
          disabled={escolhidos.length < 2}
          onClick={() => setComparando(true)}
        >
          {escolhidos.length < 2 ? 'Marque pelo menos 2' : `Comparar os ${escolhidos.length}`}
          {escolhidos.length >= 2 && <ArrowRight size={16} className="wp-ico" />}
        </button>
      </div>
    );
  }

  // O Jaecoo 5 é o único sem roteiro, logo sem os três pontos. A nota aparece
  // só quando ele está na tela — aviso que aparece sempre vira moldura.
  const semAtributos = escolhidos.filter((c) => !c.atributos.length);

  return (
    <div className="wp-cmp">
      <button type="button" className="wp-cond-voltar" onClick={() => setComparando(false)}>
        <ChevronLeft size={16} className="wp-ico" /> Trocar os modelos
      </button>
      <h1 className="wp-cmp-tit">{escolhidos.length} modelos lado a lado</h1>

      <div className="wp-cmp-tb">
        <div className="wp-cmp-rot">
          <div className="wp-cmp-cab">&nbsp;</div>
          {LINHAS.map((l) => (
            <div key={l.chave} className={`wp-cmp-rl${l.decide ? ' dec' : ''}`}>{l.rotulo}</div>
          ))}
          <div className="wp-cmp-rl wp-cmp-quem-lb">É pra quem</div>
        </div>
        <div className="wp-cmp-pista">
          {escolhidos.map((c) => (
            <div key={c.id} className="wp-cmp-col">
              <div className="wp-cmp-cab"><b>{c.curto}</b><span>{c.versao}</span></div>
              {LINHAS.map((l) => (
                <div key={l.chave} className={`wp-cmp-cl${l.decide ? ' dec' : ''}`}>
                  {c.valores[l.chave] || '—'}
                </div>
              ))}
              <div className="wp-cmp-cl wp-cmp-quem">
                {c.atributos.length
                  ? c.atributos.map((a) => <i key={a}>{a}</i>)
                  : <span className="wp-cmp-sem">sem roteiro</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="wp-cmp-dica">Deslize para o lado — cada carro encaixa inteiro.</p>

      <div className="wp-cmp-nota">
        <b>Nenhum carro ganha.</b> Todos são da casa: a última linha diz para quem cada um é,
        em vez de apontar um melhor. Os três pontos saem do que o time respondeu sobre o que
        fecha cada carro — pesquisa com 16 vendedores, 192 respostas.
      </div>

      {semAtributos.length > 0 && (
        <div className="wp-cmp-falta">
          <b>{semAtributos.map((c) => c.curto).join(' e ')} ainda sem os três pontos.</b>{' '}
          {semAtributos.length === 1 ? 'Ele é o único' : 'Eles são os únicos'} sem roteiro gravado,
          então não existe resposta do time sobre o que fecha {semAtributos.length === 1 ? 'ele' : 'eles'}.
          A ficha compara normalmente.
        </div>
      )}
    </div>
  );
}
