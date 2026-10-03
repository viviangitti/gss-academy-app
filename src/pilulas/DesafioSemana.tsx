// A TELA DO DESAFIO DA SEMANA E DA PROVA DO MÊS.
//
// Não é o quiz do carro de novo: ali a pessoa estuda e testa, de graça, quantas
// vezes quiser. Aqui vale ponto de verdade e as perguntas são as MESMAS para o
// time inteiro — então é uma prova, e prova tem uma tentativa só. O aviso disso
// vem antes de começar, em letra grande: ninguém pode descobrir a regra depois
// de perder a vez.
//
// E a reprovação não termina em "não foi dessa vez": a tela mostra quais carros
// derrubaram a pessoa, com link pra cada um. Errar vira lista de estudo.
import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Award, Check, X, ChevronRight, ArrowLeft, CalendarDays, Lock } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';
import {
  perguntasDo, chaveDe, periodoDe, pontosDe, minimoDe, diasAteVirar,
  type TipoDesafio,
} from './data/desafioSemanal';
import { recordDesafio, desafioFeito } from './data/tracking';

const NOME: Record<TipoDesafio, string> = { semana: 'Desafio da semana', mes: 'Prova do mês' };

export default function DesafioSemana() {
  const { tipo: bruto } = useParams();
  const tipo: TipoDesafio = bruto === 'mes' ? 'mes' : 'semana';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { brandId } = useBrand();

  const chave = chaveDe(tipo);
  const pontos = pontosDe(tipo);
  const minimo = minimoDe(tipo);

  const perguntas = useMemo(
    () => perguntasDo(tipo, brandId, user?.role),
    [tipo, brandId, user?.role],
  );

  const [comecou, setComecou] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [errados, setErrados] = useState<Array<{ produto: string; nome: string }>>([]);
  const [fim, setFim] = useState(false);

  const jaFez = desafioFeito(chave);
  const faltam = diasAteVirar();

  const voltar = (
    <button type="button" className="wp-prova-voltar" onClick={() => navigate(-1)}>
      <ArrowLeft size={16} className="wp-ico" /> Voltar
    </button>
  );

  if (!perguntas.length) {
    return (
      <div className="wp-prova">
        {voltar}
        <p className="wp-prova-vazio">Esta marca ainda não tem conteúdo suficiente para um desafio.</p>
      </div>
    );
  }

  // JÁ TENTOU NESTE PERÍODO — e isso vale tanto pra quem passou quanto pra quem
  // não passou. É o que impede sair e voltar pra ter a prova de novo.
  if (jaFez && !fim) {
    return (
      <div className="wp-prova">
        {voltar}
        <div className={`wp-prova-card ${jaFez.passou ? 'ok' : 'nao'}`}>
          <span className="wp-prova-ico">{jaFez.passou ? <Award size={24} /> : <Lock size={24} />}</span>
          <h2>{NOME[tipo]}</h2>
          <p className="wp-prova-nota">{jaFez.acertos} de {jaFez.de}</p>
          {jaFez.passou ? (
            <p className="wp-prova-sub">Você passou e somou <b>+{pontos} pontos</b> no ranking.</p>
          ) : (
            <p className="wp-prova-sub">
              Faltou pouco — o mínimo era {minimo}. Estude os carros e volte {tipo === 'semana' ? 'na segunda' : 'no mês que vem'}.
            </p>
          )}
          <p className="wp-prova-prazo">
            <CalendarDays size={13} className="wp-ico" />
            {tipo === 'semana'
              ? `Desafio novo em ${faltam === 1 ? '1 dia' : `${faltam} dias`}`
              : 'Prova nova no dia 1º'}
          </p>
        </div>
      </div>
    );
  }

  if (fim) {
    const passou = acertos >= minimo;
    const unicos = errados.filter((e, i) => errados.findIndex((o) => o.produto === e.produto) === i);
    return (
      <div className="wp-prova">
        {voltar}
        <div className={`wp-prova-card ${passou ? 'ok' : 'nao'}`}>
          <span className="wp-prova-ico">{passou ? <Award size={24} /> : <X size={24} />}</span>
          <h2>{passou ? 'Passou!' : 'Não foi dessa vez'}</h2>
          <p className="wp-prova-nota">{acertos} de {perguntas.length}</p>
          {passou ? (
            <p className="wp-prova-sub"><b>+{pontos} pontos</b> no ranking do mês.</p>
          ) : (
            <p className="wp-prova-sub">O mínimo era {minimo}. Sem ponto desta vez — mas dá pra chegar lá.</p>
          )}
        </div>

        {unicos.length > 0 && (
          <div className="wp-prova-estudo">
            <span className="wp-prova-estudo-tit">O que derrubou você</span>
            {unicos.map((e) => (
              <Link key={e.produto} to={`/eleva/produto/${e.produto}`} className="wp-prova-estudo-item">
                <span>{e.nome}</span>
                <ChevronRight size={16} className="wp-ico" />
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ANTES DE COMEÇAR — a regra da tentativa única aparece aqui, não depois.
  if (!comecou) {
    return (
      <div className="wp-prova">
        {voltar}
        <div className="wp-prova-card">
          <span className="wp-prova-ico"><Award size={24} /></span>
          <h2>{NOME[tipo]}</h2>
          <p className="wp-prova-sub">
            {perguntas.length} perguntas sobre os carros da casa. Acerte {minimo} e some
            <b> +{pontos} pontos</b> no ranking do mês.
          </p>
          <ul className="wp-prova-regras">
            <li><b>Uma tentativa.</b> Não dá pra refazer até {tipo === 'semana' ? 'virar a semana' : 'virar o mês'}.</li>
            <li><b>É igual pra todo mundo.</b> O time inteiro responde estas mesmas perguntas.</li>
            <li>O quiz de cada carro continua livre — treine lá antes.</li>
          </ul>
          <p className="wp-prova-prazo">
            <CalendarDays size={13} className="wp-ico" />
            {tipo === 'semana'
              ? `Vale até domingo · ${faltam === 1 ? 'último dia' : `faltam ${faltam} dias`}`
              : `Vale até o fim de ${periodoDe('mes').split('-')[1]}/${periodoDe('mes').split('-')[0]}`}
          </p>
          <button className="wp-prova-ok" onClick={() => setComecou(true)}>Começar</button>
        </div>
      </div>
    );
  }

  const q = perguntas[idx];

  const responder = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setAcertos((n) => n + 1);
    else setErrados((l) => [...l, { produto: q.produto, nome: q.produtoNome }]);
  };

  const seguir = () => {
    if (idx + 1 < perguntas.length) {
      setIdx(idx + 1);
      setPicked(null);
      return;
    }
    // `acertos` já conta a última: responder() e seguir() são cliques
    // diferentes, e entre eles o React rerenderiza com o estado novo.
    recordDesafio(chave, acertos, perguntas.length, minimo, pontos);
    setFim(true);
  };

  return (
    <div className="wp-prova">
      {voltar}
      <div className="wp-prova-topo">
        <b>{NOME[tipo]}</b>
        <i>{idx + 1} de {perguntas.length}</i>
      </div>
      <div className="wp-prova-barra">
        <span style={{ width: `${((idx + (picked !== null ? 1 : 0)) / perguntas.length) * 100}%` }} />
      </div>

      <p className="wp-prova-q">{q.q}</p>
      <div className="wp-quiz-opts">
        {q.options.map((opt, i) => {
          let cls = 'wp-quiz-opt';
          if (picked !== null) {
            if (i === q.correct) cls += ' right';
            else if (i === picked) cls += ' wrong';
            else cls += ' off';
          }
          return (
            <button key={i} className={cls} onClick={() => responder(i)} disabled={picked !== null}>
              <span className="wp-quiz-opt-mark">
                {picked !== null && i === q.correct && <Check size={14} />}
                {picked !== null && i === picked && i !== q.correct && <X size={14} />}
                {(picked === null || (i !== q.correct && i !== picked)) && <ChevronRight size={14} />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <>
          <p className="wp-quiz-feedback">
            {picked === q.correct ? 'Boa, é essa mesmo!' : `A certa é a verde — e é do ${q.produtoNome}.`}
          </p>
          <button className="wp-quiz-next" onClick={seguir}>
            {idx + 1 < perguntas.length ? 'Próxima' : 'Ver o resultado'}
          </button>
        </>
      )}
    </div>
  );
}
