import { ShiftStats, SafetyBadge } from '../types';

export const INITIAL_SHIFT_STATS: ShiftStats = {
  shiftName: 'Morning Unloading Shift (06:00 - 14:00)',
  supervisorName: 'Rajesh Sharma (Lead Ops Supervisor)',
  startTime: '06:00 AM IST',
  totalUnitsHandled: 1420,
  totalEventsLogged: 34,
  criticalEvents: 3,
  highRiskEvents: 8,
  mediumRiskEvents: 14,
  lowRiskEvents: 9,
  damagesPreventedCount: 31,
  estimatedCostSavedInr: 384500, // ₹3.84 Lakhs saved this shift
  safetyScorePct: 91.2,
  bayBreakdown: [
    {
      bayId: 'Bay 1',
      activeVehicle: 'Eicher 19ft LCV (Unloading)',
      eventsCount: 7,
      safetyScore: 92.4,
      status: 'ACTIVE'
    },
    {
      bayId: 'Bay 2',
      activeVehicle: 'Tata 407 Delivery Van',
      eventsCount: 9,
      safetyScore: 89.1,
      status: 'ACTIVE'
    },
    {
      bayId: 'Bay 3',
      activeVehicle: '32ft Container (Heavy Appliances)',
      eventsCount: 12,
      safetyScore: 86.5,
      status: 'FLAGGED'
    },
    {
      bayId: 'Bay 4',
      activeVehicle: '40ft Semi-Trailer (Palletized)',
      eventsCount: 6,
      safetyScore: 95.8,
      status: 'ACTIVE'
    }
  ]
};

export const MOCK_SAFETY_BADGES: SafetyBadge[] = [
  {
    id: 'badge-01',
    name: 'Zero-Drop Vanguard',
    description: 'Bay 4 completed 500 consecutive appliance lifts with zero drop or free-fall telemetry events.',
    icon: 'ShieldCheck',
    tier: 'GOLD',
    unlockedAt: 'Today, 11:30 AM'
  },
  {
    id: 'badge-02',
    name: 'Master Stacker',
    description: 'Maintained 100% descending weight pyramid stacking across 48 multi-tier pallets.',
    icon: 'Layers',
    tier: 'GOLD',
    unlockedAt: 'Yesterday'
  },
  {
    id: 'badge-03',
    name: 'Team-Lift Champion',
    description: '100% compliance on 2-person buddy lifts for all packages exceeding 20kg.',
    icon: 'Users',
    tier: 'SILVER',
    unlockedAt: '2 days ago'
  },
  {
    id: 'badge-04',
    name: 'Pinch-Zone Guardian',
    description: 'Zero pedestrian breaches within forklift 3-meter safety radius across 8 full shifts.',
    icon: 'Crosshair',
    tier: 'GOLD',
    unlockedAt: '3 days ago'
  }
];

export const OPERATOR_LEADERBOARD = [
  { rank: 1, name: 'Team Bay 4 (Unloading Alpha)', score: 98.4, units: 480, preventedIncidents: 12, streakDays: 14 },
  { rank: 2, name: 'Team Bay 1 (Express Logistics)', score: 94.2, units: 360, preventedIncidents: 8, streakDays: 9 },
  { rank: 3, name: 'Team Bay 2 (Small Freight)', score: 91.0, units: 310, preventedIncidents: 6, streakDays: 5 },
  { rank: 4, name: 'Team Bay 3 (Heavy Freight)', score: 86.5, units: 270, preventedIncidents: 5, streakDays: 2 }
];

export const HOURLY_INCIDENT_TRENDS = [
  { hour: '06:00', safeHandling: 110, riskFlags: 2, prevented: 2 },
  { hour: '07:00', safeHandling: 190, riskFlags: 4, prevented: 4 },
  { hour: '08:00', safeHandling: 240, riskFlags: 7, prevented: 6 },
  { hour: '09:00', safeHandling: 220, riskFlags: 5, prevented: 5 },
  { hour: '10:00', safeHandling: 210, riskFlags: 6, prevented: 5 },
  { hour: '11:00', safeHandling: 260, riskFlags: 4, prevented: 4 },
  { hour: '12:00', safeHandling: 190, riskFlags: 6, prevented: 5 }
];
