import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { materialTheme } from '../theme';
import { crops } from '../assets';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_FARMS = [
  {
    id: 'farm_001',
    name: 'North Field',
    cropType: 'Wheat',
    healthScore: 72,
    ndvi: 0.61,
    moisture: 'Low',
    droughtRisk: 'High',
    riskSeverity: 'high',
  },
  {
    id: 'farm_002',
    name: 'South Field',
    cropType: 'Rice',
    healthScore: 88,
    ndvi: 0.72,
    moisture: 'Optimal',
    droughtRisk: 'Low',
    riskSeverity: 'low',
  },
];

const WEATHER = [
  { icon: 'sun', value: '31°C', label: 'Temp' },
  { icon: 'droplet', value: '56%', label: 'Humidity' },
  { icon: 'cloud-rain', value: '10%', label: 'Rain Chance' },
  { icon: 'wind', value: '18 km/h', label: 'Wind' },
];

const getRiskColor = (severity) => {
  if (severity === 'high') return materialTheme.colors.error;
  if (severity === 'medium') return materialTheme.colors.warning;
  return materialTheme.colors.success;
};

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

export const MyFarmsScreen = ({ navigation }) => {
  const renderFarmCard = ({ item }) => {
    const riskBadge = getRiskBadgeStyle(item.riskSeverity);

    return (
      <TouchableOpacity
        style={styles.farmCard}
        onPress={() => navigation.navigate('FarmDetail', { farm: item })}
      >
        <View style={styles.farmCardLeft}>
          <Image
            source={crops[item.cropType.toLowerCase()] || crops.default}
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
          <View style={[styles.healthCircle, { borderColor: getHealthColor(item.healthScore) }]}>
            <Text style={styles.healthScore}>{item.healthScore}</Text>
            <Text style={styles.healthLabel}>/100</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuBtn}>
            <Feather name="menu" size={22} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellBtn}>
            <Feather name="bell" size={20} color={materialTheme.colors.onSurface} />
          </TouchableOpacity>
        </View>
        <Text style={styles.greeting}>Good Morning, Farmer 🌿</Text>
        <Text style={styles.subtitle}>Here's what's happening on your farms</Text>
      </View>

      <View style={styles.weatherRow}>
        {WEATHER.map((item) => (
          <View key={item.label} style={styles.weatherCard}>
            <Feather name={item.icon} size={18} color={materialTheme.colors.primary} />
            <Text style={styles.weatherValue}>{item.value}</Text>
            <Text style={styles.weatherLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Farms</Text>
        <Text style={styles.sectionCount}>2 Farms • 1 Alert</Text>
      </View>

      <FlatList
        data={MOCK_FARMS}
        keyExtractor={(item) => item.id}
        renderItem={renderFarmCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddField')}>
        <Feather name="plus" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="home" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('MyFarms')}>
          <Feather name="layers" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Farms</Text>
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
  weatherRow: {
    flexDirection: 'row',
    paddingHorizontal: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.lg,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: materialTheme.spacing.lg,
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
  list: {
    paddingHorizontal: materialTheme.spacing.lg,
    paddingBottom: 120,
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
});
