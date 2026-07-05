// Marcas do vendedor. Cada marca re-tematiza o app (cor, texto sobre cor) e
// filtra catálogo/missões/ofertas. Um vendedor pode ter várias marcas no mesmo app.

export type BrandId = 'meraki' | 'wepink';

export interface Brand {
  id: BrandId;
  name: string;
  accent: string;     // --wp-pink (acento principal)
  accentDeep: string; // --wp-pink-deep (texto de acento sobre branco)
  light: string;      // --wp-gold-light (gradiente)
  onAccent: string;   // cor do texto/ícone DENTRO de um botão/preenchimento com o acento
}

export const BRANDS: Brand[] = [
  { id: 'meraki', name: 'Meraki', accent: '#c9a84c', accentDeep: '#97741f', light: '#d9c179', onAccent: '#1a1a2e' },
  { id: 'wepink', name: 'Wepink', accent: '#e6007e', accentDeep: '#b00063', light: '#ff6fb0', onAccent: '#ffffff' },
];

export function getBrand(id: BrandId): Brand {
  return BRANDS.find((b) => b.id === id) || BRANDS[0];
}
