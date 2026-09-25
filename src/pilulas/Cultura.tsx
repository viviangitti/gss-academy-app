// NOSSA CULTURA — a fonte, dentro do app (só Ramasa).
//
// Os três pilares, os nove valores e o texto oficial do Grupo. Existe para o
// material não viver num PDF que ninguém acha: quando o card do Hoje fala de
// um valor, é para cá que ele leva.
import { Link } from 'react-router-dom';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';
import { getStats } from './data/tracking';
import { PILARES, VALORES, linhaNoApp, valoresDoPilar, temValores, valorDaSemana, pilaresDe, grupoDoCargo } from './data/valores';

const COMO_ME_CHAMA: Record<string, string> = {
  ponta: 'quem atende no salão',
  vendas: 'a gerência de vendas',
  acessorios: 'quem cuida de acessórios',
  leads: 'quem cuida dos leads',
  qualidade: 'a qualidade',
  diretoria: 'a diretoria do grupo',
};

export default function Cultura() {
  const { brandId, brand } = useBrand();
  const { user } = useAuth();
  if (!temValores(brandId)) {
    return (
      <div className="wp-cult">
        <Link to="/eleva" className="wp-news-back"><ChevronLeft size={16} className="wp-ico" /> Voltar</Link>
        <p className="wp-news-msg">A tela de cultura existe hoje só para a Ramasa.</p>
      </div>
    );
  }
  const daSemana = valorDaSemana();
  const soma = pilaresDe(getStats().perValor);
  return (
    <div className="wp-cult">
      <Link to="/eleva" className="wp-news-back"><ChevronLeft size={16} className="wp-ico" /> Voltar</Link>

      <h1 className="wp-cult-tit">Nossa cultura</h1>
      <p className="wp-cult-sigla">
        {PILARES.map((p, i) => (
          <span key={p.id}>
            <b style={{ color: p.cor }}>{p.sigla}</b>{p.nome.slice(2).toLowerCase()}{i < PILARES.length - 1 ? ' · ' : ''}
          </span>
        ))}
      </p>
      <p className="wp-cult-recorte">
        As linhas “no app” abaixo são as de <b>{COMO_ME_CHAMA[grupoDoCargo(user?.cargo, user?.role)]}</b> —
        o mesmo valor pede coisas diferentes de cada função.
      </p>
      <p className="wp-cult-lead">
        O nome da empresa é a própria régua. No {brand.name.split('·')[0].trim()}, cada coisa que você faz
        no app carimba um destes nove valores — e é assim que a cultura aparece no que foi feito, não só na parede.
      </p>

      <div className="wp-cult-semana">
        <span className="wp-cult-semana-rot"><Sparkles size={13} className="wp-ico" /> Valor desta semana</span>
        <b>{daSemana.nome}</b>
        <i>{linhaNoApp(daSemana, user?.cargo, user?.role)}</i>
      </div>

      {PILARES.map((p) => (
        <section className="wp-cult-pilar" key={p.id}>
          <div className="wp-cult-pilar-cab">
            <span className="wp-cult-pilar-nome" style={{ background: p.cor }}>{p.nome}</span>
            <span className="wp-cult-pilar-conta">{soma[p.id]} {soma[p.id] === 1 ? 'vez' : 'vezes'} no mês</span>
          </div>
          <p className="wp-cult-lema">{p.lema}</p>
          {valoresDoPilar(p.id).map((v) => (
            <div className="wp-cult-valor" key={v.id}>
              <b>{v.nome}</b>
              <p>{v.texto}</p>
              <span className="wp-cult-noapp">No app: {linhaNoApp(v, user?.cargo, user?.role)}</span>
            </div>
          ))}
        </section>
      ))}

      <p className="wp-cult-rodape">
        Material de cultura do Grupo Ramasa. Os textos dos valores são os do Grupo, sem edição —
        o que o app acrescenta é a linha “no app”, que liga o valor ao que você faz aqui.
        São {VALORES.length} valores em {PILARES.length} pilares.
      </p>
    </div>
  );
}
