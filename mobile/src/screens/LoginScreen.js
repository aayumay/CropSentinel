import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { materialTheme } from '../theme';
import { illustrations } from '../assets';
import { useDemoState } from '../config/demoState';
import { translations } from '../constants/translations';
import { login } from '../services';

// ─── Validation Regexes ────────────────────────────────────────────────────────
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates input and returns an object describing what was found.
 * @returns {{ valid: boolean, type: 'phone' | 'email' | null }}
 */
const validateInput = (raw) => {
  const value = raw.trim();
  if (PHONE_REGEX.test(value)) return { valid: true, type: 'phone' };
  if (EMAIL_REGEX.test(value))  return { valid: true, type: 'email' };
  return { valid: false, type: null };
};

const triggerHapticSelection = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (e) {}
};

export const LoginScreen = ({ navigation }) => {
  const { language, setAuthToken, setProfileEmail, setProfileName } = useDemoState();
  const t = translations[language] || translations.en;

  const [inputValue, setInputValue]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  // Real-time validation state
  const [touched, setTouched]     = useState(false);
  const validation                = validateInput(inputValue);
  const showError = touched && inputValue.length > 0 && !validation.valid;

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleInputChange = useCallback((text) => {
    setInputValue(text);
    if (!touched && text.length > 0) setTouched(true);
  }, [touched]);

  const handleForgotPress = () => {
    triggerHapticSelection();
    Alert.alert(
      t.forgotPasswordTitle,
      t.forgotPasswordMsg,
      [{ text: t.ok }]
    );
  };

  const handleSocialPress = (platform) => {
    triggerHapticSelection();
    Alert.alert(
      t.socialIntegrationTitle,
      `${t.socialIntegrationMsg} (${platform})`,
      [{ text: t.ok }]
    );
  };

  const handleLogin = async () => {
    triggerHapticSelection();

    // Always re-validate on press — catches the case where user taps without typing
    const result = validateInput(inputValue);
    setTouched(true);

    if (!result.valid) {
      Alert.alert(
        'Invalid Input',
        'Please enter a valid phone number or email address.'
      );
      return;
    }

    setLoading(true);
    try {
      const credential = inputValue;
      const value = credential.trim();
      let payload = {};

      if (PHONE_REGEX.test(value)) {
        payload = {
          phone_number: value,
        };
      } else if (EMAIL_REGEX.test(value)) {
        payload = {
          phone_number: value,
        };
      }

      const response = await login(payload);

      if (response && response.access_token) {
        setAuthToken(response.access_token);
        if (response.user) {
          setProfileEmail(response.user.phone_number || value);
          setProfileName(`Farmer ${response.user.id}`);
        }
      }
      navigation.replace('MyFarms');
    } catch (error) {
      if (__DEV__) {
        console.warn('Login failed:', error);
      }
      Alert.alert('Login Failed', error.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  // Derive button state
  const isButtonDisabled = loading || !validation.valid;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Image source={illustrations.leavesTopRight} style={styles.decorativeLeaf} resizeMode="contain" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcome}>{t.welcomeBack}</Text>
          <Text style={styles.subtitle}>{t.loginToContinue}</Text>
        </View>

        <View style={styles.form}>
          {/* ── Phone / Email Input ─────────────────────────────────────────── */}
          <View style={styles.inputGroup}>
            <View style={[
              styles.inputRow,
              showError && styles.inputRowError,
              touched && validation.valid && styles.inputRowValid,
            ]}>
              <Feather
                name={validation.type === 'email' ? 'mail' : 'smartphone'}
                size={18}
                color={
                  showError
                    ? materialTheme.colors.error
                    : touched && validation.valid
                    ? materialTheme.colors.success
                    : materialTheme.colors.textSecondary
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone number or email"
                placeholderTextColor={materialTheme.colors.textSecondary}
                value={inputValue}
                onChangeText={handleInputChange}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              {touched && inputValue.length > 0 && (
                <Feather
                  name={validation.valid ? 'check-circle' : 'alert-circle'}
                  size={16}
                  color={
                    validation.valid
                      ? materialTheme.colors.success
                      : materialTheme.colors.error
                  }
                  style={styles.validationIcon}
                />
              )}
            </View>

            {/* Material 3 helper text — only shown when there is an error */}
            {showError ? (
              <View style={styles.helperRow}>
                <Feather name="info" size={12} color={materialTheme.colors.error} style={{ marginRight: 4 }} />
                <Text style={styles.helperTextError}>
                  Enter a valid 10-digit phone number or email address.
                </Text>
              </View>
            ) : (
              <Text style={styles.inputHint}>
                {validation.type === 'email'
                  ? '✓ Email detected'
                  : validation.type === 'phone'
                  ? '✓ Phone number detected'
                  : '9876543210  or  user@example.com'}
              </Text>
            )}
          </View>

          {/* ── Forgot / helper link ────────────────────────────────────────── */}
          <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPress}>
            <Text style={styles.forgotText}>{t.forgotPassword}</Text>
          </TouchableOpacity>

          {/* ── Login Button ────────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              (loading || !validation.valid) && styles.loginBtnDisabled,
            ]}
            onPress={handleLogin}
            disabled={isButtonDisabled}
            activeOpacity={isButtonDisabled ? 1 : 0.85}
          >
            <Text style={[styles.loginText, isButtonDisabled && styles.loginTextDisabled]}>
              {loading ? 'Connecting…' : t.login}
            </Text>
          </TouchableOpacity>

          <Text style={styles.orText}>{t.orContinueWith}</Text>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialPress('Google')}>
              <Text style={styles.socialText}>G</Text>
              <Text style={styles.socialLabel}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialPress('Apple')}>
              <FontAwesome name="apple" size={16} color={materialTheme.colors.onSurface} />
              <Text style={styles.socialLabel}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signupRow}
          onPress={() => {
            triggerHapticSelection();
            navigation.navigate('Onboarding');
          }}
        >
          <Text style={styles.signupText}>{t.newFarmer}</Text>
          <Text style={styles.signupAction}>{t.createAccount}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: materialTheme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: materialTheme.spacing.xl,
    justifyContent: 'center',
  },
  decorativeLeaf: {
    position: 'absolute',
    top: -15,
    right: -10,
    width: 180,
    height: 180,
    resizeMode: 'contain',
    zIndex: 1,
  },
  header: {
    marginBottom: materialTheme.spacing.xl,
  },
  welcome: {
    fontSize: 28,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: materialTheme.colors.textSecondary,
    marginTop: materialTheme.spacing.xs,
  },
  form: {
    backgroundColor: materialTheme.colors.surface,
    borderRadius: materialTheme.borderRadius.xl,
    padding: materialTheme.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  inputGroup: {
    marginBottom: materialTheme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: materialTheme.colors.surfaceVariant,
    borderRadius: materialTheme.borderRadius.input,
    borderWidth: 1.5,
    borderColor: materialTheme.colors.outline,
    paddingHorizontal: materialTheme.spacing.md,
    height: 52,
  },
  inputRowError: {
    borderColor: materialTheme.colors.error,
    backgroundColor: '#FFF5F5',
  },
  inputRowValid: {
    borderColor: materialTheme.colors.success,
  },
  inputIcon: {
    marginRight: materialTheme.spacing.sm,
  },
  validationIcon: {
    marginLeft: materialTheme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: materialTheme.colors.onSurface,
  },
  // M3 helper text — error state
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  helperTextError: {
    fontSize: 12,
    color: materialTheme.colors.error,
    flex: 1,
  },
  // Normal hint below input
  inputHint: {
    fontSize: 12,
    color: materialTheme.colors.textSecondary,
    marginTop: materialTheme.spacing.xs,
    marginLeft: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: materialTheme.spacing.lg,
  },
  forgotText: {
    fontSize: 13,
    color: materialTheme.colors.primary,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: materialTheme.colors.primaryDark,
    borderRadius: materialTheme.borderRadius.button,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: materialTheme.spacing.md,
  },
  loginBtnDisabled: {
    opacity: 0.45,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginTextDisabled: {
    color: 'rgba(255,255,255,0.75)',
  },
  orText: {
    textAlign: 'center',
    color: materialTheme.colors.textSecondary,
    fontSize: 13,
    marginBottom: materialTheme.spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: materialTheme.spacing.sm,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialTheme.colors.surfaceVariant,
    borderRadius: materialTheme.borderRadius.input,
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    paddingVertical: 14,
    gap: materialTheme.spacing.sm,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: materialTheme.colors.onSurface,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: materialTheme.spacing.xl,
  },
  signupText: {
    fontSize: 14,
    color: materialTheme.colors.textSecondary,
  },
  signupAction: {
    fontSize: 14,
    color: materialTheme.colors.primary,
    fontWeight: '700',
  },
});
