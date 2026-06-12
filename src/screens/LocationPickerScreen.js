import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import { materialTheme } from '../theme';
import { useDemoState } from '../config/demoState';
import { translations } from '../constants/translations';

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

const triggerHapticWarning = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (e) {}
};

const { width, height } = Dimensions.get('window');

export const LocationPickerScreen = ({ navigation, route }) => {
  const { language } = useDemoState();
  const t = translations[language] || translations.en;

  const mapRef = useRef(null);

  // Set default center to Vadodara, Gujarat as requested
  const [region, setRegion] = useState({
    latitude: 22.3072,
    longitude: 73.1812,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [selectedCoordinate, setSelectedCoordinate] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const attemptAutoLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (loc && loc.coords) {
          const { latitude, longitude } = loc.coords;
          const coords = { latitude, longitude };
          setSelectedCoordinate(coords);
          const newReg = {
            latitude,
            longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          };
          setRegion(newReg);
          if (mapRef.current) {
            mapRef.current.animateToRegion(newReg, 500);
          }
          reverseGeocode(latitude, longitude);
        }
      }
    } catch (e) {
      console.warn('Auto location detection failed:', e);
    }
  };

  // Initialize coordinate if passed from screen, or auto-detect if permission granted
  useEffect(() => {
    const initialLoc = route.params?.initialLocation;
    if (initialLoc && initialLoc.latitude && initialLoc.longitude) {
      const coords = {
        latitude: Number(initialLoc.latitude),
        longitude: Number(initialLoc.longitude),
      };
      setSelectedCoordinate(coords);
      setRegion({
        ...coords,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
      reverseGeocode(coords.latitude, coords.longitude);
    } else {
      attemptAutoLocation();
    }
  }, [route.params?.initialLocation]);

  const reverseGeocode = async (latitude, longitude) => {
    setGeocoding(true);
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const addr = results[0];
        // Format nicely, e.g., Ahmedabad, Gujarat
        const city = addr.city || addr.district || addr.subregion || addr.name || '';
        const stateRegion = addr.region || addr.state || addr.country || '';
        const formatted = [city, stateRegion].filter(Boolean).join(', ');
        setLocationName(formatted || 'Selected Location');
      } else {
        setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
      setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } finally {
      setGeocoding(false);
    }
  };

  const handleMapPress = (e) => {
    if (!e || !e.nativeEvent || !e.nativeEvent.coordinate) return;
    triggerHapticSelection();
    const coords = e.nativeEvent.coordinate;
    setSelectedCoordinate(coords);
    reverseGeocode(coords.latitude, coords.longitude);
  };

  const handleUseCurrentLocation = async () => {
    triggerHapticSelection();
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        triggerHapticWarning();
        alert('Permission to access location was denied. Please enable location permissions in settings.');
        setLoadingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (loc && loc.coords) {
        const { latitude, longitude } = loc.coords;
        const coords = { latitude, longitude };
        setSelectedCoordinate(coords);
        
        const newReg = {
          latitude,
          longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        };
        setRegion(newReg);
        
        if (mapRef.current) {
          mapRef.current.animateToRegion(newReg, 1000);
        }
        
        triggerHapticSuccess();
        reverseGeocode(latitude, longitude);
      }
    } catch (err) {
      console.warn('Failed to retrieve current location:', err);
      triggerHapticWarning();
      alert('Could not retrieve current GPS location.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedCoordinate) {
      triggerHapticWarning();
      return;
    }
    triggerHapticSelection();
    // Return back to AddFieldScreen with selection
    navigation.navigate('AddField', {
      selectedLocation: {
        latitude: selectedCoordinate.latitude,
        longitude: selectedCoordinate.longitude,
        locationName: locationName || 'Selected Location',
      },
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
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
        <Text style={styles.headerTitle}>{t.chooseLocation || 'Select Location'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 22.3072,
            longitude: 73.1812,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
          zoomEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
          mapType="standard"
        >
          {selectedCoordinate && (
            <Marker coordinate={selectedCoordinate} />
          )}
        </MapView>

        {/* Floating buttons */}
        <TouchableOpacity 
          style={styles.gpsBtn} 
          onPress={handleUseCurrentLocation}
          disabled={loadingLocation}
          activeOpacity={0.8}
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color={materialTheme.colors.primary} />
          ) : (
            <MaterialCommunityIcons name="crosshairs-gps" size={22} color={materialTheme.colors.primary} />
          )}
        </TouchableOpacity>

        {/* Location Info Banner Card */}
        {selectedCoordinate && (
          <View style={styles.infoBanner}>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={18} color={materialTheme.colors.primary} style={styles.infoIcon} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Selected Location</Text>
                {geocoding ? (
                  <ActivityIndicator size="small" color={materialTheme.colors.primary} style={{ alignSelf: 'flex-start', marginTop: 2 }} />
                ) : (
                  <Text style={styles.infoText} numberOfLines={2}>
                    {locationName || 'Fetching address...'}
                  </Text>
                )}
                <Text style={styles.coordsText}>
                  Lat: {selectedCoordinate.latitude.toFixed(6)}, Lon: {selectedCoordinate.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !selectedCoordinate && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!selectedCoordinate}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>{t.useCoordinates || 'Use This Location'}</Text>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: materialTheme.colors.outline,
    zIndex: 10,
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
  headerSpacer: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gpsBtn: {
    position: 'absolute',
    right: 16,
    bottom: 150,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  infoBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: materialTheme.colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginBottom: 4,
  },
  coordsText: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: materialTheme.colors.outline,
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: materialTheme.colors.primaryDark,
    borderRadius: materialTheme.borderRadius.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#A3A3A3',
    opacity: 0.6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
