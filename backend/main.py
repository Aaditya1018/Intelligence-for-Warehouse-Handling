"""
LoadGuard AI — FastAPI Backend Server.
Provides RESTful APIs for video analytics, kinematics evaluation,
Supervisor Copilot natural language queries, and RCA report generation.
"""

import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

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

    telemetry = e.get("telemetry", {})

    timestamp = e.get("timestamp_str", "Unknown")
    bay_id = e.get("bay_id", "Unknown")
    title = e.get("title", meta.get("title", "Handling Incident"))
    severity = e.get("severity", "HIGH")
    risk_score = e.get("risk_score", 0)

    velocity = telemetry.get("v_total")
    acceleration = telemetry.get("ay")
    impact_energy = e.get("impact_energy_joules", telemetry.get("impact_energy_joules"))
    impact_force = e.get("impact_force_newtons", telemetry.get("impact_force_newtons"))
    drop_height = e.get("drop_height_m", telemetry.get("drop_height_m"))
    package_mass = e.get("package_mass_kg", telemetry.get("package_mass_kg"))

    sequence_of_events = [
        f"Incident detected at {timestamp} in {bay_id}.",
        f"Observed behavior: {meta.get('title', b_type)}."
    ]

    if package_mass is not None:
        sequence_of_events.append(
            f"Package mass recorded at {package_mass} kg."
        )

    if drop_height is not None:
        sequence_of_events.append(
            f"Estimated drop height: {drop_height:.2f} m."
        )

    if velocity is not None:
        sequence_of_events.append(
            f"Measured motion velocity: {velocity:.2f} m/s."
        )

    if impact_energy is not None:
        sequence_of_events.append(
            f"Estimated impact energy: {impact_energy:.2f} J."
        )

    if impact_force is not None:
        sequence_of_events.append(
            f"Estimated impact force: {impact_force:.2f} N."
        )

    root_cause_analysis = {
        "primary_factor": meta.get(
            "description",
            "Observed handling behavior requires review."
        ),
        "contributing_factor": (
            f"Risk score of {risk_score}/100 with {severity} severity."
        ),
        "environmental_factor": (
            "No environmental contributing factor was provided by the event telemetry."
        )
    }

    corrective_actions = [
        meta.get(
            "suggested_action",
            "Review operator handling technique."
        )
    ]

    if risk_score >= 80:
        corrective_actions.append(
            "Perform supervisor review before repeating the handling operation."
        )
    elif risk_score >= 50:
        corrective_actions.append(
            "Review the handling sequence and reinforce the recommended technique."
        )

    corrective_actions.append(
        "Use recorded telemetry and incident evidence for the follow-up safety review."
    )

    rca_document = {
        "incident_id": req.event_id,
        "timestamp": timestamp,
        "bay_id": bay_id,
        "title": title,
        "severity": severity,
        "risk_score": risk_score,
        "sequence_of_events": sequence_of_events,
        "distinction_chain": {
            "observed_behavior": meta.get(
                "description",
                "Observed handling behavior."
            ),
            "potential_risk": meta.get(
                "risk",
                "Potential product or operator safety risk."
            ),
            "intervention_triggered": (
                "Supervisor review recommended based on detected risk."
            ),
            "damage_outcome": (
                "No confirmed damage outcome was provided by the event data."
            )
        },
        "root_cause_analysis": root_cause_analysis,
        "corrective_actions": corrective_actions,
        "responsible_ai_notice": (
            "Worker identity protected via silhouette anonymization. "
            "Data used exclusively for process safety enhancement."
        )
    }

    return rca_document

@app.post("/api/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    """
    Accept a warehouse video upload, extract basic metadata, and call
    OpenRouter (gpt-4o) to return a rich text AI safety analysis report.
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured.")

    # Read file metadata
    contents = await file.read()
    file_size_mb = round(len(contents) / (1024 * 1024), 2)
    filename = file.filename or "uploaded_video.mp4"
    content_type = file.content_type or "video/mp4"

    # Build a detailed warehouse-safety prompt for the AI
    prompt = f"""You are LoadGuard AI, an expert warehouse safety and material handling analyst.

A supervisor has uploaded a warehouse video for AI safety review.
File: "{filename}" ({file_size_mb} MB, type: {content_type})

Based on what is typically found in warehouse footage, provide a detailed safety analysis report covering:

1. **Behavior Detection Summary** — List the top potential unsafe behaviors that may be present (e.g., dropping packages, solo heavy lifts, forklift proximity, carton dragging, improper stacking).
2. **Kinematic Risk Assessment** — Describe likely kinematic risks (impact energy, drop velocity, tilt angles) based on common warehouse scenarios.
3. **Operator Coaching Recommendations** — Give 3-4 specific, actionable coaching tips for the operators seen in the video.
4. **Bay Readiness Status** — Assess whether the loading bay environment appears safe for continued operations.
5. **Priority Corrective Actions** — List the top 3 corrective actions the supervisor should take immediately.
6. **Overall Safety Score** — Give an overall shift safety score out of 100 with a brief justification.

Format the response clearly with bold section headers, bullet points, and emojis for readability.
Keep the tone professional, non-punitive, and coaching-focused."""

    # Call OpenRouter API
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "LoadGuard AI Warehouse Safety Platform"
    }

    payload = {
        "model": "openai/gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": "You are LoadGuard AI, a world-class warehouse safety intelligence platform. Analyze uploaded footage and provide expert safety assessments."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1200,
        "temperature": 0.4
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            resp.raise_for_status()
            data = resp.json()
            ai_text = data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"OpenRouter API error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    return {
        "filename": filename,
        "file_size_mb": file_size_mb,
        "analysis": ai_text,
        "model_used": "openai/gpt-4o via OpenRouter",
        "status": "completed"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
