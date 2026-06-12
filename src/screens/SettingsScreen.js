import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { materialTheme } from '../theme';
import { avatars, illustrations } from '../assets';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { useDemoState } from '../config/demoState';
import { translations } from '../constants/translations';

const triggerHapticSelection = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (e) {}
};

export const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  const { 
    isDemoMode, 
    setDemoMode, 
    setDroughtSimulated, 
    language, 
    setLanguage,
    profileName,
    profileEmail 
  } = useDemoState();

  const handleToggleNotifications = async (value) => {
    triggerHapticSelection();
    setNotificationsEnabled(value);
    if (value) {
      await registerForPushNotificationsAsync();
    }
  };

  const handleToggleDemoMode = (value) => {
    triggerHapticSelection();
    setDemoMode(value);
    if (!value) {
      setDroughtSimulated(false);
    }
  };

  const handleLanguageChange = (lang) => {
    triggerHapticSelection();
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const t = translations[language] || translations.en;

  const menuItems = [
    { id: 'account', icon: 'settings', label: translations[language]?.settings?.account ?? translations.en.settings.account, route: 'AccountSettings' },
    { id: 'notifications', icon: 'bell', label: translations[language]?.settings?.notifications ?? translations.en.settings.notifications, route: 'NotificationSettings' },
    { id: 'help', icon: 'help-circle', label: translations[language]?.settings?.help ?? translations.en.settings.help, route: 'HelpSupport' },
    { id: 'about', icon: 'info', label: translations[language]?.settings?.about ?? translations.en.settings.about, route: 'About' },
  ];

  const handleTabPress = (route) => {
    triggerHapticSelection();
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Image source={illustrations.settingsLeaves} style={styles.decorativeLeaf} resizeMode="contain" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{translations[language]?.settings?.title ?? translations.en.settings.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image source={illustrations.profileLeaves} style={styles.heroLeaves} resizeMode="contain" />
          <Image source={illustrations.settingsLeaves} style={styles.heroLeavesSecondary} resizeMode="contain" />
          <Image source={avatars.farmer} style={styles.avatar} resizeMode="cover" />
          <Text style={styles.profileName}>{profileName}</Text>
          <Text style={styles.profileEmail}>{profileEmail}</Text>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]} 
              onPress={() => {
                triggerHapticSelection();
                navigation.navigate(item.route);
              }}
            >
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

        <View style={[styles.menuCard, { marginTop: materialTheme.spacing.md }]}>
          <View style={[styles.preferenceItem, { borderBottomWidth: 1, borderBottomColor: materialTheme.colors.outline }]}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconCircle}>
                <Feather name="bell" size={18} color={materialTheme.colors.primary} />
              </View>
              <View style={styles.flexShrink1}>
                <Text style={styles.menuLabel}>{t.pushNotifications}</Text>
                <Text style={styles.preferenceSublabel}>{t.preferenceSublabel}</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: materialTheme.colors.outline, true: materialTheme.colors.primary }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#F4F3F0'}
            />
          </View>
          
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.preferenceItem}
              onPress={() => {
                triggerHapticSelection();
                setIsLangDropdownOpen(!isLangDropdownOpen);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconCircle}>
                  <Feather name="globe" size={18} color={materialTheme.colors.primary} />
                </View>
                <View style={styles.flexShrink1}>
                  <Text style={styles.menuLabel}>{translations[language]?.settings?.language ?? translations.en.settings.language}</Text>
                  <Text style={styles.preferenceSublabel}>{language === 'en' ? 'English' : 'हिन्दी'}</Text>
                </View>
              </View>
              <Feather name={isLangDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color={materialTheme.colors.textSecondary} />
            </TouchableOpacity>
            {isLangDropdownOpen && (
              <View style={styles.dropdownOptions}>
                <TouchableOpacity
                  style={[styles.dropdownOption, language === 'en' && styles.dropdownOptionActive]}
                  onPress={() => handleLanguageChange('en')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownOptionText, language === 'en' && styles.dropdownOptionTextActive]}>English</Text>
                  {language === 'en' && <Feather name="check" size={16} color={materialTheme.colors.primary} />}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dropdownOption, language === 'hi' && styles.dropdownOptionActive, { borderBottomWidth: 0 }]}
                  onPress={() => handleLanguageChange('hi')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownOptionText, language === 'hi' && styles.dropdownOptionTextActive]}>हिन्दी</Text>
                  {language === 'hi' && <Feather name="check" size={16} color={materialTheme.colors.primary} />}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.menuCard, { marginTop: materialTheme.spacing.md }]}>
          <View style={styles.demoHeaderContainer}>
            <Text style={styles.demoTitle}>{translations[language]?.settings?.demoMode ?? translations.en.settings.demoMode}</Text>
            <Text style={styles.demoDescription}>{t.demoDesc}</Text>
          </View>
          <View style={styles.preferenceItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconCircle}>
                <Feather name="play" size={18} color={materialTheme.colors.primary} />
              </View>
              <View style={styles.flexShrink1}>
                <Text style={styles.menuLabel}>{t.enableDemoScenario}</Text>
                <Text style={styles.preferenceSublabel}>{t.demoToggleDesc}</Text>
              </View>
            </View>
            <Switch
              value={isDemoMode}
              onValueChange={handleToggleDemoMode}
              trackColor={{ false: materialTheme.colors.outline, true: materialTheme.colors.primary }}
              thumbColor={isDemoMode ? '#FFFFFF' : '#F4F3F0'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => handleTabPress('MyFarms')}>
          <Feather name="home" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => handleTabPress('Farms')}>
          <Feather name="layers" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.farms}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => handleTabPress('InterventionDetail')}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.insights}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => handleTabPress('AlertsFeed')}>
          <Feather name="bell" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{t.alerts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="user" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>{t.profile}</Text>
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
    top: 20,
    right: 20,
    width: 200,
    height: 200,
    opacity: 0.3,
    zIndex: -1,
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
    width: 150,
    height: 150,
    opacity: 0.35,
  },
  heroLeavesSecondary: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 120,
    height: 120,
    opacity: 0.3,
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
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: materialTheme.spacing.md,
    paddingVertical: materialTheme.spacing.md,
  },
  preferenceSublabel: {
    fontSize: 11,
    color: materialTheme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  demoHeaderContainer: {
    paddingHorizontal: materialTheme.spacing.md,
    paddingTop: materialTheme.spacing.md,
    paddingBottom: 4,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  demoDescription: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  flexShrink1: {
    flexShrink: 1,
  },
  dropdownContainer: {
    width: '100%',
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E0',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F0',
  },
  dropdownOptionActive: {
    backgroundColor: '#F3F4F6',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  dropdownOptionTextActive: {
    color: materialTheme.colors.primary,
    fontWeight: '600',
  },
});
