import { useState } from 'react';
import { BookOpen, Sparkles, Trophy, ArrowRight, Check, Tag, Newspaper } from 'lucide-react';

const STEPS_SAUDE = [
  {
    Icon: BookOpen,
    title: 'Um produto por vez, em minutos',
    text: 'No Catálogo, toque em um produto e assista à pílula. Você aprende o benefício e a resposta para a objeção — e envia tudo pronto para a cliente no WhatsApp (com o vídeo, quando o produto tem).',
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

// Concessionária: as três telas que decidem o atendimento são outras. Não existe
// creator nem publicação — quem posta pela marca é o marketing.
const STEPS_AUTO = [
  {
    Icon: BookOpen,
    title: 'Um carro por vez, em minutos',
    text: 'Em Carros, toque no modelo e assista ao vídeo. Você aprende o que destacar e a resposta para cada objeção — inclusive "é chinês, né?" e "e a revenda?".',
  },
  {
    Icon: Tag,
    title: 'A condição do dia, sempre a mesma',
    text: 'Em Condições você vê a tabela que a gerência publicou, do jeito que ela chegou. Confira a validade antes de falar número com o cliente.',
  },
  {
    Icon: Newspaper,
    title: 'Chegue sabendo antes do cliente',
    text: 'Em Notícias você acompanha o que os concorrentes anunciaram e o que saiu do mercado. É o que o cliente leu antes de entrar no showroom.',
  },
];

export default function Onboarding({ onFinish, auto }: { onFinish: () => void; auto?: boolean }) {
  const [i, setI] = useState(0);
  const STEPS = auto ? STEPS_AUTO : STEPS_SAUDE;
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
          {last ? <>{auto ? 'Ver os carros' : 'Assistir minha 1ª pílula'} <Check size={16} className="wp-ico" /></> : <>Próximo <ArrowRight size={16} className="wp-ico" /></>}
        </button>
        <button className="wp-ob-skip" onClick={onFinish}>pular</button>
      </div>
    </div>
  );
}
