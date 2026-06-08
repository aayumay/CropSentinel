import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { materialTheme } from '../theme';
import { illustrations } from '../assets';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Image source={illustrations.leavesTopRight} style={styles.decorativeLeaf} resizeMode="contain" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome back! 👋</Text>
          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputRow}>
              <Feather name="mail" size={18} color={materialTheme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={materialTheme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <Text style={styles.inputHint}>example@email.com</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputRow}>
              <Feather name="lock" size={18} color={materialTheme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={materialTheme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color={materialTheme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>••••••••••••</Text>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.replace('MyFarms')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or continue with</Text>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialText}>G</Text>
              <Text style={styles.socialLabel}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialText}></Text>
              <Text style={styles.socialLabel}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.signupRow} onPress={() => navigation.navigate('Onboarding')}>
          <Text style={styles.signupText}>New farmer? </Text>
          <Text style={styles.signupAction}>Create Account</Text>
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
  container: {
    flex: 1,
    paddingHorizontal: materialTheme.spacing.xl,
    justifyContent: 'center',
  },
  decorativeLeaf: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 140,
    height: 140,
    opacity: 0.15,
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
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    paddingHorizontal: materialTheme.spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: materialTheme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: materialTheme.colors.onSurface,
  },
  eyeBtn: {
    padding: materialTheme.spacing.xs,
  },
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
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
