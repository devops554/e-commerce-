// App.tsx

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';
import { socketService } from './src/services/socketService';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // Register for push notifications on app start
    notificationService.registerForPushNotifications();
    
    // Connect Real-time Socket
    socketService.setQueryClient(queryClient);
    socketService.connect();

    // Handle notification tap
    const responseSub = notificationService.addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('[App] Notification tapped:', data);
    });

    return () => {
      responseSub.remove();
      socketService.disconnect();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <AppNavigator />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}