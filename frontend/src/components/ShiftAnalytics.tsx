import React, { useState } from 'react';
import { ShiftStats, BenchmarkScenario } from '../types';
import { HOURLY_INCIDENT_TRENDS } from '../data/mockWmsData';
import { TrendingUp, ShieldAlert, CheckCircle2, DollarSign, Calculator, ArrowUpRight, BarChart3, AlertCircle } from 'lucide-react';

interface ShiftAnalyticsProps {
  shiftStats: ShiftStats;
  scenarios: BenchmarkScenario[];
  onSelectScenario: (id: string) => void;
}

export const ShiftAnalytics: React.FC<ShiftAnalyticsProps> = ({
  shiftStats,
  scenarios,
  onSelectScenario
}) => {
  // ROI Interactive Calculator States
  const [cartonsPerDay, setCartonsPerDay] = useState<number>(4500);
  const [avgProductCost, setAvgProductCost] = useState<number>(14500);
  const [baselineDamageRate, setBaselineDamageRate] = useState<number>(1.8); // 1.8% damage without AI
  const [preventionRate, setPreventionRate] = useState<number>(85); // 85% prevented

  // Calculations
  const damagedCartonsWithoutAi = (cartonsPerDay * 30 * (baselineDamageRate / 100));
  const damagesPreventedMonthly = Math.round(damagedCartonsWithoutAi * (preventionRate / 100));
  const monthlySavingsInr = damagesPreventedMonthly * avgProductCost;
  const annualSavingsInr = monthlySavingsInr * 12;

  return (
    <div className="space-y-6">
      {/* Top Executive KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Units Handled */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Scanned Units</span>
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-mono">{shiftStats.totalUnitsHandled.toLocaleString()}</h3>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +12.4% vs last shift quota
            </p>
          </div>
        </div>

        {/* KPI 2: Damages Prevented */}
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden bg-gradient-to-b from-emerald-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Damages Prevented</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-emerald-400 font-mono">{shiftStats.damagesPreventedCount} Units</h3>
            <p className="text-[11px] text-emerald-300 mt-1">
              Early Audio & HUD Interventions
            </p>
          </div>
        </div>

        {/* KPI 3: Estimated Cost Avoidance */}
        <div className="bg-slate-900/90 border border-blue-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden bg-gradient-to-b from-blue-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300">Cost Avoidance (Shift)</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-mono">₹{(shiftStats.estimatedCostSavedInr / 100000).toFixed(2)} Lakh</h3>
            <p className="text-[11px] text-blue-300 mt-1">
              Rework & warranty claim savings
            </p>
          </div>
        </div>

        {/* KPI 4: Safety Compliance Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Shift Safety Index</span>
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-purple-300 font-mono">{shiftStats.safetyScorePct}%</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Target: &gt;90% compliance
            </p>
          </div>
        </div>
      </div>

      {/* Hourly Handling vs Intervention Trend Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Hourly Shift Telemetry & Damage Interventions
            </h3>
            <p className="text-xs text-slate-400">Safe material handlings vs. real-time AI risk interceptions</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> Safe Units Handled
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> AI Interventions
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="grid grid-cols-7 gap-3 pt-4 border-t border-slate-800">
          {HOURLY_INCIDENT_TRENDS.map((trend, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="w-full h-36 bg-slate-950 rounded-xl p-2 flex items-end justify-center gap-1.5 border border-slate-800">
                {/* Safe Units Bar */}
                <div
                  className="w-4 bg-blue-500/80 rounded-t-md transition-all hover:bg-blue-400"
                  style={{ height: `${(trend.safeHandling / 280) * 100}%` }}
                  title={`${trend.safeHandling} Safe Units`}
                />
                {/* Interventions Bar */}
                <div
                  className="w-4 bg-emerald-500 rounded-t-md transition-all hover:bg-emerald-400 shadow-sm shadow-emerald-500"
                  style={{ height: `${(trend.prevented / 10) * 100}%` }}
                  title={`${trend.prevented} Damages Prevented`}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400">{trend.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Bay Risk Breakdown & Behavior Taxonomy Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bay Risk Performance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Loading Bay Risk Performance
          </h3>

          <div className="space-y-3">
            {shiftStats.bayBreakdown.map((bay) => (
              <div
                key={bay.bayId}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{bay.bayId}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      bay.status === 'FLAGGED'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {bay.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{bay.activeVehicle}</p>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-white">{bay.safetyScore}%</span>
                  <p className="text-[11px] text-slate-400">{bay.eventsCount} events logged</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Damage Prevention ROI Calculator */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950/40 border border-blue-500/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              Business Impact & ROI Calculator
            </h3>
            <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
              FINANCIAL SIMULATION
            </span>
          </div>

          {/* Sliders */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Daily Cartons Handled:</span>
                <strong className="font-mono text-white">{cartonsPerDay.toLocaleString()} units/day</strong>
              </div>
              <input
                type="range"
                min={1000}
                max={15000}
                step={500}
                value={cartonsPerDay}
                onChange={(e) => setCartonsPerDay(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Average Product Cost (INR):</span>
                <strong className="font-mono text-white">₹{avgProductCost.toLocaleString('en-IN')}</strong>
              </div>
              <input
                type="range"
                min={2000}
                max={50000}
                step={1000}
                value={avgProductCost}
                onChange={(e) => setAvgProductCost(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>AI Prevention Interception Rate:</span>
                <strong className="font-mono text-emerald-400">{preventionRate}%</strong>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                value={preventionRate}
                onChange={(e) => setPreventionRate(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Computed ROI Results */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 bg-slate-950/60 p-3 rounded-xl">
            <div>
              <span className="text-[11px] text-slate-400">Monthly Loss Avoidance</span>
              <h4 className="text-lg font-bold text-emerald-400 font-mono">
                ₹{(monthlySavingsInr / 100000).toFixed(2)} Lakhs
              </h4>
              <p className="text-[10px] text-slate-400">{damagesPreventedMonthly} units saved/mo</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400">Annualized Savings</span>
              <h4 className="text-lg font-bold text-blue-400 font-mono">
                ₹{(annualSavingsInr / 10000000).toFixed(2)} Crores
              </h4>
              <p className="text-[10px] text-emerald-400">ROI Payback &lt; 3.2 Months</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
