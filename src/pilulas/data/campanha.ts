// Campanha com prazo — o padrão que a Rallyware/ENDVR usam e que a trilha
// "sempre aberta" não tem: data pra acabar.
//
// Por quê: trilha sem prazo vira "faço qualquer dia" = nunca. Campanha nomeada,
// com contagem regressiva e meta, muda o comportamento — é o que faz o teste de
// agosto ter dado em vez de silêncio.
//
// Está aqui no código de propósito: campanha muda pouco e é decisão da marca.
// Pra trocar a data ou encerrar, mexe só neste arquivo.

export interface Campanha {
  id: string;
  nome: string; // como aparece pro time
  desc: string;
  line: string; // qual linha conta (bate com Product.line)
  ate: string; // AAAA-MM-DD — último dia, inclusive
  certTitulo: string; // o que vai escrito no certificado
  certSub: string; // a competência, em uma linha
}

export const CAMPANHA: Campanha | null = {
  id: 'glpen-lancamento-2026-08',
  nome: 'Lançamento GLPEN',
  desc: 'Domine os 3 produtos da linha GLPEN e garanta seu certificado.',
  line: 'glpen',
  ate: '2026-08-15',
  certTitulo: 'Linha GLPEN Nutri',
  certSub: 'suplementação de suporte para usuários de análogos de GLP-1',
};

/** Dias que faltam (0 = último dia; negativo = encerrada). */
export function diasRestantes(ate: string, hoje = new Date()): number {
  const [y, m, d] = ate.split('-').map(Number);
  const fim = new Date(y, m - 1, d);
  const a = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((fim.getTime() - a.getTime()) / 86400000);
}

export function encerrada(c: Campanha, hoje = new Date()): boolean {
  return diasRestantes(c.ate, hoje) < 0;
}

/** "faltam 29 dias" / "último dia!" / "encerrada" */
export function prazoLabel(c: Campanha, hoje = new Date()): string {
  const d = diasRestantes(c.ate, hoje);
  if (d < 0) return 'encerrada';
  if (d === 0) return 'último dia!';
  if (d === 1) return 'falta 1 dia';
  return `faltam ${d} dias`;
}

export function ateLabel(c: Campanha): string {
  const [, m, d] = c.ate.split('-');
  return `${d}/${m}`;
}

/** A campanha vale pra este papel? Gestor não faz trilha. */
export function campanhaPara(role?: string): Campanha | null {
  if (!CAMPANHA || role === 'gestor') return null;
  return CAMPANHA;
}
