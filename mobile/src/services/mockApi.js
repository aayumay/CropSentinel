import { MOCK_ALERTS, MOCK_NDVI, MOCK_INTERVENTION } from '../constants/mockData';
import { demoState } from '../config/demoState';

// Delay helper to simulate network latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── DEMO FARMS ───────────────────────────────────────────────────────────────
// 3 polished demo farms for hackathon judging.
// All crop_type values map to existing assets: wheat | rice | corn | sugarcane
// ─────────────────────────────────────────────────────────────────────────────
export let mockFarms = [
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
      action: 'Inspect crops and apply targeted treatment.',
      reason: 'Pest indicators exceed safe thresholds.',
      confidence: 88,
    },
    latitude: 30.9010,
    longitude: 75.8573,
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
      action: 'Improve drainage and delay irrigation.',
      reason: 'Excessive moisture may damage root systems.',
      confidence: 90,
    },
    latitude: 10.9102,
    longitude: 79.3629,
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
      action: 'Irrigate within 24 hours.',
      reason: 'Low moisture and declining NDVI detected.',
      confidence: 95,
    },
    latitude: 19.8762,
    longitude: 75.3433,
  },
];

export const DEMO_FARMS = mockFarms;

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
  return [];
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

export const getIntervention = async (farmId) => {
  await delay(500);
  const ds = demoState.get();

  const idStr = String(farmId);

  if (idStr === '1') {
    return {
      farm_id: '1',
      action: 'Inspect crops and apply targeted treatment.',
      reason: 'Pest indicators exceed safe thresholds.',
      confidence: 0.88,
    };
  } else if (idStr === '2') {
    return {
      farm_id: '2',
      action: 'Improve drainage and delay irrigation.',
      reason: 'Excessive moisture may damage root systems.',
      confidence: 0.90,
    };
  }

  return {
    farm_id: '3',
    action: 'Irrigate within 24 hours.',
    reason: 'Low moisture and declining NDVI detected.',
    confidence: 0.95,
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

export const login = async (credentialPayload) => {
  await delay(500);
  const identifier = credentialPayload?.phone_number || credentialPayload?.email || 'demo_user';
  return {
    access_token: 'mock_jwt_token_12345',
    token_type: 'bearer',
    user: {
      id: 1,
      phone_number: identifier,
    },
  };
};

export const fetchFarms = async () => {
  await delay(600);
  const ds = demoState.get();
  let list = mockFarms;
  if (!ds.isDemoMode) {
    list = mockFarms.filter(f => f.id !== 1 && f.id !== 2 && f.id !== 3);
  }
  return list.map(f => ({
    id: f.id,
    farm_name: f.name,
    latitude: f.latitude,
    longitude: f.longitude,
    created_at: new Date().toISOString(),
  }));
};

export const createFarm = async (farmData) => {
  await delay(500);
  const newId = Math.floor(Math.random() * 1000) + 10;
  const newFarm = {
    id: newId,
    name: farmData.farm_name,
    crop_type: 'wheat',
    farm_health_score: 75,
    ndvi: 0.60,
    weather_risk: 0.20,
    soil_moisture: 40,
    market_risk: 0.30,
    zone_type: 'healthy',
    status: 'Crop health stable.',
    recommendation: {
      action: 'Continue standard monitoring',
    },
    latitude: farmData.latitude,
    longitude: farmData.longitude,
  };
  mockFarms.push(newFarm);
  return {
    farm_id: newId,
    farm_name: farmData.farm_name,
  };
};

export const updateFarm = async (id, farmData) => {
  await delay(500);
  const farmIdx = mockFarms.findIndex(f => f.id === Number(id));
  if (farmIdx !== -1) {
    mockFarms[farmIdx] = {
      ...mockFarms[farmIdx],
      name: farmData.farm_name,
      latitude: farmData.latitude,
      longitude: farmData.longitude,
    };
  }
  return {
    farm_id: Number(id),
    farm_name: farmData.farm_name,
  };
};

export const deleteFarm = async (id) => {
  await delay(500);
  mockFarms = mockFarms.filter(f => f.id !== Number(id));
  return {
    success: true,
    farm_id: Number(id),
  };
};

export const getFarmHistory = async (farmId) => {
  await delay(500);
  const farm = mockFarms.find(f => f.id === Number(farmId));
  return {
    farm_id: Number(farmId),
    history: [
      {
        created_at: new Date().toISOString(),
        ndvi: farm ? farm.ndvi : 0.68,
        risk_score: farm ? Math.round(farm.weather_risk * 100) : 15,
        risk_level: farm ? farm.zone_type.toUpperCase() : 'LOW',
        recommendation: farm ? (farm.recommendation?.action || 'Continue standard monitoring') : 'Optimal moisture - continue normal irrigation.'
      }
    ]
  };
};

export const postAnalyze = async (analyzeData) => {
  await delay(800);
  return {
    satellite: { ndvi: 0.65, health_score: 78 },
    weather: { forecast: 'Clear' },
    risk: { risk_score: 20, risk_level: 'low', recommendation: 'Continue standard irrigation' },
  };
};

export const submitIntervention = async (farmId, interventionData) => {
  await delay(800);
  return {
    success: true,
    farm_id: farmId,
  };
};

