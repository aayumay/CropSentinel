// ─── DEMO FARMS (Fallback) ────────────────────────────────────────────────────
// All crop_type values use lowercase and map to existing crop assets:
//   wheat | rice | corn | sugarcane
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_FARMS = [
  {
    id: 'farm_001',
    name: 'Punjab Wheat Farm',
    crop_type: 'wheat',
    health_score: 86,
    ndvi: 0.74,
    zone_type: 'healthy',
    coordinates: [
      { lat: 30.9010, lon: 75.8573 },
      { lat: 30.9028, lon: 75.8592 },
      { lat: 30.9005, lon: 75.8608 },
      { lat: 30.8988, lon: 75.8585 },
    ],
  },
  {
    id: 'farm_002',
    name: 'Kaveri Delta Rice Farm',
    crop_type: 'rice',
    health_score: 63,
    ndvi: 0.48,
    zone_type: 'moderate',
    coordinates: [
      { lat: 10.9102, lon: 79.3629 },
      { lat: 10.9118, lon: 79.3647 },
      { lat: 10.9095, lon: 79.3663 },
      { lat: 10.9079, lon: 79.3641 },
    ],
  },
  {
    id: 'farm_003',
    name: 'Marathwada Sugarcane Farm',
    crop_type: 'sugarcane',
    health_score: 41,
    ndvi: 0.22,
    zone_type: 'drought',
    coordinates: [
      { lat: 19.8762, lon: 75.3433 },
      { lat: 19.8780, lon: 75.3452 },
      { lat: 19.8757, lon: 75.3469 },
      { lat: 19.8740, lon: 75.3447 },
    ],
  },
];

export const MOCK_INTERVENTION = {
  farm_id: 'farm_003',
  action: 'Increase irrigation within 48 hours.',
  irrigation_mm: 35,
  cost_inr: 1200,
  risk_inr: 45000,
  confidence: 0.91,
};

export const MOCK_NDVI = {
  farm_id: 'farm_003',
  health_score: 41,
  zone_type: 'drought',
  trend: [
    { day: 'Mon', value: 0.38 },
    { day: 'Tue', value: 0.34 },
    { day: 'Wed', value: 0.31 },
    { day: 'Thu', value: 0.28 },
    { day: 'Fri', value: 0.25 },
    { day: 'Sat', value: 0.23 },
    { day: 'Sun', value: 0.22 },
  ],
};

export const MOCK_ALERTS = [
  {
    id: '1',
    farm_name: 'Marathwada Sugarcane Farm',
    action: 'Irrigate within 24 hours — critical moisture deficit',
    cost_inr: 1400,
    timestamp: '1 hour ago',
  },
  {
    id: '2',
    farm_name: 'Kaveri Delta Rice Farm',
    action: 'Increase irrigation by 20% over next 5 days',
    cost_inr: 520,
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    farm_name: 'Marathwada Sugarcane Farm',
    action: 'Apply foliar spray — potassium deficiency detected',
    cost_inr: 750,
    timestamp: '1 day ago',
  },
  {
    id: '4',
    farm_name: 'Punjab Wheat Farm',
    action: 'Continue current schedule — all metrics healthy',
    cost_inr: 0,
    timestamp: '2 days ago',
  },
];
