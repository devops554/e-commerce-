// src/components/orders/DeliveryAddressCard.tsx

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors, Spacing, BorderRadius, FontSize } from '../../utils/theme';
import { ShippingAddress } from '../../types';

// ─── Haversine formula — distance in km between two coords ───────────────────
function haversineKm(
    lat1: number, lon1: number,
    lat2: number, lon2: number,
): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtKm(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
}

// ─── Geocode address string → lat/lon via Expo Location ──────────────────────
async function geocodeAddress(addr: ShippingAddress): Promise<{ lat: number; lon: number } | null> {
    try {
        const query = [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
            .filter(Boolean)
            .join(', ');
        const results = await Location.geocodeAsync(query);
        if (results.length > 0) {
            return { lat: results[0].latitude, lon: results[0].longitude };
        }
        return null;
    } catch {
        return null;
    }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    address: ShippingAddress;
    // Pass one or both — component shows whichever are available
    partnerLocation?: { latitude: number; longitude: number } | null;
    warehouseLocation?: { latitude: number; longitude: number } | null;
    // Precomputed distance from backend (shipment.distance in km) — used as fallback
    backendDistanceKm?: number;
    label?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export const DeliveryAddressCard: React.FC<Props> = ({
    address,
    partnerLocation,
    warehouseLocation,
    backendDistanceKm,
    label,
}) => {
    const [destCoords, setDestCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [geocoding, setGeocoding] = useState(false);

    // Geocode or use existing location on mount
    useEffect(() => {
        if (!address) return;

        if (address.location?.latitude && address.location?.longitude) {
            setDestCoords({
                lat: address.location.latitude,
                lon: address.location.longitude,
            });
            setGeocoding(false);
            return;
        }

        setGeocoding(true);
        geocodeAddress(address).then((coords) => {
            setDestCoords(coords);
            setGeocoding(false);
        });
    }, [address?.street, address?.postalCode, address?.location]);

    // Compute distances
    const partnerDist =
        destCoords && partnerLocation
            ? haversineKm(partnerLocation.latitude, partnerLocation.longitude, destCoords.lat, destCoords.lon)
            : null;

    const warehouseDist =
        destCoords && warehouseLocation
            ? haversineKm(warehouseLocation.latitude, warehouseLocation.longitude, destCoords.lat, destCoords.lon)
            : null;

    const handleCall = () => {
        if (!address?.phone) return;
        Linking.openURL(`tel:${address.phone}`);
    };

    const handleOpenMap = () => {
        if (!destCoords) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destCoords.lat},${destCoords.lon}`;
        Linking.openURL(url);
    };

    if (!address) return null;

    return (
        <View style={styles.card}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerIcon}>📦</Text>
                    <Text style={styles.headerLabel}>{label || 'DELIVERY ADDRESS'}</Text>
                </View>

                {/* Action buttons */}
                <View style={styles.headerActions}>
                    {address.phone && (
                        <TouchableOpacity style={styles.actionBtn} onPress={handleCall} activeOpacity={0.8}>
                            <Text style={styles.actionBtnIcon}>📞</Text>
                            <Text style={styles.actionBtnText}>Call</Text>
                        </TouchableOpacity>
                    )}
                    {destCoords && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.mapBtn]}
                            onPress={handleOpenMap}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.actionBtnIcon}>🗺</Text>
                            <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Map</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ── Recipient ── */}
            {address.fullName && (
                <View style={styles.recipientRow}>
                    <Text style={styles.recipientName}>{address.fullName}</Text>
                    {address.phone && (
                        <TouchableOpacity onPress={handleCall} activeOpacity={0.7}>
                            <View style={styles.phoneChip}>
                                <Text style={styles.phoneChipText}>📞 {address.phone}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* ── Address lines ── */}
            <View style={styles.addressBody}>
                {address.street && (
                    <Text style={styles.streetText}>{address.street}</Text>
                )}
                {address.landmark && (
                    <Text style={styles.landmarkText}>📍 Near {address.landmark}</Text>
                )}
                <View style={styles.cityRow}>
                    {address.city && <Text style={styles.cityText}>{address.city}</Text>}
                    {address.state && <Text style={styles.sepText}> · </Text>}
                    {address.state && <Text style={styles.stateText}>{address.state}</Text>}
                    {address.postalCode && (
                        <View style={styles.pinBadge}>
                            <Text style={styles.pinText}>{address.postalCode}</Text>
                        </View>
                    )}
                </View>
                {address.country && (
                    <Text style={styles.countryText}>{address.country}</Text>
                )}
            </View>

            {/* ── Distance row ── */}
            <View style={styles.divider} />
            <View style={styles.distanceRow}>
                {geocoding ? (
                    <View style={styles.distanceItem}>
                        <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.distanceLabel}>Calculating distance…</Text>
                    </View>
                ) : (
                    <>
                        {/* From partner */}
                        {partnerDist !== null ? (
                            <View style={styles.distanceItem}>
                                <Text style={styles.distanceIcon}>🧭</Text>
                                <View>
                                    <Text style={styles.distanceValue}>{fmtKm(partnerDist)}</Text>
                                    <Text style={styles.distanceLabel}>From you</Text>
                                </View>
                            </View>
                        ) : backendDistanceKm !== undefined ? (
                            <View style={styles.distanceItem}>
                                <Text style={styles.distanceIcon}>🧭</Text>
                                <View>
                                    <Text style={styles.distanceValue}>{fmtKm(backendDistanceKm)}</Text>
                                    <Text style={styles.distanceLabel}>From you</Text>
                                </View>
                            </View>
                        ) : null}

                        {/* Separator */}
                        {(partnerDist !== null || backendDistanceKm !== undefined) && warehouseDist !== null && (
                            <View style={styles.distanceSep} />
                        )}

                        {/* From warehouse */}
                        {warehouseDist !== null && (
                            <View style={styles.distanceItem}>
                                <Text style={styles.distanceIcon}>🏭</Text>
                                <View>
                                    <Text style={styles.distanceValue}>{fmtKm(warehouseDist)}</Text>
                                    <Text style={styles.distanceLabel}>From warehouse</Text>
                                </View>
                            </View>
                        )}

                        {/* No data fallback */}
                        {partnerDist === null && warehouseDist === null && backendDistanceKm === undefined && !geocoding && (
                            <Text style={styles.noDistText}>📍 Distance unavailable</Text>
                        )}
                    </>
                )}
            </View>
        </View>
    );
};

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F4F7FF',
        borderRadius: BorderRadius.md,
        padding: 12,
        borderWidth: 1,
        borderColor: '#DDE4F5',
        marginBottom: Spacing.md,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#DDE4F5',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    headerIcon: { fontSize: 13 },
    headerLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.primary,
        letterSpacing: 1,
    },
    headerActions: { flexDirection: 'row', gap: 8 },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: Colors.success,
    },
    mapBtn: {
        borderColor: Colors.primary,
    },
    actionBtnIcon: { fontSize: 12 },
    actionBtnText: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.success,
    },

    // Recipient
    recipientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 6,
    },
    recipientName: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: Colors.textPrimary,
        flexShrink: 1,
    },
    phoneChip: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: Colors.success + '80',
    },
    phoneChipText: {
        fontSize: FontSize.xs,
        color: Colors.success,
        fontWeight: '700',
    },

    // Address body
    addressBody: { gap: 3, marginBottom: 4 },
    streetText: {
        fontSize: FontSize.sm,
        color: Colors.textPrimary,
        lineHeight: 20,
    },
    landmarkText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    cityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 3,
        marginTop: 2,
    },
    cityText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
    sepText: { fontSize: FontSize.sm, color: Colors.textMuted },
    stateText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    pinBadge: {
        backgroundColor: Colors.primary + '18',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
        marginLeft: 2,
    },
    pinText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.primary },
    countryText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },

    // Divider
    divider: { height: 1, backgroundColor: '#DDE4F5', marginVertical: 10 },

    // Distance
    distanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
    },
    distanceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        flex: 1,
    },
    distanceIcon: { fontSize: 20 },
    distanceValue: {
        fontSize: FontSize.md,
        fontWeight: '900',
        color: Colors.textPrimary,
        lineHeight: 20,
    },
    distanceLabel: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 1,
    },
    distanceSep: {
        width: 1,
        height: 36,
        backgroundColor: '#DDE4F5',
    },
    noDistText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontStyle: 'italic',
    },
});