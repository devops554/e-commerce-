// src/screens/orders/MapNavigationScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useActiveOrder } from '../../hooks/useQueries';
import { Colors, FontSize, Spacing, Shadow, BorderRadius } from '../../utils/theme';

export default function MapNavigationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { data: order } = useActiveOrder();
  const mapRef = useRef<MapView>(null);

  const [partnerLocation, setPartnerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Mocked customer location from order shippingAddress
  // In production, backend should provide coordinates
  const customerLocation = {
    latitude: 28.6139 + (Math.random() - 0.5) * 0.05,
    longitude: 77.209 + (Math.random() - 0.5) * 0.05,
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLoadingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setPartnerLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setIsLoadingLocation(false);

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (newLoc) => {
          setPartnerLocation({
            latitude: newLoc.coords.latitude,
            longitude: newLoc.coords.longitude,
          });
        }
      );

      // Fit map to show both markers
      setTimeout(() => {
        if (mapRef.current && partnerLocation) {
          mapRef.current.fitToCoordinates(
            [partnerLocation, customerLocation],
            { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }
          );
        }
      }, 1000);
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  const openGoogleMaps = () => {
    if (!order) return;
    const { street, city } = order.shippingAddress;
    const query = encodeURIComponent(`${street}, ${city}`);
    const url =
      Platform.OS === 'ios'
        ? `comgooglemaps://?daddr=${query}&directionsmode=driving`
        : `google.navigation:q=${query}&mode=d`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${query}`);
      }
    });
  };

  const fitMap = () => {
    if (!mapRef.current || !partnerLocation) return;
    mapRef.current.fitToCoordinates([partnerLocation, customerLocation], {
      edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
      animated: true,
    });
  };

  const initialRegion: Region = {
    latitude: partnerLocation?.latitude ?? 28.6139,
    longitude: partnerLocation?.longitude ?? 77.209,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {order && (
            <>
              <Text style={styles.headerTitle}>#{order.orderId}</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                📍 {order.shippingAddress.street}, {order.shippingAddress.city}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Map */}
      {isLoadingLocation ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsTraffic
          loadingEnabled
        >
          {/* Partner marker */}
          {partnerLocation && (
            <Marker
              coordinate={partnerLocation}
              title="You"
              description="Your current location"
            >
              <View style={styles.partnerMarker}>
                <Text style={{ fontSize: 22 }}>🛵</Text>
              </View>
            </Marker>
          )}

          {/* Customer marker */}
          <Marker
            coordinate={customerLocation}
            title={order?.user.name || 'Customer'}
            description={order?.shippingAddress.street}
          >
            <View style={styles.customerMarker}>
              <Text style={{ fontSize: 20 }}>📍</Text>
            </View>
          </Marker>

          {/* Route polyline */}
          {partnerLocation && (
            <Polyline
              coordinates={[partnerLocation, customerLocation]}
              strokeColor={Colors.primary}
              strokeWidth={4}
              lineDashPattern={[8, 4]}
            />
          )}
        </MapView>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomPanel}>
        {order && (
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryInfoRow}>
              <Text style={styles.deliveryLabel}>Customer</Text>
              <Text style={styles.deliveryValue}>{order.user.name}</Text>
            </View>
            <View style={styles.deliveryInfoRow}>
              <Text style={styles.deliveryLabel}>Address</Text>
              <Text style={styles.deliveryValue} numberOfLines={2}>
                {order.shippingAddress.street}, {order.shippingAddress.city}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.mapActions}>
          <TouchableOpacity onPress={fitMap} style={styles.fitBtn}>
            <Text style={styles.fitBtnText}>⊙ Fit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openGoogleMaps} style={styles.navBtn} activeOpacity={0.88}>
            <Text style={styles.navBtnText}>🗺 Open in Google Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  backArrow: { fontSize: 18, color: Colors.textPrimary },
  headerInfo: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Shadow.md,
  },
  headerTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: 12,
  },
  loadingText: { fontSize: FontSize.md, color: Colors.textSecondary },
  partnerMarker: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadow.sm,
  },
  customerMarker: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 4,
    ...Shadow.sm,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.md,
    paddingBottom: 32,
    ...Shadow.lg,
  },
  deliveryInfo: { gap: 8, marginBottom: Spacing.md },
  deliveryInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  deliveryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600', flex: 0.4 },
  deliveryValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600', flex: 0.6, textAlign: 'right' },
  mapActions: { flexDirection: 'row', gap: 10 },
  fitBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  fitBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  navBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
});