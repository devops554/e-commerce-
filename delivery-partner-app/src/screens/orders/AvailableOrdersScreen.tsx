// src/screens/orders/AvailableOrdersScreen.tsx

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAvailableOrders, useAcceptOrder, useRejectOrder } from '../../hooks/useQueries';
import { socketService } from '../../services/socketService';
import { Order } from '../../types';
import { Badge, EmptyState } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import {
  formatCurrency,
  formatDistance,
  getPaymentMethodLabel,
  isCOD,
} from '../../utils/helpers';
import { useNavigation } from '@react-navigation/native';

export default function AvailableOrdersScreen() {
  const navigation = useNavigation<any>();
  const { data: orders, isLoading, refetch } = useAvailableOrders();
  const acceptOrder = useAcceptOrder();
  const rejectOrder = useRejectOrder();

  useEffect(() => {
    const unsub = socketService.onNewOrder(() => {
      refetch();
    });
    return unsub;
  }, []);

  const handleAccept = async (orderId: string) => {
    try {
      await acceptOrder.mutateAsync(orderId);
      navigation.navigate('ActiveDelivery', { orderId });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not accept order');
    }
  };

  const handleReject = (orderId: string) => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          await rejectOrder.mutateAsync(orderId);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>New Requests</Text>
          <Text style={styles.headerSub}>{orders?.length ?? 0} orders available</Text>
        </View>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
            title="No orders right now"
            subtitle="Stay online to receive new delivery requests"
          />
        }
        renderItem={({ item, index }) => (
          <OrderRequestCard
            order={item}
            index={index}
            onAccept={() => handleAccept(item._id)}
            onReject={() => handleReject(item._id)}
            accepting={acceptOrder.isPending}
          />
        )}
      />
    </SafeAreaView>
  );
}

interface OrderCardProps {
  order: Order;
  index: number;
  onAccept: () => void;
  onReject: () => void;
  accepting: boolean;
}

const OrderRequestCard: React.FC<OrderCardProps> = ({
  order,
  index,
  onAccept,
  onReject,
  accepting,
}) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 9,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Animated.View
      style={[
        styles.orderCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Top row */}
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.orderId}>#{order.orderId}</Text>
          <Text style={styles.itemCount}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
        </View>
        <Badge
          label={isCOD(order.paymentMethod) ? '💵 COD' : '💳 PAID'}
          backgroundColor={isCOD(order.paymentMethod) ? Colors.warningLight : Colors.successLight}
          color={isCOD(order.paymentMethod) ? Colors.warning : Colors.success}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Info grid */}
      <View style={styles.infoGrid}>
        <InfoItem
          icon="📍"
          label="Deliver to"
          value={`${order.shippingAddress.city}, ${order.shippingAddress.state}`}
        />
        {order.distance !== undefined && (
          <InfoItem icon="🛣" label="Distance" value={formatDistance(order.distance * 1000)} />
        )}
        <InfoItem icon="💰" label="Order Value" value={formatCurrency(order.totalAmount)} />
        {isCOD(order.paymentMethod) && (
          <InfoItem
            icon="🏦"
            label="COD Amount"
            value={formatCurrency(order.totalAmount)}
            highlight
          />
        )}
      </View>

      {/* Address */}
      <View style={styles.addressBox}>
        <Text style={styles.addressText} numberOfLines={2}>
          📌 {order.shippingAddress.street}
          {order.shippingAddress.landmark ? `, ${order.shippingAddress.landmark}` : ''}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onReject}
          style={styles.rejectBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.rejectText}>✕ Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onAccept}
          disabled={accepting}
          activeOpacity={0.85}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[Colors.success, '#009970']}
            style={styles.acceptBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {accepting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.acceptText}>✓ Accept Order</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{icon} {label}</Text>
    <Text style={[styles.infoValue, highlight && { color: Colors.warning, fontWeight: '800' }]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.textPrimary, lineHeight: 26, textAlign: 'center', marginTop: -2 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.md, gap: Spacing.md },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.md,
    ...Shadow.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  orderId: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  itemCount: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  infoGrid: { gap: 6, marginBottom: Spacing.sm },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  addressBox: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: 10,
    marginBottom: Spacing.md,
  },
  addressText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  rejectBtn: {
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: { color: Colors.danger, fontWeight: '700', fontSize: FontSize.sm },
  acceptBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
});