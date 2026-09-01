import pytest
from fastapi.testclient import TestClient
from main import app
from kinematics_engine import KinematicsEngine
from behavior_detector import BehaviorDetector, BEHAVIOR_TAXONOMY
from copilot_agent import SupervisorCopilotAgent

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["active_taxonomies"] >= 12

def test_taxonomy_endpoint():
    res = client.get("/api/taxonomy")
    assert res.status_code == 200
    data = res.json()
    assert "DROP_IMPACT" in data["taxonomies"]
    assert "INVERTED_PYRAMID_STACKING" in data["taxonomies"]
    assert "CARTON_DRAGGING" in data["taxonomies"]

def test_kinematics_engine_drop():
    engine = KinematicsEngine()
    # Simulate a 1.2m drop in 0.5s (trajectory in pixels: 120 ppm)
    # y = 100 -> 244 px
    traj = [
        (200.0, 100.0, 0.0),
        (200.0, 150.0, 0.25),
        (200.0, 244.0, 0.5)
    ]
    res = engine.calculate_velocity_and_accel(traj)
    assert res["v_total"] > 0
    assert res["drop_height_m"] > 1.0

    impact = engine.assess_drop_impact(package_mass_kg=25.0, impact_velocity_m_s=3.2)
    assert impact["severity"] in ["HIGH", "CRITICAL"]
    assert impact["kinetic_energy_joules"] > 100.0

def test_stack_stability():
    engine = KinematicsEngine()
    # Inverted stack: 40kg heavy box on 5kg small box
    res = engine.assess_stack_stability(
        base_box_bbox=[100, 200, 80, 80],
        top_box_bbox=[90, 100, 120, 100],
        base_weight_kg=5.0,
        top_weight_kg=40.0
    )
    assert res["is_inverted_pyramid"] is True
    assert res["severity"] in ["HIGH", "CRITICAL"]

def test_copilot_chat():
    res = client.post("/api/copilot/chat", json={
        "query": "What were the three most common risky behaviours during the morning shift?",
        "events": [
            {"id": "E1", "behavior_type": "DROP_IMPACT", "severity": "CRITICAL", "risk_score": 95},
            {"id": "E2", "behavior_type": "INVERTED_PYRAMID_STACKING", "severity": "HIGH", "risk_score": 85},
            {"id": "E3", "behavior_type": "CARTON_DRAGGING", "severity": "HIGH", "risk_score": 75}
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert len(data["response"]) > 20

def test_rca_generation():
    res = client.post("/api/generate-rca", json={
        "event_id": "SCN-01",
        "event_data": {
            "title": "Product Dropped from Height",
            "behavior_type": "DROP_IMPACT",
            "bay_id": "Bay 3",
            "severity": "CRITICAL",
            "risk_score": 95
        }
    })
    assert res.status_code == 200
    data = res.json()
    assert data["incident_id"] == "SCN-01"
    assert "sequence_of_events" in data
    assert "corrective_actions" in data

if __name__ == "__main__":
    test_health_endpoint()
    test_taxonomy_endpoint()
    test_kinematics_engine_drop()
    test_stack_stability()
    test_copilot_chat()
    test_rca_generation()
    print("ALL 6 TEST SUITES PASSED SUCCESSFULLY!")
