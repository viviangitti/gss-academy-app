// Código/cupom do afiliado — o que identifica a venda como dele.
// Guarda por e-mail neste aparelho. Quando a Meraki definir o programa de
// afiliados (cupom ou link rastreado), este é o valor que entra no link de
// compra que ele manda pra cliente.
function key(email: string): string {
  return 'wp_afilcode_' + email.trim().toLowerCase();
}

export function getAfiliadoCode(email?: string): string {
  if (!email) return '';
  try {
    return localStorage.getItem(key(email)) || '';
  } catch {
    return '';
  }
}

export function setAfiliadoCode(email: string, code: string): void {
  try {
    const v = code.trim();
    if (v) localStorage.setItem(key(email), v);
    else localStorage.removeItem(key(email));
  } catch {
    /* ignore */
  }
}
