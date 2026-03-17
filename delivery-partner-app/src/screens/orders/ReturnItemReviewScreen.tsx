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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../utils/theme';
import { useRequestPickupOtp, useVerifyPickupOtp, useFailPickup } from '../../hooks/useQueries';
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

  const requestPickupOtp = useRequestPickupOtp();
  const verifyPickupOtp = useVerifyPickupOtp();
  const failPickup = useFailPickup();

  // Policy-based conditions
  const policyConditions = items?.[0]?.product?.returnPolicy?.conditions || [];
  const conditionMap: Record<string, { label: string; emoji: string }> = {
    'UNUSED': { label: 'इस्तेमाल नहीं किया गया', emoji: '🧥' },
    'ORIGINAL_PACKAGING': { label: 'ओरिजिनल पैकेजिंग', emoji: '📦' },
    'WITH_TAGS': { label: 'टैग और लेबल', emoji: '🏷️' },
    'ANY': { label: 'साफ सुथरा', emoji: '✨' },
  };

  const displayConditions = policyConditions.length > 0 
    ? policyConditions.map((c: string) => ({ id: c, label: `${conditionMap[c]?.label || c} ${conditionMap[c]?.emoji || ''}` }))
    : [
        { id: 'packaging', label: 'ओरिजिनल पैकेजिंग 📦' },
        { id: 'tags', label: 'टैग और लेबल 🏷️' },
        { id: 'clean', label: 'साफ और कोई नुकसान नहीं ✨' },
        { id: 'unused', label: 'इस्तेमाल नहीं किया गया 🧥' },
      ];

  // Initialize checks
  React.useEffect(() => {
    const initialChecks: Record<string, boolean> = {};
    displayConditions.forEach((c: any) => {
      initialChecks[c.id] = false;
    });
    setChecks(initialChecks);
  }, [items]);

  const toggleCheck = (id: string) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllChecked = Object.values(checks).every(v => v === true);
  const hasImages = verificationMedia.length >= 1;
  const canVerify = isAllChecked && hasImages;

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
      Alert.alert('Incomplete', 'Please check all items and add at least one photo.');
      return;
    }
    try {
      await requestPickupOtp.mutateAsync(shipmentId);
      setOtpModalVisible(true);
      Alert.alert('OTP Sent', 'Ask the customer for the 6-digit code.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerify = async () => {
    try {
      await verifyPickupOtp.mutateAsync({
        shipmentId,
        otp: otpValue,
        verificationMedia,
        notes,
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
            await failPickup.mutateAsync({ shipmentId, verificationMedia, notes });
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
              onPress={() => setIsWrongItem(true)}
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
          {items?.map((item: any, idx: number) => (
            <View key={idx} style={styles.productRow}>
              <Image 
                source={{ uri: item.image || item.product?.images?.[0]?.url }} 
                style={styles.productThumb} 
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle}>{item.title || item.product?.title}</Text>
                <Text style={styles.productInfo}>Qty: {item.quantity}</Text>
              </View>
            </View>
          ))}
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

        {/* Evidence Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {isWrongItem ? 'Proof of Wrong Item (Required)' : 'Item Photos (Required)'}
          </Text>
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
            placeholder={isWrongItem ? "Explain why this item is wrong..." : "Any notes (optional)..."}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {!isWrongItem && !canVerify && (
           <View style={styles.warningBox}>
           <Ionicons name="alert-circle" size={16} color="#B45309" />
           <Text style={styles.warningText}>
             Please complete all checks and add at least 1 photo to continue.
             (कृपया सभी जांच पूरी करें और कम से कम 1 फोटो जोड़ें)
           </Text>
         </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!isWrongItem ? (
          <TouchableOpacity 
            style={[styles.primaryBtn, !canVerify && styles.btnDisabled]} 
            onPress={handleSendOtp}
            disabled={requestPickupOtp.isPending || !canVerify}
          >
            {requestPickupOtp.isPending ? <ActivityIndicator color={Colors.white} /> : (
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
            disabled={failPickup.isPending}
          >
            {failPickup.isPending ? <ActivityIndicator color={Colors.white} /> : (
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
        isPending={verifyPickupOtp.isPending}
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
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '800' }
});
