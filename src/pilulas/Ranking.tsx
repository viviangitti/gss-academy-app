import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Trophy, Flame, Target, Check, Medal, User, Rocket, ArrowRight, Users } from 'lucide-react';
import { getStats, WEEKLY_GOAL } from './data/tracking';
import { getDesafio } from './data/desafio';
import { carregarPlacar, type LinhaPlacar } from './data/placar';
import { useBrand } from './BrandContext';
import { vocab } from './data/vocabulario';

const MEDAL_COLOR = ['#c9a84c', '#9ca3af', '#b8763e']; // ouro, prata, bronze

interface Row {
  points: number;
  streak: number;
  me?: boolean;
}

export default function Ranking() {
  const stats = getStats();
  const { brandId } = useBrand();
  const v = vocab(brandId);

  // O placar vem do time de verdade (ver data/placar.ts). Antes vinham oito
  // colegas inventados no código, e quem estava em primeiro no time via a tela
  // dizer "4º lugar" — atrás de gente que não existe.
  const [placar, setPlacar] = useState<LinhaPlacar[] | null>(null);
  useEffect(() => {
    let vivo = true;
    carregarPlacar(brandId, stats.week)
      .then((r) => { if (vivo) setPlacar(r); })
      .catch(() => { if (vivo) setPlacar([]); });
    return () => { vivo = false; };
  }, [brandId, stats.week]);

  // A pontuação local é a mais fresca: ela conta a pílula do segundo passado,
  // que ainda pode não ter subido. Por isso ela sobrescreve a minha linha.
  const rows: Row[] = (() => {
    const outros = (placar || []).filter((l) => !l.eu).map((l) => ({ points: l.pontos, streak: l.streak }));
    return [...outros, { points: stats.weekPoints, streak: stats.streak, me: true }]
      .sort((a, b) => b.points - a.points);
  })();

  const myIndex = rows.findIndex((r) => r.me);
  const myRank = myIndex + 1;
  const minhaPos = myRank;
  const above = rows[myIndex - 1];
  const gap = above ? above.points - rows[myIndex].points : 0;

  // Time de uma pessoa só não tem ranking: mostrar pódio com um degrau ocupado
  // e dois vazios não motiva ninguém, e inventar colega foi o erro que a gente
  // acabou de desfazer.
  const temTime = rows.length > 1;
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  const goalPct = Math.min(100, Math.round((stats.weekViews / WEEKLY_GOAL) * 100));
  const desafio = getDesafio();

  return (
    <div className="wp-ranking">
      <div className="wp-rk-hero">
        <h1 className="wp-rk-title"><Trophy size={20} className="wp-ico" color="#c9a84c" /> Ranking do Mês</h1>
        <p className="wp-rk-sub">Quem estuda e publica mais, vende mais. O placar reinicia todo dia 1º.</p>
      </div>

      {/* Missão + ofensiva */}
      <div className="wp-rk-cards">
        <div className="wp-rk-mini">
          <span className="wp-rk-mini-num"><Flame size={19} className="wp-ico" color="#e8730a" /> {stats.streak}</span>
          <span className="wp-rk-mini-lbl">dias seguidos</span>
        </div>
        <div className="wp-rk-mini">
          <span className="wp-rk-mini-num">{stats.weekPoints}</span>
          <span className="wp-rk-mini-lbl">pontos · {myRank}º lugar</span>
        </div>
      </div>

      <div className="wp-mission">
        <div className="wp-mission-top">
          <span><Target size={14} className="wp-ico" /> Missão do mês</span>
          <span>
            {stats.weekViews}/{WEEKLY_GOAL} pílulas
          </span>
        </div>
        <div className="wp-mission-bar">
          <div className="wp-mission-fill" style={{ width: `${goalPct}%` }} />
        </div>
        <p className="wp-mission-reward">
          {goalPct >= 100
            ? <><Check size={12} className="wp-ico" /> Missão batida! Você concorre ao brinde do mês.</>
            : 'Complete e ganhe um selo + brinde no fim do mês.'}
        </p>
      </div>

      {/* Desafio coletivo — a rede toda soma junto */}
      <div className="wp-desafio">
        <div className="wp-desafio-top">
          <span className="wp-desafio-title"><Users size={15} className="wp-ico" /> Desafio da rede</span>
          {desafio.demo && <span className="wp-desafio-demo">· exemplo</span>}
        </div>
        <p className="wp-desafio-goal">
          <b>{desafio.atual}</b> de {desafio.meta} pílulas assistidas por toda a rede este mês
        </p>
        <div className="wp-desafio-bar">
          <div className="wp-desafio-fill" style={{ width: `${desafio.pct}%` }} />
        </div>
        <p className="wp-desafio-foot">
          {desafio.faltam > 0
            ? <>Faltam <b>{desafio.faltam}</b> · sua parte: <b>{desafio.minhaParte}</b>. {desafio.premio}.</>
            : <><Check size={12} className="wp-ico" /> Meta batida! {desafio.premio}.</>}
        </p>
      </div>

      {/* O placar é o time de verdade. A escada chega sem nome nenhum — é só
          uid e pontos no servidor —, então dá pra liberar a leitura pra quem
          vende sem expor o desempenho de ninguém. */}
      {placar === null && <p className="wp-rk-exemplo">Carregando o placar do time…</p>}
      {placar !== null && !temTime && (
        <p className="wp-rk-exemplo">
          Você é a única pessoa do time com pontos este mês. O ranking aparece
          quando mais alguém do time começar a pontuar.
        </p>
      )}

      {/* Pódio */}
      {/* Ranking com nome expõe quem está na lanterna na frente dos colegas, e
          num showroom isso azeda rápido. Mas tirar tudo mata o incentivo:
          ninguém corre sozinho no escuro. O meio: a pessoa vê a POSIÇÃO de
          todo mundo e o quanto falta pra passar da frente — sem saber quem é.
          O gestor continua vendo os nomes: sem isso ele não consegue gerir. */}
      {temTime && (
      <div className="wp-podium">
        {[1, 0, 2].map((slot) => {
          const r = podium[slot];
          if (!r) return <div key={slot} className="wp-pod wp-pod-empty" />;
          const place = slot + 1;
          return (
            <div key={slot} className={`wp-pod wp-pod-${place} ${r.me ? 'me' : ''}`}>
              <div className="wp-pod-medal"><Medal size={24} color={MEDAL_COLOR[slot]} /></div>
              <div className="wp-pod-av"><User size={r.me ? 18 : 16} /></div>
              <div className="wp-pod-name">{r.me ? 'Você' : `${place}º lugar`}</div>
              <div className="wp-pod-pts">{r.points} pts</div>
              <div className="wp-pod-base">{place}º</div>
            </div>
          );
        })}
      </div>
      )}

      {/* Linha de motivação */}
      {above && (
        <div className="wp-gap">
          Faltam <b>{gap} pts</b> ({Math.ceil(gap / 10)} {v.pilulas}) para passar para a <b>{minhaPos - 1}ª posição</b> <Rocket size={14} className="wp-ico" />
        </div>
      )}

      {/* Lista do 4º pra baixo */}
      <div className="wp-rk-list">
        {rest.map((r, i) => (
          <div key={i} className={`wp-rk-row ${r.me ? 'me' : ''}`}>
            <span className="wp-rk-pos">{i + 4}º</span>
            <span className="wp-rk-av"><User size={r.me ? 15 : 14} /></span>
            <span className="wp-rk-info">
              <b>{r.me ? 'Você' : 'Colega de time'}</b>
            </span>
            <span className="wp-rk-streak"><Flame size={12} className="wp-ico" />{r.streak}</span>
            <span className="wp-rk-pts">{r.points}</span>
          </div>
        ))}
      </div>

      <Link to="/eleva/catalogo" className="wp-rk-cta">
        Assistir {v.pilulas} e subir no ranking <ArrowRight size={15} className="wp-ico" />
      </Link>
    </div>
  );
}
