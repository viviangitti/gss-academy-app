import { useMemo, useState } from 'react';
import { Award, Check, X, RotateCcw, ChevronRight } from 'lucide-react';
import { visibleProducts, type Product } from './data/products';
import { allProducts } from './data/store';
import { useAuth } from './AuthContext';
import { recordQuizPass, isQuizDone, POINTS_PER_QUIZ } from './data/tracking';

// Quiz "Você pegou?" — 3 perguntas geradas do PRÓPRIO conteúdo da pílula
// (benefício, objeção, pra quem é). Acertou tudo: pontua e ganha o selo
// "Domina esse produto". Distratores vêm dos outros produtos da marca.

interface Question {
  q: string;
  options: string[];
  correct: number; // índice da certa em options
}

// A alternativa aparece INTEIRA. Cortar com "…" fazia a pessoa errar sem saber
// o que estava lendo — o quiz mede conhecimento, não paciência pra adivinhar.
function cut(s: string): string {
  return s.trim();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

// `role` limita de onde vêm as alternativas erradas — o afiliado só conhece a
// linha GLPEN, então não faz sentido oferecer resposta de outro produto.
function buildQuestions(product: Product, role?: string): Question[] {
  const others = visibleProducts(
    allProducts().filter((p) => p.brand === product.brand && p.id !== product.id),
    role
  );
  const qs: Question[] = [];

  const make = (q: string, correct: string, wrong: string[]): Question | null => {
    const distractors = pick(wrong.filter((w) => w && w !== correct), 2);
    if (distractors.length < 2) return null;
    const options = shuffle([cut(correct), ...distractors.map((d) => cut(d))]);
    return { q, options, correct: options.indexOf(cut(correct)) };
  };

  // 1) Benefício
  if (product.benefits.length) {
    const q = make(
      `Qual desses é um benefício do ${product.name}?`,
      pick(product.benefits, 1)[0],
      others.flatMap((p) => p.benefits)
    );
    if (q) qs.push(q);
  }

  // 2) Objeção (o coração da venda)
  if (product.objections.length) {
    const o = pick(product.objections, 1)[0];
    const q = make(
      `A cliente diz: ${o.trigger} O que você responde?`,
      o.answer,
      others.flatMap((p) => p.objections.map((x) => x.answer))
    );
    if (q) qs.push(q);
  }

  // 3) Pra quem é
  if (product.forWho.trim()) {
    const q = make(
      `O ${product.name} é ideal pra quem?`,
      product.forWho,
      others.map((p) => p.forWho)
    );
    if (q) qs.push(q);
  }

  return qs;
}

export default function Quiz({ product }: { product: Product }) {
  const { user } = useAuth();
  const [round, setRound] = useState(0); // muda pra re-sortear as perguntas
  // Depende do ID (estável), não do objeto: findProduct cria objeto novo a cada
  // render e re-sortearia as perguntas no meio do quiz.
  const questions = useMemo(() => buildQuestions(product, user?.role), [product.id, round, user?.role]); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [finished, setFinished] = useState(false);
  const [passedNow, setPassedNow] = useState(false);
  const alreadyDone = isQuizDone(product.id);

  if (questions.length < 2) return null; // sem conteúdo suficiente pra um quiz honesto

  const restart = () => {
    setRound((r) => r + 1);
    setIdx(0);
    setPicked(null);
    setHits(0);
    setFinished(false);
    setPassedNow(false);
  };

  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === questions[idx].correct) setHits((h) => h + 1);
  };

  // Só avança quando a pessoa clica em "Próxima" — assim ela lê a resposta
  // certa com calma, sem sumir sozinho.
  const advance = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPicked(null);
      return;
    }
    if (hits === questions.length) {
      const wasNew = !isQuizDone(product.id);
      recordQuizPass(product.id);
      setPassedNow(wasNew);
    }
    setFinished(true);
  };

  // Já domina e não está refazendo agora
  if (alreadyDone && !finished && idx === 0 && picked === null && hits === 0 && round === 0) {
    return (
      <div className="wp-block wp-quiz">
        <span className="wp-block-label"><Award size={14} className="wp-ico" /> Você domina esse produto</span>
        <p className="wp-quiz-done-text">Quiz feito, selo garantido. Quer treinar de novo?</p>
        <button className="wp-quiz-again" onClick={restart}><RotateCcw size={14} className="wp-ico" /> Refazer o quiz</button>
      </div>
    );
  }

  if (finished) {
    const perfect = hits === questions.length;
    return (
      <div className="wp-block wp-quiz">
        <span className="wp-block-label"><Award size={14} className="wp-ico" /> Teste o que você aprendeu</span>
        {perfect ? (
          <>
            <p className="wp-quiz-result-big">{hits}/{questions.length} — mandou bem!</p>
            <p className="wp-quiz-done-text">
              {passedNow
                ? <>Selo <b>“Domina esse produto”</b> garantido · <b>+{POINTS_PER_QUIZ} pts</b> no ranking.</>
                : <>Você já tinha o selo desse produto — treino mantido em dia.</>}
            </p>
          </>
        ) : (
          <>
            <p className="wp-quiz-result-big">{hits}/{questions.length}</p>
            <p className="wp-quiz-done-text">Quase! Dá uma olhada na pílula de novo — acertando tudo você ganha o selo e +{POINTS_PER_QUIZ} pts.</p>
          </>
        )}
        <button className="wp-quiz-again" onClick={restart}><RotateCcw size={14} className="wp-ico" /> {perfect ? 'Refazer' : 'Tentar de novo'}</button>
      </div>
    );
  }

  const q = questions[idx];
  return (
    <div className="wp-block wp-quiz">
      <span className="wp-block-label"><Award size={14} className="wp-ico" /> Teste o que você aprendeu · {idx + 1}/{questions.length} · vale +{POINTS_PER_QUIZ} pts</span>
      <p className="wp-quiz-q">{q.q}</p>
      <div className="wp-quiz-opts">
        {q.options.map((opt, i) => {
          let cls = 'wp-quiz-opt';
          if (picked !== null) {
            if (i === q.correct) cls += ' right';
            else if (i === picked) cls += ' wrong';
            else cls += ' off';
          }
          return (
            <button key={i} className={cls} onClick={() => answer(i)} disabled={picked !== null}>
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
            {picked === q.correct ? 'Boa, é essa mesmo!' : 'Quase — a resposta certa é a que ficou em verde.'}
          </p>
          <button className="wp-quiz-next" onClick={advance}>
            {idx + 1 < questions.length ? 'Próxima' : 'Ver resultado'}
            <ChevronRight size={16} className="wp-ico" />
          </button>
        </>
      )}
    </div>
  );
}
