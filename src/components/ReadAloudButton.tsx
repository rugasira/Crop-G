import { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { Language } from '../services/aiService';

// Browser speech-synthesis locale for each app language.
const LOCALES: Record<Language, string> = { en: 'en', sw: 'sw', rw: 'rw', fr: 'fr' };

function pickVoice(language: Language): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const code = LOCALES[language];
  return (
    voices.find(v => v.lang.toLowerCase().startsWith(code)) ||
    // Few devices ship a Kinyarwanda voice; Swahili reads it far better than English does.
    (language === 'rw' ? voices.find(v => v.lang.toLowerCase().startsWith('sw')) : undefined)
  );
}

interface Props {
  text: string;
  language: Language;
  className?: string;
  label?: string;
}

/** Reads text out loud for farmers who prefer listening to reading. */
export function ReadAloudButton({ text, language, className = '', label }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  if (!supported || !text.trim()) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(language);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || LOCALES[language];
    u.rate = 0.9;
    u.onend = u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={speaking ? 'Stop reading' : 'Read aloud'}
      title={speaking ? 'Stop reading' : 'Read aloud'}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${className}`}
    >
      {speaking ? <Square size={16} /> : <Volume2 size={16} />}
      {label && <span>{label}</span>}
    </button>
  );
}
