import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Copy, Check, Play, ArrowUpRight, Plus, Minus, CalendarDays, Flame, Lightbulb, Trophy } from 'lucide-react';
import { MISSIONS, KIND_LABEL, type Mission } from './data/missions';
import { getStats, recordMission, isMissionDone } from './data/tracking';
import { creatorLevel, ACHIEVEMENTS } from './data/creator';
import { CHANNELS, type Channel, type CalendarDay, type Trend } from './data/creatorContent';
import { allCalendar, allTrends, useStore } from './data/store';
import { useBrand } from './BrandContext';

const chan = (id: Channel) => CHANNELS.find((c) => c.id === id)!;
const KIND_CHANNEL: Record<Mission['kind'], Channel> = {
  stories: 'instagram', reels: 'instagram', status: 'whatsapp', feed: 'instagram',
};

const CAL_POINTS = 15;

function CalendarCard({ d, onDone }: { d: CalendarDay; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const c = chan(d.channel);
  const C = c.Icon;
  const key = `cal|${d.day}|${d.tema}`;
  const done = isMissionDone(key);
  return (
    <div className={`wp-cal-card ${done ? 'done' : ''}`}>
      <div className="wp-cal-day" style={{ background: c.color }}>{d.day}</div>
      <div className="wp-cal-body">
        <div className="wp-cal-top">
          <span className="wp-cal-chan"><C size={12} className="wp-ico" /> {c.label}</span>
          <span className="wp-cal-fmt">{d.format}</span>
        </div>
        <p className="wp-cal-tema">{d.tema}</p>
        <button className="wp-cal-toggle" onClick={() => setOpen((o) => !o)}>
          {open ? 'Esconder roteiro' : 'Ver roteiro'}
        </button>
        {open && (
          <ul className="wp-cal-roteiro">
            {d.roteiro.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        )}
      </div>
      <button
        className={`wp-cal-check ${done ? 'on' : ''}`}
        aria-label={done ? 'Feito' : 'Marcar como feito'}
        title={done ? 'Feito!' : `Marcar como feito (+${CAL_POINTS} pts)`}
        onClick={() => { if (!done) { recordMission(key, CAL_POINTS); onDone(); } }}
      >
        <Check size={16} className="wp-ico" />
      </button>
    </div>
  );
}

function TrendCard({ t, onDone }: { t: Trend; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const c = chan(t.channel);
  const C = c.Icon;
  const key = `trend|${t.id}`;
  const done = isMissionDone(key);
  const use = () => {
    navigator.clipboard?.writeText(`${t.title}\n${t.desc}\nDica: ${t.dica}`).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 1500); },
      () => {}
    );
  };
  return (
    <div className={`wp-trend-card ${done ? 'done' : ''}`}>
      <span className="wp-trend-tag" style={{ color: c.color }}><C size={12} className="wp-ico" /> {t.tag}</span>
      <h4 className="wp-trend-title">{t.title}</h4>
      <p className="wp-trend-desc">{t.desc}</p>
      <p className="wp-trend-dica"><Lightbulb size={13} className="wp-ico" /> {t.dica}</p>
      <div className="wp-trend-foot">
        <button className="wp-trend-use" onClick={use}>{copied ? <><Check size={14} className="wp-ico" /> Copiado</> : 'Usar essa ideia'}</button>
        {done ? (
          <span className="wp-trend-done"><Check size={15} className="wp-ico" /> Usei</span>
        ) : (
          <button
            className="wp-trend-check"
            aria-label="Marcar que usei"
            title="Marquei que usei (+15 pts)"
            onClick={() => { recordMission(key, 15); onDone(); }}
          ><Check size={16} className="wp-ico" /></button>
        )}
      </div>
    </div>
  );
}

function MissionCard({ m, onDone }: { m: Mission; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const done = isMissionDone(m.id);
  const kind = KIND_LABEL[m.kind];
  const KindIcon = kind.Icon;

  const copyKit = () => {
    const text = `${m.caption}\n\n${m.hashtags}`;
    navigator.clipboard?.writeText(text).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 1600); },
      () => {}
    );
  };

  const share = () => {
    const text = `${m.caption}\n\n${m.hashtags}`;
    if (navigator.share) { navigator.share({ text }).catch(() => {}); return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className={`wp-ms-card ${done ? 'done' : ''}`}>
      <div className="wp-ms-head">
        <span className="wp-ms-kind"><KindIcon size={13} className="wp-ico" /> {kind.label}</span>
        <span className="wp-ms-pts">+{m.points} pts</span>
      </div>
      <h3 className="wp-ms-title">{m.title}</h3>
      <p className="wp-ms-goal">{m.goal}</p>

      <button className="wp-ms-kit-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? <Minus size={13} className="wp-ico" /> : <Plus size={13} className="wp-ico" />}
        {open ? ' Esconder kit pronto' : ' Ver kit pronto (legenda + hashtags)'}
      </button>

      {open && (
        <div className="wp-ms-kit">
          <span className="wp-ms-kit-label">LEGENDA</span>
          <p className="wp-ms-caption">{m.caption}</p>
          <span className="wp-ms-kit-label">HASHTAGS</span>
          <p className="wp-ms-hashtags">{m.hashtags}</p>
          <div className="wp-ms-kit-actions">
            <button className="wp-ms-copy" onClick={copyKit}>
              {copied ? <Check size={14} className="wp-ico" /> : <Copy size={14} className="wp-ico" />}
              {copied ? ' Copiado!' : ' Copiar tudo'}
            </button>
            {m.productId && (
              <Link to={`/eleva/produto/${m.productId}`} className="wp-ms-open">
                <Play size={13} className="wp-ico" /> Abrir pílula
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="wp-ms-foot">
        <button className="wp-ms-share" onClick={share}>
          <ArrowUpRight size={15} className="wp-ico" /> Compartilhar
        </button>
        {done ? (
          <span className="wp-ms-doneflag"><Check size={15} className="wp-ico" /> Postado</span>
        ) : (
          <button className="wp-ms-mark" onClick={() => { recordMission(m.id, m.points); onDone(); }}>
            Já postei <Check size={14} className="wp-ico" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Missoes() {
  const [, force] = useState(0);
  const [channel, setChannel] = useState<Channel | 'todos'>('todos');
  useStore(); // re-renderiza quando o gestor edita calendário/tendências
  const { brandId } = useBrand();
  const stats = getStats();
  const level = creatorLevel(stats.totalMissions);
  const missions = MISSIONS.filter((m) => m.brand === brandId);
  const doneCount = missions.filter((m) => isMissionDone(m.id)).length;

  const inChannel = (ch: Channel) => channel === 'todos' || ch === channel;
  const cal = allCalendar(brandId).filter((d) => inChannel(d.channel));
  const trends = allTrends(brandId).filter((t) => inChannel(t.channel));
  const missionsF = missions.filter((m) => inChannel(KIND_CHANNEL[m.kind]));

  return (
    <div className="wp-missoes">
      <div className="wp-ms-hero">
        <h1 className="wp-ms-hero-title"><Clapperboard size={20} className="wp-ico" /> Vire creator da marca</h1>
        <p className="wp-ms-hero-sub">
          Calendário, roteiros e tendências prontos — para WhatsApp, Instagram e TikTok. Publicou, pontuou.
        </p>
        <div className="wp-ms-hero-stats">
          <span><b>{doneCount}/{missions.length}</b> missões</span>
          <span><b>{stats.weekPoints}</b> pts no mês</span>
        </div>
      </div>

      {/* Nível de creator + mural de selos */}
      <div className="wp-cr-level">
        <div className="wp-cr-level-top">
          <span className="wp-cr-badge" style={{ background: level.current.color }}>
            Creator {level.current.name}
          </span>
          <span className="wp-cr-next">
            {level.next ? `faltam ${level.toNext} post(s) pro ${level.next.name}` : <>nível máximo <Trophy size={13} className="wp-ico" /></>}
          </span>
        </div>
        <div className="wp-cr-bar">
          <div className="wp-cr-fill" style={{ width: `${level.pct}%`, background: level.current.color }} />
        </div>
        <div className="wp-cr-seals">
          {ACHIEVEMENTS.map((a) => {
            const on = a.unlocked(stats);
            return (
              <div key={a.id} className={`wp-cr-seal ${on ? 'on' : ''}`} title={a.label}>
                <a.Icon size={17} className="wp-ico" />
                <span>{a.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="wp-ms-link">
        <span className="wp-ms-link-label">SEU LINK DE CREATOR · EM BREVE</span>
        <div className="wp-ms-link-row">
          <code>eleva.link/vc-maria</code>
          <button
            aria-label="Copiar link"
            onClick={() => navigator.clipboard?.writeText('https://eleva.link/vc-maria')}
          ><Copy size={15} className="wp-ico" /></button>
        </div>
        <p className="wp-ms-link-note">Em breve: um link exclusivo para acompanhar as vendas que você indica.</p>
      </div>

      {/* Filtro de canal */}
      <div className="wp-cr-channels">
        <button className={`wp-cr-chbtn ${channel === 'todos' ? 'on' : ''}`} onClick={() => setChannel('todos')}>Todos</button>
        {CHANNELS.map((c) => {
          const C = c.Icon;
          return (
            <button
              key={c.id}
              className={`wp-cr-chbtn ${channel === c.id ? 'on' : ''}`}
              style={channel === c.id ? { color: c.color, borderColor: c.color } : undefined}
              onClick={() => setChannel(c.id)}
            >
              <C size={14} className="wp-ico" /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Calendário de conteúdo */}
      <h2 className="wp-ms-section"><CalendarDays size={16} className="wp-ico" /> Calendário da semana</h2>
      <div className="wp-cal">
        {cal.map((d, i) => <CalendarCard key={i} d={d} onDone={() => force((n) => n + 1)} />)}
      </div>

      {/* Tendências */}
      <h2 className="wp-ms-section"><Flame size={16} className="wp-ico" color="#e8730a" /> Tendências agora</h2>
      <div className="wp-trends">
        {trends.map((t) => <TrendCard key={t.id} t={t} onDone={() => force((n) => n + 1)} />)}
      </div>

      {/* Missões */}
      <h2 className="wp-ms-section">Missões do mês</h2>
      <div className="wp-ms-list">
        {missionsF.length === 0 && <p className="wp-cr-empty">Sem missão nesse canal — veja o calendário e as tendências acima.</p>}
        {missionsF.map((m) => (
          <MissionCard key={m.id} m={m} onDone={() => force((n) => n + 1)} />
        ))}
      </div>
    </div>
  );
}
