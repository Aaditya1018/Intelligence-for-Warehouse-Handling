import React from 'react';
import { AlertTriangle, Mic, MessageSquareText } from 'lucide-react';

const coachingTips = [
  { title: 'Two-person lift trigger', detail: 'Prompted for 34kg carton lift beyond ergonomic threshold.' },
  { title: 'Dock gap alert', detail: 'Bridge plate verification required before trolley transfer.' },
  { title: 'Pallet overhang correction', detail: 'Re-center load before forklift movement to prevent crush risk.' }
];

export const OperatorCoachPanel: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Operator coaching</p>
          <h3 className="text-sm font-bold text-white">Real-time intervention guidance</h3>
        </div>
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <Mic className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-3">
        {coachingTips.map((tip) => (
          <div key={tip.title} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-lg bg-amber-500/10 p-1.5 text-amber-300 border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{tip.title}</p>
                <p className="mt-1 text-[11px] text-slate-300">{tip.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
        <div className="flex items-center gap-2 text-emerald-300">
          <MessageSquareText className="w-4 h-4" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">AI voice prompt</span>
        </div>
        <p className="mt-2 text-sm text-emerald-100">“सावधान: भारी पैकेज को अकेले न उठाएं। टीम लिफ्ट का उपयोग करें।”</p>
      </div>
    </div>
  );
};
