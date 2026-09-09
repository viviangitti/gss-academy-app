// O MATERIAL QUE VAI PRO CLIENTE — num lugar só.
//
// Isto morava dentro da tela do carro. O botão "Enviar ao cliente" da tela
// inicial não tinha como chamar, então mandava só um texto de WhatsApp: sem
// PDF, sem foto, sem os destaques e SEM O CONTATO DO VENDEDOR.
//
// O resultado era o pior tipo de inconsistência — não dois botões fazendo a
// mesma coisa, mas o MESMO NOME fazendo coisas diferentes. O cliente recebia
// material bom ou material pobre conforme a tela em que o vendedor tocou, e
// ninguém tinha como saber.
//
// Agora as duas telas chamam daqui.
import { gerarMaterial, compartilharMaterial, type Variante } from './onePage';
import { getProductImageUrl } from './store';
import { getElevaProfile } from './profile';
import { getBrand, type BrandId } from './brands';
import { registraUso } from './tracking';
import { carregarDestaques, destaquesDoTime } from './destaquesTime';
import type { Product } from './products';

export interface PedidoMaterial {
  product: Product;
  brandId: BrandId;
  variante: Variante;
  /** Nome de quem vende — sai no rodapé do material. */
  vendedor?: string;
  uid?: string;
  /** O texto que acompanha o arquivo. Sem ele, monta um a partir do produto. */
  texto?: string;
  /** O WhatsApp já conhecido. `null` manda sem contato; undefined busca no perfil. */
  whatsapp?: string | null;
}

/** Devolve 'compartilhou' | 'baixou'. Lança se não conseguir montar. */
export async function mandarMaterial(p: PedidoMaterial): Promise<'compartilhou' | 'baixou'> {
  const marca = getBrand(p.brandId);

  // O contato e o retrato vêm do perfil quando quem chama não os tem em mão.
  let zap = p.whatsapp === null ? '' : p.whatsapp;
  let retrato = '';
  if (p.uid && (zap === undefined || !retrato)) {
    const perfil = await getElevaProfile(p.uid).catch(() => null);
    if (zap === undefined) zap = perfil?.whatsapp || '';
    retrato = perfil?.foto || '';
  }

  // Os destaques que a gerência montou a partir do que o time respondeu ganham
  // dos de fábrica — na tela e no material.
  await carregarDestaques(p.product.id).catch(() => {});
  const doTime = destaquesDoTime(p.product.id);

  const m = await gerarMaterial({
    product: p.product,
    variante: p.variante,
    marca: marca.name,
    vendedor: p.vendedor,
    whatsapp: zap || '',
    fotoVendedor: retrato,
    capa: getProductImageUrl(p.product.id) || p.product.imageUrl,
    fotos: p.product.fotos,
    destaques: doTime.length ? doTime : undefined,
    accent: marca.accent,
    accentDeep: marca.accentDeep,
  });

  const texto = p.texto ?? (p.variante === 'cliente'
    ? `${p.product.name} — ${p.product.tagline}\n\n${p.product.salesLine}`
    : `${p.product.name} — material de estudo (uso interno).`);

  const r = await compartilharMaterial(m, texto);
  registraUso('onepage', `${p.product.id}|${p.variante}`);
  return r;
}
