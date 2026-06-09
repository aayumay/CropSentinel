import { MOCK_ALERTS, MOCK_NDVI, MOCK_INTERVENTION } from '../constants/mockData';
import { demoState } from '../config/demoState';

// Delay helper to simulate network latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── DEMO FARMS ───────────────────────────────────────────────────────────────
// 3 polished demo farms for hackathon judging.
// All crop_type values map to existing assets: wheat | rice | corn | sugarcane
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_FARMS = [
  {
    id: 1,
    name: 'Punjab Wheat Farm',
    crop_type: 'wheat',
    farm_health_score: 86,
    ndvi: 0.74,
    weather_risk: 0.18,
    soil_moisture: 42,
    market_risk: 0.22,
    zone_type: 'healthy',
    status: 'Crop health excellent — optimal moisture and NDVI. No intervention required.',
    recommendation: {
      action: 'Continue current irrigation schedule',
      estimated_cost: 0,
      yield_loss_risk: 0,
      confidence: 95,
    },
  },
  {
    id: 2,
    name: 'Kaveri Delta Rice Farm',
    crop_type: 'rice',
    farm_health_score: 63,
    ndvi: 0.48,
    weather_risk: 0.52,
    soil_moisture: 28,
    market_risk: 0.35,
    zone_type: 'moderate',
    status: 'Moderate water stress detected — increase irrigation frequency.',
    recommendation: {
      action: 'Increase irrigation by 20% over next 5 days',
      estimated_cost: 520,
      yield_loss_risk: 9500,
      confidence: 85,
    },
  },
  {
    id: 3,
    name: 'Marathwada Sugarcane Farm',
    crop_type: 'sugarcane',
    farm_health_score: 41,
    ndvi: 0.22,
    weather_risk: 0.78,
    soil_moisture: 11,
    market_risk: 0.61,
    zone_type: 'drought',
    status: 'Critical drought stress detected.',
    recommendation: {
      action: 'Increase irrigation within 48 hours.',
      estimated_cost: 1200,
      yield_loss_risk: 45000,
      confidence: 91,
    },
  },
];

export const fetchDashboard = async () => {
  await delay(600);
  const ds = demoState.get();

  // If in Demo Mode but drought has NOT been simulated yet, we show a healthy/stable sugarcane farm.
  if (ds.isDemoMode && !ds.isDroughtSimulated) {
    return {
      farm: {
        id: 3,
        name: 'Marathwada Sugarcane Farm',
        crop_type: 'sugarcane',
      },
      farm_health_score: 78,
      ndvi: 0.65,
      weather_risk: 0.25,
      soil_moisture: 48,
      market_risk: 0.30,
      zone_type: 'healthy',
      last_updated: new Date().toISOString(),
      status: 'Crop health stable — optimal moisture levels.',
      recommendation: {
        action: 'Continue standard irrigation',
        estimated_cost: 0,
        yield_loss_risk: 0,
        confidence: 95,
      },
    };
  }

  // Otherwise (Demo Mode with drought simulated, or standard/default mode), show the critical drought state.
  const farm = DEMO_FARMS[2]; // Marathwada Sugarcane Farm
  return {
    farm: {
      id: farm.id,
      name: farm.name,
      crop_type: farm.crop_type,
    },
    farm_health_score: farm.farm_health_score,
    ndvi: farm.ndvi,
    weather_risk: farm.weather_risk,
    soil_moisture: farm.soil_moisture,
    market_risk: farm.market_risk,
    last_updated: new Date().toISOString(),
    status: farm.status,
    recommendation: farm.recommendation,
  };
};

export const fetchAlerts = async () => {
  await delay(600);
  const ds = demoState.get();

  // Custom alert messages list
  const defaultAlerts = [
    {
      id: 2,
      message: 'Increase irrigation by 20% over next 5 days',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      status: 'sent',
    }
  ];

  if (ds.isDemoMode) {
    if (ds.isDroughtSimulated) {
      return [
        {
          id: 100,
          message: 'Critical drought stress detected.',
          timestamp: new Date().toISOString(),
          status: 'sent',
        },
        ...defaultAlerts,
        ...ds.extraAlerts
      ];
    } else {
      return defaultAlerts;
    }
  }

  // Default mode
  return [
    {
      id: 1,
      message: 'Critical drought stress detected.',
      timestamp: new Date().toISOString(),
      status: 'sent',
    },
    ...defaultAlerts
  ];
};

export const fetchAgentStatus = async () => {
  await delay(400);
  return {
    satellite: 'completed',
    weather: 'completed',
    soil: 'completed',
    market: 'completed',
    intervention: 'completed',
    alert: 'completed',
  };
};

export const runAnalysis = async () => {
  await delay(800);
  return {
    status: 'started',
  };
};

// Legacy compatibility exports
export const getDashboard = fetchDashboard;
export const getAlerts = fetchAlerts;
export const getAgentStatus = fetchAgentStatus;

export const getIntervention = async () => {
  await delay(500);
  const ds = demoState.get();

  if (ds.isDemoMode && !ds.isDroughtSimulated) {
    return {
      farm_id: 'farm_003',
      action: 'Continue standard irrigation',
      irrigation_mm: 0,
      cost_inr: 0,
      risk_inr: 0,
      confidence: 0.95,
    };
  }

  return {
    farm_id: 'farm_003',
    action: 'Increase irrigation within 48 hours.',
    irrigation_mm: 35,
    cost_inr: 1200,
    risk_inr: 45000,
    confidence: 0.91,
  };
};

export const getNdviHistory = async () => {
  await delay(500);
  const ds = demoState.get();

  if (ds.isDemoMode && !ds.isDroughtSimulated) {
    return {
      farm_id: 'farm_003',
      health_score: 78,
      zone_type: 'healthy',
      trend: [
        { day: 'Mon', value: 0.62 },
        { day: 'Tue', value: 0.63 },
        { day: 'Wed', value: 0.64 },
        { day: 'Thu', value: 0.65 },
        { day: 'Fri', value: 0.65 },
        { day: 'Sat', value: 0.66 },
        { day: 'Sun', value: 0.65 },
      ],
    };
  }

  return {
    farm_id: 'farm_003',
    health_score: 41,
    zone_type: 'drought',
    trend: [
      { day: 'Mon', value: 0.55 },
      { day: 'Tue', value: 0.48 },
      { day: 'Wed', value: 0.40 },
      { day: 'Thu', value: 0.32 },
      { day: 'Fri', value: 0.28 },
      { day: 'Sat', value: 0.24 },
      { day: 'Sun', value: 0.22 },
    ],
  };
};

export const getMarketHistory = async () => {
  await delay(500);
  return [
    { day: 'Mon', price: 6200 },
    { day: 'Tue', price: 6250 },
    { day: 'Wed', price: 6300 },
    { day: 'Thu', price: 6150 },
    { day: 'Fri', price: 6400 },
    { day: 'Sat', price: 6350 },
    { day: 'Sun', price: 6500 },
  ];
};
