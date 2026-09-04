// O NOME QUE O CLIENTE VÊ NO WHATSAPP.
//
// O anexo chega antes do texto: no celular dele aparece o nome do arquivo, em
// negrito, e é a primeira coisa que ele lê. Já saiu daqui coisa que não devia:
//
//   "Eleva — produto que vende na ponta.pdf"   o nome da ferramenta interna
//   "jaecoo-7-shs-p.pdf"                       um slug de programador
//
// A regra da Vivian: TUDO que vai pro cliente sai em CAIXA ALTA. É a mesma
// regra do nome do produto na ficha, e pelo mesmo motivo — do outro lado tem
// alguém decidindo uma compra de duzentos mil reais, e o anexo tem que parecer
// documento de concessionária, não arquivo de trabalho.
//
// Fica num arquivo só porque são cinco lugares diferentes que geram anexo, e
// regra repetida em cinco lugares vira cinco regras.

/** Caracteres que Windows, iOS e Android não aceitam em nome de arquivo. */
const PROIBIDOS = /[\\/:*?"<>|]/g;

/**
 * Monta o nome de um arquivo que vai para fora.
 *
 * Junta as partes com travessão, tira o que o sistema de arquivos recusa e
 * devolve em CAIXA ALTA. Sem extensão — quem chama põe a dele.
 *
 *   nomeParaCliente('Jaecoo 7 SHS-P', 'ficha técnica')
 *   → 'JAECOO 7 SHS-P — FICHA TÉCNICA'
 */
export function nomeParaCliente(...partes: Array<string | undefined | false>): string {
  return partes
    .filter(Boolean)
    .map((p) => String(p).replace(PROIBIDOS, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' — ')
    .toLocaleUpperCase('pt-BR')
    // Nome gigante trunca no celular e esconde justo o fim, que é onde está o
    // que o arquivo É. 90 caracteres cabem nos aparelhos que o time usa.
    .slice(0, 90)
    .trim();
}
