import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl, Animated, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { materialTheme } from '../theme';
import { crops } from '../assets';
import { USE_MOCK_DATA } from '../config/environment';
import { fetchDashboard, fetchAgentStatus } from '../services';
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

const getRiskLabel = (severity) => {
  if (severity === 'high') return 'Drought Risk';
  if (severity === 'medium') return 'Moderate Risk';
  return 'Healthy';
};

const getRiskBadgeStyle = (severity) => {
  if (severity === 'high') return { backgroundColor: '#FEE2E2', color: materialTheme.colors.error };
  if (severity === 'medium') return { backgroundColor: '#FEF3C7', color: materialTheme.colors.warning };
  return { backgroundColor: '#DCFCE7', color: materialTheme.colors.success };
};

const getHealthColor = (score) => {
  if (score >= 80) return materialTheme.colors.success;
  if (score >= 60) return materialTheme.colors.warning;
  return materialTheme.colors.error;
};

// Loading Skeleton Components
const SkeletonSummaryCard = () => (
  <View style={styles.skeletonSummaryCard}>
    <View style={styles.skeletonSummaryTitle} />
    <View style={styles.skeletonSummaryMetrics}>
      <View style={styles.skeletonSummaryMetric} />
      <View style={styles.skeletonSummaryMetric} />
      <View style={styles.skeletonSummaryMetric} />
    </View>
    <View style={styles.skeletonRecommendation} />
  </View>
);

const SkeletonAgentCard = () => (
  <View style={styles.skeletonAgentCard}>
    <View style={styles.skeletonAgentTitle} />
    <View style={styles.skeletonAgentItems}>
      <View style={styles.skeletonAgentItem} />
      <View style={styles.skeletonAgentItem} />
      <View style={styles.skeletonAgentItem} />
    </View>
  </View>
);

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonLeft} />
    <View style={styles.skeletonCenter}>
      <View style={styles.skeletonLineShort} />
      <View style={styles.skeletonLineLong} />
    </View>
    <View style={styles.skeletonRight} />
  </View>
);

export const MyFarmsScreen = ({ navigation }) => {
  const { isDemoMode, isDroughtSimulated, language } = useDemoState();
  const t = translations[language] || translations.en;
  const scrollViewRef = React.useRef(null);
  const [farms, setFarms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const handleFarmMenuPress = (farm) => {
    Alert.alert(
      `${farm.name} Options`,
      "Choose an action:",
      [
        { text: "View Details", onPress: () => navigation.navigate('FarmDetail', { farm }) },
        { text: "Edit Farm", onPress: () => navigation.navigate('AddField', { farm }) },
        { text: "Delete Farm", style: "destructive", onPress: () => handleDeleteFarm(farm) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleDeleteFarm = (farm) => {
    Alert.alert(
      "Delete Farm",
      `Are you sure you want to delete ${farm.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            setFarms(prev => prev.filter(f => f.id !== farm.id));
            Alert.alert("Deleted", "Farm deleted successfully.");
          } 
        }
      ]
    );
  };

  const loadDashboardData = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const [dashData, agentData] = await Promise.all([
        fetchDashboard(),
        fetchAgentStatus(),
      ]);
      
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
          };

          const mappedSummary = {
            healthScore: dashData.farm_health_score ?? 72,
            ndvi: dashData.ndvi ?? 0.21,
            moisture: `${dashData.soil_moisture ?? 18}%`,
            recommendation: dashData.recommendation?.action || 'Irrigate within 48 hours',
          };

          setFarms([singleFarm]);
          setSummary(mappedSummary);
        } else {
          // Pre-existing mock data structure fallback (e.g. from mockData)
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
          }));

          const mappedSummary = dashData.summary ? {
            healthScore: dashData.summary.healthScore || dashData.summary.health_score || 80,
            ndvi: dashData.summary.ndvi || 0.58,
            moisture: dashData.summary.moisture || 'Optimal',
            recommendation: dashData.summary.recommendation || 'All systems stable.',
          } : null;

          setFarms(mappedFarms);
          setSummary(mappedSummary);
        }
      } else {
        throw new Error('No dashboard data received');
      }

      if (agentData) {
        // Map agent statuses
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

  useEffect(() => {
    loadDashboardData();
  }, [isDemoMode, isDroughtSimulated]);

  if (loading && !refreshing && farms.length === 0) {
    return <LoadingState message="Fetching farm data..." />;
  }

  if (error && farms.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning, Farmer 🌿</Text>
        </View>
        <ErrorState message={error} onRetry={() => loadDashboardData(false)} />
      </SafeAreaView>
    );
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
          {USE_MOCK_DATA && (
            <View style={styles.demoChip}>
              <Text style={styles.demoChipText}>Using Demo Data</Text>
            </View>
          )}
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('AlertsFeed')}>
            <Feather name="bell" size={20} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
        </View>
        <Text style={styles.greeting}>Good Morning, Farmer 🌿</Text>
        <Text style={styles.subtitle}>Here's what's happening on your farms</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
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
              {item.icon === 'sun' || item.icon === 'droplet' || item.icon === 'cloud-rain' || item.icon === 'wind' ? (
                <Feather name={item.icon} size={18} color={materialTheme.colors.primary} />
              ) : (
                <MaterialCommunityIcons name={item.icon} size={18} color={materialTheme.colors.primary} />
              )}
              <Text style={styles.weatherValue}>{item.value}</Text>
              <Text style={styles.weatherLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <View style={styles.skeletonContainer}>
            <SkeletonSummaryCard />
            <SkeletonAgentCard />
            <Text style={styles.loadingFarmsText}>Loading Farms...</Text>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <>
            {/* Summary Card */}
            {summary && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Field Health Summary</Text>
                <View style={styles.summaryMetrics}>
                  <View style={styles.summaryMetric}>
                    <Text style={styles.summaryMetricLabel}>Avg Health</Text>
                    <Text style={styles.summaryMetricValue}>{summary.healthScore}/100</Text>
                  </View>
                  <View style={styles.summaryMetricDivider} />
                  <View style={styles.summaryMetric}>
                    <Text style={styles.summaryMetricLabel}>Avg NDVI</Text>
                    <Text style={styles.summaryMetricValue}>{summary.ndvi}</Text>
                  </View>
                  <View style={styles.summaryMetricDivider} />
                  <View style={styles.summaryMetric}>
                    <Text style={styles.summaryMetricLabel}>Moisture</Text>
                    <Text style={styles.summaryMetricValue}>{summary.moisture}</Text>
                  </View>
                </View>
                <View style={styles.recommendationBox}>
                  <Feather name="cpu" size={16} color={materialTheme.colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.recommendationText} numberOfLines={2}>
                    AI: {summary.recommendation}
                  </Text>
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

            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.myFarms}</Text>
              <Text style={styles.sectionCount}>
                {farms.length} Farms • 1 Alert
              </Text>
            </View>

            <View style={styles.farmsContainer}>
              {farms.map((item, index) => {
                const riskBadge = getRiskBadgeStyle(item.riskSeverity);
                return (
                  <FadeInCard key={item.id} delay={index * 150}>
                    <TouchableOpacity
                      style={styles.farmCard}
                      onPress={() => navigation.navigate('FarmDetail', { farm: item })}
                    >
                      <View style={styles.farmCardLeft}>
                        <Image
                          source={crops[(item.cropType || '').toLowerCase()] || crops.default}
                          style={styles.farmCropImage}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={styles.farmCardCenter}>
                        <Text style={styles.farmName}>{item.name}</Text>
                        <Text style={styles.farmCropType}>{item.cropType}</Text>
                        <View style={[styles.riskBadge, { backgroundColor: riskBadge.backgroundColor }]}>
                          <Text style={[styles.riskBadgeText, { color: riskBadge.color }]}>
                            {getRiskLabel(item.riskSeverity)}
                          </Text>
                        </View>
                        <View style={styles.farmStats}>
                          <View style={styles.farmStat}>
                            <Text style={styles.farmStatLabel}>NDVI</Text>
                            <Text style={styles.farmStatValue}>{item.ndvi}</Text>
                          </View>
                          <View style={styles.farmStatDivider} />
                          <View style={styles.farmStat}>
                            <Text style={styles.farmStatLabel}>Moisture</Text>
                            <Text style={styles.farmStatValue}>{item.moisture}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.farmCardRight}>
                        <TouchableOpacity 
                          style={styles.moreMenuBtn} 
                          onPress={(e) => {
                            e.stopPropagation();
                            handleFarmMenuPress(item);
                          }}
                        >
                          <Feather name="more-vertical" size={18} color={materialTheme.colors.textSecondary} />
                        </TouchableOpacity>
                        <View style={[styles.healthCircle, { borderColor: getHealthColor(item.healthScore) }]}>
                          <Text style={styles.healthScore}>{item.healthScore}</Text>
                          <Text style={styles.healthLabel}>/100</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </FadeInCard>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddField')}>
        <Feather name="plus" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom Nav Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItemActive} onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}>
          <Feather name="home" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}>
          <Feather name="layers" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.farms}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('InterventionDetail')}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.insights}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('AlertsFeed')}>
          <Feather name="bell" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.alerts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Settings')}>
          <Feather name="user" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.profile}</Text>
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
    paddingBottom: 120,
  },
  weatherRow: {
    flexDirection: 'row',
    paddingHorizontal: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.md,
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
  summaryCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.lg,
    marginHorizontal: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.md,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginBottom: 12,
  },
  summaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryMetric: {
    alignItems: 'center',
    flex: 1,
  },
  summaryMetricLabel: {
    fontSize: 11,
    color: materialTheme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  summaryMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: materialTheme.colors.outline,
    alignSelf: 'center',
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: materialTheme.colors.surfaceVariant,
    padding: 10,
    borderRadius: 8,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '600',
    color: materialTheme.colors.primaryDark,
    flex: 1,
  },
  agentStatusCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.lg,
    marginHorizontal: materialTheme.spacing.lg,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: materialTheme.spacing.lg,
    marginTop: materialTheme.spacing.sm,
    marginBottom: materialTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  sectionCount: {
    fontSize: 13,
    color: materialTheme.colors.textSecondary,
    fontWeight: '500',
  },
  farmsContainer: {
    paddingHorizontal: materialTheme.spacing.lg,
  },
  farmCard: {
    flexDirection: 'row',
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    marginBottom: materialTheme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  farmCardLeft: {
    width: 64,
    height: 64,
    borderRadius: materialTheme.borderRadius.md,
    backgroundColor: materialTheme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: materialTheme.spacing.md,
    overflow: 'hidden',
  },
  farmCropImage: {
    width: 56,
    height: 56,
  },
  farmCardCenter: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  farmCropType: {
    fontSize: 13,
    color: materialTheme.colors.textSecondary,
    marginTop: 2,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: materialTheme.borderRadius.full,
    marginTop: materialTheme.spacing.sm,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  farmStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: materialTheme.spacing.sm,
    gap: materialTheme.spacing.md,
  },
  farmStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  farmStatLabel: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
  },
  farmStatValue: {
    fontSize: 12,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  farmStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: materialTheme.colors.outline,
  },
  farmCardRight: {
    marginLeft: materialTheme.spacing.md,
  },
  healthCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialTheme.colors.surface,
  },
  healthScore: {
    fontSize: 18,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  healthLabel: {
    fontSize: 10,
    color: materialTheme.colors.textSecondary,
    marginTop: -2,
  },
  fab: {
    position: 'absolute',
    right: materialTheme.spacing.lg,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: materialTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
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
  // Skeleton Styles
  skeletonContainer: {
    paddingHorizontal: materialTheme.spacing.lg,
  },
  skeletonSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E0',
    opacity: 0.6,
  },
  skeletonSummaryTitle: {
    width: '40%',
    height: 14,
    borderRadius: 6,
    backgroundColor: '#F5F5F0',
    marginBottom: 16,
  },
  skeletonSummaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skeletonSummaryMetric: {
    width: '25%',
    height: 36,
    borderRadius: 6,
    backgroundColor: '#F5F5F0',
  },
  skeletonRecommendation: {
    width: '100%',
    height: 36,
    borderRadius: 6,
    backgroundColor: '#F5F5F0',
  },
  skeletonAgentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E0',
    opacity: 0.6,
  },
  skeletonAgentTitle: {
    width: '30%',
    height: 14,
    borderRadius: 6,
    backgroundColor: '#F5F5F0',
    marginBottom: 16,
  },
  skeletonAgentItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  skeletonAgentItem: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F5F0',
  },
  loadingFarmsText: {
    fontSize: 13,
    fontWeight: '600',
    color: materialTheme.colors.textSecondary,
    marginVertical: 12,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E0',
    opacity: 0.6,
    height: 96,
  },
  skeletonLeft: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F5F5F0',
  },
  skeletonCenter: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    gap: 8,
  },
  skeletonLineShort: {
    width: '40%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F5F5F0',
  },
  skeletonLineLong: {
    width: '80%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F5F5F0',
  },
  skeletonRight: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F0',
    alignSelf: 'center',
  },
  moreMenuBtn: {
    position: 'absolute',
    top: -6,
    right: -10,
    padding: 8,
    zIndex: 10,
  },
});
