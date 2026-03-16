// src/screens/orders/ActiveDeliveryScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Order, Shipment } from '../../types';
import {
  useShipmentById,
  useStartDelivery,
  useCompleteDelivery,
  useFailDelivery,
  useRejectOrder,
  usePickupOrder,
  useRequestDeliveryOtp,
  useVerifyDeliveryOtp,
  useActiveOrders,
} from '../../hooks/useQueries';
import { Card, Divider } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import {
  formatCurrency,
  getOrderStatusColor,
  getOrderStatusLabel,
  isCOD,
} from '../../utils/helpers';
import { FullMapModal } from './FullMapModal';
import { ActiveDeliveryMap } from '../../components/orders/ActiveDeliveryMap';

// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Section Label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ icon, text }: { icon: IoniconsName; text: string }) => (
  <View style={styles.sectionLabelRow}>
    <Ionicons name={icon} size={13} color={Colors.textSecondary} />
    <Text style={styles.sectionLabel}>{text}</Text>
  </View>
);

// ── Full Map Modal ─────────────────────────────────────────────────────────────

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ActiveDeliveryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const shipmentId: string = route.params?.shipmentId;

  const { data: shipment, isLoading } = useShipmentById(shipmentId);

  // FIX: Safe order extraction — agar orderId object nahi hai toh undefined rakho
  const order: Order | undefined = (
    shipment?.orderId && typeof shipment.orderId === 'object'
      ? shipment.orderId
      : undefined
  ) as Order | undefined;

  const startDelivery = useStartDelivery();
  const pickupOrder = usePickupOrder();
  const completeDelivery = useCompleteDelivery();
  const failDelivery = useFailDelivery();
  const rejectOrder = useRejectOrder();
  const requestDeliveryOtp = useRequestDeliveryOtp();
  const verifyDeliveryOtp = useVerifyDeliveryOtp();

  const [failModalVisible, setFailModalVisible] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [partnerLocation, setPartnerLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fullMapVisible, setFullMapVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { refetch, isRefetching } = useActiveOrders();

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        setPartnerLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
          (newLoc) => setPartnerLocation({
            latitude: newLoc.coords.latitude,
            longitude: newLoc.coords.longitude,
          })
        );
      } catch (e) {
        // Location permission denied ya error — silently ignore, map will work without partner dot
        console.warn('Location error:', e);
      }
    })();
    return () => { subscription?.remove(); };
  }, []);

  const handleNavigate = () => {
    if (!shipment || !order) return;
    let coords: any = null;
    let destinationLabel = '';
    let fallbackAddr = '';

    if (shipment.status === 'ACCEPTED' || shipment.status === 'PICKED_UP') {
      const warehouse = (shipment as any).warehouseId;
      coords = warehouse?.location ?? null;
      destinationLabel = warehouse?.name || 'Warehouse';
      fallbackAddr = warehouse?.address?.addressLine1 || '';
    } else {
      // OUT_FOR_DELIVERY — FIX: use new location field if available
      const addr = order.shippingAddress ?? null;
      coords = addr?.location ?? addr; // Priority to addr.location, fallback to addr (which was old lat/lng)
      destinationLabel = order.user?.name || 'Customer';
      fallbackAddr = [addr?.street, addr?.city].filter(Boolean).join(', ');
    }

    if (coords?.latitude != null && coords?.longitude != null) {
      const url = Platform.OS === 'ios'
        ? `maps://0,0?q=${encodeURIComponent(destinationLabel)}@${coords.latitude},${coords.longitude}`
        : `google.navigation:q=${coords.latitude},${coords.longitude}`;
      Linking.openURL(url).catch(() => {
        // Fallback if maps app not available
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`);
      });
    } else if (fallbackAddr) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddr)}`);
    } else {
      Alert.alert('Error', 'No address available for navigation.');
    }
  };

  const handleCallCustomer = () => {
    // FIX: null-safe phone check
    const phone = order?.user?.phone;
    if (!phone) {
      Alert.alert('Unavailable', 'Customer phone number is not available.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Error', 'Unable to make a call.')
    );
  };

  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      if (shipment?.status === 'PICKED_UP') {
        Alert.alert('Success', 'Manager verified pickup!');
      }
    } catch (e) {
      console.warn('Refetch error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStart = async () => {
    if (!shipmentId) return;
    try {
      await startDelivery.mutateAsync(shipmentId);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to start delivery');
    }
  };

  const handleCancelAssignment = async () => {
    if (!shipmentId) return;
    try {
      await rejectOrder.mutateAsync({ shipmentId });
      setFailModalVisible(false);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to cancel assignment');
    }
  };

  const handleRequestDeliveryOtp = async () => {
    if (!shipmentId) return;
    try {
      await requestDeliveryOtp.mutateAsync(shipmentId);
      Alert.alert('Success', 'OTP sent to the customer.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to request OTP');
    }
  };

  const handleVerifyDelivery = async () => {
    if (!shipmentId) return;
    // FIX: OTP length validation with proper message
    if (otpValue.trim().length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
      return;
    }
    try {
      await verifyDeliveryOtp.mutateAsync({ shipmentId, otp: otpValue });
      // FIX: Close modal FIRST, then clear state, then navigate
      // Avoids state-update-on-unmounted-component crash
      setOtpModalVisible(false);
      setOtpValue('');
      // Small delay so modal animation completes before navigation
      setTimeout(() => {
        Alert.alert('Success', 'Order delivered successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }, 300);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleFailDelivery = async () => {
    if (!shipmentId) return;
    if (!failReason.trim()) {
      Alert.alert('Required', 'Please describe the issue before reporting.');
      return;
    }
    try {
      await failDelivery.mutateAsync({ orderId: shipmentId, reason: failReason });
      setFailModalVisible(false);
      setFailReason('');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to report failure');
    }
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Not found ──
  if (!shipment || !order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <View style={styles.notFoundIconWrap}>
            <Ionicons name="receipt-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.notFoundTitle}>Order Not Found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.notFoundBtn}>
            <Ionicons name="arrow-back" size={16} color={Colors.white} />
            <Text style={styles.notFoundBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canPickup = shipment.status === 'ACCEPTED';
  const canStart = shipment.status === 'PICKED_UP';
  const canComplete = shipment.status === 'OUT_FOR_DELIVERY';

  const warehouse = (shipment as any).warehouseId;
  const isPickupPhase = shipment.status === 'ACCEPTED' || shipment.status === 'PICKED_UP';

  // FIX: Fully null-safe destination for OUT_FOR_DELIVERY
  const shippingAddr = order.shippingAddress ?? null;
  const destination = isPickupPhase
    ? (warehouse?.location ?? null)
    : (shippingAddr?.location ?? shippingAddr ?? null);
  const destinationLabel = isPickupPhase
    ? (warehouse?.name || 'Warehouse')
    : (order.user?.name || 'Customer');
  const destinationIcon = isPickupPhase ? 'business' : 'home';

  const statusColor = getOrderStatusColor(order.orderStatus);
  // FIX: Safe orderId slice — handle number/undefined/null cases
  const orderId = order.orderId
    ? String(order.orderId).slice(-8)
    : 'N/A';

  // FIX: Safe items array — never undefined
  const orderItems = Array.isArray(order?.items) ? order.items : [];

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Full Map Modal ── */}
      <FullMapModal
        visible={fullMapVisible}
        onClose={() => setFullMapVisible(false)}
        partnerLocation={partnerLocation}
        destination={destination}
        destinationLabel={destinationLabel}
        destinationIcon={destinationIcon}
      />

      {/* ── Header ── */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight || '#818CF8']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerDecor} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>ORDER DETAIL</Text>
          <Text style={styles.headerOrderId}>#{orderId}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusPillText}>{getOrderStatusLabel(order.orderStatus)}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Map ── */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setFullMapVisible(true)}
          style={styles.mapContainer}
        >
          <ActiveDeliveryMap
            partnerLocation={partnerLocation}
            destination={destination as any}
            destinationLabel={destinationLabel}
            destinationIcon={destinationIcon}
          />
          <View style={styles.mapOverlayHint}>
            <Ionicons name="expand-outline" size={12} color={Colors.white} />
            <Text style={styles.mapHintText}>Tap to expand</Text>
          </View>
        </TouchableOpacity>

        {/* ── Phase card ── */}
        <View style={styles.phaseCard}>
          <View style={styles.phaseHeaderRow}>
            <View style={styles.stepChip}>
              <Text style={styles.stepChipText}>{isPickupPhase ? 'STEP 1' : 'STEP 2'}</Text>
            </View>
            <Text style={styles.phaseTitle}>
              {isPickupPhase ? 'Pick up from Warehouse' : 'Deliver to Customer'}
            </Text>
          </View>

          {(isPickupPhase && shipment.status !== 'PICKED_UP') ? (
            <View style={styles.navBtnDisabledWrap}>
              <Text style={styles.navDisabledText}>
                ⚠️ Wait for warehouse manager to verify the OTP before navigating to customer.
              </Text>
            </View>
          ) : (
            <TouchableOpacity onPress={handleNavigate} activeOpacity={0.88} style={styles.navBtnWrap}>
              <LinearGradient
                colors={[Colors.accent || '#0EA5E9', '#0284C7']}
                style={styles.navBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="navigate" size={18} color={Colors.white} />
                <Text style={styles.navBtnText}>
                  Navigate to {isPickupPhase ? 'Warehouse' : 'Customer'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Destination detail ── */}
        <View style={styles.detailCard}>
          {isPickupPhase ? (
            <>
              <SectionLabel icon="business-outline" text="WAREHOUSE DETAILS" />
              <Text style={styles.detailTitle}>{warehouse?.name || 'Warehouse'}</Text>
              <View style={styles.detailAddrRow}>
                <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.detailSub}>
                  {[warehouse?.address?.addressLine1, warehouse?.address?.city]
                    .filter(Boolean)
                    .join(', ') || 'Address not available'}
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* FIX: OUT_FOR_DELIVERY — fully null-safe customer section */}
              <View style={styles.customerRow}>
                <View style={{ flex: 1 }}>
                  <SectionLabel icon="person-circle-outline" text="CUSTOMER" />
                  <Text style={styles.detailTitle}>
                    {order.user?.name || 'Customer'}
                  </Text>
                  <View style={styles.detailAddrRow}>
                    <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.detailSub}>
                      {[shippingAddr?.street, shippingAddr?.city]
                        .filter(Boolean)
                        .join(', ') || 'Address not available'}
                    </Text>
                  </View>
                </View>
                {/* FIX: Only render call button if phone exists */}
                {order.user?.phone ? (
                  <TouchableOpacity
                    onPress={handleCallCustomer}
                    style={styles.callBtn}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[Colors.success, '#059669']}
                      style={styles.callGradient}
                    >
                      <Ionicons name="call" size={20} color={Colors.white} />
                    </LinearGradient>
                  </TouchableOpacity>
                ) : null}
              </View>
            </>
          )}
        </View>

        {/* ── Payment & Items ── */}
        <View style={styles.detailCard}>
          <View style={styles.paymentRow}>
            <View style={{ flex: 1 }}>
              <SectionLabel icon="card-outline" text="PAYMENT" />
              <View style={styles.paymentBadgeRow}>
                <View style={[
                  styles.paymentBadge,
                  { backgroundColor: isCOD(order.paymentMethod) ? '#FEF3C7' : '#D1FAE5' }
                ]}>
                  <Ionicons
                    name={isCOD(order.paymentMethod) ? 'cash' : 'checkmark-circle'}
                    size={14}
                    color={isCOD(order.paymentMethod) ? '#D97706' : '#059669'}
                  />
                  <Text style={[
                    styles.paymentBadgeText,
                    { color: isCOD(order.paymentMethod) ? '#D97706' : '#059669' }
                  ]}>
                    {isCOD(order.paymentMethod) ? 'Cash on Delivery — Collect' : 'Prepaid'}
                  </Text>
                </View>
              </View>
            </View>
            {/* FIX: null-safe totalAmount */}
            <Text style={styles.amountText}>
              {order.totalAmount != null ? formatCurrency(order.totalAmount) : '—'}
            </Text>
          </View>

          <View style={styles.cardDivider} />

          {/* FIX: Use safe orderItems array */}
          <SectionLabel icon="cube-outline" text={`ITEMS (${orderItems.length})`} />
          <View style={{ gap: 6, marginTop: 6 }}>
            {orderItems.length > 0 ? (
              orderItems.map((item, idx) => (
                <View key={item?._id ?? idx} style={styles.itemRow}>
                  <View style={styles.itemDot} />
                  <Text style={styles.itemText} numberOfLines={1}>
                    {item?.quantity ?? 1}× {item?.title || 'Product'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.detailSub}>No items found</Text>
            )}
          </View>
        </View>

        {/* ── Pickup OTP ── */}
        {isPickupPhase && shipment.pickupOtp ? (
          <View style={styles.otpCard}>
            <LinearGradient
              colors={[Colors.primary + '15', Colors.primary + '08']}
              style={styles.otpGradient}
            >
              <SectionLabel icon="key-outline" text="PICKUP OTP" />
              <Text style={styles.otpValue}>{shipment.pickupOtp}</Text>
              <View style={styles.otpHintRow}>
                <Ionicons name="information-circle-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.otpHint}>Show this to the Warehouse Manager</Text>
              </View>
            </LinearGradient>
          </View>
        ) : null}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Action Footer ── */}
      <View style={styles.actionBar}>
        {canPickup && (
          <TouchableOpacity
            onPress={handleCheckStatus}
            disabled={isRefreshing || isRefetching}
            activeOpacity={0.85}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight || '#818CF8']}
              style={styles.actionBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {(isRefreshing || isRefetching)
                ? <ActivityIndicator color={Colors.white} />
                : <>
                  <Ionicons name="refresh" size={18} color={Colors.white} />
                  <Text style={styles.actionBtnText}>Check Pickup Status</Text>
                </>
              }
            </LinearGradient>
          </TouchableOpacity>
        )}

        {canStart && (
          <TouchableOpacity
            onPress={handleStart}
            disabled={startDelivery.isPending}
            activeOpacity={0.85}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight || '#818CF8']}
              style={styles.actionBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {startDelivery.isPending
                ? <ActivityIndicator color={Colors.white} />
                : <>
                  <Ionicons name="bicycle" size={18} color={Colors.white} />
                  <Text style={styles.actionBtnText}>Start Delivery</Text>
                </>
              }
            </LinearGradient>
          </TouchableOpacity>
        )}

        {canComplete && (
          <View style={{ flex: 2, flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleRequestDeliveryOtp}
              disabled={requestDeliveryOtp.isPending}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {requestDeliveryOtp.isPending
                  ? <ActivityIndicator color={Colors.white} size="small" />
                  : <>
                    <Ionicons name="mail" size={15} color={Colors.white} />
                    <Text style={[styles.actionBtnText, { fontSize: FontSize.sm }]}>Send OTP</Text>
                  </>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOtpModalVisible(true)}
              disabled={verifyDeliveryOtp.isPending}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={[Colors.success, '#059669']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Ionicons name="checkmark-circle" size={15} color={Colors.white} />
                <Text style={[styles.actionBtnText, { fontSize: FontSize.sm }]}>Enter OTP</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setFailModalVisible(true)}
          style={styles.moreBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Fail / Issue Modal ── */}
      <Modal visible={failModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <Ionicons name="warning-outline" size={22} color={Colors.danger} />
              <Text style={styles.modalTitle}>Report Issue</Text>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Describe the issue..."
              placeholderTextColor={Colors.textMuted}
              value={failReason}
              onChangeText={setFailReason}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => { setFailModalVisible(false); setFailReason(''); }}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelAssignment}
                disabled={rejectOrder.isPending}
                style={[styles.modalActionBtn, { backgroundColor: '#F59E0B' }]}
              >
                {rejectOrder.isPending
                  ? <ActivityIndicator color={Colors.white} size="small" />
                  : <>
                    <Ionicons name="close-circle-outline" size={15} color={Colors.white} />
                    <Text style={styles.modalActionBtnText}>Cancel Assignment</Text>
                  </>
                }
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFailDelivery}
                disabled={failDelivery.isPending}
                style={[styles.modalActionBtn, { backgroundColor: Colors.danger }]}
              >
                {failDelivery.isPending
                  ? <ActivityIndicator color={Colors.white} size="small" />
                  : <>
                    <Ionicons name="alert-circle-outline" size={15} color={Colors.white} />
                    <Text style={styles.modalActionBtnText}>Report Failure</Text>
                  </>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── OTP Modal ── */}
      <Modal visible={otpModalVisible} animationType="fade" transparent>
        <View style={styles.otpModalOverlay}>
          <View style={styles.otpModalCard}>
            <View style={styles.otpModalIconWrap}>
              <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Verify Delivery</Text>
            <Text style={styles.otpModalSubtitle}>
              Enter the 6-digit OTP sent to the customer
            </Text>
            <TextInput
              style={styles.otpInput}
              placeholder="• • • • • •"
              keyboardType="number-pad"
              maxLength={6}
              value={otpValue}
              onChangeText={setOtpValue}
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity
              onPress={handleVerifyDelivery}
              disabled={verifyDeliveryOtp.isPending || otpValue.trim().length !== 6}
              style={[styles.otpVerifyBtn, { opacity: otpValue.trim().length !== 6 ? 0.5 : 1 }]}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.success, '#059669']}
                style={styles.otpVerifyGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {verifyDeliveryOtp.isPending
                  ? <ActivityIndicator color={Colors.white} />
                  : <>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                    <Text style={styles.otpVerifyText}>Verify & Complete</Text>
                  </>
                }
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setOtpModalVisible(false); setOtpValue(''); }}
              style={styles.otpCloseBtn}
            >
              <Text style={styles.otpCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },

  notFoundIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  notFoundTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textSecondary },
  notFoundBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
  },
  notFoundBtnText: { color: Colors.white, fontWeight: '700' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    gap: 12, overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 1.2 },
  headerOrderId: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.white, letterSpacing: -0.3, marginTop: 2 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusPillText: { color: Colors.white, fontSize: 11, fontWeight: '800' },

  content: { padding: Spacing.md, gap: Spacing.md },

  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.8 },

  mapContainer: { borderRadius: 18, overflow: 'hidden', ...Shadow.md },
  mapOverlayHint: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  mapHintText: { color: Colors.white, fontSize: 10, fontWeight: '700' },

  phaseCard: {
    backgroundColor: Colors.white, borderRadius: 18,
    overflow: 'hidden', ...Shadow.sm,
  },
  phaseHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, backgroundColor: Colors.background,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stepChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  stepChipText: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  phaseTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  navBtnWrap: { margin: 12 },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: BorderRadius.md,
  },
  navBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
  navBtnDisabledWrap: {
    margin: 12,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  navDisabledText: {
    color: '#D97706',
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },

  detailCard: {
    backgroundColor: Colors.white, borderRadius: 18,
    padding: 16, ...Shadow.sm,
  },
  detailTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  detailAddrRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
  detailSub: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  callBtn: { borderRadius: 24, overflow: 'hidden' },
  callGradient: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },

  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  paymentBadgeRow: { flexDirection: 'row', marginTop: 4 },
  paymentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  paymentBadgeText: { fontSize: 12, fontWeight: '800' },
  amountText: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textPrimary },
  cardDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },

  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  itemText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },

  otpCard: { borderRadius: 18, overflow: 'hidden', ...Shadow.sm },
  otpGradient: {
    padding: 20, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.primary + '30', borderRadius: 18,
  },
  otpValue: { fontSize: 38, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 8 },
  otpHintRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  otpHint: { fontSize: 11, color: Colors.textSecondary },

  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: Spacing.md, paddingBottom: 28,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
    gap: 10, ...Shadow.lg,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: BorderRadius.md, paddingVertical: 15,
  },
  actionBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  moreBtn: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: Spacing.xl, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20,
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    minHeight: 100, marginBottom: 20,
    fontSize: FontSize.md, color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md,
  },
  modalCancelText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  modalActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 13, borderRadius: BorderRadius.md,
  },
  modalActionBtnText: { color: Colors.white, fontWeight: '700', fontSize: 11 },

  otpModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', padding: 24,
  },
  otpModalCard: {
    backgroundColor: Colors.white, borderRadius: 24,
    padding: 28, alignItems: 'center', gap: 8,
  },
  otpModalIconWrap: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  otpModalSubtitle: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: 8,
  },
  otpInput: {
    width: '100%', backgroundColor: Colors.background,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: 16,
    fontSize: 28, textAlign: 'center', letterSpacing: 10,
    fontWeight: '900', color: Colors.textPrimary,
  },
  otpVerifyBtn: { width: '100%', marginTop: 6 },
  otpVerifyGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: BorderRadius.md,
  },
  otpVerifyText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  otpCloseBtn: { marginTop: 8 },
  otpCloseText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
});