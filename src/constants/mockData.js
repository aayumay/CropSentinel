export const MOCK_FARMS = [
  {
    id: 'farm_001',
    name: 'North Field',
    crop_type: 'Wheat',
    health_score: 72,
    zone_type: 'drought',
    coordinates: [
      { lat: 18.5333, lon: 73.8667 },
      { lat: 18.5350, lon: 73.8685 },
      { lat: 18.5322, lon: 73.8694 },
      { lat: 18.5308, lon: 73.8676 },
    ],
  },
  {
    id: 'farm_002',
    name: 'South Field',
    crop_type: 'Rice',
    health_score: 88,
    zone_type: 'healthy',
    coordinates: [
      { lat: 18.5123, lon: 73.8554 },
      { lat: 18.5139, lon: 73.8571 },
      { lat: 18.5118, lon: 73.8583 },
      { lat: 18.5105, lon: 73.8562 },
    ],
  },
];

export const MOCK_INTERVENTION = {
  farm_id: 'farm_001',
  action: 'Irrigate immediately - moisture level critically low',
  irrigation_mm: 35,
  cost_inr: 1200,
  risk_inr: 45000,
  confidence: 0.91,
};

export const MOCK_NDVI = {
  farm_id: 'farm_001',
  health_score: 72,
  zone_type: 'drought',
  trend: [
    { day: 'Mon', value: 0.42 },
    { day: 'Tue', value: 0.38 },
    { day: 'Wed', value: 0.35 },
    { day: 'Thu', value: 0.39 },
    { day: 'Fri', value: 0.41 },
    { day: 'Sat', value: 0.37 },
    { day: 'Sun', value: 0.40 },
  ],
};

export const MOCK_ALERTS = [
  {
    id: '1',
    farm_name: 'North Field',
    action: 'Irrigate immediately - moisture critically low',
    cost_inr: 1200,
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    farm_name: 'South Field',
    action: 'Apply pesticide - pest activity detected',
    cost_inr: 800,
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    farm_name: 'North Field',
    action: 'Check drainage - waterlogging risk',
    cost_inr: 500,
    timestamp: '1 day ago',
  },
  {
    id: '4',
    farm_name: 'East Plot',
    action: 'Add nitrogen fertilizer - nutrient deficiency',
    cost_inr: 1500,
    timestamp: '2 days ago',
  },
];
