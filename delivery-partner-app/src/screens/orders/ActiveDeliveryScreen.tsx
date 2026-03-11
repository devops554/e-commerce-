// src/screens/orders/ActiveDeliveryScreen.tsx

import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Order, Shipment } from '../../types';
import {
  useActiveOrder,
  useStartDelivery,
  useCompleteDelivery,
  useFailDelivery,
  useRejectOrder,
  usePickupOrder,
  useRequestDeliveryOtp,
  useVerifyDeliveryOtp,
  useRequestPickupOtp,
} from '../../hooks/useQueries';
import { Badge, Card, Divider } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import {
  formatCurrency,
  getOrderStatusColor,
  getOrderStatusLabel,
  isCOD,
} from '../../utils/helpers';

export default function ActiveDeliveryScreen() {
  console.log("ActiveDeliveryScreen");
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const routeShipmentId = route.params?.shipmentId;

  const { data: shipment, isLoading } = useActiveOrder();
  const order: Order | undefined = shipment?.orderId;
  const startDelivery = useStartDelivery();
  const pickupOrder = usePickupOrder();
  const completeDelivery = useCompleteDelivery();
  const failDelivery = useFailDelivery();
  const rejectOrder = useRejectOrder();

  const [failModalVisible, setFailModalVisible] = useState(false);
  const [failReason, setFailReason] = useState('');

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  const requestDeliveryOtp = useRequestDeliveryOtp();
  const verifyDeliveryOtp = useVerifyDeliveryOtp();
  const requestPickupOtp = useRequestPickupOtp();

  // We need shipmentId for API calls. 
  // Shipment object already has the _id
  const shipmentId = shipment?._id || routeShipmentId;

  const handleNavigate = () => {
    if (!order || !order.shippingAddress) return;
    const { latitude, longitude } = order.shippingAddress as any;
    if (latitude && longitude) {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      );
    } else {
      const addr = `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}`;
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`);
    }
  };

  const handleCallCustomer = () => {
    if (!order) return;
    Linking.openURL(`tel:${order.user.phone}`);
  };

  const handlePickup = async () => {
    if (!shipmentId) return;
    try {
      await pickupOrder.mutateAsync(shipmentId);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to pickup order');
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
      navigation.navigate('Home');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to cancel assignment');
    }
  };

  const handleComplete = async () => {
    if (!shipmentId || !order) return;
    Alert.alert(
      'Mark as Delivered',
      isCOD(order.paymentMethod)
        ? `Confirm you have collected ₹${order.totalAmount} cash from the customer.`
        : 'Confirm the order has been delivered successfully.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Delivered',
          onPress: async () => {
            try {
              await completeDelivery.mutateAsync(shipmentId);
              navigation.navigate('Home');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to complete delivery');
            }
          },
        },
      ]
    );
  };

  const handleRequestDeliveryOtp = async () => {
    if (!shipmentId) return;
    try {
      await requestDeliveryOtp.mutateAsync(shipmentId);
      Alert.alert('Success', 'OTP has been sent to the customer.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to request OTP');
    }
  };

  const handleVerifyDelivery = async () => {
    if (!shipmentId || otpValue.length !== 6) return;
    try {
      await verifyDeliveryOtp.mutateAsync({ shipmentId, otp: otpValue });
      setOtpModalVisible(false);
      setOtpValue('');
      Alert.alert('Success', 'Order delivered successfully!');
      navigation.navigate('Home');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleFailDelivery = async () => {
    if (!shipmentId || !failReason.trim()) return;
    try {
      await failDelivery.mutateAsync({ orderId: shipmentId, reason: failReason });
      setFailModalVisible(false);
      navigation.navigate('Home');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to report delivery failure');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!shipment || !order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>🚚</Text>
          <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: Colors.textSecondary }}>
            No Active Delivery
          </Text>
          <Text style={{ color: Colors.textMuted, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
            You don't have any ongoing delivery right now. Check Available Orders to pick one up!
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: BorderRadius.md }}
          >
            <Text style={{ color: Colors.white, fontWeight: '700' }}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getOrderStatusColor(order.orderStatus);
  const canPickup = shipment.status === 'ACCEPTED';
  const canStart = shipment.status === 'PICKED_UP';
  const canComplete = shipment.status === 'OUT_FOR_DELIVERY';

  // shipmentId is defined at the top

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>ACTIVE DELIVERY</Text>
          <Text style={styles.headerOrderId}>#{typeof order.orderId === 'string' ? order.orderId : 'ID Error'}</Text>
        </View>
        <Badge
          label={getOrderStatusLabel(order.orderStatus)}
          backgroundColor="rgba(255,255,255,0.2)"
          color={Colors.white}
        />
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Card */}
        <Card style={styles.customerCard}>
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{typeof order.user?.name === 'string' ? order.user.name : 'Customer'}</Text>
              <Text style={styles.customerPhone}>{typeof order.user?.phone === 'string' ? order.user.phone : 'No Phone'}</Text>
            </View>
            <TouchableOpacity onPress={handleCallCustomer} style={styles.callBtn}>
              <LinearGradient
                colors={[Colors.success, Colors.accentDark]}
                style={styles.callGradient}
              >
                <Text style={{ fontSize: 18 }}>📞</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Address Card */}
        <Card style={styles.addressCard}>
          <Text style={styles.sectionLabel}>📍 Delivery Address</Text>
          <Text style={styles.addressMain}>
            {order.shippingAddress?.street || 'No Street'}
          </Text>
          {order.shippingAddress?.landmark && (
            <Text style={styles.addressSub}>
              Near: {order.shippingAddress.landmark}
            </Text>
          )}
          <Text style={styles.addressCity}>
            {order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''} - {order.shippingAddress?.postalCode || ''}
          </Text>

          <TouchableOpacity onPress={handleNavigate} style={styles.navigateBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.accent, Colors.accentDark]}
              style={styles.navigateGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.navigateText}>🗺 Open Navigation</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Card>

        {/* Payment Card */}
        <Card style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <Text style={styles.sectionLabel}>💳 Payment</Text>
            <Badge
              label={isCOD(order.paymentMethod) ? '💵 COD' : '✅ PAID'}
              backgroundColor={isCOD(order.paymentMethod) ? Colors.warningLight : Colors.successLight}
              color={isCOD(order.paymentMethod) ? Colors.warning : Colors.success}
            />
          </View>
          <Text style={styles.orderTotal}>{formatCurrency(order.totalAmount + order.deliveryFee)}</Text>
          <Text style={styles.orderTotalSub}>Total incl. delivery ₹{order.deliveryFee}</Text>
        </Card>

        {/* Pickup OTP Section */}
        {(shipment.status === 'ACCEPTED' || shipment.status === 'PICKED_UP') && shipment.pickupOtp && (
          <Card style={[styles.paymentCard, { backgroundColor: Colors.surfaceAlt, borderColor: Colors.primaryLight, borderWidth: 1 }]}>
            <Text style={[styles.sectionLabel, { color: Colors.primary }]}>🔑 Pickup Verification OTP</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
              <Text style={{ fontSize: 32, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 4 }}>
                {shipment.pickupOtp}
              </Text>
            </View>
            {!shipment.pickupOtp && shipment.status === 'ACCEPTED' && (
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await requestPickupOtp.mutateAsync(shipmentId);
                    Alert.alert('Success', 'Pickup OTP requested from Warehouse Manager.');
                  } catch (err: any) {
                    Alert.alert('Error', err?.response?.data?.message || 'Failed to request Pickup OTP');
                  }
                }}
                style={{ marginTop: 15, padding: 12, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, alignItems: 'center' }}
                disabled={requestPickupOtp.isPending}
              >
                <Text style={{ color: Colors.white, fontWeight: '700' }}>
                  {requestPickupOtp.isPending ? 'Requesting...' : 'Request Pickup OTP'}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 10 }}>
              Show this OTP to the Warehouse Manager during pickup
            </Text>
          </Card>
        )}

        {/* Items */}
        <Card>
          <Text style={styles.sectionLabel}>📦 Order Items ({order.items.length})</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            {order.items.map((item, idx) => (
              <View key={idx}>
                <View style={styles.itemRow}>
                  <View style={styles.itemQtyBadge}>
                    <Text style={styles.itemQtyText}>{item.quantity}x</Text>
                  </View>
                  <Text style={styles.itemTitle} numberOfLines={1}>{typeof item.title === 'string' ? item.title : 'Product'}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency((typeof item.price === 'number' ? item.price : 0) * (typeof item.quantity === 'number' ? item.quantity : 1))}</Text>
                </View>
                {idx < order.items.length - 1 && <Divider style={{ marginTop: 10 }} />}
              </View>
            ))}
          </View>
        </Card>

        {/* Spacer for action buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Action Buttons */}
      <View style={styles.actionBar}>
        {canPickup && (
          <>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Cancel Assignment',
                  'Are you sure you cannot pick up this order? It will be reassigned to another partner.',
                  [
                    { text: 'No', style: 'cancel' },
                    {
                      text: 'Yes, Cancel',
                      style: 'destructive',
                      onPress: handleCancelAssignment,
                    },
                  ]
                );
              }}
              style={styles.failBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.failBtnText}>✗ Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePickup}
              disabled={pickupOrder.isPending}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {pickupOrder.isPending ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.actionBtnText}>📦 Mark Picked Up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {canStart && (
          <>
            <TouchableOpacity
              onPress={handleStart}
              disabled={startDelivery.isPending}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {startDelivery.isPending ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.actionBtnText}>🚀 Start Delivery</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {canComplete && (
          <>
            <TouchableOpacity
              onPress={() => setFailModalVisible(true)}
              style={styles.failBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.failBtnText}>✗ Failed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setOtpModalVisible(true)}
              disabled={verifyDeliveryOtp.isPending}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={[Colors.success, '#00A070']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {verifyDeliveryOtp.isPending ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.actionBtnText}>✓ Verify & Deliver</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('MapNavigation', { orderId: order._id })}
          style={styles.mapBtn}
        >
          <Text style={{ fontSize: 22 }}>🗺</Text>
        </TouchableOpacity>
      </View>

      {/* Fail Delivery Modal */}
      <Modal
        visible={failModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Report Failed Delivery</Text>
            <Text style={styles.modalSub}>Please describe why the delivery could not be completed</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Customer not available, wrong address..."
              placeholderTextColor={Colors.textMuted}
              value={failReason}
              onChangeText={setFailReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setFailModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={{ color: Colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFailDelivery}
                disabled={!failReason.trim() || failDelivery.isPending}
                style={[styles.modalConfirmBtn, !failReason.trim() && { opacity: 0.4 }]}
              >
                {failDelivery.isPending ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={{ color: Colors.white, fontWeight: '800' }}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OTP Modal */}
      <Modal
        visible={otpModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 20 }]}>
          <View style={[styles.modalCard, { borderRadius: 20 }]}>
            <Text style={styles.modalTitle}>Delivery Verification</Text>
            <Text style={styles.modalSub}>Enter the 6-digit OTP sent to the customer</Text>

            <TextInput
              style={[styles.modalInput, { minHeight: 60, fontSize: 24, textAlign: 'center', letterSpacing: 8, fontWeight: '800' }]}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={otpValue}
              onChangeText={setOtpValue}
            />

            <TouchableOpacity
              onPress={handleRequestDeliveryOtp}
              style={{ alignSelf: 'center', marginBottom: 20 }}
              disabled={requestDeliveryOtp.isPending}
            >
              <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                {requestDeliveryOtp.isPending ? 'Requesting...' : 'Resend OTP to Customer'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => { setOtpModalVisible(false); setOtpValue(''); }}
                style={styles.modalCancelBtn}
              >
                <Text style={{ color: Colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleVerifyDelivery}
                disabled={otpValue.length !== 6 || verifyDeliveryOtp.isPending}
                style={[styles.modalConfirmBtn, { backgroundColor: Colors.success }, (otpValue.length !== 6 || verifyDeliveryOtp.isPending) && { opacity: 0.5 }]}
              >
                {verifyDeliveryOtp.isPending ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={{ color: Colors.white, fontWeight: '800' }}>Verify Delivery</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: Colors.white },
  headerLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 1.2 },
  headerOrderId: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  content: { padding: Spacing.md, gap: Spacing.md },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, letterSpacing: 0.3 },
  customerCard: { gap: 0 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  customerPhone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  callBtn: { borderRadius: 26, overflow: 'hidden' },
  callGradient: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  addressCard: {},
  addressMain: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, lineHeight: 22 },
  addressSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  addressCity: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  navigateBtn: { marginTop: 14, borderRadius: BorderRadius.md, overflow: 'hidden' },
  navigateGradient: { paddingVertical: 12, alignItems: 'center' },
  navigateText: { fontWeight: '800', color: Colors.primary, fontSize: FontSize.sm },
  paymentCard: {},
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderTotal: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.textPrimary },
  orderTotalSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemQtyBadge: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  itemQtyText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.primary },
  itemTitle: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '500' },
  itemPrice: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.md,
    paddingBottom: 28,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
    ...Shadow.lg,
  },
  actionBtn: { borderRadius: BorderRadius.md, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  failBtn: {
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failBtnText: { color: Colors.danger, fontWeight: '700', fontSize: FontSize.sm },
  mapBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  modalSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    minHeight: 100,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
});