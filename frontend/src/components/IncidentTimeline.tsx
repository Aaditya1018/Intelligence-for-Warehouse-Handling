import React, { useEffect, useRef } from 'react';
import { BenchmarkScenario } from '../types';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Zap } from 'lucide-react';

interface IncidentTimelineProps {
  scenario: BenchmarkScenario;
  currentFrameIdx: number;
  onFrameChange: (index: number) => void;
  isPlaying: boolean;
  onPlayToggle: (playing: boolean) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  scenario,
  currentFrameIdx,
  onFrameChange,
  isPlaying,
  onPlayToggle,
  speed,
  onSpeedChange
}) => {
  const timerRef = useRef<number | null>(null);
  const currentIdxRef = useRef<number>(currentFrameIdx);
  currentIdxRef.current = currentFrameIdx;

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (1000 / scenario.fps) / speed;
      timerRef.current = window.setInterval(() => {
        const next = currentIdxRef.current >= scenario.frames.length - 1 ? 0 : currentIdxRef.current + 1;
        onFrameChange(next);
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, scenario.frames.length, scenario.fps, onFrameChange]);

  const currentFrame = scenario.frames[currentFrameIdx] || scenario.frames[0];
  const totalFrames = scenario.frames.length;

  const jumpToIncident = () => {
    const targetIdx = scenario.frames.findIndex((f) => f.telemetry.riskScore > 70 || f.activeAlert);
    if (targetIdx !== -1) {
      onFrameChange(targetIdx);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 backdrop-blur-md">
      {/* Top Scrubber Row */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            Timestamp: <strong className="text-white">{currentFrame.timestampSec.toFixed(1)}s</strong> / {scenario.durationSec.toFixed(1)}s
          </span>
          <span className="text-slate-400">
            Frame: <strong className="text-blue-400">{currentFrameIdx + 1}</strong> / {totalFrames}
          </span>
          <span className="text-slate-400">
            Phase: <strong className="text-amber-400">{currentFrame.description}</strong>
          </span>
        </div>

        {/* Timeline Slider with Risk Color Dots */}
        <div className="relative w-full h-8 flex items-center group">
          {/* Background track */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
            {/* Risk heat gradient track */}
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-amber-500 to-red-500 rounded-full transition-all duration-75"
              style={{ width: `${((currentFrameIdx + 1) / totalFrames) * 100}%` }}
            />
          </div>

          {/* Interactive Range Input */}
          <input
            type="range"
            min={0}
            max={totalFrames - 1}
            value={currentFrameIdx}
            onChange={(e) => onFrameChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {/* Incident Marker Dots along timeline */}
          {scenario.frames.map((f, idx) => {
            if (f.telemetry.riskScore > 70) {
              const leftPct = (idx / (totalFrames - 1)) * 100;
              return (
                <div
                  key={idx}
                  onClick={() => onFrameChange(idx)}
                  className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-slate-900 cursor-pointer transition-transform hover:scale-150 ${
                    f.telemetry.riskScore > 85 ? 'bg-red-500 animate-ping-slow' : 'bg-amber-400'
                  }`}
                  style={{ left: `${leftPct}%` }}
                  title={`Incident at ${f.timestampSec}s (Risk: ${f.telemetry.riskScore})`}
                />
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Playback Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800 text-xs">
        {/* Play/Pause & Step Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFrameChange(Math.max(0, currentFrameIdx - 1))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Previous Frame"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => onPlayToggle(!isPlaying)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> <span>Play Video</span>
              </>
            )}
          </button>

          <button
            onClick={() => onFrameChange(Math.min(totalFrames - 1, currentFrameIdx + 1))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Next Frame"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onPlayToggle(false);
              onFrameChange(0);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Restart Scenario"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Jump to Incident Trigger */}
        <button
          onClick={jumpToIncident}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 font-semibold transition-all shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-red-400" />
          <span>Jump to Impact Point</span>
        </button>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
          {[0.5, 1.0, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                speed === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x {s === 0.5 ? '(Slow-Mo)' : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
