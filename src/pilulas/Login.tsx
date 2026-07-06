import { useState } from 'react';
import { LayoutDashboard, Sparkles, ArrowRight, Check, ArrowUpRight } from 'lucide-react';
import { useAuth, type Role } from './AuthContext';
import { BRANDS, type BrandId } from './data/brands';

export default function Login() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('vendedora');
  const [brands, setBrands] = useState<BrandId[]>([]);

  const toggleBrand = (id: BrandId) =>
    setBrands((cur) => (cur.includes(id) ? cur.filter((b) => b !== id) : [...cur, id]));

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const valid = name.trim() && emailOk && brands.length > 0;

  const enter = () => {
    if (!valid) return;
    login({ name: name.trim(), email: email.trim(), role, brands });
  };

  return (
    <div className="wp-login">
      <div className="wp-login-gss">GSS</div>
      <div className="wp-login-brand">
        eleva<ArrowUpRight size={22} strokeWidth={2.5} className="wp-login-caret" />
      </div>
      <p className="wp-login-tag">Educação de produto que vende na ponta.</p>

      <div className="wp-login-card">
        <label className="wp-login-label">Seu nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamam?" />

        <label className="wp-login-label">Seu e-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />

        <label className="wp-login-label">Quais empresas você quer ver?</label>
        <div className="wp-login-brands">
          {BRANDS.map((b) => {
            const on = brands.includes(b.id);
            return (
              <button
                key={b.id}
                className={`wp-login-brand-chip ${on ? 'on' : ''}`}
                onClick={() => toggleBrand(b.id)}
              >
                <span className="wp-login-brand-dot" style={{ background: b.accent }} />
                {b.name}
                {on && <Check size={15} className="wp-ico" />}
              </button>
            );
          })}
        </div>

        <label className="wp-login-label">Você é</label>
        <div className="wp-login-roles">
          <button
            className={`wp-login-role ${role === 'vendedora' ? 'on' : ''}`}
            onClick={() => setRole('vendedora')}
          >
            <Sparkles size={20} className="wp-ico" />
            <b>Vendedora / Creator</b>
            <small>Ver pílulas, missões e vender</small>
          </button>
          <button
            className={`wp-login-role ${role === 'gestor' ? 'on' : ''}`}
            onClick={() => setRole('gestor')}
          >
            <LayoutDashboard size={20} className="wp-ico" />
            <b>Gestor(a) da marca</b>
            <small>Cadastrar produtos, vídeos e ofertas</small>
          </button>
        </div>

        <button className="wp-login-enter" disabled={!valid} onClick={enter}>
          Entrar <ArrowRight size={16} className="wp-ico" />
        </button>
        {!valid && <p className="wp-login-hint">Preencha nome, e-mail e ao menos uma empresa.</p>}
      </div>
      <p className="wp-login-note">Demonstração — em produção, login por e-mail/senha da marca.</p>
    </div>
  );
}
