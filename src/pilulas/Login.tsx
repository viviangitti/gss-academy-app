import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Eye, EyeOff, Check } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, resetPassword, translateAuthError } from '../services/auth';
import { setStoredRole, setStoredBrands } from './data/roles';
import { setElevaProfile } from './data/profile';
import { invitedBrand } from './data/brandInvite';
import { getBrand, isBalcao, isAuto, BRANDS, type BrandId } from './data/brands';
import { CARGOS_AUTO, roleDoCargo, type CargoAuto } from './data/cargos';
import type { Role, AffiliateType } from './AuthContext';

type Mode = 'entrar' | 'criar';

/**
 * O link de convite pode já abrir no "Criar conta".
 *
 * A gerência manda o link num grupo de WhatsApp, com vinte pessoas que ainda
 * não têm conta, e a tela abre em "Entrar" — algumas tentam entrar, tomam erro
 * de senha e desistem antes de achar a outra aba.
 *
 *   gsseleva.com.br/eleva?marca=ramasa&cadastro=1
 */
function abrirNoCadastro(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('cadastro') === '1';
  } catch {
    return false;
  }
}

export default function Login() {
  const [mode, setMode] = useState<Mode>(abrirNoCadastro() ? 'criar' : 'entrar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  // LGPD: o cadastro precisa registrar que a pessoa leu e aceitou. Só no
  // "criar conta" — quem já tem conta já aceitou.
  const [aceite, setAceite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  // Perfis: a pessoa pode ser mais de um (ex.: balconista E afiliada).
  const [roles, setRoles] = useState<Role[]>(['balconista']);
  const [affType, setAffType] = useState<AffiliateType>('geral');
  const toggleRole = (id: Role) => {
    setError('');
    setRoles((cur) => (cur.includes(id)
      ? (cur.length > 1 ? cur.filter((r) => r !== id) : cur) // nunca deixa zerar
      : [...cur, id]));
  };
  // O app funciona com UM perfil por vez. Quando a pessoa marca vários, este é o
  // que vale (o mais abrangente): gestor > balconista > promotor > afiliado.
  const ORDEM: Role[] = ['gestor', 'balconista', 'promotor', 'afiliado'];
  const rolePrincipal = (rs: Role[]): Role => ORDEM.find((r) => rs.includes(r)) || 'balconista';
  // Marcas: a pessoa pode representar UMA ou AS DUAS. Se veio por link de
  // convite (?marca=dsp), a marca já vem fixa e o seletor some.
  const invBrand = invitedBrand();
  // NENHUMA marca vem marcada. Vinha 'meraki' por padrão, e quem não reparava
  // no seletor era gravado como Meraki — foi assim que uma vendedora da Ramasa
  // entrou na marca errada. Um campo em branco a pessoa preenche; um campo já
  // respondido errado ela não vê.
  const [brands, setBrands] = useState<BrandId[]>(() => (invBrand ? [invBrand] : []));
  const effBrands: BrandId[] = invBrand ? [invBrand] : brands;
  // Só é "balcão" se TODAS as marcas escolhidas forem de balcão (ex.: só Sorocaps).
  // Com a Meraki no meio, a pessoa escolhe o papel normalmente.
  const balcao = effBrands.length > 0 && effBrands.every((b) => isBalcao(b));
  // Concessionária: o cadastro pergunta CARGO, não perfil de farmácia. Só quando
  // TODAS as marcas escolhidas são automotivas — com a Meraki junto, a pessoa
  // volta pra lista de sempre, senão sumiriam opções que ela precisa.
  const auto = effBrands.length > 0 && effBrands.every((b) => isAuto(b));
  const [cargo, setCargo] = useState<CargoAuto>('vendedor-veiculos');
  const toggleBrand = (id: BrandId) => {
    setError('');
    setBrands((cur) => (cur.includes(id)
      ? cur.filter((b) => b !== id) // pode zerar: quem trava é o botão de criar
      : [...cur, id]));
  };

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const valid =
    emailOk && password.length >= 6 &&
    (mode === 'entrar' || (name.trim().length > 0 && aceite && effBrands.length > 0));

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'criar') {
        // Papel escolhido no cadastro é só o inicial: o poder real de gestor vem
        // do e-mail (override + regras do Firestore), não de um código na tela.
        // Balcão (Sorocaps): a pessoa é balconista, sem escolher papel.
        // Na concessionária o cargo é a origem do papel: vendedor vê o app,
        // gerente cai no painel. Nos dois casos o poder de verdade continua
        // vindo do e-mail autorizado — o cargo é declaração, não chave.
        const finalRoles: Role[] = balcao ? ['balconista'] : auto ? [roleDoCargo(cargo)] : roles;
        const finalRole: Role = rolePrincipal(finalRoles);
        const at: AffiliateType | '' = finalRoles.includes('afiliado') ? affType : '';
        // Cache local (rápido) + conta cria.
        setStoredRole(email.trim(), finalRole, at);
        // ANTES de criar a conta: o perfil só pode ser gravado depois (precisa
        // do uid), e no meio-tempo o app já decidiu qual marca mostrar.
        setStoredBrands(email.trim(), effBrands);
        const fb = await signUpWithEmail(email.trim(), password, name.trim());
        // Perfil NA CONTA (Firestore): guarda TODOS os perfis marcados (pro
        // gestor saber) + o principal, que é o que o app usa.
        await setElevaProfile(fb.uid, {
          role: finalRole, roles: finalRoles, name: name.trim(),
          segment: '', affiliateType: at, brands: effBrands,
          cargo: auto ? cargo : undefined,
        });
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
      setInfo('Se existir uma conta com esse e-mail, enviamos o link. Olhe também o SPAM (o remetente pode aparecer como "eleva-gss" / Firebase). Não achou? Crie sua conta na aba "Criar conta".');
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

        {/* Escolha de marca — a pessoa diz se é Meraki ou Sorocaps. Some se veio
            por link de convite (?marca=), que já fixa a marca. */}
        {mode === 'criar' && !invBrand && (
          <>
            <label className="wp-login-label">Qual marca você representa?</label>
            <div className="wp-login-roles wp-login-roles--wrap">
              {BRANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`wp-login-role ${brands.includes(b.id) ? 'on' : ''}`}
                  onClick={() => toggleBrand(b.id)}
                >
                  {brands.includes(b.id) && <Check size={13} className="wp-ico" />} {b.name}
                </button>
              ))}
            </div>
            <p className="wp-login-hint">
              {effBrands.length === 0
                ? 'Escolha a sua para continuar.'
                : 'Trabalha com mais de uma? Pode marcar quantas quiser — você troca a qualquer momento.'}
            </p>
          </>
        )}

        {mode === 'criar' && effBrands.length > 0 && balcao && (
          <>
            <div className="wp-login-brandbanner">
              Você está entrando em <b>{effBrands.map((b) => getBrand(b).name).join(' + ')}</b> — treinamento de balcão.
            </div>
            <label className="wp-login-label">Seu nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamam?" />
          </>
        )}

        {mode === 'criar' && effBrands.length > 0 && !balcao && auto && (
          <>
            <label className="wp-login-label">Seu cargo na loja</label>
            <div className="wp-login-roles wp-login-roles--wrap">
              {CARGOS_AUTO.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`wp-login-role ${cargo === c.id ? 'on' : ''}`}
                  onClick={() => { setError(''); setCargo(c.id); }}
                >
                  {cargo === c.id && <Check size={13} className="wp-ico" />} {c.label}
                </button>
              ))}
            </div>
            <p className="wp-login-hint">
              Vendedor de veículos e de acessórios veem o mesmo conteúdo — o cargo serve pra
              gerência saber quem é quem.
            </p>
          </>
        )}

        {mode === 'criar' && effBrands.length > 0 && !balcao && !auto && (
          <>
            <label className="wp-login-label">Você é...</label>
            <div className="wp-login-roles wp-login-roles--wrap">
              {([
                ['balconista', 'Balconista'],
                ['promotor', 'Promotor(a)'],
                ['afiliado', 'Afiliado(a)'],
                ['gestor', 'Gestor(a)'],
              ] as [Role, string][]).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`wp-login-role ${roles.includes(id) ? 'on' : ''}`}
                  onClick={() => toggleRole(id)}
                >
                  {roles.includes(id) && <Check size={13} className="wp-ico" />} {label}
                </button>
              ))}
            </div>
            <p className="wp-login-hint">É mais de um? Pode marcar quantos quiser.</p>

            {roles.includes('afiliado') && (
              <>
                <label className="wp-login-label">Que tipo de afiliado?</label>
                <div className="wp-login-roles">
                  <button
                    type="button"
                    className={`wp-login-role ${affType === 'geral' ? 'on' : ''}`}
                    onClick={() => setAffType('geral')}
                  >
                    Afiliado
                  </button>
                  <button
                    type="button"
                    className={`wp-login-role ${affType === 'saude' ? 'on' : ''}`}
                    onClick={() => setAffType('saude')}
                  >
                    Profissional da saúde
                  </button>
                </div>
              </>
            )}

          </>
        )}

        {/* O nome vale pra TODO cadastro, automotivo ou não: sem ele o botão
            nunca habilita (`valid` exige nome) e o one-page sai sem quem
            assina. Ficou dentro do ramo da farmácia quando separei os dois e
            deixou a concessionária sem como criar conta. */}
        {mode === 'criar' && effBrands.length > 0 && !balcao && (
          <>
            <label className="wp-login-label">Seu nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamam?" />
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

        {mode === 'criar' && (
          <label className="wp-login-aceite">
            <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
            <span>
              Li e aceito a <Link to="/eleva/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</Link>.
            </span>
          </label>
        )}

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
      <p className="wp-login-note">
        Escolha seu perfil e crie sua conta. Seu acesso é liberado pela marca conforme o seu e-mail.
        {' '}<Link to="/eleva/privacidade">Política de Privacidade</Link>.
      </p>
    </div>
  );
}
