import { Link } from 'react-router-dom';
import { Infinity as InfinityIcon, Heart, Sparkles, Target, Store, Users, ChevronLeft } from 'lucide-react';
import { useBrand } from './BrandContext';
import { getAbout } from './data/about';

// "Quem é a marca" — página institucional objetiva. Dá contexto para o afiliado
// vender com segurança: propósito, valores e credibilidade da empresa.
export default function Sobre() {
  const { brandId, brand } = useBrand();
  const about = getAbout(brandId);

  if (!about) {
    return (
      <div className="wp-about">
        <Link to="/eleva" className="wp-about-back"><ChevronLeft size={16} className="wp-ico" /> Voltar</Link>
        <p className="wp-td-nohit">Ainda não há uma página institucional para {brand.name}.</p>
      </div>
    );
  }

  return (
    <div className="wp-about">
      <Link to="/eleva" className="wp-about-back"><ChevronLeft size={16} className="wp-ico" /> Voltar</Link>

      <section className="wp-about-hero">
        <span className="wp-about-mark"><InfinityIcon size={30} strokeWidth={2.2} /></span>
        <h1>{brand.name}</h1>
        <p className="wp-about-meaning">{about.meaning}</p>
        <p className="wp-about-tagline">“{about.tagline}”</p>
      </section>

      <section className="wp-about-card">
        <span className="wp-about-label"><Heart size={13} className="wp-ico" /> Propósito</span>
        <p className="wp-about-p">{about.purpose}</p>
      </section>

      <section className="wp-about-card">
        <span className="wp-about-label"><Sparkles size={13} className="wp-ico" /> Nossos valores</span>
        <ul className="wp-about-values">
          {about.values.map((v) => (
            <li key={v.title}>
              <b>{v.title}</b>
              <span>{v.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="wp-about-card">
        <span className="wp-about-label"><Target size={13} className="wp-ico" /> Foco</span>
        <p className="wp-about-p">{about.focus}</p>
      </section>

      <section className="wp-about-card wp-about-stat">
        <span className="wp-about-stat-num" style={{ color: brand.accentDeep }}>{about.stat.number}</span>
        <span className="wp-about-stat-lb"><Store size={14} className="wp-ico" /> {about.stat.label}</span>
        <div className="wp-about-clients">
          {about.clients.map((c) => (
            <span key={c} className="wp-about-client">{c}</span>
          ))}
        </div>
      </section>

      <section className="wp-about-card">
        <span className="wp-about-label"><Users size={13} className="wp-ico" /> Quem está por trás</span>
        <p className="wp-about-p">{about.leadership}</p>
      </section>

      <p className="wp-about-foot">
        Quem indica a {brand.name} representa uma empresa séria, presente em milhares de farmácias — use isso a seu favor.
      </p>
    </div>
  );
}
