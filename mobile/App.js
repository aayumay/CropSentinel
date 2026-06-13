import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { materialTheme } from './src/theme';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MyFarmsScreen } from './src/screens/MyFarmsScreen';
import { FarmsScreen } from './src/screens/FarmsScreen';
import { FarmDetailScreen } from './src/screens/FarmDetailScreen';
import { AlertsFeedScreen } from './src/screens/AlertsFeedScreen';
import { InterventionDetailScreen } from './src/screens/InterventionDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AddFieldScreen } from './src/screens/AddFieldScreen';
import { AccountSettingsScreen } from './src/screens/AccountSettingsScreen';
import { NotificationSettingsScreen } from './src/screens/NotificationSettingsScreen';
import { HelpSupportScreen } from './src/screens/HelpSupportScreen';
import { AboutScreen } from './src/screens/AboutScreen';

import { navigationRef } from './src/config/navigation';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { fetchFarms } from './src/services';
import { demoState } from './src/config/demoState';

const Stack = createNativeStackNavigator();

export default function App() {
  React.useEffect(() => {
    const bootstrapAuth = async () => {
      const token = demoState.get().authToken;
      if (token) {
        try {
          await fetchFarms();
        } catch (e) {
          if (e.message === 'SESSION_EXPIRED' || e.status === 401) {
            demoState.set({ authToken: null });
            if (navigationRef.isReady()) {
              navigationRef.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        }
      }
    };
    bootstrapAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <StatusBar style="dark" backgroundColor={materialTheme.colors.background} />
        <NavigationContainer
          ref={navigationRef}
          theme={{
            dark: false,
            colors: {
              primary: materialTheme.colors.primary,
              background: materialTheme.colors.background,
              card: materialTheme.colors.surface,
              text: materialTheme.colors.onSurface,
              border: materialTheme.colors.outline,
              notification: materialTheme.colors.error,
            },
          }}
        >
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: materialTheme.colors.background },
              animationEnabled: true,
            }}
            initialRouteName="Onboarding"
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animationEnabled: false }} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MyFarms" component={MyFarmsScreen} />
            <Stack.Screen name="Farms" component={FarmsScreen} />
            <Stack.Screen name="FarmDetail" component={FarmDetailScreen} />
            <Stack.Screen name="AlertsFeed" component={AlertsFeedScreen} />
            <Stack.Screen name="InterventionDetail" component={InterventionDetailScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="AddField" component={AddFieldScreen} />
            <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
