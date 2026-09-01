import { BenchmarkScenario } from '../types';

export const BENCHMARK_SCENARIOS: BenchmarkScenario[] = [
  {
    id: 'SCN-01',
    title: 'Product Dropped from Height (>1.1m Free Fall)',
    behaviorType: 'DROP_IMPACT',
    severity: 'CRITICAL',
    bayId: 'Bay 3',
    vehicleType: '32ft Container Truck',
    productCategory: 'Glass-Front Refrigerator / Electronics',
    productMassKg: 28.5,
    fragilityRating: 'FRAGILE',
    durationSec: 5,
    fps: 10,
    summary: 'Operator loses grip during unassisted tailboard lift. Carton accelerates at 9.6 m/s² and impacts floor with 89 Joules of kinetic force.',
    observedBehavior: 'Carton slipped from hands at 1.15m height, free-falling onto concrete floor before coming to rest.',
    potentialRisk: 'Compressor shock damage, internal glass shattering, and outer sheet metal buckling.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Lack of ergonomic tailboard lift assistance; slippery packaging without rubberized grip gloves.',
    recommendedAction: 'Immediate quality inspection before line entry. Deploy hydraulic scissor table at Bay 3.',
    expectedPractice: 'Lift and place products gently with two-point cradle support. Never allow free-fall release.',
    financialRiskInr: 18500,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      // Sequence: 0-1.5s holding at 1.1m, 1.6-2.0s falling fast, 2.1s impact, 2.2-5.0s stationary on floor
      let boxY = 160;
      let vy = 0.2;
      let ay = 0.0;
      let hasDropped = false;
      let impactEnergy = 0;
      let activeAlert = undefined;
      let impactWave = undefined;

      if (t < 1.5) {
        boxY = 160 + Math.sin(t * 4) * 3;
        vy = 0.3;
        ay = 0.2;
      } else if (t >= 1.5 && t <= 2.0) {
        const fallT = t - 1.5;
        boxY = 160 + 0.5 * 900 * (fallT * fallT); // Accelerated fall
        vy = 9.8 * fallT * 2.2;
        ay = 9.6;
        hasDropped = true;
        activeAlert = {
          type: 'DROP_IMPACT' as const,
          severity: 'CRITICAL' as const,
          message: 'CRITICAL DROP IN PROGRESS: Vertical velocity > 2.8 m/s!',
          hindiMessage: 'सावधान! पैकेज गिर रहा है - तत्काल संभालें!',
          preventativeTip: 'Do not drop cartons. Use two points of contact.'
        };
      } else {
        boxY = 370; // On floor
        vy = 0.0;
        ay = 0.0;
        impactEnergy = 89.2;
        if (t >= 2.0 && t <= 2.6) {
          impactWave = {
            x: 350,
            y: 420,
            radius: (t - 2.0) * 80,
            intensity: Math.max(0, 1 - (t - 2.0) * 1.5)
          };
        }
        activeAlert = {
          type: 'DROP_IMPACT' as const,
          severity: 'CRITICAL' as const,
          message: 'HIGH IMPACT DETECTED: 89.2 Joules on Bay 3 floor! Dispatch QC.',
          hindiMessage: 'चेतावनी: भारी टक्कर दर्ज! गुणवत्ता जांच के लिए भेजें।',
          preventativeTip: 'Inspect carton seals and internal components before palletizing.'
        };
      }

      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: t < 1.5 ? 'Operator holding 28kg carton at truck tailboard' : t <= 2.0 ? 'Loss of grip -> Free-fall acceleration detected' : 'Ground impact confirmed -> Product stationary on floor',
        bboxes: [
          {
            id: 'box-01',
            x: 300,
            y: boxY,
            width: 100,
            height: 100,
            label: `Carton #4029 (${hasDropped ? 'FREE-FALL' : 'HELD'})`,
            category: 'product',
            confidence: 0.96,
            color: hasDropped ? '#EF4444' : '#3B82F6',
            speed: Number(vy.toFixed(2)),
            accel: Number(ay.toFixed(2))
          },
          {
            id: 'worker-01',
            x: 230,
            y: 120,
            width: 90,
            height: 290,
            label: 'Operator (Anonymized)',
            category: 'person',
            confidence: 0.94,
            color: '#10B981'
          },
          {
            id: 'truck-01',
            x: 40,
            y: 90,
            width: 230,
            height: 330,
            label: 'Container Truck 32ft',
            category: 'zone',
            confidence: 0.99,
            color: '#64748B'
          }
        ],
        skeletons: [
          {
            workerId: 'w-101',
            joints: [
              { name: 'head', x: 275, y: 150, confidence: 0.9 },
              { name: 'neck', x: 275, y: 180, confidence: 0.95 },
              { name: 'l_shoulder', x: 250, y: 190, confidence: 0.92 },
              { name: 'r_shoulder', x: 300, y: 190, confidence: 0.92 },
              { name: 'l_elbow', x: 240, y: 240, confidence: 0.88 },
              { name: 'r_elbow', x: 310, y: 240, confidence: 0.88 },
              { name: 'l_wrist', x: 280, y: boxY + 20, confidence: 0.85 },
              { name: 'r_wrist', x: 330, y: boxY + 20, confidence: 0.85 },
              { name: 'hip', x: 275, y: 280, confidence: 0.95 },
              { name: 'l_knee', x: 260, y: 340, confidence: 0.9 },
              { name: 'r_knee', x: 290, y: 340, confidence: 0.9 },
              { name: 'l_ankle', x: 255, y: 400, confidence: 0.95 },
              { name: 'r_ankle', x: 295, y: 400, confidence: 0.95 }
            ],
            spineAngleDeg: 28,
            kneeAngleDeg: 145,
            isLiftingProperly: false
          }
        ],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: 0.1,
          velocityY: Number(vy.toFixed(2)),
          velocityTotal: Number(vy.toFixed(2)),
          accelerationY: Number(ay.toFixed(2)),
          dropHeightMeters: t > 1.5 ? 1.15 : 0.0,
          impactEnergyJoules: impactEnergy,
          impactForceNewtons: impactEnergy > 0 ? 580.4 : 0,
          stackTiltDegrees: 0,
          overhangRatio: 0,
          pinchDistanceMeters: 3.2,
          riskScore: t < 1.5 ? 20 : t <= 2.0 ? 85 : 95
        },
        activeAlert,
        impactWave
      };
    })
  },
  {
    id: 'SCN-02',
    title: 'Dragging Knockdown Cartons on Concrete Floor',
    behaviorType: 'CARTON_DRAGGING',
    severity: 'HIGH',
    bayId: 'Bay 1',
    vehicleType: 'Eicher 19ft LCV',
    productCategory: 'Furniture / Flat-Pack Wood KD Packets',
    productMassKg: 32.0,
    fragilityRating: 'STANDARD',
    durationSec: 5,
    fps: 10,
    summary: 'Heavy flat-pack carton dragged 4.2 meters horizontally across rough warehouse concrete, grinding corrugation base.',
    observedBehavior: 'Operator dragged KD carton by one end along the floor instead of placing it on a hand pallet truck.',
    potentialRisk: 'Base cardboard abrasion, corner chipping, exposed hardware loss, and dust ingress.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Pallet truck was stationed 15 meters away; operator opted for manual dragging to save turnaround seconds.',
    recommendedAction: 'Equip Bay 1 unloading gang with 2 dedicated light pallet dollies.',
    expectedPractice: 'Use a trolley, pallet truck or suitable handling equipment instead of dragging products on the floor.',
    financialRiskInr: 9200,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      const dragX = 180 + t * 45;
      const isDragging = t > 0.8 && t < 4.2;

      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: isDragging ? 'Continuous horizontal drag detected: Floor friction abrasion active' : 'Carton positioned on floor',
        bboxes: [
          {
            id: 'box-drag',
            x: dragX,
            y: 350,
            width: 140,
            height: 60,
            label: `KD Carton (DRAGGING ${isDragging ? 'WARNING' : 'IDLE'})`,
            category: 'product',
            confidence: 0.95,
            color: isDragging ? '#F59E0B' : '#3B82F6',
            speed: isDragging ? 0.85 : 0.1
          },
          {
            id: 'worker-02',
            x: dragX + 110,
            y: 210,
            width: 70,
            height: 200,
            label: 'Operator (Dragging)',
            category: 'person',
            confidence: 0.91,
            color: '#10B981'
          }
        ],
        skeletons: [],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: isDragging ? 0.85 : 0.05,
          velocityY: 0.0,
          velocityTotal: isDragging ? 0.85 : 0.05,
          accelerationY: 0.0,
          dropHeightMeters: 0,
          impactEnergyJoules: 0,
          impactForceNewtons: 0,
          stackTiltDegrees: 18,
          overhangRatio: 0,
          pinchDistanceMeters: 4.1,
          riskScore: isDragging ? 72 : 15
        },
        activeAlert: isDragging ? {
          type: 'CARTON_DRAGGING',
          severity: 'HIGH',
          message: 'FLOOR DRAGGING DETECTED: 4.2m continuous floor friction at Bay 1!',
          hindiMessage: 'ध्यान दें: बक्से को फर्श पर न घसीटें - ट्रॉली का उपयोग करें।',
          preventativeTip: 'Use a pallet truck or 4-wheel dolly to transfer heavy flat-packs.'
        } : undefined
      };
    })
  },
  {
    id: 'SCN-03',
    title: 'Rough Handling: Throwing / Tossing Cartons onto Staging Stack',
    behaviorType: 'ROUGH_HANDLING_THROW',
    severity: 'HIGH',
    bayId: 'Bay 2',
    vehicleType: 'Tata Ace Delivery Van',
    productCategory: 'Small Appliances & Kitchen Cookware',
    productMassKg: 8.2,
    fragilityRating: 'FRAGILE',
    durationSec: 5,
    fps: 10,
    summary: 'Worker tosses 8kg carton 1.8 meters across air onto a pallet stack, generating projectile deceleration spike.',
    observedBehavior: 'Carton released mid-air with horizontal velocity vx=2.4 m/s toward the pallet staging area.',
    potentialRisk: 'Internal element misalignment, ceramic finish chipping, and deformation of adjacent carton corners.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Operator fatigue and excessive distance between vehicle tailgate and pallet stack.',
    recommendedAction: 'Move staging pallet 1.5m closer to tailboard. Install anti-toss coaching zone audio alert.',
    expectedPractice: 'Lift and place products gently by hand. Never throw or drop a package.',
    financialRiskInr: 6400,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      let bx = 160;
      let by = 240;
      let isAirborne = false;

      if (t >= 1.0 && t <= 2.2) {
        isAirborne = true;
        const flightT = t - 1.0;
        bx = 160 + flightT * 180;
        by = 240 - Math.sin(flightT * Math.PI / 1.2) * 90; // Parabolic trajectory
      } else if (t > 2.2) {
        bx = 376;
        by = 290;
      }

      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: isAirborne ? 'PROJECTILE TRAJECTORY: Airborne carton in free flight' : t > 2.2 ? 'Impact on staging stack' : 'Preparing toss',
        bboxes: [
          {
            id: 'tossed-box',
            x: bx,
            y: by,
            width: 70,
            height: 60,
            label: isAirborne ? 'Carton [AIRBORNE TOSS]' : 'Carton #108',
            category: 'product',
            confidence: 0.94,
            color: isAirborne ? '#EF4444' : '#3B82F6',
            speed: isAirborne ? 2.4 : 0.2
          },
          {
            id: 'staging-pallet',
            x: 350,
            y: 280,
            width: 140,
            height: 120,
            label: 'Staging Pallet #02',
            category: 'pallet',
            confidence: 0.98,
            color: '#10B981'
          }
        ],
        skeletons: [],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: isAirborne ? 2.4 : 0.1,
          velocityY: isAirborne ? 1.8 : 0.0,
          velocityTotal: isAirborne ? 3.0 : 0.1,
          accelerationY: isAirborne ? 9.8 : 0.0,
          dropHeightMeters: isAirborne ? 0.9 : 0.0,
          impactEnergyJoules: t > 2.1 && t < 2.5 ? 42.0 : 0,
          impactForceNewtons: t > 2.1 && t < 2.5 ? 320 : 0,
          stackTiltDegrees: 0,
          overhangRatio: 0,
          pinchDistanceMeters: 3.5,
          riskScore: isAirborne ? 88 : 18
        },
        activeAlert: isAirborne ? {
          type: 'ROUGH_HANDLING_THROW',
          severity: 'HIGH',
          message: 'AIRBORNE THROW DETECTED: Projectile toss trajectory velocity 3.0 m/s!',
          hindiMessage: 'सावधान: बक्से को हवा में न फेंकें - हाथ से सही स्थान पर रखें।',
          preventativeTip: 'Always place products by hand onto the staging pallet.'
        } : undefined
      };
    })
  },
  {
    id: 'SCN-04',
    title: 'Improper Inverted Stacking (40kg Unit on Light Carton)',
    behaviorType: 'INVERTED_PYRAMID_STACKING',
    severity: 'CRITICAL',
    bayId: 'Bay 4',
    vehicleType: '40ft Semi-Trailer',
    productCategory: 'Mixed Appliance & Cookware Cargo',
    productMassKg: 42.0,
    fragilityRating: 'FRAGILE',
    durationSec: 5,
    fps: 10,
    summary: 'A heavy 42kg washing machine crate is stacked on top of two lightweight 6kg glassware cartons.',
    observedBehavior: 'Heavy crate placed above fragile lightweight boxes, causing dynamic top-heavy compression and bottom crushing.',
    potentialRisk: 'Complete collapse of base cartons, crushed product contents, and multi-unit tipping hazard.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Operators unloaded indiscriminately in order of truck arrival rather than sorting by weight.',
    recommendedAction: 'Restack pallet immediately. Segregate heavy white-goods to bottom tier.',
    expectedPractice: 'Stack larger and heavier packets at the bottom and smaller/lighter packets on top.',
    financialRiskInr: 34000,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      const isStacked = t > 1.2;

      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: isStacked ? 'INVERTED PYRAMID DETECTED: 42kg load placed on 6kg light base' : 'Approaching stack',
        bboxes: [
          {
            id: 'top-heavy-box',
            x: 240,
            y: isStacked ? 180 : 130 - (1.2 - t) * 50,
            width: 140,
            height: 110,
            label: 'Heavy Unit 42kg [CRUSH HAZARD]',
            category: 'product',
            confidence: 0.97,
            color: '#EF4444'
          },
          {
            id: 'base-light-box-1',
            x: 230,
            y: 290,
            width: 75,
            height: 90,
            label: 'Light Fragile 6kg [OVERLOADED]',
            category: 'product',
            confidence: 0.95,
            color: '#F59E0B'
          },
          {
            id: 'base-light-box-2',
            x: 310,
            y: 290,
            width: 75,
            height: 90,
            label: 'Light Fragile 6kg [OVERLOADED]',
            category: 'product',
            confidence: 0.95,
            color: '#F59E0B'
          }
        ],
        skeletons: [],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: 0.1,
          velocityY: 0.1,
          velocityTotal: 0.1,
          accelerationY: 0.0,
          dropHeightMeters: 0,
          impactEnergyJoules: 0,
          impactForceNewtons: isStacked ? 412.0 : 0,
          stackTiltDegrees: isStacked ? 11 : 2,
          overhangRatio: 0.38,
          pinchDistanceMeters: 3.8,
          riskScore: isStacked ? 92 : 25
        },
        activeAlert: isStacked ? {
          type: 'INVERTED_PYRAMID_STACKING',
          severity: 'CRITICAL',
          message: 'CRITICAL STACK INVERSION: 42kg heavy load crushing 6kg fragile base!',
          hindiMessage: 'चेतावनी: भारी सामान को हल्के डिब्बों के ऊपर न रखें - तुरंत बदलें!',
          preventativeTip: 'Stack heavier goods at the bottom and lighter goods on top.'
        } : undefined
      };
    })
  },
  {
    id: 'SCN-05',
    title: 'Unstable Pallet Tilt & Overhang >38% (Topple Hazard)',
    behaviorType: 'UNSTABLE_TILT_OVERHANG',
    severity: 'HIGH',
    bayId: 'Bay 2',
    vehicleType: '14ft Light Truck',
    productCategory: 'Storage Water Heaters & Geysers',
    productMassKg: 19.5,
    fragilityRating: 'STANDARD',
    durationSec: 5,
    fps: 10,
    summary: 'Stacked cartons extend 38% past pallet boundary edge, creating a severe center-of-gravity imbalance and 14° tilt.',
    observedBehavior: 'Pallet loaded with substantial unsupported cantilever overhang and noticeable rightward lean.',
    potentialRisk: 'Pallet stack toppling during forklift transit; carton corner rupture.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Undersized pallet used for oversized geyser packaging without strap bracing.',
    recommendedAction: 'Transfer to 1200x1000mm standard industrial pallet and apply stretch wrap.',
    expectedPractice: 'Use the correct-size pallet so the entire product is properly supported without unsafe overhang.',
    financialRiskInr: 12500,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: 'Overhang calculation: Center of mass offset = 26cm past edge (Tilt = 14.2°)',
        bboxes: [
          {
            id: 'unstable-stack',
            x: 270,
            y: 190,
            width: 140,
            height: 140,
            label: 'Carton Stack [38% OVERHANG]',
            category: 'product',
            confidence: 0.95,
            color: '#EF4444'
          },
          {
            id: 'pallet-base',
            x: 220,
            y: 330,
            width: 130,
            height: 35,
            label: 'Pallet Base [UNDERSIZED]',
            category: 'pallet',
            confidence: 0.98,
            color: '#64748B'
          }
        ],
        skeletons: [],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: 0.05,
          velocityY: 0.0,
          velocityTotal: 0.05,
          accelerationY: 0.0,
          dropHeightMeters: 0,
          impactEnergyJoules: 0,
          impactForceNewtons: 0,
          stackTiltDegrees: 14.2,
          overhangRatio: 0.38,
          pinchDistanceMeters: 4.0,
          riskScore: 78
        },
        activeAlert: {
          type: 'UNSTABLE_TILT_OVERHANG',
          severity: 'HIGH',
          message: 'CRITICAL OVERHANG: 38% cantilever past pallet edge (Tilt: 14.2°)!',
          hindiMessage: 'चेतावनी: पैलेट से 38% बाहर झुका हुआ माल - गिरने का खतरा!',
          preventativeTip: 'Center cartons on pallet base and apply stretch wrap.'
        }
      };
    })
  },
  {
    id: 'SCN-06',
    title: 'Product Staged in Active Forklift Transit Danger Corridor',
    behaviorType: 'OUTSIDE_DESIGNATED_AREA',
    severity: 'HIGH',
    bayId: 'Bay 1',
    vehicleType: 'Electric Reach Truck / Bay Dock',
    productCategory: 'Consumer Electronics Cartons',
    productMassKg: 14.0,
    fragilityRating: 'FRAGILE',
    durationSec: 5,
    fps: 10,
    summary: 'Pallet staged 1.8 meters outside yellow grid lines directly across high-speed forklift turning lane.',
    observedBehavior: 'Material staged outside marked staging cell, obstructing vehicle corridor and pedestrian exit.',
    potentialRisk: 'Direct high-momentum forklift collision, crushing entire pallet load.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Staging cell #1 was congested; operator temporarily dropped load in transit aisle.',
    recommendedAction: 'Clear aisle immediately. Re-route buffer pallets to Overflow Grid B.',
    expectedPractice: 'Stage products systematically within marked yellow safety perimeters.',
    financialRiskInr: 22000,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      const forkX = 500 - t * 40; // Forklift moving toward pallet
      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: 'Corridor Breach: Pallet obstructing forklift transit trajectory',
        bboxes: [
          {
            id: 'obstruction-pallet',
            x: 260,
            y: 260,
            width: 110,
            height: 100,
            label: 'Pallet [ZONE VIOLATION]',
            category: 'product',
            confidence: 0.96,
            color: '#EF4444'
          },
          {
            id: 'approaching-forklift',
            x: forkX,
            y: 220,
            width: 140,
            height: 130,
            label: 'Forklift #3 (Moving 1.4 m/s)',
            category: 'forklift',
            confidence: 0.98,
            color: '#F59E0B',
            speed: 1.4
          }
        ],
        skeletons: [],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: 1.4,
          velocityY: 0.0,
          velocityTotal: 1.4,
          accelerationY: 0.0,
          dropHeightMeters: 0,
          impactEnergyJoules: 0,
          impactForceNewtons: 0,
          stackTiltDegrees: 0,
          overhangRatio: 0,
          pinchDistanceMeters: Math.max(0.8, (forkX - 370) / 100 * 3),
          riskScore: 84
        },
        activeAlert: {
          type: 'OUTSIDE_DESIGNATED_AREA',
          severity: 'HIGH',
          message: 'TRAFFIC OBSTRUCTION: Pallet staged in forklift drive lane at Bay 1!',
          hindiMessage: 'चेतावनी: फोर्कलिफ्ट रास्ते में रुकावट - माल को तुरंत पीली लाइन में रखें।',
          preventativeTip: 'Keep forklift corridors clear of all staged inventory.'
        }
      };
    })
  },
  {
    id: 'SCN-07',
    title: 'Solo Manual Lifting of Heavy 34kg Unit (No Hoist)',
    behaviorType: 'SOLO_HEAVY_LIFT',
    severity: 'MEDIUM',
    bayId: 'Bay 3',
    vehicleType: 'Container Truck',
    productCategory: 'Commercial Inverter & Battery Pack',
    productMassKg: 34.0,
    fragilityRating: 'HEAVY_DURABLE',
    durationSec: 5,
    fps: 10,
    summary: 'Single worker attempting unassisted lift of 34kg heavy machinery crate, exceeding 20kg ergonomic limit.',
    observedBehavior: 'Solo operator bending with rounded spine (angle 42°) to lift 34kg unit from floor without mechanical assist.',
    potentialRisk: 'Sudden drop from strain, back injury to worker, and violent corner impact.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Second loader was absent on break; operator attempted to single-handedly maintain unloading quota.',
    recommendedAction: 'Trigger team-lift audio prompt. Dispatch secondary loader to Bay 3.',
    expectedPractice: 'Use team lifting or mechanical handling equipment for all items exceeding 20kg.',
    financialRiskInr: 7500,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: 'Ergonomic Overload: Solo lift of 34kg unit (Spine flexion angle 42°)',
        bboxes: [
          {
            id: 'heavy-box',
            x: 280,
            y: 290,
            width: 100,
            height: 90,
            label: 'Carton 34kg [OVERWEIGHT FOR SOLO]',
            category: 'product',
            confidence: 0.95,
            color: '#F59E0B'
          },
          {
            id: 'worker-solo',
            x: 240,
            y: 190,
            width: 80,
            height: 190,
            label: 'Operator [SOLO LIFT RISK]',
            category: 'person',
            confidence: 0.94,
            color: '#EF4444'
          }
        ],
        skeletons: [
          {
            workerId: 'w-202',
            joints: [
              { name: 'head', x: 260, y: 200, confidence: 0.9 },
              { name: 'neck', x: 265, y: 220, confidence: 0.95 },
              { name: 'l_shoulder', x: 250, y: 230, confidence: 0.9 },
              { name: 'r_shoulder', x: 280, y: 230, confidence: 0.9 },
              { name: 'l_wrist', x: 280, y: 310, confidence: 0.85 },
              { name: 'r_wrist', x: 330, y: 310, confidence: 0.85 },
              { name: 'hip', x: 250, y: 290, confidence: 0.95 },
              { name: 'l_knee', x: 245, y: 340, confidence: 0.9 },
              { name: 'r_knee', x: 265, y: 340, confidence: 0.9 },
              { name: 'l_ankle', x: 240, y: 380, confidence: 0.95 },
              { name: 'r_ankle', x: 260, y: 380, confidence: 0.95 }
            ],
            spineAngleDeg: 42,
            kneeAngleDeg: 120,
            isLiftingProperly: false
          }
        ],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: 0.1,
          velocityY: 0.2,
          velocityTotal: 0.2,
          accelerationY: 0.1,
          dropHeightMeters: 0.3,
          impactEnergyJoules: 0,
          impactForceNewtons: 333.5,
          stackTiltDegrees: 0,
          overhangRatio: 0,
          pinchDistanceMeters: 3.5,
          riskScore: 68
        },
        activeAlert: {
          type: 'SOLO_HEAVY_LIFT',
          severity: 'MEDIUM',
          message: 'TEAM LIFT REQUIRED: 34kg exceeds solo lifting limit of 20kg!',
          hindiMessage: 'सावधान: भारी सामान अकेले न उठाएं - साथी की मदद लें।',
          preventativeTip: 'Always request a team buddy lift for packages over 20kg.'
        }
      };
    })
  },
  {
    id: 'SCN-08',
    title: 'Operator Standing / Stepping on Cartons as Makeshift Ladder',
    behaviorType: 'STEPPING_ON_CARTONS',
    severity: 'CRITICAL',
    bayId: 'Bay 3',
    vehicleType: 'Container Truck',
    productCategory: 'Split Air Conditioner Indoor Units',
    productMassKg: 15.0,
    fragilityRating: 'FRAGILE',
    durationSec: 5,
    fps: 10,
    summary: 'Loader stands with full body weight (72kg) directly atop stacked AC cartons to reach upper tier boxes.',
    observedBehavior: 'Worker feet positioned on corrugated product boxes; localized top fluting collapse under foot pressure.',
    potentialRisk: 'Severe crush damage to evaporator coils and high slip/fall injury hazard for worker.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Rolling safety ladder was not moved into the container before unloading top tiers.',
    recommendedAction: 'Issue immediate buzzer alert. Station aluminum rolling safety step inside container.',
    expectedPractice: 'Never step, stand or walk on packages. Always use approved rolling steps.',
    financialRiskInr: 26000,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: 'CRITICAL SAFETY VIOLATION: Worker standing on fragile AC carton stack',
        bboxes: [
          {
            id: 'stepped-carton',
            x: 260,
            y: 280,
            width: 140,
            height: 90,
            label: 'Fragile AC Carton [STEPPED ON]',
            category: 'product',
            confidence: 0.98,
            color: '#EF4444'
          },
          {
            id: 'worker-standing',
            x: 280,
            y: 110,
            width: 80,
            height: 190,
            label: 'Worker [STANDING ON PRODUCT]',
            category: 'person',
            confidence: 0.96,
            color: '#EF4444'
          }
        ],
        skeletons: [],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: 0.05,
          velocityY: 0.0,
          velocityTotal: 0.05,
          accelerationY: 0.0,
          dropHeightMeters: 0,
          impactEnergyJoules: 0,
          impactForceNewtons: 706.0,
          stackTiltDegrees: 8,
          overhangRatio: 0,
          pinchDistanceMeters: 3.5,
          riskScore: 98
        },
        activeAlert: {
          type: 'STEPPING_ON_CARTONS',
          severity: 'CRITICAL',
          message: 'CRITICAL VIOLATION: Operator standing on fragile product cartons!',
          hindiMessage: 'चेतावनी: माल के ऊपर पैर न रखें! तुरंत नीचे उतरें और सीढ़ी लाएं।',
          preventativeTip: 'Never stand or step on packaging. Use approved step platforms.'
        }
      };
    })
  },
  {
    id: 'SCN-09',
    title: 'Rolling / Tumbling Delicate Cartons Corner-over-Corner',
    behaviorType: 'ROLLING_CARTONS',
    severity: 'MEDIUM',
    bayId: 'Bay 1',
    vehicleType: '19ft LCV',
    productCategory: 'Water Purifier & RO Filtration Units',
    productMassKg: 12.0,
    fragilityRating: 'FRAGILE',
    durationSec: 5,
    fps: 10,
    summary: 'Worker tumbles fragile RO unit carton end-over-end across warehouse floor instead of carrying.',
    observedBehavior: 'Continuous 90° angular rotations around box edges, slamming corners on hard concrete with each turn.',
    potentialRisk: 'Filter membrane cracking, plastic tank fracture, and internal valve dislodgement.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Loader handling multiple units simultaneously by kicking and rolling along the floor.',
    recommendedAction: 'Provide light hand cart; review upright handling protocols for filtration equipment.',
    expectedPractice: 'Carry products using appropriate handling equipment; never roll products unless designed for it.',
    financialRiskInr: 8800,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      const rollAngle = (t * 180) % 90;
      const rollX = 170 + t * 40;
      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: `Tumbling rotation: Corner impact cycle at ${Math.round(rollAngle)}°`,
        bboxes: [
          {
            id: 'rolling-box',
            x: rollX,
            y: 340,
            width: 80,
            height: 80,
            label: 'RO Unit [ROLLING CORNER IMPACT]',
            category: 'product',
            confidence: 0.94,
            color: '#F59E0B'
          }
        ],
        skeletons: [],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: 0.7,
          velocityY: 0.2,
          velocityTotal: 0.75,
          accelerationY: 2.1,
          dropHeightMeters: 0.2,
          impactEnergyJoules: 14.5,
          impactForceNewtons: 140,
          stackTiltDegrees: rollAngle,
          overhangRatio: 0,
          pinchDistanceMeters: 4.2,
          riskScore: 62
        },
        activeAlert: {
          type: 'ROLLING_CARTONS',
          severity: 'MEDIUM',
          message: 'TUMBLING DETECTED: Do not roll delicate rectangular cartons!',
          hindiMessage: 'ध्यान दें: बक्से को लुढ़काएं नहीं - हाथ में उठाएं या ट्रॉली लें।',
          preventativeTip: 'Keep product in upright orientation throughout transfer.'
        }
      };
    })
  },
  {
    id: 'SCN-10',
    title: 'Lifting Heavy Cartons by Packaging Straps / Banding',
    behaviorType: 'STRAP_LIFTING',
    severity: 'MEDIUM',
    bayId: 'Bay 2',
    vehicleType: 'Tata 407 Truck',
    productCategory: 'Microwave Ovens & OTG Appliances',
    productMassKg: 18.0,
    fragilityRating: 'STANDARD',
    durationSec: 5,
    fps: 10,
    summary: 'Loader hoists an 18kg appliance carton by pulling exclusively on the plastic strapping bands.',
    observedBehavior: 'Tension applied to plastic strapping instead of placing hands beneath carton base or using cutouts.',
    potentialRisk: 'Strapping snap leading to sudden catastrophic drop, carton edge slicing, and loose packaging.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Operator avoiding bending down to floor level to grip the bottom of the carton.',
    recommendedAction: 'Demonstrate proper ergonomic bottom-cradle lifting technique.',
    expectedPractice: 'Handle carton using proper base lifting points. Never use plastic straps as handles.',
    financialRiskInr: 5800,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: 'Strap Grip Vector: Plastic band under 176N tension load',
        bboxes: [
          {
            id: 'strap-box',
            x: 270,
            y: 240,
            width: 100,
            height: 90,
            label: 'Appliance Carton [STRAP PULL]',
            category: 'product',
            confidence: 0.95,
            color: '#F59E0B'
          },
          {
            id: 'worker-strap',
            x: 250,
            y: 150,
            width: 75,
            height: 190,
            label: 'Operator [STRAP LIFTING]',
            category: 'person',
            confidence: 0.93,
            color: '#10B981'
          }
        ],
        skeletons: [],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: 0.1,
          velocityY: 0.4,
          velocityTotal: 0.4,
          accelerationY: 0.8,
          dropHeightMeters: 0.4,
          impactEnergyJoules: 0,
          impactForceNewtons: 176.4,
          stackTiltDegrees: 4,
          overhangRatio: 0,
          pinchDistanceMeters: 3.5,
          riskScore: 58
        },
        activeAlert: {
          type: 'STRAP_LIFTING',
          severity: 'MEDIUM',
          message: 'STRAP LIFT WARNING: Straps are not lifting handles!',
          hindiMessage: 'चेतावनी: प्लास्टिक पट्टी से न उठाएं - बक्से को नीचे से पकड़ें।',
          preventativeTip: 'Grip package by base or designated hand slots.'
        }
      };
    })
  },
  {
    id: 'SCN-11',
    title: 'Dock Leveler Gap / Uneven Threshold Transition',
    behaviorType: 'DOCK_GAP_HAZARD',
    severity: 'HIGH',
    bayId: 'Bay 3',
    vehicleType: '32ft Container Truck',
    productCategory: 'Washing Machines & Front Loaders',
    productMassKg: 65.0,
    fragilityRating: 'FRAGILE',
    durationSec: 5,
    fps: 10,
    summary: 'Hand pallet truck with 250kg pallet crosses 14cm unbridged dock gap with 7cm vertical step.',
    observedBehavior: 'Loaded pallet truck wheels drop into gap between container floor and warehouse dock edge.',
    potentialRisk: 'Severe jolt impulse, pallet load shift, bottom carton crush against lip, wheel entrapment.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Hydraulic dock leveler lip was not engaged before truck unloading commenced.',
    recommendedAction: 'Engage dock leveler bridge plate and wheel chocks immediately.',
    expectedPractice: 'Ensure a safe, level dock bridge transition before moving material across dock threshold.',
    financialRiskInr: 21500,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      const truckX = 220 + t * 25;
      const isOverGap = truckX > 270 && truckX < 330;
      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: isOverGap ? 'GAP HAZARD ACTIVE: Pallet truck crossing 14cm unbridged dock chasm' : 'Approaching dock boundary',
        bboxes: [
          {
            id: 'dock-gap-zone',
            x: 280,
            y: 350,
            width: 50,
            height: 60,
            label: 'UNBRIDGED DOCK GAP [HAZARD]',
            category: 'hazard',
            confidence: 0.99,
            color: '#EF4444'
          },
          {
            id: 'pallet-transporter',
            x: truckX,
            y: 250,
            width: 120,
            height: 120,
            label: 'Pallet Load 250kg',
            category: 'pallet',
            confidence: 0.97,
            color: isOverGap ? '#EF4444' : '#3B82F6'
          }
        ],
        skeletons: [],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: 0.6,
          velocityY: isOverGap ? 0.8 : 0.0,
          velocityTotal: isOverGap ? 1.0 : 0.6,
          accelerationY: isOverGap ? 4.2 : 0.0,
          dropHeightMeters: isOverGap ? 0.08 : 0.0,
          impactEnergyJoules: isOverGap ? 54.0 : 0,
          impactForceNewtons: isOverGap ? 620 : 0,
          stackTiltDegrees: isOverGap ? 9 : 1,
          overhangRatio: 0,
          pinchDistanceMeters: 2.8,
          riskScore: isOverGap ? 82 : 30
        },
        activeAlert: isOverGap ? {
          type: 'DOCK_GAP_HAZARD',
          severity: 'HIGH',
          message: 'DOCK LEVELER NOT ENGAGED: Severe gap between vehicle and dock!',
          hindiMessage: 'खतरा: डॉक लेवेलर नहीं लगा है - तुरंत ब्रिज प्लेट लगाएं।',
          preventativeTip: 'Deploy dock bridge plate before moving pallet trucks into vehicles.'
        } : undefined
      };
    })
  },
  {
    id: 'SCN-12',
    title: 'Forklift-Pedestrian Dynamic Pinch Zone Breach (<1.2m)',
    behaviorType: 'FORKLIFT_PROXIMITY',
    severity: 'CRITICAL',
    bayId: 'Bay 4',
    vehicleType: 'Counterbalance Forklift (3.0 Ton)',
    productCategory: 'Palletized Bulk Inventory',
    productMassKg: 500.0,
    fragilityRating: 'HEAVY_DURABLE',
    durationSec: 5,
    fps: 10,
    summary: 'Worker enters active 1.2m blind spot radius of reversing 3-ton forklift carrying stacked pallets.',
    observedBehavior: 'Pedestrian worker standing inside reversing forklift safety envelope without high-vis eye contact.',
    potentialRisk: 'Catastrophic crush injury, secondary pallet drop from emergency braking.',
    confirmedDamageState: 'PREVENTED_BY_AI',
    rootCause: 'Lack of designated pedestrian walkway barriers near Bay 4 staging pad.',
    recommendedAction: 'Activate strobe audio warning. Paint demarcated pedestrian walkway.',
    expectedPractice: 'Maintain minimum 3-meter pedestrian clearance from all moving material handling equipment.',
    financialRiskInr: 50000,
    frames: Array.from({ length: 50 }, (_, i) => {
      const t = i / 10;
      const forkX = 380 - t * 30; // Reversing forklift
      const workerX = 220;
      const distanceM = Math.max(0.6, (forkX - workerX) / 100 * 1.5);
      const isCritical = distanceM < 1.8;

      return {
        frameIndex: i,
        timestampSec: Number(t.toFixed(1)),
        description: `Proximity calculation: Worker distance = ${distanceM.toFixed(1)}m from 3-ton forklift`,
        bboxes: [
          {
            id: 'forklift-04',
            x: forkX,
            y: 200,
            width: 160,
            height: 140,
            label: '3-Ton Forklift [REVERSING]',
            category: 'forklift',
            confidence: 0.98,
            color: isCritical ? '#EF4444' : '#F59E0B',
            speed: 1.2
          },
          {
            id: 'pedestrian-worker',
            x: workerX,
            y: 210,
            width: 60,
            height: 170,
            label: 'Pedestrian [IN BLIND SPOT]',
            category: 'person',
            confidence: 0.96,
            color: '#EF4444'
          }
        ],
        skeletons: [],
        telemetry: {
          timestampSec: Number(t.toFixed(1)),
          velocityX: 1.2,
          velocityY: 0.0,
          velocityTotal: 1.2,
          accelerationY: 0.0,
          dropHeightMeters: 0,
          impactEnergyJoules: 0,
          impactForceNewtons: 0,
          stackTiltDegrees: 0,
          overhangRatio: 0,
          pinchDistanceMeters: Number(distanceM.toFixed(2)),
          riskScore: isCritical ? 96 : 40
        },
        activeAlert: isCritical ? {
          type: 'FORKLIFT_PROXIMITY',
          severity: 'CRITICAL',
          message: `PROXIMITY CRITICAL: Pedestrian only ${distanceM.toFixed(1)}m from reversing forklift!`,
          hindiMessage: 'सावधान! पीछे आती फोर्कलिफ्ट से 3 मीटर दूर रहें!',
          preventativeTip: 'Maintain minimum 3-meter clearance around all moving mobile machinery.'
        } : undefined
      };
    })
  }
];
