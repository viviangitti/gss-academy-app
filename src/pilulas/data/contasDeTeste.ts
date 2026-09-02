// CONTAS QUE NÃO SÃO DO TIME.
//
// A Vivian e a Silene entram no app para testar — abrem carro, refazem quiz,
// mexem em tudo. Isso é trabalho de quem construiu, não de quem vende.
//
// Enquanto elas contavam junto, dois números ficavam errados de uma vez: o
// Painel mostrava "11 pessoas usaram" quando eram 9 vendedores de verdade, e o
// ranking colocava a conta da Vivian na frente de gente que estava no showroom.
// Ela chegou a aparecer em 3º com 10 pontos de teste.
//
// Sair daqui não apaga nada: as duas continuam usando o app normalmente e o
// histórico delas segue gravado. Elas só não entram na contagem do time nem
// disputam posição no placar.
const TESTE = new Set([
  'viviangitti23@gmail.com',
  'viviangitti@gmail.com',
  'maria26@gmail.com',
  'silene_mendes@hotmail.com',
  'silene.mendesdesouza@gmail.com',
  'silene.mendesangelodesouza@gmail.com',
]);

export function ehContaDeTeste(email?: string | null): boolean {
  return !!email && TESTE.has(email.trim().toLowerCase());
}
