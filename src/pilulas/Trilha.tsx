import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flag, Clock, GraduationCap, Check, Play, Circle, ArrowRight, Lock, Trophy } from 'lucide-react';
import { useStore } from './data/store';
import { useBrand } from './BrandContext';
import { useAuth } from './AuthContext';
import { getTrilha, ensureCertDate, formatCertDate, type TrilhaStep } from './data/trilha';
import { campanhaPara, prazoLabel, ateLabel, diasRestantes, encerrada } from './data/campanha';
import Certificado from './Certificado';

function StepRow({ step, isNext }: { step: TrilhaStep; isNext: boolean }) {
  const p = step.product;
  const icon =
    step.status === 'dominada' ? <Check size={16} className="wp-ico" /> :
    step.status === 'assistida' ? <Play size={14} className="wp-ico" /> :
    <Circle size={13} className="wp-ico" />;
  const tag =
    step.status === 'dominada' ? 'Dominada' :
    step.status === 'assistida' ? 'Assistida' : 'A fazer';
  return (
    <Link to={`/eleva/produto/${p.id}`} className={`wp-tr-step wp-tr-${step.status} ${isNext ? 'wp-tr-next' : ''}`}>
      <span className="wp-tr-step-ic">{icon}</span>
      <span className="wp-tr-step-body">
        <b className="wp-tr-step-name">{p.name}</b>
        <span className="wp-tr-step-tag">{tag}{isNext ? ' · continue aqui' : ''}</span>
      </span>
      <ArrowRight size={16} className="wp-ico wp-tr-step-go" />
    </Link>
  );
}

export default function Trilha() {
  useStore();
  const { brandId, brand } = useBrand();
  const { user } = useAuth();
  const trilha = useMemo(() => getTrilha(brandId, user?.role), [brandId, user?.role]);
  const campanha = campanhaPara(user?.role);
  const { steps, total, mastered, pct, complete, next } = trilha;

  const certDate = complete ? ensureCertDate(brandId) : null;
  const nome = (user?.name || '').trim() || 'Vendedora';

  return (
    <div className="wp-trilha">
      <div className="wp-tr-hero">
        <h1 className="wp-tr-title"><GraduationCap size={20} className="wp-ico" /> Sua trilha</h1>
        <p className="wp-tr-sub">Aprenda os produtos da {brand.name}, um de cada vez. Acertar o quiz marca o produto como dominado.</p>
      </div>

      {/* Campanha: o prazo é o que tira a trilha do "faço qualquer dia" */}
      {campanha && !complete && (
        <div className={`wp-tr-camp ${diasRestantes(campanha.ate) <= 3 ? 'urg' : ''}`}>
          <div className="wp-tr-camp-top">
            <span className="wp-tr-camp-nome"><Flag size={14} className="wp-ico" /> {campanha.nome}</span>
            <span className="wp-tr-camp-prazo">
              <Clock size={12} className="wp-ico" /> {prazoLabel(campanha)}
            </span>
          </div>
          <p className="wp-tr-camp-desc">
            {encerrada(campanha)
              ? 'A campanha encerrou, mas a trilha continua aberta.'
              : `${campanha.desc} Vai até ${ateLabel(campanha)}.`}
          </p>
        </div>
      )}

      {/* Progresso geral */}
      <div className="wp-tr-prog">
        <div className="wp-tr-prog-top">
          <span className="wp-tr-prog-num">{mastered}<span>/{total}</span></span>
          <span className="wp-tr-prog-lbl">produtos dominados</span>
        </div>
        <div className="wp-tr-bar"><span style={{ width: `${pct}%`, background: brand.accent }} /></div>
        <span className="wp-tr-prog-pct">{pct}% da trilha</span>
      </div>

      {/* Certificado: liberado ou trancado */}
      {complete && certDate ? (
        <div className="wp-tr-cert-done">
          <div className="wp-tr-cert-hd"><Trophy size={18} className="wp-ico" /> Certificado liberado!</div>
          <p className="wp-tr-cert-msg">
            Você concluiu a formação {campanha ? `em ${campanha.certTitulo}` : `da ${brand.name}`}. Baixe e compartilhe —
            vale como credencial no seu perfil profissional:
          </p>
          <Certificado
            name={nome}
            brandName={brand.name}
            date={formatCertDate(certDate)}
            accent={brand.accent}
            titulo={campanha?.certTitulo}
            competencia={campanha?.certSub}
            role={user?.role}
          />
        </div>
      ) : (
        <div className="wp-tr-cert-lock">
          <Lock size={16} className="wp-ico" />
          <span>Domine os {total} produtos para liberar seu <b>certificado da {brand.name}</b> — faltam {total - mastered}.</span>
        </div>
      )}

      {/* Continuar de onde parou */}
      {next && (
        <Link to={`/eleva/produto/${next.id}`} className="wp-tr-continue">
          <span>
            <span className="wp-tr-continue-lbl">Continuar a trilha</span>
            <b>{next.name}</b>
          </span>
          <ArrowRight size={18} className="wp-ico" />
        </Link>
      )}

      {/* Passos */}
      <div className="wp-tr-steps">
        {steps.map((s) => (
          <StepRow key={s.product.id} step={s} isNext={!!next && s.product.id === next.id} />
        ))}
      </div>
    </div>
  );
}
