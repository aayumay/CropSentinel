import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { materialTheme } from '../theme';

export const AboutScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About CropSentinel</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.aboutCard}>
          <MaterialCommunityIcons name="sprout" size={48} color={materialTheme.colors.primary} />
          <Text style={styles.appName}>CropSentinel</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>AI-Powered Farm Intelligence for healthier fields and better yields.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: materialTheme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: materialTheme.spacing.lg, paddingVertical: materialTheme.spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: materialTheme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: materialTheme.colors.outline },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: materialTheme.colors.onSurface },
  headerSpacer: { width: 40 },
  content: { paddingHorizontal: materialTheme.spacing.lg, paddingTop: materialTheme.spacing.xl },
  aboutCard: { backgroundColor: materialTheme.colors.surface, borderRadius: materialTheme.borderRadius.card, padding: materialTheme.spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: materialTheme.colors.outline },
  appName: { fontSize: 22, fontWeight: '700', color: materialTheme.colors.onSurface, marginTop: materialTheme.spacing.md },
  version: { fontSize: 14, color: materialTheme.colors.textSecondary, marginTop: materialTheme.spacing.xs },
  description: { fontSize: 15, color: materialTheme.colors.textSecondary, textAlign: 'center', marginTop: materialTheme.spacing.md, lineHeight: 22 },
});
