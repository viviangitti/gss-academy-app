import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, resetPassword, translateAuthError } from '../services/auth';
import { SEGMENTS, setMySegment, mySegment } from './data/segments';

type Mode = 'entrar' | 'criar';

export default function Login() {
  const [mode, setMode] = useState<Mode>('entrar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  // Canal de venda: vem pré-preenchido se a pessoa chegou por link/QR de convite.
  const [segment, setSegment] = useState<string>(() => mySegment() || '');

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const valid =
    emailOk && password.length >= 6 && (mode === 'entrar' || name.trim().length > 0);

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'criar') {
        if (segment) setMySegment(segment);
        await signUpWithEmail(email.trim(), password, name.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
      // onAuthChange no AuthContext assume daqui: entra no app automaticamente.
    } catch (e) {
      const code = (e as { code?: string })?.code || '';
      setError(translateAuthError(code));
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!emailOk) {
      setError('Digite seu e-mail acima primeiro.');
      return;
    }
    setError('');
    setInfo('');
    try {
      await resetPassword(email.trim());
      setInfo('Se existir uma conta com esse e-mail, enviamos o link. Olhe também o SPAM (o remetente pode aparecer como "maestria-vendas" / Firebase). Não achou? Crie sua conta na aba "Criar conta".');
    } catch (e) {
      const code = (e as { code?: string })?.code || '';
      setError(translateAuthError(code));
    }
  };

  return (
    <div className="wp-login">
      <div className="wp-login-gss">GSS</div>
      <div className="wp-login-brand">
        eleva<ArrowUpRight size={22} strokeWidth={2.5} className="wp-login-caret" />
      </div>
      <p className="wp-login-tag">Educação de produto que vende na ponta.</p>

      <div className="wp-login-card">
        <div className="wp-login-tabs">
          <button
            className={`wp-login-tab ${mode === 'entrar' ? 'on' : ''}`}
            onClick={() => { setMode('entrar'); setError(''); setInfo(''); }}
          >
            Entrar
          </button>
          <button
            className={`wp-login-tab ${mode === 'criar' ? 'on' : ''}`}
            onClick={() => { setMode('criar'); setError(''); setInfo(''); }}
          >
            Criar conta
          </button>
        </div>

        {mode === 'criar' && (
          <>
            <label className="wp-login-label">Seu nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamam?" />

            <label className="wp-login-label">Onde você vende? (opcional)</label>
            <select className="wp-login-select" value={segment} onChange={(e) => setSegment(e.target.value)}>
              <option value="">Prefiro não dizer</option>
              {SEGMENTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </>
        )}

        <label className="wp-login-label">Seu e-mail</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
        />

        <label className="wp-login-label">Sua senha</label>
        <div className="wp-login-pass">
          <input
            type={showPass ? 'text' : 'password'}
            autoComplete={mode === 'criar' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button
            type="button"
            className="wp-login-eye"
            aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setShowPass((s) => !s)}
          >
            {showPass ? <EyeOff size={18} className="wp-ico" /> : <Eye size={18} className="wp-ico" />}
          </button>
        </div>

        {error && <p className="wp-login-error">{error}</p>}
        {info && <p className="wp-login-info">{info}</p>}

        <button className="wp-login-enter" disabled={!valid || busy} onClick={submit}>
          {busy ? 'Aguarde…' : mode === 'criar' ? 'Criar conta' : 'Entrar'}
          {!busy && <ArrowRight size={16} className="wp-ico" />}
        </button>

        {mode === 'entrar' && (
          <button type="button" className="wp-login-forgot" onClick={forgot}>
            Esqueci minha senha
          </button>
        )}
      </div>
      <p className="wp-login-note">Acesso de Gestor liberado só para e-mails autorizados.</p>
    </div>
  );
}
