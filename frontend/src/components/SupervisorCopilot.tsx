import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, BenchmarkScenario, ShiftStats } from '../types';
import { Bot, Send, Sparkles, Volume2, HelpCircle, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';

interface SupervisorCopilotProps {
  scenarios: BenchmarkScenario[];
  shiftStats: ShiftStats;
  onSelectScenario: (scenarioId: string) => void;
  onOpenRca: (scenario: BenchmarkScenario) => void;
}

export const SupervisorCopilot: React.FC<SupervisorCopilotProps> = ({
  scenarios,
  shiftStats,
  onSelectScenario,
  onOpenRca
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'ai',
      timestamp: 'Just now',
      text: `👋 **Welcome, Supervisor Rajesh.** I am your **LoadGuard Field Intelligence Copilot**.\n\nI have observed **${scenarios.length} benchmark handling events** across 4 loading bays in this shift. You can ask me natural language questions about risk classifications, bay patterns, root causes, and coaching actions.`,
      suggestions: [
        "Show all high-risk handling events from today's unloading.",
        "What were the three most common risky behaviours during morning shift?",
        "Which loading bay had the highest number of risky events?",
        "Why was SCN-01 classified as high risk?",
        "Generate Shift RCA & Prevention Summary."
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    // AI Reasoning Logic
    setTimeout(() => {
      let aiResponse = '';
      let suggestions: string[] = [];
      let refScenarioId: string | undefined = undefined;

      const lowerQ = q.toLowerCase();

      if (lowerQ.includes('high-risk') || lowerQ.includes('critical') || lowerQ.includes('dangerous') || lowerQ.includes('high risk')) {
        const highRisk = scenarios.filter((s) => s.severity === 'CRITICAL' || s.severity === 'HIGH');
        aiResponse = `🚨 **Identified ${highRisk.length} High & Critical Risk Events in Current Operations:**\n\n` +
          highRisk.map((s) => `• **[${s.id}] ${s.title}** (${s.bayId})\n  *Observed:* ${s.observedBehavior}\n  *Recommended:* ${s.recommendedAction}`).join('\n\n') +
          `\n\n💡 **Field Action:** High impacts at Bay 3 require priority pallet restacking before automated sorting.`;
        suggestions = ['Why was SCN-01 classified as high risk?', 'Which loading bay had the highest number of risky events?', 'Open Bay 3 RCA Report'];
        refScenarioId = 'SCN-01';
      } else if (lowerQ.includes('common') || lowerQ.includes('frequent') || lowerQ.includes('three most') || lowerQ.includes('top')) {
        aiResponse = `📊 **Top 3 Risky Behaviors Observed During Morning Shift:**\n\n` +
          `1. **Improper Inverted Stacking & Overhang (34% of flags):** Heavy appliance cartons placed over fragile consumer packets.\n` +
          `2. **Carton Floor Dragging & Tumbling (28% of flags):** Operators pulling heavy KD flat-packs without hand pallet trucks.\n` +
          `3. **High-Drop Impacts & Tossing (22% of flags):** Tailboard free-fall drops exceeding 1.0m.\n\n` +
          `🎯 **Root Cause Summary:** 68% of incidents occur within the first 1.5m of the vehicle tailgate transition zone.`;
        suggestions = ['Show all high-risk handling events', 'Which loading bay had the highest number of risky events?', 'Show Safety Leaderboard'];
      } else if (lowerQ.includes('which loading bay') || lowerQ.includes('highest number') || lowerQ.includes('bay')) {
        aiResponse = `🏢 **Loading Bay Telemetry Analysis:**\n\n` +
          `• **Bay 3 (Flagged):** Recorded **12 handling risk events** (Highest volume). Driven by heavy container appliance transfers and 1 unbridged dock gap.\n` +
          `• **Bay 2:** 9 events (Moderate - carton tossing and strap pulls).\n` +
          `• **Bay 1:** 7 events (LCV floor dragging).\n` +
          `• **Bay 4 (Top Performer):** 6 events (95.8% safety compliance score).\n\n` +
          `🛠️ **Supervisor Guidance:** Dispatch additional helper to Bay 3 to assist with heavy unit team lifts.`;
        suggestions = ['Show high-risk events at Bay 3', 'Why was SCN-04 classified as high risk?', 'Generate Shift RCA Report'];
        refScenarioId = 'SCN-01';
      } else if (lowerQ.includes('why was') || lowerQ.includes('scn-') || lowerQ.includes('reason') || lowerQ.includes('classified')) {
        const matched = scenarios.find((s) => lowerQ.includes(s.id.toLowerCase())) || scenarios[0];
        aiResponse = `🔍 **Classification Reasoning for [${matched.id}: ${matched.title}]:**\n\n` +
          `• **Observed Behavior:** ${matched.observedBehavior}\n` +
          `• **Kinematic Telemetry:** Measured acceleration $a_y = 9.6\\text{ m/s}^2$ (free fall) with drop height of $1.15\\text{m}$ and kinetic impact energy of $89.2\\text{ Joules}$.\n` +
          `• **Risk Scoring:** **${matched.severity} (Score: 95/100)** due to product fragility (${matched.productCategory}) and potential for internal compressor rupture.\n` +
          `• **Damage Prevention Distinction:** Video Intelligence classified this as *Potential Risk $\\to$ Early Audio Nudge Triggered*, successfully preventing secondary crush on the sorting conveyor.`;
        suggestions = ['Open Full RCA Document', 'Show recommended coaching practice', 'Show all high-risk events'];
        refScenarioId = matched.id;
      } else {
        aiResponse = `📋 **Shift Operations & Damage Prevention Briefing:**\n\n` +
          `• **Total Material Units Handled:** ${shiftStats.totalUnitsHandled} cartons\n` +
          `• **Potential Damage Incidents Prevented:** **${shiftStats.damagesPreventedCount} items**\n` +
          `• **Estimated Financial Loss Avoided:** **₹${shiftStats.estimatedCostSavedInr.toLocaleString('en-IN')}**\n` +
          `• **Shift Safety Index:** **${shiftStats.safetyScorePct}%** (Target: >90%)\n\n` +
          `All employee observations were processed with **Privacy Shield silhouette anonymization**, ensuring a transparent coaching environment rather than punitive surveillance.`;
        suggestions = [
          "Show all high-risk handling events from today's unloading.",
          "What were the three most common risky behaviours during morning shift?",
          "Why was SCN-01 classified as high risk?"
        ];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: aiResponse,
        suggestions,
        referencedScenarioId: refScenarioId
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#`•_]/g, '');
      const u = new SpeechSynthesisUtterance(clean);
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 to-blue-950/60 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              AI Supervisor Copilot <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">ONLINE</span>
            </h3>
            <p className="text-[11px] text-slate-400">Grounded Video Intelligence & RCA Assistant</p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          RAG Engine: <strong className="text-blue-400">Grounded</strong>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-3.5 space-y-2 leading-relaxed shadow-lg ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                <span className="font-semibold text-slate-300">
                  {m.sender === 'user' ? 'Supervisor Rajesh' : 'LoadGuard AI'}
                </span>
                <div className="flex items-center gap-2">
                  <span>{m.timestamp}</span>
                  {m.sender === 'ai' && (
                    <button
                      onClick={() => speakText(m.text)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Read Answer Aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Render message body with markdown-like styling */}
              <div className="whitespace-pre-line text-xs font-normal">
                {m.text}
              </div>

              {/* Action Card if scenario referenced */}
              {m.referencedScenarioId && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-mono text-cyan-400">
                    Target: {m.referencedScenarioId}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectScenario(m.referencedScenarioId!)}
                      className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      <span>Inspect Video</span> <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        const target = scenarios.find((s) => s.id === m.referencedScenarioId);
                        if (target) onOpenRca(target);
                      }}
                      className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <FileText className="w-3 h-3" /> <span>RCA Doc</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Render suggestion chips */}
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                {m.suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSend(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-blue-950/80 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-blue-300 transition-all text-left flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono p-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>Analyzing warehouse video telemetry & kinematics...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Copilot about risk events, bay comparisons, or root causes..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim()}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow-md shadow-blue-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
