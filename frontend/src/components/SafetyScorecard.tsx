import React, { useState } from 'react';
import { MOCK_SAFETY_BADGES, OPERATOR_LEADERBOARD } from '../data/mockWmsData';
import { Award, Trophy, ShieldCheck, Flame, Star, Sparkles, CheckCircle2, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SafetyScorecard: React.FC = () => {
  const [awardedTeam, setAwardedTeam] = useState<string | null>(null);

  const triggerReward = (teamName: string) => {
    setAwardedTeam(teamName);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setAwardedTeam(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base font-bold text-white">Gamified Safety & Handling Excellence</h2>
          </div>
          <p className="text-xs text-slate-300">
            Positive reinforcement coaching system promoting damage-free material transfer without punitive surveillance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Shift Streak: <strong className="text-yellow-400">14 Days Zero-Drop</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: Team Leaderboard & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Leaderboard */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              Loading Team Safety Standings
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              LIVE SHIFT
            </span>
          </div>

          <div className="space-y-3">
            {OPERATOR_LEADERBOARD.map((team) => (
              <div
                key={team.rank}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                    team.rank === 1
                      ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/40'
                      : team.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : 'bg-amber-800 text-white'
                  }`}>
                    #{team.rank}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{team.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {team.units} units handled • {team.preventedIncidents} early nudges accepted
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-emerald-400">{team.score}%</span>
                    <div className="flex items-center gap-1 text-[10px] text-orange-400">
                      <Flame className="w-3 h-3" /> {team.streakDays}d streak
                    </div>
                  </div>

                  <button
                    onClick={() => triggerReward(team.name)}
                    className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-all"
                    title="Send Safety Kudos & Recognition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {awardedTeam && (
            <div className="p-2.5 bg-yellow-500/20 border border-yellow-500/40 rounded-xl text-center text-xs font-bold text-yellow-300 animate-bounce">
              🎉 Safety Recognition Sent to {awardedTeam}!
            </div>
          )}
        </div>

        {/* Milestone Badges */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-400" />
              Safety Milestone Badges
            </h3>
            <span className="text-[10px] font-mono text-slate-400">4 Unlocked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOCK_SAFETY_BADGES.map((b) => (
              <div
                key={b.id}
                className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1.5 hover:border-blue-500/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    {b.tier}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{b.name}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{b.description}</p>
                <span className="text-[10px] text-slate-400 font-mono block pt-1">{b.unlockedAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
