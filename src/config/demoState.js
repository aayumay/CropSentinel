import { useState, useEffect } from 'react';

// Lightweight global state for hackathon demo
let state = {
  isDemoMode: false,
  isDroughtSimulated: false,
  appliedInterventions: {}, // map of farmId -> boolean
  extraAlerts: [] // list of simulated alerts
};

const listeners = new Set();

const updateListeners = () => {
  listeners.forEach(listener => listener(state));
};

export const demoState = {
  get: () => state,
  set: (newState) => {
    state = { ...state, ...newState };
    updateListeners();
  },
  reset: () => {
    state = {
      isDemoMode: false,
      isDroughtSimulated: false,
      appliedInterventions: {},
      extraAlerts: []
    };
    updateListeners();
  }
};

export const useDemoState = () => {
  const [localState, setLocalState] = useState(state);

  useEffect(() => {
    const listener = (updatedState) => {
      setLocalState(updatedState);
    };
    listeners.add(listener);
    // Initial sync
    listener(state);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setDemoMode = (val) => demoState.set({ isDemoMode: val });
  const setDroughtSimulated = (val) => demoState.set({ isDroughtSimulated: val });
  
  const applyIntervention = (farmId) => {
    const applied = { ...state.appliedInterventions, [farmId]: true };
    demoState.set({ appliedInterventions: applied });
  };

  const addAlert = (alert) => {
    const alerts = [...state.extraAlerts, alert];
    demoState.set({ extraAlerts: alerts });
  };

  return {
    ...localState,
    setDemoMode,
    setDroughtSimulated,
    applyIntervention,
    addAlert,
    resetDemo: demoState.reset
  };
};
