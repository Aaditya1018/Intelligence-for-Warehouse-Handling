export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type BehaviorType =
  | 'DROP_IMPACT'
  | 'CARTON_DRAGGING'
  | 'ROUGH_HANDLING_THROW'
  | 'INVERTED_PYRAMID_STACKING'
  | 'UNSTABLE_TILT_OVERHANG'
  | 'OUTSIDE_DESIGNATED_AREA'
  | 'SOLO_HEAVY_LIFT'
  | 'STEPPING_ON_CARTONS'
  | 'ROLLING_CARTONS'
  | 'STRAP_LIFTING'
  | 'DOCK_GAP_HAZARD'
  | 'FORKLIFT_PROXIMITY';

export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  category: 'product' | 'person' | 'forklift' | 'pallet' | 'zone' | 'hazard';
  confidence: number;
  color: string;
  speed?: number; // m/s
  accel?: number; // m/s^2
}

export interface PoseJoint {
  name: string;
  x: number;
  y: number;
  confidence: number;
}

export interface PoseSkeleton {
  workerId: string;
  joints: PoseJoint[];
  spineAngleDeg: number;
  kneeAngleDeg: number;
  isLiftingProperly: boolean;
}

export interface KinematicTelemetry {
  timestampSec: number;
  velocityX: number; // m/s
  velocityY: number; // m/s
  velocityTotal: number; // m/s
  accelerationY: number; // m/s^2
  dropHeightMeters: number;
  impactEnergyJoules: number;
  impactForceNewtons: number;
  stackTiltDegrees: number;
  overhangRatio: number; // 0.0 - 1.0
  pinchDistanceMeters: number;
  riskScore: number; // 0 - 100
}

export interface ScenarioFrame {
  frameIndex: number;
  timestampSec: number;
  description: string;
  bboxes: BoundingBox[];
  skeletons: PoseSkeleton[];
  telemetry: KinematicTelemetry;
  activeAlert?: {
    type: BehaviorType;
    severity: RiskLevel;
    message: string;
    hindiMessage: string;
    preventativeTip: string;
  };
  impactWave?: {
    x: number;
    y: number;
    radius: number;
    intensity: number;
  };
}

export interface BenchmarkScenario {
  id: string;
  title: string;
  behaviorType: BehaviorType;
  severity: RiskLevel;
  bayId: string;
  vehicleType: string;
  productCategory: string;
  productMassKg: number;
  fragilityRating: 'FRAGILE' | 'STANDARD' | 'HEAVY_DURABLE';
  durationSec: number;
  fps: number;
  summary: string;
  observedBehavior: string;
  potentialRisk: string;
  confirmedDamageState: 'PREVENTED_BY_AI' | 'NEAR_MISS_FLAGGED' | 'INSPECTION_REQUIRED';
  rootCause: string;
  recommendedAction: string;
  expectedPractice: string;
  financialRiskInr: number;
  frames: ScenarioFrame[];
}

export interface ShiftStats {
  shiftName: string;
  supervisorName: string;
  startTime: string;
  totalUnitsHandled: number;
  totalEventsLogged: number;
  criticalEvents: number;
  highRiskEvents: number;
  mediumRiskEvents: number;
  lowRiskEvents: number;
  damagesPreventedCount: number;
  estimatedCostSavedInr: number;
  safetyScorePct: number;
  bayBreakdown: {
    bayId: string;
    activeVehicle: string;
    eventsCount: number;
    safetyScore: number;
    status: 'ACTIVE' | 'FLAGGED' | 'MAINTENANCE';
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: string;
  text: string;
  suggestions?: string[];
  referencedScenarioId?: string;
}

export interface SafetyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'GOLD' | 'SILVER' | 'BRONZE';
  unlockedAt: string;
}
