import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { materialTheme } from '../theme';
import { crops } from '../assets';
import { fetchDashboard } from '../services';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

const getHealthColor = (score) => {
  if (score >= 80) return materialTheme.colors.success;
  if (score >= 60) return materialTheme.colors.warning;
  return materialTheme.colors.error;
};

export const FarmDetailScreen = ({ navigation, route }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboard();
      if (data) {
        setDashboardData(data);
      } else {
        throw new Error('No dashboard data received');
      }
    } catch (err) {
      console.warn('Failed to load dashboard in FarmDetailScreen:', err);
      setError('Could not retrieve latest farm metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const farmFromRoute = route.params?.farm || {
    id: 1,
    name: 'North Field',
    cropType: 'Wheat',
    healthScore: 72,
    ndvi: 0.61,
    moisture: 'Low',
    droughtRisk: 'High',
    riskSeverity: 'high',
  };

  const farmData = dashboardData ? {
    id: dashboardData.farm?.id || farmFromRoute.id,
    name: dashboardData.farm?.name || farmFromRoute.name,
    cropType: dashboardData.farm?.crop_type || farmFromRoute.cropType,
    healthScore: dashboardData.farm_health_score ?? farmFromRoute.healthScore,
    ndvi: dashboardData.ndvi ?? farmFromRoute.ndvi,
    moisture: dashboardData.soil_moisture !== undefined ? `${dashboardData.soil_moisture}%` : farmFromRoute.moisture,
    weatherRisk: dashboardData.weather_risk !== undefined ? `${Math.round(dashboardData.weather_risk * 100)}%` : farmFromRoute.droughtRisk,
    marketRisk: dashboardData.market_risk !== undefined ? `${Math.round(dashboardData.market_risk * 100)}%` : '40%',
    lastUpdated: dashboardData.last_updated ? new Date(dashboardData.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2 hrs ago',
    riskSeverity: (dashboardData.weather_risk ?? 0.65) > 0.6 ? 'high' : 'low',
    zoneType: (dashboardData.weather_risk ?? 0.65) > 0.6 ? 'drought' : 'healthy',
  } : {
    id: farmFromRoute.id,
    name: farmFromRoute.name,
    cropType: farmFromRoute.cropType,
    healthScore: farmFromRoute.healthScore,
    ndvi: farmFromRoute.ndvi,
    moisture: farmFromRoute.moisture,
    weatherRisk: farmFromRoute.droughtRisk || 'High',
    marketRisk: '40%',
    lastUpdated: '2 hrs ago',
    riskSeverity: farmFromRoute.riskSeverity || 'high',
    zoneType: farmFromRoute.zoneType || 'drought',
  };

  const zoneType = farmData.zoneType;

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <LoadingState message="Fetching farm details..." />
      </SafeAreaView>
    );
  }

  const getZoneChipStyle = (zoneType) => {
    const type = zoneType ? zoneType.toLowerCase() : '';
    if (type === 'healthy' || type.includes('health')) {
      return {
        backgroundColor: '#DCFCE7',
        color: materialTheme.colors.success,
        label: 'Healthy',
      };
    }
    if (type === 'drought' || type.includes('drought')) {
      return {
        backgroundColor: '#FEE2E2',
        color: materialTheme.colors.error,
        label: 'Drought',
      };
    }
    if (type === 'water stress' || type === 'water_stress' || type.includes('water') || type.includes('stress')) {
      return {
        backgroundColor: '#FEF3C7',
        color: materialTheme.colors.warning,
        label: 'Water Stress',
      };
    }
    return {
      backgroundColor: materialTheme.colors.primaryContainer,
      color: materialTheme.colors.primary,
      label: zoneType ? zoneType.charAt(0).toUpperCase() + zoneType.slice(1) : 'Unknown',
    };
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{farmData.name}</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
          <Feather name="settings" size={20} color={materialTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={14} color={materialTheme.colors.error} style={{ marginRight: 6 }} />
            <Text style={styles.errorBannerText}>{error} Using offline fallback data.</Text>
          </View>
        )}

        <View style={styles.cropHeroCard}>
          <View style={styles.cropHeroInfo}>
            <Text style={styles.cropHeroLabel}>Crop Type</Text>
            <Text style={styles.cropHeroType}>{farmData.cropType}</Text>
          </View>
          <Image
            source={crops[(farmData.cropType || '').toLowerCase()] || crops.default}
            style={styles.cropHeroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.healthCardLabel}>Health Score</Text>
          <View style={[styles.healthCircle, { borderColor: getHealthColor(farmData.healthScore) }]}>
            <Text style={styles.healthScore}>{farmData.healthScore}</Text>
            <Text style={styles.healthDivider}>/100</Text>
          </View>
          <View style={[styles.zoneChip, { backgroundColor: getZoneChipStyle(zoneType).backgroundColor }]}>
            <Text style={[styles.zoneChipText, { color: getZoneChipStyle(zoneType).color }]}>
              {getZoneChipStyle(zoneType).label}
            </Text>
          </View>
        </View>

        <View style={styles.lastUpdatedContainer}>
          <Feather name="clock" size={12} color={materialTheme.colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={styles.lastUpdatedText}>Last Updated: {farmData.lastUpdated}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>NDVI</Text>
            <Text style={styles.statValue}>{farmData.ndvi}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Moisture</Text>
            <Text style={styles.statValue}>{farmData.moisture}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Weather Risk</Text>
            <Text style={styles.statValue}>{farmData.weatherRisk}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Market Risk</Text>
            <Text style={styles.statValue}>{farmData.marketRisk}</Text>
          </View>
        </View>

        <View style={styles.mapCard}>
          <Image
            source={require('../assets/satellite-farm.png')}
            style={styles.mapImage}
            resizeMode="cover"
          />
          <View style={styles.polygonOverlayContainer}>
            <View style={styles.diamondPolygon} />
          </View>
          <View style={styles.mapLegendChip}>
            <Text style={styles.mapLegendChipText}>Satellite View</Text>
          </View>
        </View>

        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>NDVI Trend (Coming D4)</Text>
            <Text style={styles.trendValue}>{farmData.ndvi}</Text>
          </View>
          <View style={styles.trendChart}>
            <View style={styles.trendLine} />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('InterventionDetail', { farmId: farmData.id })}>
          <Text style={styles.primaryBtnText}>View Intervention</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('MyFarms')}>
          <Feather name="home" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="layers" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Farms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('InterventionDetail')}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('AlertsFeed')}>
          <Feather name="bell" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Settings')}>
          <Feather name="user" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Profile</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: materialTheme.spacing.lg,
    paddingVertical: materialTheme.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: materialTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: materialTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  content: {
    paddingHorizontal: materialTheme.spacing.lg,
    paddingBottom: materialTheme.spacing.xxl,
  },
  cropHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.md,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  cropHeroInfo: {
    flex: 1,
  },
  cropHeroLabel: {
    fontSize: 13,
    color: materialTheme.colors.textSecondary,
    marginBottom: 4,
  },
  cropHeroType: {
    fontSize: 24,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  cropHeroImage: {
    width: 100,
    height: 100,
  },
  healthCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  healthCardLabel: {
    fontSize: 14,
    color: materialTheme.colors.textSecondary,
    marginBottom: materialTheme.spacing.md,
    fontWeight: '500',
  },
  healthCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialTheme.colors.surface,
    marginBottom: materialTheme.spacing.md,
  },
  healthScore: {
    fontSize: 36,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  healthDivider: {
    fontSize: 14,
    color: materialTheme.colors.textSecondary,
    marginTop: -4,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: materialTheme.spacing.sm,
    marginBottom: materialTheme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  statLabel: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  mapCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: 24,
    height: 300,
    width: '100%',
    overflow: 'hidden',
    marginBottom: materialTheme.spacing.md,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  polygonOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamondPolygon: {
    width: 140,
    height: 140,
    borderWidth: 3,
    borderColor: '#00FF00',
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    transform: [{ rotate: '45deg' }],
  },
  mapLegendChip: {
    position: 'absolute',
    top: materialTheme.spacing.sm,
    right: materialTheme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: materialTheme.spacing.sm,
    paddingVertical: 6,
    borderRadius: materialTheme.borderRadius.sm,
  },
  mapLegendChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  trendCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    marginBottom: materialTheme.spacing.lg,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: materialTheme.spacing.sm,
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: materialTheme.colors.onSurface,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '700',
    color: materialTheme.colors.primary,
  },
  trendChart: {
    height: 60,
    backgroundColor: materialTheme.colors.surfaceVariant,
    borderRadius: materialTheme.borderRadius.sm,
  },
  trendLine: {
    flex: 1,
    margin: 8,
    borderBottomWidth: 2,
    borderBottomColor: materialTheme.colors.primary,
    opacity: 0.5,
  },
  primaryBtn: {
    backgroundColor: materialTheme.colors.primaryDark,
    borderRadius: materialTheme.borderRadius.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: materialTheme.spacing.md,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: materialTheme.spacing.md,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: materialTheme.colors.error,
    flex: 1,
  },
});
