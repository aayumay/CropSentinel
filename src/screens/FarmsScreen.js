import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl, Animated, Alert, TextInput } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { materialTheme } from '../theme';
import { crops } from '../assets';
import { fetchDashboard } from '../services';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useDemoState } from '../config/demoState';
import { DemoBanner } from '../components/DemoBanner';
import { translations } from '../constants/translations';

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

const getHealthBadgeStyle = (score, t) => {
  if (score >= 75) {
    return {
      label: t.healthy || 'Healthy',
      backgroundColor: '#DCFCE7',
      color: materialTheme.colors.success,
    };
  }
  if (score >= 50) {
    return {
      label: t.warning || 'Warning',
      backgroundColor: '#FEF3C7',
      color: materialTheme.colors.warning,
    };
  }
  return {
    label: t.critical || 'Critical',
    backgroundColor: '#FEE2E2',
    color: materialTheme.colors.error,
  };
};

const getHealthColor = (score) => {
  if (score >= 75) return materialTheme.colors.success;
  if (score >= 50) return materialTheme.colors.warning;
  return materialTheme.colors.error;
};

const localTranslations = {
  en: {
    subtitle: 'Manage and monitor all your fields.',
    searchPlaceholder: 'Search farms...',
    all: 'All',
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
    noFarms: 'No farms found matching your criteria.',
    addFarm: 'Add Farm',
    deleteFarm: 'Delete Farm',
    deleteConfirm: 'Are you sure you want to delete this farm? This action cannot be undone.',
    viewDetails: 'View Details',
    editFarm: 'Edit Farm',
    cancel: 'Cancel',
  },
  hi: {
    subtitle: 'अपने सभी खेतों का प्रबंधन और निगरानी करें।',
    searchPlaceholder: 'खेतों को खोजें...',
    all: 'सभी',
    healthy: 'स्वस्थ',
    warning: 'चेतावनी',
    critical: 'गंभीर',
    noFarms: 'आपके मानदंडों से मेल खाने वाला कोई खेत नहीं मिला।',
    addFarm: 'खेत जोड़ें',
    deleteFarm: 'खेत हटाएं',
    deleteConfirm: 'क्या आप वाकई इस खेत को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
    viewDetails: 'विवरण देखें',
    editFarm: 'संपादित करें',
    cancel: 'रद्द करें',
  }
};

export const FarmsScreen = ({ navigation }) => {
  const { isDemoMode, isDroughtSimulated, language } = useDemoState();
  const tGlobal = translations[language] || translations.en;
  const tLocal = localTranslations[language] || localTranslations.en;

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const loadFarmsData = async (isRef = false) => {
    if (isRef) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const dashData = await fetchDashboard();
      if (isDemoMode) {
        const sugarcaneHealth = isDroughtSimulated ? 41 : 78;
        const sugarcaneNdvi = isDroughtSimulated ? 0.22 : 0.65;
        const sugarcaneMoisture = isDroughtSimulated ? 11 : 48;
        const sugarcaneRisk = isDroughtSimulated ? 'high' : 'low';
        const sugarcaneZone = isDroughtSimulated ? 'drought' : 'healthy';

        const demoFarmsList = [
          {
            id: '1',
            name: 'Punjab Wheat Farm',
            cropType: 'Wheat',
            healthScore: 86,
            ndvi: 0.74,
            moisture: '42%',
            riskSeverity: 'low',
            zoneType: 'healthy',
            location: 'Punjab, India',
            latitude: 30.9010,
            longitude: 75.8573,
            area: '12.4',
            soilType: 'Loamy',
          },
          {
            id: '2',
            name: 'Kaveri Delta Rice Farm',
            cropType: 'Rice',
            healthScore: 63,
            ndvi: 0.48,
            moisture: '28%',
            riskSeverity: 'medium',
            zoneType: 'moderate',
            location: 'Tamil Nadu, India',
            latitude: 10.9102,
            longitude: 79.3629,
            area: '8.2',
            soilType: 'Clay',
          },
          {
            id: '3',
            name: 'Marathwada Sugarcane Farm',
            cropType: 'Sugarcane',
            healthScore: sugarcaneHealth,
            ndvi: sugarcaneNdvi,
            moisture: `${sugarcaneMoisture}%`,
            riskSeverity: sugarcaneRisk,
            zoneType: sugarcaneZone,
            location: 'Maharashtra, India',
            latitude: 19.8762,
            longitude: 75.3433,
            area: '5.0',
            soilType: 'Silty',
          }
        ];
        setFarms(demoFarmsList);
      } else {
        if (dashData) {
          if (dashData.farm) {
            const singleFarm = {
              id: String(dashData.farm.id || 1),
              name: dashData.farm.name || 'Marathwada Sugarcane Farm',
              cropType: dashData.farm.crop_type || 'sugarcane',
              healthScore: dashData.farm_health_score ?? 72,
              ndvi: dashData.ndvi ?? 0.21,
              moisture: `${dashData.soil_moisture ?? 18}%`,
              riskSeverity: (dashData.weather_risk ?? 0.65) > 0.6 ? 'high' : (dashData.weather_risk ?? 0.65) > 0.3 ? 'medium' : 'low',
              zoneType: (dashData.weather_risk ?? 0.65) > 0.6 ? 'drought' : 'healthy',
              location: dashData.farm.location || 'Maharashtra, India',
              latitude: dashData.farm.latitude || 19.8762,
              longitude: dashData.farm.longitude || 75.3433,
              area: dashData.farm.area || '5.0',
              soilType: dashData.farm.soil_type || 'Clay',
            };
            setFarms([singleFarm]);
          } else {
            const rawFarms = dashData.farms || [];
            const mappedFarms = rawFarms.map(f => ({
              id: String(f.id),
              name: f.name,
              cropType: f.cropType || f.crop_type || 'Wheat',
              healthScore: f.healthScore || f.health_score || 72,
              ndvi: f.ndvi || 0.61,
              moisture: f.moisture || 'Low',
              riskSeverity: f.riskSeverity || (f.zone_type === 'drought' ? 'high' : 'low'),
              zoneType: f.zoneType || f.zone_type || 'drought',
              location: f.location || undefined,
              latitude: f.latitude || undefined,
              longitude: f.longitude || undefined,
              area: f.area || '5.0',
              soilType: f.soilType || f.soil_type || 'Clay',
            }));
            setFarms(mappedFarms);
          }
        } else {
          throw new Error('No farms data received');
        }
      }
    } catch (err) {
      console.warn('Failed to load farms data:', err);
      setError('Could not retrieve farms. Please check connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFarmsData();
    }, [isDemoMode, isDroughtSimulated])
  );

  const handleFarmMenuPress = (farm) => {
    Alert.alert(
      `${farm.name}`,
      tLocal.cancel,
      [
        { text: tLocal.viewDetails, onPress: () => navigation.navigate('FarmDetail', { farm }) },
        { text: tLocal.editFarm, onPress: () => navigation.navigate('AddField', { farm }) },
        {
          text: tLocal.deleteFarm,
          style: "destructive",
          onPress: () => handleDeleteFarm(farm),
        },
        { text: tLocal.cancel, style: "cancel" }
      ]
    );
  };

  const handleDeleteFarm = (farm) => {
    Alert.alert(
      tLocal.deleteFarm,
      tLocal.deleteConfirm,
      [
        { text: tLocal.cancel, style: "cancel" },
        {
          text: tLocal.deleteFarm,
          style: "destructive",
          onPress: () => {
            setFarms(prev => prev.filter(f => f.id !== farm.id));
            Alert.alert("Deleted", "Farm removed from list.");
          }
        }
      ]
    );
  };

  const filteredFarms = farms.filter(farm => {
    const matchesSearch = farm.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;

    if (activeFilter === 'Healthy') {
      matchesStatus = farm.healthScore >= 75;
    } else if (activeFilter === 'Warning') {
      matchesStatus = farm.healthScore >= 50 && farm.healthScore < 75;
    } else if (activeFilter === 'Critical') {
      matchesStatus = farm.healthScore < 50;
    }

    return matchesSearch && matchesStatus;
  });

  const renderFilterChip = (filterName, displayName) => {
    const isActive = activeFilter === filterName;
    return (
      <TouchableOpacity
        key={filterName}
        style={[
          styles.chip,
          isActive ? styles.chipActive : styles.chipInactive
        ]}
        onPress={() => setActiveFilter(filterName)}
      >
        <Text style={[
          styles.chipText,
          isActive ? styles.chipTextActive : styles.chipTextInactive
        ]}>
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && farms.length === 0) {
    return <LoadingState message="Fetching farms..." />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <DemoBanner />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{tGlobal.myFarms}</Text>
        <Text style={styles.subtitle}>{tLocal.subtitle}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={materialTheme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={tLocal.searchPlaceholder}
            placeholderTextColor={materialTheme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={materialTheme.colors.textSecondary} style={{ padding: 4 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {renderFilterChip('All', tLocal.all)}
          {renderFilterChip('Healthy', tLocal.healthy)}
          {renderFilterChip('Warning', tLocal.warning)}
          {renderFilterChip('Critical', tLocal.critical)}
        </ScrollView>
      </View>

      {/* Farm List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFarmsData(true)}
            colors={[materialTheme.colors.primary]}
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {filteredFarms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="info" size={40} color={materialTheme.colors.textSecondary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>{tLocal.noFarms}</Text>
          </View>
        ) : (
          <View style={styles.farmsContainer}>
            {filteredFarms.map((item, index) => {
              const healthBadge = getHealthBadgeStyle(item.healthScore, tLocal);
              return (
                <FadeInCard key={item.id} delay={index * 100}>
                  <TouchableOpacity
                    style={styles.farmCard}
                    onPress={() => navigation.navigate('FarmDetail', { farm: item })}
                  >
                    <View style={styles.farmCardLeft}>
                      <Image
                        source={crops[(item.cropType || '').toLowerCase()] || crops.default}
                        style={styles.farmCropImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.farmCardCenter}>
                      <Text style={styles.farmName}>{item.name}</Text>
                      <Text style={styles.farmCropType}>{item.cropType}</Text>
                      
                      {/* Health Status Badge */}
                      <View style={[styles.healthBadge, { backgroundColor: healthBadge.backgroundColor }]}>
                        <Text style={[styles.healthBadgeText, { color: healthBadge.color }]}>
                          {healthBadge.label}
                        </Text>
                      </View>

                      {/* Location if available */}
                      {item.location && (
                        <View style={styles.locationRow}>
                          <Feather name="map-pin" size={12} color={materialTheme.colors.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={styles.locationText} numberOfLines={1}>
                            {item.location}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.farmCardRight}>
                      <TouchableOpacity
                        style={styles.moreMenuBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleFarmMenuPress(item);
                        }}
                      >
                        <Feather name="more-vertical" size={18} color={materialTheme.colors.textSecondary} />
                      </TouchableOpacity>
                      <View style={[styles.healthCircle, { borderColor: getHealthColor(item.healthScore) }]}>
                        <Text style={styles.healthScoreText}>{item.healthScore}</Text>
                        <Text style={styles.healthLabelText}>/100</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </FadeInCard>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddField')} activeOpacity={0.85}>
        <Feather name="plus" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.fabText}>{tLocal.addFarm}</Text>
      </TouchableOpacity>

      {/* Bottom Nav Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('MyFarms')}>
          <Feather name="home" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{tGlobal.home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItemActive}>
          <Feather name="layers" size={20} color={materialTheme.colors.primary} />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>{tGlobal.farms}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('InterventionDetail')}>
          <Feather name="bar-chart-2" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{tGlobal.insights}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('AlertsFeed')}>
          <Feather name="bell" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{tGlobal.alerts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Settings')}>
          <Feather name="user" size={20} color={materialTheme.colors.textSecondary} />
          <Text style={styles.bottomNavText}>{tGlobal.profile}</Text>
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
  title: {
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
  searchContainer: {
    paddingHorizontal: materialTheme.spacing.lg,
    marginBottom: materialTheme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: materialTheme.colors.surface,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    borderRadius: materialTheme.borderRadius.input,
    paddingHorizontal: materialTheme.spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: materialTheme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: materialTheme.colors.onSurface,
  },
  filtersContainer: {
    marginBottom: materialTheme.spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: materialTheme.spacing.lg,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: materialTheme.borderRadius.chip,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: materialTheme.colors.primaryContainer,
    borderColor: materialTheme.colors.primary,
  },
  chipInactive: {
    backgroundColor: materialTheme.colors.surface,
    borderColor: materialTheme.colors.outline,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: materialTheme.colors.primaryDark,
  },
  chipTextInactive: {
    color: materialTheme.colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  errorContainer: {
    marginHorizontal: materialTheme.spacing.lg,
    padding: materialTheme.spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: materialTheme.spacing.md,
  },
  errorText: {
    color: materialTheme.colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: materialTheme.spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: materialTheme.colors.textSecondary,
    textAlign: 'center',
  },
  farmsContainer: {
    paddingHorizontal: materialTheme.spacing.lg,
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
  healthBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: materialTheme.borderRadius.full,
    marginTop: 6,
    marginBottom: 6,
  },
  healthBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
  },
  farmCardRight: {
    marginLeft: materialTheme.spacing.md,
    alignItems: 'center',
  },
  moreMenuBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    padding: 8,
    zIndex: 10,
  },
  healthCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialTheme.colors.surface,
    marginTop: 8,
  },
  healthScoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  healthLabelText: {
    fontSize: 9,
    color: materialTheme.colors.textSecondary,
    marginTop: -2,
  },
  fab: {
    position: 'absolute',
    right: materialTheme.spacing.lg,
    bottom: 88,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: materialTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    zIndex: 99,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
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
});
