// src/services/notificationService.ts

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;
  private isRegistered = false; // ✅ prevent duplicate registration calls

  async registerForPushNotifications(): Promise<string | null> {
    // ✅ Skip if already registered
    if (this.isRegistered && this.expoPushToken) {
      return this.expoPushToken;
    }

    if (!Device.isDevice) {
      console.warn('[Notifications] Must use physical device for push notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return null;
    }

    // ✅ SDK 53+: appOwnership check removed (deprecated), use dev client detection instead
    const isExpoGo = Constants.executionEnvironment === 'storeClient';
    if (isExpoGo) {
      console.warn(
        '[Notifications] Push notifications not supported in Expo Go SDK 53+. Use a development build.'
      );
      return null;
    }

    try {
      // ✅ projectId is required for getExpoPushTokenAsync in SDK 53+
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.warn('[Notifications] Missing EAS projectId in app config. Push token cannot be fetched.');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      this.expoPushToken = token;
      this.isRegistered = true;
      console.log('[Notifications] Expo push token:', token);

      // ✅ Android notification channel setup
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Order Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1A1F5E',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        // ✅ Separate channel for OTP — high priority, no sound override
        await Notifications.setNotificationChannelAsync('otp', {
          name: 'OTP Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 100],
          sound: 'default',
        });
      }

      return token;
    } catch (error) {
      console.warn('[Notifications] Failed to get push token:', error);
      return null;
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data ?? {},
          sound: 'default',
          // ✅ Use correct channel on Android
          ...(Platform.OS === 'android' && {
            categoryIdentifier: data?.type === 'OTP' ? 'otp' : 'orders',
          }),
        },
        trigger: null, // immediate
      });
    } catch (error) {
      console.warn('[Notifications] scheduleLocalNotification failed:', error);
    }
  }

  async notifyNewOrder(orderId: string, amount: number): Promise<void> {
    await this.scheduleLocalNotification(
      '🛵 New Order Request!',
      `Order #${orderId} — ₹${amount} | Tap to accept`,
      { type: 'NEW_ORDER', orderId }
    );
  }

  async notifyOrderAssigned(orderId: string): Promise<void> {
    await this.scheduleLocalNotification(
      '✅ Order Assigned',
      `Order #${orderId} has been assigned to you`,
      { type: 'ORDER_ASSIGNED', orderId }
    );
  }

  // ✅ New: dismiss all delivered notifications (e.g. on logout or app focus)
  async dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  // ✅ New: reset badge count
  async resetBadgeCount(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();