import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator, Share } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { materialTheme } from '../theme';
import { fetchDashboard, getIntervention } from '../services';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { scheduleLocalAlert } from '../services/notifications';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { useDemoState } from '../config/demoState';
import { DemoBanner } from '../components/DemoBanner';
import { translations } from '../constants/translations';

export const InterventionDetailScreen = ({ navigation }) => {
  const { isDemoMode, isDroughtSimulated, applyIntervention, language } = useDemoState();
  const t = translations[language] || translations.en;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const confidenceProgress = useSharedValue(0);

  const [isApplying, setIsApplying] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const overlayOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(500);

  const handleMoreMenuPress = () => {
    Alert.alert(
      "Insights Options",
      "Choose an option:",
      [
        { text: "Refresh Insights", onPress: () => loadIntervention(true) },
        { text: "Export Summary", onPress: handleExportSummary },
        { text: "Share Report", onPress: handleShareReport },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleExportSummary = () => {
    if (!details) return;
    const summaryText = `CropSentinel Insights Report\nFarm: Marathwada Sugarcane Farm\nAction: ${details.action}\nCost: ${details.cost}\nYield Risk: ${details.risk}\nConfidence: ${Math.round(details.confidence * 100)}%`;
    Alert.alert(
      "Insights Export",
      summaryText,
      [{ text: "OK" }]
    );
  };

  const handleShareReport = async () => {
    if (!details) return;
    const shareContent = {
      message: `CropSentinel Insights Report\nFarm: Marathwada Sugarcane Farm\nAction: ${details.action}\nCost: ${details.cost}\nYield Risk: ${details.risk}\nConfidence: ${Math.round(details.confidence * 100)}%`,
    };
    try {
      await Share.share(shareContent);
    } catch (err) {
      console.warn("Sharing failed:", err);
    }
  };

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${confidenceProgress.value * 100}%`,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: sheetTranslateY.value }],
    };
  });

  const triggerApply = async () => {
    setIsApplying(true);
    // Simulate loading for 800ms
    setTimeout(async () => {
      setIsApplying(false);
      sheetTranslateY.value = 500;
      setShowSheet(true);
      
      // Animate in
      overlayOpacity.value = withTiming(0.4, { duration: 250 });
      sheetTranslateY.value = withSpring(0, { damping: 24, stiffness: 150 });
      
      if (isDemoMode) {
        applyIntervention(3); // Sugarcane farm
      }
      
      // Local notification
      await scheduleLocalAlert(
        "CropSentinel Alert",
        "Intervention applied successfully. Continue monitoring your farm."
      );

      // Auto-dismiss after 2.5 seconds
      setTimeout(() => {
        dismissSheet();
      }, 2500);
    }, 800);
  };

  const dismissSheet = () => {
    overlayOpacity.value = withTiming(0, { duration: 250 });
    sheetTranslateY.value = withTiming(500, { duration: 250 });
    setTimeout(() => {
      setShowSheet(false);
    }, 250);
  };

  const loadIntervention = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const dashboard = await fetchDashboard();
      if (dashboard && dashboard.recommendation) {
        const rec = dashboard.recommendation;
        setDetails({
          action: rec.action || 'Irrigate within 48 hours',
          description: 'Timely action recommended by CropSentinel AI.',
          irrigation: '35 mm',
          cost: rec.estimated_cost !== undefined ? `₹${rec.estimated_cost.toLocaleString()}` : '₹340',
          risk: rec.yield_loss_risk !== undefined ? `₹${rec.yield_loss_risk.toLocaleString()}` : '₹18,000',
          confidence: rec.confidence ? rec.confidence / 100 : 0.91,
          improvement: '20–25%',
          roi: '3.8x',
        });
      } else {
        throw new Error('No recommendation data found in dashboard response');
      }
    } catch (err) {
      console.warn('Failed to load intervention from dashboard, falling back to mock intervention:', err);
      try {
        const fallback = await getIntervention();
        if (fallback) {
          setDetails({
            action: fallback.action ? fallback.action.split(' - ')[0] : 'Irrigate immediately',
            description: fallback.action ? fallback.action.split(' - ')[1] : 'Moisture level critically low',
            irrigation: fallback.irrigation_mm ? `${fallback.irrigation_mm} mm` : '35 mm',
            cost: fallback.cost_inr ? `₹${fallback.cost_inr.toLocaleString()}` : '₹1,200',
            risk: fallback.risk_inr ? `₹${fallback.risk_inr.toLocaleString()}` : '₹45,000',
            confidence: fallback.confidence || 0.91,
            improvement: '20–25%',
            roi: '3.8x',
          });
        }
      } catch (fallbackErr) {
        setError('Failed to load recommendation details. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIntervention();
  }, [isDemoMode, isDroughtSimulated]);

  useEffect(() => {
    if (details) {
      confidenceProgress.value = 0;
      confidenceProgress.value = withTiming(details.confidence, { duration: 350 });
    }
  }, [details]);

  const onRefresh = useCallback(() => {
    loadIntervention(true);
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.insights}</Text>
        </View>
        <LoadingState message="Loading intervention details..." />
      </SafeAreaView>
    );
  }

  if (error && !details) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.insights}</Text>
        </View>
        <ErrorState message={error} onRetry={() => loadIntervention(false)} />
      </SafeAreaView>
    );
  }

  const confidencePercent = details ? Math.round(details.confidence * 100) : 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <DemoBanner />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.insights}</Text>
        <TouchableOpacity style={styles.moreBtn} onPress={handleMoreMenuPress}>
          <Feather name="more-vertical" size={20} color={materialTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {details ? (
        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[materialTheme.colors.primary]}
            />
          }
        >
          <View style={styles.recommendationBadge}>
            <Feather name="zap" size={14} color={materialTheme.colors.error} />
            <Text style={styles.recommendationText}>AI Recommendation</Text>
          </View>

          <Text style={styles.actionTitle}>{details.action}</Text>
          <Text style={styles.actionDesc}>{details.description}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Irrigation</Text>
              <Text style={styles.metricValue}>{details.irrigation}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Cost</Text>
              <Text style={styles.metricValue}>{details.cost}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Yield Risk</Text>
              <Text style={styles.metricValue}>{details.risk}</Text>
            </View>
          </View>

          <View style={styles.confidenceCard}>
            <Text style={styles.confidenceLabel}>AI Confidence</Text>
            <View style={styles.confidenceBarBg}>
              <Animated.View style={[styles.confidenceBarFill, animatedProgressStyle]} />
            </View>
            <Text style={styles.confidenceValue}>{confidencePercent}%</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Why this intervention?</Text>
            <Text style={styles.infoCardText}>
              Soil moisture is far below optimal range. Timely irrigation can prevent yield loss and improve crop health.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Expected Outcome</Text>
            <View style={styles.outcomeRow}>
              <View style={styles.outcomeBlock}>
                <Text style={styles.outcomeLabel}>Yield Improvement</Text>
                <Text style={styles.outcomeValue}>{details.improvement}</Text>
              </View>
              <View style={styles.outcomeBlock}>
                <Text style={styles.outcomeLabel}>ROI</Text>
                <Text style={styles.outcomeValue}>{details.roi}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.primaryBtn, isApplying && styles.primaryBtnDisabled]}
            disabled={isApplying}
            onPress={triggerApply}
          >
            {isApplying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>{t.applyRecommendation}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.loaderContainer}>
          <Text style={styles.loadingText}>No details found.</Text>
        </View>
      )}

      {showSheet && (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={[styles.sheetOverlay, overlayStyle]}>
            <TouchableOpacity style={styles.flex1} activeOpacity={1} onPress={dismissSheet} />
          </Animated.View>
          <Animated.View style={[styles.bottomSheet, sheetStyle]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.successBadge}>
                <Feather name="check" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.sheetTitle}>{t.interventionApplied}</Text>
            </View>
            <Text style={styles.sheetText}>
              {t.recordedSuccessfully}
            </Text>
            <View style={styles.yieldProtectionCard}>
              <Text style={styles.yieldProtectionLabel}>{t.potentialYieldProtected}</Text>
              <Text style={styles.yieldProtectionValue}>
                {details ? details.risk : '₹45,000'}
              </Text>
            </View>
            <TouchableOpacity style={styles.sheetBtn} onPress={dismissSheet}>
              <Text style={styles.sheetBtnText}>{t.done}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Bottom Nav Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('MyFarms')}>
          <Feather name="home" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('MyFarms')}>
          <Feather name="layers" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.farms}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>{t.insights}</Text>
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
  moreBtn: {
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: materialTheme.colors.textSecondary,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: materialTheme.borderRadius.full,
    marginBottom: materialTheme.spacing.md,
    gap: 6,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '700',
    color: materialTheme.colors.error,
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 15,
    color: materialTheme.colors.textSecondary,
    marginBottom: materialTheme.spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: materialTheme.spacing.sm,
    marginBottom: materialTheme.spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  metricLabel: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  confidenceCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.md,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: materialTheme.colors.onSurface,
    marginBottom: materialTheme.spacing.sm,
  },
  confidenceBarBg: {
    height: 8,
    backgroundColor: materialTheme.colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: materialTheme.spacing.sm,
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: materialTheme.colors.primary,
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  infoCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.md,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginBottom: materialTheme.spacing.sm,
  },
  infoCardText: {
    fontSize: 14,
    color: materialTheme.colors.textSecondary,
    lineHeight: 22,
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: materialTheme.spacing.lg,
  },
  outcomeBlock: {
    flex: 1,
  },
  outcomeLabel: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
    marginBottom: 4,
  },
  outcomeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
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
  primaryBtnDisabled: {
    backgroundColor: '#A3A3A3',
    opacity: 0.8,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 998,
  },
  flex1: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5E0',
    borderRadius: 2,
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  successBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sheetText: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  yieldProtectionCard: {
    width: '100%',
    backgroundColor: '#F5F5F0',
    borderWidth: 1,
    borderColor: '#E5E5E0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  yieldProtectionLabel: {
    fontSize: 12,
    color: '#7A7A7A',
    fontWeight: '600',
    marginBottom: 4,
  },
  yieldProtectionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22C55E',
  },
  sheetBtn: {
    width: '100%',
    backgroundColor: '#267D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
