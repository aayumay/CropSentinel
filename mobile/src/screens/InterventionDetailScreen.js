import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { materialTheme } from '../theme';
import { SessionExpiredDialog } from '../components/SessionExpiredDialog';
import { useDemoState } from '../config/demoState';
import { DemoBanner } from '../components/DemoBanner';
import { translations } from '../constants/translations';
import { getIntervention, submitIntervention } from '../services';
import { LoadingState } from '../components/LoadingState';

const triggerHapticSelection = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (e) {}
};

const triggerHapticSuccess = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {}
};

export const InterventionDetailScreen = ({ navigation, route }) => {
  const { isDemoMode, isDroughtSimulated, applyIntervention, language } = useDemoState();
  const t = translations[language] || translations.en;

  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Animated values
  const confidenceProgress = useRef(new Animated.Value(0)).current;
  const dialogFadeAnim = useRef(new Animated.Value(0)).current;
  const dialogScaleAnim = useRef(new Animated.Value(0.9)).current;

  const resolvedFarmId = route.params?.farmId || (isDroughtSimulated ? '3' : '2');

  const getFarmName = (farmId) => {
    const idStr = String(farmId);
    if (idStr === '1') return 'Punjab Wheat Farm';
    if (idStr === '2') return 'Kaveri Delta Rice Farm';
    return 'Marathwada Sugarcane Farm';
  };

  useEffect(() => {
    if (isDemoMode) {
      const loadDemoRecommendation = async () => {
        setLoading(true);
        try {
          const res = await getIntervention(resolvedFarmId);
          setDetails(res);
        } catch (e) {
          console.warn("Failed to load demo intervention:", e);
        } finally {
          setLoading(false);
        }
      };
      loadDemoRecommendation();
    } else {
      setDetails(null);
    }
  }, [isDemoMode, isDroughtSimulated, resolvedFarmId]);

  useEffect(() => {
    if (details && isDemoMode) {
      confidenceProgress.setValue(0);
      Animated.timing(confidenceProgress, {
        toValue: details.confidence || 0.95,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [details, isDemoMode]);

  useEffect(() => {
    if (showSuccessDialog) {
      triggerHapticSuccess();
      Animated.parallel([
        Animated.timing(dialogFadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(dialogScaleAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSuccessDialog]);

  const triggerApply = async () => {
    triggerHapticSelection();
    if (!details) return;
    
    setIsApplying(true);
    try {
      await submitIntervention(resolvedFarmId, {
        action: details.action,
      });

      applyIntervention(resolvedFarmId);
      setIsApplying(false);
      setShowSuccessDialog(true);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        setSessionExpiredVisible(true);
      } else {
        Alert.alert("Failed to Apply Intervention", err.message || "An error occurred.");
      }
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.insights}</Text>
        </View>
        <LoadingState message="Analyzing farm data..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {isDemoMode && <DemoBanner />}
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
        <Text style={styles.headerTitle}>{t.insights}</Text>
      </View>

      {isDemoMode && details ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Farm info & recommendation header */}
          <Text style={styles.farmTitleText}>{getFarmName(resolvedFarmId)}</Text>
          
          <View style={styles.recommendationBadge}>
            <Feather name="zap" size={14} color={materialTheme.colors.error} />
            <Text style={styles.recommendationText}>{t.aiRecommendation}</Text>
          </View>

          <Text style={styles.actionTitle}>{details.action}</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>{t.whyIntervention || 'Detection Reason'}</Text>
            <Text style={styles.infoCardText}>{details.reason}</Text>
          </View>

          <View style={styles.confidenceCard}>
            <Text style={styles.confidenceLabel}>{t.aiConfidence}</Text>
            <View style={styles.confidenceBarBg}>
              <Animated.View style={[
                styles.confidenceBarFill, 
                {
                  width: confidenceProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} />
            </View>
            <Text style={styles.confidenceValue}>{Math.round((details.confidence || 0.95) * 100)}%</Text>
          </View>

          <TouchableOpacity 
            style={[styles.primaryBtn, isApplying && styles.primaryBtnDisabled]}
            disabled={isApplying}
            onPress={triggerApply}
            activeOpacity={0.85}
          >
            {isApplying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>{t.applyRecommendation}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="info" size={48} color={materialTheme.colors.textSecondary} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>
            {language === 'hi' ? 'कोई हस्तक्षेप अनुशंसा उपलब्ध नहीं है।' : 'No intervention recommendations available.'}
          </Text>
        </View>
      )}

      {/* Bottom Nav Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { triggerHapticSelection(); navigation.navigate('MyFarms'); }}>
          <Feather name="home" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { triggerHapticSelection(); navigation.navigate('Farms'); }}>
          <Feather name="layers" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.farms}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>{t.insights}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { triggerHapticSelection(); navigation.navigate('AlertsFeed'); }}>
          <Feather name="bell" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.alerts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => { triggerHapticSelection(); navigation.navigate('Settings'); }}>
          <Feather name="user" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.profile}</Text>
        </TouchableOpacity>
      </View>

      {showSuccessDialog && (
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            {
              opacity: dialogFadeAnim,
              transform: [{ scale: dialogScaleAnim }]
            }
          ]}>
            <View style={styles.successIconContainer}>
              <Feather name="check" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>{t.recordedTitle || 'Recommendation Applied'}</Text>
            <Text style={styles.modalBody}>{t.recordedMsg || 'Intervention successfully recorded. AI models will update metrics in the next telemetry cycle.'}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalPrimaryBtn} 
                onPress={() => {
                  triggerHapticSelection();
                  setShowSuccessDialog(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalPrimaryBtnText}>{t.continueMonitoring}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSecondaryBtn} 
                onPress={() => {
                  triggerHapticSelection();
                  setShowSuccessDialog(false);
                  navigation.navigate('AlertsFeed');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSecondaryBtnText}>{t.viewAlerts}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

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
  content: {
    paddingHorizontal: materialTheme.spacing.lg,
    paddingBottom: 100,
  },
  farmTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: materialTheme.colors.textSecondary,
    marginBottom: materialTheme.spacing.xs,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: materialTheme.borderRadius.full,
    marginBottom: materialTheme.spacing.sm,
    gap: 6,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '700',
    color: materialTheme.colors.error,
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginBottom: materialTheme.spacing.md,
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
  primaryBtn: {
    backgroundColor: materialTheme.colors.primaryDark,
    borderRadius: materialTheme.borderRadius.button,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: materialTheme.spacing.md,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBtnDisabled: {
    backgroundColor: '#A3A3A3',
    opacity: 0.8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: materialTheme.spacing.xl,
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 16,
    color: materialTheme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  successIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: materialTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    width: '100%',
    gap: 8,
  },
  modalPrimaryBtn: {
    width: '100%',
    backgroundColor: materialTheme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: {
    color: materialTheme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
