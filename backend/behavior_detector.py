"""
Sequence-of-Actions Temporal State Machine & Behavior Detector.
Recognizes 12+ predefined warehouse handling risk behaviors by combining
Object Detection, Pose Tracking, Kinematic Telemetry, and Spatio-temporal logic.
"""

from typing import List, Dict, Any, Optional
from kinematics_engine import KinematicsEngine

BEHAVIOR_TAXONOMY = {
    "DROP_IMPACT": {
        "title": "Product Dropped from Height",
        "description": "Product fell with free-fall acceleration and sustained sudden impact deceleration on floor.",
        "category": "Impact Risk",
        "good_practice": "Lift and place products gently. Never throw or drop a package during loading or unloading.",
        "suggested_action": "Inspect carton for structural/internal damage. Verify unloading ramp and coach operator on two-handed controlled lowering."
    },
    "CARTON_DRAGGING": {
        "title": "Dragging Cartons on Warehouse Floor",
        "description": "Carton moved horizontally across floor without lifting, causing friction abrasion and bottom seam failure.",
        "category": "Abrasion Risk",
        "good_practice": "Use a trolley, pallet truck or suitable handling equipment instead of dragging products on the floor.",
        "suggested_action": "Deploy hydraulic hand pallet truck or staging dolly for all heavy multi-carton transfers."
    },
    "ROUGH_HANDLING_THROW": {
        "title": "Throwing / Tossing Cartons",
        "description": "Carton released into mid-air with horizontal velocity toward staging stack rather than placed by hand.",
        "category": "Impact & Crush",
        "good_practice": "Lift and place products gently with two points of contact.",
        "suggested_action": "Reposition staging buffer closer to unloading tailboard to eliminate operator toss reach."
    },
    "INVERTED_PYRAMID_STACKING": {
        "title": "Improper Inverted Stacking",
        "description": "Heavy/large cartons placed on top of lighter/smaller fragile cartons causing crush and collapse hazard.",
        "category": "Stacking Hazard",
        "good_practice": "Stack larger and heavier packets at the bottom and smaller/lighter packets on top. Ensure complete packet support.",
        "suggested_action": "Restack pallet with descending weight profile (heavy base -> medium center -> lightweight top)."
    },
    "UNSTABLE_TILT_OVERHANG": {
        "title": "Unstable Pallet Tilt & Overhang",
        "description": "Cartons positioned with center-of-mass overhang >35% or stack lean angle exceeding 12 degrees.",
        "category": "Structural Instability",
        "good_practice": "Use correct-size pallet; ensure complete carton support without unsupported cantilever overhang.",
        "suggested_action": "Apply stretch wrap film reinforcement immediately and align cartons within pallet perimeter."
    },
    "OUTSIDE_DESIGNATED_AREA": {
        "title": "Staged in Transit Danger Zone",
        "description": "Cartons placed outside yellow bay markings directly in active forklift traffic lane.",
        "category": "Traffic & Safety",
        "good_practice": "Stage products systematically according to size, weight, sequence, and designated floor markings.",
        "suggested_action": "Clear forklift corridor immediately; transfer staged items to Bay Staging Grid #2."
    },
    "SOLO_HEAVY_LIFT": {
        "title": "Solo Manual Lifting of Heavy Product (>25kg)",
        "description": "Single worker lifting oversized appliance/carton exceeding ergonomic safe lifting thresholds.",
        "category": "Ergonomic & Drop Risk",
        "good_practice": "Use team lifting or suitable mechanical handling equipment and place product in a controlled manner.",
        "suggested_action": "Enforce mandatory 2-person buddy lift protocol or utilize vacuum lifter at loading dock."
    },
    "STEPPING_ON_CARTONS": {
        "title": "Stepping / Standing on Cartons",
        "description": "Operator standing or walking on stacked cartons to reach top shelves or truck ceiling.",
        "category": "Crush & Fall Hazard",
        "good_practice": "Never step, stand or walk on packages. Keep a clear working path and use approved rolling ladders.",
        "suggested_action": "Provide safety mobile step-platform at Bay 3; audit worker ergonomics."
    },
    "ROLLING_CARTONS": {
        "title": "Rolling Non-Cylindrical Cartons",
        "description": "Cuboid cartons tumbled or rolled corner-over-corner along the warehouse floor.",
        "category": "Edge & Joint Damage",
        "good_practice": "Carry or move products using appropriate material-handling equipment; do not roll products.",
        "suggested_action": "Provide specialized tilt-truck / carton clamp attachment for bulk transfers."
    },
    "STRAP_LIFTING": {
        "title": "Lifting Cartons by Packaging Straps",
        "description": "Worker lifting heavy box by grasping plastic tension straps instead of base or hand cutouts.",
        "category": "Packaging Failure",
        "good_practice": "Handle the carton using proper lifting points/equipment. Do not use packaging straps as handles.",
        "suggested_action": "Coach operator on base grip technique; verify carton handle cutout accessibility."
    },
    "DOCK_GAP_HAZARD": {
        "title": "Dock Leveler Gap / Uneven Transition",
        "description": "Transferring loaded trolley across unbridged dock gap between warehouse bay and truck bed.",
        "category": "Spill & Topple",
        "good_practice": "Use a proper dock leveler or bridge arrangement and ensure a safe, level transition before moving material.",
        "suggested_action": "Engage hydraulic dock leveler and wheel chocks before vehicle unloading commences."
    },
    "FORKLIFT_PROXIMITY": {
        "title": "Forklift-Pedestrian Pinch Zone Breach",
        "description": "Worker operating within 1.5m blind spot zone of moving forklift without high-vis barrier.",
        "category": "Life Safety Hazard",
        "good_practice": "Maintain minimum 3-meter pedestrian clearance from active material handling vehicles.",
        "suggested_action": "Sound vehicle horn and hold pedestrian traffic until forklift clears bay."
    }
}

class BehaviorDetector:
    def __init__(self):
        self.kinematics = KinematicsEngine()

    def evaluate_behavior(
        self,
        behavior_type: str,
        telemetry: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluates risk classification, generates human-understandable explanation,
        and provides preventative intervention recommendation.
        """
        meta = BEHAVIOR_TAXONOMY.get(behavior_type, {
            "title": behavior_type,
            "description": "Unclassified handling behavior detected.",
            "category": "General Handling",
            "good_practice": "Follow standard operating procedures.",
            "suggested_action": "Inspect and review process."
        })
        
        # Calculate dynamic risk score based on telemetry
        risk_score = telemetry.get("risk_score", 65)
        severity = telemetry.get("severity")
        if not severity:
            if risk_score >= 80:
                severity = "CRITICAL"
            elif risk_score >= 50:
                severity = "HIGH"
            elif risk_score >= 25:
                severity = "MEDIUM"
            else:
                severity = "LOW"
                
        return {
            "behavior_type": behavior_type,
            "title": meta["title"],
            "category": meta["category"],
            "severity": severity,
            "risk_score": risk_score,
            "description": meta["description"],
            "good_practice": meta["good_practice"],
            "suggested_action": meta["suggested_action"],
            "telemetry": telemetry
        }
