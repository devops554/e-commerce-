// d:\bivha\E-commerce\delivery-partner-app\src\screens\profile\PayoutSettingsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { useProfile, useUpdateProfile } from '../../hooks/useQueries';

type PayoutMode = 'BANK' | 'UPI';

export default function PayoutSettingsScreen() {
  const navigation = useNavigation();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [mode, setMode] = useState<PayoutMode>('UPI');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');

  useEffect(() => {
    if (profile?.payoutMethod) {
      setMode(profile.payoutMethod.method || 'UPI');
      setUpiId(profile.payoutMethod.upiId || '');
      setAccountNumber(profile.payoutMethod.accountNumber || '');
      setIfsc(profile.payoutMethod.ifsc || '');
    }
  }, [profile]);

  const handleSave = async () => {
    // Basic validation
    if (mode === 'UPI' && !upiId.includes('@')) {
      Alert.alert('Error', 'Please enter a valid UPI ID (e.g. name@bank)');
      return;
    }
    if (mode === 'BANK' && (!accountNumber || !ifsc)) {
      Alert.alert('Error', 'Please enter both Account Number and IFSC code');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        payoutMethod: {
          method: mode,
          upiId: mode === 'UPI' ? upiId : undefined,
          accountNumber: mode === 'BANK' ? accountNumber : undefined,
          ifsc: mode === 'BANK' ? ifsc : undefined,
        }
      });
      Alert.alert('Success', 'Payout details updated successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update payout details');
    }
  };

  if (profileLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payout Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Choose Payment Method</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'UPI' && styles.modeBtnActive]}
                onPress={() => setMode('UPI')}
              >
                <Ionicons name="qr-code-outline" size={20} color={mode === 'UPI' ? Colors.white : Colors.textSecondary} />
                <Text style={[styles.modeBtnText, mode === 'UPI' && styles.modeBtnTextActive]}>UPI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'BANK' && styles.modeBtnActive]}
                onPress={() => setMode('BANK')}
              >
                <Ionicons name="business-outline" size={20} color={mode === 'BANK' ? Colors.white : Colors.textSecondary} />
                <Text style={[styles.modeBtnText, mode === 'BANK' && styles.modeBtnTextActive]}>Bank Transfer</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {mode === 'UPI' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>UPI ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. username@okaxis"
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                  />
                  <Text style={styles.hint}>Earnings will be transferred to this UPI ID</Text>
                </View>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Account Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter account number"
                      value={accountNumber}
                      onChangeText={setAccountNumber}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>IFSC Code</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. HDFC0001234"
                      value={ifsc}
                      onChangeText={setIfsc}
                      autoCapitalize="characters"
                    />
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Your details are stored securely and used only for commissions. Verified partners get faster payouts.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, updateProfile.isPending && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save Details</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 60,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  scroll: { padding: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F8FAFC',
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  modeBtnTextActive: { color: Colors.white },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  hint: { fontSize: 11, color: Colors.textMuted, marginLeft: 4 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    gap: 12,
    alignItems: 'center',
  },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  footer: { padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
});
