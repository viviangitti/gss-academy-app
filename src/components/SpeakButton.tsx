import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import './SpeakButton.css';

interface Props {
  text: string;
  size?: number;
}

export default function SpeakButton({ text, size = 16 }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakingRef = useRef(false);

  const stopSpeaking = () => {
    // pause() antes de cancel() é mais confiável no iOS
    window.speechSynthesis.pause();
    window.speechSynthesis.cancel();
    speakingRef.current = false;
    setSpeaking(false);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (speakingRef.current) {
      stopSpeaking();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onend = () => {
      speakingRef.current = false;
      setSpeaking(false);
    };

    utterance.onerror = () => {
      speakingRef.current = false;
      setSpeaking(false);
    };

    utteranceRef.current = utterance;

    // Cancela qualquer fala anterior
    window.speechSynthesis.pause();
    window.speechSynthesis.cancel();

    // Marca como "falando" imediatamente — não espera onstart (não dispara no iOS)
    speakingRef.current = true;
    setSpeaking(true);

    // iOS precisa de delay após cancel()
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  if (!('speechSynthesis' in window)) return null;

  return (
    <button
      className={`speak-btn ${speaking ? 'speaking' : ''}`}
      onClick={handleSpeak}
      title={speaking ? 'Parar leitura' : 'Ouvir resposta'}
    >
      {speaking ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </button>
  );
}
