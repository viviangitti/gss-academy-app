// Competidoras de demonstração. Em produção, vêm do Firestore (pontos reais
// de cada vendedor na semana, com nome e sobrenome + a empresa/ponto de venda).
// Aqui são fixas pra o ranking já ter vida — e já no formato "nome + empresa".

export interface Rival {
  name: string;    // nome e sobrenome
  company: string; // empresa / ponto de venda (farmácia, quiosque, revenda...)
  points: number;
  streak: number;
}

export const RIVALS: Rival[] = [
  { name: 'Camila Rocha', company: 'Drogaria São Paulo', points: 280, streak: 12 },
  { name: 'Jéssica Martins', company: 'Farmácia Pague Menos', points: 240, streak: 9 },
  { name: 'Patrícia Lima', company: 'Quiosque — Shopping Iguatemi', points: 190, streak: 7 },
  { name: 'Aline Ferreira', company: 'Drogasil', points: 150, streak: 5 },
  { name: 'Bruna Souza', company: 'Farmácia Independente', points: 120, streak: 4 },
  { name: 'Tatiane Nunes', company: 'Drogaria Araújo', points: 90, streak: 3 },
  { name: 'Larissa Prado', company: 'Revenda autônoma', points: 60, streak: 2 },
  { name: 'Eduarda Costa', company: 'Quiosque — Shopping Recife', points: 40, streak: 2 },
];
