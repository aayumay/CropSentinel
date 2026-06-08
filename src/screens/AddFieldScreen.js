import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { materialTheme } from '../theme';

export const AddFieldScreen = ({ navigation }) => {
  const [fieldName, setFieldName] = useState('');
  const [cropType, setCropType] = useState('');
  const [fieldArea, setFieldArea] = useState('');
  const [soilType, setSoilType] = useState('');
  const [location, setLocation] = useState('');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Field</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Field Name</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g., North Field"
            placeholderTextColor={materialTheme.colors.textSecondary}
            value={fieldName}
            onChangeText={setFieldName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Select Crop Type</Text>
          <TouchableOpacity style={styles.fieldSelect}>
            <Text style={styles.fieldSelectText}>Choose crop</Text>
            <Feather name="chevron-down" size={18} color={materialTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Field Area (Acres)</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g., 5.2"
            placeholderTextColor={materialTheme.colors.textSecondary}
            value={fieldArea}
            onChangeText={setFieldArea}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Soil Type</Text>
          <TouchableOpacity style={styles.fieldSelect}>
            <Text style={styles.fieldSelectText}>Choose soil type</Text>
            <Feather name="chevron-down" size={18} color={materialTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TouchableOpacity style={styles.fieldSelect}>
            <View style={styles.fieldSelectLeft}>
              <Feather name="map-pin" size={16} color={materialTheme.colors.textSecondary} />
              <Text style={styles.fieldSelectText}>Select on map</Text>
            </View>
            <Feather name="chevron-right" size={18} color={materialTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save Field</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    paddingHorizontal: materialTheme.spacing.lg,
    paddingBottom: materialTheme.spacing.xxl,
  },
  fieldGroup: {
    marginBottom: materialTheme.spacing.lg,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: materialTheme.colors.onSurface,
    marginBottom: materialTheme.spacing.sm,
  },
  fieldInput: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.input,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    paddingHorizontal: materialTheme.spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: materialTheme.colors.onSurface,
  },
  fieldSelect: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.input,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    paddingHorizontal: materialTheme.spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: materialTheme.spacing.sm,
  },
  fieldSelectText: {
    fontSize: 15,
    color: materialTheme.colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: materialTheme.colors.primaryDark,
    borderRadius: materialTheme.borderRadius.button,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: materialTheme.spacing.md,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
