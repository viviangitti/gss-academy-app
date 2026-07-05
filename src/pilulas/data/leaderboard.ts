// Competidoras de demonstração. Em produção, vêm do Firestore (pontos reais
// de cada vendedora na semana). Aqui são fixas pra o ranking já ter vida.

export interface Rival {
  name: string;
  city: string;
  points: number;
  streak: number;
}

export const RIVALS: Rival[] = [
  { name: 'Camila R.', city: 'São Paulo', points: 280, streak: 12 },
  { name: 'Jéssica M.', city: 'Goiânia', points: 240, streak: 9 },
  { name: 'Patrícia L.', city: 'Belo Horizonte', points: 190, streak: 7 },
  { name: 'Aline F.', city: 'Curitiba', points: 150, streak: 5 },
  { name: 'Bruna S.', city: 'Recife', points: 120, streak: 4 },
  { name: 'Tati N.', city: 'Fortaleza', points: 90, streak: 3 },
  { name: 'Larissa P.', city: 'Porto Alegre', points: 60, streak: 2 },
  { name: 'Duda C.', city: 'Salvador', points: 40, streak: 2 },
];
