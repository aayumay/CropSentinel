import { Platform } from 'react-native';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelAllScheduledNotificationsAsync } from 'expo-notifications/build/cancelAllScheduledNotificationsAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';

// Configure how notifications are handled when the app is open
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token = null;

  if (Platform.OS === 'android') {
    try {
      await setNotificationChannelAsync('default', {
        name: 'default',
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A7C2F',
      });
    } catch (error) {
      console.warn('Failed to set notification channel:', error);
    }
  }

  const { status: existingStatus } = await getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted!');
    return { success: false, status: finalStatus };
  }

  // Skip remote push token fetching to avoid crashes in Expo Go (which doesn't support remote notifications)
  return { success: true, token: 'local-demo-token', status: finalStatus };
};

export const scheduleLocalAlert = async (title, body, data = {}) => {
  try {
    await scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // immediate trigger
    });
    return true;
  } catch (error) {
    console.warn('Failed to schedule local notification:', error);
    return false;
  }
};

export const cancelAllNotifications = async () => {
  try {
    await cancelAllScheduledNotificationsAsync();
    return true;
  } catch (error) {
    console.warn('Failed to cancel notifications:', error);
    return false;
  }
};
