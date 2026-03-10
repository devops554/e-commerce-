// src/screens/orders/HistoryScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrderHistory } from '../../hooks/useQueries';
import { Order } from '../../types';
import { Badge, EmptyState } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getOrderStatusLabel,
  isCOD,
} from '../../utils/helpers';

type FilterType = 'today' | 'week' | 'month';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterType>('today');
  const { data: orders, isLoading } = useOrderHistory(filter);

  const totalEarnings =
    orders?.reduce((sum, o) => sum + (o.deliveryFee ?? 0), 0) ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery History</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setFilter(f.value)}
            style={[styles.filterTab, filter === f.value && styles.filterTabActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders?.length ?? 0}</Text>
          <Text style={styles.summaryLabel}>Deliveries</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            {formatCurrency(totalEarnings)}
          </Text>
          <Text style={styles.summaryLabel}>Earned</Text>
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="📋"
              title="No deliveries yet"
              subtitle={`No orders completed ${filter === 'today' ? 'today' : filter === 'week' ? 'this week' : 'this month'}`}
            />
          }
          renderItem={({ item }) => (
            <HistoryCard
              order={item}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const HistoryCard = ({ order, onPress }: { order: Order; onPress: () => void }) => {
  const statusColor = getOrderStatusColor(order.orderStatus);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        <View style={{ flex: 1 }}>
          <View style={styles.cardTopRow}>
            <Text style={styles.orderId}>#{typeof order.orderId === 'string' ? order.orderId : 'ID Error'}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <Text style={styles.orderAddr} numberOfLines={1}>
            📍 {order.shippingAddress.city}, {order.shippingAddress.state}
          </Text>
          <View style={styles.cardBottomRow}>
            <Badge
              label={getOrderStatusLabel(order.orderStatus)}
              backgroundColor={`${statusColor}18`}
              color={statusColor}
            />
            <Badge
              label={isCOD(order.paymentMethod) ? '💵 COD' : '💳 Paid'}
              backgroundColor={isCOD(order.paymentMethod) ? Colors.warningLight : Colors.successLight}
              color={isCOD(order.paymentMethod) ? Colors.warning : Colors.success}
            />
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.earningAmount}>{formatCurrency(order.deliveryFee ?? 0)}</Text>
        <Text style={styles.earningLabel}>Earned</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingTop: 8,
    marginTop: 8,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textPrimary },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  summaryDivider: { width: 1, backgroundColor: Colors.border },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.md, gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadow.sm,
  },
  cardLeft: { flex: 1, flexDirection: 'row', gap: 12 },
  statusIndicator: { width: 4, borderRadius: 2, minHeight: 60 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderId: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  orderAddr: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 8 },
  cardBottomRow: { flexDirection: 'row', gap: 6 },
  cardRight: { alignItems: 'flex-end' },
  earningAmount: { fontSize: FontSize.md, fontWeight: '800', color: Colors.success },
  earningLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});