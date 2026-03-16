// src/screens/orders/FullMapScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useActiveOrder } from '../../hooks/useQueries';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, Shadow, BorderRadius } from '../../utils/theme';
import { startBackgroundLocation, stopBackgroundLocation } from '../../services/locationTask';

export default function FullMapScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const { data: activeOrderData } = useActiveOrder();
  const activeShipments = Array.isArray(activeOrderData)
    ? activeOrderData
    : activeOrderData?.data || [];
  const shipment = activeShipments.length > 0 ? activeShipments[0] : null;
  const order = shipment?.orderId as any;

  const mapRef = useRef<MapView>(null);
  const [partnerLocation, setPartnerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Phase-aware destination
  const isPickupPhase = shipment?.status === 'ACCEPTED';
  const warehouse = (shipment as any)?.warehouseId;
  const destination = isPickupPhase ? warehouse?.location : order?.shippingAddress;
  const destinationLabel = isPickupPhase
    ? warehouse?.name || 'Warehouse'
    : order?.user?.name || 'Customer';
  const destinationIcon = isPickupPhase ? '🏭' : '🏠';

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLoadingLocation(false);
        return;
      }

      await startBackgroundLocation();

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setPartnerLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setIsLoadingLocation(false);

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (newLoc) => {
          const coords = {
            latitude: newLoc.coords.latitude,
            longitude: newLoc.coords.longitude,
          };
          setPartnerLocation(coords);

          if (isNavigating && mapRef.current) {
            mapRef.current.animateCamera(
              {
                center: coords,
                pitch: 45,
                heading: newLoc.coords.heading || 0,
                altitude: 500,
                zoom: 18,
              },
              { duration: 1000 }
            );
          }
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, [isNavigating]);

  const toggleNavigation = () => {
    const newState = !isNavigating;
    setIsNavigating(newState);
    if (newState && partnerLocation) {
      mapRef.current?.animateCamera(
        { center: partnerLocation, pitch: 45, zoom: 18 },
        { duration: 1000 }
      );
    } else {
      fitMap();
    }
  };

  const openExternalMaps = () => {
    if (!destination?.latitude) return;
    const url =
      Platform.OS === 'ios'
        ? `maps://0,0?q=${destinationLabel}@${destination.latitude},${destination.longitude}`
        : `google.navigation:q=${destination.latitude},${destination.longitude}`;
    Linking.openURL(url);
  };

  const fitMap = () => {
    if (!mapRef.current || !partnerLocation || !destination?.latitude) return;
    mapRef.current.fitToCoordinates([partnerLocation, destination as any], {
      edgePadding: { top: 150, right: 80, bottom: 250, left: 80 },
      animated: true,
    });
  };

  if (isLoadingLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Locating you...</Text>
      </View>
    );
  }

  return (
    // ── Outer container is plain View — fills entire screen including status bar ──
    <View style={StyleSheet.absoluteFillObject}>
      {/* ── Map fills 100% of screen ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: partnerLocation?.latitude ?? 28.6139,
          longitude: partnerLocation?.longitude ?? 77.209,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={false}
        showsTraffic
        showsCompass={isNavigating}
      >
        {partnerLocation && (
          <Marker coordinate={partnerLocation} flat anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[styles.partnerMarker, isNavigating && styles.navMarker]}>
              <Text style={{ fontSize: isNavigating ? 32 : 24 }}>🛵</Text>
            </View>
          </Marker>
        )}

        {destination?.latitude && (
          <Marker coordinate={destination as any}>
            <View style={[styles.destMarker, { borderColor: Colors.accent }]}>
              <Text style={{ fontSize: 22 }}>{destinationIcon}</Text>
              <View style={styles.destPill}>
                <Text style={styles.destPillText}>{destinationLabel}</Text>
              </View>
            </View>
          </Marker>
        )}

        {partnerLocation && destination?.latitude && (
          <>
            {/* Background glow line */}
            <Polyline
              coordinates={[partnerLocation, destination as any]}
              strokeColor="rgba(79, 70, 229, 0.2)"
              strokeWidth={10}
            />
            {/* Solid route line */}
            <Polyline
              coordinates={[partnerLocation, destination as any]}
              strokeColor={Colors.primary}
              strokeWidth={5}
              lineDashPattern={[0]}
            />
          </>
        )}
      </MapView>

      {/* ── Top overlay — plain View + manual inset padding so map stays full screen ── */}
      <View
        pointerEvents="box-none"
        style={[
          styles.topOverlay,
          { paddingTop: insets.top + Spacing.sm },
        ]}
      >
        {!isNavigating && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.infoPill, isNavigating && styles.navInfoPill]}>
          <Text style={[styles.infoStatus, isNavigating && styles.infoStatusNav]}>
            {isPickupPhase ? 'PICKUP FROM' : 'DELIVER TO'}
          </Text>
          <Text
            style={[styles.infoTarget, isNavigating && styles.infoTargetNav]}
            numberOfLines={1}
          >
            {destinationLabel}
          </Text>
          {isNavigating && <Text style={styles.navLiveText}>● LIVE NAVIGATION</Text>}
        </View>
      </View>

      {/* ── Bottom overlay — use insets.bottom so button clears home indicator ── */}
      <View
        style={[
          styles.bottomOverlay,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={styles.controlsRow}>
          {!isNavigating && (
            <TouchableOpacity onPress={fitMap} style={styles.controlCircle}>
              <Text style={{ fontSize: 20 }}>🎯</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={toggleNavigation}
            style={styles.journeyBtn}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={
                isNavigating
                  ? [Colors.danger, '#C0392B']
                  : [Colors.success, '#27AE60']
              }
              style={styles.journeyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.journeyText}>
                {isNavigating ? '⏹  Stop Journey' : '▶  Start Journey'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {!isNavigating && (
            <TouchableOpacity onPress={openExternalMaps} style={styles.controlCircle}>
              <Text style={{ fontSize: 20 }}>🌐</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Markers
  partnerMarker: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    padding: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadow.md,
  },
  navMarker: {
    padding: 10,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowColor: 'transparent',
  },
  destMarker: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    alignItems: 'center',
    ...Shadow.md,
  },
  destPill: {
    position: 'absolute',
    top: -30,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  destPillText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },

  // Top overlay — absolutely positioned, does NOT clip map
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  backArrow: { fontSize: 22, color: Colors.textPrimary },
  infoPill: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 10,
    ...Shadow.md,
  },
  navInfoPill: {
    backgroundColor: Colors.primary,
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
  },
  infoStatus: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  infoStatusNav: { color: 'rgba(255,255,255,0.65)' },
  infoTarget: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  infoTargetNav: { color: Colors.white },
  navLiveText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4ADE80',
    marginTop: 2,
  },

  // Bottom overlay — absolutely positioned above home indicator
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },

  // Journey button — flex: 1 so it always stretches between the two circles
  journeyBtn: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  journeyGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: FontSize.lg,
    letterSpacing: 0.5,
  },
});