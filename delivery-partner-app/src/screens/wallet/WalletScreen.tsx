// src/screens/wallet/WalletScreen.tsx

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useWalletSummary, useTransactions } from '../../hooks/useQueries';
import { Transaction } from '../../types';
import { EmptyState, Skeleton } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

export default function WalletScreen() {
  const navigation = useNavigation<any>();
  const { data: summary, isLoading: summaryLoading } = useWalletSummary();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  const txTypeConfig: Record<string, { icon: string; color: string; label: string }> = {
    COD_COLLECTED: { icon: '💵', color: Colors.warning, label: 'COD Collected' },
    DELIVERY_EARNING: { icon: '🚀', color: Colors.success, label: 'Delivery Earning' },
    INCENTIVE: { icon: '🎁', color: Colors.accent, label: 'Incentive Bonus' },
    WITHDRAWAL: { icon: '🏦', color: Colors.danger, label: 'Withdrawal' },
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet & Earnings</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* Balance Card */}
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              style={styles.balanceCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.balanceDecor} />
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              {summaryLoading ? (
                <Skeleton height={48} width={160} style={{ marginVertical: 6 }} />
              ) : (
                <Text style={styles.balanceAmount}>
                  {formatCurrency(summary?.availableBalance ?? 0)}
                </Text>
              )}
              <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.85}>
                <Text style={styles.withdrawText}>↑ Withdraw</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <SummaryTile
                icon="🚴"
                label="Delivery Earnings"
                value={summaryLoading ? null : formatCurrency(summary?.todayEarnings ?? 0)}
                color={Colors.success}
              />
              <SummaryTile
                icon="💵"
                label="COD Collected"
                value={summaryLoading ? null : formatCurrency(summary?.codCollected ?? 0)}
                color={Colors.warning}
              />
              <SummaryTile
                icon="🎁"
                label="Incentives"
                value={summaryLoading ? null : formatCurrency(summary?.incentives ?? 0)}
                color={Colors.accent}
              />
              <SummaryTile
                icon="🏦"
                label="Withdrawals"
                value={summaryLoading ? null : formatCurrency(summary?.withdrawals ?? 0)}
                color={Colors.danger}
              />
            </View>

            <Text style={styles.txTitle}>Recent Transactions</Text>
          </>
        )}
        ListEmptyComponent={
          txLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <EmptyState icon="📄" title="No transactions" subtitle="Your earnings will appear here" />
          )
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const config = txTypeConfig[item.type] ?? { icon: '💰', color: Colors.primary, label: item.type };
          const isDebit = item.type === 'WITHDRAWAL';

          return (
            <View style={styles.txCard}>
              <View style={[styles.txIconBg, { backgroundColor: `${config.color}18` }]}>
                <Text style={{ fontSize: 20 }}>{config.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txLabel}>{config.label}</Text>
                <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.txDate}>{formatDateTime(item.createdAt)}</Text>
              </View>
              <Text style={[styles.txAmount, { color: isDebit ? Colors.danger : Colors.success }]}>
                {isDebit ? '-' : '+'}{formatCurrency(item.amount)}
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const SummaryTile = ({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | null;
  color: string;
}) => (
  <View style={[styles.summaryTile, { borderLeftColor: color }]}>
    <Text style={styles.tileIcon}>{icon}</Text>
    {value === null ? (
      <Skeleton height={20} width={80} />
    ) : (
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
    )}
    <Text style={styles.tileLabel}>{label}</Text>
  </View>
);

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
  balanceCard: {
    margin: Spacing.md,
    borderRadius: 24,
    padding: Spacing.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  balanceDecor: {
    position: 'absolute',
    right: -60,
    bottom: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  balanceLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5, fontWeight: '700', marginBottom: 4 },
  balanceAmount: { fontSize: 44, fontWeight: '900', color: Colors.white, letterSpacing: -1.5 },
  withdrawBtn: {
    alignSelf: 'flex-start',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  withdrawText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: 10, marginBottom: Spacing.md },
  summaryTile: {
    width: '47.5%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    ...Shadow.sm,
  },
  tileIcon: { fontSize: 22, marginBottom: 6 },
  tileValue: { fontSize: FontSize.lg, fontWeight: '800', marginBottom: 2 },
  tileLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  txTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  list: { paddingBottom: 40 },
  loading: { paddingVertical: 40, alignItems: 'center' },
  txCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadow.sm,
  },
  txIconBg: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  txDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  txDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  txAmount: { fontSize: FontSize.md, fontWeight: '800' },
});