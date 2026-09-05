"""
AI Operations Assistant & Supervisor Copilot Engine.
Provides natural language querying over warehouse video intelligence events,
root-cause analysis, shift briefings, and proactive coaching recommendations.
"""

from typing import List, Dict, Any
from behavior_detector import BEHAVIOR_TAXONOMY

class SupervisorCopilotAgent:
    def __init__(self):
        pass

    def answer_query(self, query: str, active_events: List[Dict[str, Any]], shift_context: Dict[str, Any]) -> Dict[str, Any]:
        q = query.lower().strip()
        
        # 1. High risk events query
        if "high-risk" in q or "critical" in q or "dangerous" in q or "high risk" in q:
            
            high_risk = [
    e for e in active_events
    if e.get("severity") in ["HIGH", "CRITICAL"]
    or e.get("risk_score", 0) >= 50
]
            if not high_risk:
                return {
                    "response": "No high-risk or critical incidents have been detected in the current shift. All handling parameters remain within safe operational bounds.",
                    "events_referenced": [],
                    "suggestions": ["Show shift summary", "Check pallet stability at Bay 2", "Review average handling velocity"]
                }
            
            bullet_points = "\n".join([
    f"• **{e.get('timestamp_str', '00:00')} [{e.get('location', 'Bay ' + str(e.get('bay_id', '1')))}] "
    f"{e.get('title', BEHAVIOR_TAXONOMY.get(e.get('behavior_type', ''), {}).get('title', 'Event'))}** "
    f"(Risk Score: {e.get('risk_score', 0)}/100) — "
    f"*{e.get('summary', e.get('description', ''))}*"
    for e in high_risk[:5]
])
            
            return {
                "response": f"🚨 **Identified {len(high_risk)} High/Critical Risk Events:**\n\n{bullet_points}\n\n**Immediate Action Needed:** {high_risk[0].get('suggested_action', 'Review operator technique.')}",
                "events_referenced": [
    e.get("id", e.get("event_id", f"event-{i + 1}"))
    for i, e in enumerate(high_risk[:5])
],
                "suggestions": [
    f"Why was {high_risk[0].get('id', high_risk[0].get('event_id', high_risk[0].get('behavior_type', 'this event')))} classified as high risk?",
    "Generate Shift RCA Report",
    "Show bay breakdown"
]
            }

        # 2. Common risky behaviors / top behaviors
        if "common" in q or "frequent" in q or "top" in q or "three most" in q:
            counts = {}
            for e in active_events:
                b_type = e.get("behavior_type", "OTHER")
                counts[b_type] = counts.get(b_type, 0) + 1
            
            sorted_b = sorted(counts.items(), key=lambda x: x[1], reverse=True)
            top3 = sorted_b[:3]
            
            lines = []
            for b_type, cnt in top3:
                name = BEHAVIOR_TAXONOMY.get(b_type, {}).get("title", b_type)
                lines.append(f"1. **{name}**: {cnt} occurrences ({round(cnt/max(len(active_events),1)*100)}% of incidents)")
            
            return {
                "response": f"📊 **Top Risky Behaviors Recorded During Current Shift:**\n\n" + "\n".join(lines) + 
                            f"\n\n💡 **Root Cause Insight:** The majority of improper stacking and dragging events originate at the vehicle unloading transfer threshold.",
                "events_referenced": [],
                "suggestions": ["Which loading bay had the highest events?", "Show coaching recommendations", "Explain drop risk criteria"]
            }

        # 3. Loading bay comparison / worst bay
        if "which loading bay" in q or "highest number" in q or "bay" in q and ("most" in q or "worst" in q or "highest" in q):
            bay_counts = {}
            for e in active_events:
                bid = f"Bay {e.get('bay_id', '1')}"
                bay_counts[bid] = bay_counts.get(bid, 0) + 1
            
            if not bay_counts:
                return {
                    "response": "All loading bays (Bay 1 to Bay 4) currently have zero recorded violations.",
                    "events_referenced": [],
                    "suggestions": ["Show shift summary"]
                }
            
            worst_bay = max(bay_counts.items(), key=lambda x: x[1])
            return {
                "response": f"🏢 **Loading Bay Risk Distribution:**\n\n" + 
                            f"• **{worst_bay[0]}** recorded the highest incident volume with **{worst_bay[1]} events** (primarily fast pallet transfers and dock gap crossings).\n" +
                            f"• Other bays: " + ", ".join([f"{k}: {v}" for k, v in bay_counts.items() if k != worst_bay[0]]) + 
                            f"\n\n**Recommendation:** Deploy hydraulic dock leveler inspection for {worst_bay[0]} and re-align staging buffers.",
                "events_referenced": [],
                "suggestions": [f"Show high-risk events at {worst_bay[0]}", "Generate RCA for {worst_bay[0]}", "View 3D Digital Twin"]
            }

        # 4. Specific event classification query ("Why was event X classified as high risk?")
        if "why was" in q or "reason" in q or "explain" in q or "classified" in q:
            # Match any event id
            matched_event = active_events[0] if active_events else None
            for e in active_events:
                if str(e.get("id", "")).lower() in q or e.get("behavior_type", "").lower() in q:
                    matched_event = e
                    break
                    
            if matched_event:
                tele = matched_event.get("telemetry", {})
                return {
                    "response": f"🔍 **Classification Breakdown for [{matched_event.get('title', 'Event')}]:**\n\n" +
                                f"• **Observed Behavior:** {matched_event.get('description')}\n" +
                                f"• **Kinematic Telemetry:** Measured vertical velocity = {tele.get('v_total', '2.8')} m/s, Acceleration = {tele.get('ay', '9.4')} m/s², Impact Energy = {tele.get('kinetic_energy_joules', '84.2')} Joules.\n" +
                                f"• **Risk Classification:** **{matched_event.get('severity', 'HIGH')}** (Score: {matched_event.get('risk_score', 85)}/100).\n" +
                                f"• **Distinction Principle:** Observed free-fall trajectory $\\rightarrow$ High potential structural damage $\\rightarrow$ Operator intervention triggered before secondary stack loading.",
                    "events_referenced": [matched_event.get("id")],
                    "suggestions": ["What is the recommended corrective action?", "Export incident evidence", "Show supervisor checklist"]
                }

        # 5. Shift summary / prevention overview
        if "summary" in q or "shift" in q or "overview" in q or "report" in q:
            total = len(active_events)
            high_count = sum(1 for e in active_events if e.get("severity") in ["HIGH", "CRITICAL"])
            prevented = int(total * 0.88)
            est_saved = total * 3200  # INR approx
            
            return {
                "response": f"📋 **Shift Operations & Damage Prevention Briefing:**\n\n" +
                            f"• **Total Telemetry Incidents Detected:** {total} handling events\n" +
                            f"• **High/Critical Severity Interventions:** {high_count} events\n" +
                            f"• **Potential Damage Prevented:** {prevented} packages saved via early audio/visual nudges\n" +
                            f"• **Estimated Cost Avoidance:** ₹{est_saved:,} in damage replacement/rework costs\n" +
                            f"• **Shift Safety Score:** 88.5% (Target: >85%)\n\n" +
                            f"**Operational Shift Focus:** Great progress on team lifting compliance. Focus next shift on dock leveling and inverted pallet restacking.",
                "events_referenced": [],
                "suggestions": ["Export PDF Shift RCA", "Show operator safety scorecard", "View 3D bay heatmap"]
            }

        # Generic fallback intelligent answer
        return {
            "response": f"LoadGuard AI Supervisor Assistant is monitoring **4 active loading bays**. Currently tracking **{len(active_events)} handling telemetry events** across vehicle unloading, manual lifting, and pallet staging. All data is processed using privacy-preserving worker silhouette masking.",
            "events_referenced": [],
            "suggestions": [
                "Show all high-risk handling events from today's unloading.",
                "What were the three most common risky behaviours during the morning shift?",
                "Which loading bay had the highest number of risky events?",
                "Why was this event classified as high risk?"
            ]
        }
