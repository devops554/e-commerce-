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
import { Shipment } from '../../types';
import { Badge, EmptyState } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { DeliveryAddressCard } from '../../components/orders/Deliveryaddresscard';

const isCOD = (method: string) => method?.toLowerCase() === 'cod';

export default function AvailableOrdersScreen() {
  const navigation = useNavigation<any>();
  const partner = useAuthStore((s) => s.partner);
  const { data: shipments, isLoading, refetch } = useAvailableOrders();
  const acceptOrder = useAcceptOrder();
  const rejectOrder = useRejectOrder();

  useEffect(() => {
    const unsub = socketService.onNewOrder(() => { refetch(); });
    return unsub;
  }, []);

  const handleAccept = async (shipmentId: string, orderId: string) => {
    try {
      await acceptOrder.mutateAsync({ shipmentId });
      navigation.navigate('ActiveDelivery', { shipmentId });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not accept order');
    }
  };

  const handleReject = (shipmentId: string, orderId: string) => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => { await rejectOrder.mutateAsync({ shipmentId }); },
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>New Requests</Text>
          <Text style={styles.headerSub}>{shipments?.length ?? 0} orders available</Text>
        </View>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={shipments}
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
            shipment={item}
            index={index}
            partnerLocation={partner?.currentLocation ?? null}
            onAccept={() => handleAccept(item._id, item.orderId._id)}
            onReject={() => handleReject(item._id, item.orderId._id)}
            accepting={acceptOrder.isPending}
          />
        )}
      />
    </SafeAreaView>
  );
}

interface OrderCardProps {
  shipment: Shipment;
  index: number;
  partnerLocation: { latitude: number; longitude: number } | null;
  onAccept: () => void;
  onReject: () => void;
  accepting: boolean;
}

const OrderRequestCard: React.FC<OrderCardProps> = ({
  shipment, index, partnerLocation, onAccept, onReject, accepting,
}) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const order = shipment.orderId;
  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const cod = isCOD(order.paymentMethod);

  // Warehouse coords — if warehouseId is populated with location data
  const warehouseLocation = (shipment as any).warehouseId?.location ?? null;

  return (
    <Animated.View style={[styles.orderCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

      {/* Top: Order ID + Badges */}
      <View style={styles.cardTop}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.orderId} numberOfLines={1}>#{order.orderId}</Text>
          <Text style={styles.itemCount}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.badgeRow}>
          <Badge
            label={cod ? '💵 COD' : '💳 PAID'}
            backgroundColor={cod ? Colors.warningLight : Colors.successLight}
            color={cod ? Colors.warning : Colors.success}
          />
          <Badge
            label={shipment.status.replace(/_/g, ' ')}
            backgroundColor={Colors.surfaceAlt}
            color={Colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Info grid */}
      <View style={styles.infoGrid}>
        <InfoItem icon="📦" label="Order ID" value={order.orderId} />
        <InfoItem icon="💰" label="Order Value" value={formatCurrency(order.totalAmount)} />
        {cod && (
          <InfoItem icon="🏦" label="COD Amount" value={formatCurrency(order.totalAmount)} highlight />
        )}
        {shipment.estimatedTime !== undefined && (
          <InfoItem icon="⏱" label="Est. Time" value={`${shipment.estimatedTime} min`} />
        )}
        <InfoItem icon="🔖" label="Tracking" value={shipment.trackingNumber} />
      </View>

      <View style={styles.divider} />

      {/* DeliveryAddressCard — call, map, full address, distances */}
      <DeliveryAddressCard
        address={order.shippingAddress}
        partnerLocation={partnerLocation}
        warehouseLocation={warehouseLocation}
        backendDistanceKm={shipment.distance}
      />

      {/* Accept / Reject */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onReject} style={styles.rejectBtn} activeOpacity={0.8}>
          <Text style={styles.rejectText}>✕ Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onAccept} disabled={accepting} activeOpacity={0.85} style={{ flex: 1 }}>
          <LinearGradient
            colors={[Colors.success, '#009970']}
            style={styles.acceptBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {accepting
              ? <ActivityIndicator color={Colors.white} size="small" />
              : <Text style={styles.acceptText}>✓ Accept Order</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const InfoItem = ({
  icon, label, value, highlight = false,
}: {
  icon: string; label: string; value: string; highlight?: boolean;
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
  list: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 32 },
  orderCard: { backgroundColor: Colors.white, borderRadius: 20, padding: Spacing.md, ...Shadow.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  orderId: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  itemCount: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '55%' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  infoGrid: { gap: 7 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, flex: 1, textAlign: 'right' },
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
  acceptBtn: { borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  acceptText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
});