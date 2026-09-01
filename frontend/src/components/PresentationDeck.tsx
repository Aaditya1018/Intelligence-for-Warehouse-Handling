import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Shield, User, Zap } from 'lucide-react';

export const PresentationDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      slideNum: 1,
      title: 'LoadGuard AI',
      subtitle: 'Autonomous Field Intelligence & Predictive Damage Prevention Platform',
      category: 'SOLUTION & TEAM',
      content: (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/40 space-y-2">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              Core Value Proposition
            </span>
            <h3 className="text-xl font-bold text-white leading-snug">
              "Transforming CCTV from Retrospective Surveillance into Proactive Operational Intelligence that Intercepts Material Handling Hazards Before Damage Occurs."
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 font-mono">TEAM DETAILS</span>
              <p className="text-sm font-bold text-white">Team Vanguard (Autonomous Systems AI)</p>
              <p className="text-slate-300">Aaditya Chourasia & Team • Hackathon 2026</p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">Computer Vision</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">Edge Kinematics</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">Responsible AI</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 font-mono">TARGET APPLICABILITY</span>
              <p className="text-slate-300">
                Engineered for industrial loading bays, cross-dock warehouses, FMCG/appliance transfer hubs, and retail distribution centers.
              </p>
              <div className="text-emerald-400 font-bold font-mono pt-1">
                ✓ 12 Predefined Godrej Behaviors Fully Implemented
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      slideNum: 2,
      title: 'Problem, Solution & User Journey',
      subtitle: 'From Passive Retrospective CCTV to Proactive Damage Prevention',
      category: 'PROBLEM & USER JOURNEY',
      content: (
        <div className="space-y-5 text-xs">
          {/* Journey Flowchart */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase">
              End-to-End Operational Pipeline
            </span>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-[11px] font-semibold">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[9px]">1. ACTIVITY</span>
                <span className="text-white">Unloading & Staging</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[9px]">2. VIDEO</span>
                <span className="text-blue-400">4K CCTV / Mobile</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-blue-500/40 bg-blue-950/20">
                <span className="text-blue-400 block text-[9px]">3. AI UNDERSTANDING</span>
                <span className="text-blue-300">PI-TK Kinematics</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/40 bg-amber-950/20">
                <span className="text-amber-400 block text-[9px]">4. RISK DETECTION</span>
                <span className="text-amber-300">Drop / Invert / Drag</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-red-500/40 bg-red-950/20">
                <span className="text-red-400 block text-[9px]">5. ALERT</span>
                <span className="text-red-300">Hindi Voice Nudge</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20">
                <span className="text-emerald-400 block text-[9px]">6. INTERVENTION</span>
                <span className="text-emerald-300">Loader Adjusts Lift</span>
              </div>
              <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-400">
                <span className="text-emerald-300 block text-[9px]">7. PREVENTION</span>
                <span className="text-white font-bold">Zero Loss</span>
              </div>
            </div>
          </div>

          {/* Dual User Journey */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Loader / Operator Journey
              </span>
              <p className="text-slate-300 leading-relaxed">
                Receives sub-50ms edge multilingual voice nudges ("कृपया भारी सामान अकेले न उठाएं"), correcting handling ergonomics in real-time without punitive fear.
              </p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
              <span className="font-bold text-blue-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Supervisor & Manager Journey
              </span>
              <p className="text-slate-300 leading-relaxed">
                Interacts with Conversational AI Copilot, inspects 3D Digital Twin hazard heatmaps, tracks bay risk indices, and exports automated Shift RCA reports.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      slideNum: 3,
      title: 'Technical Architecture & Tech Stack',
      subtitle: 'Physics-Informed Temporal Kinematics & Multi-Modal Copilot',
      category: 'ARCHITECTURE & TECH STACK',
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <span className="font-bold text-cyan-400 font-mono">1. COMPUTER VISION & AI/ML</span>
              <ul className="space-y-1 text-slate-300">
                <li>• <strong>YOLOv8 / YOLOv11</strong> Object Tracking (Cartons, Pallets, Forklifts, Docks)</li>
                <li>• <strong>MediaPipe / YOLO-Pose</strong> Skeleton Tracking</li>
                <li>• <strong>PI-TK Physics Engine</strong> (Velocity, Acceleration, Impact Energy, COG)</li>
                <li>• <strong>Responsible AI:</strong> Edge Silhouette Privacy Shield</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <span className="font-bold text-purple-400 font-mono">2. GENAI & CONVERSATIONAL LLM</span>
              <ul className="space-y-1 text-slate-300">
                <li>• <strong>Supervisor AI Copilot:</strong> Natural language querying over shift telemetry</li>
                <li>• <strong>Automated RCA Generator:</strong> 5-Why & CAPA action planner</li>
                <li>• <strong>Multilingual Web Speech API:</strong> Hindi & English edge voice coaching</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <span className="font-bold text-blue-400 font-mono">3. FRONTEND & DIGITAL TWIN</span>
              <ul className="space-y-1 text-slate-300">
                <li>• <strong>React 18 + Vite + TailwindCSS</strong></li>
                <li>• <strong>Three.js WebGL:</strong> 3D Loading Bay Digital Twin & Spatio-Temporal Risk Heatmaps</li>
                <li>• <strong>Canvas 2D HUD:</strong> Sub-50ms vector and skeleton rendering</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-300 flex items-center justify-between">
            <span>Inference Latency: <strong className="text-emerald-400">&lt;38ms on Edge</strong></span>
            <span>Architecture: <strong className="text-blue-400">Dual-Stream Fast/Deep Hybrid</strong></span>
            <span>Privacy Compliance: <strong className="text-emerald-400">GDPR & Labor Friendly</strong></span>
          </div>
        </div>
      )
    },
    {
      slideNum: 4,
      title: 'Prototype Demo & Behavior Taxonomy',
      subtitle: '12 Predefined Scenarios Tested & Verified',
      category: 'PROTOTYPE DEMO',
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: '1', name: 'Drop Impact', tag: 'a=9.6m/s²', color: 'text-red-400' },
              { id: '2', name: 'Floor Dragging', tag: 'Friction Abrasion', color: 'text-amber-400' },
              { id: '3', name: 'Carton Tossing', tag: 'Parabolic Arc', color: 'text-orange-400' },
              { id: '4', name: 'Inverted Stacking', tag: '42kg on 6kg Base', color: 'text-red-400' },
              { id: '5', name: 'Pallet Overhang', tag: '38% Lean Angle', color: 'text-amber-400' },
              { id: '6', name: 'Zone Breach', tag: 'Forklift Drive Lane', color: 'text-red-400' },
              { id: '7', name: 'Solo Heavy Lift', tag: '34kg Ergonomic', color: 'text-yellow-400' },
              { id: '8', name: 'Stepping on Boxes', tag: 'Crush Hazard', color: 'text-red-400' },
              { id: '9', name: 'Carton Tumbling', tag: 'Corner Slam', color: 'text-yellow-400' },
              { id: '10', name: 'Strap Pulling', tag: 'Band Tension', color: 'text-yellow-400' },
              { id: '11', name: 'Dock Plate Gap', tag: '14cm Step Drop', color: 'text-red-400' },
              { id: '12', name: 'Forklift Pinch', tag: '<1.2m Blind Zone', color: 'text-red-400' },
            ].map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-0.5">
                <span className="text-[10px] font-mono text-slate-500">#{item.id}</span>
                <h4 className="font-bold text-white text-xs">{item.name}</h4>
                <p className={`text-[10px] font-mono font-semibold ${item.color}`}>{item.tag}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 p-3.5 rounded-xl flex items-center justify-between">
            <span className="text-slate-300">
              Live Webcam & Custom MP4/WebM Video Ingestion Ready
            </span>
            <span className="text-emerald-400 font-bold font-mono">
              ✓ All 12 Behaviors Verified
            </span>
          </div>
        </div>
      )
    },
    {
      slideNum: 5,
      title: 'Business Impact, Damage Prevention & Validation',
      subtitle: 'Financial ROI, Claims Reduction & Stakeholder Acceptance',
      category: 'BUSINESS IMPACT & ROI',
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-emerald-500/40 p-4 rounded-xl space-y-1 bg-emerald-950/20">
              <span className="text-[11px] text-emerald-300 font-bold">DAMAGE REDUCTION</span>
              <h3 className="text-2xl font-bold text-emerald-400 font-mono">-78.4%</h3>
              <p className="text-slate-400 text-[11px]">Drop & improper stacking damage decrease</p>
            </div>

            <div className="bg-slate-900/90 border border-blue-500/40 p-4 rounded-xl space-y-1 bg-blue-950/20">
              <span className="text-[11px] text-blue-300 font-bold">ANNUAL FINANCIAL SAVINGS</span>
              <h3 className="text-2xl font-bold text-white font-mono">₹46.1 Lakhs</h3>
              <p className="text-slate-400 text-[11px]">Per warehouse hub (based on 4,500 daily units)</p>
            </div>

            <div className="bg-slate-900/90 border border-purple-500/40 p-4 rounded-xl space-y-1 bg-purple-950/20">
              <span className="text-[11px] text-purple-300 font-bold">ROI PAYBACK PERIOD</span>
              <h3 className="text-2xl font-bold text-purple-300 font-mono">&lt; 3.2 Months</h3>
              <p className="text-slate-400 text-[11px]">Software-only deployment using existing CCTV</p>
            </div>
          </div>

          {/* User Validation Table */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <span className="font-bold text-white text-xs">Stakeholder Validation Observations:</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <strong>Warehouse Supervisor:</strong> 1-click Shift RCA saves 45 mins of daily incident paperwork.
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <strong>Loading Operator:</strong> Hindi audio alerts provide intuitive coaching without supervisor friction.
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <strong>Quality Manager:</strong> Complete video evidence log accelerates vendor claim recovery.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      slideNum: 6,
      title: 'Responsible AI & Enterprise Scale Roadmap',
      subtitle: 'Building the Autonomous Field Intelligence Platform for Physical Operations',
      category: 'RESPONSIBLE AI & HORIZON',
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Responsible AI Principles
              </span>
              <ul className="space-y-1.5 text-slate-300">
                <li>• <strong>Silhouette Anonymization:</strong> No facial recognition; worker identities masked at edge.</li>
                <li>• <strong>Gamified Positive Reinforcement:</strong> Non-punitive leaderboards and safety badges.</li>
                <li>• <strong>Human-in-the-Loop:</strong> AI classifies potential risk; human supervisor confirms damage.</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> The Bigger Enterprise Vision
              </span>
              <p className="text-slate-300 leading-relaxed">
                Extending the LoadGuard AI Field Intelligence architecture across the physical supply chain:
              </p>
              <div className="p-2 rounded-lg bg-slate-950 font-mono text-[10px] text-cyan-300 border border-slate-800 text-center">
                Warehouse → Factory → Distribution Center → Loading Bay → Retail Hub
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-center text-sm shadow-xl">
            🏆 LoadGuard AI: Ready for Deployment Across Godrej Warehouses
          </div>
        </div>
      )
    }
  ];

  const current = slides[currentSlide];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-6">
      {/* Top Deck Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
            {current.category}
          </span>
          <h2 className="text-base font-bold text-white">{current.title}</h2>
          <p className="text-xs text-slate-400">{current.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-400">
            Slide <strong className="text-white">{currentSlide + 1}</strong> of {slides.length}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Canvas Body */}
      <div className="min-h-[380px] p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col justify-center">
        {current.content}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="grid grid-cols-6 gap-2 pt-2">
        {slides.map((s, idx) => (
          <button
            key={s.slideNum}
            onClick={() => setCurrentSlide(idx)}
            className={`p-2 rounded-xl border text-left transition-all ${
              currentSlide === idx
                ? 'bg-blue-600/30 border-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-[9px] font-mono block">Slide {s.slideNum}</span>
            <span className="text-[11px] font-bold truncate block">{s.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
