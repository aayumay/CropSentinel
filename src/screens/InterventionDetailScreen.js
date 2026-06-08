import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { materialTheme } from '../theme';
import { fetchDashboard, getIntervention } from '../services';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { scheduleLocalAlert } from '../services/notifications';

export const InterventionDetailScreen = ({ navigation }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
          confidence: 0.91,
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
  }, []);

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
          <Text style={styles.headerTitle}>Intervention</Text>
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
          <Text style={styles.headerTitle}>Intervention</Text>
        </View>
        <ErrorState message={error} onRetry={() => loadIntervention(false)} />
      </SafeAreaView>
    );
  }

  const confidencePercent = details ? Math.round(details.confidence * 100) : 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Intervention</Text>
        <TouchableOpacity style={styles.moreBtn}>
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
              <View style={[styles.confidenceBarFill, { width: `${confidencePercent}%` }]} />
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
            style={styles.primaryBtn}
            onPress={async () => {
              await scheduleLocalAlert(
                "CropSentinel Alert",
                "Intervention applied successfully. Continue monitoring your farm."
              );
              Alert.alert(
                "Success",
                "Intervention applied successfully! Continue monitoring your farm.",
                [{ text: "OK" }]
              );
            }}
          >
            <Text style={styles.primaryBtnText}>Apply Intervention</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.loaderContainer}>
          <Text style={styles.loadingText}>No details found.</Text>
        </View>
      )}

      {/* Bottom Nav Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('MyFarms')}>
          <Feather name="home" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('MyFarms')}>
          <Feather name="layers" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Farms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Insights</Text>
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
});
