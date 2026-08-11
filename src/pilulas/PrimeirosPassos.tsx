import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Megaphone, Trophy, Check, ChevronRight, X, PartyPopper, Tag, Newspaper } from 'lucide-react';
import { getStats } from './data/tracking';
import { visibleProducts } from './data/products';
import { allProducts, useStore } from './data/store';
import { useBrand } from './BrandContext';
import { isAuto } from './data/brands';
import { useAuth } from './AuthContext';

// Onboarding interativo (padrão Linear/Duolingo): checklist de primeiros passos
// que DETECTA as ações reais e leva direto pra ação com 1 toque.
const DONE_KEY = 'wp_pp_done';
const RANK_KEY = 'wp_pp_ranking';

export default function PrimeirosPassos() {
  useStore(); // re-renderiza quando o store muda
  const navigate = useNavigate();
  const { brandId } = useBrand();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try { return !!localStorage.getItem(DONE_KEY); } catch { return false; }
  });
  const [sawRanking, setSawRanking] = useState<boolean>(() => {
    try { return !!localStorage.getItem(RANK_KEY); } catch { return false; }
  });

  if (dismissed || !user || user.role === 'gestor') return null;

  const auto = isAuto(brandId);
  const stats = getStats();
  const first = visibleProducts(allProducts().filter(p => p.brand === brandId), user.role)[0];

  // Os primeiros passos são as telas que a pessoa PRECISA conhecer pra fazer o
  // trabalho dela. Na revenda isso é postar e pontuar; na concessionária, nem
  // uma coisa nem outra existe — é a condição do dia e a notícia do mercado.
  const steps = auto
    ? [
        {
          id: 'pilula', done: stats.totalViews >= 1, Icon: PlayCircle,
          title: 'Assista seu 1º vídeo',
          sub: 'Poucos minutos e você já sabe rebater a objeção',
          go: () => first && navigate(`/eleva/produto/${first.id}`),
        },
        {
          id: 'condicoes', done: sawRanking, Icon: Tag,
          title: 'Veja a condição vigente',
          sub: 'A tabela que a gerência publicou, com validade',
          go: () => {
            try { localStorage.setItem(RANK_KEY, '1'); } catch { /* ignore */ }
            setSawRanking(true);
            navigate('/eleva/ofertas');
          },
        },
        {
          id: 'noticias', done: false, Icon: Newspaper,
          title: 'Dê uma olhada nas notícias',
          sub: 'O que o concorrente anunciou nesta semana',
          go: () => navigate('/eleva/noticias'),
        },
      ]
    : [
    {
      id: 'pilula', done: stats.totalViews >= 1, Icon: PlayCircle,
      title: 'Assista sua 1ª pílula',
      sub: 'Poucos minutos e você já sabe vender o produto',
      go: () => first && navigate(`/eleva/produto/${first.id}`),
    },
    {
      id: 'missao', done: stats.totalMissions >= 1, Icon: Megaphone,
      title: 'Complete 1 missão de creator',
      sub: 'Poste com roteiro pronto e marque "postei"',
      go: () => navigate('/eleva/missoes'),
    },
    {
      id: 'ranking', done: sawRanking, Icon: Trophy,
      title: 'Veja seu lugar no ranking',
      sub: 'Cada pílula e post vale pontos',
      go: () => {
        try { localStorage.setItem(RANK_KEY, '1'); } catch { /* ignore */ }
        setSawRanking(true);
        navigate('/eleva/ranking');
      },
    },
  ];

  const doneCount = steps.filter(s => s.done).length;
  const allDone = doneCount === steps.length;
  const pct = Math.round((doneCount / steps.length) * 100);

  const dismiss = () => {
    try { localStorage.setItem(DONE_KEY, '1'); } catch { /* ignore */ }
    setDismissed(true);
  };

  if (allDone) {
    return (
      <div className="wp-pp wp-pp-done">
        <PartyPopper size={20} className="wp-ico" />
        <div className="wp-pp-done-text">
          <b>Você concluiu os primeiros passos!</b>
          <span>{auto ? 'Agora é manter o ritmo: um vídeo por dia e a condição sempre conferida.' : 'Agora é manter o ritmo: pílulas, publicações e pontos toda semana.'}</span>
        </div>
        <button className="wp-pp-x" aria-label="Fechar" onClick={dismiss}><X size={15} /></button>
      </div>
    );
  }

  return (
    <div className="wp-pp">
      <div className="wp-pp-head">
        <b>Primeiros passos</b>
        <span className="wp-pp-count">{doneCount}/{steps.length}</span>
      </div>
      <div className="wp-pp-bar"><i style={{ width: `${pct}%` }} /></div>
      {steps.map(s => {
        const I = s.Icon;
        return (
          <button key={s.id} className={`wp-pp-item ${s.done ? 'done' : ''}`} onClick={s.done ? undefined : s.go} disabled={s.done}>
            <span className={`wp-pp-check ${s.done ? 'on' : ''}`}>{s.done ? <Check size={13} /> : <I size={14} />}</span>
            <span className="wp-pp-text">
              <b>{s.title}</b>
              <small>{s.sub}</small>
            </span>
            {!s.done && <ChevronRight size={16} className="wp-ico" />}
          </button>
        );
      })}
    </div>
  );
}
