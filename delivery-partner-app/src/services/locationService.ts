// src/services/locationService.ts

import * as Location from 'expo-location';
import { socketService } from './socketService';
import { locationAPI } from '../api/services';

const LOCATION_INTERVAL_MS = 8000; // every 8 seconds
const LOCATION_DISTANCE_METERS = 20; // or every 20m moved

class LocationService {
  private subscription: Location.LocationSubscription | null = null;
  private isTracking = false;

  async requestPermissions(): Promise<boolean> {
    const { status: foreground } = await Location.requestForegroundPermissionsAsync();
    if (foreground !== 'granted') return false;

    const { status: background } = await Location.requestBackgroundPermissionsAsync();
    return background === 'granted';
  }

  async startTracking(): Promise<void> {
    if (this.isTracking) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('[Location] Permission denied');
      return;
    }

    this.isTracking = true;

    this.subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: LOCATION_INTERVAL_MS,
        distanceInterval: LOCATION_DISTANCE_METERS,
      },
      async (location) => {
        const { latitude, longitude } = location.coords;

        // Send via WebSocket (real-time)
        socketService.sendLocationUpdate(latitude, longitude);

        // Also persist via REST API as fallback
        try {
          await locationAPI.updateLocation(latitude, longitude);
        } catch (e) {
          // silently fail — WS is primary channel
        }
      }
    );
  }

  stopTracking(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isTracking = false;
  }

  async getCurrentLocation(): Promise<Location.LocationObject> {
    return Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  }

  getIsTracking(): boolean {
    return this.isTracking;
  }
}

export const locationService = new LocationService();