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
  Image,
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
  useRejectOrder,
  usePickupOrder,
  useRequestDeliveryOtp,
  useVerifyDeliveryOtp,
  useActiveOrders,
  useVerifyPickupOtp,
  useFailDelivery,
  useFailPickup,
  useSendReturnManagerOtp,
  useVerifyReturnManagerOtp,
  useAcceptReturn,
  useRejectReturnRequest,
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

// Modular Components
import { DeliveryHeader } from '../../components/orders/active/DeliveryHeader';
import { PhaseCard } from '../../components/orders/active/PhaseCard';
import { DestinationCard } from '../../components/orders/active/DestinationCard';
import { PaymentItems } from '../../components/orders/active/PaymentItems';
import { OtpModal, IssueModal } from '../../components/orders/active/Modals';

// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

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
  const sendReturnManagerOtp = useSendReturnManagerOtp();
  const verifyReturnManagerOtp = useVerifyReturnManagerOtp();
  const acceptReturn = useAcceptReturn();
  const rejectReturnRequest = useRejectReturnRequest();

  const [failModalVisible, setFailModalVisible] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [partnerLocation, setPartnerLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fullMapVisible, setFullMapVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { refetch, isRefetching } = useActiveOrders();

  // FIX: Safe items array
  const orderItems = Array.isArray(order?.items) ? order.items : [];

  const handleVerifyPickup = () => {
    navigation.navigate('ReturnItemReview', {
      shipmentId,
      items: orderItems
    });
  };

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
      await startDelivery.mutateAsync({
        shipmentId,
        latitude: partnerLocation?.latitude,
        longitude: partnerLocation?.longitude
      });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to start delivery');
    }
  };

  const handleCancelAssignment = async () => {
    if (!shipmentId) return;
    try {
      if (isReverse) {
        await rejectReturnRequest.mutateAsync({ shipmentId, reason: 'Cancelled by partner' });
      } else {
        await rejectOrder.mutateAsync({ shipmentId });
      }
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
      const target = isReverse ? 'Warehouse Manager' : 'customer';
      Alert.alert('Success', `OTP sent to the ${target}.`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to request OTP');
    }
  };

  const handleVerifyDelivery = async () => {
    if (!shipmentId) return;
    if (otpValue.trim().length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
      return;
    }
    try {
      // For REVERSE shipments (return drop-off at warehouse), use return-specific manager OTP endpoint
      if (isReverse) {
        await verifyReturnManagerOtp.mutateAsync({ shipmentId, otp: otpValue });
      } else {
        await verifyDeliveryOtp.mutateAsync({
          shipmentId,
          otp: otpValue,
          latitude: partnerLocation?.latitude,
          longitude: partnerLocation?.longitude
        });
      }
      setOtpModalVisible(false);
      setOtpValue('');
      setTimeout(() => {
        Alert.alert('Success', isReverse ? 'Return delivered to warehouse!' : 'Order delivered successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }, 300);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleSendWarehouseOtp = async () => {
    if (!shipmentId) return;
    try {
      if (isReverse) {
        // For returns: use return-specific endpoint that sends OTP to warehouse manager
        await sendReturnManagerOtp.mutateAsync(shipmentId);
        Alert.alert('Success', 'OTP sent to the Warehouse Manager.');
      } else {
        await requestDeliveryOtp.mutateAsync(shipmentId);
        Alert.alert('Success', 'OTP sent to the customer.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send OTP');
    }
  };



  const handleFailDelivery = async () => {
    if (!shipmentId) return;
    if (!failReason.trim()) {
      Alert.alert('Required', 'Please describe the issue before reporting.');
      return;
    }
    try {
      await failDelivery.mutateAsync({
        orderId: shipmentId,
        reason: failReason,
        latitude: partnerLocation?.latitude,
        longitude: partnerLocation?.longitude
      });
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
  const isReverse = shipment.type === 'REVERSE';

  // FIX: Fully null-safe destination for OUT_FOR_DELIVERY
  const shippingAddr = order.shippingAddress ?? null;

  // In reverse logistics, Pickup = Customer, Dropoff = Warehouse
  const destination = isPickupPhase
    ? (isReverse ? (shippingAddr?.location ?? shippingAddr ?? null) : (warehouse?.location ?? null))
    : (isReverse ? (warehouse?.location ?? null) : (shippingAddr?.location ?? shippingAddr ?? null));

  const destinationLabel = isPickupPhase
    ? (isReverse ? (order.user?.name || 'Customer') : (warehouse?.name || 'Warehouse'))
    : (isReverse ? (warehouse?.name || 'Warehouse') : (order.user?.name || 'Customer'));

  const destinationIcon = isPickupPhase
    ? (isReverse ? 'home' : 'business')
    : (isReverse ? 'business' : 'home');

  const statusColor = getOrderStatusColor(order.orderStatus);
  // FIX: Safe orderId slice — handle number/undefined/null cases
  const orderId = order.orderId
    ? String(order.orderId).slice(-8)
    : 'N/A';


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
      <DeliveryHeader
        orderId={orderId}
        statusLabel={getOrderStatusLabel(order.orderStatus)}
        statusColor={statusColor}
        onBack={() => navigation.goBack()}
      />

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
        <PhaseCard
          isPickupPhase={isPickupPhase}
          status={shipment.status}
          isReverse={isReverse}
          onNavigate={handleNavigate}
          destinationLabel={isPickupPhase ? (isReverse ? 'Customer' : 'Warehouse') : (isReverse ? 'Warehouse' : 'Customer')}
        />

        {/* ── Destination detail ── */}
        <DestinationCard
          label={isPickupPhase ? (isReverse ? 'CUSTOMER (PICKUP)' : 'WAREHOUSE DETAILS') : (isReverse ? 'WAREHOUSE (DROPOFF)' : 'CUSTOMER')}
          title={isPickupPhase ? (isReverse ? (order.user?.name || 'Customer') : (warehouse?.name || 'Warehouse')) : (isReverse ? (warehouse?.name || 'Warehouse') : (order.user?.name || 'Customer'))}
          address={isPickupPhase
            ? (isReverse ? ([shippingAddr?.street, shippingAddr?.city].filter(Boolean).join(', ') || 'Address not available') : ([warehouse?.address?.addressLine1, warehouse?.address?.city].filter(Boolean).join(', ') || 'Address not available'))
            : (isReverse ? ([warehouse?.address?.addressLine1, warehouse?.address?.city].filter(Boolean).join(', ') || 'Address not available') : ([shippingAddr?.street, shippingAddr?.city].filter(Boolean).join(', ') || 'Address not available'))
          }
          phone={(!isPickupPhase && !isReverse) || (isPickupPhase && isReverse) ? order.user?.phone : undefined}
          onCall={handleCallCustomer}
          icon={destinationIcon}
        />

        {/* Payment & Items */}
        <PaymentItems
          items={orderItems}
          paymentMethod={order.paymentMethod}
          totalAmount={order.totalAmount ?? 0}
        />

        {/* ── Pickup OTP ── */}
        {isPickupPhase && shipment.pickupOtp ? (
          <View style={styles.otpCard}>
            <LinearGradient
              colors={[Colors.primary + '15', Colors.primary + '08']}
              style={styles.otpGradient}
            >
              <View style={styles.sectionLabelRow}>
                <Ionicons name="key-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.sectionLabel}>PICKUP OTP</Text>
              </View>
              <Text style={styles.otpValue}>{shipment.pickupOtp}</Text>
              <View style={styles.otpHintRow}>
                <Ionicons name="information-circle-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.otpHint}>
                  {isReverse ? 'Show this to the Customer' : 'Show this to the Warehouse Manager'}
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : null}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Action Footer ── */}
      <View style={styles.actionBar}>
        {canPickup && (
          isReverse ? (
            <TouchableOpacity
              onPress={handleVerifyPickup}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={[Colors.success, '#059669']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Ionicons name="barcode-outline" size={18} color={Colors.white} />
                <Text style={styles.actionBtnText}>Verify & Pickup</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
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
          )
        )}

        {/* For REVERSE shipments in PICKED_UP: show warehouse OTP buttons directly (skip startDelivery) */}
        {canStart && isReverse && (
          <View style={{ flex: 2, flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleSendWarehouseOtp}
              disabled={sendReturnManagerOtp.isPending}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {sendReturnManagerOtp.isPending
                  ? <ActivityIndicator color={Colors.white} size="small" />
                  : <>
                    <Ionicons name="mail" size={15} color={Colors.white} />
                    <Text style={[styles.actionBtnText, { fontSize: FontSize.sm }]}>Send OTP to Manager</Text>
                  </>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOtpModalVisible(true)}
              disabled={verifyReturnManagerOtp.isPending}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={[Colors.success, '#059669']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Ionicons name="checkmark-circle" size={15} color={Colors.white} />
                <Text style={[styles.actionBtnText, { fontSize: FontSize.sm }]}>Enter Manager OTP</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* For FORWARD shipments in PICKED_UP: show Start Delivery button */}
        {canStart && !isReverse && (
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

        {/* Forward shipments in OUT_FOR_DELIVERY: Send OTP + Enter OTP */}
        {canComplete && !isReverse && (
          <View style={{ flex: 2, flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleSendWarehouseOtp}
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

      <IssueModal
        visible={failModalVisible}
        onClose={() => { setFailModalVisible(false); setFailReason(''); }}
        value={failReason}
        onChange={setFailReason}
        onCancelAssignment={handleCancelAssignment}
        onFailDelivery={handleFailDelivery}
        isRejectPending={rejectOrder.isPending}
        isFailPending={failDelivery.isPending}
      />

      <OtpModal
        visible={otpModalVisible}
        onClose={() => { setOtpModalVisible(false); setOtpValue(''); }}
        title={`Verify ${isReverse ? 'Warehouse Dropoff' : 'Delivery'}`}
        subtitle={`Enter the 6-digit OTP sent to the ${isReverse ? 'Warehouse Manager' : 'customer'}`}
        value={otpValue}
        onChange={setOtpValue}
        onVerify={handleVerifyDelivery}
        isPending={verifyDeliveryOtp.isPending}
      />

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
});