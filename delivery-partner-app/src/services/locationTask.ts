// src/services/locationTask.ts

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { locationAPI } from '../api/services';

export const BACKGROUND_LOCATION_TASK = 'background-location-updates';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('[LOCATION_TASK] Error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      const { latitude, longitude } = location.coords;
      console.log('[LOCATION_TASK] Background Update:', latitude, longitude);
      try {
        // Sync with backend so customer can see the partner moving
        await locationAPI.updateLocation(latitude, longitude);
      } catch (e) {
        console.error('[LOCATION_TASK] API Sync failed:', e);
      }
    }
  }
});

export const startBackgroundLocation = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') return;

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') return;

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 10000,
    distanceInterval: 10,
    foregroundService: {
      notificationTitle: 'kiranase is tracking your location',
      notificationBody: 'Providing real-time updates for your active delivery',
      notificationColor: '#4F46E5',
    },
  });
};

export const stopBackgroundLocation = async () => {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
};
