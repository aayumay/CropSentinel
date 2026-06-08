// Production API service integration layer.
// These methods will be connected to live endpoints during Day 4.

const getApiUrl = (path) => {
  const base = process.env.EXPO_PUBLIC_API_URL || '';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const makeRequest = async (path, options = {}) => {
  const url = getApiUrl(path);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  
  if (!response.ok) {
    throw new Error(`API request failed with status: ${response.status}`);
  }
  
  return await response.json();
};

export const fetchDashboard = async () => {
  return makeRequest('/dashboard', { method: 'GET' });
};

export const fetchAlerts = async () => {
  return makeRequest('/alerts', { method: 'GET' });
};

export const fetchAgentStatus = async () => {
  return makeRequest('/agent-status', { method: 'GET' });
};

export const runAnalysis = async (params = {}) => {
  return makeRequest('/run-analysis', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

// Legacy compatibility exports
export const getDashboard = fetchDashboard;
export const getAlerts = fetchAlerts;
export const getAgentStatus = fetchAgentStatus;
export const getIntervention = async () => {
  return makeRequest('/intervention/farm_001', { method: 'GET' });
};
export const getNdviHistory = async () => {
  return makeRequest('/ndvi-history', { method: 'GET' });
};
export const getMarketHistory = async () => {
  return makeRequest('/market-history', { method: 'GET' });
};
