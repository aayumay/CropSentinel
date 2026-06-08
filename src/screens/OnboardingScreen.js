import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { materialTheme } from '../theme';
import { illustrations, branding } from '../assets';

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Image source={branding.logo} style={styles.brandLogo} resizeMode="contain" />
          <Text style={styles.title}>CropSentinel</Text>
          <Text style={styles.subtitle}>AI-Powered Farm Intelligence</Text>
        </View>

        <View style={styles.illustrationContainer}>
          <Image source={illustrations.onboarding} style={styles.illustration} resizeMode="cover" />
          <TouchableOpacity style={styles.getStartedBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: materialTheme.colors.background,
  },
  content: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: materialTheme.spacing.xl,
  },
  brandLogo: {
    width: 80,
    height: 80,
    marginBottom: materialTheme.spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: materialTheme.colors.textSecondary,
    marginTop: materialTheme.spacing.sm,
    fontWeight: '400',
  },
  illustrationContainer: {
    height: '48%',
    position: 'relative',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  getStartedBtn: {
    position: 'absolute',
    bottom: 40,
    left: materialTheme.spacing.lg,
    right: materialTheme.spacing.lg,
    backgroundColor: materialTheme.colors.primaryDark,
    borderRadius: materialTheme.borderRadius.button,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
