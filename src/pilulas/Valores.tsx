// AS PEÇAS DE CULTURA NA TELA (só Ramasa — ver data/valores.ts).
//
// Três peças pequenas, no lugar onde a pessoa já está:
//   CarimboValor  — o selo que aparece no segundo em que a ação acontece;
//   ValorDaSemana — o card do Hoje, com o valor da semana e o que fazer nele;
//   MeusPilares   — quantas vezes a pessoa praticou cada pilar no mês.
// Nenhuma delas inventa número novo: tudo sai do que o app já registra.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useBrand } from './BrandContext';
import { useCarimbo, limparCarimbo } from './data/carimbo';
import { getStats } from './data/tracking';
import { PILARES, pilaresDe, temValores, valorDaSemana, valorPorId, pilar as pilarDe } from './data/valores';

/** O selo da ação. Fica três segundos e sai sozinho. */
export function CarimboValor() {
  const { brandId } = useBrand();
  const carimbo = useCarimbo();
  useEffect(() => {
    if (!carimbo) return;
    const t = setTimeout(limparCarimbo, 3400);
    return () => clearTimeout(t);
  }, [carimbo]);
  if (!temValores(brandId) || !carimbo) return null;
  const valor = valorPorId(carimbo.valorId);
  if (!valor) return null;
  const p = pilarDe(valor.pilar);
  return (
    <div className="wp-carimbo" role="status" onClick={limparCarimbo}>
      <span className="wp-carimbo-ic" style={{ background: p.cor }}>{p.sigla}</span>
      <span>
        <b>{valor.nome}</b>
        <i>{p.nome} · {valor.texto}</i>
      </span>
    </div>
  );
}

/** O card do Hoje: o valor desta semana e o que ele quer dizer no app. */
export function ValorDaSemana() {
  const { brandId } = useBrand();
  if (!temValores(brandId)) return null;
  const valor = valorDaSemana();
  const p = pilarDe(valor.pilar);
  return (
    <Link to="/eleva/cultura" className="wp-valsem">
      <span className="wp-valsem-topo">
        <span className="wp-valsem-pilar" style={{ background: p.cor }}>{p.nome}</span>
        <span className="wp-valsem-rot">Valor da semana</span>
        <ChevronRight size={16} className="wp-ico wp-valsem-seta" />
      </span>
      <b className="wp-valsem-nome">{valor.nome}</b>
      <span className="wp-valsem-texto">{valor.texto}</span>
      <span className="wp-valsem-app"><Sparkles size={13} className="wp-ico" /> {valor.noApp}</span>
    </Link>
  );
}

/**
 * O TIME PELOS PILARES — no Painel do gestor.
 *
 * Mostra quantas PESSOAS praticaram cada pilar no mês, não quem praticou mais.
 * É de propósito: ranking de valor entre colegas vira concurso de simpatia, e
 * a cultura perde. O que a gerência precisa saber é qual pilar o time deixou
 * para trás — isso é pauta de reunião, não de pódio.
 */
export function TimePelosPilares({ pessoas }: { pessoas: { pilares?: { razao: number; magia: number; satisfacao: number } }[] }) {
  const { brandId } = useBrand();
  if (!temValores(brandId) || !pessoas.length) return null;
  const quantos = (id: 'razao' | 'magia' | 'satisfacao') => pessoas.filter((p) => (p.pilares?.[id] || 0) > 0).length;
  const total = pessoas.length;
  const algum = PILARES.some((p) => quantos(p.id) > 0);
  return (
    <div className="wp-pilares" style={{ marginTop: 12 }}>
      <div className="wp-pilares-topo">
        <span className="wp-pilares-rot">O time pelos pilares</span>
        <Link to="/eleva/cultura" className="wp-pilares-link">Nossa cultura <ChevronRight size={13} className="wp-ico" /></Link>
      </div>
      {!algum ? (
        <p className="wp-pilares-vazio">
          Ninguém praticou nenhum pilar neste mês ainda. Cada ação do time no app — estudar, responder
          com dado, registrar objeção, abrir a condição — carimba um valor e aparece aqui.
        </p>
      ) : (
        PILARES.map((p) => {
          const n = quantos(p.id);
          return (
            <div className="wp-pilar-linha" key={p.id}>
              <div className="wp-pilar-top">
                <b>{p.nome}</b>
                <span>{n} de {total} {total === 1 ? 'pessoa' : 'pessoas'}</span>
              </div>
              <div className="wp-pilar-tr">
                <i style={{ width: `${total ? Math.round((n / total) * 100) : 0}%`, background: p.cor }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/** Quantas vezes cada pilar foi praticado neste mês — na tela do Perfil. */
export function MeusPilares() {
  const { brandId } = useBrand();
  if (!temValores(brandId)) return null;
  const soma = pilaresDe(getStats().perValor);
  const total = PILARES.reduce((n, p) => n + soma[p.id], 0);
  return (
    <div className="wp-pilares">
      <div className="wp-pilares-topo">
        <span className="wp-pilares-rot">Seus pilares no mês</span>
        <Link to="/eleva/cultura" className="wp-pilares-link">Nossa cultura <ChevronRight size={13} className="wp-ico" /></Link>
      </div>
      {total === 0 ? (
        <p className="wp-pilares-vazio">
          Nada praticado ainda neste mês. Cada coisa que você faz no app — estudar um carro, responder
          com dado, registrar uma objeção — carimba um valor aqui.
        </p>
      ) : (
        PILARES.map((p) => (
          <div className="wp-pilar-linha" key={p.id}>
            <div className="wp-pilar-top">
              <b>{p.nome}</b>
              <span>{soma[p.id]} {soma[p.id] === 1 ? 'vez' : 'vezes'}</span>
            </div>
            <div className="wp-pilar-tr">
              <i style={{ width: `${total ? Math.round((soma[p.id] / total) * 100) : 0}%`, background: p.cor }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
