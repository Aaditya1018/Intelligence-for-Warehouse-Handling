import React from 'react';
import { CheckCircle2, Gauge, ShieldAlert } from 'lucide-react';

const readiness = [
  { bay: 'Bay 1', status: 'Ready', score: 94, color: 'emerald' },
  { bay: 'Bay 2', status: 'Monitor', score: 82, color: 'amber' },
  { bay: 'Bay 3', status: 'Critical', score: 63, color: 'red' },
  { bay: 'Bay 4', status: 'Ready', score: 96, color: 'emerald' }
];

export const BayReadinessPanel: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Bay readiness</p>
          <h3 className="text-sm font-bold text-white">Shift health by loading station</h3>
        </div>
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20">
          <Gauge className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-3">
        {readiness.map((item) => (
          <div key={item.bay} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white">{item.bay}</span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                item.color === 'emerald'
                  ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                  : item.color === 'amber'
                  ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                  : 'border-red-500/30 text-red-300 bg-red-500/10'
              }`}>{item.status}</span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="h-2.5 flex-1 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${
                    item.color === 'emerald'
                      ? 'bg-emerald-500'
                      : item.color === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-300">{item.score}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <div className="flex items-center gap-2 text-slate-300">
          {readiness.some((item) => item.status === 'Critical') ? (
            <ShieldAlert className="w-4 h-4 text-red-300" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          )}
          <span className="text-[11px]">Bay 3 requires immediate supervisor follow-up for safe load staging.</span>
        </div>
      </div>
    </div>
  );
};
