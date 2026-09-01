import React from 'react';
import { ShieldCheck, EyeOff, Lock, UserCheck } from 'lucide-react';

interface PrivacyShieldToggleProps {
  privacyEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const PrivacyShieldToggle: React.FC<PrivacyShieldToggleProps> = ({
  privacyEnabled,
  onToggle
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggle(!privacyEnabled)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
          privacyEnabled
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/20'
            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800'
        }`}
        title="Responsible AI: Worker Silhouette Anonymization & Face Privacy Shield"
      >
        {privacyEnabled ? (
          <>
            <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Shield: ACTIVE</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
              ANONYMIZED
            </span>
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Shield: OFF</span>
          </>
        )}
      </button>
    </div>
  );
};
