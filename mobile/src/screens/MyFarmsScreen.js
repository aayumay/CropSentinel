import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { materialTheme } from '../theme';
import { crops } from '../assets';
import { fetchFarms, getFarmHistory, fetchAgentStatus, fetchAlerts } from '../services';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useDemoState } from '../config/demoState';
import { DemoBanner } from '../components/DemoBanner';
import { translations } from '../constants/translations';
import { SessionExpiredDialog } from '../components/SessionExpiredDialog';

// Simple in-memory weather cache (30 minutes caching)
let weatherCache = {
  lastFetched: 0, // Timestamp in ms
  lat: null,
  lon: null,
  data: null,
};

const fetchWeather = async (latitude, longitude) => {
  const now = Date.now();
  const cacheAge = now - weatherCache.lastFetched;
  const isSameLocation = weatherCache.lat === latitude && weatherCache.lon === longitude;

  // Use cache if same location and age is less than 30 minutes (30 * 60 * 1000 = 1800000 ms)
  if (weatherCache.data && isSameLocation && cacheAge < 1800000) {
    return weatherCache.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=precipitation_probability`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Open-Meteo API error');
    const data = await res.json();

    if (data && data.current) {
      let rainProb = 0;
      if (data.hourly && data.hourly.precipitation_probability && data.hourly.precipitation_probability.length > 0) {
        // Find index matching current time or hour
        const currentHourStr = data.current.time.substring(0, 13) + ":00";
        const idx = data.hourly.time.findIndex(t => t.startsWith(currentHourStr));
        if (idx !== -1) {
          rainProb = data.hourly.precipitation_probability[idx];
        } else {
          rainProb = data.hourly.precipitation_probability[0];
        }
      }

      const formatted = {
        temp: `${Math.round(data.current.temperature_2m)}°C`,
        humidity: `${data.current.relative_humidity_2m}%`,
        rain: `${rainProb}%`,
        wind: `${Math.round(data.current.wind_speed_10m)} km/h`,
      };

      // Update cache
      weatherCache = {
        lastFetched: now,
        lat: latitude,
        lon: longitude,
        data: formatted,
      };

      return formatted;
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('Failed to fetch from Open-Meteo:', err);
    }
  }

  // Fallback if API fails and no cache exists
  return {
    temp: '31°C',
    humidity: '56%',
    rain: '10%',
    wind: '18 km/h',
  };
};

const triggerHapticSelection = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (e) {}
};

const FadeInCard = ({ children, delay = 0 }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      delay,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, delay]);

  const animatedStyle = {
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
    ],
  };

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const getHealthColor = (score) => {
  if (score >= 75) return materialTheme.colors.success;
  if (score >= 50) return materialTheme.colors.warning;
  return materialTheme.colors.error;
};

export const MyFarmsScreen = ({ navigation }) => {
  const { isDemoMode, isDroughtSimulated, language } = useDemoState();
  const t = translations[language] || translations.en;

  const [farms, setFarms] = useState([]);
  const [criticalCount, setCriticalCount] = useState(0);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

  const [weatherData, setWeatherData] = useState({
    temp: '31°C',
    humidity: '56%',
    rain: '10%',
    wind: '18 km/h',
  });

  const weatherItems = [
    { icon: 'sun', value: weatherData.temp, label: t.weatherTemp },
    { icon: 'droplet', value: weatherData.humidity, label: t.weatherHumidity },
    { icon: 'cloud-rain', value: weatherData.rain, label: t.weatherRain },
    { icon: 'wind', value: weatherData.wind, label: t.weatherWind },
  ];

  const loadDashboardData = async (isRef = false) => {
    if (isRef) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [farmsList, agentData, alertsData] = await Promise.all([
        isDemoMode ? Promise.resolve([]) : fetchFarms(),
        fetchAgentStatus(),
        fetchAlerts(),
      ]);

      // Determine coordinates for weather query
      let weatherLat = 22.3072;
      let weatherLon = 73.1812;
      if (isDemoMode) {
        weatherLat = 19.8762;
        weatherLon = 75.3433;
      } else if (farmsList && farmsList.length > 0) {
        weatherLat = Number(farmsList[0].latitude);
        weatherLon = Number(farmsList[0].longitude);
      }

      // Fetch live weather data from Open-Meteo
      const liveWeather = await fetchWeather(weatherLat, weatherLon);
      if (liveWeather) {
        setWeatherData(liveWeather);
      }

      // Calculate critical alerts count
      let critCount = 0;
      if (isDemoMode) {
        const critAlerts = (alertsData || []).filter(item => {
          const idStr = String(item.id);
          return idStr === '1' || idStr === '100' || item.severity === 'high';
        });
        critCount = critAlerts.length;
      } else {
        if (farmsList && farmsList.length > 0) {
          const critAlerts = (alertsData || []).filter(item => {
            return item.severity === 'high';
          });
          critCount = critAlerts.length;
        } else {
          critCount = 0;
        }
      }
      setCriticalCount(critCount);

      // Load farms list to determine highest-risk farm
      if (isDemoMode) {
        const sugarcaneHealth = isDroughtSimulated ? 41 : 78;
        const sugarcaneNdvi = isDroughtSimulated ? 0.22 : 0.65;
        const sugarcaneMoisture = isDroughtSimulated ? 11 : 48;
        const sugarcaneRisk = isDroughtSimulated ? 'high' : 'low';
        const sugarcaneZone = isDroughtSimulated ? 'drought' : 'healthy';

        const demoFarmsList = [
          {
            id: '1',
            name: 'Punjab Wheat Farm',
            cropType: 'Wheat',
            healthScore: 86,
            ndvi: 0.74,
            moisture: '42%',
            riskSeverity: 'low',
            zoneType: 'healthy',
            location: 'Punjab, India',
            recommendation: {
              action: 'Inspect crops and apply targeted treatment.',
              reason: 'Pest indicators exceed safe thresholds.',
              confidence: 88,
            }
          },
          {
            id: '2',
            name: 'Kaveri Delta Rice Farm',
            cropType: 'Rice',
            healthScore: 63,
            ndvi: 0.48,
            moisture: '28%',
            riskSeverity: 'medium',
            zoneType: 'moderate',
            location: 'Tamil Nadu, India',
            recommendation: {
              action: 'Improve drainage and delay irrigation.',
              reason: 'Excessive moisture may damage root systems.',
              confidence: 90,
            }
          },
          {
            id: '3',
            name: 'Marathwada Sugarcane Farm',
            cropType: 'Sugarcane',
            healthScore: sugarcaneHealth,
            ndvi: sugarcaneNdvi,
            moisture: `${sugarcaneMoisture}%`,
            riskSeverity: sugarcaneRisk,
            zoneType: sugarcaneZone,
            location: 'Maharashtra, India',
            recommendation: {
              action: 'Irrigate within 24 hours.',
              reason: 'Low moisture and declining NDVI detected.',
              confidence: 95,
            }
          }
        ];
        setFarms(demoFarmsList);
      } else {
        // Real mode: Parse farmsList and fetch history dynamically
        const mappedFarms = await Promise.all(
          (farmsList || []).map(async (farm) => {
            try {
              const histRes = await getFarmHistory(farm.id);
              if (histRes && histRes.history && histRes.history.length > 0) {
                const latest = histRes.history[0];
                const riskScore = latest.risk_score ?? 20;
                const healthScore = Math.max(0, Math.min(100, 100 - riskScore));
                const ndvi = latest.ndvi ?? 0.65;
                const riskLevel = (latest.risk_level || 'low').toLowerCase();

                // Derive a dynamic soil moisture percentage
                let moistureVal = '35%';
                if (riskLevel === 'high' || riskLevel === 'drought') {
                  moistureVal = '12%';
                } else if (riskLevel === 'medium' || riskLevel === 'moderate') {
                  moistureVal = '25%';
                } else {
                  moistureVal = `${Math.round(ndvi * 60)}%`;
                }

                return {
                  id: String(farm.id),
                  name: farm.farm_name,
                  cropType: farm.cropType || farm.crop_type || 'Wheat',
                  healthScore: healthScore,
                  ndvi: ndvi,
                  moisture: moistureVal,
                  riskSeverity: riskLevel,
                  zoneType: riskLevel === 'drought' || riskLevel === 'high' ? 'drought' : riskLevel === 'medium' || riskLevel === 'moderate' ? 'moderate' : 'healthy',
                  location: farm.location || `${Number(farm.latitude).toFixed(3)}°, ${Number(farm.longitude).toFixed(3)}°`,
                  recommendation: {
                    action: latest.recommendation || 'Continue standard monitoring',
                  }
                };
              }
            } catch (err) {
              if (__DEV__) {
                console.warn(`Failed to fetch history for farm ${farm.id}:`, err);
              }
            }
            // Safe fallback if history is not available or fails
            return {
              id: String(farm.id),
              name: farm.farm_name,
              cropType: farm.cropType || farm.crop_type || 'Wheat',
              healthScore: 80,
              ndvi: 0.65,
              moisture: '35%',
              riskSeverity: 'low',
              zoneType: 'healthy',
              location: farm.location || `${Number(farm.latitude).toFixed(3)}°, ${Number(farm.longitude).toFixed(3)}°`,
              recommendation: {
                action: 'Continue standard monitoring',
              }
            };
          })
        );
        setFarms(mappedFarms);
      }

      // Load agents status
      if (agentData) {
        const mappedAgents = [
          {
            name: 'Satellite Agent',
            status: agentData.satellite || 'completed',
            indicator: (agentData.satellite || 'completed') === 'completed' ? '#22C55E' : '#FEF3C7',
          },
          {
            name: 'Weather Agent',
            status: agentData.weather || 'completed',
            indicator: (agentData.weather || 'completed') === 'completed' ? '#22C55E' : '#FEF3C7',
          },
          {
            name: 'Soil Agent',
            status: agentData.soil || 'completed',
            indicator: (agentData.soil || 'completed') === 'completed' ? '#22C55E' : '#FEF3C7',
          },
        ];
        setAgents(mappedAgents);
      }
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        setSessionExpiredVisible(true);
        return;
      }
      if (__DEV__) {
        console.warn('Failed to load dashboard data:', err);
      }
      setError('Could not retrieve dashboard metrics. Please check connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [isDemoMode, isDroughtSimulated])
  );

  // Determine highest risk farm
  const highestRiskFarm = farms.length > 0
    ? farms.reduce((prev, curr) => (prev.healthScore < curr.healthScore) ? prev : curr, farms[0])
    : null;

  // Use highest risk farm recommendation as the latest AI recommendation
  const latestRec = highestRiskFarm ? highestRiskFarm.recommendation : null;

  // Show latest recommendation card if in demo mode, or if in production mode and a real backend recommendation exists
  const showRecommendationCard = isDemoMode 
    ? !!latestRec 
    : (!!latestRec && latestRec.action && latestRec.action !== 'Continue standard monitoring' && latestRec.action !== 'No action required.');

  const navigateToTab = (route) => {
    triggerHapticSelection();
    navigation.navigate(route);
  };

  if (loading && !refreshing && farms.length === 0) {
    return <LoadingState message="Fetching dashboard metrics..." />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <DemoBanner />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigateToTab('Settings')}>
            <Feather name="menu" size={22} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
          {isDemoMode && (
            <View style={styles.demoChip}>
              <Text style={styles.demoChipText}>{t.demoMode}: {isDemoMode ? 'ON' : 'OFF'}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigateToTab('AlertsFeed')}>
            <Feather name="bell" size={20} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
        </View>
        <Text style={styles.greeting}>{t.greeting}</Text>
        <Text style={styles.subtitle}>{t.subtitleHome}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboardData(true)}
            colors={[materialTheme.colors.primary]}
          />
        }
      >
        {/* Weather Row */}
        <View style={styles.weatherRow}>
          {weatherItems.map((item) => (
            <View key={item.label} style={styles.weatherCard}>
              <Feather name={item.icon} size={18} color={materialTheme.colors.primary} />
              <Text style={styles.weatherValue}>{item.value}</Text>
              <Text style={styles.weatherLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Critical Alerts Banner */}
        {farms.length > 0 && (
          <TouchableOpacity
            style={[
              styles.alertsBanner,
              criticalCount > 0 ? styles.alertsBannerCritical : styles.alertsBannerStable
            ]}
            onPress={() => navigateToTab('AlertsFeed')}
            activeOpacity={0.85}
          >
          <View style={styles.alertsBannerLeft}>
            <Feather
              name={criticalCount > 0 ? "alert-triangle" : "check-circle"}
              size={18}
              color={criticalCount > 0 ? materialTheme.colors.error : materialTheme.colors.success}
              style={{ marginRight: 8 }}
            />
            <Text style={[
              styles.alertsBannerText,
              criticalCount > 0 ? styles.alertsBannerTextCritical : styles.alertsBannerTextStable
            ]}>
              {criticalCount > 0
                ? `${criticalCount} ${t.criticalNotice}`
                : t.allStable
              }
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={16}
            color={criticalCount > 0 ? materialTheme.colors.error : materialTheme.colors.success}
          />
        </TouchableOpacity>
        )}

        {/* Highest-Risk Farm Highlight Card */}
        {highestRiskFarm ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t.highestRiskField}</Text>
            <TouchableOpacity
              style={[
                styles.highlightCard,
                { borderColor: getHealthColor(highestRiskFarm.healthScore) }
              ]}
              onPress={() => {
                triggerHapticSelection();
                navigation.navigate('FarmDetail', { farmId: Number(highestRiskFarm.id) });
              }}
              activeOpacity={0.9}
            >
              <View style={styles.highlightHeader}>
                <View style={styles.highlightCropInfo}>
                  <Image
                    source={crops[(highestRiskFarm.cropType || '').toLowerCase()] || crops.default}
                    style={styles.cropIcon}
                    resizeMode="contain"
                  />
                  <View>
                    <Text style={styles.highlightFarmName}>{highestRiskFarm.name}</Text>
                    <Text style={styles.highlightCropType}>{highestRiskFarm.cropType}</Text>
                  </View>
                </View>
                <View style={[styles.healthCircle, { borderColor: getHealthColor(highestRiskFarm.healthScore) }]}>
                  <Text style={styles.healthScoreText}>{highestRiskFarm.healthScore}</Text>
                  <Text style={styles.healthLabelText}>/100</Text>
                </View>
              </View>

              <View style={styles.highlightDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>NDVI</Text>
                  <Text style={styles.detailValue}>{highestRiskFarm.ndvi}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Moisture</Text>
                  <Text style={styles.detailValue}>{highestRiskFarm.moisture}</Text>
                </View>
                {highestRiskFarm.location && (
                  <>
                    <View style={styles.detailDivider} />
                    <View style={[styles.detailItem, { flex: 1.5 }]}>
                      <Text style={styles.detailLabel}>Location</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>{highestRiskFarm.location}</Text>
                    </View>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[styles.highlightBtn, { backgroundColor: getHealthColor(highestRiskFarm.healthScore) }]}
                onPress={() => {
                  triggerHapticSelection();
                  navigation.navigate('FarmDetail', { farmId: Number(highestRiskFarm.id) });
                }}
              >
                <Text style={styles.highlightBtnText}>{t.viewDetails}</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t.noFarms}</Text>
          </View>
        )}

        {/* Latest AI Recommendation Card */}
        {showRecommendationCard && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t.latestRecommendation}</Text>
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <View style={styles.recIconContainer}>
                  <Feather name="cpu" size={20} color={materialTheme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recommendationTitleText} numberOfLines={2}>
                    {latestRec.action}
                  </Text>
                  {isDemoMode && latestRec.reason && (
                    <Text style={{ fontSize: 13, color: materialTheme.colors.textSecondary, marginTop: 4, fontWeight: '500' }}>
                      {latestRec.reason} (Confidence: {latestRec.confidence}%)
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.recBtn}
                onPress={() => {
                  triggerHapticSelection();
                  navigation.navigate('InterventionDetail', { farmId: highestRiskFarm?.id });
                }}
              >
                <Text style={styles.recBtnText}>{t.viewInsights}</Text>
                <Feather name="bar-chart-2" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Agent Status Widget */}
        <View style={styles.agentStatusCard}>
          <Text style={styles.agentStatusTitle}>AI Agent Core</Text>
          <View style={styles.agentRow}>
            {agents.map((agent) => (
              <View key={agent.name} style={styles.agentItem}>
                <View style={[styles.agentIndicator, { backgroundColor: agent.indicator }]} />
                <View style={styles.agentInfo}>
                  <Text style={styles.agentName}>{agent.name}</Text>
                  <Text style={styles.agentStatusText}>{agent.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="home" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigateToTab('Farms')}>
          <Feather name="layers" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.farms}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigateToTab('InterventionDetail')}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.insights}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigateToTab('AlertsFeed')}>
          <Feather name="bell" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.alerts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigateToTab('Settings')}>
          <Feather name="user" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.profile}</Text>
        </TouchableOpacity>
      </View>
      <SessionExpiredDialog
        visible={sessionExpiredVisible}
        onConfirm={() => {
          setSessionExpiredVisible(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: materialTheme.colors.background,
  },
  header: {
    paddingHorizontal: materialTheme.spacing.lg,
    paddingTop: materialTheme.spacing.sm,
    paddingBottom: materialTheme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: materialTheme.spacing.md,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: materialTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: materialTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  demoChip: {
    backgroundColor: 'rgba(74, 124, 47, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 124, 47, 0.25)',
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: materialTheme.colors.primary,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: materialTheme.colors.textSecondary,
    marginTop: materialTheme.spacing.xs,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  weatherRow: {
    flexDirection: 'row',
    paddingHorizontal: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.sm,
    gap: materialTheme.spacing.sm,
  },
  weatherCard: {
    flex: 1,
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  weatherUnavailableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F6',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    borderRadius: materialTheme.borderRadius.card,
    paddingVertical: 18,
    marginHorizontal: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.sm,
  },
  weatherUnavailableText: {
    fontSize: 14,
    fontWeight: '600',
    color: materialTheme.colors.textSecondary,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginTop: materialTheme.spacing.sm,
  },
  weatherLabel: {
    fontSize: 11,
    color: materialTheme.colors.textSecondary,
    marginTop: materialTheme.spacing.xs,
  },
  errorContainer: {
    marginHorizontal: materialTheme.spacing.lg,
    padding: materialTheme.spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: materialTheme.spacing.md,
  },
  errorText: {
    color: materialTheme.colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  alertsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: materialTheme.spacing.lg,
    marginVertical: materialTheme.spacing.sm,
    borderWidth: 1,
  },
  alertsBannerCritical: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  alertsBannerStable: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  alertsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertsBannerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  alertsBannerTextCritical: {
    color: '#B91C1C',
  },
  alertsBannerTextStable: {
    color: '#15803D',
  },
  sectionContainer: {
    marginTop: materialTheme.spacing.sm,
    paddingHorizontal: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginBottom: 10,
  },
  emptyContainer: {
    paddingHorizontal: materialTheme.spacing.lg,
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: materialTheme.colors.textSecondary,
    fontSize: 14,
  },
  highlightCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  highlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  highlightCropInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropIcon: {
    width: 44,
    height: 44,
    marginRight: 12,
    backgroundColor: materialTheme.colors.surfaceVariant,
    borderRadius: 8,
  },
  highlightFarmName: {
    fontSize: 16,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  highlightCropType: {
    fontSize: 13,
    color: materialTheme.colors.textSecondary,
    marginTop: 1,
  },
  healthCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  healthScoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  healthLabelText: {
    fontSize: 9,
    color: materialTheme.colors.textSecondary,
    marginTop: -2,
  },
  highlightDetails: {
    flexDirection: 'row',
    backgroundColor: materialTheme.colors.surfaceVariant,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: materialTheme.colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  detailDivider: {
    width: 1,
    height: 20,
    backgroundColor: materialTheme.colors.outline,
  },
  highlightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
  },
  highlightBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  recommendationCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  recIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: materialTheme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    flex: 1,
  },
  recMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: materialTheme.colors.surfaceVariant,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  recMetric: {
    flex: 1,
    alignItems: 'center',
  },
  recMetricLabel: {
    fontSize: 9,
    color: materialTheme.colors.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  recMetricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: materialTheme.colors.primaryDark,
  },
  recMetricDivider: {
    width: 1,
    height: 20,
    backgroundColor: materialTheme.colors.outline,
    alignSelf: 'center',
  },
  recBtn: {
    backgroundColor: materialTheme.colors.primaryDark,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  recBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  agentStatusCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    marginHorizontal: materialTheme.spacing.lg,
    marginTop: materialTheme.spacing.sm,
    marginBottom: materialTheme.spacing.md,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  agentStatusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginBottom: 12,
  },
  agentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: materialTheme.colors.surfaceVariant,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  agentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 9,
    fontWeight: '700',
    color: materialTheme.colors.textSecondary,
  },
  agentStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginTop: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: materialTheme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: materialTheme.spacing.sm,
    paddingBottom: materialTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: materialTheme.colors.outline,
    zIndex: 100,
  },
  bottomNavItem: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  bottomNavItemActive: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  bottomNavText: {
    fontSize: 10,
    color: materialTheme.colors.textSecondary,
    fontWeight: '500',
  },
  bottomNavTextActive: {
    color: materialTheme.colors.primary,
    fontWeight: '700',
  },
});
