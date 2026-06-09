import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { materialTheme } from '../theme';

export const NotificationSettingsScreen = ({ navigation }) => {
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [dailyAdvisories, setDailyAdvisories] = useState(true);
  const [weeklyMarket, setWeeklyMarket] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true);

  const handleSave = () => {
    Alert.alert(
      "Preferences Saved",
      "Notification settings updated successfully.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>Critical Health Alerts</Text>
              <Text style={styles.switchSub}>Immediate warnings about crop diseases and moisture drops</Text>
            </View>
            <Switch
              value={criticalAlerts}
              onValueChange={setCriticalAlerts}
              trackColor={{ false: materialTheme.colors.outline, true: materialTheme.colors.primary }}
              thumbColor={criticalAlerts ? '#FFFFFF' : '#F4F3F0'}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: materialTheme.colors.outline }]}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>Daily Advisories</Text>
              <Text style={styles.switchSub}>AI recommendations and localized weather insights</Text>
            </View>
            <Switch
              value={dailyAdvisories}
              onValueChange={setDailyAdvisories}
              trackColor={{ false: materialTheme.colors.outline, true: materialTheme.colors.primary }}
              thumbColor={dailyAdvisories ? '#FFFFFF' : '#F4F3F0'}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: materialTheme.colors.outline }]}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>Weekly Market Reports</Text>
              <Text style={styles.switchSub}>Price trends and local commodity market predictions</Text>
            </View>
            <Switch
              value={weeklyMarket}
              onValueChange={setWeeklyMarket}
              trackColor={{ false: materialTheme.colors.outline, true: materialTheme.colors.primary }}
              thumbColor={weeklyMarket ? '#FFFFFF' : '#F4F3F0'}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: materialTheme.colors.outline }]}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchLabel}>System Status</Text>
              <Text style={styles.switchSub}>Updates on satellite pass status and sync alerts</Text>
            </View>
            <Switch
              value={systemAlerts}
              onValueChange={setSystemAlerts}
              trackColor={{ false: materialTheme.colors.outline, true: materialTheme.colors.primary }}
              thumbColor={systemAlerts ? '#FFFFFF' : '#F4F3F0'}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>Save Preferences</Text>
        </TouchableOpacity>
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
  content: { paddingHorizontal: materialTheme.spacing.lg, paddingTop: materialTheme.spacing.md },
  card: { backgroundColor: materialTheme.colors.surface, borderRadius: materialTheme.borderRadius.card, borderWidth: 1, borderColor: materialTheme.colors.outline, overflow: 'hidden', marginBottom: materialTheme.spacing.lg },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: materialTheme.spacing.md },
  switchLabelContainer: { flex: 1, marginRight: 16 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: materialTheme.colors.onSurface },
  switchSub: { fontSize: 12, color: materialTheme.colors.textSecondary, marginTop: 2, lineHeight: 16 },
  saveBtn: { backgroundColor: materialTheme.colors.primary, borderRadius: materialTheme.borderRadius.button, paddingVertical: 14, alignItems: 'center', marginTop: materialTheme.spacing.md },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
