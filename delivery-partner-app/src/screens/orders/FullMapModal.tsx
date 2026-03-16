// src/components/orders/FullMapModal.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Linking,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Shadow, BorderRadius } from '../../utils/theme';

// ── ORS API key from .env  (EXPO_PUBLIC_ORS_API_KEY=your_key) ──
const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Coordinate { latitude: number; longitude: number; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normaliseCoord = (dest: any): Coordinate | null => {
    if (!dest) return null;
    if (typeof dest.latitude === 'number')
        return { latitude: dest.latitude, longitude: dest.longitude };
    return null;
};

const haversineKm = (a: Coordinate, b: Coordinate): number => {
    const R = 6371;
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.latitude * Math.PI) / 180) *
        Math.cos((b.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

// ─── ORS Road Route ───────────────────────────────────────────────────────────
// Uses /geojson endpoint — simplest response shape, no polyline decoding needed.
// ORS coordinate order is [longitude, latitude] (GeoJSON standard).
const fetchRoadRoute = async (
    from: Coordinate,
    to: Coordinate,
): Promise<{ coords: Coordinate[]; distanceKm: number; durationMin: number } | null> => {
    try {
        const key = ORS_API_KEY?.trim();

        // Guard: key not configured
        if (!key || key === 'YOUR_ORS_API_KEY_HERE') {
            console.warn('[ORS] API key not set — straight-line fallback');
            return null;
        }

        const requestBody = {
            // NOTE: ORS wants [lng, lat], NOT [lat, lng]
            coordinates: [
                [from.longitude, from.latitude],
                [to.longitude, to.latitude],
            ],
        };

        console.log('[ORS] POST /geojson →', JSON.stringify(requestBody));

        const res = await fetch(
            'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
            {
                method: 'POST',
                headers: {
                    Authorization: key,
                    'Content-Type': 'application/json',
                    Accept: 'application/json, application/geo+json',
                },
                body: JSON.stringify(requestBody),
            }
        );

        // Log full error body so we can debug 400/401/403
        if (!res.ok) {
            const errText = await res.text();
            console.warn(`[ORS] HTTP ${res.status}:`, errText);
            throw new Error(`ORS ${res.status}`);
        }

        const data = await res.json();

        // GeoJSON FeatureCollection shape:
        // features[0].geometry.coordinates = [[lng,lat], [lng,lat], ...]
        // features[0].properties.summary   = { distance (m), duration (s) }
        const feature = data?.features?.[0];
        const coords2d = feature?.geometry?.coordinates as [number, number][] | undefined;
        const summary = feature?.properties?.summary;

        if (!coords2d?.length || !summary) {
            console.warn('[ORS] Unexpected shape:', JSON.stringify(data).slice(0, 400));
            return null;
        }

        // Convert [lng, lat] → { latitude, longitude }
        const coords: Coordinate[] = coords2d.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
        }));

        console.log(`[ORS] Route: ${coords.length} points, ${(summary.distance / 1000).toFixed(1)} km`);

        return {
            coords,
            distanceKm: parseFloat((summary.distance / 1000).toFixed(1)),
            durationMin: Math.ceil(summary.duration / 60),
        };
    } catch (e) {
        console.warn('[ORS] Route failed → straight-line fallback:', e);
        return null;
    }
};

// ─── Marker Components ────────────────────────────────────────────────────────
// Rule: NO Animated.View inside Marker children. Use tracksViewChanges flash.

// ── Delivery Partner ── big bright YELLOW circle + scooter
// Yellow = impossible to miss on any map background
const BikeMarker: React.FC<{ isNavigating: boolean }> = ({ isNavigating }) => (
    <View style={mk.bikeWrap}>
        {isNavigating && <View style={mk.navRing} />}
        <View style={[mk.bikeCircle, isNavigating ? mk.bikeCircleNav : mk.bikeCircleIdle]}>
            <Ionicons
                name="bicycle"
                size={isNavigating ? 30 : 24}
                color={isNavigating ? '#1A1A1A' : '#B45309'}
            />
        </View>
    </View>
);

// ── Warehouse / Pickup ── RED pin + cube icon
// Red = urgent/action needed, cube = package, impossible to miss
const WarehouseMarker: React.FC<{ label: string }> = ({ label }) => (
    <View style={mk.pinWrap}>
        <View style={[mk.labelBubble, { backgroundColor: '#DC2626' }]}>
            <Ionicons name="cube" size={11} color="#FECACA" style={{ marginRight: 3 }} />
            <Text style={mk.labelText} numberOfLines={1}>{label}</Text>
        </View>
        <View style={[mk.circlePin, { borderColor: '#7F1D1D' }]}>
            <LinearGradient colors={['#EF4444', '#7F1D1D']} style={mk.pinGrad}>
                <Ionicons name="cube" size={28} color="#fff" />
            </LinearGradient>
        </View>
        <View style={[mk.pinTail, { borderTopColor: '#7F1D1D' }]} />
    </View>
);

// ── Customer / Delivery ── PURPLE pin + home icon
// Purple = completely different from roads (grey), route (yellow), warehouse (red)
const CustomerMarker: React.FC<{ label: string }> = ({ label }) => (
    <View style={mk.pinWrap}>
        <View style={[mk.labelBubble, { backgroundColor: '#7C3AED' }]}>
            <Ionicons name="home" size={11} color="#DDD6FE" style={{ marginRight: 3 }} />
            <Text style={mk.labelText} numberOfLines={1}>{label}</Text>
        </View>
        <View style={[mk.circlePin, { borderColor: '#4C1D95' }]}>
            <LinearGradient colors={['#8B5CF6', '#4C1D95']} style={mk.pinGrad}>
                <Ionicons name="home" size={26} color="#fff" />
            </LinearGradient>
        </View>
        <View style={[mk.pinTail, { borderTopColor: '#4C1D95' }]} />
    </View>
);

// ── Idle marker ── shown before journey starts (muted, no action yet)
const IdleMarker: React.FC<{ label: string; isPickup: boolean }> = ({ label, isPickup }) => {
    const bg = isPickup ? '#FEF2F2' : '#F5F3FF';
    const border = isPickup ? '#DC2626' : '#7C3AED';
    const icon = isPickup ? '#EF4444' : '#8B5CF6';
    const iName = isPickup ? 'cube-outline' : 'home-outline';
    const lBg = isPickup ? '#DC262690' : '#7C3AED90';
    return (
        <View style={mk.pinWrap}>
            <View style={[mk.labelBubble, { backgroundColor: lBg }]}>
                <Ionicons name={iName} size={11} color="#fff" style={{ marginRight: 3 }} />
                <Text style={mk.labelText} numberOfLines={1}>{label}</Text>
            </View>
            <View style={[mk.circlePin, { borderColor: border, borderStyle: 'dashed' }]}>
                <View style={[mk.pinGrad, { backgroundColor: bg }]}>
                    <Ionicons name={iName} size={26} color={icon} />
                </View>
            </View>
            <View style={[mk.pinTail, { borderTopColor: border }]} />
        </View>
    );
};

const mk = StyleSheet.create({
    bikeWrap: { alignItems: 'center', justifyContent: 'center' },
    bikeCircleIdle: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#FEF08A',
        borderWidth: 3, borderColor: '#EAB308',
        alignItems: 'center', justifyContent: 'center',
        elevation: 10,
        shadowColor: '#EAB308', shadowOpacity: 0.5,
        shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
    bikeCircle: {
        width: 52, height: 52, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center',
        elevation: 10,
        shadowColor: '#EAB308', shadowOpacity: 0.5,
        shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
    bikeCircleNav: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#FACC15',
        borderColor: '#fff', borderWidth: 3.5,
    },
    navRing: {
        position: 'absolute',
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 3, borderColor: '#FACC15', opacity: 0.3,
    },
    pinWrap: { alignItems: 'center' },
    labelBubble: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
        marginBottom: 5, maxWidth: 180,
        elevation: 5,
        shadowColor: '#000', shadowOpacity: 0.2,
        shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    },
    labelText: { color: '#fff', fontSize: 12, fontWeight: '800', flexShrink: 1 },
    circlePin: {
        width: 60, height: 60, borderRadius: 30,
        borderWidth: 3.5, overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000', shadowOpacity: 0.35,
        shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
    pinGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    pinTail: {
        width: 0, height: 0,
        borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 15,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        marginTop: -1,
    },
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    visible: boolean;
    onClose: () => void;
    partnerLocation: Coordinate | null;
    destination: any;
    destinationLabel: string;
    destinationIcon: string;
    isPickupPhase?: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const FullMapModal: React.FC<Props> = ({
    visible,
    onClose,
    partnerLocation: externalLoc,
    destination,
    destinationLabel,
    isPickupPhase = false,
}) => {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);

    const [liveLocation, setLiveLocation] = useState<Coordinate | null>(externalLoc);
    const [isLoadingLoc, setIsLoadingLoc] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);
    const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);
    const [isFetchingRoute, setIsFetchingRoute] = useState(false);
    const [distanceKm, setDistanceKm] = useState<number | null>(null);
    const [etaMin, setEtaMin] = useState<number | null>(null);

    // tracksViewChanges flash — set true briefly to force marker re-render
    const [bikeTracking, setBikeTracking] = useState(true);
    const [destTracking, setDestTracking] = useState(true);

    const flash = (
        setter: React.Dispatch<React.SetStateAction<boolean>>,
        ms = 500,
    ) => { setter(true); setTimeout(() => setter(false), ms); };

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(120)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const destCoord = normaliseCoord(destination);

    // ── Load road route ───────────────────────────────────────────────────────
    const loadRoute = useCallback(async (from: Coordinate) => {
        if (!destCoord) return;
        setIsFetchingRoute(true);
        const result = await fetchRoadRoute(from, destCoord);
        setIsFetchingRoute(false);

        if (result) {
            setRouteCoords(result.coords);
            setDistanceKm(result.distanceKm);
            setEtaMin(result.durationMin);
        } else {
            // Straight-line fallback
            setRouteCoords([from, destCoord]);
            const km = haversineKm(from, destCoord);
            setDistanceKm(parseFloat(km.toFixed(1)));
            setEtaMin(Math.ceil((km / 30) * 60));
        }
    }, [destCoord]);

    // ── Fit both pins ─────────────────────────────────────────────────────────
    const fitMap = useCallback(() => {
        if (!mapRef.current || !liveLocation || !destCoord) return;
        mapRef.current.fitToCoordinates([liveLocation, destCoord], {
            edgePadding: { top: 150, right: 70, bottom: 260, left: 70 },
            animated: true,
        });
    }, [liveLocation, destCoord]);

    // ── Toggle journey ────────────────────────────────────────────────────────
    const toggleNavigation = useCallback(async () => {
        const next = !isNavigating;
        setIsNavigating(next);
        flash(setBikeTracking, 700);
        flash(setDestTracking, 700);

        if (next && liveLocation) {
            mapRef.current?.animateCamera(
                { center: liveLocation, pitch: 50, zoom: 17 },
                { duration: 900 }
            );
            await loadRoute(liveLocation);
        } else {
            setRouteCoords([]);
            setTimeout(fitMap, 400);
        }
    }, [isNavigating, liveLocation, loadRoute, fitMap]);

    // ── Pulse ring ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isNavigating) { pulseAnim.setValue(1); return; }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.55, duration: 900, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [isNavigating]);

    // ── Bottom card slide ─────────────────────────────────────────────────────
    useEffect(() => {
        if (visible) {
            flash(setBikeTracking, 900);
            flash(setDestTracking, 900);
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        } else {
            slideAnim.setValue(120);
            fadeAnim.setValue(0);
            setIsNavigating(false);
            setRouteCoords([]);
        }
    }, [visible]);

    // ── Location tracking ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!visible) return;
        let sub: Location.LocationSubscription | null = null;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') { setIsLoadingLoc(false); return; }

            const initial = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const c: Coordinate = {
                latitude: initial.coords.latitude,
                longitude: initial.coords.longitude,
            };
            setLiveLocation(c);
            setIsLoadingLoc(false);

            if (destCoord) {
                const km = haversineKm(c, destCoord);
                setDistanceKm(parseFloat(km.toFixed(1)));
                setEtaMin(Math.ceil((km / 30) * 60));
            }

            sub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 2500,
                    distanceInterval: 5,
                },
                (loc) => {
                    const fresh: Coordinate = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    };
                    setLiveLocation(fresh);
                    flash(setBikeTracking, 300);

                    if (isNavigating && mapRef.current) {
                        mapRef.current.animateCamera(
                            {
                                center: fresh,
                                pitch: 50,
                                heading: loc.coords.heading ?? 0,
                                zoom: 17,
                            },
                            { duration: 800 }
                        );
                    }
                }
            );
        })();

        return () => { sub?.remove(); };
    }, [visible, isNavigating]);

    // ── Open Google Maps ──────────────────────────────────────────────────────
    const openExternalMaps = () => {
        if (!destCoord) return;
        const { latitude: lat, longitude: lng } = destCoord;
        const url = Platform.OS === 'ios'
            ? `maps://0,0?q=${encodeURIComponent(destinationLabel)}@${lat},${lng}`
            : `google.navigation:q=${lat},${lng}`;
        Linking.openURL(url).catch(() =>
            Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`)
        );
    };

    // Route always Google-Maps blue — max contrast against grey roads + amber/green markers
    // Waze-style yellow — zero ambiguity vs grey roads, red/purple markers, yellow bike
    const routeColor = '#F59E0B';
    const routeGlow = 'rgba(245,158,11,0.25)';

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
            <View style={s.root}>

                {/* Loading */}
                {isLoadingLoc && (
                    <View style={s.loader}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={s.loaderText}>Getting your location…</Text>
                    </View>
                )}

                {/* Full-screen Map */}
                {!isLoadingLoc && (
                    <MapView
                        ref={mapRef}
                        style={StyleSheet.absoluteFillObject}
                        provider={PROVIDER_GOOGLE}
                        showsTraffic
                        showsCompass={false}
                        showsUserLocation={false}
                        initialRegion={{
                            latitude: liveLocation?.latitude ?? 28.6139,
                            longitude: liveLocation?.longitude ?? 77.209,
                            latitudeDelta: 0.018,
                            longitudeDelta: 0.018,
                        }}
                        onMapReady={() => {
                            fitMap();
                            flash(setBikeTracking, 700);
                            flash(setDestTracking, 700);
                        }}
                    >
                        {/* Bike marker */}
                        {liveLocation && (
                            <Marker
                                coordinate={liveLocation}
                                flat
                                anchor={{ x: 0.5, y: 0.5 }}
                                tracksViewChanges={bikeTracking}
                            >
                                <BikeMarker isNavigating={isNavigating} />
                            </Marker>
                        )}

                        {/* Destination marker:
                            idle    → IdleMarker       (before Start Journey)
                            pickup  → WarehouseMarker  (journey started, pickup phase)
                            deliver → CustomerMarker   (journey started, delivery phase)
                        */}
                        {destCoord && (
                            <Marker
                                coordinate={destCoord}
                                anchor={{ x: 0.5, y: 1 }}
                                tracksViewChanges={destTracking}
                            >
                                {!isNavigating
                                    ? <IdleMarker label={destinationLabel} isPickup={isPickupPhase} />
                                    : isPickupPhase
                                        ? <WarehouseMarker label={destinationLabel} />
                                        : <CustomerMarker label={destinationLabel} />
                                }
                            </Marker>
                        )}

                        {/* Dashed idle line (before journey) */}
                        {!isNavigating && liveLocation && destCoord && (
                            <Polyline
                                coordinates={[liveLocation, destCoord]}
                                strokeColor={routeColor + '55'}
                                strokeWidth={3}
                                lineDashPattern={[10, 8]}
                            />
                        )}

                        {/* Placeholder while fetching */}
                        {isNavigating && isFetchingRoute && liveLocation && destCoord && (
                            <Polyline
                                coordinates={[liveLocation, destCoord]}
                                strokeColor={routeColor + '70'}
                                strokeWidth={4}
                                lineDashPattern={[8, 6]}
                            />
                        )}

                        {/* Real road route — 3 layers */}
                        {isNavigating && !isFetchingRoute && routeCoords.length > 1 && (
                            <>
                                <Polyline
                                    coordinates={routeCoords}
                                    strokeColor={routeGlow}
                                    strokeWidth={18}
                                    lineJoin="round"
                                    lineCap="round"
                                />
                                <Polyline
                                    coordinates={routeCoords}
                                    strokeColor="#ffffff"
                                    strokeWidth={10}
                                    lineJoin="round"
                                    lineCap="round"
                                />
                                <Polyline
                                    coordinates={routeCoords}
                                    strokeColor={routeColor}
                                    strokeWidth={6}
                                    lineJoin="round"
                                    lineCap="round"
                                />
                            </>
                        )}
                    </MapView>
                )}

                {/* Route loading toast */}
                {isFetchingRoute && (
                    <View style={s.routeToast}>
                        <ActivityIndicator size="small" color={Colors.primary} />
                        <Text style={s.routeToastText}>Loading road route…</Text>
                    </View>
                )}

                {/* Top bar */}
                <Animated.View
                    style={[s.topBar, { paddingTop: insets.top + 8, opacity: fadeAnim }]}
                    pointerEvents="box-none"
                >
                    {!isNavigating && (
                        <TouchableOpacity onPress={onClose} style={s.iconCircle} activeOpacity={0.85}>
                            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    )}

                    <View style={[s.infoPill, isNavigating && s.infoPillNav]}>
                        <View style={s.pillRow}>
                            <View style={[s.phaseDot, {
                                backgroundColor: isPickupPhase ? '#F59E0B' : Colors.primary,
                            }]} />
                            <Text style={[s.phaseLabel, isNavigating && s.phaseLabelNav]}>
                                {isPickupPhase ? 'PICKUP' : 'DELIVERY'}
                            </Text>
                            {isNavigating && (
                                <View style={s.livePill}>
                                    <Animated.View style={[s.liveDot, { transform: [{ scale: pulseAnim }] }]} />
                                    <Text style={s.liveText}>LIVE</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[s.destName, isNavigating && s.destNameNav]} numberOfLines={1}>
                            {destinationLabel}
                        </Text>
                        {distanceKm !== null && (
                            <Text style={[s.etaText, isNavigating && s.etaTextNav]}>
                                {distanceKm} km · ~{etaMin} min away
                            </Text>
                        )}
                    </View>

                    {!isNavigating && (
                        <TouchableOpacity onPress={fitMap} style={s.iconCircle} activeOpacity={0.85}>
                            <Ionicons name="scan-outline" size={20} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {/* Nav close button */}
                {isNavigating && (
                    <Animated.View style={[s.navClose, { top: insets.top + 8, opacity: fadeAnim }]}>
                        <TouchableOpacity onPress={onClose} style={s.iconCircle} activeOpacity={0.85}>
                            <Ionicons name="close" size={20} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Bottom card */}
                <Animated.View
                    style={[
                        s.bottomCard,
                        {
                            paddingBottom: Math.max(insets.bottom + 8, 20),
                            transform: [{ translateY: slideAnim }],
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    {distanceKm !== null && (
                        <View style={s.statsRow}>
                            <View style={s.statItem}>
                                <Ionicons name="navigate-circle" size={18} color={Colors.primary} />
                                <Text style={s.statVal}>{distanceKm} km</Text>
                                <Text style={s.statLbl}>Distance</Text>
                            </View>
                            <View style={s.statDiv} />
                            <View style={s.statItem}>
                                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                                <Text style={s.statVal}>~{etaMin} min</Text>
                                <Text style={s.statLbl}>ETA</Text>
                            </View>
                            <View style={s.statDiv} />
                            <View style={s.statItem}>
                                <Ionicons
                                    name={isPickupPhase ? 'business' : 'home'}
                                    size={18}
                                    color={isPickupPhase ? '#D97706' : '#10B981'}
                                />
                                <Text style={s.statVal}>{isPickupPhase ? 'Pickup' : 'Deliver'}</Text>
                                <Text style={s.statLbl}>Phase</Text>
                            </View>
                        </View>
                    )}

                    <View style={s.btnRow}>
                        {!isNavigating && (
                            <TouchableOpacity
                                onPress={openExternalMaps}
                                style={s.secondaryBtn}
                                activeOpacity={0.82}
                            >
                                <Ionicons name="map-outline" size={18} color={Colors.primary} />
                                <Text style={s.secondaryBtnTxt}>Google Maps</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={toggleNavigation}
                            style={s.mainBtnWrap}
                            activeOpacity={0.88}
                            disabled={isFetchingRoute}
                        >
                            <LinearGradient
                                colors={isNavigating ? ['#EF4444', '#B91C1C'] : ['#10B981', '#059669']}
                                style={s.mainBtn}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isFetchingRoute
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Ionicons
                                        name={isNavigating ? 'stop-circle' : 'navigate'}
                                        size={22} color="#fff"
                                    />
                                }
                                <Text style={s.mainBtnTxt}>
                                    {isFetchingRoute ? 'Loading Route…'
                                        : isNavigating ? 'Stop Journey'
                                            : 'Start Journey'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },
    loader: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        gap: 14, backgroundColor: Colors.background,
    },
    loaderText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600' },
    routeToast: {
        position: 'absolute', top: '48%', alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(255,255,255,0.96)',
        paddingHorizontal: 18, paddingVertical: 11,
        borderRadius: 22, ...Shadow.lg,
    },
    routeToastText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
    topBar: {
        position: 'absolute', top: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'flex-start',
        paddingHorizontal: Spacing.md, gap: 10,
    },
    iconCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        marginTop: 2, ...Shadow.md,
    },
    infoPill: {
        flex: 1, backgroundColor: '#fff',
        borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10,
        ...Shadow.md,
    },
    infoPillNav: { backgroundColor: Colors.primary },
    pillRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    phaseDot: { width: 7, height: 7, borderRadius: 4 },
    phaseLabel: { fontSize: 9, fontWeight: '900', color: Colors.textMuted, letterSpacing: 1.2, flex: 1 },
    phaseLabelNav: { color: 'rgba(255,255,255,0.65)' },
    livePill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
    liveText: { fontSize: 8, fontWeight: '900', color: '#4ADE80', letterSpacing: 1 },
    destName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
    destNameNav: { color: '#fff' },
    etaText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginTop: 1 },
    etaTextNav: { color: 'rgba(255,255,255,0.7)' },
    navClose: { position: 'absolute', right: Spacing.md },
    bottomCard: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 16, paddingHorizontal: Spacing.md,
        gap: 14, ...Shadow.lg,
    },
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-around', paddingVertical: 4,
    },
    statItem: { alignItems: 'center', gap: 3, flex: 1 },
    statVal: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
    statLbl: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
    statDiv: { width: 1, height: 36, backgroundColor: Colors.border },
    btnRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    secondaryBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderWidth: 1.5, borderColor: Colors.primary,
        borderRadius: BorderRadius.md, paddingVertical: 13, paddingHorizontal: 14,
    },
    secondaryBtnTxt: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
    mainBtnWrap: { flex: 1, borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadow.sm },
    mainBtn: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, paddingVertical: 15,
    },
    mainBtnTxt: { color: '#fff', fontWeight: '900', fontSize: FontSize.md, letterSpacing: 0.3 },
});