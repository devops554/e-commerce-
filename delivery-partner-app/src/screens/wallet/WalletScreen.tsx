// src/screens/wallet/WalletScreen.tsx

import React, { useRef, useEffect } from 'react';
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
import { useWalletSummary, useTransactions } from '../../hooks/useQueries';
import { Transaction } from '../../types';
import { Skeleton } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Transaction config ────────────────────────────────────────────────────────
const txTypeConfig: Record<string, { icon: IoniconsName; color: string; label: string; debit: boolean }> = {
  COD_COLLECTED: { icon: 'cash', color: '#F59E0B', label: 'COD Collected', debit: false },
  DELIVERY_EARNING: { icon: 'bicycle', color: Colors.success, label: 'Delivery Earning', debit: false },
  INCENTIVE: { icon: 'gift', color: '#8B5CF6', label: 'Incentive Bonus', debit: false },
  WITHDRAWAL: { icon: 'arrow-up-circle', color: Colors.danger, label: 'Withdrawal', debit: true },
};

// ── Summary Tile ──────────────────────────────────────────────────────────────
const SummaryTile = ({
  icon,
  label,
  value,
  color,
  loading,
}: {
  icon: IoniconsName;
  label: string;
  value: string | null;
  color: string;
  loading: boolean;
}) => (
  <View style={[styles.summaryTile, { borderTopColor: color }]}>
    <View style={[styles.tileIconWrap, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    {loading ? (
      <Skeleton height={20} width={72} />
    ) : (
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
    )}
    <Text style={styles.tileLabel}>{label}</Text>
  </View>
);

// ── Transaction Row ───────────────────────────────────────────────────────────
const TxRow = ({ item, index }: { item: Transaction; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, delay: index * 50, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 280, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const config = txTypeConfig[item.type] ?? { icon: 'cash-outline' as IoniconsName, color: Colors.primary, label: item.type, debit: false };
  const isDebit = config.debit;

  return (
    <Animated.View style={[styles.txCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.txIconBg, { backgroundColor: config.color + '18' }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txLabel}>{config.label}</Text>
        <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
        <View style={styles.txDateRow}>
          <Ionicons name="time-outline" size={10} color={Colors.textMuted} />
          <Text style={styles.txDate}>{formatDateTime(item.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.txAmountWrap}>
        <Text style={[styles.txAmount, { color: isDebit ? Colors.danger : Colors.success }]}>
          {isDebit ? '−' : '+'}{formatCurrency(item.amount)}
        </Text>
        <View style={[styles.txDirectionBadge, { backgroundColor: isDebit ? Colors.danger + '15' : Colors.success + '15' }]}>
          <Ionicons
            name={isDebit ? 'arrow-up' : 'arrow-down'}
            size={10}
            color={isDebit ? Colors.danger : Colors.success}
          />
          <Text style={[styles.txDirectionText, { color: isDebit ? Colors.danger : Colors.success }]}>
            {isDebit ? 'Debit' : 'Credit'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function WalletScreen() {
  const navigation = useNavigation<any>();
  const { data: summary, isLoading: summaryLoading } = useWalletSummary();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const ListHeader = () => (
    <>
      {/* ── Balance Card ── */}
      <Animated.View style={{ opacity: headerFade }}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight || '#818CF8']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decor */}
          <View style={styles.balanceDecor1} />
          <View style={styles.balanceDecor2} />

          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>

          {summaryLoading ? (
            <Skeleton height={52} width={180} style={{ marginVertical: 6 }} />
          ) : (
            <Text style={styles.balanceAmount}>
              {formatCurrency(summary?.availableBalance ?? 0)}
            </Text>
          )}

          {/* Info strip */}
          <View style={styles.balanceStrip}>
            <View style={styles.balanceStripItem}>
              <Ionicons name="trending-up" size={13} color="rgba(255,255,255,0.75)" />
              <Text style={styles.balanceStripText}>
                {formatCurrency(summary?.todayEarnings ?? 0)} today
              </Text>
            </View>
            <View style={styles.balanceStripDivider} />
            <View style={styles.balanceStripItem}>
              <Ionicons name="bicycle" size={13} color="rgba(255,255,255,0.75)" />
              <Text style={styles.balanceStripText}>
                {summary?.totalDeliveries ?? 0} deliveries
              </Text>
            </View>
          </View>

          {/* Withdraw button */}
          <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.85}>
            <Ionicons name="arrow-up-circle-outline" size={16} color={Colors.white} />
            <Text style={styles.withdrawText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* ── Stats Grid ── */}
      <View style={styles.statsGrid}>
        <SummaryTile
          icon="bicycle"
          label="Delivery Earnings"
          value={summaryLoading ? null : formatCurrency(summary?.todayEarnings ?? 0)}
          color={Colors.success}
          loading={summaryLoading}
        />
        <SummaryTile
          icon="cash"
          label="COD Collected"
          value={summaryLoading ? null : formatCurrency(summary?.codCollected ?? 0)}
          color="#F59E0B"
          loading={summaryLoading}
        />
        <SummaryTile
          icon="gift"
          label="Incentives"
          value={summaryLoading ? null : formatCurrency(summary?.incentives ?? 0)}
          color="#8B5CF6"
          loading={summaryLoading}
        />
        <SummaryTile
          icon="arrow-up-circle"
          label="Withdrawals"
          value={summaryLoading ? null : formatCurrency(summary?.withdrawals ?? 0)}
          color={Colors.danger}
          loading={summaryLoading}
        />
      </View>

      {/* Section title */}
      <View style={styles.txSectionHeader}>
        <View style={styles.txSectionLeft}>
          <Ionicons name="receipt-outline" size={16} color={Colors.primary} />
          <Text style={styles.txTitle}>Recent Transactions</Text>
        </View>
        {transactions && transactions.length > 0 && (
          <View style={styles.txCountChip}>
            <Text style={styles.txCountText}>{transactions.length}</Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Header ── */}
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
            <Text style={styles.headerTitle}>Wallet & Earnings</Text>
          </View>
          <View style={styles.walletIconWrap}>
            <Ionicons name="wallet" size={22} color={Colors.white} />
          </View>
        </View>
      </LinearGradient>

      {/* ── List ── */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          txLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.primary} size="large" />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="receipt-outline" size={44} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>Your earnings will appear here</Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => <TxRow item={item} index={index} />}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

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
  walletIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Balance card (inside list header — no top gradient since header already has it)
  balanceCard: {
    margin: Spacing.md,
    borderRadius: 24, padding: Spacing.xl,
    overflow: 'hidden', ...Shadow.md,
  },
  balanceDecor1: {
    position: 'absolute', right: -50, top: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  balanceDecor2: {
    position: 'absolute', left: -30, bottom: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  balanceLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.5, fontWeight: '700', marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 46, fontWeight: '900', color: Colors.white, letterSpacing: -2,
  },
  balanceStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 12, marginBottom: 16,
  },
  balanceStripItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  balanceStripDivider: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.25)' },
  balanceStripText: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  withdrawBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  withdrawText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },

  // Stats grid
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.md, gap: 10, marginBottom: Spacing.md,
  },
  summaryTile: {
    width: '47.5%', backgroundColor: Colors.white,
    borderRadius: 16, padding: Spacing.md,
    borderTopWidth: 3, gap: 6, ...Shadow.sm,
  },
  tileIconWrap: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  tileValue: { fontSize: FontSize.lg, fontWeight: '800' },
  tileLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },

  // Section header
  txSectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  txSectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  txTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  txCountChip: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  txCountText: { fontSize: 12, fontWeight: '800', color: Colors.primary },

  // List
  list: { paddingBottom: 40 },
  loadingWrap: { paddingVertical: 40, alignItems: 'center' },

  // Empty
  emptyWrap: {
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 40, paddingHorizontal: 40, gap: 12,
  },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },

  // Transaction card
  txCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md, marginBottom: 8,
    borderRadius: 16, padding: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    ...Shadow.sm,
  },
  txIconBg: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  txLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  txDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  txDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  txDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  txAmountWrap: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: FontSize.md, fontWeight: '900' },
  txDirectionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  txDirectionText: { fontSize: 9, fontWeight: '800' },
});