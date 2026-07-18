// Locução grátis pela voz do próprio navegador (Web Speech API).
// Sem servidor, sem custo, sem chave. A voz muda de aparelho pra aparelho
// (cada sistema tem a sua) — é o protótipo. Voz profissional (ElevenLabs/
// Gemini) fica pra uma segunda fase, com áudio pré-gravado por pílula.

export function speechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

// A lista de vozes carrega de forma assíncrona no Chrome — por isso guardamos
// a voz pt-BR quando ela fica disponível (evento 'voiceschanged').
let ptVoice: SpeechSynthesisVoice | null | undefined;

function loadVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => /pt[-_]BR/i.test(v.lang)) ||
    voices.find((v) => /^pt/i.test(v.lang)) ||
    null
  );
}

if (speechSupported() && typeof window.speechSynthesis.addEventListener === 'function') {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    ptVoice = loadVoice();
  });
}

// iOS só deixa falar se um "speak" acontecer dentro do toque do usuário.
// Chamamos isto no clique do botão pra destravar a locução.
export function primeSpeech(): void {
  if (!speechSupported()) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  window.speechSynthesis.speak(u);
}

export function speak(text: string, onEnd?: () => void): void {
  if (!speechSupported()) {
    onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel(); // interrompe a fala anterior antes de começar a nova
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pt-BR';
  if (ptVoice === undefined) ptVoice = loadVoice();
  if (ptVoice) u.voice = ptVoice;
  u.rate = 1;
  u.pitch = 1;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.(); // se falhar, não trava o slideshow
  synth.speak(u);
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
