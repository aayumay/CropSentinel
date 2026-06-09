import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { materialTheme } from '../theme';

const DropdownSelector = ({ label, value, options, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.fieldSelect} 
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={[styles.fieldSelectText, value && { color: materialTheme.colors.onSurface }]}>
          {value || placeholder}
        </Text>
        <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={materialTheme.colors.textSecondary} />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownOptions}>
          {options.map((opt, idx) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.dropdownOption, 
                value === opt && styles.dropdownOptionActive,
                idx === options.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => {
                onSelect(opt);
                setIsOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownOptionText, value === opt && styles.dropdownOptionTextActive]}>
                {opt}
              </Text>
              {value === opt && <Feather name="check" size={16} color={materialTheme.colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const AddFieldScreen = ({ navigation, route }) => {
  const farmToEdit = route.params?.farm;
  const isEditMode = !!farmToEdit;

  const [fieldName, setFieldName] = useState('');
  const [cropType, setCropType] = useState('');
  const [fieldArea, setFieldArea] = useState('');
  const [soilType, setSoilType] = useState('');
  const [location, setLocation] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      setFieldName(farmToEdit.name || '');
      setCropType(farmToEdit.cropType || 'Sugarcane');
      setFieldArea(farmToEdit.area || '5.0');
      setSoilType(farmToEdit.soilType || 'Clay');
      setLocation(farmToEdit.location || 'Maharashtra');
    }
  }, [farmToEdit]);

  const handleSave = () => {
    if (!fieldName.trim()) {
      Alert.alert("Validation Error", "Please enter a farm name.");
      return;
    }
    if (!cropType) {
      Alert.alert("Validation Error", "Please select a crop type.");
      return;
    }
    if (!soilType) {
      Alert.alert("Validation Error", "Please select a soil type.");
      return;
    }
    if (!location) {
      Alert.alert("Validation Error", "Please select a location.");
      return;
    }

    setShowSuccess(true);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={materialTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? "Edit Farm" : "Add New Field"}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Farm Name</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g., North Field"
            placeholderTextColor={materialTheme.colors.textSecondary}
            value={fieldName}
            onChangeText={setFieldName}
            autoCorrect={false}
            autoCapitalize="words"
            editable={true}
          />
        </View>

        <DropdownSelector
          label="Select Crop Type"
          value={cropType}
          options={["Wheat", "Rice", "Corn", "Sugarcane"]}
          onSelect={setCropType}
          placeholder="Choose crop"
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Field Area (Acres)</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g., 5.2"
            placeholderTextColor={materialTheme.colors.textSecondary}
            value={fieldArea}
            onChangeText={setFieldArea}
            keyboardType="numeric"
            editable={true}
          />
        </View>

        <DropdownSelector
          label="Soil Type"
          value={soilType}
          options={["Sandy", "Clay", "Loamy", "Silty"]}
          onSelect={setSoilType}
          placeholder="Choose soil type"
        />

        <DropdownSelector
          label="Location"
          value={location}
          options={["Maharashtra", "Punjab", "Karnataka", "Tamil Nadu"]}
          onSelect={setLocation}
          placeholder="Select location"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>{isEditMode ? "Update Farm" : "Save Field"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {showSuccess && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Feather name="check" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>
              {isEditMode ? "Farm Updated" : "Farm Added"}
            </Text>
            <Text style={styles.modalBody}>
              {isEditMode 
                ? "Your farm has been updated successfully." 
                : "Your farm has been added successfully."}
            </Text>
            <TouchableOpacity 
              style={styles.modalBtn} 
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E0',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalBtn: {
    width: '100%',
    backgroundColor: '#267D32',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
