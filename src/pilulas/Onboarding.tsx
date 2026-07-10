import { useState } from 'react';
import { BookOpen, Sparkles, Trophy, ArrowRight, Check } from 'lucide-react';

const STEPS = [
  {
    Icon: BookOpen,
    title: 'Cada produto em 30 segundos',
    text: 'No Catálogo, toque em um produto e assista à pílula de 30 segundos. Você aprende o benefício e a resposta para a objeção — e envia tudo pronto para a cliente no WhatsApp (com o vídeo, quando o produto tem).',
  },
  {
    Icon: Sparkles,
    title: 'Vire creator da marca',
    text: 'Na aba Creators você encontra calendário, roteiros e tendências prontos — para WhatsApp, Instagram e TikTok. Você nunca mais fica sem saber o que publicar.',
  },
  {
    Icon: Trophy,
    title: 'Aprenda e pontue',
    text: 'Cada pílula assistida e cada publicação registrada somam pontos. Suba no ranking do mês, desbloqueie selos e alcance o nível Creator Ouro.',
  },
];

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [i, setI] = useState(0);
  const last = i === STEPS.length - 1;
  const s = STEPS[i];
  const S = s.Icon;
  return (
    <div className="wp-ob-overlay">
      <div className="wp-ob-card">
        <div className="wp-ob-icon"><S size={30} /></div>
        <div className="wp-ob-step">Passo {i + 1} de {STEPS.length}</div>
        <h2 className="wp-ob-title">{s.title}</h2>
        <p className="wp-ob-text">{s.text}</p>
        <div className="wp-ob-dots">
          {STEPS.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}
        </div>
        <button className="wp-ob-next" onClick={() => (last ? onFinish() : setI(i + 1))}>
          {last ? <>Assistir minha 1ª pílula <Check size={16} className="wp-ico" /></> : <>Próximo <ArrowRight size={16} className="wp-ico" /></>}
        </button>
        <button className="wp-ob-skip" onClick={onFinish}>pular</button>
      </div>
    </div>
  );
}
