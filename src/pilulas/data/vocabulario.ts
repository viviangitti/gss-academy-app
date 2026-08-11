// O VOCABULÁRIO de cada vertical.
//
// O Eleva nasceu vendendo suplemento para revendedora: por isso o app inteiro
// fala "produto", "pílula", "a cliente". Numa concessionária isso soa errado —
// e errado na tela de quem vende é ruído: ninguém confia numa ferramenta que
// não fala a língua dele.
//
// Em vez de espalhar `isAuto(brandId) ? 'carro' : 'produto'` por trinta telas,
// as palavras ficam aqui. Tela nova só precisa pedir o vocabulário da marca.
import { isAuto, type BrandId } from './brands';

export interface Vocab {
  /** 'produto' / 'carro' */
  item: string;
  itens: string;
  /** com artigo: 'o produto' / 'o carro' */
  oItem: string;
  dosItens: string;
  /** a unidade de conteúdo: 'pílula' / 'vídeo' */
  pilula: string;
  pilulas: string;
  /** quem compra. Na saúde o público é feminino; no automotivo, não. */
  cliente: string;
  aCliente: string;
  daCliente: string;
  praCliente: string;
  /** quem vende */
  vendedor: string;
}

const SAUDE: Vocab = {
  item: 'produto',
  itens: 'produtos',
  oItem: 'o produto',
  dosItens: 'dos produtos',
  pilula: 'pílula',
  pilulas: 'pílulas',
  cliente: 'cliente',
  aCliente: 'a cliente',
  daCliente: 'da cliente',
  praCliente: 'pra cliente',
  vendedor: 'vendedora',
};

const AUTO: Vocab = {
  item: 'carro',
  itens: 'carros',
  oItem: 'o carro',
  dosItens: 'dos carros',
  pilula: 'vídeo',
  pilulas: 'vídeos',
  cliente: 'cliente',
  aCliente: 'o cliente',
  daCliente: 'do cliente',
  praCliente: 'pro cliente',
  vendedor: 'vendedor',
};

export function vocab(brandId: BrandId): Vocab {
  return isAuto(brandId) ? AUTO : SAUDE;
}
