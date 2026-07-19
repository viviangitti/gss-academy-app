import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Trophy, GraduationCap, Bell, BellOff, LogOut, Check, Tag, ChevronRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';
import { roleLabel } from './data/roles';
import { getStats } from './data/tracking';
import { getTrilha } from './data/trilha';
import { getAfiliadoCode, setAfiliadoCode } from './data/afiliadoCode';
import { notifState, notifPref, enableNotif, disableNotif } from './data/lembrete';
import { updateElevaName } from './data/profile';
import { auth } from '../services/firebase';

// Iniciais do nome pro avatar (ex.: "Ana Paula" -> "AP").
function initials(name?: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export default function Perfil() {
  const { user, logout } = useAuth();
  const { brandId, brand } = useBrand();
  const stats = getStats();
  const trilha = getTrilha(brandId, user?.role);

  const [code, setCode] = useState(() => getAfiliadoCode(user?.email));
  const [codeSaved, setCodeSaved] = useState(false);
  const [notifOn, setNotifOn] = useState(() => notifState() === 'granted' && notifPref());
  const [nome, setNome] = useState(user?.name || '');
  const [nomeBusy, setNomeBusy] = useState(false);

  const salvarNome = async () => {
    const uid = auth?.currentUser?.uid;
    if (!uid || !nome.trim() || nome.trim() === user?.name) return;
    setNomeBusy(true);
    await updateElevaName(uid, nome);
    // Recarrega pra o app reler o perfil e mostrar o nome novo em todo lugar.
    window.location.reload();
  };

  const salvarCode = () => {
    if (!user?.email) return;
    setAfiliadoCode(user.email, code);
    setCodeSaved(true);
    setTimeout(() => setCodeSaved(false), 1800);
  };

  const toggleNotif = async () => {
    if (notifOn) {
      disableNotif();
      setNotifOn(false);
      return;
    }
    const ok = await enableNotif();
    setNotifOn(!!ok);
  };

  if (!user) return null;

  return (
    <div className="wp-perfil">
      <div className="wp-perfil-head">
        <div className="wp-perfil-av">{initials(user.name)}</div>
        <div className="wp-perfil-id">
          <h1>{user.name}</h1>
          <p>{roleLabel(user.role, user.affiliateType)}</p>
          <span className="wp-perfil-brand">{brand.name}</span>
        </div>
      </div>

      {/* Editar o nome — antes não dava, e o ranking mostrava o e-mail de quem não preencheu */}
      <div className="wp-perfil-card">
        <span className="wp-perfil-label">Seu nome</span>
        <input
          className="wp-perfil-input"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como você quer aparecer"
          onFocus={(e) => e.target.select()}
        />
        <p className="wp-perfil-hint">É o nome que aparece no painel e no ranking do time.</p>
        <button className="wp-perfil-save" onClick={salvarNome} disabled={nomeBusy || !nome.trim() || nome.trim() === user.name}>
          {nomeBusy ? 'Salvando…' : 'Salvar nome'}
        </button>
      </div>

      {/* Resumo — só pra quem consome conteúdo (gestor não tem trilha/pontos) */}
      {user.role !== 'gestor' && (
        <>
          <div className="wp-perfil-stats">
            <div className="wp-perfil-stat">
              <b>{stats.weekPoints}</b>
              <span><Trophy size={12} className="wp-ico" /> pontos no mês</span>
            </div>
            <div className="wp-perfil-stat">
              <b>{stats.streak}</b>
              <span><Flame size={12} className="wp-ico" /> dias seguidos</span>
            </div>
            <div className="wp-perfil-stat">
              <b>{trilha.mastered}/{trilha.total}</b>
              <span><GraduationCap size={12} className="wp-ico" /> dominados</span>
            </div>
          </div>

          <Link to="/eleva/trilha" className="wp-perfil-link">
            <GraduationCap size={16} className="wp-ico" />
            <span>
              {trilha.complete ? 'Ver seu certificado' : 'Continuar a formação'}
              <i>{trilha.complete ? `Você dominou os ${trilha.total} produtos` : `Faltam ${trilha.total - trilha.mastered} para o certificado`}</i>
            </span>
            <ChevronRight size={16} className="wp-ico" />
          </Link>
        </>
      )}

      {/* Código do afiliado — é o que faz a venda ser creditada a ele */}
      {user.role === 'afiliado' && (
        <div className="wp-perfil-card">
          <span className="wp-perfil-label"><Tag size={13} className="wp-ico" /> Seu código de afiliado</span>
          <input
            className="wp-perfil-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex.: MARINA10"
            onFocus={(e) => e.target.select()}
          />
          <p className="wp-perfil-hint">
            É o código que identifica a venda como sua. Assim que a Meraki liberar o programa de
            afiliados, ele entra automaticamente no link que você manda pra cliente.
          </p>
          <button className="wp-perfil-save" onClick={salvarCode}>
            {codeSaved ? <><Check size={15} className="wp-ico" /> Salvo!</> : 'Salvar código'}
          </button>
        </div>
      )}

      {user.role !== 'gestor' && (
        <button className="wp-perfil-row" onClick={toggleNotif}>
          {notifOn ? <Bell size={16} className="wp-ico" /> : <BellOff size={16} className="wp-ico" />}
          <span>
            Aviso diário
            <i>{notifOn ? 'Ligado — te lembramos de assistir a pílula do dia' : 'Desligado'}</i>
          </span>
          <span className={`wp-perfil-toggle ${notifOn ? 'on' : ''}`} />
        </button>
      )}

      <button className="wp-perfil-row wp-perfil-out" onClick={logout}>
        <LogOut size={16} className="wp-ico" />
        <span>Sair da conta<i>{user.email}</i></span>
      </button>
    </div>
  );
}
