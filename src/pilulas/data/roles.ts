// Perfil escolhido no cadastro (gestor x vendedora).
// Guarda por e-mail neste aparelho. Gestores autorizados por e-mail (lista no
// AuthContext) SEMPRE entram como gestor, independente disso.
import type { Role } from '../AuthContext';

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
    return r === 'gestor' || r === 'vendedora' ? r : null;
  } catch {
    return null;
  }
}

export function setStoredRole(email: string, role: Role): void {
  try {
    localStorage.setItem(key(email), role);
  } catch {
    /* ignore */
  }
}
