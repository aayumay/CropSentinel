import * as api from './api';
import * as mockApi from './mockApi';
import { USE_MOCK_DATA } from '../config/environment';

const wrapService = (funcName) => {
  return async (...args) => {
    if (USE_MOCK_DATA) {
      return mockApi[funcName](...args);
    }
    try {
      return await api[funcName](...args);
    } catch (error) {
      console.warn(`API call ${funcName} failed, falling back to mock:`, error);
      return mockApi[funcName](...args);
    }
  };
};

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
