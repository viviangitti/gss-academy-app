import type { Audience } from '../AuthContext';

// Marcas do vendedor. Cada marca re-tematiza o app (cor, texto sobre cor) e
// filtra catálogo/missões/ofertas. Um vendedor pode ter várias marcas no mesmo app.

export type BrandId = 'meraki' | 'wepink' | 'hyaluvita' | 'dsp';

// Modo da marca: 'revenda' (padrão — vendedora posta/compartilha) ou 'balcao'
// (farmácia — o foco é preparar o atendimento; sem postar/ofertas/ranking).
export type BrandMode = 'revenda' | 'balcao';

export interface Brand {
  id: BrandId;
  name: string;
  accent: string;     // --wp-pink (acento principal)
  accentDeep: string; // --wp-pink-deep (texto de acento sobre branco)
  light: string;      // --wp-gold-light (gradiente)
  onAccent: string;   // cor do texto/ícone DENTRO de um botão/preenchimento com o acento
  mode?: BrandMode;   // ausente = 'revenda'
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
