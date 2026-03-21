import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../utils/theme';
import { useVerifyReturnItems, useVerifyReturnCustomerOtp } from '../../hooks/useQueries';
import { OtpModal } from '../../components/orders/active/Modals';
import { authAPI } from '../../api/services';

export default function ReturnItemReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { shipmentId, items } = route.params || {};

  const [isWrongItem, setIsWrongItem] = useState(false);
  const [verificationMedia, setVerificationMedia] = useState<{ url: string; publicId: string }[]>([]);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [checks, setChecks] = useState<Record<string, boolean>>({});


  const verifyReturnItems = useVerifyReturnItems();
  const verifyReturnCustomerOtp = useVerifyReturnCustomerOtp();

  // Standard return checklist — shown to delivery partner during REVERSE pickup
  const displayConditions = [
    { id: 'packaging', label: 'ओरिजिनल पैकेजिंग 📦' },
    { id: 'tags', label: 'टैग और लेबल 🏷️' },
    { id: 'clean', label: 'साफ और कोई नुकसान नहीं ✨' },
    { id: 'unused', label: 'इस्तेमाल नहीं किया गया 🧥' },
  ];

  // Initialize checks on mount
  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    displayConditions.forEach(c => { initial[c.id] = false; });
    setChecks(initial);
  }, []);

  const toggleCheck = (id: string) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllChecked = Object.values(checks).every(v => v === true);
  // Correct item: only checklist required. Wrong item: photo + notes required.
  const canVerify = !isWrongItem ? isAllChecked : (verificationMedia.length >= 1 && notes.trim().length > 0);

  const handleToggleMode = () => {
    setIsWrongItem(!isWrongItem);
    setVerificationMedia([]);
    setNotes('');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      uploadFile(result.assets[0].uri);
    }
  };

  const uploadFile = async (uri: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('file', { uri, name: filename, type } as any);

      const response = await authAPI.uploadFile(formData);
      setVerificationMedia([...verificationMedia, response]);
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!canVerify) {
      Alert.alert('Incomplete', 'Please complete all checklist items to continue.');
      return;
    }
    try {
      await verifyReturnItems.mutateAsync({
        shipmentId,
        verificationMedia,
        notes,
        itemsCorrect: true
      });
      setOtpModalVisible(true);
      Alert.alert('OTP Sent', 'Ask the customer for the 6-digit code.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerify = async () => {
    try {
      await verifyReturnCustomerOtp.mutateAsync({
        shipmentId,
        otp: otpValue,
      });
      setOtpModalVisible(false);
      Alert.alert('Success', 'Item picked up successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Main') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  const handleFailPickupTrigger = async () => {
    if (verificationMedia.length === 0 || !notes) {
      Alert.alert('Required', 'Please capture photo and add notes for wrong item.');
      return;
    }

    Alert.alert('Confirm Request', 'Are you sure you want to report this as a wrong item?', [
      { text: 'Cancel' },
      {
        text: 'Yes, Report',
        onPress: async () => {
          try {
            await verifyReturnItems.mutateAsync({
              shipmentId,
              verificationMedia,
              notes,
              itemsCorrect: false
            });
            Alert.alert('Reported', 'Wrong item has been recorded.', [
              { text: 'OK', onPress: () => navigation.navigate('Main') }
            ]);
          } catch (err: any) {
            Alert.alert('Error', 'Failed to report.');
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return Verification (सत्यापन)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mode Toggle */}
        <View style={styles.modeCard}>
          <Text style={styles.sectionTitle}>Item Alignment (आइटम संरेखण)</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setIsWrongItem(false)}
              style={[styles.toggleBtn, !isWrongItem && styles.toggleBtnActive]}
            >
              <Ionicons name="checkmark-circle" size={20} color={!isWrongItem ? Colors.white : Colors.textMuted} />
              <Text style={[styles.toggleText, !isWrongItem && styles.toggleTextActive]}>Correct Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (!isWrongItem) {
                  Alert.alert('Confirm', 'क्या आप सुनिश्चित हैं कि यह गलत आइटम है?', [
                    { text: 'Cancel' },
                    { text: 'Yes', onPress: () => setIsWrongItem(true) }
                  ]);
                } else {
                  setIsWrongItem(false);
                }
              }}
              style={[styles.toggleBtn, isWrongItem && styles.toggleBtnActiveDanger]}
            >
              <Ionicons name="alert-circle" size={20} color={isWrongItem ? Colors.white : Colors.textMuted} />
              <Text style={[styles.toggleText, isWrongItem && styles.toggleTextActive]}>Wrong Item</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Product to Verify (जांचें)</Text>
          {items?.map((item: any, idx: number) => {
            const variant = item.variantId ?? item.variant;
            const hasWeight = !!variant?.weightKg;
            const hasDim = !!(variant?.dimensionsCm?.length || variant?.dimensionsCm?.width || variant?.dimensionsCm?.height);
            const attrs: { name: string; value: string }[] = variant?.attributes || [];
            const imageUri = item.image || item.productId?.images?.[0]?.url || item.product?.images?.[0]?.url;

            return (
              <View key={idx}>
                {/* Big product image */}
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.productBigImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.productBigImage, styles.productImagePlaceholder]}>
                    <Ionicons name="image-outline" size={40} color={Colors.textMuted} />
                  </View>
                )}

                {/* Title + Qty */}
                <View style={styles.productMeta}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {item.title || item.productId?.title || item.product?.title}
                  </Text>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyBadgeText}>Qty: {item.quantity}</Text>
                  </View>
                </View>

                {/* Variant attributes */}
                {attrs.length > 0 && (
                  <View style={styles.attrRow}>
                    {attrs.map((a: any, i: number) => (
                      <View key={i} style={styles.attrChip}>
                        <Text style={styles.attrLabel}>{a.name}</Text>
                        <Text style={styles.attrValue}>{a.value}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Weight & Dimensions */}
                {(hasWeight || hasDim) && (
                  <View style={styles.specSection}>
                    <Text style={styles.specSectionLabel}>Expected Specs</Text>
                    <View style={styles.specRow}>
                      {hasWeight && (
                        <View style={styles.specChip}>
                          <Ionicons name="scale-outline" size={14} color={Colors.primary} />
                          <Text style={styles.specText}>{variant.weightKg} kg</Text>
                        </View>
                      )}
                      {hasDim && (
                        <View style={styles.specChip}>
                          <Ionicons name="cube-outline" size={14} color={Colors.primary} />
                          <Text style={styles.specText}>
                            {variant.dimensionsCm?.length ?? '?'} × {variant.dimensionsCm?.width ?? '?'} × {variant.dimensionsCm?.height ?? '?'} cm
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>


        {/* Hindi Policy Checklist - Only for Correct Item */}
        {!isWrongItem && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Checklist (जांच सूची)</Text>
            <View style={styles.checklist}>
              {displayConditions.map((c: any) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.checkItem}
                  onPress={() => toggleCheck(c.id)}
                >
                  <View style={[styles.checkbox, checks[c.id] && styles.checkboxActive]}>
                    {checks[c.id] && <Ionicons name="checkmark" size={16} color={Colors.white} />}
                  </View>
                  <Text style={[styles.checkLabel, checks[c.id] && styles.checkLabelActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Evidence Section — only shown for wrong item */}
        {isWrongItem && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Proof of Wrong Item (Required)</Text>
            <View style={styles.mediaRow}>
              {verificationMedia.map((m, i) => (
                <Image key={i} source={{ uri: m.url }} style={styles.mediaThumb} />
              ))}
              {verificationMedia.length < 4 && (
                <TouchableOpacity style={styles.addMediaBtn} onPress={pickImage} disabled={isUploading}>
                  {isUploading ? <ActivityIndicator color={Colors.primary} /> : <Ionicons name="camera" size={24} color={Colors.primary} />}
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Explain why this item is wrong..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        )}

        {!isWrongItem && !isAllChecked && (
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={16} color="#B45309" />
            <Text style={styles.warningText}>
              कृपया सभी जांच पूरी करें — Please complete all checklist items to send OTP.
            </Text>
          </View>
        )}
        {isWrongItem && !canVerify && (
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={16} color="#B45309" />
            <Text style={styles.warningText}>
              गलत आइटम के लिए फोटो और नोट्स ज़रूरी हैं — Photo and notes are required to report a wrong item.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!isWrongItem ? (
          <TouchableOpacity
            style={[styles.primaryBtn, !canVerify && styles.btnDisabled]}
            onPress={handleSendOtp}
            disabled={verifyReturnItems.isPending || !canVerify}
          >
            {verifyReturnItems.isPending ? <ActivityIndicator color={Colors.white} /> : (
              <>
                <Ionicons name="send" size={20} color={Colors.white} />
                <Text style={styles.btnText}>Send OTP to Customer</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: Colors.danger }]}
            onPress={handleFailPickupTrigger}
            disabled={verifyReturnItems.isPending}
          >
            {verifyReturnItems.isPending ? <ActivityIndicator color={Colors.white} /> : (
              <>
                <Ionicons name="close-circle" size={20} color={Colors.white} />
                <Text style={styles.btnText}>Report Wrong Item</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <OtpModal
        visible={otpModalVisible}
        onClose={() => setOtpModalVisible(false)}
        title="Verify Pickup"
        subtitle="Enter 6-digit OTP from customer"
        value={otpValue}
        onChange={setOtpValue}
        onVerify={handleVerify}
        isPending={verifyReturnCustomerOtp.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderColor: Colors.border
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  content: { padding: Spacing.md, gap: Spacing.md },
  modeCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, ...Shadow.sm },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, marginBottom: 12, textTransform: 'uppercase' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  toggleBtnActive: { backgroundColor: Colors.success, borderColor: Colors.success },
  toggleBtnActiveDanger: { backgroundColor: Colors.danger, borderColor: Colors.danger },
  toggleText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  toggleTextActive: { color: Colors.white },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, ...Shadow.sm },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  productThumb: { width: 50, height: 50, borderRadius: 8, backgroundColor: Colors.background },
  productTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  productInfo: { fontSize: 12, color: Colors.textSecondary },
  checklist: { gap: 8 },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: Colors.background,
    borderRadius: 10
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxActive: { backgroundColor: Colors.primary },
  checkLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  checkLabelActive: { color: Colors.textPrimary },
  mediaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 12 },
  mediaThumb: { width: 70, height: 70, borderRadius: 10 },
  addMediaBtn: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: Colors.textPrimary
  },
  warningBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: 10
  },
  warningText: {
    fontSize: 11,
    color: '#B45309',
    flex: 1,
    lineHeight: 15,
  },
  footer: { padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderColor: Colors.border },
  primaryBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14
  },
  btnDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.7
  },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },

  // ── Product card styles ────────────────────────────────────────────────────
  productBigImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.background,
    marginBottom: 12,
  },
  productImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  qtyBadge: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyBadgeText: { fontSize: 12, fontWeight: '800', color: Colors.primary },

  // Variant attributes
  attrRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  attrChip: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attrLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  attrValue: { fontSize: 11, color: Colors.textPrimary, fontWeight: '800' },

  // Spec section
  specSection: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  specSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  specRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  specText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
});
