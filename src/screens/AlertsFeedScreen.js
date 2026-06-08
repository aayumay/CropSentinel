import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { materialTheme } from '../theme';
import { illustrations } from '../assets';

const MOCK_ALERTS = [
  {
    id: '1',
    farmName: 'North Field',
    title: 'Drought risk is high',
    description: 'Moisture level is critically low. Irrigate immediately.',
    time: '2 hrs ago',
    severity: 'high',
    icon: 'fire',
    iconColor: materialTheme.colors.error,
  },
  {
    id: '2',
    farmName: 'South Field',
    title: 'NDVI improving',
    description: 'Your crop health is improving steadily.',
    time: '1 day ago',
    severity: 'low',
    icon: 'sprout',
    iconColor: materialTheme.colors.success,
  },
  {
    id: '3',
    farmName: 'Weather',
    title: 'High temperature expected',
    description: 'over the next 3 days.',
    time: '2 days ago',
    severity: 'medium',
    icon: 'sun',
    iconColor: materialTheme.colors.warning,
  },
];

export const AlertsFeedScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.alertCard, { borderLeftColor: item.iconColor }]}
      onPress={() => navigation.navigate('InterventionDetail', { alertId: item.id })}
    >
      <View style={[styles.alertIconCircle, { backgroundColor: item.iconColor + '15' }]}>
        <Feather name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={styles.alertContent}>
        <View style={styles.alertTop}>
          <Text style={styles.alertFarmName}>{item.farmName}</Text>
          <Text style={styles.alertTime}>{item.time}</Text>
        </View>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertDesc}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{alerts.length} Unread Alert{alerts.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Image source={illustrations.emptyAlerts} style={styles.emptyImage} resizeMode="contain" />
          <Text style={styles.emptyTitle}>No alerts</Text>
          <Text style={styles.emptyDesc}>Your farms are looking great. We'll notify you if anything needs attention.</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={materialTheme.colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Feather name="home" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('MyFarms')}>
          <Feather name="layers" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Farms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('InterventionDetail')}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="bell" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Alerts</Text>
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
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  badge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: materialTheme.borderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: materialTheme.colors.error,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: materialTheme.spacing.xl,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: materialTheme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginBottom: materialTheme.spacing.sm,
  },
  emptyDesc: {
    fontSize: 14,
    color: materialTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    paddingHorizontal: materialTheme.spacing.lg,
    paddingBottom: 100,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    padding: materialTheme.spacing.md,
    marginBottom: materialTheme.spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    borderLeftColor: undefined,
  },
  alertIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: materialTheme.spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertFarmName: {
    fontSize: 13,
    fontWeight: '600',
    color: materialTheme.colors.textSecondary,
  },
  alertTime: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 13,
    color: materialTheme.colors.textSecondary,
    lineHeight: 18,
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
