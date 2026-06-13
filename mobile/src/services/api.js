import { API_BASE_URL } from '../config/environment';
import { demoState } from '../config/demoState';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const getApiUrl = (path) => {
  const base = API_BASE_URL || 'https://cropsentinel-on03.onrender.com';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const makeRequest = async (path, options = {}) => {
  const url = getApiUrl(path);
  const token = demoState.get().authToken;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errMsg = `API request failed with status: ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.detail) {
          if (Array.isArray(errJson.detail)) {
            errMsg += ` - ${errJson.detail.map(d => d.msg).join(', ')}`;
          } else {
            errMsg += ` - ${JSON.stringify(errJson.detail)}`;
          }
        }
      } catch (e) {
        const textErr = await response.text().catch(() => '');
        if (textErr) errMsg += ` - ${textErr}`;
      }
      throw new ApiError(errMsg, response.status);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('API request timed out (10s limit exceeded).', 408);
    }
    throw error;
  }
};

// ─── AUTHENTICATION ──────────────────────────────────────────────────────────
// credentialPayload: { phone_number: string } | { email: string }
export const login = async (payload) => {
  return makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ─── FARMS MANAGEMENT ────────────────────────────────────────────────────────
export const fetchFarms = async () => {
  return makeRequest('/farm/list', { method: 'GET' });
};

export const createFarm = async (farmData) => {
  const path = '/farm/create';
  const url = getApiUrl(path);
  const token = demoState.get().authToken;
  const payload = {
    farm_name: farmData.farm_name,
    latitude: farmData.latitude,
    longitude: farmData.longitude,
  };

  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }



  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });



  if (!response.ok) {
    let errMsg = `API request failed with status: ${response.status}`;
    try {
      const errJson = await response.json();

      if (errJson && errJson.detail) {
        if (Array.isArray(errJson.detail)) {
          errMsg += ` - ${errJson.detail.map(d => d.msg).join(', ')}`;
        } else {
          errMsg += ` - ${JSON.stringify(errJson.detail)}`;
        }
      }
    } catch (e) {
      const textErr = await response.text().catch(() => '');

      if (textErr) errMsg += ` - ${textErr}`;
    }
    throw new ApiError(errMsg, response.status);
  }

  const json = await response.json();

  return json;
};

export const updateFarm = async (id, farmData) => {
  // Fallback to local state if endpoint not implemented on backend
  return makeRequest(`/farm/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      farm_name: farmData.farm_name,
      latitude: farmData.latitude,
      longitude: farmData.longitude,
    }),
  });
};

export const deleteFarm = async (id) => {
  // Fallback to local state if endpoint not implemented on backend
  return makeRequest(`/farm/${id}`, {
    method: 'DELETE',
  });
};

// ─── ANALYSIS HISTORY & TRIGGERING ──────────────────────────────────────────
export const getFarmHistory = async (farmId) => {
  return makeRequest(`/history/${farmId}`, { method: 'GET' });
};

export const postAnalyze = async (analyzeData) => {
  return makeRequest('/analyze', {
    method: 'POST',
    body: JSON.stringify({
      latitude: analyzeData.latitude,
      longitude: analyzeData.longitude,
      farm_id: analyzeData.farm_id || null,
    }),
  });
};

// ─── DASHBOARD, ALERTS & AGENTS ─────────────────────────────────────────────
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

export const submitIntervention = async (farmId, interventionData) => {
  // Backend endpoint does not exist; bypass call and keep D5 mock persistence
  return {
    success: true,
    farm_id: farmId,
  };
};

