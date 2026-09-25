// QUANTO TRABALHO ESTÁ DENTRO DO APP — medido no histórico, não de memória.
//
// O método é o mesmo desde a versão de 11/09, e é o que o documento explica:
// a hora de um dia é a janela entre a PRIMEIRA e a ÚLTIMA entrega daquele dia,
// mais 30 min. É período de trabalho, não foco cronometrado — por isso o
// documento usa sempre a leitura conservadora (60% da janela) quando fala de
// preço.
//
// As pastas abaixo são o Eleva. Mexer nelas muda o número: se precisar mudar,
// mude aqui e refaça TODAS as fases, senão a comparação com a versão anterior
// deixa de valer.
//
//   node scripts/investimento/medir.mjs
import { execFileSync } from 'child_process';

// A pasta da PROPOSTA fica de fora: escrever quanto cobrar não é trabalho
// entregue ao cliente, e contá-lo faria o número crescer sozinho a cada vez
// que este documento é refeito.
const PASTAS = ['src/pilulas', 'api', 'scripts', 'firestore.eleva.rules', 'firestore.rules',
  ':(exclude)scripts/investimento'];

// A base NÃO entra na conta da Ramasa: ela nasceu com a Meraki e a Sorocaps e
// se repete de graça em qualquer cliente novo. Fica na lista para aparecer no
// documento como o que é — ativo da GSS, não fatura da Ramasa.
const FASES = [
  ['Plataforma base (fora da conta)', '2026-04-01', '2026-08-09', false],
  ['Vertical automotivo — Ramasa',    '2026-08-10', '2026-09-11', true],
  ['Depois da proposta — Ramasa',     '2026-09-12', new Date().toISOString().slice(0, 10), true],
];

function medir(de, ate) {
  const log = execFileSync('git', [
    'log', `--since=${de}`, `--until=${ate} 23:59`,
    '--pretty=format:%ad', '--date=format:%Y-%m-%d %H:%M', '--', ...PASTAS,
  ], { encoding: 'utf8' }).split('\n').filter(Boolean);

  const porDia = new Map();
  for (const linha of log) {
    const [dia, hora] = linha.split(' ');
    if (!porDia.has(dia)) porDia.set(dia, []);
    porDia.get(dia).push(hora);
  }
  let horas = 0;
  for (const lista of porDia.values()) {
    const min = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
    lista.sort();
    horas += (min(lista[lista.length - 1]) - min(lista[0])) / 60 + 0.5;
  }
  return { dias: porDia.size, entregas: log.length, horas };
}

const R = { dias: 0, entregas: 0, horas: 0 };
const base = { dias: 0, entregas: 0, horas: 0 };
for (const [nome, de, ate, ehRamasa] of FASES) {
  const m = medir(de, ate);
  // soma as horas JÁ arredondadas por fase: é o que o documento mostra na
  // coluna, e assim a coluna fecha com o total.
  const alvo = ehRamasa ? R : base;
  alvo.dias += m.dias; alvo.entregas += m.entregas; alvo.horas += Math.round(m.horas);
  console.log(`${nome.padEnd(34)} ${de} a ${ate}  dias=${String(m.dias).padStart(3)}  entregas=${String(m.entregas).padStart(4)}  horas=${Math.round(m.horas)} h`);
}
console.log('-'.repeat(96));
console.log(`${'TOTAL RAMASA'.padEnd(34)}${' '.repeat(24)}  dias=${String(R.dias).padStart(3)}  entregas=${String(R.entregas).padStart(4)}  horas=${R.horas} h`);
console.log(`${'(base, fora da conta da Ramasa)'.padEnd(34)}${' '.repeat(24)}  dias=${String(base.dias).padStart(3)}  entregas=${String(base.entregas).padStart(4)}  horas=${base.horas} h`);
console.log(`\nLeitura conservadora (60%) da Ramasa: ${Math.round(R.horas * 0.6)} h no código.`);
console.log('Some o que foi feito FORA do código (vídeos, relatórios, apresentações, PDFs) antes de fechar o número do documento.');
