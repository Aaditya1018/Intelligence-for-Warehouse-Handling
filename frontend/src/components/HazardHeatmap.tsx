import React from 'react';
import { Flame, MapPinned } from 'lucide-react';

const heatmapZones = [
  { label: 'Bay 1', risk: 34, x: '12%', y: '26%' },
  { label: 'Bay 2', risk: 58, x: '40%', y: '36%' },
  { label: 'Bay 3', risk: 92, x: '60%', y: '52%' },
  { label: 'Bay 4', risk: 41, x: '78%', y: '24%' }
];

export const HazardHeatmap: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Hazard map</p>
          <h3 className="text-sm font-bold text-white">Hotspot intensity by bay</h3>
        </div>
        <div className="p-2 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20">
          <Flame className="w-4 h-4" />
        </div>
      </div>

      <div className="relative h-52 rounded-2xl border border-slate-800 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.18),_rgba(15,23,42,0.98)_50%)] p-3 overflow-hidden">
        <div className="absolute inset-0 opacity-60" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)',
          backgroundSize: '22px 22px'
        }} />

        {heatmapZones.map((zone) => (
          <div
            key={zone.label}
            className="absolute flex flex-col items-center justify-center rounded-full border border-white/10 bg-red-500/30 shadow-lg shadow-red-500/20"
            style={{
              left: zone.x,
              top: zone.y,
              width: `${Math.max(42, zone.risk * 0.7)}px`,
              height: `${Math.max(42, zone.risk * 0.7)}px`,
              opacity: `${Math.min(0.95, zone.risk / 100 + 0.1)}`
            }}
          >
            <span className="text-[10px] font-mono text-white">{zone.risk}</span>
          </div>
        ))}

        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-2 py-1 text-[10px] font-mono text-slate-300">
          <MapPinned className="w-3 h-3 text-amber-300" />
          Live forklift lane exposure
        </div>
      </div>
    </div>
  );
};
