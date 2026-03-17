// src/screens/orders/ActiveOrdersListScreen.tsx

import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Animated,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useActiveOrders } from '../../hooks/useQueries';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import {
    formatCurrency,
    isCOD,
} from '../../utils/helpers';
import { Shipment, Order } from '../../types';

// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Phase config ──────────────────────────────────────────────────────────────
const getPhaseConfig = (status: string, isReverse = false): {
    label: string;
    icon: IoniconsName;
    color: string;
    step: number;
} => {
    switch (status) {
        case 'ACCEPTED':
            return { label: isReverse ? 'Customer Pickup' : 'Pickup Pending', icon: 'location', color: '#F59E0B', step: 1 };
        case 'PICKED_UP':
            return { label: 'Picked Up', icon: 'cube', color: Colors.primary, step: 2 };
        case 'OUT_FOR_DELIVERY':
            return { label: isReverse ? 'Return to Warehouse' : 'Out for Delivery', icon: 'bicycle', color: '#10B981', step: 3 };
        default:
            return { label: status, icon: 'receipt', color: Colors.textSecondary, step: 0 };
    }
};

// ── Animated Order Card ───────────────────────────────────────────────────────
const OrderCard = ({
    shipment,
    index,
    onPress,
}: {
    shipment: Shipment;
    index: number;
    onPress: () => void;
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 380,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 340,
                delay: index * 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const order = shipment.orderId as Order;
    if (!order) return null;

    const isReverse = shipment.type === 'REVERSE';
    const phase = getPhaseConfig(shipment.status, isReverse);
    const isCod = isCOD(order.paymentMethod);
    const orderId = typeof order.orderId === 'string'
        ? order.orderId.slice(-8)
        : shipment._id?.slice(-8);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity
                activeOpacity={0.88}
                onPress={onPress}
                style={styles.cardOuter}
            >
                {/* Left accent bar */}
                <View style={[styles.cardAccentBar, { backgroundColor: phase.color }]} />

                <View style={styles.cardInner}>
                    {/* Top Row */}
                    <View style={styles.cardTopRow}>
                        <View style={styles.orderMeta}>
                            <Text style={styles.orderId}>#{orderId}</Text>
                            <View style={styles.customerRow}>
                                <Ionicons name="person-circle-outline" size={13} color={Colors.textSecondary} />
                                <Text style={styles.customerName} numberOfLines={1}>
                                    {order.user?.name || 'Customer'}
                                </Text>
                            </View>
                        </View>

                        {/* Phase pill */}
                        <View style={[styles.phasePill, { backgroundColor: phase.color + '18', borderColor: phase.color + '40' }]}>
                            <Ionicons name={phase.icon} size={12} color={phase.color} />
                            <Text style={[styles.phasePillText, { color: phase.color }]}>
                                {phase.label}
                            </Text>
                        </View>
                    </View>

                    {/* Progress steps */}
                    <View style={styles.progressRow}>
                        {[1, 2, 3].map((step) => (
                            <React.Fragment key={step}>
                                <View style={[
                                    styles.progressDot,
                                    {
                                        backgroundColor: phase.step >= step ? phase.color : Colors.border,
                                        transform: [{ scale: phase.step === step ? 1.25 : 1 }],
                                    }
                                ]} />
                                {step < 3 && (
                                    <View style={[
                                        styles.progressLine,
                                        { backgroundColor: phase.step > step ? phase.color : Colors.border }
                                    ]} />
                                )}
                            </React.Fragment>
                        ))}
                        <Text style={[styles.progressLabel, { color: phase.color }]}>
                            {['', 'Pickup', 'Picked Up', isReverse ? 'Returning' : 'Delivering'][phase.step]}
                        </Text>
                    </View>

                    {/* Address */}
                    <View style={styles.addressRow}>
                        <View style={[styles.addressDot, { backgroundColor: isReverse ? '#8B5CF6' : '#EF4444' }]} />
                        <Text style={styles.addressText} numberOfLines={1}>
                            {isReverse ? 'Return Pickup' : `${order.shippingAddress?.street}, ${order.shippingAddress?.city}`}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.cardDivider} />

                    {/* Bottom Row */}
                    <View style={styles.cardBottomRow}>
                        {/* Payment badge */}
                        <View style={[
                            styles.paymentBadge,
                            { backgroundColor: isCod ? '#FEF3C7' : '#D1FAE5' }
                        ]}>
                            <Ionicons
                                name={isCod ? 'cash-outline' : 'checkmark-circle-outline'}
                                size={13}
                                color={isCod ? '#D97706' : '#059669'}
                            />
                            <Text style={[styles.paymentText, { color: isCod ? '#D97706' : '#059669' }]}>
                                {isCod ? 'COD (TO COLLECT)' : 'Prepaid'}
                            </Text>
                        </View>

                        {/* Amount */}
                        <Text style={styles.amountValue}>
                            {formatCurrency(order.totalAmount)}
                        </Text>

                        {/* Items chip */}
                        <View style={styles.itemsChip}>
                            <Ionicons name="cube-outline" size={12} color={Colors.textSecondary} />
                            <Text style={styles.itemsText}>{order.items?.length ?? 0} items</Text>
                        </View>

                        {/* Arrow */}
                        <View style={[styles.arrowBtn, { backgroundColor: phase.color + '18' }]}>
                            <Ionicons name="chevron-forward" size={16} color={phase.color} />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ── Summary Chip ──────────────────────────────────────────────────────────────
const SummaryChip = ({
    icon,
    count,
    label,
    color,
}: {
    icon: IoniconsName;
    count: number;
    label: string;
    color: string;
}) => (
    <View style={styles.summaryChip}>
        <View style={[styles.summaryChipIcon, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text style={[styles.summaryChipCount, { color }]}>{count}</Text>
        <Text style={styles.summaryChipLabel}>{label}</Text>
    </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ActiveOrdersListScreen() {
    const navigation = useNavigation<any>();
    
    // Pagination & Search state
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const { data: responseData, isLoading, refetch, isRefetching } = useActiveOrders({
        page,
        limit: 10,
        search: debouncedSearch
    });

    const headerFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    // Extract paginated array (or fallback if backend returns flat array)
    const activeShipments: Shipment[] = Array.isArray(responseData) ? responseData : (responseData?.data || []);
    const totalPages = !Array.isArray(responseData) ? (responseData as any)?.totalPages || 1 : 1;
    const hasOrders = activeShipments.length > 0;

    if (isLoading && !isRefetching) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <ActivityIndicator color={Colors.primary} size="large" />
                    <Text style={styles.loadingText}>Loading active orders...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>

            {/* ── Header ── */}
            <Animated.View style={{ opacity: headerFade }}>
                <LinearGradient
                    colors={[Colors.primary, Colors.primaryLight || '#818CF8']}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Decor */}
                    <View style={styles.headerDecor1} />
                    <View style={styles.headerDecor2} />

                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={20} color={Colors.white} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerLabel}>DELIVERY PARTNER</Text>
                            <Text style={styles.headerTitle}>Active Orders</Text>
                        </View>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{activeShipments.length}</Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={18} color={Colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search order ID or customer..."
                            placeholderTextColor={Colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Summary row */}
                    {hasOrders && (
                        <View style={styles.summaryRow}>
                            <SummaryChip
                                icon="location"
                                count={activeShipments.filter(s => s.status === 'ACCEPTED').length}
                                label="Pickup"
                                color="#FCD34D"
                            />
                            <View style={styles.summaryRowDivider} />
                            <SummaryChip
                                icon="cube"
                                count={activeShipments.filter(s => s.status === 'PICKED_UP').length}
                                label="Picked Up"
                                color="#93C5FD"
                            />
                            <View style={styles.summaryRowDivider} />
                            <SummaryChip
                                icon="bicycle"
                                count={activeShipments.filter(s => s.status === 'OUT_FOR_DELIVERY').length}
                                label="En Route"
                                color="#6EE7B7"
                            />
                        </View>
                    )}
                </LinearGradient>
            </Animated.View>

            {/* ── List / Empty ── */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.content, !hasOrders && styles.contentEmpty]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={Colors.primary}
                    />
                }
            >
                {!hasOrders ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrap}>
                            <Ionicons name="bicycle-outline" size={52} color={Colors.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>No Active Orders</Text>
                        <Text style={styles.emptySubtitle}>
                            You have no orders assigned right now.{'\n'}Pull down to refresh.
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Home')}
                            style={styles.homeBtn}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="home-outline" size={16} color={Colors.white} />
                            <Text style={styles.homeBtnText}>Go to Home</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {activeShipments.map((shipment, index) => (
                            <OrderCard
                                key={shipment._id}
                                shipment={shipment}
                                index={index}
                                onPress={() => navigation.navigate('ActiveDelivery', { shipmentId: shipment._id })}
                            />
                        ))}
                        
                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <View style={styles.paginationContainer}>
                                <TouchableOpacity 
                                    style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                                    disabled={page === 1}
                                    onPress={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    <Ionicons name="chevron-back" size={18} color={page === 1 ? Colors.textMuted : Colors.primary} />
                                    <Text style={[styles.pageText, page === 1 && { color: Colors.textMuted }]}>Prev</Text>
                                </TouchableOpacity>

                                <Text style={styles.pageIndicator}>Page {page} of {totalPages}</Text>

                                <TouchableOpacity 
                                    style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                                    disabled={page === totalPages}
                                    onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    <Text style={[styles.pageText, page === totalPages && { color: Colors.textMuted }]}>Next</Text>
                                    <Ionicons name="chevron-forward" size={18} color={page === totalPages ? Colors.textMuted : Colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={{ height: 24 }} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { color: Colors.textSecondary, fontSize: FontSize.sm },

    // Header
    header: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.lg,
        overflow: 'hidden',
    },
    headerDecor1: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.07)',
        top: -60,
        right: -40,
    },
    headerDecor2: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        bottom: 10,
        right: 100,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: Spacing.md,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 1.2 },
    headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white, letterSpacing: -0.3, marginTop: 2 },
    countBadge: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.white },

    // Summary chips inside header
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 44,
        marginBottom: Spacing.md,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
    },
    summaryRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: 'center',
        gap: 4,
    },
    summaryChip: { flex: 1, alignItems: 'center', gap: 3 },
    summaryChipIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    summaryChipCount: { fontSize: FontSize.lg, fontWeight: '900' },
    summaryChipLabel: { fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.3 },
    summaryRowDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },

    // List
    content: { padding: Spacing.md, gap: Spacing.sm },
    contentEmpty: { flex: 1 },

    // Card
    cardOuter: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 18,
        overflow: 'hidden',
        ...Shadow.sm,
    },
    cardAccentBar: { width: 4, borderRadius: 4 },
    cardInner: { flex: 1, padding: 14, gap: 10 },

    cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    orderMeta: { flex: 1, gap: 3 },
    orderId: { fontSize: FontSize.md, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.2 },
    customerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    customerName: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },

    phasePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        flexShrink: 0,
    },
    phasePillText: { fontSize: 11, fontWeight: '800' },

    // Progress steps
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    progressLine: {
        flex: 1,
        height: 2,
        borderRadius: 1,
    },
    progressLabel: {
        fontSize: 10,
        fontWeight: '800',
        marginLeft: 6,
        letterSpacing: 0.2,
    },

    // Address
    addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    addressDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
    addressText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },

    cardDivider: { height: 1, backgroundColor: Colors.border },

    cardBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    paymentText: { fontSize: 11, fontWeight: '800' },

    amountValue: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: '900',
        color: Colors.textPrimary,
        letterSpacing: -0.2,
    },

    itemsChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    itemsText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },

    arrowBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 14,
    },
    emptyIconWrap: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.primary + '12',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    emptyTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    homeBtn: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 28,
        paddingVertical: 13,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        ...Shadow.sm,
    },
    homeBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },

    // Pagination
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.sm,
    },
    pageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BorderRadius.md,
        ...Shadow.sm,
    },
    pageBtnDisabled: {
        backgroundColor: Colors.background,
        elevation: 0,
        shadowOpacity: 0,
    },
    pageText: {
        color: Colors.primary,
        fontWeight: '700',
        fontSize: FontSize.sm,
    },
    pageIndicator: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
});