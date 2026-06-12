import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Line as SvgLine, Text as SvgText } from 'react-native-svg';

import { materialTheme } from '../theme';
import { crops } from '../assets';
import { fetchDashboard, getNdviHistory, getMarketHistory } from '../services';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useDemoState } from '../config/demoState';
import { DemoBanner } from '../components/DemoBanner';
import { scheduleLocalAlert } from '../services/notifications';
import { translations } from '../constants/translations';



const getHealthColor = (score) => {
  if (score >= 80) return materialTheme.colors.success;
  if (score >= 60) return materialTheme.colors.warning;
  return materialTheme.colors.error;
};

// Smooth numeric updates component for health score
const AnimatedNumber = ({ value }) => {
  const [displayVal, setDisplayVal] = useState(value);
  
  useEffect(() => {
    let start = displayVal;
    const end = value;
    if (start === end) return;
    
    const duration = 800; // 800ms
    const diff = Math.abs(end - start);
    const stepTime = Math.max(Math.floor(duration / diff), 16);
    
    let timer = setInterval(() => {
      if (start < end) {
        start += 1;
        if (start >= end) {
          start = end;
          clearInterval(timer);
        }
      } else {
        start -= 1;
        if (start <= end) {
          start = end;
          clearInterval(timer);
        }
      }
      setDisplayVal(start);
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <Text style={styles.healthScore}>{displayVal}</Text>;
};

// Pure SVG sparkline chart — zero gesture-handler/reanimated dependency
const SvgSparkline = ({ data, labels, color, fallbackText, formatValue }) => {
  const W = Dimensions.get('window').width - 80; // card padding
  const H = 120;
  const PAD_LEFT = 36;
  const PAD_RIGHT = 8;
  const PAD_TOP = 10;
  const PAD_BOTTOM = 30;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  if (!data || data.length === 0) {
    return (
      <View style={{ height: H, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: materialTheme.colors.textSecondary, fontSize: 13 }}>{fallbackText}</Text>
      </View>
    );
  }

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const toX = (i) => PAD_LEFT + (i / (data.length - 1)) * chartW;
  const toY = (v) => PAD_TOP + chartH - ((v - minVal) / range) * chartH;

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');

  return (
    <Svg width={W} height={H}>
      {/* Baseline */}
      <SvgLine
        x1={PAD_LEFT} y1={PAD_TOP + chartH}
        x2={PAD_LEFT + chartW} y2={PAD_TOP + chartH}
        stroke={materialTheme.colors.outline} strokeWidth={1}
      />
      {/* Left axis */}
      <SvgLine
        x1={PAD_LEFT} y1={PAD_TOP}
        x2={PAD_LEFT} y2={PAD_TOP + chartH}
        stroke={materialTheme.colors.outline} strokeWidth={1}
      />
      {/* Sparkline */}
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots + value labels */}
      {data.map((v, i) => (
        <React.Fragment key={i}>
          <Circle cx={toX(i)} cy={toY(v)} r={3.5} fill={color} />
          {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
            <SvgText
              x={toX(i)}
              y={toY(v) - 8}
              fontSize={9}
              fill={materialTheme.colors.textSecondary}
              textAnchor="middle"
            >
              {formatValue ? formatValue(v) : v}
            </SvgText>
          )}
        </React.Fragment>
      ))}
      {/* X-axis labels */}
      {labels.map((label, i) => (
        <SvgText
          key={`lbl-${i}`}
          x={toX(i)}
          y={H - 4}
          fontSize={9}
          fill={materialTheme.colors.textSecondary}
          textAnchor="middle"
        >
          {label}
        </SvgText>
      ))}
      {/* Y-axis min/max */}
      <SvgText x={PAD_LEFT - 2} y={PAD_TOP + 4} fontSize={9} fill={materialTheme.colors.textSecondary} textAnchor="end">
        {formatValue ? formatValue(maxVal) : maxVal}
      </SvgText>
      <SvgText x={PAD_LEFT - 2} y={PAD_TOP + chartH} fontSize={9} fill={materialTheme.colors.textSecondary} textAnchor="end">
        {formatValue ? formatValue(minVal) : minVal}
      </SvgText>
    </Svg>
  );
};


export const FarmDetailScreen = ({ navigation, route }) => {
  const { isDemoMode, isDroughtSimulated, setDroughtSimulated, language } = useDemoState();
  const t = translations[language] || translations.en;
  const [dashboardData, setDashboardData] = useState(null);
  const [ndviData, setNdviData] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, ndviRes, marketRes] = await Promise.all([
        fetchDashboard(),
        getNdviHistory(),
        getMarketHistory(),
      ]);
      
      if (dash) {
        setDashboardData(dash);
      }
      if (ndviRes && ndviRes.trend) {
        setNdviData(ndviRes.trend);
      }
      if (marketRes) {
        setMarketData(marketRes);
      }
    } catch (err) {
      console.warn('Failed to load dashboard or history in FarmDetailScreen:', err);
      setError('Could not retrieve latest farm metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDemoMode, isDroughtSimulated]);

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
      <DemoBanner />
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
            <AnimatedNumber value={farmData.healthScore} />
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
            source={require('../assets/satellitefarm.png')}
            style={styles.mapImage}
            resizeMode="cover"
          />
          <View style={styles.polygonOverlayContainer}>
            <View style={styles.diamondPolygon} />
          </View>
          <View style={styles.mapLegendChip}>
            <Text style={styles.mapLegendChipText}>Satellite imagery preview</Text>
          </View>
        </View>


        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>NDVI Trend (Last 7 Days)</Text>
            <Text style={styles.trendValue}>{farmData.ndvi}</Text>
          </View>
          <View style={styles.chartContainer}>
            <SvgSparkline
              data={ndviData.length > 0 ? ndviData.map(d => d.value) : []}
              labels={ndviData.map(d => d.day)}
              color={materialTheme.colors.primary}
              fallbackText="No NDVI trend data available"
              formatValue={(v) => v.toFixed(2)}
            />
          </View>
        </View>

        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>Mandi Price Trend</Text>
            <Text style={styles.trendValue}>
              {marketData.length > 0 ? `₹${marketData[marketData.length - 1].price}` : '₹6,500'}
            </Text>
          </View>
          <View style={styles.chartContainer}>
            <SvgSparkline
              data={marketData.length > 0 ? marketData.map(d => d.price) : []}
              labels={marketData.map(d => d.day)}
              color={materialTheme.colors.tertiary}
              fallbackText="No mandi price data available"
              formatValue={(v) => `₹${(v/1000).toFixed(1)}k`}
            />
          </View>
        </View>

        {isDemoMode && (
          <TouchableOpacity 
            style={[styles.simulateBtn, isDroughtSimulated && styles.simulateBtnDisabled]} 
            onPress={async () => {
              setDroughtSimulated(true);
              await scheduleLocalAlert(
                "CropSentinel Alert",
                "Critical drought stress detected at Marathwada Sugarcane Farm. Immediate intervention recommended."
              );
              Alert.alert(
                "Simulation Event Triggered",
                "Drought simulation successfully triggered on Marathwada Sugarcane Farm. Visual conditions, NDVI charts, and alert status are updated.",
                [{ text: "OK" }]
              );
            }}
          >
            <Text style={styles.simulateBtnText}>
              {isDroughtSimulated ? "Drought Simulated" : "Simulate Drought"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('InterventionDetail', { farmId: farmData.id })}>
          <Text style={styles.primaryBtnText}>View Intervention</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('MyFarms')}>
          <Feather name="home" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive} onPress={() => navigation.navigate('Farms')}>
          <Feather name="layers" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>{t.farms}</Text>
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
  chartContainer: {
    height: 180,
    width: '100%',
    marginTop: materialTheme.spacing.md,
  },
  noDataText: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  simulateBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: materialTheme.borderRadius.button,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: materialTheme.spacing.md,
  },
  simulateBtnDisabled: {
    backgroundColor: '#E5E5E0',
  },
  simulateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
