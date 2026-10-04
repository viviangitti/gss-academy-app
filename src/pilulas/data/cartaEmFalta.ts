// A LOJA ESTÁ SEM CARTA — e quem pode resolver tem que saber hoje, não no dia 20.
//
// A carta de setembro venceu em 02/10, o app a tirou do ar sozinho (é o certo:
// taxa vencida na mão do vendedor é promessa que a loja não cumpre) e a de
// outubro não subiu. Quatro dias depois, o vendedor que abria Condições para
// atender um cliente não achava taxa de carro nenhuma — e ninguém na gerência
// sabia disso, porque o buraco é silencioso por natureza: não há tela vermelha
// quando falta uma coisa, só uma lista mais curta.
//
// Então o app avisa. Mas avisa QUEM PODE RESOLVER: pôr isso na frente do
// vendedor seria dar a ele um problema que não é dele resolver.
import { condicoesDaMarca, estaVencida } from './condicoes';
import { hojeEmBrasilia } from './diaAtual';
import type { BrandId } from './brands';

/**
 * QUEM RECEBE O AVISO.
 *
 * Lista de nomes, e não "todo gestor", de propósito. Doze pessoas abrem o
 * Painel da Ramasa — a qualidade, os acessórios, os leads — e a carta de
 * veículo não é trabalho de nenhuma delas. Aviso que chega em quem não pode
 * agir vira ruído, e ruído a pessoa aprende a fechar sem ler.
 *
 * A Vivian pediu Cristiano e Raphaela (04/10/2026). Para incluir mais alguém,
 * basta acrescentar o e-mail aqui — e o e-mail também precisa estar em
 * isGestor() nas regras do Firestore, senão a pessoa vê o aviso e não consegue
 * publicar.
 */
const AVISAR = [
  'cristiano.maciel@gruporamasa.com',
  'raphaela.machado@gruporamasa.com',
];

export function recebeAviso(email?: string | null): boolean {
  return !!email && AVISAR.includes(email.trim().toLowerCase());
}

export interface Falta {
  /** Desde quando a prateleira de veículo está vazia (aaaa-mm-dd). */
  desde?: string;
  /** Quantos dias inteiros já se passaram. */
  dias: number;
}

/** Diferença em dias entre duas datas aaaa-mm-dd, sem passar por fuso. */
function entre(de: string, ate: string): number {
  const d = (s: string) => {
    const [a, m, x] = s.split('-').map(Number);
    return Date.UTC(a, m - 1, x) / 86400000;
  };
  return Math.max(0, d(ate) - d(de));
}

/**
 * A loja está sem condição de veículo?
 *
 * Só olha VEÍCULO. Acessório não vence (as seis da Ramasa estão sem data de
 * propósito) e campanha é outra prateleira — se eu olhasse o total, o aviso
 * nunca apareceria, porque sempre sobra alguma coisa no ar.
 */
export function cartaEmFalta(brand: BrandId): Falta | null {
  const doCarro = condicoesDaMarca(brand).filter((c) => (c.categoria || 'veiculo') === 'veiculo');
  // Nunca houve carta nenhuma: não é falta, é marca nova. Avisar aqui seria
  // cobrar da gerência uma coisa que ainda não existe.
  if (!doCarro.length) return null;
  const noAr = doCarro.filter((c) => !estaVencida(c));
  if (noAr.length) return null;

  // A mais recente das vencidas diz desde quando o time está sem nada.
  const ultima = doCarro
    .map((c) => c.venceEm)
    .filter((d): d is string => !!d)
    .sort()
    .pop();
  const hoje = hojeEmBrasilia();
  return { desde: ultima, dias: ultima ? entre(ultima, hoje) : 0 };
}

// ---- o aviso volta todo dia até alguém resolver ----
//
// "Agora não" fecha o de hoje, não o assunto. Um aviso que some para sempre no
// primeiro toque é um aviso que não avisa: a pessoa fecha no corredor, entre
// dois clientes, e ninguém toca no assunto de novo.
const KEY = 'wp_carta_adiada';

export function adiadoHoje(): boolean {
  try { return localStorage.getItem(KEY) === hojeEmBrasilia(); } catch { return false; }
}

export function adiarHoje(): void {
  try { localStorage.setItem(KEY, hojeEmBrasilia()); } catch { /* modo anônimo */ }
}
