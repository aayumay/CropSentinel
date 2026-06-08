import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { materialTheme } from '../theme';
import { crops } from '../assets';

const getHealthColor = (score) => {
  if (score >= 80) return materialTheme.colors.success;
  if (score >= 60) return materialTheme.colors.warning;
  return materialTheme.colors.error;
};

export const FarmDetailScreen = ({ navigation, route }) => {
  const farm = route.params?.farm || {
    name: 'Farm Detail',
    cropType: 'Wheat',
    healthScore: 72,
    ndvi: 0.61,
    moisture: 'Low',
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{farm.name}</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Feather name="settings" size={20} color={materialTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cropHeroCard}>
          <View style={styles.cropHeroInfo}>
            <Text style={styles.cropHeroLabel}>Crop Type</Text>
            <Text style={styles.cropHeroType}>{farm.cropType}</Text>
          </View>
          <Image
            source={crops[farm.cropType.toLowerCase()] || crops.default}
            style={styles.cropHeroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.healthCardLabel}>Health Score</Text>
          <View style={[styles.healthCircle, { borderColor: getHealthColor(farm.healthScore) }]}>
            <Text style={styles.healthScore}>{farm.healthScore}</Text>
            <Text style={styles.healthDivider}>/100</Text>
          </View>
          <Text style={[styles.riskLabel, { color: getHealthColor(farm.healthScore) }]}>
            {farm.healthScore >= 80 ? 'Healthy' : farm.healthScore >= 60 ? 'Moderate Risk' : 'Drought Risk'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>NDVI</Text>
            <Text style={styles.statValue}>{farm.ndvi}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Moisture</Text>
            <Text style={styles.statValue}>{farm.moisture}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Last Update</Text>
            <Text style={styles.statValue}>2 hrs ago</Text>
          </View>
        </View>

        <View style={styles.satelliteCard}>
          <View style={styles.satelliteHeader}>
            <Text style={styles.satelliteTitle}>Satellite View (Coming D2)</Text>
            <Feather name="external-link" size={16} color={materialTheme.colors.textSecondary} />
          </View>
          <View style={styles.satelliteMap}>
            <Image source={crops[farm.cropType.toLowerCase()] || crops.default} style={styles.satelliteImage} resizeMode="cover" />
          </View>
        </View>

        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>NDVI Trend (Coming D4)</Text>
            <Text style={styles.trendValue}>{farm.ndvi}</Text>
          </View>
          <View style={styles.trendChart}>
            <View style={styles.trendLine} />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('InterventionDetail', { farmId: farm.id })}>
          <Text style={styles.primaryBtnText}>View Intervention</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Feather name="home" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="layers" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Farms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
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
  satelliteCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    marginBottom: materialTheme.spacing.md,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  satelliteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: materialTheme.spacing.sm,
  },
  satelliteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: materialTheme.colors.onSurface,
  },
  satelliteMap: {
    height: 160,
    borderRadius: materialTheme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: materialTheme.colors.surfaceVariant,
  },
  satelliteImage: {
    width: '100%',
    height: '100%',
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
});
