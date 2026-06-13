import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchFarms, analyzeFarm, fetchProfile } from '../services/api';

const AppContext = createContext(null);

const defaultPreferences = {
  units: 'metric',
  autoSync: true,
  location: true,
  analytics: false,
  notifications: {
    push: true, email: false, sms: true,
    drought: true, pest: true, weather: true,
    ndvi: false, market: false
  }
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    token: localStorage.getItem('cs_token') || null,
    profileData: {
      photo: localStorage.getItem('cs_profile_photo') || null
    },
    farms: [],
    activeFarmId: null,
    activeAnalysis: null,
    preferences: JSON.parse(localStorage.getItem('cs_preferences')) || defaultPreferences,
    isLoading: true,
    error: null
  });

  // Persist preferences whenever they change
  useEffect(() => {
    localStorage.setItem('cs_preferences', JSON.stringify(state.preferences));
  }, [state.preferences]);

  // Fetch Profile Data
  useEffect(() => {
    if (state.token) {
      async function loadProfile() {
        try {
          const profile = await fetchProfile();
          const localPhoto = localStorage.getItem('cs_profile_photo');
          if (profile) {
            setState(prev => ({ 
              ...prev, 
              profileData: { ...prev.profileData, ...profile, photo: localPhoto || prev.profileData?.photo } 
            }));
          }
        } catch (e) {
          console.error("Failed to load profile", e);
        }
      }
      loadProfile();

      try {
        if (state.token && state.token.includes('.')) {
          const payload = JSON.parse(atob(state.token.split('.')[1]));
          if (payload && payload.phone_number) {
            setState(prev => ({ 
              ...prev, 
              profileData: { ...prev.profileData, phone: payload.phone_number } 
            }));
          }
        }
      } catch (e) {
        console.warn("Failed to parse JWT", e);
      }
    }
  }, [state.token]);

  // Fetch unified farms list and initial analysis
  useEffect(() => {
    async function loadData() {
      try {
        const farmsList = await fetchFarms();
        if (Array.isArray(farmsList) && farmsList.length > 0) {
          const primaryFarm = farmsList[0];
          
          // Instantly unblock the UI with the basic farm list
          setState(prev => ({
            ...prev,
            farms: farmsList,
            activeFarmId: primaryFarm.id,
            activeAnalysis: null, // Still loading
            isLoading: false
          }));

          // FETCH HEAVY AI ANALYSIS IN THE BACKGROUND
          // Fetch only the primary farm first to show data quickly
          try {
            const primaryAnalysis = await analyzeFarm(primaryFarm.latitude || 20.93, primaryFarm.longitude || 77.77, primaryFarm.id);
            
            setState(prev => {
              const updatedFarms = prev.farms.map(f => 
                f.id === primaryFarm.id ? { ...f, analysis: primaryAnalysis } : f
              );
              return {
                ...prev,
                farms: updatedFarms,
                activeAnalysis: primaryAnalysis
              };
            });

            // Lazy load the rest sequentially to avoid throttling the network/backend
            const loadRemainingFarms = async () => {
              const remainingFarms = farmsList.slice(1);
              for (const f of remainingFarms) {
                // Add a short delay to spread the load
                await new Promise(resolve => setTimeout(resolve, 500));
                try {
                  const analysis = await analyzeFarm(f.latitude || 20.93, f.longitude || 77.77, f.id);
                  setState(prev => {
                    const updatedFarms = prev.farms.map(farm => 
                      farm.id === f.id ? { ...farm, analysis } : farm
                    );
                    // If the user clicked on this farm while it was loading, update activeAnalysis to break the loading screen
                    const isActive = String(prev.activeFarmId) === String(f.id);
                    return { 
                      ...prev, 
                      farms: updatedFarms,
                      activeAnalysis: isActive ? analysis : prev.activeAnalysis
                    };
                  });
                } catch (err) {
                  console.error("Background analysis failed for farm", f.id, err);
                }
              }
            };
            loadRemainingFarms();

          } catch (err) {
            console.error("Primary analysis failed", err);
          }

        } else {
          setState(prev => ({ ...prev, farms: [], isLoading: false, error: null }));
        }
      } catch (error) {
        console.error("Failed to load farms", error);
        setState(prev => ({ ...prev, isLoading: false, error: error.message || 'Backend is currently unavailable.' }));
      }
    }
    loadData();
  }, []);

  const setCurrentFarm = (farmId) => {
    setState(prev => {
      const farm = prev.farms.find(f => String(f.id) === String(farmId));
      if (!farm) return prev;
      
      // Instantly switch context using the background-loaded analysis!
      return {
        ...prev,
        activeFarmId: farmId,
        activeAnalysis: farm.analysis || null
      };
    });
  };

  return (
    <AppContext.Provider value={{ state, setCurrentFarm, setState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useCropSentinel = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useCropSentinel must be used within an AppProvider");
  }
  return context;
};
