import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Alert, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { materialTheme } from '../theme';
import { crops } from '../assets';
import { getNdviHistory, getMarketHistory, getFarmHistory, postAnalyze, fetchFarms } from '../services';
import { LoadingState } from '../components/LoadingState';
import { SessionExpiredDialog } from '../components/SessionExpiredDialog';
import { useDemoState } from '../config/demoState';
import { DemoBanner } from '../components/DemoBanner';
import { scheduleLocalAlert } from '../services/notifications';
import { translations } from '../constants/translations';

const triggerHapticSelection = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (e) {}
};

const triggerHapticWarning = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (e) {}
};

const getHealthColor = (score) => {
  if (score >= 75) return materialTheme.colors.success;
  if (score >= 50) return materialTheme.colors.warning;
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

// Pure SVG sparkline chart
const SvgSparkline = ({ data, labels, color, fallbackText, formatValue }) => {
  const W = Dimensions.get('window').width - 80;
  const H = 120;
  const PAD_LEFT = 36;
  const PAD_RIGHT = 8;
  const PAD_TOP = 10;
  const PAD_BOTTOM = 30;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  if (!data || data.length <= 1) {
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
      <SvgLine
        x1={PAD_LEFT} y1={PAD_TOP + chartH}
        x2={PAD_LEFT + chartW} y2={PAD_TOP + chartH}
        stroke={materialTheme.colors.outline} strokeWidth={1}
      />
      <SvgLine
        x1={PAD_LEFT} y1={PAD_TOP}
        x2={PAD_LEFT} y2={PAD_TOP + chartH}
        stroke={materialTheme.colors.outline} strokeWidth={1}
      />
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [satelliteAnalysis, setSatelliteAnalysis] = useState(null);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

  const farmId = route.params?.farmId;
  const [farmInfo, setFarmInfo] = useState(null);



  const loadData = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      let dash = null;
      let ndviRes = null;
      let marketRes = null;

      if (isDemoMode) {
        // Fallback demo info if in demo mode
        const demoFarms = [
          { id: 1, name: 'Punjab Wheat Farm', cropType: 'Wheat', latitude: 30.9010, longitude: 75.8573 },
          { id: 2, name: 'Kaveri Delta Rice Farm', cropType: 'Rice', latitude: 10.9102, longitude: 79.3629 },
          { id: 3, name: 'Marathwada Sugarcane Farm', cropType: 'Sugarcane', latitude: 19.8762, longitude: 75.3433 },
        ];
        const selectedDemo = demoFarms.find(f => String(f.id) === String(farmId)) || demoFarms[0];
        setFarmInfo(selectedDemo);

        const [ndviHistRes, mktHistRes] = await Promise.all([
          getNdviHistory(),
          getMarketHistory(),
        ]);

        let healthScoreVal = 86;
        let ndviVal = 0.74;
        let soilMoistureVal = 42;
        let weatherRiskVal = 0.15;
        let statusVal = 'Optimal moisture - continue normal irrigation.';
        
        if (selectedDemo.id === 1 || selectedDemo.id === '1') {
          healthScoreVal = 86;
          ndviVal = 0.74;
          soilMoistureVal = 42;
          weatherRiskVal = 0.15;
          statusVal = 'Optimal moisture - continue normal irrigation.';
        } else if (selectedDemo.id === 2 || selectedDemo.id === '2') {
          healthScoreVal = 63;
          ndviVal = 0.48;
          soilMoistureVal = 28;
          weatherRiskVal = 0.35;
          statusVal = 'Increase irrigation by 20% over next 5 days';
        } else if (selectedDemo.id === 3 || selectedDemo.id === '3') {
          healthScoreVal = isDroughtSimulated ? 41 : 78;
          ndviVal = isDroughtSimulated ? 0.22 : 0.65;
          soilMoistureVal = isDroughtSimulated ? 11 : 48;
          weatherRiskVal = isDroughtSimulated ? 0.85 : 0.12;
          statusVal = isDroughtSimulated ? 'Increase irrigation within 48 hours.' : 'Continue standard irrigation';
        }

        dash = {
          farm: {
            id: selectedDemo.id,
            name: selectedDemo.name,
            crop_type: selectedDemo.cropType,
            latitude: selectedDemo.latitude,
            longitude: selectedDemo.longitude,
          },
          farm_health_score: healthScoreVal,
          ndvi: ndviVal,
          weather_risk: weatherRiskVal,
          soil_moisture: soilMoistureVal,
          market_risk: 0.35,
          last_updated: new Date().toISOString(),
          status: statusVal,
          recommendation: {
            action: statusVal,
          }
        };

        let vegStatus = 'Optimal / Healthy';
        if (ndviVal < 0.35) {
          vegStatus = 'Stressed (Action Required)';
        } else if (ndviVal < 0.55) {
          vegStatus = 'Fair / Moderate';
        }

        setSatelliteAnalysis({
          ndvi: ndviVal,
          vegetationStatus: vegStatus,
          riskLevel: weatherRiskVal > 0.6 ? 'HIGH' : weatherRiskVal > 0.3 ? 'MEDIUM' : 'LOW',
          recommendation: statusVal
        });

        ndviRes = ndviHistRes;
        marketRes = mktHistRes;
      } else {
        if (!farmId) {
          throw new Error('No farmId provided to FarmDetailScreen');
        }
        
        // Fetch the farms to get coordinates
        const farmsList = await fetchFarms();
        const matchingFarm = (farmsList || []).find(f => String(f.id) === String(farmId));
        if (!matchingFarm) {
          throw new Error(`Farm with ID ${farmId} not found`);
        }

        const lat = parseFloat(matchingFarm.latitude || 19.8762);
        const lon = parseFloat(matchingFarm.longitude || 75.3433);
        const farmIdNum = parseInt(farmId);

        setFarmInfo({
          id: matchingFarm.id,
          name: matchingFarm.farm_name || `Farm ${matchingFarm.id}`,
          cropType: matchingFarm.cropType || 'Wheat',
          latitude: lat,
          longitude: lon,
        });


        const analyzeRes = await postAnalyze({ latitude: lat, longitude: lon, farm_id: farmIdNum });

        if (analyzeRes) {
          dash = {
            farm: {
              id: matchingFarm.id,
              name: matchingFarm.farm_name,
              crop_type: matchingFarm.cropType || 'Wheat',
              latitude: lat,
              longitude: lon,
            },
            farm_health_score: 100 - (analyzeRes.risk?.risk_score ?? 25),
            ndvi: analyzeRes.satellite?.ndvi ?? 0.65,
            weather_risk: (analyzeRes.risk?.risk_score ?? 25) / 100,
            soil_moisture: analyzeRes.satellite?.soil_moisture ?? 35,
            market_risk: 0.35,
            last_updated: new Date().toISOString(),
            status: analyzeRes.risk?.recommendation || 'Crop health stable.',
            recommendation: {
              action: analyzeRes.risk?.recommendation || 'No action required.',
            }
          };

          const ndvi = analyzeRes.satellite?.ndvi ?? 0.65;
          let status = 'Optimal / Healthy';
          if (ndvi < 0.35) {
            status = 'Stressed (Action Required)';
          } else if (ndvi < 0.55) {
            status = 'Fair / Moderate';
          }

          setSatelliteAnalysis({
            ndvi: ndvi,
            vegetationStatus: status,
            riskLevel: (analyzeRes.risk?.risk_level || 'low').toUpperCase(),
            recommendation: analyzeRes.risk?.recommendation || 'Vegetation status is stable. Continue regular monitoring.'
          });
        }

        const [histRes, mktRes] = await Promise.all([
          getFarmHistory(farmIdNum),
          getMarketHistory()
        ]);

        if (histRes && histRes.history) {
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          ndviRes = {
            trend: histRes.history.slice(0, 7).reverse().map((item, idx) => ({
              day: days[idx % days.length],
              value: item.ndvi
            }))
          };
        }

        marketRes = mktRes;
      }
      
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
      if (err.message === 'SESSION_EXPIRED') {
        setSessionExpiredVisible(true);
        return;
      }
      if (__DEV__) {
        console.warn('Failed to load dashboard or history in FarmDetailScreen:', err);
      }
      if (err.status === 404 || err.message?.includes('404') || err.message?.toLowerCase().includes('not found')) {
        setError('404_NOT_FOUND');
      } else {
        setError(err.message || 'Could not retrieve latest farm metrics.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [farmId, isDemoMode, isDroughtSimulated]);

  const farmData = dashboardData ? {
    id: dashboardData.farm?.id || farmInfo?.id || farmId,
    name: dashboardData.farm?.name || farmInfo?.name || 'Farm',
    cropType: dashboardData.farm?.crop_type || farmInfo?.cropType || 'Wheat',
    healthScore: dashboardData.farm_health_score ?? 75,
    ndvi: dashboardData.ndvi ?? 0.60,
    moisture: dashboardData.soil_moisture !== undefined ? `${dashboardData.soil_moisture}%` : '40%',
    weatherRisk: dashboardData.weather_risk !== undefined ? `${Math.round(dashboardData.weather_risk * 100)}%` : '20%',
    marketRisk: dashboardData.market_risk !== undefined ? `${Math.round(dashboardData.market_risk * 100)}%` : '40%',
    lastUpdated: dashboardData.last_updated ? new Date(dashboardData.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2 hrs ago',
    riskSeverity: (dashboardData.weather_risk ?? 0.65) > 0.6 ? 'high' : 'low',
    zoneType: (dashboardData.weather_risk ?? 0.65) > 0.6 ? 'drought' : 'healthy',
  } : {
    id: farmInfo?.id || farmId,
    name: farmInfo?.name || 'Farm',
    cropType: farmInfo?.cropType || 'Wheat',
    healthScore: 75,
    ndvi: 0.60,
    moisture: '40%',
    weatherRisk: '20%',
    marketRisk: '40%',
    lastUpdated: '2 hrs ago',
    riskSeverity: 'low',
    zoneType: 'healthy',
  };

  const zoneType = farmData.zoneType;

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { triggerHapticSelection(); navigation.goBack(); }} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <LoadingState message="Fetching farm details..." />
      </SafeAreaView>
    );
  }

  if (error && !loading) {
    const is404 = error === '404_NOT_FOUND';
    const displayMessage = is404 
      ? "Farm data is still being prepared. Pull to refresh shortly."
      : error;

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { triggerHapticSelection(); navigation.goBack(); }} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{farmInfo?.name || 'Farm Details'}</Text>
        </View>
        <ScrollView 
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              colors={[materialTheme.colors.primary]}
            />
          }
        >
          <Feather name="clock" size={48} color={materialTheme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: materialTheme.colors.onSurface, textAlign: 'center', paddingHorizontal: 24, marginBottom: 24, lineHeight: 22 }}>
            {displayMessage}
          </Text>
          <TouchableOpacity 
            style={[styles.primaryBtn, { paddingHorizontal: 32 }]} 
            onPress={() => loadData()}
          >
            <Text style={styles.primaryBtnText}>Refresh</Text>
          </TouchableOpacity>
        </ScrollView>
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
  }

  const getZoneChipStyle = (zoneType) => {
    const type = zoneType ? zoneType.toLowerCase() : '';
    if (type === 'healthy' || type.includes('health')) {
      return {
        backgroundColor: '#DCFCE7',
        color: materialTheme.colors.success,
        label: t.healthy,
      };
    }
    if (type === 'drought' || type.includes('drought')) {
      return {
        backgroundColor: '#FEE2E2',
        color: materialTheme.colors.error,
        label: t.critical,
      };
    }
    return {
      backgroundColor: '#FEF3C7',
      color: materialTheme.colors.warning,
      label: t.warning,
    };
  };

  const handleSimulateDrought = async () => {
    triggerHapticWarning();
    setDroughtSimulated(true);
    await scheduleLocalAlert(
      "CropSentinel Alert",
      "Critical drought stress detected at Marathwada Sugarcane Farm. Immediate intervention recommended."
    );
    Alert.alert(
      t.droughtSimulatedAlert,
      t.droughtSimulatedMsg,
      [{ text: t.ok }]
    );
  };

  const handleTabPress = (route) => {
    triggerHapticSelection();
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <DemoBanner />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            triggerHapticSelection();
            navigation.goBack();
          }} 
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{farmData.name}</Text>
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={() => {
            triggerHapticSelection();
            navigation.navigate('Settings');
          }}
        >
          <Feather name="settings" size={20} color={materialTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[materialTheme.colors.primary]}
          />
        }
      >

        <View style={styles.cropHeroCard}>
          <View style={styles.cropHeroInfo}>
            <Text style={styles.cropHeroLabel}>{t.cropTypeLabel}</Text>
            <Text style={styles.cropHeroType}>{farmData.cropType}</Text>
          </View>
          <Image
            source={crops[(farmData.cropType || '').toLowerCase()] || crops.default}
            style={styles.cropHeroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.healthCardLabel}>{t.healthScore}</Text>
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
          <Text style={styles.lastUpdatedText}>{t.lastUpdatedLabel}: {farmData.lastUpdated}</Text>
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

        {satelliteAnalysis && (
          <View style={styles.satelliteCard}>
            <View style={styles.satelliteHeader}>
              <View style={styles.satelliteTitleRow}>
                <Feather name="globe" size={18} color={materialTheme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.satelliteTitle}>Satellite Analysis Summary</Text>
              </View>
              <View style={[styles.riskChip, styles[`riskChip_${(satelliteAnalysis.riskLevel || 'low').toLowerCase()}`]]}>
                <Text style={[styles.riskChipText, styles[`riskChipText_${(satelliteAnalysis.riskLevel || 'low').toLowerCase()}`]]}>
                  {satelliteAnalysis.riskLevel} RISK
                </Text>
              </View>
            </View>

            <View style={styles.satelliteStatsContainer}>
              <View style={styles.satelliteStatBox}>
                <Text style={styles.satelliteStatLabel}>NDVI Score</Text>
                <Text style={styles.satelliteStatVal}>{Number(satelliteAnalysis.ndvi).toFixed(2)}</Text>
              </View>
              <View style={styles.satelliteStatDivider} />
              <View style={styles.satelliteStatBox}>
                <Text style={styles.satelliteStatLabel}>Vegetation Status</Text>
                <Text style={styles.satelliteStatVal}>{satelliteAnalysis.vegetationStatus}</Text>
              </View>
            </View>

            <View style={styles.satelliteRecBox}>
              <Text style={styles.satelliteRecLabel}>AI Recommendation</Text>
              <Text style={styles.satelliteRecContent}>{satelliteAnalysis.recommendation}</Text>
            </View>
          </View>
        )}

        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>{t.ndviTrendTitle}</Text>
            <Text style={styles.trendValue}>{farmData.ndvi}</Text>
          </View>
          <View style={styles.chartContainer}>
            <SvgSparkline
              data={ndviData.length > 0 ? ndviData.map(d => d.value) : []}
              labels={ndviData.map(d => d.day)}
              color={materialTheme.colors.primary}
              fallbackText="No NDVI trend data available"
              formatValue={(v) => Number.isFinite(v) ? v.toFixed(2) : '0.00'}
            />
          </View>
        </View>

        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>{t.priceTrend}</Text>
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
              formatValue={(v) => Number.isFinite(v) ? `₹${(v/1000).toFixed(1)}k` : '₹0.0k'}
            />
          </View>
        </View>

        {isDemoMode && (
          <TouchableOpacity 
            style={[styles.simulateBtn, isDroughtSimulated && styles.simulateBtnDisabled]} 
            onPress={handleSimulateDrought}
            disabled={isDroughtSimulated}
          >
            <Text style={styles.simulateBtnText}>
              {isDroughtSimulated ? t.droughtSimulated : t.simulateDrought}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => {
            triggerHapticSelection();
            navigation.navigate('InterventionDetail', { farmId: farmData.id });
          }}
        >
          <Text style={styles.primaryBtnText}>{t.viewIntervention}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => handleTabPress('MyFarms')}>
          <Feather name="home" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive} onPress={() => handleTabPress('Farms')}>
          <Feather name="layers" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>{t.farms}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => handleTabPress('InterventionDetail')}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.insights}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => handleTabPress('AlertsFeed')}>
          <Feather name="bell" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.alerts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => handleTabPress('Settings')}>
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
    fontSize: 11,
    color: materialTheme.colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  satelliteCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    marginBottom: materialTheme.spacing.md,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  satelliteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: materialTheme.spacing.md,
  },
  satelliteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  satelliteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  riskChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  riskChip_low: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  riskChip_medium: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  riskChip_high: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  riskChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  riskChipText_low: {
    color: '#15803D',
  },
  riskChipText_medium: {
    color: '#B45309',
  },
  riskChipText_high: {
    color: '#B91C1C',
  },
  satelliteStatsContainer: {
    flexDirection: 'row',
    backgroundColor: materialTheme.colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: materialTheme.spacing.md,
    alignItems: 'center',
  },
  satelliteStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  satelliteStatLabel: {
    fontSize: 10,
    color: materialTheme.colors.textSecondary,
    marginBottom: 2,
  },
  satelliteStatVal: {
    fontSize: 14,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  satelliteStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: materialTheme.colors.outline,
  },
  satelliteRecBox: {
    borderLeftWidth: 3,
    borderLeftColor: materialTheme.colors.primary,
    paddingLeft: 10,
    marginVertical: 2,
  },
  satelliteRecLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: materialTheme.colors.textSecondary,
    marginBottom: 2,
  },
  satelliteRecContent: {
    fontSize: 13,
    color: materialTheme.colors.onSurface,
    lineHeight: 18,
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
  zoneChip: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: materialTheme.borderRadius.chip,
    marginTop: materialTheme.spacing.sm,
  },
  zoneChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
