import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { materialTheme } from '../theme';
import { avatars, illustrations } from '../assets';

export const SettingsScreen = ({ navigation }) => {
  const menuItems = [
    { icon: 'home', label: 'Farm Details' },
    { icon: 'settings', label: 'Account Settings' },
    { icon: 'bell', label: 'Notification Settings' },
    { icon: 'help-circle', label: 'Help & Support' },
    { icon: 'info', label: 'About CropSentinel' },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Image source={illustrations.settingsLeaves} style={styles.decorativeLeaf} resizeMode="contain" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image source={illustrations.profileLeaves} style={styles.heroLeaves} resizeMode="contain" />
          <Image source={avatars.farmer} style={styles.avatar} resizeMode="cover" />
          <Text style={styles.profileName}>Ramesh Kumar</Text>
          <Text style={styles.profileEmail}>ramesh@example.com</Text>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={item.label} style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconCircle}>
                  <Feather name={item.icon} size={18} color={materialTheme.colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={materialTheme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('AlertsFeed')}>
          <Feather name="bell" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="user" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Profile</Text>
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
  decorativeLeaf: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 140,
    height: 140,
    opacity: 0.12,
    zIndex: 1,
  },
  header: {
    paddingHorizontal: materialTheme.spacing.lg,
    paddingVertical: materialTheme.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  content: {
    paddingHorizontal: materialTheme.spacing.lg,
    paddingBottom: 100,
  },
  heroCard: {
    backgroundColor: materialTheme.colors.primary,
    borderRadius: materialTheme.borderRadius.xl,
    padding: materialTheme.spacing.xl,
    alignItems: 'center',
    marginBottom: materialTheme.spacing.lg,
    overflow: 'hidden',
  },
  heroLeaves: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 120,
    height: 120,
    opacity: 0.15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: materialTheme.spacing.md,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.85,
  },
  menuCard: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: materialTheme.spacing.md,
    paddingVertical: materialTheme.spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: materialTheme.colors.outline,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: materialTheme.spacing.md,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: materialTheme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: materialTheme.colors.onSurface,
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
