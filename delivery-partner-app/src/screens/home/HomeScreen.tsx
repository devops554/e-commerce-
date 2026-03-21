// src/screens/home/HomeScreen.tsx

import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useDashboardStats,
  useActiveOrder,
  useAvailableOrders,
  useUpdateAvailability,
} from '../../hooks/useQueries';
import { useActiveOffers } from '../../hooks/useEarningsQueries';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { socketService } from '../../services/socketService';
import { locationService } from '../../services/locationService';
import { Colors, Spacing, FontSize, Shadow } from '../../utils/theme';
import { formatCurrency, getInitials } from '../../utils/helpers';


// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Animated Pulsing Notification Badge ──────────────────────────────────────
const PulsingNotifBadge = ({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1.6, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(600),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.notifWrapper} activeOpacity={0.8}>
      <Animated.View
        style={[styles.notifPulseRing, { transform: [{ scale: pulseAnim }], opacity: pulseOpacity }]}
      />
      <View style={styles.notifBadge}>
        <Ionicons name="notifications" size={20} color={Colors.white} />
        <View style={styles.notifCountChip}>
          <Text style={styles.notifCountText}>{count > 9 ? '9+' : count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Quick Action Card ─────────────────────────────────────────────────────────
const QuickActionCard = ({
  icon,
  iconFocused,
  label,
  count,
  color,
  onPress,
}: {
  icon: IoniconsName;
  iconFocused: IoniconsName;
  label: string;
  count?: number;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.qaCard} onPress={onPress} activeOpacity={0.82}>
    <View style={[styles.qaIconWrap, { backgroundColor: color + '18' }]}>
      <Ionicons name={iconFocused} size={24} color={color} />
      {count !== undefined && count > 0 && (
        <View style={[styles.qaBadge, { backgroundColor: color }]}>
          <Text style={styles.qaBadgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
    <Text style={styles.qaLabel} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatItem = ({
  label,
  value,
  icon,
  color,
  loading,
}: {
  label: string;
  value: string | null;
  icon: IoniconsName;
  color: string;
  loading: boolean;
}) => (
  <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
    <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    {loading ? (
      <View style={styles.statSkeleton} />
    ) : (
      <Text style={styles.statValue}>{value}</Text>
    )}
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const partner = useAuthStore((s) => s.partner);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: activeOrder, isLoading: activeLoading, refetch: refetchActive } = useActiveOrder();
  const { data: availableOrders } = useAvailableOrders();
  const { data: offers, isLoading: offersLoading } = useActiveOffers();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const updateAvailability = useUpdateAvailability();

  console.log("availableOrders", availableOrders);

  const isOnline = partner?.availabilityStatus === 'ONLINE';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    const unsubNewOrder = socketService.onNewOrder(() => {
      navigation.navigate('AvailableOrders');
    });
    return () => { unsubNewOrder(); };
  }, []);

  useEffect(() => {
    if (isOnline) locationService.startTracking();
    else locationService.stopTracking();
  }, [isOnline]);

  const handleToggleOnline = async () => {
    const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
    await updateAvailability.mutateAsync(newStatus);
    if (newStatus === 'ONLINE') locationService.startTracking();
    else locationService.stopTracking();
  };

  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchActive();
  }, []);

  const pendingCount = availableOrders?.length ?? 0;
  const activeShipments = Array.isArray(activeOrder) ? activeOrder : (activeOrder?.data || []);
  const activeCount = activeShipments.length;
  // Notification badge only shows REAL unread notifications — not orders
  const totalNotifCount = unreadCount;

  const quickActions: {
    icon: IoniconsName;
    iconFocused: IoniconsName;
    label: string;
    count?: number;
    color: string;
    screen: string;
  }[] = [
      { icon: 'receipt-outline', iconFocused: 'receipt', label: 'Available Orders', count: pendingCount, color: Colors.primary, screen: 'AvailableOrders' },
      { icon: 'bicycle-outline', iconFocused: 'bicycle', label: 'Active Orders', count: activeCount, color: '#10B981', screen: 'ActiveOrdersList' },
      { icon: 'time-outline', iconFocused: 'time', label: 'History', color: Colors.warning, screen: 'History' },
      { icon: 'wallet-outline', iconFocused: 'wallet', label: 'Wallet', color: '#8B5CF6', screen: 'Wallet' },
      { icon: 'person-circle-outline', iconFocused: 'person-circle', label: 'Profile', color: '#EC4899', screen: 'Profile' },
      // count shows only real unread notifications — not order counts
      { icon: 'notifications-outline', iconFocused: 'notifications', label: 'Notifications', count: unreadCount, color: Colors.danger, screen: 'Notifications' },
    ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={statsLoading || activeLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.partnerName}>{partner?.name || 'Partner'}</Text>
          </View>

          <View style={styles.headerRight}>
            {pendingCount > 0 && (
              <PulsingNotifBadge
                count={pendingCount}
                onPress={() => navigation.navigate('AvailableOrders')}
              />
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarBtn}
              activeOpacity={0.85}
            >
              {partner?.profileImage ? (
                <Image source={{ uri: partner.profileImage }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight || '#818CF8']}
                  style={styles.avatarFallback}
                >
                  <Text style={styles.avatarText}>{getInitials(partner?.name || 'DP')}</Text>
                </LinearGradient>
              )}
              <View
                style={[
                  styles.avatarStatusDot,
                  { backgroundColor: isOnline ? Colors.online : Colors.offline },
                ]}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Hero Banner ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient
            colors={isOnline
              ? [Colors.primary, Colors.primaryLight || '#818CF8']
              : ['#374151', '#1F2937']}
            style={styles.heroBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Decorative circles */}
            <View style={[styles.heroDecorCircle, { width: 160, height: 160, top: -60, right: -40, opacity: 0.1 }]} />
            <View style={[styles.heroDecorCircle, { width: 90, height: 90, bottom: -30, right: 80, opacity: 0.08 }]} />

            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                {/* Status pill */}
                <View style={[styles.statusPill, { backgroundColor: isOnline ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }]}>
                  <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4ADE80' : '#9CA3AF' }]} />
                  <Text style={styles.statusPillText}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </Text>
                </View>

                <Text style={styles.heroTitle}>
                  {isOnline ? "You're Live! 🚀" : "You're Offline"}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {isOnline
                    ? 'Receiving delivery requests'
                    : 'Toggle to start accepting orders'}
                </Text>
              </View>

              <View style={styles.heroRight}>
                <View style={[styles.switchContainer, { backgroundColor: isOnline ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }]}>
                  <Switch
                    value={isOnline}
                    onValueChange={handleToggleOnline}
                    trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#4ADE80' }}
                    thumbColor={Colors.white}
                    ios_backgroundColor="rgba(255,255,255,0.15)"
                    style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                  />
                </View>
              </View>
            </View>

            {/* Earnings preview strip */}
            {isOnline && (
              <View style={styles.heroStrip}>
                <View style={styles.heroStripItem}>
                  <Ionicons name="flash" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroStripText}>
                    {pendingCount} orders nearby
                  </Text>
                </View>
                <View style={styles.heroStripDivider} />
                <View style={styles.heroStripItem}>
                  <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroStripText}>
                    {formatCurrency(stats?.todayEarnings ?? 0)} today
                  </Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* ── Stats Row ── */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <StatItem
            label="Today's Earnings"
            value={statsLoading ? null : formatCurrency(stats?.todayEarnings ?? 0)}
            icon="cash"
            color="#10B981"
            loading={statsLoading}
          />
          <StatItem
            label="Deliveries"
            value={statsLoading ? null : String(stats?.todayDeliveries ?? 0)}
            icon="bicycle"
            color={Colors.primary}
            loading={statsLoading}
          />
          <StatItem
            label="Rating"
            value={statsLoading ? null : `${stats?.rating?.toFixed(1) ?? '—'}`}
            icon="star"
            color="#F59E0B"
            loading={statsLoading}
          />
        </Animated.View>

        {/* ── Active Offers Preview ── */}
        {offers && offers.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Offers</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Earnings', { initialTab: 'Offers' })}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {offers.slice(0, 1).map((offer: any) => {
              const tiers: Array<{ targetCount: number; bonusAmount: number; label?: string }> =
                offer.tiers ?? [];
              const currentCount = offer.currentCount ?? 0;
              const activeTier = tiers.find(t => currentCount < t.targetCount) ?? tiers[tiers.length - 1];

              const progress = activeTier
                ? Math.min(currentCount / activeTier.targetCount, 1)
                : 1;
              const remaining = activeTier ? Math.max(activeTier.targetCount - currentCount, 0) : 0;

              return (
                <TouchableOpacity
                  key={offer._id}
                  style={styles.offerPreviewCard}
                  onPress={() => navigation.navigate('Earnings')}
                  activeOpacity={0.9}
                >
                  <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.offerPreviewInner}>
                    <View style={styles.offerPreviewHeader}>
                      <View style={styles.offerIconBg}>
                        <Ionicons name="trophy" size={20} color="#F59E0B" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.offerPreviewTitle}>{offer.title}</Text>
                        <Text style={styles.offerPreviewSub}>
                          {!activeTier
                            ? 'All bonuses achieved! 🎉'
                            : remaining > 0
                              ? `${remaining} more to go for ₹${activeTier.bonusAmount} bonus!`
                              : 'Bonus achieved! 🎉'}
                        </Text>
                      </View>
                      <Text style={styles.offerDescription}>{offer.description}</Text>
                      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    </View>

                    <View style={styles.offerProgressBar}>
                      <View style={[styles.offerProgressFill, { width: `${progress * 100}%` as any }]} />
                    </View>
                    <View style={styles.offerProgressFooter}>
                      <Text style={styles.offerProgressText}>
                        {currentCount} / {activeTier?.targetCount ?? '—'} Complete
                        {activeTier?.label ? ` · ${activeTier.label}` : ''}
                      </Text>
                      <Text style={styles.offerPercentText}>{Math.round(progress * 100)}%</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        )}

        {/* ── Quick Actions ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Ionicons name="grid-outline" size={18} color={Colors.textSecondary} />
          </View>
          <View style={styles.quickGrid}>
            {quickActions.map((qa) => (
              <QuickActionCard
                key={qa.screen}
                icon={qa.icon}
                iconFocused={qa.iconFocused}
                label={qa.label}
                count={qa.count}
                color={qa.color}
                onPress={() => navigation.navigate(qa.screen)}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  partnerName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // Notif
  notifWrapper: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  notifPulseRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.danger,
  },
  notifBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  notifCountChip: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.danger,
  },
  notifCountText: { fontSize: 8, fontWeight: '900', color: Colors.danger, lineHeight: 13 },

  // Avatar
  avatarBtn: { width: 44, height: 44, borderRadius: 22, position: 'relative' },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
  avatarStatusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.background,
  },

  // Hero
  heroBanner: {
    borderRadius: 22,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  heroDecorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.white,
  },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLeft: { flex: 1, gap: 6 },
  heroRight: {},
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 2,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusPillText: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, letterSpacing: -0.4 },
  heroSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  switchContainer: {
    borderRadius: 999,
    padding: 8,
  },
  heroStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    gap: 12,
  },
  heroStripItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroStripDivider: { width: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroStripText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'flex-start',
    gap: 6,
    ...Shadow.sm,
  },
  statIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.1 },
  statSkeleton: { width: 48, height: 20, borderRadius: 6, backgroundColor: Colors.border },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },

  // Quick Actions grid
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  qaCard: {
    width: '30.5%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    ...Shadow.sm,
  },
  qaIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qaBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  qaBadgeText: { color: Colors.white, fontSize: 8, fontWeight: '900' },
  qaLabel: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },

  // Offer Preview
  viewAllText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  offerPreviewCard: {
    marginHorizontal: 0,
    marginBottom: Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  offerPreviewInner: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
  },
  offerPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  offerIconBg: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F59E0B15',
    alignItems: 'center', justifyContent: 'center',
  },
  offerDescription: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 8 },
  offerPreviewTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  offerPreviewSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  offerProgressBar: {
    height: 8, backgroundColor: '#F1F5F9',
    borderRadius: 4, overflow: 'hidden',
  },
  offerProgressFill: {
    height: '100%', backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  offerProgressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  offerProgressText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  offerPercentText: { fontSize: 11, fontWeight: '800', color: '#F59E0B' },
});