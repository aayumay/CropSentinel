let base = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://cropsentinel-on03.onrender.com' : '/api');
if (import.meta.env.PROD && base.endsWith('/api')) {
  base = base.replace(/\/api$/, '');
}
const API_BASE_URL = base;

export class BackendUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BackendUnavailableError';
  }
}

// Generic helper to try real fetch, then fallback to localStorage cache if network/backend fails
export async function fetchWithFallback(endpoint, options = {}, cacheKey = null) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : endpoint.startsWith(API_BASE_URL) 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    const data = await response.json();
    if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[API Fallback] ${url} failed or timed out.`, error.message);
    if (cacheKey) {
      const saved = localStorage.getItem(cacheKey);
      if (saved) return JSON.parse(saved);
    }
    throw new BackendUnavailableError(`API unavailable: ${error.message}`);
  }
}

// AUTHENTICATION
export async function registerUser(email, password, name) {
  // Render API handles both login and register at /auth/login
  return loginUser(email, password);
}

export async function loginUser(email, password) {
  try {
    const data = await fetchWithFallback('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: email })
    }, null); // Don't use standard cache key because we want to intercept the error
    
    if (data && data.access_token) {
      localStorage.setItem('cs_token', data.access_token);
    }
    return data;
  } catch (err) {
    throw err;
  }
}

// PROFILE
export async function fetchProfile() {
  // Backend doesn't support /api/profile, just return local cache
  const saved = localStorage.getItem('cs_profile_cache');
  if (saved) return JSON.parse(saved);
  return {};
}

export async function updateProfile(profileData) {
  // Backend doesn't support /api/profile, just save locally
  const existing = JSON.parse(localStorage.getItem('cs_profile_cache') || '{}');
  const updated = { ...existing, ...profileData };
  localStorage.setItem('cs_profile_cache', JSON.stringify(updated));
  return updated;
}

export async function changePasswordApi(currentPassword, newPassword) {
  return fetchWithFallback('/user/password', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('cs_token')}`
    },
    body: JSON.stringify({ currentPassword, newPassword })
  }, null);
}

export async function deleteAccountApi() {
  return fetchWithFallback('/user/delete', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('cs_token')}` }
  }, null);
}

// POSTS
export async function fetchPosts() {
  return fetchWithFallback('/posts', { method: 'GET' }, 'cs_posts_cache');
}

export async function createPost(content, authorName = "Demo Farmer") {
  return fetchWithFallback('/posts', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('cs_token')}`
    },
    body: JSON.stringify({ content, authorName })
  }, null);
}

// DASHBOARD / ANALYSIS
export async function fetchDashboard() {
  const token = localStorage.getItem('cs_token');
  return fetchWithFallback('/dashboard', {
    headers: { 'Authorization': `Bearer ${token}` }
  }, 'cs_dashboard_cache');
}

export async function fetchFarms() {
  const token = localStorage.getItem('cs_token');
  let farms = [];
  try {
    farms = await fetchWithFallback('/farm/list', {
      headers: { 'Authorization': `Bearer ${token}` }
    }, 'cs_farms_cache');
  } catch (err) {
    throw err;
  }
  
  if (Array.isArray(farms)) {
    return farms;
  }
  return [];
}

export async function deleteFarmApi(farmId) {
  const token = localStorage.getItem('cs_token');
  try {
    const result = await fetchWithFallback(`/farm/${farmId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }, null);
    
    // Purge from local cache
    const existingFarms = JSON.parse(localStorage.getItem('cs_farms_cache') || '[]');
    const updatedFarms = existingFarms.filter(f => String(f.id) !== String(farmId));
    localStorage.setItem('cs_farms_cache', JSON.stringify(updatedFarms));
    return result;
  } catch (err) {
    throw err;
  }
}

export async function fetchAgentStatus() {
  const token = localStorage.getItem('cs_token');
  return fetchWithFallback('/agent-status', {
    headers: { 'Authorization': `Bearer ${token}` }
  }, null);
}

export async function runAnalysisBackend() {
  const token = localStorage.getItem('cs_token');
  return fetchWithFallback('/run-analysis', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }, null);
}

export async function analyzeFarm(latitude, longitude, farmId) {
  const cacheKey = `cs_analysis_${farmId || `${latitude}_${longitude}`}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch (e) {
      // Ignored
    }
  }

  const token = localStorage.getItem('cs_token');
  const result = await fetchWithFallback('/analyze', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) })
  }, cacheKey);

  if (result) {
    sessionStorage.setItem(cacheKey, JSON.stringify(result));
  }
  return result;
}

export async function createFarm(farmData) {
  const token = localStorage.getItem('cs_token');
  let result;
  try {
    result = await fetchWithFallback('/farm/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        farm_name: farmData.farm_name,
        area: farmData.area ? parseFloat(farmData.area) : null,
        crop_type: farmData.crop_type || null,
        sowing_date: farmData.sowing_date || null,
        latitude: parseFloat(farmData.latitude) || 0,
        longitude: parseFloat(farmData.longitude) || 0
      })
    }, null);
  } catch (err) {
    throw err;
  }
  const farmId = result && (result.id || result.farm_id);
  if (farmId) {
    result.id = farmId;
  }
  return result;
}

export async function fetchNdviHistory(latitude, longitude) {
  const token = localStorage.getItem('cs_token');
  const qs = `?lat=${latitude}&lng=${longitude}`;
  return fetchWithFallback(`/ndvi-history${qs}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }, `cs_ndvi_history_${latitude}_${longitude}`);
}

export async function fetchMarketHistory(latitude, longitude) {
  const token = localStorage.getItem('cs_token');
  const qs = `?lat=${latitude}&lng=${longitude}`;
  return fetchWithFallback(`/market-history${qs}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }, `cs_market_history_${latitude}_${longitude}`);
}

export async function fetchAlerts() {
  const token = localStorage.getItem('cs_token');
  const response = await fetch(`${API_BASE_URL}/alerts`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).catch(() => ({ ok: false }));
  
  if (!response.ok) return [];
  return await response.json();
}

