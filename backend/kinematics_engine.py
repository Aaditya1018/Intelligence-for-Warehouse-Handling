"""
Physics-Informed Temporal Kinematics (PI-TK) Engine for Warehouse Handling.
Calculates velocities, accelerations, impact impulses, center-of-mass,
and stacking stability indices from object and pose tracking streams.
"""

import math
from typing import List, Dict, Any, Tuple, Optional

class KinematicsEngine:
    def __init__(self, pixels_per_meter: float = 120.0, fps: float = 30.0):
        self.ppm = pixels_per_meter
        self.fps = fps
        self.dt = 1.0 / fps
        self.gravity = 9.81  # m/s^2

    def calculate_velocity_and_accel(
        self, 
        trajectory: List[Tuple[float, float, float]] # (x_px, y_px, timestamp)
    ) -> Dict[str, float]:
        """
        Calculates instantaneous velocity (vx, vy, v_total in m/s) and acceleration (ay in m/s^2).
        y is assumed downwards in pixel space.
        """
        if len(trajectory) < 2:
            return {"vx": 0.0, "vy": 0.0, "v_total": 0.0, "ay": 0.0, "drop_height_m": 0.0}
        
        # Latest point and previous point
        p_curr = trajectory[-1]
        p_prev = trajectory[-2]
        
        dt = max(p_curr[2] - p_prev[2], 0.001)
        
        # Displacements in meters
        dx = (p_curr[0] - p_prev[0]) / self.ppm
        dy = (p_curr[1] - p_prev[1]) / self.ppm
        
        vx = dx / dt
        vy = dy / dt
        v_total = math.sqrt(vx**2 + vy**2)
        
        ay = 0.0
        if len(trajectory) >= 3:
            p_prev2 = trajectory[-3]
            dt_prev = max(p_prev[2] - p_prev2[2], 0.001)
            vy_prev = ((p_prev[1] - p_prev2[1]) / self.ppm) / dt_prev
            ay = (vy - vy_prev) / dt
        
        # Estimate total vertical displacement over last sequence
        min_y = min(p[1] for p in trajectory)
        max_y = max(p[1] for p in trajectory)
        drop_height_m = max(0.0, (max_y - min_y) / self.ppm)
        
        return {
            "vx": round(vx, 3),
            "vy": round(vy, 3),
            "v_total": round(v_total, 3),
            "ay": round(ay, 3),
            "drop_height_m": round(drop_height_m, 2)
        }

    def assess_drop_impact(
        self, 
        package_mass_kg: float, 
        impact_velocity_m_s: float,
        impact_duration_s: float = 0.04
    ) -> Dict[str, Any]:
        """
        Calculates kinetic impact energy (Joules) and peak impact force (Newtons).
        """
        kinetic_energy = 0.5 * package_mass_kg * (impact_velocity_m_s ** 2)
        # Impulse J = m * delta_v = F_avg * dt
        impact_force_n = (package_mass_kg * impact_velocity_m_s) / max(impact_duration_s, 0.005)
        
        # Risk classification based on impact energy
        if kinetic_energy > 120.0 or impact_velocity_m_s > 3.5:
            severity = "CRITICAL"
        elif kinetic_energy > 50.0 or impact_velocity_m_s > 2.0:
            severity = "HIGH"
        elif kinetic_energy > 15.0 or impact_velocity_m_s > 1.0:
            severity = "MEDIUM"
        else:
            severity = "LOW"
            
        return {
            "kinetic_energy_joules": round(kinetic_energy, 2),
            "impact_force_newtons": round(impact_force_n, 1),
            "severity": severity,
            "risk_score": min(100, int(kinetic_energy * 0.8 + impact_velocity_m_s * 15))
        }

    def assess_stack_stability(
        self, 
        base_box_bbox: List[float],  # [x, y, w, h]
        top_box_bbox: List[float],   # [x, y, w, h]
        base_weight_kg: float = 10.0,
        top_weight_kg: float = 25.0
    ) -> Dict[str, Any]:
        """
        Evaluates inverted pyramid risk, center-of-mass overhang, and tilt.
        """
        bx, by, bw, bh = base_box_bbox
        tx, ty, tw, th = top_box_bbox
        
        base_center_x = bx + bw / 2.0
        top_center_x = tx + tw / 2.0
        
        # Overhang offset in meters
        offset_m = abs(top_center_x - base_center_x) / self.ppm
        overhang_ratio = abs(top_center_x - base_center_x) / max(bw / 2.0, 1.0)
        
        # Inverted weight risk: heavy item on light item
        weight_inversion_ratio = top_weight_kg / max(base_weight_kg, 1.0)
        
        is_inverted_pyramid = weight_inversion_ratio > 1.4 and tw >= bw * 0.9
        is_unstable_overhang = overhang_ratio > 0.35
        
        score = 0
        reasons = []
        if is_inverted_pyramid:
            score += 55
            reasons.append(f"Heavy carton ({top_weight_kg}kg) placed on lighter carton ({base_weight_kg}kg)")
        if is_unstable_overhang:
            score += 40
            reasons.append(f"Excessive center-of-mass overhang ({round(overhang_ratio*100, 1)}%)")
            
        severity = "CRITICAL" if score >= 75 else "HIGH" if score >= 50 else "MEDIUM" if score >= 25 else "LOW"
        
        return {
            "is_inverted_pyramid": is_inverted_pyramid,
            "is_unstable_overhang": is_unstable_overhang,
            "overhang_ratio": round(overhang_ratio, 2),
            "overhang_offset_m": round(offset_m, 3),
            "weight_ratio": round(weight_inversion_ratio, 2),
            "risk_score": score,
            "severity": severity,
            "reasons": reasons
        }

    def assess_proximity_hazard(
        self,
        worker_pos: Tuple[float, float],
        forklift_pos: Tuple[float, float],
        forklift_speed_m_s: float = 1.2
    ) -> Dict[str, Any]:
        """
        Calculates distance between worker and dynamic equipment (forklifts / pallet trucks).
        """
        dist_px = math.sqrt((worker_pos[0] - forklift_pos[0])**2 + (worker_pos[1] - forklift_pos[1])**2)
        dist_m = dist_px / self.ppm
        
        # Dynamic warning radius expands with forklift speed
        safety_radius_m = 2.5 + (forklift_speed_m_s * 0.8)
        
        in_pinch_zone = dist_m < safety_radius_m
        
        if dist_m < 1.2:
            severity = "CRITICAL"
            score = 95
        elif dist_m < 2.0:
            severity = "HIGH"
            score = 75
        elif in_pinch_zone:
            severity = "MEDIUM"
            score = 45
        else:
            severity = "LOW"
            score = 10
            
        return {
            "distance_meters": round(dist_m, 2),
            "safety_radius_meters": round(safety_radius_m, 2),
            "in_pinch_zone": in_pinch_zone,
            "severity": severity,
            "risk_score": score
        }
