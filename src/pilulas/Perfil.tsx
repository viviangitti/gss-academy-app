import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Trophy, GraduationCap, Bell, BellOff, LogOut, Check, Tag, ChevronRight, Trash2, ShieldCheck, MessageCircle, Camera } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';
import { vocab } from './data/vocabulario';
import { isAuto } from './data/brands';
import { getTom, setTom, type Tom } from './data/memoriaCoach';
import { roleLabel } from './data/roles';
import { getStats } from './data/tracking';
import { getTrilha } from './data/trilha';
import { getAfiliadoCode, setAfiliadoCode } from './data/afiliadoCode';
import { notifState, notifPref, enableNotif, disableNotif } from './data/lembrete';
import { updateElevaName, updateElevaWhatsapp, updateElevaFoto, retratoParaDataUrl, getElevaProfile } from './data/profile';
import { auth } from '../services/firebase';
import { excluirConta } from './data/excluirConta';
import { cargoLabel } from './data/cargos';

// Iniciais do nome pro avatar (ex.: "Ana Paula" -> "AP").
function initials(name?: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export default function Perfil() {
  const { user, logout } = useAuth();
  // Exclusão de conta (LGPD). Confirmação em dois passos de propósito: é
  // irreversível, e um toque sem querer não pode apagar a conta de ninguém.
  const [excluirAberto, setExcluirAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState('');
  const { brandId, brand } = useBrand();
  const v = vocab(brandId);
  const auto = isAuto(brandId);
  const stats = getStats();
  const trilha = getTrilha(brandId, user?.role);

  const [code, setCode] = useState(() => getAfiliadoCode(user?.email));
  const [codeSaved, setCodeSaved] = useState(false);
  const [notifOn, setNotifOn] = useState(() => notifState() === 'granted' && notifPref());
  // Como o Tira-dúvida fala com você. Muda o jeito, não o conteúdo.
  const [tom, setTomLocal] = useState<Tom>(getTom);
  const [nome, setNome] = useState(user?.name || '');
  const [nomeBusy, setNomeBusy] = useState(false);
  // WhatsApp que sai no one-page mandado ao cliente.
  const [zap, setZap] = useState('');
  const [zapBusy, setZapBusy] = useState(false);
  const [zapOk, setZapOk] = useState(false);
  const [foto, setFoto] = useState('');
  const [fotoErro, setFotoErro] = useState('');
  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    getElevaProfile(uid).then((pf) => { setZap(pf?.whatsapp || ''); setFoto(pf?.foto || ''); }).catch(() => {});
  }, []);

  const escolherFoto = async (f?: File) => {
    const uid = auth?.currentUser?.uid;
    if (!f || !uid) return;
    setFotoErro('');
    try {
      const url = await retratoParaDataUrl(f);
      setFoto(url);
      await updateElevaFoto(uid, url);
    } catch {
      setFotoErro('Não consegui usar essa imagem. Tente outra foto.');
    }
  };

  const salvarZap = async () => {
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    setZapBusy(true);
    await updateElevaWhatsapp(uid, zap);
    setZapBusy(false);
    setZapOk(true);
    setTimeout(() => setZapOk(false), 2500);
  };

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

  const confirmarExclusao = async () => {
    if (excluindo) return;
    setExcluindo(true);
    setErroExcluir('');
    const r = await excluirConta();
    setExcluindo(false);
    if (r.ok) {
      // A conta não existe mais: o app volta pro login sozinho.
      window.location.href = '/eleva';
      return;
    }
    setErroExcluir(
      r.motivo === 'precisa-entrar-de-novo'
        ? 'Por segurança, o login precisa ser recente. Saia da conta, entre de novo e repita a exclusão.'
        : 'Não consegui excluir agora. Tente de novo ou escreva para viviangitti23@gmail.com.',
    );
  };

  return (
    <div className="wp-perfil">
      <div className="wp-perfil-head">
        <div className="wp-perfil-av">{initials(user.name)}</div>
        <div className="wp-perfil-id">
          <h1>{user.name}</h1>
          {/* Na loja o que identifica a pessoa é o cargo, não o papel interno
              do app — "Vendedor de acessórios" diz algo, "Balconista" não. */}
          <p>{cargoLabel(user.cargo) || roleLabel(user.role, user.affiliateType)}</p>
          <span className="wp-perfil-brand">{brand.name}</span>
        </div>
      </div>

      {/* O contato que sai no material mandado ao cliente. Sem isso o one-page
          vira panfleto da loja — com ele, vira o cartão de visita do vendedor. */}
      {auto && (
        <div className="wp-perfil-card">
          <span className="wp-perfil-label">Seu WhatsApp</span>
          <input
            className="wp-perfil-input"
            value={zap}
            onChange={(e) => setZap(e.target.value)}
            placeholder="(11) 90000-0000"
            inputMode="tel"
          />
          <p className="wp-perfil-hint">
            É o número que sai no material que você manda pro cliente. É por ele que o cliente te responde —
            e não pra loja.
          </p>

          <span className="wp-perfil-label" style={{ marginTop: 14 }}>Sua foto</span>
          <label className="wp-perfil-foto">
            {foto ? <img src={foto} alt="Sua foto" /> : <span className="wp-perfil-foto-vazia"><Camera size={20} className="wp-ico" /></span>}
            <span>{foto ? 'Trocar foto' : 'Escolher foto'}</span>
            <input type="file" accept="image/*" hidden onChange={(e) => escolherFoto(e.target.files?.[0])} />
          </label>
          <p className="wp-perfil-hint">
            Vai junto no material. Cliente que vê o rosto liga pra você; sem rosto, ele liga pra recepção.
          </p>
          {fotoErro && <p className="wp-perfil-hint" style={{ color: '#d33b3b' }}>{fotoErro}</p>}
          <button className="wp-perfil-save" onClick={salvarZap} disabled={zapBusy}>
            {zapBusy ? 'Salvando…' : zapOk ? 'Salvo!' : 'Salvar WhatsApp'}
          </button>
        </div>
      )}

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
        <p className="wp-perfil-hint">É o nome que a gerência vê no Painel. No ranking do time ninguém aparece por nome — só a posição.</p>
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
              <i>{trilha.complete ? `Você dominou os ${trilha.total} ${v.itens}` : `Faltam ${trilha.total - trilha.mastered} para o certificado`}</i>
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

      <div className="wp-perfil-row wp-perfil-tom">
        <MessageCircle size={16} className="wp-ico" />
        <span>
          Como o Tira-dúvida fala com você
          <i>Muda o jeito da resposta, não o conteúdo.</i>
        </span>
        <div className="wp-tom-opts">
          {([
            ['direto', 'Direto'],
            ['motivador', 'Motivador'],
            ['tecnico', 'Técnico'],
          ] as [Tom, string][]).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`wp-tom-opt ${tom === id ? 'on' : ''}`}
              onClick={() => { setTom(id); setTomLocal(id); }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {user.role !== 'gestor' && (
        <button className="wp-perfil-row" onClick={toggleNotif}>
          {notifOn ? <Bell size={16} className="wp-ico" /> : <BellOff size={16} className="wp-ico" />}
          <span>
            Aviso diário
            <i>{notifOn ? `Ligado — te lembramos de assistir ${v.pilula === 'vídeo' ? 'o vídeo' : 'a pílula'} do dia` : 'Desligado'}</i>
          </span>
          <span className={`wp-perfil-toggle ${notifOn ? 'on' : ''}`} />
        </button>
      )}

      <button className="wp-perfil-row wp-perfil-out" onClick={logout}>
        <LogOut size={16} className="wp-ico" />
        <span>Sair da conta<i>{user.email}</i></span>
      </button>

      <Link to="/eleva/privacidade" className="wp-perfil-row">
        <ShieldCheck size={16} className="wp-ico" />
        <span>Privacidade<i>O que guardamos e seus direitos</i></span>
        <ChevronRight size={16} className="wp-ico" />
      </Link>

      {/* LGPD: direito à eliminação. Fica por último e discreto — é uma saída,
          não um atalho. */}
      {!excluirAberto ? (
        <button type="button" className="wp-perfil-excluir-link" onClick={() => setExcluirAberto(true)}>
          Excluir minha conta e meus dados
        </button>
      ) : (
        <div className="wp-perfil-excluir">
          <b>Tem certeza?</b>
          <p>
            Isso apaga sua conta, seu histórico de {v.pilulas}, seus pontos e sua ofensiva.
            As objeções que você registrou continuam para a marca, mas <b>sem o seu nome</b>.
            Não dá para desfazer.
          </p>
          {erroExcluir && <p className="wp-perfil-excluir-erro">{erroExcluir}</p>}
          <div className="wp-perfil-excluir-btns">
            <button type="button" className="wp-perfil-excluir-nao" onClick={() => { setExcluirAberto(false); setErroExcluir(''); }} disabled={excluindo}>
              Cancelar
            </button>
            <button type="button" className="wp-perfil-excluir-sim" onClick={confirmarExclusao} disabled={excluindo}>
              <Trash2 size={14} className="wp-ico" /> {excluindo ? 'Excluindo…' : 'Sim, excluir tudo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
