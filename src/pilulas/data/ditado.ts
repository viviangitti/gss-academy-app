// FALAR EM VEZ DE DIGITAR.
//
// No showroom a pessoa está de pé, com o cliente do lado. Digitar "o cliente
// disse que vai esperar o modelo novo e que o cunhado dele falou que chinês não
// tem revenda" não acontece — ela desiste e não pergunta.
//
// A transcrição usada aqui é a DO PRÓPRIO NAVEGADOR (Web Speech API): é ao vivo,
// aparece enquanto a pessoa fala, e não custa nada. De propósito NÃO passa pela
// nossa IA: áudio pela API do Gemini seria cobrado por segundo gravado, e já
// tivemos crédito queimado o suficiente.
//
// Onde funciona: Chrome (Android e computador), Edge e Safari do iPhone (14.5+).
// Onde não funciona, o botão simplesmente não aparece — o teclado do celular já
// tem microfone próprio, que faz o mesmo trabalho.

// A API tem nome com prefixo em quase todo mundo e não está nos tipos padrão.
interface Reconhecimento {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
}
type ConstrutorReconhecimento = new () => Reconhecimento;

function construtor(): ConstrutorReconhecimento | null {
  const w = window as unknown as {
    SpeechRecognition?: ConstrutorReconhecimento;
    webkitSpeechRecognition?: ConstrutorReconhecimento;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function ditadoDisponivel(): boolean {
  return !!construtor();
}

export interface Ditado {
  iniciar(): void;
  parar(): void;
}

// Mensagens de erro em português — a pessoa precisa saber o que fazer, não ler
// o código do erro.
const MENSAGENS: Record<string, string> = {
  'not-allowed': 'O microfone está bloqueado. Libere o microfone para o site nas configurações do navegador.',
  'service-not-allowed': 'O microfone está bloqueado. Libere o microfone para o site nas configurações do navegador.',
  'no-speech': 'Não ouvi nada. Toque no microfone e fale um pouco mais perto.',
  'audio-capture': 'Não encontrei um microfone neste aparelho.',
  network: 'A transcrição precisa de internet. Confira a conexão e tente de novo.',
};

export function criarDitado(cb: {
  aoTexto: (t: string) => void;
  aoFim: () => void;
  aoErro: (m: string) => void;
}): Ditado | null {
  const C = construtor();
  if (!C) return null;
  const r = new C();
  r.lang = 'pt-BR';
  r.continuous = true;      // a pessoa conta o caso todo, não uma frase
  r.interimResults = true;  // o texto aparece enquanto ela fala

  // O reconhecimento devolve pedaços: os "finais" são o texto confirmado, e o
  // último pedaço ainda pode mudar. Junta os dois pra tela nunca ficar parada.
  let confirmado = '';
  r.onresult = (e) => {
    let parcial = '';
    for (let i = e.resultIndex; i < e.results.length; i += 1) {
      const trecho = e.results[i][0]?.transcript || '';
      if (e.results[i].isFinal) confirmado += trecho;
      else parcial += trecho;
    }
    cb.aoTexto((confirmado + parcial).trim());
  };
  r.onerror = (e) => {
    const codigo = String(e?.error || '');
    // 'aborted' é o que acontece quando a própria pessoa aperta parar.
    if (codigo === 'aborted') return;
    cb.aoErro(MENSAGENS[codigo] || 'Não consegui usar o microfone agora.');
  };
  r.onend = () => cb.aoFim();

  return {
    iniciar() {
      try { r.start(); } catch { cb.aoErro('Não consegui abrir o microfone.'); }
    },
    parar() {
      try { r.stop(); } catch { /* já estava parado */ }
    },
  };
}
