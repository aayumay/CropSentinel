import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { materialTheme } from '../theme';

export const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={materialTheme.colors.primary} />
      <Text style={styles.text}>{message}</Text>
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
  text: {
    marginTop: materialTheme.spacing.md,
    fontSize: 14,
    fontWeight: '600',
    color: materialTheme.colors.textSecondary,
    textAlign: 'center',
  },
});
