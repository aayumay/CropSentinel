import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl, Animated } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { materialTheme } from '../theme';
import { crops } from '../assets';
import { fetchDashboard, fetchAgentStatus, fetchAlerts } from '../services';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useDemoState } from '../config/demoState';
import { DemoBanner } from '../components/DemoBanner';
import { translations } from '../constants/translations';

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

const WEATHER = [
  { icon: 'sun', value: '31°C', label: 'Temp' },
  { icon: 'droplet', value: '56%', label: 'Humidity' },
  { icon: 'cloud-rain', value: '10%', label: 'Rain Chance' },
  { icon: 'wind', value: '18 km/h', label: 'Wind' },
];

const getHealthBadgeStyle = (score, t) => {
  if (score >= 75) {
    return {
      label: t.healthy || 'Healthy',
      backgroundColor: '#DCFCE7',
      color: materialTheme.colors.success,
    };
  }
  if (score >= 50) {
    return {
      label: t.warning || 'Warning',
      backgroundColor: '#FEF3C7',
      color: materialTheme.colors.warning,
    };
  }
  return {
    label: t.critical || 'Critical',
    backgroundColor: '#FEE2E2',
    color: materialTheme.colors.error,
  };
};

const getHealthColor = (score) => {
  if (score >= 75) return materialTheme.colors.success;
  if (score >= 50) return materialTheme.colors.warning;
  return materialTheme.colors.error;
};

const localTranslations = {
  en: {
    criticalAlertsCount: 'Critical Alerts',
    highestRiskField: 'Highest-Risk Field Highlight',
    latestRecommendation: 'Latest AI Recommendation',
    apply: 'Apply Recommendation',
    viewInsights: 'View Insights',
    viewDetails: 'View Details',
    allStable: 'All systems stable — 0 Critical Alerts',
    criticalNotice: 'Critical alert(s) require attention',
    estimatedCost: 'Est. Cost',
    yieldAtRisk: 'Yield at Risk',
    confidence: 'Confidence',
    noFarms: 'No fields registered yet.',
    manageFarms: 'Manage Farms',
  },
  hi: {
    criticalAlertsCount: 'गंभीर चेतावनी',
    highestRiskField: 'उच्चतम जोखिम वाला क्षेत्र',
    latestRecommendation: 'नवीनतम एआई सलाह',
    apply: 'सलाह लागू करें',
    viewInsights: 'इनसाइट्स देखें',
    viewDetails: 'विवरण देखें',
    allStable: 'सभी प्रणालियाँ स्थिर हैं — 0 गंभीर चेतावनी',
    criticalNotice: 'गंभीर चेतावनी (ओं) पर ध्यान देने की आवश्यकता है',
    estimatedCost: 'अनुमानित लागत',
    yieldAtRisk: 'जोखिम में उपज',
    confidence: 'एआई विश्वास',
    noFarms: 'अभी तक कोई खेत पंजीकृत नहीं है।',
    manageFarms: 'खेतों का प्रबंधन करें',
  }
};

export const MyFarmsScreen = ({ navigation }) => {
  const { isDemoMode, isDroughtSimulated, language } = useDemoState();
  const tGlobal = translations[language] || translations.en;
  const tLocal = localTranslations[language] || localTranslations.en;

  const [farms, setFarms] = useState([]);
  const [criticalCount, setCriticalCount] = useState(0);
  const [recommendation, setRecommendation] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = async (isRef = false) => {
    if (isRef) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [dashData, agentData, alertsData] = await Promise.all([
        fetchDashboard(),
        fetchAgentStatus(),
        fetchAlerts(),
      ]);

      // Calculate critical alerts count
      const critAlerts = (alertsData || []).filter(item => {
        const idStr = String(item.id);
        return idStr === '1' || idStr === '100' || item.severity === 'high';
      });
      setCriticalCount(critAlerts.length);

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
              action: 'Continue current irrigation schedule',
              estimated_cost: 0,
              yield_loss_risk: 0,
              confidence: 95,
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
              action: 'Increase irrigation by 20% over next 5 days',
              estimated_cost: 520,
              yield_loss_risk: 9500,
              confidence: 85,
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
              action: isDroughtSimulated ? 'Increase irrigation within 48 hours.' : 'Continue standard irrigation',
              estimated_cost: isDroughtSimulated ? 1200 : 0,
              yield_loss_risk: isDroughtSimulated ? 45000 : 0,
              confidence: isDroughtSimulated ? 91 : 95,
            }
          }
        ];
        setFarms(demoFarmsList);
      } else {
        // Real mode: Parse dashboard response
        if (dashData) {
          if (dashData.farm) {
            const singleFarm = {
              id: String(dashData.farm.id || 1),
              name: dashData.farm.name || 'Marathwada Sugarcane Farm',
              cropType: dashData.farm.crop_type || 'sugarcane',
              healthScore: dashData.farm_health_score ?? 72,
              ndvi: dashData.ndvi ?? 0.21,
              moisture: `${dashData.soil_moisture ?? 18}%`,
              riskSeverity: (dashData.weather_risk ?? 0.65) > 0.6 ? 'high' : (dashData.weather_risk ?? 0.65) > 0.3 ? 'medium' : 'low',
              zoneType: (dashData.weather_risk ?? 0.65) > 0.6 ? 'drought' : 'healthy',
              location: dashData.farm.location || 'Maharashtra, India',
              recommendation: {
                action: dashData.recommendation?.action || 'Irrigate within 48 hours',
                estimated_cost: dashData.recommendation?.estimated_cost ?? 1200,
                yield_loss_risk: dashData.recommendation?.yield_loss_risk ?? 45000,
                confidence: dashData.recommendation?.confidence ?? 91,
              }
            };
            setFarms([singleFarm]);
          } else {
            const rawFarms = dashData.farms || [];
            const mappedFarms = rawFarms.map(f => ({
              id: String(f.id),
              name: f.name,
              cropType: f.cropType || f.crop_type || 'Wheat',
              healthScore: f.healthScore || f.health_score || 72,
              ndvi: f.ndvi || 0.61,
              moisture: f.moisture || 'Low',
              riskSeverity: f.riskSeverity || (f.zone_type === 'drought' ? 'high' : 'low'),
              zoneType: f.zoneType || f.zone_type || 'drought',
              location: f.location || undefined,
              recommendation: f.recommendation || {
                action: 'Continue standard monitoring',
                estimated_cost: 0,
                yield_loss_risk: 0,
                confidence: 95
              }
            }));
            setFarms(mappedFarms);
          }
        }
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
      console.warn('Failed to load dashboard data:', err);
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

  if (loading && !refreshing && farms.length === 0) {
    return <LoadingState message="Fetching dashboard metrics..." />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <DemoBanner />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Settings')}>
            <Feather name="menu" size={22} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.demoChip}>
            <Text style={styles.demoChipText}>Demo Mode: {isDemoMode ? 'ON' : 'OFF'}</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('AlertsFeed')}>
            <Feather name="bell" size={20} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
        </View>
        <Text style={styles.greeting}>Good Morning, Farmer 🌿</Text>
        <Text style={styles.subtitle}>Here's what's happening on your farms</Text>
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
          {WEATHER.map((item) => (
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
        <TouchableOpacity
          style={[
            styles.alertsBanner,
            criticalCount > 0 ? styles.alertsBannerCritical : styles.alertsBannerStable
          ]}
          onPress={() => navigation.navigate('AlertsFeed')}
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
                ? `${criticalCount} ${tLocal.criticalNotice}`
                : tLocal.allStable
              }
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={16}
            color={criticalCount > 0 ? materialTheme.colors.error : materialTheme.colors.success}
          />
        </TouchableOpacity>

        {/* Highest-Risk Farm Highlight Card */}
        {highestRiskFarm ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{tLocal.highestRiskField}</Text>
            <TouchableOpacity
              style={[
                styles.highlightCard,
                { borderColor: getHealthColor(highestRiskFarm.healthScore) }
              ]}
              onPress={() => navigation.navigate('FarmDetail', { farm: highestRiskFarm })}
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
                onPress={() => navigation.navigate('FarmDetail', { farm: highestRiskFarm })}
              >
                <Text style={styles.highlightBtnText}>{tLocal.viewDetails}</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{tLocal.noFarms}</Text>
          </View>
        )}

        {/* Latest AI Recommendation Card */}
        {latestRec && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{tLocal.latestRecommendation}</Text>
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <View style={styles.recIconContainer}>
                  <Feather name="cpu" size={20} color={materialTheme.colors.primary} />
                </View>
                <Text style={styles.recommendationTitleText} numberOfLines={2}>
                  {latestRec.action}
                </Text>
              </View>

              <View style={styles.recMetricsRow}>
                <View style={styles.recMetric}>
                  <Text style={styles.recMetricLabel}>{tLocal.estimatedCost}</Text>
                  <Text style={styles.recMetricValue}>
                    {latestRec.estimated_cost > 0 ? `₹${latestRec.estimated_cost}` : 'Free'}
                  </Text>
                </View>
                <View style={styles.recMetricDivider} />
                <View style={styles.recMetric}>
                  <Text style={styles.recMetricLabel}>{tLocal.yieldAtRisk}</Text>
                  <Text style={styles.recMetricValue}>
                    {latestRec.yield_loss_risk > 0 ? `₹${latestRec.yield_loss_risk}` : 'None'}
                  </Text>
                </View>
                <View style={styles.recMetricDivider} />
                <View style={styles.recMetric}>
                  <Text style={styles.recMetricLabel}>{tLocal.confidence}</Text>
                  <Text style={styles.recMetricValue}>{latestRec.confidence}%</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.recBtn}
                onPress={() => navigation.navigate('InterventionDetail')}
              >
                <Text style={styles.recBtnText}>{tLocal.viewInsights}</Text>
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
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>{tGlobal.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Farms')}>
          <Feather name="layers" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{tGlobal.farms}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('InterventionDetail')}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{tGlobal.insights}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('AlertsFeed')}>
          <Feather name="bell" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{tGlobal.alerts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Settings')}>
          <Feather name="user" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{tGlobal.profile}</Text>
        </TouchableOpacity>
      </View>
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
