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

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  if (!('speechSynthesis' in window)) return null;

  return (
    <button className={`speak-btn ${speaking ? 'speaking' : ''}`} onClick={handleSpeak} title={speaking ? 'Parar' : 'Ouvir'}>
      {speaking ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </button>
  );
}
