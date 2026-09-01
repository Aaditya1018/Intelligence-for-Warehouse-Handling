import React, { useState } from 'react';
import { BENCHMARK_SCENARIOS } from './data/benchmarkScenarios';
import { INITIAL_SHIFT_STATS } from './data/mockWmsData';
import { BenchmarkScenario } from './types';
import { VideoAnalyticsHUD } from './components/VideoAnalyticsHUD';
import { IncidentTimeline } from './components/IncidentTimeline';
import { SupervisorCopilot } from './components/SupervisorCopilot';
import { DigitalTwin3D } from './components/DigitalTwin3D';
import { LiveCameraFeed } from './components/LiveCameraFeed';
import { ShiftAnalytics } from './components/ShiftAnalytics';
import { SafetyScorecard } from './components/SafetyScorecard';
import { RcaReportModal } from './components/RcaReportModal';
import { VoiceAlertSystem } from './components/VoiceAlertSystem';
import { PrivacyShieldToggle } from './components/PrivacyShieldToggle';

import {
  Video,
  Layers,
  Camera,
  BarChart3,
  Trophy,
  FileText,
  Box,
  Activity
} from 'lucide-react';

type TabMode = 'video_hud' | 'digital_twin' | 'live_feed' | 'shift_analytics' | 'safety_scorecard';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<TabMode>('video_hud');

  // Active Scenario & Frame Scrubbing
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SCN-01');
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);

  // Overlays & Privacy Toggles
  const [showSkeletons, setShowSkeletons] = useState<boolean>(true);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showKinematics, setShowKinematics] = useState<boolean>(true);
  const [privacyShield, setPrivacyShield] = useState<boolean>(true);

  // Voice Alert Coaching
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [voiceLanguage, setVoiceLanguage] = useState<'hi' | 'en'>('en');

  // RCA Modal
  const [rcaModalScenario, setRcaModalScenario] = useState<BenchmarkScenario | null>(null);

  // Shift Telemetry
  const [shiftStats, setShiftStats] = useState(INITIAL_SHIFT_STATS);

  // Lookup active scenario object
  const activeScenario = BENCHMARK_SCENARIOS.find((s) => s.id === selectedScenarioId) || BENCHMARK_SCENARIOS[0];
  const currentFrame = activeScenario.frames[currentFrameIdx] || activeScenario.frames[0];

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    setCurrentFrameIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl px-4 py-2.5">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  LoadGuard <span className="text-blue-400 font-mono text-xs font-bold px-1.5 py-0.2 bg-blue-500/10 border border-blue-500/20 rounded">AI</span>
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
                  FIELD INTELLIGENCE v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Autonomous Video Intelligence for Warehouse Damage Prevention</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('video_hud')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'video_hud'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Intelligence</span>
            </button>

            <button
              onClick={() => setActiveTab('digital_twin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'digital_twin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Digital Twin</span>
            </button>

            <button
              onClick={() => setActiveTab('live_feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'live_feed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Ingestion</span>
            </button>

            <button
              onClick={() => setActiveTab('shift_analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'shift_analytics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Shift Analytics & ROI</span>
            </button>

            <button
              onClick={() => setActiveTab('safety_scorecard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'safety_scorecard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Safety Scorecard</span>
            </button>
          </nav>

          {/* Right Header Utilities: Voice & Privacy */}
          <div className="flex items-center gap-2.5">
            <VoiceAlertSystem
              activeAlert={currentFrame.activeAlert}
              enabled={voiceEnabled}
              onToggle={setVoiceEnabled}
              language={voiceLanguage}
              onLanguageChange={setVoiceLanguage}
            />

            <PrivacyShieldToggle
              privacyEnabled={privacyShield}
              onToggle={setPrivacyShield}
            />

            <button
              onClick={() => setRcaModalScenario(activeScenario)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all shadow-sm"
              title="Open Incident Root Cause Analysis"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Shift RCA</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Viewport */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Mode 1: Video Intelligence HUD & Kinematics */}
        {activeTab === 'video_hud' && (
          <div className="space-y-6">
            {/* Top Scenario Selector Strip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="font-bold">Curated Warehouse Handling Benchmark Scenarios:</span>
                  <span className="text-slate-400">(12 Predefined Godrej Behaviors)</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Active: <strong className="text-white">{activeScenario.id}</strong> • {activeScenario.bayId}
                </div>
              </div>

              {/* Horizontal Scrollable Scenario Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {BENCHMARK_SCENARIOS.map((scn) => (
                  <button
                    key={scn.id}
                    onClick={() => handleSelectScenario(scn.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      selectedScenarioId === scn.id
                        ? 'bg-blue-950/60 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-blue-400">
                        {scn.id}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        scn.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : scn.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {scn.severity}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold truncate">{scn.title}</h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{scn.bayId} • {scn.productCategory}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Split Screen: Left Video + Timeline; Right Copilot & Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (8 cols): Video Player HUD & Timeline Controls */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                {/* HUD Overlay Control Filters */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
                  <span className="text-slate-400 font-medium">Vision Overlays:</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showBoxes}
                        onChange={(e) => setShowBoxes(e.target.checked)}
                        className="accent-blue-500 rounded"
                      />
                      <span>Bounding Boxes</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showSkeletons}
                        onChange={(e) => setShowSkeletons(e.target.checked)}
                        className="accent-blue-500 rounded"
                      />
                      <span>Pose Skeletons</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showKinematics}
                        onChange={(e) => setShowKinematics(e.target.checked)}
                        className="accent-blue-500 rounded"
                      />
                      <span>Physics Vectors</span>
                    </label>
                  </div>
                </div>

                {/* Video Analytics HUD */}
                <VideoAnalyticsHUD
                  scenario={activeScenario}
                  currentFrame={currentFrame}
                  showSkeletons={showSkeletons}
                  showBoxes={showBoxes}
                  showKinematics={showKinematics}
                  privacyShield={privacyShield}
                  onFrameSelect={setCurrentFrameIdx}
                />

                {/* Interactive Incident Timeline Scrubber */}
                <IncidentTimeline
                  scenario={activeScenario}
                  currentFrameIdx={currentFrameIdx}
                  onFrameChange={setCurrentFrameIdx}
                  isPlaying={isPlaying}
                  onPlayToggle={setIsPlaying}
                  speed={speed}
                  onSpeedChange={setSpeed}
                />

                {/* Scenario Context & Root Cause Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">
                        SCENARIO INVESTIGATION DOSSIER
                      </span>
                      <h3 className="text-sm font-bold text-white">{activeScenario.title}</h3>
                    </div>
                    <button
                      onClick={() => setRcaModalScenario(activeScenario)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Full RCA Document</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-400">Observed Handling Behavior:</span>
                      <p className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        {activeScenario.observedBehavior}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-emerald-400">Recommended Expected Practice:</span>
                      <p className="text-emerald-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30">
                        {activeScenario.expectedPractice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Conversational AI Supervisor Copilot */}
              <div className="lg:col-span-5 xl:col-span-4 h-[750px]">
                <SupervisorCopilot
                  scenarios={BENCHMARK_SCENARIOS}
                  shiftStats={shiftStats}
                  onSelectScenario={handleSelectScenario}
                  onOpenRca={setRcaModalScenario}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: 3D Digital Twin & Heatmap */}
        {activeTab === 'digital_twin' && (
          <div className="h-[750px]">
            <DigitalTwin3D
              scenarios={BENCHMARK_SCENARIOS}
              activeScenario={activeScenario}
              onSelectScenario={handleSelectScenario}
            />
          </div>
        )}

        {/* Mode 3: Live Camera / File Ingestion */}
        {activeTab === 'live_feed' && (
          <div className="max-w-4xl mx-auto">
            <LiveCameraFeed
              privacyShield={privacyShield}
              onAlertTriggered={() => {}}
            />
          </div>
        )}

        {/* Mode 4: Shift Analytics & ROI Calculator */}
        {activeTab === 'shift_analytics' && (
          <ShiftAnalytics
            shiftStats={shiftStats}
            scenarios={BENCHMARK_SCENARIOS}
            onSelectScenario={handleSelectScenario}
          />
        )}

        {/* Mode 5: Gamified Safety Scorecard */}
        {activeTab === 'safety_scorecard' && (
          <SafetyScorecard />
        )}
      </main>

      {/* Root Cause Analysis (RCA) Modal */}
      <RcaReportModal
        scenario={rcaModalScenario}
        onClose={() => setRcaModalScenario(null)}
      />

      {/* Bottom Status Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-3 text-[11px] text-slate-500">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>
            LoadGuard AI Field Intelligence • Built for Godrej AI Video Intelligence for Warehouse Handling Hackathon
          </span>
          <div className="flex items-center gap-4 font-mono">
            <span>PI-TK Engine: <strong className="text-emerald-400">Online</strong></span>
            <span>Edge Stream: <strong className="text-blue-400">Synchronized</strong></span>
            <span>GDPR Privacy: <strong className="text-emerald-400">Shielded</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
