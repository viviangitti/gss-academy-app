// Convite por marca — como um balconista entra já na Drogaria São Paulo.
// A pessoa abre eleva.../eleva?marca=dsp, a etiqueta fica guardada no aparelho,
// e o cadastro já entra naquela marca (e no modo balcão). Mesma ideia do
// convite por canal (segments.ts).
import { BRANDS, type BrandId } from './brands';

const KEY = 'wp_brand_invite';

export function stageBrandFromUrl(): void {
  try {
    const m = new URLSearchParams(window.location.search).get('marca');
    if (m && BRANDS.some((b) => b.id === m)) localStorage.setItem(KEY, m);
  } catch {
    /* ignore */
  }
}

export function invitedBrand(): BrandId | undefined {
  try {
    const v = localStorage.getItem(KEY);
    return BRANDS.some((b) => b.id === v) ? (v as BrandId) : undefined;
  } catch {
    return undefined;
  }
}
