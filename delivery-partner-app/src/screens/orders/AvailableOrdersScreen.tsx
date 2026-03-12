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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAvailableOrders, useAcceptOrder, useRejectOrder } from '../../hooks/useQueries';
import { socketService } from '../../services/socketService';
import { Shipment } from '../../types';
import { EmptyState } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { DeliveryAddressCard } from '../../components/orders/Deliveryaddresscard';

// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const isCOD = (method: string) => method?.toLowerCase() === 'cod';

const formatWarehouseAddress = (address: any) => {
  if (!address) return '';
  const { addressLine1, addressLine2, city, pincode } = address;
  return [addressLine1, addressLine2, city, pincode].filter(Boolean).join(', ');
};

// ── Info Row Item ─────────────────────────────────────────────────────────────
const InfoItem = ({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: IoniconsName;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.infoItem}>
    <View style={styles.infoLabelRow}>
      <Ionicons name={icon} size={13} color={Colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>
      {value}
    </Text>
  </View>
);

// ── Order Request Card ────────────────────────────────────────────────────────
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
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 380, delay: index * 90, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 55, friction: 9, delay: index * 90, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const order = shipment.orderId;
  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const cod = isCOD(order.paymentMethod);

  const warehouse = (shipment as any).warehouseId;
  const warehouseLocation = warehouse?.location ?? null;
  const warehouseName = warehouse?.name ?? 'Warehouse';
  const warehouseAddress = formatWarehouseAddress(warehouse?.address);

  return (
    <Animated.View style={[
      styles.orderCard,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>

      {/* ── Card Header ── */}
      <LinearGradient
        colors={[Colors.primary + 'F0', Colors.primaryLight || '#818CF8']}
        style={styles.cardHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decor circle */}
        <View style={styles.cardHeaderDecor} />

        <View style={styles.cardHeaderContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardHeaderLabel}>ORDER REQUEST</Text>
            <Text style={styles.cardOrderId} numberOfLines={1}>#{order.orderId}</Text>
            <View style={styles.cardHeaderMeta}>
              <Ionicons name="cube-outline" size={12} color="rgba(255,255,255,0.75)" />
              <Text style={styles.cardHeaderMetaText}>
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </Text>
              {shipment.estimatedTime !== undefined && (
                <>
                  <View style={styles.cardMetaDot} />
                  <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.75)" />
                  <Text style={styles.cardHeaderMetaText}>{shipment.estimatedTime} min</Text>
                </>
              )}
            </View>
          </View>

          {/* Payment badge */}
          <View style={[styles.paymentBadge, { backgroundColor: cod ? '#FEF3C7' : '#D1FAE5' }]}>
            <Ionicons
              name={cod ? 'cash' : 'checkmark-circle'}
              size={14}
              color={cod ? '#D97706' : '#059669'}
            />
            <Text style={[styles.paymentBadgeText, { color: cod ? '#D97706' : '#059669' }]}>
              {cod ? 'COD' : 'PAID'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Card Body ── */}
      <View style={styles.cardBody}>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <InfoItem icon="receipt-outline" label="Order Value" value={formatCurrency(order.totalAmount)} />
          {cod && (
            <InfoItem
              icon="cash-outline"
              label="COD to Collect"
              value={formatCurrency(order.totalAmount)}
              highlight
            />
          )}
          {shipment.distance !== undefined && (
            <InfoItem icon="navigate-outline" label="Distance" value={`${shipment.distance} km`} />
          )}
          <InfoItem icon="barcode-outline" label="Tracking" value={shipment.trackingNumber} />
        </View>

        <View style={styles.divider} />

        {/* Warehouse / Pickup */}
        <View style={styles.warehouseSection}>
          <View style={styles.warehouseTitleRow}>
            <View style={styles.warehouseIconWrap}>
              <Ionicons name="business" size={14} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.warehouseSectionLabel}>PICKUP FROM</Text>
              <Text style={styles.warehouseName}>{warehouseName}</Text>
            </View>
          </View>
          {warehouseAddress ? (
            <View style={styles.warehouseAddressRow}>
              <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.warehouseAddress} numberOfLines={2}>
                {warehouseAddress}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        {/* Delivery Address */}
        <DeliveryAddressCard
          address={order.shippingAddress}
          partnerLocation={partnerLocation}
          warehouseLocation={warehouseLocation}
          backendDistanceKm={shipment.distance}
        />

        {/* ── Actions ── */}
        <View style={styles.actions}>
          {/* Reject */}
          <TouchableOpacity
            onPress={onReject}
            style={styles.rejectBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={18} color={Colors.danger} />
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>

          {/* Accept */}
          <TouchableOpacity
            onPress={onAccept}
            disabled={accepting}
            activeOpacity={0.85}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.acceptBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {accepting ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                  <Text style={styles.acceptText}>Accept Order</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AvailableOrdersScreen() {
  const navigation = useNavigation<any>();
  const partner = useAuthStore((s) => s.partner);
  const { data: shipments, isLoading, refetch } = useAvailableOrders();
  const acceptOrder = useAcceptOrder();
  const rejectOrder = useRejectOrder();

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    const unsub = socketService.onNewOrder(() => { refetch(); });
    return unsub;
  }, []);

  const handleAccept = async (shipmentId: string) => {
    try {
      await acceptOrder.mutateAsync({ shipmentId });
      navigation.navigate('ActiveDelivery', { shipmentId });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not accept order');
    }
  };

  const handleReject = (shipmentId: string) => {
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

      {/* ── Header ── */}
      <Animated.View style={{ opacity: headerFade }}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight || '#818CF8']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.headerLabel}>DELIVERY PARTNER</Text>
              <Text style={styles.headerTitle}>New Requests</Text>
            </View>

            {/* Count badge */}
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{shipments?.length ?? 0}</Text>
            </View>

            {/* Refresh */}
            <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Sub info strip */}
          <View style={styles.headerStrip}>
            <Ionicons name="radio-button-on" size={10} color="#4ADE80" />
            <Text style={styles.headerStripText}>
              {shipments?.length
                ? `${shipments.length} order${shipments.length !== 1 ? 's' : ''} waiting near you`
                : 'Waiting for new orders...'}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── List ── */}
      <FlatList
        data={shipments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="mail-open-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No orders right now</Text>
            <Text style={styles.emptySubtitle}>
              Stay online to receive new{'\n'}delivery requests
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <OrderRequestCard
            shipment={item}
            index={index}
            partnerLocation={partner?.currentLocation ?? null}
            onAccept={() => handleAccept(item._id)}
            onReject={() => handleReject(item._id)}
            accepting={acceptOrder.isPending}
          />
        )}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60, right: -40,
  },
  headerDecor2: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 0, right: 110,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.65)',
    fontWeight: '700', letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: FontSize.xl, fontWeight: '900',
    color: Colors.white, letterSpacing: -0.3, marginTop: 2,
  },
  countBadge: {
    minWidth: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: { fontSize: FontSize.md, fontWeight: '900', color: Colors.white },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  headerStripText: {
    fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600',
  },

  // List
  list: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 32 },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 14,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },

  // Order Card
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    overflow: 'hidden',
    ...Shadow.md,
  },

  // Card gradient header
  cardHeader: {
    padding: Spacing.md,
    overflow: 'hidden',
  },
  cardHeaderDecor: {
    position: 'absolute',
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -30, right: -20,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardHeaderLabel: {
    fontSize: 9, color: 'rgba(255,255,255,0.65)',
    fontWeight: '800', letterSpacing: 1.5, marginBottom: 3,
  },
  cardOrderId: {
    fontSize: FontSize.lg, fontWeight: '900',
    color: Colors.white, letterSpacing: -0.3,
  },
  cardHeaderMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4,
  },
  cardMetaDot: {
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  cardHeaderMetaText: {
    fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600',
  },
  paymentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10,
  },
  paymentBadgeText: { fontSize: 12, fontWeight: '800' },

  // Card Body
  cardBody: { padding: Spacing.md, gap: Spacing.sm },

  // Info grid
  infoGrid: { gap: 8 },
  infoItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: {
    fontSize: FontSize.sm, fontWeight: '700',
    color: Colors.textPrimary, flex: 1, textAlign: 'right',
  },
  infoValueHighlight: { color: '#D97706', fontWeight: '900' },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 2 },

  // Warehouse
  warehouseSection: { gap: 6 },
  warehouseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  warehouseIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  warehouseSectionLabel: {
    fontSize: 9, fontWeight: '800',
    color: Colors.textSecondary, letterSpacing: 1.2,
  },
  warehouseName: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary, marginTop: 1,
  },
  warehouseAddressRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    paddingLeft: 42,
  },
  warehouseAddress: {
    flex: 1, fontSize: FontSize.xs,
    color: Colors.textSecondary, lineHeight: 17,
  },

  // Actions
  actions: {
    flexDirection: 'row', gap: Spacing.sm, marginTop: 4,
  },
  rejectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: 13, paddingHorizontal: 18,
  },
  rejectText: { color: Colors.danger, fontWeight: '700', fontSize: FontSize.sm },
  acceptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  acceptText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
});