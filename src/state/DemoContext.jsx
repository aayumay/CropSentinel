import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

/**
 * Initial static state object acting as the blueprint for the Global State Engine.
 */
const initialCropSentinelState = {
  isCrisisActive: false,
  systemMode: 'nominal', // 'nominal' | 'processing' | 'crisis_resolved'
  currentCycleTimestamp: "2026-06-08T12:00:00Z",
  farmMetrics: { 
    ndvi: 0.55, 
    soilMoisture: 35, 
    weatherForecast: "Light Overcast, 0.5mm rain expected in 5 days" 
  },
  marketMetrics: { 
    mandiPriceTrend: "Stable Market Average", 
    distressSaleRisk: "LOW" 
  },
  interventionPrescription: { 
    actionRequired: "", 
    estimatedCost: 0, 
    yieldLossRiskRupees: 0 
  },
  agentTelemetry: {
    satelliteVision: { status: 'idle' },
    weatherIntelligence: { status: 'idle' },
    soilSensor: { status: 'idle' },
    marketIntelligence: { status: 'idle' },
    interventionPlanning: { status: 'idle' },
    alertComm: { status: 'idle' }
  },
  consoleLogs: [],
  alertsLog: [],
  isInterventionModalOpen: false
};

/**
 * Context to hold our Global State Engine
 */
const DemoContext = createContext(null);

export const DemoProvider = ({ children }) => {
  const [state, setState] = useState(initialCropSentinelState);

  /**
   * Helper for applying deep immutable state partials cleanly.
   */
  const mutateState = useCallback((updater) => {
    setState((prev) => {
      const partial = typeof updater === 'function' ? updater(prev) : updater;
      return { ...prev, ...partial };
    });
  }, []);

  /**
   * REAL-TIME POLLING LOOP
   * Polls the backend /agent-status endpoint every 3 seconds.
   * Maps API statuses immutably to the frontend telemetry state.
   */
  useEffect(() => {
    let timeoutId;
    
    const pollAgentStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/agent-status');
        const apiData = response.data;
        
        // Map backend 'completed' to frontend 'success'
        const mapStatus = (apiStatus) => (apiStatus === 'completed' ? 'success' : apiStatus);
        
        mutateState((prev) => {
          const newAgentTelemetry = {
            ...prev.agentTelemetry,
            satelliteVision: { status: mapStatus(apiData.satellite) || prev.agentTelemetry.satelliteVision.status },
            weatherIntelligence: { status: mapStatus(apiData.weather) || prev.agentTelemetry.weatherIntelligence.status },
            soilSensor: { status: mapStatus(apiData.soil) || prev.agentTelemetry.soilSensor.status },
            marketIntelligence: { status: mapStatus(apiData.market) || prev.agentTelemetry.marketIntelligence.status },
            interventionPlanning: { status: mapStatus(apiData.intervention) || prev.agentTelemetry.interventionPlanning.status },
            alertComm: { status: mapStatus(apiData.alert) || prev.agentTelemetry.alertComm.status },
          };

          // Check if all agents are success to auto-resolve crisis mode
          const allResolved = Object.values(newAgentTelemetry).every(agent => agent.status === 'success');
          const nextSystemMode = (prev.systemMode === 'processing' && allResolved) ? 'crisis_resolved' : prev.systemMode;

          return {
            ...prev,
            systemMode: nextSystemMode,
            agentTelemetry: newAgentTelemetry
          };
        });
      } catch (error) {
        // Clean error handling so the polling loop doesn't crash the presentation
        console.error("CropSentinel Polling Error: Failed to fetch /agent-status.", error.message);
      } finally {
        timeoutId = setTimeout(pollAgentStatus, 3000);
      }
    };

    // Initiate polling loop
    pollAgentStatus();

    // Cleanup loop on unmount
    return () => clearTimeout(timeoutId);
  }, [mutateState]);

  /**
   * DASHBOARD POLLING LOOP
   * Polls the backend /dashboard endpoint every 5 seconds for telemetry.
   */
  useEffect(() => {
    let timeoutId;
    
    const pollDashboard = async () => {
      try {
        const response = await axios.get('http://localhost:8000/dashboard');
        const dbData = response.data;
        
        mutateState((prev) => ({
          farmMetrics: {
            ...prev.farmMetrics,
            ndvi: dbData.ndvi || prev.farmMetrics.ndvi,
            soilMoisture: dbData.soil_moisture || prev.farmMetrics.soilMoisture
          },
          interventionPrescription: {
            actionRequired: dbData.recommendation?.action || prev.interventionPrescription.actionRequired,
            estimatedCost: dbData.recommendation?.estimated_cost || prev.interventionPrescription.estimatedCost,
            yieldLossRiskRupees: dbData.recommendation?.yield_loss_risk || prev.interventionPrescription.yieldLossRiskRupees
          }
        }));
      } catch (error) {
        console.error("CropSentinel Polling Error: Failed to fetch /dashboard.", error.message);
      } finally {
        timeoutId = setTimeout(pollDashboard, 5000);
      }
    };

    pollDashboard();
    return () => clearTimeout(timeoutId);
  }, [mutateState]);

  /**
   * LIVE ANALYSIS TRIGGER
   * Fires the actual backend POST /run-analysis.
   * Instantly resets agents to 'running' for UI skeleton feedback.
   */
  const triggerLiveAnalysis = useCallback(async () => {
    // 1. Optimistic UI Update: Lock system and set agents to 'running'
    mutateState((prev) => ({
      isCrisisActive: true,
      systemMode: 'processing',
      consoleLogs: [
        ...prev.consoleLogs,
        "Coordinator: Initiating live backend analysis. Firing POST http://localhost:8000/run-analysis..."
      ],
      agentTelemetry: {
        satelliteVision: { status: 'running' },
        weatherIntelligence: { status: 'running' },
        soilSensor: { status: 'running' },
        marketIntelligence: { status: 'running' },
        interventionPlanning: { status: 'running' },
        alertComm: { status: 'running' }
      }
    }));

    // 2. Fire the backend POST request
    try {
      await axios.post('http://localhost:8000/run-analysis', {});
      
      mutateState((prev) => ({
        consoleLogs: [
          ...prev.consoleLogs,
          "Coordinator: Remote analysis triggered successfully. Polling /agent-status for resolution updates..."
        ]
      }));
    } catch (error) {
      console.error("Failed to trigger live analysis", error);
      mutateState((prev) => ({
        consoleLogs: [
          ...prev.consoleLogs,
          `[ERROR] Coordinator: Failed to trigger backend analysis: ${error.message}`
        ]
      }));
    }
  }, [mutateState]);

  // Actions
  const clearAlerts = useCallback(() => {
    mutateState({ alertsLog: [], consoleLogs: [] });
  }, [mutateState]);

  const openInterventionModal = useCallback(() => {
    mutateState({ isInterventionModalOpen: true });
  }, [mutateState]);

  const closeInterventionModal = useCallback(() => {
    mutateState({ isInterventionModalOpen: false });
  }, [mutateState]);

  const setCurrentFarm = useCallback((farmId) => {
    mutateState({ currentFarm: farmId });
  }, [mutateState]);

  return (
    <DemoContext.Provider value={{ 
      state, 
      triggerLiveAnalysis, 
      clearAlerts,
      openInterventionModal,
      closeInterventionModal,
      setCurrentFarm,
      // Alias for backward compatibility with the Dashboard component
      triggerCrisisSimulation: triggerLiveAnalysis 
    }}>
      {children}
    </DemoContext.Provider>
  );
};

/**
 * EXPORTABLE CUSTOM HOOK
 * Safely consumes the CropSentinel Global State Engine.
 */
export const useCropSentinel = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("Developer Error: `useCropSentinel` must be used within a `<DemoProvider>` component tree.");
  }
  return context;
};
