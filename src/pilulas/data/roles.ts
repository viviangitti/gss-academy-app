// Perfil escolhido no cadastro (gestor x vendedora).
// Guarda por e-mail neste aparelho. Gestores autorizados por e-mail (lista no
// AuthContext) SEMPRE entram como gestor, independente disso.
import type { Role, AffiliateType } from '../AuthContext';

// Código que a MARCA passa só pra quem é do time dela (fabricante). Sem o código,
// a pessoa entra como vendedora. Troque este valor pelo código da sua marca.
// OBS: é uma trava de fricção (fica visível no app); segurança de verdade do
// conteúdo é server-side (regras do Firestore por e-mail autorizado).
export const GESTOR_CODE = 'meraki2026';

function key(email: string): string {
  return 'wp_role_' + email.trim().toLowerCase();
}

export function storedRole(email: string): Role | null {
  try {
    const r = localStorage.getItem(key(email));
    return r === 'gestor' || r === 'vendedora' || r === 'afiliado' ? r : null;
  } catch {
    return null;
  }
}

function typeKey(email: string): string {
  return 'wp_afiltype_' + email.trim().toLowerCase();
}

export function storedAffiliateType(email: string): AffiliateType | null {
  try {
    const t = localStorage.getItem(typeKey(email));
    return t === 'geral' || t === 'saude' ? t : null;
  } catch {
    return null;
  }
}

// Guarda papel e (quando afiliado) o subtipo neste aparelho, pra próxima abertura.
export function setStoredRole(email: string, role: Role, affiliateType?: AffiliateType | ''): void {
  try {
    localStorage.setItem(key(email), role);
    if (role === 'afiliado' && (affiliateType === 'geral' || affiliateType === 'saude')) {
      localStorage.setItem(typeKey(email), affiliateType);
    }
  } catch {
    /* ignore */
  }
}
