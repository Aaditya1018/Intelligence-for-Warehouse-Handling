import React, { useEffect, useState } from 'react';
import { BenchmarkScenario } from '../types';
import { X, Printer, FileText, CheckCircle, AlertTriangle, ShieldCheck, Download } from 'lucide-react';

interface RcaReportModalProps {
  scenario: BenchmarkScenario | null;
  onClose: () => void;
}

export const RcaReportModal: React.FC<RcaReportModalProps> = ({ scenario, onClose }) => {
  const [rca, setRca] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scenario) {
      setRca(null);
      return;
    }

    const loadRca = async () => {
      setLoading(true);
      setError(null);

      try {
        const peakFrame = [...(scenario.frames ?? [])].sort(
          (a, b) =>
            Number(b.telemetry?.riskScore ?? 0) -
            Number(a.telemetry?.riskScore ?? 0)
        )[0];

        const peakTelemetry = peakFrame?.telemetry;

        const response = await fetch(
          'http://127.0.0.1:8000/api/generate-rca',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },

            

            body: JSON.stringify({
              event_id: scenario.id,
              event_data: {
                id: scenario.id,
                timestamp_str: (scenario as any).timestampStr ?? 'Unknown',
                bay_id: scenario.bayId,
                title: (scenario as any).title ?? scenario.observedBehavior,
                behavior_type: (scenario as any).behaviorType ?? 'DROP_IMPACT',
                severity: scenario.severity,
                risk_score: Math.max(
                  ...(scenario.frames ?? []).map((frame) =>
                    Number(frame.telemetry?.riskScore ?? 0)
                  )
                ),
                package_mass_kg: scenario.productMassKg,
                telemetry: {
                  v_total: peakTelemetry?.velocityTotal,
                  ay: peakTelemetry?.accelerationY,
                  drop_height_m: peakTelemetry?.dropHeightMeters,
                  impact_energy_joules: peakTelemetry?.impactEnergyJoules,
                  impact_force_newtons: peakTelemetry?.impactForceNewtons,
                },
                observed_behavior: scenario.observedBehavior,
                potential_risk: scenario.potentialRisk,
                recommended_action: scenario.recommendedAction,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`RCA request failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('Backend RCA:', result);
        setRca(result);
      } catch (err) {
        console.error('RCA generation failed:', err);
        setError('Unable to generate the RCA from the backend.');
      } finally {
        setLoading(false);
      }
    };

    loadRca();
  }, [scenario]);

  if (!scenario) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-blue-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Incident Root Cause Analysis (RCA) & CAPA Report
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Document ID: LG-RCA-{scenario.id}-2026 • Status: INTERCEPTED BY AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300 max-h-[80vh] overflow-y-auto">
          {/* Top Metadata Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400">Loading Bay</span>
              <p className="font-bold text-white">{scenario.bayId}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Vehicle Type</span>
              <p className="font-bold text-white">{scenario.vehicleType}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Product Category</span>
              <p className="font-bold text-white">{scenario.productCategory} ({scenario.productMassKg}kg)</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Severity Classification</span>
              <p className={`font-bold font-mono ${
                scenario.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {rca?.severity ?? scenario.severity} (Score: {rca?.risk_score ?? 0}/100)
              </p>
            </div>
          </div>

          {/* Distinction Chain Section */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-blue-400">
              1. Four-Stage Damage Prevention Distinction Chain
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-amber-400">A. Observed Behavior</span>
                <p className="mt-1 text-slate-300">{scenario.observedBehavior}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-orange-400">B. Potential Risk</span>
                <p className="mt-1 text-slate-300">{scenario.potentialRisk}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-blue-400">C. AI Intervention</span>
                <p className="mt-1 text-slate-300">
                  {rca?.distinction_chain?.intervention_triggered ??
                    'Supervisor review recommended based on detected risk.'}
                </p>
              </div>
              <div className="bg-slate-900 border border-emerald-500/40 p-2.5 rounded-xl bg-emerald-950/20">
                <span className="text-[10px] font-bold text-emerald-400">D. Damage Outcome</span>
                <p className="mt-1 text-slate-300">
                  {rca?.distinction_chain?.damage_outcome ??
                    'No confirmed damage outcome was provided by the event data.'}
                </p>
              </div>
            </div>
          </div>

          {/* Kinematics Telemetry Evidence */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-blue-400">
              2. Physics-Informed Kinematics Evidence (PI-TK)
            </h4>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-[11px] grid grid-cols-2 sm:grid-cols-3 gap-3">
              {loading ? (
  <div className="col-span-full text-blue-400">
    Generating RCA from backend telemetry...
  </div>
) : error ? (
  <div className="col-span-full text-red-400">
    {error}
  </div>
) : (
  <>
    <div>
      Velocity:{' '}
      <strong className="text-blue-400">
        {rca?.sequence_of_events?.find((x: string) =>
          x.toLowerCase().includes('velocity')
        ) ?? 'Not provided'}
      </strong>
    </div>

    <div>
      Drop Height:{' '}
      <strong className="text-white">
        {rca?.sequence_of_events?.find((x: string) =>
          x.toLowerCase().includes('drop height')
        ) ?? 'Not provided'}
      </strong>
    </div>

    <div>
      Impact Energy:{' '}
      <strong className="text-amber-400">
        {rca?.sequence_of_events?.find((x: string) =>
          x.toLowerCase().includes('impact energy')
        ) ?? 'Not provided'}
      </strong>
    </div>

    <div>
      Impact Force:{' '}
      <strong className="text-red-400">
        {rca?.sequence_of_events?.find((x: string) =>
          x.toLowerCase().includes('impact force')
        ) ?? 'Not provided'}
      </strong>
    </div>

    <div>
      Package Mass:{' '}
      <strong className="text-white">
        {scenario.productMassKg} kg
      </strong>
    </div>

    <div>
      Risk Score:{' '}
      <strong className="text-red-400">
        {rca?.risk_score ?? 0}/100
      </strong>
    </div>
  </>
)}
            </div>
          </div>

          {/* Root Cause 5-Why Breakdown */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-blue-400">
              3. Root Cause Investigation
            </h4>
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
  <p>
    <strong>Primary Root Cause:</strong>{' '}
    {rca?.root_cause_analysis?.primary_factor ??
      scenario.rootCause}
  </p>

  <p>
    <strong>Contributing Factor:</strong>{' '}
    {rca?.root_cause_analysis?.contributing_factor ??
      'Not provided'}
  </p>

  <p>
    <strong>Environmental Factor:</strong>{' '}
    {rca?.root_cause_analysis?.environmental_factor ??
      'Not provided'}
  </p>
</div> 
            </div>
          </div>

          {/* Corrective and Preventive Actions (CAPA) */}
<div className="space-y-2">
  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
    4. Corrective & Preventative Actions (CAPA)
  </h4>

  <div className="bg-emerald-950/20 border border-emerald-500/40 p-3.5 rounded-xl space-y-1.5 text-xs text-emerald-200">
    {(rca?.corrective_actions ?? [scenario.recommendedAction]).map(
      (action: string, index: number) => (
        <div key={index} className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{action}</span>
        </div>
      )
    )}
  </div>
</div>

          {/* Responsible AI Compliance Statement */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Responsible AI: Silhouette Anonymized & GDPR-Compliant
            </span>
            <span>Generated by LoadGuard AI Ops</span>
          </div>
        </div>
      </div>
    </div>
  );
};
