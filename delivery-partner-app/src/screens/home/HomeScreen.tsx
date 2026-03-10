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
import {
  useDashboardStats,
  useActiveOrder,
  useAvailableOrders,
  useUpdateAvailability,
} from '../../hooks/useQueries';
import { useAuthStore } from '../../store/authStore';
import { socketService } from '../../services/socketService';
import { locationService } from '../../services/locationService';
import { StatusDot } from '../../components/ui';
import { Colors, Spacing, FontSize, Shadow } from '../../utils/theme';
import { formatCurrency, getInitials } from '../../utils/helpers';

import { StatCard } from '../../components/home/StatCard';
import { QuickAction } from '../../components/home/QuickAction';
import { ActiveOrderCard } from '../../components/home/ActiveOrderCard';
import { NoActiveOrderCard } from '../../components/home/NoActiveOrderCard';

// ── Animated Pulsing Notification Badge ──────────────────────────────────────
const PulsingNotifBadge = ({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 650,
            useNativeDriver: true,
          }),
        ]),
        // Reset instantly
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(500),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.notifWrapper} activeOpacity={0.8}>
      {/* Expanding pulse ring */}
      <Animated.View
        style={[
          styles.notifPulseRing,
          { transform: [{ scale: pulseAnim }], opacity: pulseOpacity },
        ]}
      />
      {/* Bell button */}
      <View style={styles.notifBadge}>
        <Text style={styles.notifBell}>🔔</Text>
        {/* Count chip */}
        <View style={styles.notifCountChip}>
          <Text style={styles.notifCountText}>{count > 9 ? '9+' : count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const partner = useAuthStore((s) => s.partner);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: activeOrder, isLoading: activeLoading, refetch: refetchActive } = useActiveOrder();
  const { data: availableOrders } = useAvailableOrders();
  const updateAvailability = useUpdateAvailability();

  const isOnline = partner?.availabilityStatus === 'ONLINE';
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    socketService.connect();

    if (isOnline) locationService.startTracking();

    const unsubNewOrder = socketService.onNewOrder(() => {
      navigation.navigate('AvailableOrders');
    });

    return () => { unsubNewOrder(); };
  }, []);

  const handleToggleOnline = async () => {
    const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
    await updateAvailability.mutateAsync(newStatus);
    if (newStatus === 'ONLINE') {
      locationService.startTracking();
    } else {
      locationService.stopTracking();
    }
  };

  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchActive();
  }, []);

  const pendingCount = availableOrders?.length ?? 0;

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
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.partnerName}>{partner?.name || 'Partner'}</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Animated notification bell — only shown when there are pending orders */}
            {pendingCount > 0 && (
              <PulsingNotifBadge
                count={pendingCount}
                onPress={() => navigation.navigate('AvailableOrders')}
              />
            )}

            {/* Profile avatar — fixed: image OR initials, never both */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarBtn}
              activeOpacity={0.85}
            >
              {partner?.profileImage ? (
                <Image
                  source={{ uri: partner.profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {getInitials(partner?.name || 'DP')}
                  </Text>
                </View>
              )}
              {/* Online status indicator dot */}
              <View
                style={[
                  styles.avatarStatusDot,
                  { backgroundColor: isOnline ? Colors.online : Colors.offline },
                ]}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Online Toggle Hero */}
        <LinearGradient
          colors={isOnline ? [Colors.primary, Colors.primaryLight] : ['#3A3A5C', '#1E1E30']}
          style={styles.heroBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <View style={styles.statusRow}>
                <StatusDot status={partner?.availabilityStatus ?? 'OFFLINE'} size={12} />
                <Text style={styles.statusLabel}>
                  {partner?.availabilityStatus ?? 'OFFLINE'}
                </Text>
              </View>
              <Text style={styles.heroTitle}>{isOnline ? 'You are Live!' : 'You are Offline'}</Text>
              <Text style={styles.heroSubtitle}>
                {isOnline
                  ? 'Accepting new delivery requests'
                  : 'Toggle to start receiving orders'}
              </Text>
            </View>
            <View style={styles.heroRight}>
              <Switch
                value={isOnline}
                onValueChange={handleToggleOnline}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: Colors.accent }}
                thumbColor={Colors.white}
                ios_backgroundColor="rgba(255,255,255,0.2)"
                style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
              />
            </View>
          </View>
          <View style={styles.heroDecor} />
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Today's Earnings"
            value={statsLoading ? null : formatCurrency(stats?.todayEarnings ?? 0)}
            icon="💰"
            color={Colors.success}
          />
          <StatCard
            label="Deliveries Today"
            value={statsLoading ? null : String(stats?.todayDeliveries ?? 0)}
            icon="📦"
            color={Colors.primary}
          />
          <StatCard
            label="Rating"
            value={statsLoading ? null : `${stats?.rating?.toFixed(1) ?? '—'} ⭐`}
            icon="⭐"
            color={Colors.warning}
          />
        </View>

        {/* Active Order */}
        {activeOrder ? (
          <ActiveOrderCard
            order={activeOrder}
            onPress={() => navigation.navigate('ActiveDelivery', { orderId: activeOrder._id })}
          />
        ) : (
          <NoActiveOrderCard isOnline={isOnline} />
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <QuickAction
            icon="📋"
            label="Available Orders"
            count={pendingCount}
            color={Colors.primary}
            onPress={() => navigation.navigate('AvailableOrders')}
          />
          <QuickAction
            icon="🕐"
            label="Delivery History"
            color={Colors.warning}
            onPress={() => navigation.navigate('History')}
          />
          <QuickAction
            icon="💳"
            label="Wallet"
            color={Colors.success}
            onPress={() => navigation.navigate('Wallet')}
          />
          <QuickAction
            icon="👤"
            label="Profile"
            color={Colors.accent}
            onPress={() => navigation.navigate('Profile')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  partnerName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // ── Notification Badge ──
  notifWrapper: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  notifBell: { fontSize: 19, lineHeight: 23 },
  notifCountChip: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.danger,
  },
  notifCountText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.danger,
    lineHeight: 14,
  },

  // ── Avatar ──
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    position: 'relative',
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
  avatarStatusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.background,
  },

  // ── Hero Banner ──
  heroBanner: {
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLeft: { flex: 1 },
  heroRight: {},
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, letterSpacing: -0.3 },
  heroSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  heroDecor: {
    position: 'absolute',
    right: -40,
    bottom: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    letterSpacing: -0.2,
  },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});