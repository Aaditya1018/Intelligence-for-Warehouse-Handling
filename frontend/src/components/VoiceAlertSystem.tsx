import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Globe, Sparkles } from 'lucide-react';

interface VoiceAlertSystemProps {
  activeAlert?: {
    type: string;
    severity: string;
    message: string;
    hindiMessage: string;
    preventativeTip: string;
  };
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  language: 'hi' | 'en';
  onLanguageChange: (lang: 'hi' | 'en') => void;
}

export const playAudioBeep = (severity: string) => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = severity === 'CRITICAL' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(severity === 'CRITICAL' ? 880 : 550, ctx.currentTime);
    if (severity === 'CRITICAL') {
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
    }
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error('Audio context error:', e);
  }
};

export const VoiceAlertSystem: React.FC<VoiceAlertSystemProps> = ({
  activeAlert,
  enabled,
  onToggle,
  language,
  onLanguageChange
}) => {
  const lastSpokenRef = useRef<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!enabled || !activeAlert) return;

    const speechText = language === 'hi' ? activeAlert.hindiMessage : activeAlert.message;
    if (speechText === lastSpokenRef.current) return;

    lastSpokenRef.current = speechText;
    playAudioBeep(activeAlert.severity);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, [activeAlert, enabled, language]);

  return (
    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 backdrop-blur-md">
      <button
        onClick={() => onToggle(!enabled)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          enabled
            ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/20'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        }`}
        title="Toggle Real-Time Voice Audio Coaching"
      >
        {enabled ? <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-yellow-400' : ''}`} /> : <VolumeX className="w-3.5 h-3.5" />}
        <span>{enabled ? 'Voice Coach: ON' : 'Voice Coach: MUTED'}</span>
        {isSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
      </button>

      {enabled && (
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange('hi')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              language === 'hi' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            हिंदी
          </button>
        </div>
      )}
    </div>
  );
};
