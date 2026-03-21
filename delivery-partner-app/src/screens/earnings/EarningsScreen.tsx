// src/screens/earnings/EarningsScreen.tsx

import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Animated, Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { Skeleton } from '../../components/ui';
import {
  useAssignedReturnEarnings,
  useEarningsSummary,
  usePayoutHistory,
  useActiveOffers,
  useRaiseDispute,
  useRequestPayout,
} from '../../hooks/useEarningsQueries';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Period Tab ────────────────────────────────────────────────────────────────
const PeriodTab = ({
  label, active, onPress,
}: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.periodTab, active && styles.periodTabActive]}
    activeOpacity={0.8}
  >
    <Text style={[styles.periodTabText, active && styles.periodTabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// ── Stat Tile ─────────────────────────────────────────────────────────────────
const StatTile = ({ icon, label, value, color, loading }: {
  icon: IoniconsName; label: string; value: string; color: string; loading: boolean;
}) => (
  <View style={[styles.statTile, { borderTopColor: color }]}>
    <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    {loading ? <Skeleton height={20} width={70} /> : <Text style={[styles.statValue, { color }]}>{value}</Text>}
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── Offer Progress Card ───────────────────────────────────────────────────────
const OfferCard = ({ offer }: { offer: any }) => {
  const progress = Math.min((offer.currentCount ?? 0) / (offer.target ?? 1), 1);
  const remaining = Math.max((offer.target ?? 0) - (offer.currentCount ?? 0), 0);

  return (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Ionicons name="trophy" size={16} color="#F59E0B" />
        <Text style={styles.offerTitle}>{offer.title}</Text>
        <Text style={styles.offerDescription}>{offer.description}</Text>
        <View style={styles.offerDaysChip}>
          <Text style={styles.offerDaysText}>{offer.daysLeft}d left</Text>
        </View>

      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>
      <View style={styles.offerFooter}>
        <Text style={styles.offerProgress}>
          {offer.currentCount}/{offer.target} deliveries
        </Text>
        <Text style={styles.offerBonus}>
          {remaining > 0 ? `${remaining} aur karo → ₹${offer.bonus} bonus! 🎯` : `✅ Bonus unlocked! ₹${offer.bonus}`}
        </Text>
      </View>
    </View>
  );
};

// ── Earning Row ───────────────────────────────────────────────────────────────
const EarningRow = ({ item, onDispute }: { item: any; onDispute: (id: string) => void }) => {
  const [expanded, setExpanded] = useState(false);

  const statusColor: Record<string, string> = {
    PENDING: '#F59E0B', REQUESTED: '#3B82F6', APPROVED: '#6366F1', PAID: Colors.success, DISPUTED: Colors.danger,
  };

  return (
    <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.85}>
      <View style={styles.earningCard}>
        <View style={styles.earningRow}>
          <View style={[styles.earningIconBg, { backgroundColor: Colors.success + '15' }]}>
            <Ionicons name="bicycle" size={20} color={Colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.earningTitle}>Delivery #{String(item.orderId?._id ?? item.orderId).slice(-6)}</Text>
            <Text style={styles.earningDate}>{new Date(item.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={styles.earningAmount}>₹{item.totalEarned?.toFixed(2)}</Text>
            <View style={[styles.statusChip, { backgroundColor: (statusColor[item.payoutStatus] ?? '#999') + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor[item.payoutStatus] ?? '#999' }]}>
                {item.payoutStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Expanded breakdown */}
        {expanded && (
          <View style={styles.breakdown}>
            <View style={styles.breakdownGrid}>
              {[
                ['Base', item.basePay],
                ['Distance', item.distancePay],
                ['Weight', item.weightPay],
                ['Surge', item.surgePay],
                ['Zone', item.zonePay],
                ['COD', item.codBonus],
                ['Target Bonus', item.targetBonus],
                ['Penalty', -item.penalties],
              ].map(([label, val]) => (
                <View key={label as string} style={styles.bItem}>
                  <Text style={styles.bLabel}>{label as string}</Text>
                  <Text style={[styles.bValue, { color: Number(val) < 0 ? Colors.danger : Colors.textPrimary }]}>
                    ₹{Math.abs(Number(val)).toFixed(2)}
                    {Number(val) < 0 ? ' −' : ''}
                  </Text>
                </View>
              ))}
            </View>
            {item.activeSurgeNames?.length > 0 && (
              <Text style={styles.surgeTag}>⚡ {item.activeSurgeNames.join(', ')}</Text>
            )}
            {item.payoutStatus === 'PENDING' && (
              <TouchableOpacity
                onPress={() => onDispute(item._id)}
                style={styles.disputeBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="flag-outline" size={14} color={Colors.danger} />
                <Text style={styles.disputeText}>Raise Dispute</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── Payout History Row ─────────────────────────────────────────────────────────
const PayoutRow = ({ item }: { item: any }) => (
  <View style={styles.payoutCard}>
    <View style={[styles.earningIconBg, { backgroundColor: Colors.success + '15' }]}>
      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.earningTitle}>₹{item.totalEarned?.toFixed(2)} Paid</Text>
      <Text style={styles.earningDate}>{item.payoutTransactionId}</Text>
    </View>
    <Text style={styles.payoutDate}>{item.paidAt ? new Date(item.paidAt).toLocaleDateString('en-IN') : '—'}</Text>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const TABS = ['Earnings', 'Offers', 'Payouts'] as const;
type TabType = typeof TABS[number];

export default function EarningsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialTab = route.params?.initialTab as TabType | undefined;

  const [tab, setTab] = useState<TabType>(initialTab || 'Earnings');
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeNote, setDisputeNote] = useState('');
  const headerAnim = useRef(new Animated.Value(0)).current;

  const { data: summary, isLoading: summaryLoading } = useEarningsSummary();
  const { data: offers = [], isLoading: offersLoading } = useActiveOffers();
  const { data: payouts = [], isLoading: payoutsLoading } = usePayoutHistory();
  const { data: earnings = [], isLoading: earningsLoading } = useAssignedReturnEarnings();
  const raiseDispute = useRaiseDispute();
  const requestPayout = useRequestPayout();

  console.log("earnings", offers);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleRaiseDispute = async () => {
    if (!disputeId || !disputeNote.trim()) {
      Alert.alert('Please enter a reason for the dispute'); return;
    }
    try {
      await raiseDispute.mutateAsync({ earningsId: disputeId, note: disputeNote });
      Alert.alert('Dispute raised! Admin will review within 24 hours.');
      setDisputeId(null); setDisputeNote('');
    } catch {
    }
  };

  const handleRequestPayout = async () => {
    if (!summary?.totalPending || summary.totalPending <= 0) {
      Alert.alert('No pending earnings to request.');
      return;
    }

    Alert.alert(
      'Request Payout?',
      `Are you sure you want to request a payout for ₹${summary.totalPending.toFixed(2)}? Admin will be notified to release your amount.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            try {
              await requestPayout.mutateAsync();
              Alert.alert('Success', 'Payout request sent! Admin will process it shortly.');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to request payout');
            }
          }
        }
      ]
    );
  };

  const periodValue = (key: 'todayEarnings' | 'weekEarnings' | 'monthEarnings') =>
    summary ? `₹${Number(summary[key] ?? 0).toFixed(0)}` : '—';

  const ListHeader = () => (
    <>
      {/* Stats tiles */}
      <View style={styles.statsGrid}>
        <StatTile icon="today" label="Today" value={periodValue('todayEarnings')} color={Colors.success} loading={summaryLoading} />
        <StatTile icon="calendar" label="This Week" value={periodValue('weekEarnings')} color={Colors.primary} loading={summaryLoading} />
        <StatTile icon="bar-chart" label="This Month" value={periodValue('monthEarnings')} color="#8B5CF6" loading={summaryLoading} />
        <StatTile icon="bicycle" label="Today's Del." value={summary ? String(summary.todayDeliveries) : '—'} color="#F59E0B" loading={summaryLoading} />

        {/* Request Payout Row */}
        <View style={styles.payoutRequestCard}>
          <View style={styles.payoutInfo}>
            <Text style={styles.payoutLabel}>TOTAL UNPAID BALANCE</Text>
            <Text style={styles.payoutValue}>₹{Number(summary?.totalDue || 0).toFixed(2)}</Text>
            {(summary?.totalRequested > 0 || summary?.totalApproved > 0) && (
              <Text style={styles.requestedSub}>
                (₹{((summary?.totalRequested || 0) + (summary?.totalApproved || 0)).toFixed(2)} in process)
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleRequestPayout}
            disabled={!summary?.totalPending || summary.totalPending <= 0 || requestPayout.isPending}
            style={[
              styles.payoutBtn,
              (!summary?.totalPending || summary.totalPending <= 0 || requestPayout.isPending) && styles.payoutBtnDisabled
            ]}
          >
            {requestPayout.isPending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="send" size={16} color={Colors.white} />
                <Text style={styles.payoutBtnText}>Request Payout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {TABS.map(t => (
          <PeriodTab key={t} label={t} active={tab === t} onPress={() => setTab(t)} />
        ))}
      </View>
    </>
  );

  const listData = tab === 'Earnings' ? earnings
    : tab === 'Offers' ? offers
      : payouts;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <Animated.View style={{ opacity: headerAnim }}>
        <LinearGradient
          colors={['#6366F1', '#818CF8']}
          style={styles.header}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerDecor} />
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerSub}>DELIVERY PARTNER</Text>
              <Text style={styles.headerTitle}>My Earnings</Text>
            </View>
            <View style={styles.headerIconWrap}>
              <Ionicons name="cash" size={22} color={Colors.white} />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <FlatList
        data={listData}
        keyExtractor={(item: any, i) => item._id ?? String(i)}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          summaryLoading || offersLoading || payoutsLoading || earningsLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.primary} size="large" />
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons name="document-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No {tab.toLowerCase()} yet</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          if (tab === 'Earnings') return <EarningRow item={item} onDispute={setDisputeId} />;
          if (tab === 'Offers') return <OfferCard offer={item} />;
          return <PayoutRow item={item} />;
        }}
      />

      {/* Dispute Modal */}
      <Modal visible={!!disputeId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Raise Earnings Dispute</Text>
            <Text style={styles.modalSub}>Describe why this commission seems incorrect</Text>
            <TextInput
              value={disputeNote}
              onChangeText={setDisputeNote}
              multiline
              numberOfLines={4}
              placeholder="e.g. Distance is wrong, surge not applied..."
              style={styles.disputeInput}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => { setDisputeId(null); setDisputeNote(''); }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRaiseDispute}
                disabled={raiseDispute.isPending}
                style={styles.submitBtn}
              >
                <Text style={styles.submitText}>
                  {raiseDispute.isPending ? 'Submitting...' : 'Submit Dispute'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md, overflow: 'hidden' },
  headerDecor: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 1.2 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white, letterSpacing: -0.3, marginTop: 2 },
  headerIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },

  list: { paddingBottom: 40 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: 10, marginTop: Spacing.md, marginBottom: Spacing.sm },
  statTile: { width: '47.5%', backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.md, borderTopWidth: 3, gap: 6, ...Shadow.sm },
  statIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },

  // Tabs
  tabRow: { flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: Colors.white, borderRadius: 12, padding: 4, ...Shadow.sm },
  periodTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  periodTabActive: { backgroundColor: Colors.primary },
  periodTabText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  periodTabTextActive: { color: Colors.white },

  // Offer card
  offerCard: { marginHorizontal: Spacing.md, marginBottom: 10, backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.md, ...Shadow.sm },
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  offerTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  offerDaysChip: { backgroundColor: '#F59E0B20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  offerDescription: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 8 },
  offerDaysText: { fontSize: 10, color: '#F59E0B', fontWeight: '800' },
  progressBar: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 99 },
  offerFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  offerProgress: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  offerBonus: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },

  // Earning card
  earningCard: { marginHorizontal: Spacing.md, marginBottom: 8, backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.md, ...Shadow.sm },
  earningRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  earningIconBg: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  earningTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  earningDate: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  earningAmount: { fontSize: FontSize.md, fontWeight: '900', color: Colors.success },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  statusText: { fontSize: 9, fontWeight: '800' },

  // Breakdown
  breakdown: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  breakdownGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bItem: { width: '46%', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 8, padding: 8 },
  bLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  bValue: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },
  surgeTag: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  disputeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: Colors.danger + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  disputeText: { fontSize: FontSize.xs, color: Colors.danger, fontWeight: '700' },

  // Payout row
  payoutCard: { marginHorizontal: Spacing.md, marginBottom: 8, backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadow.sm },
  payoutDate: { fontSize: FontSize.xs, color: Colors.textSecondary },

  // Empty / loading
  center: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600' },

  // Dispute modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, gap: 16 },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textPrimary },
  modalSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  disputeInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: FontSize.sm, minHeight: 100, color: Colors.textPrimary },
  modalButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelText: { fontWeight: '700', color: Colors.textSecondary },
  submitBtn: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: Colors.danger, alignItems: 'center' },
  submitText: { fontWeight: '700', color: Colors.white },

  // Payout request
  payoutRequestCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  payoutInfo: { gap: 2, flex: 1 },
  payoutLabel: { fontSize: 9, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  payoutValue: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  requestedSub: { fontSize: 9, color: '#3B82F6', fontWeight: '600', marginTop: -2 },
  payoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payoutBtnDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },
  payoutBtnText: { color: Colors.white, fontWeight: '800', fontSize: 13 },
});
