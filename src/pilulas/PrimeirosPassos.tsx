import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Megaphone, Trophy, Check, ChevronRight, X, PartyPopper } from 'lucide-react';
import { getStats } from './data/tracking';
import { visibleProducts } from './data/products';
import { allProducts, useStore } from './data/store';
import { useBrand } from './BrandContext';
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

  const stats = getStats();
  const first = visibleProducts(allProducts().filter(p => p.brand === brandId), user.role)[0];

  const steps = [
    {
      id: 'pilula', done: stats.totalViews >= 1, Icon: PlayCircle,
      title: 'Assista sua 1ª pílula',
      sub: '30 segundos e você já sabe vender o produto',
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
          <span>Agora é manter o ritmo: pílulas, publicações e pontos toda semana.</span>
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
