// src/components/home/ActiveOrderCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Order } from '../../types';
import { Badge } from '../ui';
import { Colors, Spacing, FontSize, Shadow } from '../../utils/theme';
import { formatCurrency, getOrderStatusLabel, isCOD } from '../../utils/helpers';

interface ActiveOrderCardProps {
    order: Order;
    onPress: () => void;
}

export const ActiveOrderCard = ({ order, onPress }: ActiveOrderCardProps) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.92}
    >
        <LinearGradient
            colors={[Colors.accent, Colors.accentDark]}
            style={styles.activeOrderCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.activeOrderTop}>
                <View>
                    <Text style={styles.activeOrderLabel}>ACTIVE DELIVERY</Text>
                    <Text style={styles.activeOrderId}>#{typeof order.orderId === 'string' ? order.orderId : 'ID Error'}</Text>
                </View>
                <Badge
                    label={getOrderStatusLabel(order.orderStatus)}
                    backgroundColor="rgba(255,255,255,0.25)"
                    color={Colors.primary}
                />
            </View>

            <View style={styles.activeOrderMiddle}>
                <View style={styles.activeOrderInfo}>
                    <Text style={styles.activeOrderCustomer}>👤 {order.user.name}</Text>
                    <Text style={styles.activeOrderPayment}>
                        {isCOD(order.paymentMethod) ? '💵 Collect: ' : '✅ Paid: '}
                        <Text style={{ fontWeight: '800' }}>
                            {formatCurrency(order.totalAmount + (order.deliveryFee || 0))}
                        </Text>
                    </Text>
                </View>
            </View>

            <View style={styles.activeOrderBottom}>
                <Text style={styles.activeOrderAddr} numberOfLines={2}>
                    📍 {order.shippingAddress.street}, {order.shippingAddress.city}
                </Text>
                <Text style={styles.activeOrderArrow}>→</Text>
            </View>
        </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    activeOrderCard: {
        borderRadius: 20,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadow.md,
    },
    activeOrderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    activeOrderLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5 },
    activeOrderId: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
    activeOrderMiddle: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 12,
        marginVertical: 12
    },
    activeOrderInfo: { gap: 4 },
    activeOrderCustomer: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
    activeOrderPayment: { fontSize: FontSize.sm, color: Colors.primary },
    activeOrderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    activeOrderAddr: { fontSize: FontSize.sm, color: Colors.primary, flex: 1, lineHeight: 20 },
    activeOrderArrow: { fontSize: 24, color: Colors.primary, fontWeight: '700' },
});
