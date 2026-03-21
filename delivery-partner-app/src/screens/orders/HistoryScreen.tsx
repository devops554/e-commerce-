// src/screens/orders/HistoryScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useOrderHistory } from '../../hooks/useQueries';
import { Shipment, Order } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getOrderStatusLabel,
  isCOD,
} from '../../utils/helpers';

// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type FilterType = 'today' | 'week' | 'month';

// ── Filter config ─────────────────────────────────────────────────────────────
const FILTERS: { label: string; value: FilterType; icon: IoniconsName }[] = [
  { label: 'Today', value: 'today', icon: 'sunny-outline' },
  { label: 'This Week', value: 'week', icon: 'calendar-outline' },
  { label: 'This Month', value: 'month', icon: 'stats-chart-outline' },
];

interface ShipmentGroup {
  id: string;
  shipments: Shipment[];
  totalEarning: number;
  mainShipment: Shipment;
  count: number;
}

// ── History Card ──────────────────────────────────────────────────────────────
const HistoryCard = ({
  group,
  index,
  onPress,
}: {
  group: ShipmentGroup;
  index: number;
  onPress: () => void;
}) => {
  const { mainShipment: shipment, totalEarning, count } = group;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 340, delay: index * 55, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 55, useNativeDriver: true }),
    ]).start();
  }, []);

  const order = shipment.orderId as Order;
  if (!order) return null;

  const isReverse = shipment.type === 'REVERSE';
  const isFailedPickup = isReverse && shipment.status === 'FAILED_PICKUP';

  const statusColor = isFailedPickup ? Colors.danger : getOrderStatusColor(order.orderStatus);
  const statusLabel = isFailedPickup
    ? 'Pickup Failed'
    : (shipment.status === 'ASSIGNED_TO_DELIVERY' ? 'Assigned' : (isReverse ? 'Returned' : getOrderStatusLabel(order.orderStatus)));
  const cod = isCOD(order.paymentMethod);
  const earning = totalEarning;
  const orderId = typeof order.orderId === 'string' ? order.orderId.slice(-8) : String(order.orderId).slice(-8);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.card}>

        {/* Left accent bar */}
        <View style={[styles.cardAccent, { backgroundColor: statusColor }]} />

        <View style={styles.cardBody}>
          {/* Top row */}
          <View style={styles.cardTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.orderId}>#{orderId}</Text>
              {count > 1 && (
                <View style={styles.groupBadge}>
                  <Text style={styles.groupBadgeText}>{count} Items</Text>
                </View>
              )}
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.addrRow}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.orderAddr} numberOfLines={1}>
              {isReverse
                ? (typeof shipment.warehouseId === 'object' && shipment.warehouseId !== null && 'address' in shipment.warehouseId ? shipment.warehouseId.address?.city : 'Warehouse')
                : (order.shippingAddress?.city ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : 'N/A')}
            </Text>
          </View>

          {/* Bottom badges */}
          <View style={styles.cardBadgeRow}>
            {/* Status */}
            <View style={[styles.badge, { backgroundColor: statusColor + '18', borderColor: statusColor + '40' }]}>
              <View style={[styles.badgeDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
            </View>

            {/* Payment */}
            <View style={[
              styles.badge,
              {
                backgroundColor: cod ? '#FEF3C7' : '#D1FAE5',
                borderColor: cod ? '#F59E0B40' : '#10B98140',
              }
            ]}>
              <Ionicons
                name={cod ? 'cash-outline' : 'checkmark-circle-outline'}
                size={11}
                color={cod ? '#D97706' : '#059669'}
              />
              <Text style={[styles.badgeText, { color: cod ? '#D97706' : '#059669' }]}>
                {cod ? 'COD' : 'Paid'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right earning */}
        <View style={styles.cardRight}>
          <Text style={styles.earningAmount}>{formatCurrency(earning)}</Text>
          <Text style={styles.earningLabel}>Earned</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} style={{ marginTop: 4 }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterType>('today');
  const [activeMode, setActiveMode] = useState<'DELIVERY' | 'RETURN'>('DELIVERY');
  const { data: allShipments, isLoading } = useOrderHistory(filter);

  const shipments = (allShipments || []).filter(s =>
    activeMode === 'RETURN' ? s.type === 'REVERSE' : s.type !== 'REVERSE'
  );

  // Grouping logic
  const groupedData: ShipmentGroup[] = shipments.reduce((acc: ShipmentGroup[], s) => {
    const o = s.orderId as Order;
    if (!o) return acc;

    // Group by customer and payment method
    const customerId = (o.user as any)?._id || o.user;
    const paymentMethod = o.paymentMethod;
    const dateStr = formatDate(o.createdAt);

    const existingGroup = acc.find(g => {
      const go = g.mainShipment.orderId as Order;
      const gCustomerId = (go.user as any)?._id || go.user;
      return gCustomerId === customerId &&
        go.paymentMethod === paymentMethod &&
        formatDate(go.createdAt) === dateStr;
    });

    // Use actual earning from shipment metadata
    const earning = s.actualEarning || s.commissionEarned || 0;

    if (existingGroup) {
      existingGroup.shipments.push(s);
      existingGroup.totalEarning += earning;
      existingGroup.count += 1;
    } else {
      acc.push({
        id: s._id,
        shipments: [s],
        totalEarning: earning,
        mainShipment: s,
        count: 1
      });
    }
    return acc;
  }, []);

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const totalEarnings = shipments?.reduce((sum, s) => {
    return sum + (s.actualEarning || s.commissionEarned || 0);
  }, 0) ?? 0;
  const filterLabel = filter === 'today' ? 'today' : filter === 'week' ? 'this week' : 'this month';

  const ListHeader = () => (
    <>
      {/* Mode Tabs (Delivery vs Returns) */}
      <View style={styles.modeTabContainer}>
        <TouchableOpacity
          onPress={() => setActiveMode('DELIVERY')}
          style={[styles.modeTab, activeMode === 'DELIVERY' && styles.modeTabActive]}
        >
          <Ionicons
            name="cube"
            size={16}
            color={activeMode === 'DELIVERY' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.modeTabText, activeMode === 'DELIVERY' && styles.modeTabTextActive]}>
            Deliveries
          </Text>
          {activeMode === 'DELIVERY' && <View style={styles.modeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveMode('RETURN')}
          style={[styles.modeTab, activeMode === 'RETURN' && styles.modeTabActive]}
        >
          <Ionicons
            name="refresh-circle"
            size={18}
            color={activeMode === 'RETURN' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.modeTabText, activeMode === 'RETURN' && styles.modeTabTextActive]}>
            Returns
          </Text>
          {activeMode === 'RETURN' && <View style={styles.modeIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Time Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[styles.filterTab, active && styles.filterTabActive]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={f.icon}
                size={14}
                color={active ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIconWrap, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name={activeMode === 'DELIVERY' ? "bicycle" : "arrow-undo"} size={18} color={Colors.primary} />
          </View>
          <Text style={styles.summaryValue}>{shipments?.length ?? 0}</Text>
          <Text style={styles.summaryLabel}>{activeMode === 'DELIVERY' ? 'Deliveries' : 'Returns'}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIconWrap, { backgroundColor: Colors.success + '15' }]}>
            <Ionicons name="cash" size={18} color={Colors.success} />
          </View>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            {formatCurrency(totalEarnings)}
          </Text>
          <Text style={styles.summaryLabel}>Earned</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIconWrap, { backgroundColor: '#F59E0B15' }]}>
            <Ionicons name="star" size={18} color="#F59E0B" />
          </View>
          <Text style={styles.summaryValue}>
            {shipments?.length ? (totalEarnings / shipments.length).toFixed(0) : '0'}
          </Text>
          <Text style={styles.summaryLabel}>Avg. Earn</Text>
        </View>
      </View>

      {/* Section label */}
      <View style={styles.sectionHeader}>
        <Ionicons name="receipt-outline" size={15} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{activeMode === 'DELIVERY' ? 'Orders' : 'Return Shipments'} — {filterLabel}</Text>
        {shipments && shipments.length > 0 && (
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{shipments.length}</Text>
          </View>
        )}
      </View>
    </>
  );

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
          <View style={styles.headerDecor} />
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerLabel}>DELIVERY PARTNER</Text>
              <Text style={styles.headerTitle}>Delivery History</Text>
            </View>
            <View style={styles.headerIconWrap}>
              <Ionicons name="time" size={20} color={Colors.white} />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── List ── */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name={activeMode === 'DELIVERY' ? "receipt-outline" : "refresh-circle-outline"}
                  size={44}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeMode === 'DELIVERY' ? 'No deliveries yet' : 'No returns yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                No {activeMode === 'DELIVERY' ? 'orders' : 'returns'} completed {filterLabel}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <HistoryCard
              group={item}
              index={index}
              onPress={() => {
                const shipment = item.mainShipment;
                let oId = '';
                if (typeof shipment.orderId === 'object' && shipment.orderId !== null && '_id' in shipment.orderId) {
                  oId = (shipment.orderId as Order)._id as string;
                } else if (typeof shipment.orderId === 'string') {
                  oId = shipment.orderId;
                }
                navigation.navigate('OrderDetail', { orderId: oId });
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // Mode Tabs
  modeTabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '50',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    position: 'relative',
  },
  modeTabActive: {
    // backgroundColor: Colors.primary + '08',
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  modeTabTextActive: {
    color: Colors.primary,
  },
  modeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  groupBadge: {
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  groupBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 1.2 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white, letterSpacing: -0.3, marginTop: 2 },
  headerIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Filter
  filterRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  filterTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5,
    paddingVertical: 9, borderRadius: BorderRadius.full,
    backgroundColor: Colors.white, ...Shadow.sm,
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },

  // Summary
  summaryRow: {
    flexDirection: 'row', backgroundColor: Colors.white,
    marginHorizontal: Spacing.md, borderRadius: 18,
    paddingVertical: Spacing.md, marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryIconWrap: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  summaryValue: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.textPrimary },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },
  summaryDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 8 },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  sectionTitle: { flex: 1, fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  countChip: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  countChipText: { fontSize: 11, fontWeight: '800', color: Colors.primary },

  // List
  list: { paddingBottom: 40 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Empty
  emptyWrap: {
    alignItems: 'center', paddingTop: 40,
    paddingHorizontal: 40, gap: 12,
  },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },

  // Card
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md, marginBottom: 10,
    borderRadius: 18,
    flexDirection: 'row', alignItems: 'stretch',
    overflow: 'hidden', ...Shadow.sm,
  },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: 14, gap: 6 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: FontSize.md, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  orderAddr: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary },
  cardBadgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  cardRight: {
    alignItems: 'center', justifyContent: 'center',
    paddingRight: 14, paddingLeft: 8, gap: 2,
  },
  earningAmount: { fontSize: FontSize.md, fontWeight: '900', color: Colors.success },
  earningLabel: { fontSize: 9, color: Colors.textSecondary, fontWeight: '600' },
});