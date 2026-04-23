import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import './SpeakButton.css';

interface Props {
  text: string;
  size?: number;
}

export default function SpeakButton({ text, size = 16 }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakingRef = useRef(false); // ref para closures

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
    };
  }, []);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (speakingRef.current) {
      // Para a leitura
      window.speechSynthesis.cancel();
      speakingRef.current = false;
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;

    // iOS carrega vozes de forma assíncrona
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => {
      speakingRef.current = true;
      setSpeaking(true);
    };

    utterance.onend = () => {
      speakingRef.current = false;
      setSpeaking(false);
    };

    utterance.onerror = () => {
      speakingRef.current = false;
      setSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.cancel(); // limpa qualquer fala anterior

    // iOS precisa de um pequeno delay após cancel()
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);

    // Fallback: se onstart não disparar em 1s, assume que está falando
    setTimeout(() => {
      if (!speakingRef.current && utteranceRef.current === utterance) {
        speakingRef.current = true;
        setSpeaking(true);
      }
    }, 1000);
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
