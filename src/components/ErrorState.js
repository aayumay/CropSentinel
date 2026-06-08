import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { materialTheme } from '../theme';

export const ErrorState = ({ message = 'An error occurred.', onRetry }) => {
  return (
    <View style={styles.container}>
      <Feather name="alert-circle" size={48} color={materialTheme.colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Feather name="refresh-cw" size={16} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: materialTheme.colors.background,
    padding: materialTheme.spacing.lg,
  },
  message: {
    marginTop: materialTheme.spacing.md,
    marginBottom: materialTheme.spacing.lg,
    fontSize: 15,
    fontWeight: '500',
    color: materialTheme.colors.onSurface,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: materialTheme.colors.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: materialTheme.borderRadius.button,
    shadowColor: materialTheme.colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
export default ErrorState;
