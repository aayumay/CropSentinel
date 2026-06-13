import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { materialTheme } from '../theme';
import { navigationRef } from '../config/navigation';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Expected scenario check is not needed for unexpected render crashes
    console.error("AppErrorBoundary caught a rendering crash:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute) {
        navigationRef.navigate(currentRoute.name, currentRoute.params);
      }
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'MyFarms' }],
      });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Feather name="alert-triangle" size={64} color={materialTheme.colors.error} style={styles.icon} />
            <Text style={styles.title}>Something went wrong.</Text>
            <Text style={styles.subtitle}>Please restart the app.</Text>
            <Text style={styles.message}>
              {this.state.error?.message || "An unexpected rendering crash occurred."}
            </Text>
            
            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryBtn} onPress={this.handleRetry} activeOpacity={0.85}>
                <Feather name="refresh-cw" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>Retry</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryBtn} onPress={this.handleGoHome} activeOpacity={0.85}>
                <Feather name="home" size={16} color={materialTheme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.secondaryBtnText}>Go Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: materialTheme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: materialTheme.spacing.xl,
  },
  icon: {
    marginBottom: materialTheme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: materialTheme.colors.onSurface,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: materialTheme.colors.textSecondary,
    marginBottom: materialTheme.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: materialTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: materialTheme.spacing.xxl,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  actions: {
    width: '100%',
    gap: materialTheme.spacing.md,
  },
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialTheme.colors.primaryDark,
    paddingVertical: 14,
    borderRadius: materialTheme.borderRadius.button,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: materialTheme.colors.outline,
    paddingVertical: 14,
    borderRadius: materialTheme.borderRadius.button,
  },
  secondaryBtnText: {
    color: materialTheme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
