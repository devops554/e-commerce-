// src/screens/orders/NotificationsScreen.tsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNotificationStore } from '../../store/notificationStore';
import { Notification } from '../../types';
import { Colors, FontSize, Spacing, Shadow, BorderRadius } from '../../utils/theme';
import { notificationsAPI } from '../../api/services';

// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Notification type config ──────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: IoniconsName; color: string }> = {
  NEW_ORDER: { icon: 'bicycle', color: Colors.primary },
  ORDER_ASSIGNED: { icon: 'checkmark-circle', color: '#10B981' },
  ORDER_ACCEPTED: { icon: 'thumbs-up', color: '#10B981' },
  ORDER_REJECTED: { icon: 'close-circle', color: Colors.danger },
  ORDER_PICKED_UP: { icon: 'cube', color: Colors.primary },
  ORDER_DELIVERED: { icon: 'gift', color: '#8B5CF6' },
  ORDER_FAILED: { icon: 'warning', color: '#F59E0B' },
  WALLET: { icon: 'wallet', color: '#10B981' },
  SYSTEM: { icon: 'megaphone', color: '#0EA5E9' },
};

const DEFAULT_CONFIG: { icon: IoniconsName; color: string } = {
  icon: 'notifications',
  color: Colors.primary,
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

// ── Notification Item ─────────────────────────────────────────────────────────
const NotificationItem = ({
  item,
  index,
  onPress,
}: {
  item: Notification;
  index: number;
  onPress: (item: Notification) => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, delay: index * 45, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 280, delay: index * 45, useNativeDriver: true }),
    ]).start();
  }, []);

  const config = TYPE_CONFIG[item.type] ?? DEFAULT_CONFIG;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
        onPress={() => onPress(item)}
      >
        {/* Unread left bar */}
        {!item.isRead && <View style={[styles.unreadBar, { backgroundColor: config.color }]} />}

        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: config.color + (item.isRead ? '12' : '20') }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <View style={styles.notifTopRow}>
            <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={10} color={Colors.textMuted} />
              <Text style={styles.notifTime}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
          <Text style={styles.notifBody} numberOfLines={2}>{item.message}</Text>
        </View>

        {/* Unread dot */}
        {!item.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: config.color }]} />
        )}

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationsAPI.getAll();
      if (Array.isArray(data)) {
        const mapped: Notification[] = data.map((n: any) => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type || 'SYSTEM',
          data: n.metadata,
          timestamp: n.createdAt,
          isRead: n.isRead,
        }));
        setNotifications(mapped);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [setNotifications]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const handlePress = useCallback(async (item: Notification) => {
    markAsRead(item.id);
    try { await notificationsAPI.markRead(item.id); } catch { /* ignore */ }
    setSelectedNotification(item);
  }, [markAsRead]);

  const handleActionPress = () => {
    if (selectedNotification?.data?.shipmentId) {
      const shipmentId = selectedNotification.data.shipmentId;
      setSelectedNotification(null);
      navigation.navigate('ActiveDelivery', { shipmentId });
    } else if (selectedNotification?.data?.orderId) {
      const orderId = selectedNotification.data.orderId;
      setSelectedNotification(null);
      navigation.navigate('ActiveDelivery', { orderId });
    } else {
      setSelectedNotification(null);
    }
  };

  const handleReadAll = async () => {
    try { await notificationsAPI.markAllRead(); markAllAsRead(); }
    catch { Alert.alert('Error', 'Failed to mark all as read'); }
  };

  const selConfig = selectedNotification
    ? (TYPE_CONFIG[selectedNotification.type] ?? DEFAULT_CONFIG)
    : DEFAULT_CONFIG;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

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
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Action strip */}
        <View style={styles.headerStrip}>
          <View style={styles.headerStripLeft}>
            <Ionicons
              name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
              size={13}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.headerStripText}>
              {unreadCount > 0
                ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </Text>
          </View>
          <View style={styles.headerStripActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleReadAll} style={styles.stripActionBtn}>
                <Ionicons name="checkmark-done-outline" size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.stripActionText}>Read All</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity onPress={clearAll} style={[styles.stripActionBtn, styles.stripActionBtnDanger]}>
                <Ionicons name="trash-outline" size={13} color="#FCA5A5" />
                <Text style={[styles.stripActionText, { color: '#FCA5A5' }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* ── List / Empty ── */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={({ item, index }) => (
            <NotificationItem item={item} index={index} onPress={handlePress} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="notifications-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>No notifications at the moment.</Text>
        </View>
      )}

      {/* ── Detail Modal ── */}
      <Modal
        visible={!!selectedNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedNotification && (
              <>
                {/* Icon */}
                <View style={[styles.modalIconWrap, { backgroundColor: selConfig.color + '18' }]}>
                  <Ionicons name={selConfig.icon} size={32} color={selConfig.color} />
                </View>

                {/* Type chip */}
                <View style={[styles.modalTypeChip, { backgroundColor: selConfig.color + '15', borderColor: selConfig.color + '30' }]}>
                  <Text style={[styles.modalTypeText, { color: selConfig.color }]}>
                    {selectedNotification.type.replace(/_/g, ' ')}
                  </Text>
                </View>

                <Text style={styles.modalTitle}>{selectedNotification.title}</Text>

                {/* Date row */}
                <View style={styles.modalDateRow}>
                  <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.modalDate}>
                    {new Date(selectedNotification.timestamp).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Text>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalBody}>{selectedNotification.message}</Text>
                </ScrollView>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedNotification(null)}
                  >
                    <Text style={styles.modalCloseBtnText}>Close</Text>
                  </TouchableOpacity>

                  {(selectedNotification.data?.orderId || selectedNotification.data?.shipmentId) && (
                    <TouchableOpacity
                      style={styles.modalPrimaryBtn}
                      onPress={handleActionPress}
                    >
                      <LinearGradient
                        colors={[Colors.primary, Colors.primaryLight || '#818CF8']}
                        style={styles.modalPrimaryBtnGradient}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      >
                        <Ionicons name="bicycle" size={15} color={Colors.white} />
                        <Text style={styles.modalPrimaryBtnText}>View Order</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 1.2 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white, letterSpacing: -0.3, marginTop: 2 },
  unreadCountBadge: {
    minWidth: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.danger,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  unreadCountText: { fontSize: FontSize.md, fontWeight: '900', color: Colors.white },

  // Header strip
  headerStrip: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
  },
  headerStripLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerStripText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  headerStripActions: { flexDirection: 'row', gap: 8 },
  stripActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  stripActionBtnDanger: { backgroundColor: 'rgba(239,68,68,0.2)' },
  stripActionText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '700' },

  // List
  listContent: { padding: Spacing.md, paddingBottom: 32, gap: 8 },

  // Notification item
  notifItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 16,
    paddingVertical: 12, paddingRight: 12, paddingLeft: 14,
    gap: 10, overflow: 'hidden',
    ...Shadow.sm,
  },
  notifItemUnread: { backgroundColor: '#F5F3FF' },
  unreadBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  notifTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  notifTitleUnread: { fontWeight: '800' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  notifTime: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  notifBody: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 17 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },

  // Empty
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 40, gap: 14,
  },
  emptyIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.lg, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    backgroundColor: Colors.white, borderRadius: 24,
    padding: Spacing.xl, width: '100%', maxHeight: '80%',
    alignItems: 'center', gap: 8, ...Shadow.lg,
  },
  modalIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  modalTypeChip: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 999, borderWidth: 1,
  },
  modalTypeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  modalTitle: {
    fontSize: FontSize.lg, fontWeight: '800',
    color: Colors.textPrimary, textAlign: 'center',
  },
  modalDateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modalDate: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  modalScroll: { maxHeight: 180, width: '100%', marginVertical: 8 },
  modalBody: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    lineHeight: 22, textAlign: 'center',
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md, width: '100%', marginTop: 4 },
  modalCloseBtn: {
    flex: 1, paddingVertical: 13, borderRadius: BorderRadius.full,
    backgroundColor: Colors.background, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  modalCloseBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  modalPrimaryBtn: { flex: 1, borderRadius: BorderRadius.full, overflow: 'hidden' },
  modalPrimaryBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 13,
  },
  modalPrimaryBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },
});