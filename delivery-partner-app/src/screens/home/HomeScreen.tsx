// src/screens/home/HomeScreen.tsx

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  useDashboardStats,
  useActiveOrder,
  useAvailableOrders,
  useUpdateAvailability,
  useProfile,
} from '../../hooks/useQueries';
import { useAuthStore } from '../../store/authStore';
import { socketService } from '../../services/socketService';
import { locationService } from '../../services/locationService';
import { Card, Badge, Skeleton, StatusDot } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { formatCurrency, getInitials, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const partner = useAuthStore((s) => s.partner);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: activeOrder, isLoading: activeLoading, refetch: refetchActive } = useActiveOrder();
  const { data: availableOrders } = useAvailableOrders();
  const updateAvailability = useUpdateAvailability();

  const isOnline = partner?.availabilityStatus === 'ONLINE';
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    socketService.connect();

    if (isOnline) {
      locationService.startTracking();
    }

    const unsubNewOrder = socketService.onNewOrder((order) => {
      // Play sound + navigate
      navigation.navigate('AvailableOrders');
    });

    return () => {
      unsubNewOrder();
    };
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
            {pendingCount > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('AvailableOrders')}
                style={styles.notifBadge}
              >
                <Text style={styles.notifText}>{pendingCount}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarBtn}
            >
              <Text style={styles.avatarText}>{getInitials(partner?.name || 'DP')}</Text>
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

          {/* Decorative element */}
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
          <TouchableOpacity
            onPress={() => navigation.navigate('ActiveDelivery', { orderId: activeOrder._id })}
            activeOpacity={0.92}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.accentDark]}
              style={styles.activeOrderCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.activeOrderTop}>
                <View>
                  <Text style={styles.activeOrderLabel}>ACTIVE DELIVERY</Text>
                  <Text style={styles.activeOrderId}>#{activeOrder.orderId}</Text>
                </View>
                <Badge
                  label={getOrderStatusLabel(activeOrder.orderStatus)}
                  backgroundColor="rgba(255,255,255,0.25)"
                  color={Colors.primary}
                />
              </View>
              <View style={styles.activeOrderBottom}>
                <Text style={styles.activeOrderAddr} numberOfLines={2}>
                  📍 {activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.city}
                </Text>
                <Text style={styles.activeOrderArrow}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <Card style={styles.noActiveCard}>
            <Text style={styles.noActiveIcon}>🛵</Text>
            <Text style={styles.noActiveTitle}>No Active Delivery</Text>
            <Text style={styles.noActiveText}>
              {isOnline ? 'Waiting for new order requests...' : 'Go online to receive orders'}
            </Text>
          </Card>
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

const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | null;
  icon: string;
  color: string;
}) => (
  <View style={[styles.statCard, { borderTopColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    {value === null ? (
      <Skeleton height={20} width={60} style={{ marginVertical: 2 }} />
    ) : (
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    )}
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickAction = ({
  icon,
  label,
  count,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  count?: number;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.quickAction}>
    <View style={[styles.quickIconBg, { backgroundColor: `${color}18` }]}>
      <Text style={styles.quickIcon}>{icon}</Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.quickBadge, { backgroundColor: Colors.danger }]}>
          <Text style={styles.quickBadgeText}>{count}</Text>
        </View>
      )}
    </View>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  partnerName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBadge: {
    backgroundColor: Colors.danger,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.xs },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
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
  statusLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 1 },
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
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 14,
    borderTopWidth: 3,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: FontSize.lg, fontWeight: '800', letterSpacing: -0.3 },
  statLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2, textAlign: 'center', fontWeight: '600' },
  activeOrderCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  activeOrderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  activeOrderLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5 },
  activeOrderId: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  activeOrderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeOrderAddr: { fontSize: FontSize.sm, color: Colors.primary, flex: 1, lineHeight: 20 },
  activeOrderArrow: { fontSize: 24, color: Colors.primary, fontWeight: '700' },
  noActiveCard: { marginBottom: Spacing.lg, alignItems: 'center', paddingVertical: 28 },
  noActiveIcon: { fontSize: 42, marginBottom: 10 },
  noActiveTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  noActiveText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md, letterSpacing: -0.2 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickAction: {
    width: '47.5%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  quickIconBg: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickIcon: { fontSize: 26 },
  quickLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  quickBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
});