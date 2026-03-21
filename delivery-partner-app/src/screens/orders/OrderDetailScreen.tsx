// src/screens/orders/OrderDetailScreen.tsx

import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useOrderDetail } from '../../hooks/useQueries';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import {
    formatCurrency,
    formatDate,
    getOrderStatusColor,
    getOrderStatusLabel,
    isCOD,
} from '../../utils/helpers';
import { Divider } from '../../components/ui';
import { DestinationCard } from '../../components/orders/active/DestinationCard';
import { PaymentItems } from '../../components/orders/active/PaymentItems';

export default function OrderDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const orderId: string = route.params?.orderId;

    const { data: order, isLoading, error } = useOrderDetail(orderId);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <ActivityIndicator color={Colors.primary} size="large" />
                    <Text style={styles.loadingText}>Loading order...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !order) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <View style={styles.errorIconWrap}>
                        <Ionicons name="alert-circle-outline" size={40} color={Colors.danger} />
                    </View>
                    <Text style={styles.errorText}>Order not found</Text>
                    <Text style={styles.errorSubText}>
                        This order may have been removed or is unavailable.
                    </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={16} color={Colors.white} />
                        <Text style={styles.backBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const statusColor = getOrderStatusColor(order.orderStatus);
    const displayId = order.orderId ? String(order.orderId).slice(-8) : 'N/A';

    return (
        <SafeAreaView style={styles.safe}>

            {/* ── Header ─────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerEyebrow}>ORDER DETAILS</Text>
                    <Text style={styles.headerTitle}>#{displayId}</Text>
                </View>

                {/* Right placeholder keeps title centered */}
                <View style={styles.iconBtn} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >

                {/* ── Status + Date ───────────────────────────── */}
                <View style={styles.statusSection}>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor + '15', borderColor: statusColor + '45' },
                    ]}>
                        <View style={[styles.statusPulse, { backgroundColor: statusColor + '28' }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        </View>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {getOrderStatusLabel(order.orderStatus)}
                        </Text>
                    </View>
                    <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                    </View>
                </View>

                {/* ── Customer Address Card ────────────────────── */}
                <DestinationCard
                    label="CUSTOMER DETAILS"
                    title={order.user?.name || 'Customer'}
                    address={
                        [order.shippingAddress?.street, order.shippingAddress?.city]
                            .filter(Boolean)
                            .join(', ') || 'Address not available'
                    }
                    phone={order.user?.phone}
                    icon="person"
                    onCall={() => { }}
                />

                {/* ── Items & Payment ──────────────────────────── */}
                <PaymentItems
                    items={order.items || []}
                    paymentMethod={order.paymentMethod}
                    totalAmount={order.totalAmount ?? 0}
                />

                {/* ── Order History Timeline ───────────────────── */}
                <View style={styles.historyCard}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconWrap}>
                            <Ionicons name="time-outline" size={14} color={Colors.primary} />
                        </View>
                        <Text style={styles.sectionTitle}>Order Timeline</Text>
                    </View>

                    <Divider style={styles.divider} />

                    {(order.history || []).slice().reverse().map((event: any, idx: number) => {
                        const isLatest = idx === 0;
                        const isLast = idx === (order.history?.length || 0) - 1;
                        return (
                            <View key={idx} style={styles.historyItem}>

                                {/* Timeline spine */}
                                <View style={styles.timeline}>
                                    <View style={[
                                        styles.timelineDot,
                                        isLatest && {
                                            backgroundColor: Colors.primary,
                                            shadowColor: Colors.primary,
                                            shadowOpacity: 0.5,
                                            shadowRadius: 6,
                                            shadowOffset: { width: 0, height: 0 },
                                            elevation: 5,
                                            width: 14,
                                            height: 14,
                                            borderRadius: 7,
                                        },
                                    ]} />
                                    {!isLast && <View style={styles.timelineLine} />}
                                </View>

                                {/* Event content */}
                                <View style={[
                                    styles.historyContent,
                                    isLatest && styles.historyContentActive,
                                ]}>
                                    <Text style={[
                                        styles.historyStatus,
                                        isLatest && { color: Colors.primary },
                                    ]}>
                                        {getOrderStatusLabel(event.status)}
                                    </Text>
                                    <View style={styles.timeRow}>
                                        <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
                                        <Text style={styles.historyTime}>{formatDate(event.timestamp)}</Text>
                                    </View>
                                    {event.note ? (
                                        <View style={styles.noteWrap}>
                                            <Ionicons name="chatbox-ellipses-outline" size={11} color={Colors.textMuted} />
                                            <Text style={styles.historyNote}>{event.note}</Text>
                                        </View>
                                    ) : null}
                                </View>

                            </View>
                        );
                    })}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

    // ── Layout ───────────────────────────────────────────────────
    safe: {
        flex: 1,
        backgroundColor: '#F2F3F7',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 36,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: 52,
        gap: Spacing.md,
    },

    // ── Loading ───────────────────────────────────────────────────
    loadingText: {
        fontSize: 13,
        color: Colors.textMuted,
        marginTop: 4,
        fontWeight: '500',
    },

    // ── Error State ───────────────────────────────────────────────
    errorIconWrap: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: Colors.danger + '10',
        borderWidth: 1.5,
        borderColor: Colors.danger + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: 0.2,
    },
    errorSubText: {
        fontSize: 13,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: Colors.primary,
        borderRadius: 14,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    backBtnText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: 14,
    },

    // ── Header ────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        height: 62,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E9EF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    iconBtn: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: '#F2F3F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        alignItems: 'center',
        gap: 1,
    },
    headerEyebrow: {
        fontSize: 9,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.6,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: 0.4,
    },

    // ── Status ────────────────────────────────────────────────────
    statusSection: {
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: BorderRadius.full,
        borderWidth: 1.5,
    },
    statusPulse: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    orderDate: {
        fontSize: 12,
        color: Colors.textMuted,
        fontWeight: '500',
    },

    // ── History Card ──────────────────────────────────────────────
    historyCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: Colors.primary + '12',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.textSecondary,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    divider: {
        marginVertical: 14,
    },

    // ── Timeline ──────────────────────────────────────────────────
    historyItem: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 16,
    },
    timeline: {
        alignItems: 'center',
        width: 16,
        paddingTop: 3,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#D8DBE6',
        zIndex: 1,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E8EAF0',
        position: 'absolute',
        top: 15,
        bottom: -16,
        borderRadius: 1,
    },

    // ── History Event Content ─────────────────────────────────────
    historyContent: {
        flex: 1,
        gap: 3,
        paddingBottom: 2,
    },
    historyContentActive: {
        backgroundColor: Colors.primary + '08',
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary + '60',
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: -4,
        marginLeft: -2,
    },
    historyStatus: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: 0.1,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    historyTime: {
        fontSize: 11,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    noteWrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 4,
        marginTop: 5,
        backgroundColor: '#F6F7FA',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    historyNote: {
        flex: 1,
        fontSize: 12,
        color: Colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 17,
    },
});