import { MOCK_ALERTS, MOCK_NDVI, MOCK_INTERVENTION } from '../constants/mockData';

// Delay helper to simulate network latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchDashboard = async () => {
  await delay(600);
  return {
    farm: {
      id: 1,
      name: "Vidarbha Cotton Farm",
      crop_type: "cotton"
    },
    farm_health_score: 72,
    ndvi: 0.21,
    weather_risk: 0.65,
    soil_moisture: 18,
    market_risk: 0.40,
    last_updated: "2026-06-08T12:00:00Z",
    recommendation: {
      action: "Irrigate within 48 hours",
      estimated_cost: 340,
      yield_loss_risk: 18000
    }
  };
};

export const fetchAlerts = async () => {
  await delay(600);
  return [
    {
      id: 1,
      message: "Irrigate within 48 hours",
      timestamp: "2026-06-08T12:00:00Z",
      status: "sent"
    }
  ];
};

export const fetchAgentStatus = async () => {
  await delay(400);
  return {
    satellite: "completed",
    weather: "completed",
    soil: "completed",
    market: "completed",
    intervention: "completed",
    alert: "completed"
  };
};

export const runAnalysis = async () => {
  await delay(800);
  return {
    status: "started"
  };
};

// Legacy compatibility exports
export const getDashboard = fetchDashboard;
export const getAlerts = fetchAlerts;
export const getAgentStatus = fetchAgentStatus;
export const getIntervention = async () => {
  await delay(500);
  return MOCK_INTERVENTION;
};
export const getNdviHistory = async () => {
  await delay(500);
  return MOCK_NDVI;
};
export const getMarketHistory = async () => {
  await delay(500);
  return { status: 'success' };
};
