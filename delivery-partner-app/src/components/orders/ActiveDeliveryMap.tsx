// d:\bivha\E-commerce\delivery-partner-app\src\components\orders\ActiveDeliveryMap.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Shadow } from '../../utils/theme';

interface ActiveDeliveryMapProps {
    partnerLocation: { latitude: number; longitude: number } | null;
    destination: { latitude: number; longitude: number } | { location?: { latitude: number; longitude: number } } | null;
    destinationLabel: string;
    destinationIcon?: any;
}

export const ActiveDeliveryMap: React.FC<ActiveDeliveryMapProps> = ({
    partnerLocation,
    destination: destProp,
    destinationLabel,
    destinationIcon = 'location'
}) => {
    const mapRef = useRef<MapView>(null);

    // Normalize destination coordinates
    const destination = (destProp as any)?.latitude != null
        ? (destProp as { latitude: number; longitude: number })
        : (destProp as any)?.location;

    useEffect(() => {
        if (mapRef.current && partnerLocation && destination?.latitude != null) {
            mapRef.current.fitToCoordinates(
                [partnerLocation, destination],
                {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true
                }
            );
        }
    }, [partnerLocation, destination?.latitude, destination?.longitude]);

    if (!partnerLocation || !destination?.latitude) {
        return (
            <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>
                    {!partnerLocation ? 'Waiting for your location...' : 'Waiting for destination coordinates...'}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: (partnerLocation.latitude + destination.latitude) / 2,
                    longitude: (partnerLocation.longitude + destination.longitude) / 2,
                    latitudeDelta: Math.abs(partnerLocation.latitude - destination.latitude) * 1.5,
                    longitudeDelta: Math.abs(partnerLocation.longitude - destination.longitude) * 1.5,
                }}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
            >
                {/* Partner Marker */}
                <Marker
                    coordinate={partnerLocation}
                    title="You"
                >
                    <View style={styles.partnerMarker}>
                        <Text style={{ fontSize: 18 }}>🛵</Text>
                    </View>
                </Marker>

                {/* Destination Marker */}
                <Marker
                    coordinate={destination}
                    title={destinationLabel}
                >
                    <View style={styles.destinationMarker}>
                        <Ionicons name={destinationIcon} size={20} color={Colors.accent} />
                    </View>
                </Marker>

                {/* Route Line (Direct) */}
                <Polyline
                    coordinates={[partnerLocation, destination]}
                    strokeColor={Colors.primary}
                    strokeWidth={3}
                    lineDashPattern={[5, 5]}
                />
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 220,
        width: '100%',
        backgroundColor: Colors.surfaceAlt,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 10,
        ...Shadow.md,
    },
    placeholder: {
        height: 200,
        width: '100%',
        backgroundColor: Colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        padding: 20,
    },
    placeholderText: {
        color: Colors.textSecondary,
        textAlign: 'center',
        fontWeight: '600',
    },
    partnerMarker: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 4,
        borderWidth: 2,
        borderColor: Colors.primary,
        ...Shadow.sm,
    },
    destinationMarker: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 4,
        borderWidth: 2,
        borderColor: Colors.accent,
        ...Shadow.sm,
    },
});
