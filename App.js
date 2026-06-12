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
import { LocationPickerScreen } from './src/screens/LocationPickerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <>
        <StatusBar style="dark" backgroundColor={materialTheme.colors.background} />
        <NavigationContainer
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
            <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </>
    </SafeAreaProvider>
  );
}
