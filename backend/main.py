"""
LoadGuard AI — FastAPI Backend Server.
Provides RESTful APIs for video analytics, kinematics evaluation,
Supervisor Copilot natural language queries, and RCA report generation.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

from behavior_detector import BehaviorDetector, BEHAVIOR_TAXONOMY
from copilot_agent import SupervisorCopilotAgent
from kinematics_engine import KinematicsEngine

app = FastAPI(
    title="LoadGuard AI — Field Intelligence Platform",
    description="Autonomous AI Video Intelligence for Warehouse Material Handling & Damage Prevention",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

behavior_detector = BehaviorDetector()
copilot_agent = SupervisorCopilotAgent()
kinematics_engine = KinematicsEngine()

class ChatRequest(BaseModel):
    query: str
    events: Optional[List[Dict[str, Any]]] = []
    shift_context: Optional[Dict[str, Any]] = {}

class FrameAnalysisRequest(BaseModel):
    bbox_coordinates: List[float] # [x, y, w, h]
    trajectory: List[List[float]] # [[x, y, t], ...]
    behavior_candidate: Optional[str] = "DROP_IMPACT"
    package_mass_kg: Optional[float] = 15.0

class RcaRequest(BaseModel):
    event_id: str
    event_data: Dict[str, Any]

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LoadGuard AI Backend",
        "version": "1.0.0",
        "ai_engine": "Physics-Informed Temporal Kinematics (PI-TK)",
        "active_taxonomies": len(BEHAVIOR_TAXONOMY)
    }

@app.get("/api/taxonomy")
def get_taxonomy():
    return {
        "count": len(BEHAVIOR_TAXONOMY),
        "taxonomies": BEHAVIOR_TAXONOMY
    }

@app.post("/api/copilot/chat")
def copilot_chat(req: ChatRequest):
    result = copilot_agent.answer_query(
        query=req.query,
        active_events=req.events,
        shift_context=req.shift_context
    )
    return result

@app.post("/api/analyze-kinematics")
def analyze_kinematics(req: FrameAnalysisRequest):
    traj_tuples = [(p[0], p[1], p[2]) for p in req.trajectory]
    kinematic_stats = kinematics_engine.calculate_velocity_and_accel(traj_tuples)
    
    impact_stats = kinematics_engine.assess_drop_impact(
        package_mass_kg=req.package_mass_kg,
        impact_velocity_m_s=kinematic_stats["v_total"]
    )
    
    combined_telemetry = {**kinematic_stats, **impact_stats}
    evaluation = behavior_detector.evaluate_behavior(
        behavior_type=req.behavior_candidate,
        telemetry=combined_telemetry
    )
    
    return {
        "kinematics": kinematic_stats,
        "impact": impact_stats,
        "evaluation": evaluation
    }

@app.post("/api/generate-rca")
def generate_rca(req: RcaRequest):
    e = req.event_data
    b_type = e.get("behavior_type", "DROP_IMPACT")
    meta = BEHAVIOR_TAXONOMY.get(b_type, {})
    
    rca_document = {
        "incident_id": req.event_id,
        "timestamp": e.get("timestamp_str", "14:22:05"),
        "bay_id": e.get("bay_id", "Bay 3"),
        "title": e.get("title", meta.get("title", "Handling Incident")),
        "severity": e.get("severity", "HIGH"),
        "risk_score": e.get("risk_score", 85),
        "sequence_of_events": [
            "Operator initiated unassisted lift from vehicle tailboard.",
            "Carton slipped due to lack of secondary base support point.",
            f"Free-fall velocity measured at {e.get('telemetry', {}).get('v_total', '2.8')} m/s before ground impact.",
            "Visual evidence captured; package remained stationary after impact."
        ],
        "distinction_chain": {
            "observed_behavior": meta.get("description", "Improper unloading sequence"),
            "potential_risk": "Corrugation crushing and internal product fracture.",
            "intervention_triggered": "Multilingual edge audio alert + Supervisor HUD highlight.",
            "damage_outcome": "Potential damage intercepted; quality check dispatched before sorting."
        },
        "root_cause_analysis": {
            "primary_factor": "Lack of ergonomic vacuum hoist assistance for heavy cartons (>20kg).",
            "contributing_factor": "Staging table placed >2.5m away, encouraging operator to drop or throw cartons.",
            "environmental_factor": "Loading dock ramp gradient uneven."
        },
        "corrective_actions": [
            meta.get("suggested_action", "Review operator handling technique."),
            "Relocate staging pallet to within 1.0m of vehicle tailboard.",
            "Mandate 2-person team lifting for cartons marked >15kg."
        ],
        "responsible_ai_notice": "Worker identity protected via silhouette anonymization. Data used exclusively for process safety enhancement."
    }
    return rca_document

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
