import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Image, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { materialTheme } from '../theme';
import { illustrations } from '../assets';
import { fetchAlerts, fetchFarms } from '../services';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { SessionExpiredDialog } from '../components/SessionExpiredDialog';
import { useDemoState } from '../config/demoState';
import { translations } from '../constants/translations';

const triggerHapticSelection = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (e) {}
};

const FadeInCard = ({ children, delay = 0 }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      delay,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, delay]);

  const animatedStyle = {
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
    ],
  };

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export const AlertsFeedScreen = ({ navigation }) => {
  const { isDemoMode, isDroughtSimulated, language } = useDemoState();
  const t = translations[language] || translations.en;
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

  const loadAlerts = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const [data, farmsList] = await Promise.all([
        fetchAlerts(),
        fetchFarms().catch(() => [])
      ]);

      if (!data) {
        throw new Error('No alerts data received');
      }

      if (!isDemoMode && (!farmsList || farmsList.length === 0)) {
        setAlerts([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const mapped = (data || [])
        .filter(item => {
          if (!isDemoMode) {
            return item.message !== undefined;
          }
          return true;
        })
        .map(item => {
          const isNewContract = item.message !== undefined;
          
          const idStr = String(item.id);
          const title = isNewContract ? item.message : (item.title || item.action || 'Attention Needed');
          const time = isNewContract ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (item.timestamp || item.time || 'Recent');
          const description = isNewContract ? `Status: ${item.status || 'sent'}` : (item.description || (item.cost_inr ? `Estimated intervention cost: ₹${item.cost_inr}` : ''));
          
          let activeFarmId = 3;
          let farmName = 'Farm Alert';
          if (farmsList && farmsList.length > 0) {
            const matchedFarm = farmsList.find(f => String(f.id) === String(item.farm_id)) || farmsList[0];
            activeFarmId = matchedFarm.id;
            farmName = matchedFarm.farm_name || matchedFarm.name || 'Farm Alert';
          }
          
          if (isDemoMode && isNewContract) {
            farmName = 'Marathwada Sugarcane Farm';
          }
          
          let severity = item.severity || 'medium';
          let icon = 'alert-circle';
          let iconColor = materialTheme.colors.warning;
          
          const isCrit = isDemoMode
            ? (idStr === '1' || idStr === '100' || severity === 'high')
            : (severity === 'high');
            
          const isLow = isDemoMode
            ? (idStr === '2' || severity === 'low')
            : (severity === 'low');
            
          const isMed = isDemoMode
            ? (idStr === '3' || severity === 'medium')
            : (severity === 'medium');

          if (isCrit) {
            severity = 'high';
            icon = 'fire';
            iconColor = materialTheme.colors.error;
          } else if (isLow) {
            severity = 'low';
            icon = 'sprout';
            iconColor = materialTheme.colors.success;
          } else if (isMed) {
            severity = 'medium';
            icon = 'weather-sunny';
            iconColor = materialTheme.colors.warning;
          }
          
          // Translate title and description for mock alerts in Hindi
          let translatedTitle = title;
          let translatedDesc = description;
          if (language === 'hi') {
            if (title.includes('Critical drought stress')) {
              translatedTitle = 'गंभीर सूखा तनाव का पता चला।';
            } else if (title.includes('Increase irrigation')) {
              translatedTitle = 'अगले 5 दिनों में सिंचाई 20% बढ़ाएं';
            }
            
            if (description.includes('Status: sent')) {
              translatedDesc = 'स्थिति: भेजा गया';
            }
          }
          
          return {
            id: idStr,
            farmId: activeFarmId,
            farmName: language === 'hi' && farmName.includes('Marathwada') ? 'मराठवाड़ा गन्ना फार्म' : farmName,
            title: translatedTitle,
            description: translatedDesc,
            time,
            severity,
            icon,
            iconColor,
          };
        });

      setAlerts(mapped);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        setSessionExpiredVisible(true);
        return;
      }
      if (__DEV__) {
        console.warn('Failed to load alerts:', err);
      }
      setError('Could not retrieve latest alerts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [isDemoMode, isDroughtSimulated]);

  const onRefresh = useCallback(() => {
    loadAlerts(true);
  }, []);

  const handleTabPress = (route) => {
    triggerHapticSelection();
    navigation.navigate(route);
  };

  if (loading && !refreshing && alerts.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.alerts}</Text>
        </View>
        <LoadingState message={language === 'hi' ? 'अलर्ट लोड हो रहे हैं...' : 'Fetching alerts...'} />
      </SafeAreaView>
    );
  }

  if (error && alerts.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.alerts}</Text>
        </View>
        <ErrorState message={error} onRetry={() => loadAlerts(false)} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item, index }) => (
    <FadeInCard delay={index * 120}>
      <TouchableOpacity
        style={[styles.alertCard, { borderLeftColor: item.iconColor }]}
        onPress={() => {
          triggerHapticSelection();
          navigation.navigate('InterventionDetail', { alertId: item.id, farmId: item.farmId });
        }}
      >
        <View style={[styles.alertIconCircle, { backgroundColor: item.iconColor + '15' }]}>
          <MaterialCommunityIcons name={item.icon} size={20} color={item.iconColor} />
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
    </FadeInCard>
  );

  const activeAlertsText = language === 'hi'
    ? `${alerts.length} सक्रिय अलर्ट`
    : `${alerts.length} Active Alert${alerts.length !== 1 ? 's' : ''}`;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.alerts}</Text>
        {!loading && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeAlertsText}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={materialTheme.colors.primary} />
          <Text style={styles.loadingText}>{language === 'hi' ? 'अलर्ट लोड हो रहे हैं...' : 'Fetching alerts...'}</Text>
        </View>
      ) : alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Image source={illustrations.emptyAlerts} style={styles.emptyImage} resizeMode="contain" />
          <Text style={styles.emptyTitle}>{language === 'hi' ? 'कोई सक्रिय अलर्ट नहीं' : 'No active alerts'}</Text>
          <Text style={styles.emptyDesc}>
            {language === 'hi' 
              ? 'आपके खेत बहुत अच्छे लग रहे हैं। यदि किसी भी चीज पर ध्यान देने की आवश्यकता होगी तो हम आपको सूचित करेंगे।' 
              : "Your farms are looking great. We'll notify you if anything needs attention."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[materialTheme.colors.primary]} 
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Navigation */}
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
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="bell" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>{t.alerts}</Text>
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
});
