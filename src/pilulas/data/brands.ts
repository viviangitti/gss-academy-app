import type { Audience } from '../AuthContext';

// Marcas do vendedor. Cada marca re-tematiza o app (cor, texto sobre cor) e
// filtra catálogo/missões/ofertas. Um vendedor pode ter várias marcas no mesmo app.

export type BrandId = 'meraki' | 'wepink' | 'hyaluvita' | 'dsp' | 'ramasa' | 'royal';

// Modo da marca: 'revenda' (padrão — vendedora posta/compartilha) ou 'balcao'
// (farmácia — o foco é preparar o atendimento; sem postar/ofertas/ranking).
export type BrandMode = 'revenda' | 'balcao';

// Ramo de negócio da marca. Decide o VOCABULÁRIO e as travas de conteúdo —
// suplemento tem regra da ANVISA; carro tem condição comercial com validade.
// AUSENTE = 'saude', que é como Meraki e Sorocaps sempre funcionaram: marca
// antiga não muda nada.
export type Vertical = 'saude' | 'auto' | 'moto';

export interface Brand {
  id: BrandId;
  name: string;
  accent: string;     // --wp-pink (acento principal)
  accentDeep: string; // --wp-pink-deep (texto de acento sobre branco)
  light: string;      // --wp-gold-light (gradiente)
  onAccent: string;   // cor do texto/ícone DENTRO de um botão/preenchimento com o acento
  mode?: BrandMode;   // ausente = 'revenda'
  vertical?: Vertical; // ausente = 'saude'
  /**
   * MARCA EM DEMONSTRAÇÃO — só a GSS entra.
   *
   * Existe para a marca que ainda é proposta, não cliente: ela precisa aparecer
   * na lista do login (é de lá que a demonstração começa) sem que ninguém de
   * outra empresa consiga abrir o conteúdo dela. Quando virar cliente, apaga-se
   * esta linha e a marca passa a funcionar como as outras.
   */
  soGss?: boolean;
  // Públicos que a marca REALMENTE tem hoje. É isso que decide o que o gestor
  // vê pra cadastrar vídeo por público. A Meraki ainda não tem balconista nem
  // promotor — mostrar esses campos só dava trabalho à toa. Quando entrarem,
  // basta acrescentar aqui.
  audiences: Audience[];
}

export const BRANDS: Brand[] = [
  { id: 'meraki', name: 'Meraki', accent: '#c9a84c', accentDeep: '#97741f', light: '#d9c179', onAccent: '#1a1a2e', audiences: ['afiliado-geral', 'afiliado-saude'] },
  // Drogaria São Paulo — marca própria fabricada pela Sorocaps. Modo BALCÃO:
  // o balconista se prepara pra atender (catálogo + objeções + formação), sem
  // postar/compartilhar/ofertas. Tema verde (identidade Sorocaps do deck).
  { id: 'dsp', name: 'Sorocaps · Drogaria São Paulo', accent: '#1f7a52', accentDeep: '#14603f', light: '#5fce9a', onAccent: '#ffffff', mode: 'balcao', audiences: ['balconista'] },
  // Ramasa — concessionária Jaecoo e Omoda. Primeira marca do vertical AUTO:
  // mesmo app, vocabulário e travas de conteúdo diferentes. Modo revenda (o
  // vendedor de salão atende e compartilha), públicos próprios do showroom.
  { id: 'ramasa', name: 'Ramasa · Jaecoo e Omoda', accent: '#1e6fd9', accentDeep: '#14508f', light: '#6fa8e8', onAccent: '#ffffff', vertical: 'auto', audiences: ['vendedor', 'gerente'] },
  // Royal Enfield Brasil — PROPOSTA, não cliente ainda. Primeira marca do
  // vertical MOTO: mesma engrenagem do automotivo (condição com validade, cargos
  // de showroom, notícias do mercado), vocabulário de duas rodas. Vermelho da
  // identidade da marca. `soGss` deixa ela visível na lista do login e fechada
  // para quem não é da GSS — ver marcasVisiveis().
  { id: 'royal', name: 'Royal Enfield Brasil', accent: '#a4161a', accentDeep: '#7a1014', light: '#e0565b', onAccent: '#ffffff', vertical: 'moto', soGss: true, audiences: ['vendedor', 'gerente'] },
  // HyaluVita: por ora os produtos dela ficam JUNTO no catálogo da Meraki (a pedido).
  // Para separar em marca própria, descomente a linha e ponha brand:'hyaluvita' nos produtos:
  // { id: 'hyaluvita', name: 'HyaluVita', accent: '#7a3f9e', accentDeep: '#5a2a80', light: '#b98fd6', onAccent: '#ffffff' },
  // Wepink desativada por enquanto (a pedido). Para reativar, descomente a linha:
  // { id: 'wepink', name: 'Wepink', accent: '#e6007e', accentDeep: '#b00063', light: '#ff6fb0', onAccent: '#ffffff' },
];

export function getBrand(id: BrandId): Brand {
  return BRANDS.find((b) => b.id === id) || BRANDS[0];
}

// Marca em modo balcão? (farmácia — experiência enxuta, sem postar/ofertas)
export function isBalcao(id: BrandId): boolean {
  return getBrand(id).mode === 'balcao';
}

/** Ramo da marca. Sem declarar, é 'saude' — o comportamento de sempre. */
export function verticalOf(id: BrandId): Vertical {
  return getBrand(id).vertical || 'saude';
}

/**
 * Atalho: a marca é de VEÍCULO (carro ou moto)?
 *
 * Carro e moto dividem a mesma engrenagem — condição comercial com validade,
 * cargos de showroom, ficha técnica, notícias do mercado. O que muda entre
 * elas é o vocabulário (ver vocabulario.ts), não o funcionamento.
 */
export function isAuto(id: BrandId): boolean {
  const v = verticalOf(id);
  return v === 'auto' || v === 'moto';
}

/** A marca é de moto? (só o vocabulário e a Jornada mudam) */
export function isMoto(id: BrandId): boolean {
  return verticalOf(id) === 'moto';
}

/**
 * OS E-MAILS DA GSS. Mesma lista da função ehGss() nas regras do Firestore —
 * as duas precisam contar a mesma história, senão a pessoa vê a marca na tela e
 * o banco nega o conteúdo (ou o contrário, que é pior).
 */
export const EMAILS_GSS = [
  'viviangitti@gmail.com',
  'viviangitti23@gmail.com',
  'silene.mendesdesouza@gmail.com',
  'silene.mendesangelodesouza@gmail.com',
  'silene_mendes@hotmail.com',
];

export function ehGss(email?: string | null): boolean {
  return !!email && EMAILS_GSS.includes(email.trim().toLowerCase());
}

/**
 * As marcas que ESTE e-mail pode abrir. Marca em demonstração (`soGss`) só
 * aparece para a GSS — o resto do app continua enxergando o que sempre viu.
 */
export function marcasVisiveis(email?: string | null): Brand[] {
  return ehGss(email) ? BRANDS : BRANDS.filter((b) => !b.soGss);
}
