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

// Como cada papel se chama na tela.
const ROLE_LABEL: Record<Role, string> = {
  gestor: 'Gestor(a) da marca',
  balconista: 'Balconista',
  promotor: 'Promotor(a)',
  afiliado: 'Afiliado(a)',
};

export function roleLabel(role?: Role, affiliateType?: AffiliateType): string {
  if (!role) return '';
  if (role === 'afiliado') {
    return affiliateType === 'saude' ? 'Afiliado(a) — profissional da saúde' : 'Afiliado(a)';
  }
  return ROLE_LABEL[role];
}

// Converte o que está salvo num papel válido. 'vendedora' é o nome ANTIGO do
// balconista — quem se cadastrou antes continua entrando, já como balconista.
export function normalizeRole(raw: unknown): Role | null {
  if (raw === 'gestor' || raw === 'balconista' || raw === 'promotor' || raw === 'afiliado') return raw;
  if (raw === 'vendedora') return 'balconista';
  return null;
}

export function storedRole(email: string): Role | null {
  try {
    return normalizeRole(localStorage.getItem(key(email)));
  } catch {
    return null;
  }
}

// A MARCA ESCOLHIDA NO CADASTRO, guardada neste aparelho.
//
// Existe por causa de uma corrida no primeiro acesso: a conta é criada, o
// onAuthChange dispara e vai buscar o perfil no Firestore — mas o perfil só é
// gravado DEPOIS que a conta existe, porque precisa do uid. Nesse instante o
// perfil ainda não está lá, e sem ele a pessoa caía na marca padrão.
//
// Como o onAuthChange só dispara de novo em mudança de login, ela ficava na
// marca errada a sessão inteira. Isto aqui é gravado ANTES da conta nascer, e
// serve de ponte até o perfil chegar.
function marcaKey(email: string): string {
  return 'wp_brands_' + email.trim().toLowerCase();
}

export function setStoredBrands(email: string, brands: string[]): void {
  try { localStorage.setItem(marcaKey(email), JSON.stringify(brands)); } catch { /* cheio */ }
}

export function storedBrands(email: string): string[] | null {
  try {
    const v = JSON.parse(localStorage.getItem(marcaKey(email)) || 'null');
    return Array.isArray(v) && v.length ? v : null;
  } catch {
    return null;
  }
}

// A MESMA PONTE, PARA CARGO E LOJA.
//
// A marca tinha ponte; cargo e loja não tinham, e sofriam do mesmo mal pelo
// mesmo motivo: `createUserWithEmailAndPassword` já loga a pessoa, então o
// AuthContext lê o perfil ANTES de o cadastro escrevê-lo. Ele lia `null`, e
// `null` é indistinguível de "esta pessoa não tem cargo" — a sessão inteira
// corria sem cargo e sem loja, e era isso que o Painel e o relatório viam.
//
// Gravado ANTES de a conta nascer, como o das marcas. Vale só neste aparelho e
// só até o perfil chegar: a verdade continua sendo o elevaUsers.
function cargoKey(email: string): string {
  return 'wp_cargo_' + email.trim().toLowerCase();
}

export function setStoredCargo(email: string, cargo?: string, loja?: string): void {
  try {
    localStorage.setItem(cargoKey(email), JSON.stringify({ cargo: cargo || '', loja: loja || '' }));
  } catch { /* cheio */ }
}

export function storedCargo(email: string): { cargo?: string; loja?: string } | null {
  try {
    const v = JSON.parse(localStorage.getItem(cargoKey(email)) || 'null');
    if (!v || typeof v !== 'object') return null;
    return { cargo: v.cargo || undefined, loja: v.loja || undefined };
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
