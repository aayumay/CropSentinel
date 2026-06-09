import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useDemoState } from '../config/demoState';

export const DemoBanner = () => {
  const { isDemoMode } = useDemoState();
  const translateY = useSharedValue(-60);

  useEffect(() => {
    if (isDemoMode) {
      // Slide down entrance
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      // Slide up and hide
      translateY.value = withTiming(-60, { duration: 250 });
    }
  }, [isDemoMode]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      display: translateY.value <= -60 ? 'none' : 'flex',
    };
  });

  if (!isDemoMode) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.card}>
        <Feather name="alert-triangle" size={16} color="#856404" style={styles.icon} />
        <Text style={styles.text}>Demo Scenario Active</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFE69C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#856404',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#856404',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
