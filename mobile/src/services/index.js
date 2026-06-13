import * as api from './api';
import * as mockApi from './mockApi';
import { USE_MOCK_DATA } from '../config/environment';
import { demoState } from '../config/demoState';

const wrapService = (funcName) => {
  return async (...args) => {
    const isDemo = demoState.get().isDemoMode;
    if (USE_MOCK_DATA || isDemo) {
      return mockApi[funcName](...args);
    }
    try {
      return await api[funcName](...args);
    } catch (error) {
      const status = error.status;

      // 1. Central 401 Unauthorized handling: clear auth state & throw SESSION_EXPIRED
      if (status === 401) {
        demoState.set({ authToken: null });
        throw new Error('SESSION_EXPIRED');
      }

      // 2. Do not fallback for 403 or 404
      if (status === 403 || status === 404) {
        throw error;
      }

      // 3. Mock fallback should only happen for network timeouts, offline, or 5xx server errors
      const isTimeout = status === 408 || error.name === 'AbortError' || error.message?.toLowerCase().includes('timeout') || error.message?.toLowerCase().includes('timed out');
      const isOffline = !status || error.message?.includes('Network request failed');
      const is5xx = status >= 500;

      if (isTimeout || isOffline || is5xx) {
        if (__DEV__) {
          console.warn(`API call ${funcName} failed (status: ${status}), falling back to mock:`, error);
        }
        return mockApi[funcName](...args);
      }

      // Re-throw all other errors (including validation client errors like 400 or 422)
      throw error;
    }
  };
};

export const login = wrapService('login');
export const fetchFarms = wrapService('fetchFarms');
export const createFarm = wrapService('createFarm');
export const updateFarm = wrapService('updateFarm');
export const deleteFarm = wrapService('deleteFarm');
export const getFarmHistory = wrapService('getFarmHistory');
export const postAnalyze = wrapService('postAnalyze');
export const submitIntervention = wrapService('submitIntervention');

export const fetchDashboard = wrapService('fetchDashboard');
export const fetchAlerts = wrapService('fetchAlerts');
export const fetchAgentStatus = wrapService('fetchAgentStatus');
export const runAnalysis = wrapService('runAnalysis');

// Legacy compatibility wrappers
export const getDashboard = wrapService('getDashboard');
export const getAlerts = wrapService('getAlerts');
export const getAgentStatus = wrapService('getAgentStatus');
export const getIntervention = wrapService('getIntervention');
export const getNdviHistory = wrapService('getNdviHistory');
export const getMarketHistory = wrapService('getMarketHistory');
