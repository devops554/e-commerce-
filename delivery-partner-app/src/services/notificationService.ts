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

  async registerForPushNotifications(): Promise<string | null> {
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

    try {
      if (Constants.appOwnership === 'expo') {
        console.warn('[Notifications] Push notifications not fully supported in Expo Go SDK 53+. Bypassing token fetch.');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      console.log('[Notifications] Expo push token:', token);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Order Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1A1F5E',
          sound: 'default',
        });
      }

      return token;
    } catch (error) {
      console.warn('[Notifications] Failed to get push token (expected in Expo Go SDK 54+):', error);
      return null;
    }
  }

  async scheduleLocalNotification(title: string, body: string, data?: Record<string, unknown>): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data ?? {},
        sound: 'default',
      },
      trigger: null, // immediate
    });
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