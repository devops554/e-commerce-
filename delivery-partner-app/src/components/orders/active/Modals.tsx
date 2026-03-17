import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, FontSize, BorderRadius, Spacing } from '../../../utils/theme';

interface OtpModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  value: string;
  onChange: (val: string) => void;
  onVerify: () => void;
  isPending: boolean;
  icon?: any;
}

export const OtpModal = ({
  visible,
  onClose,
  title,
  subtitle,
  value,
  onChange,
  onVerify,
  isPending,
  icon = 'shield-checkmark',
}: OtpModalProps) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.otpModalOverlay}>
        <View style={styles.otpModalCard}>
          <View style={styles.otpModalIconWrap}>
            <Ionicons name={icon} size={32} color={Colors.primary} />
          </View>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.otpModalSubtitle}>{subtitle}</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="• • • • • •"
            keyboardType="number-pad"
            maxLength={6}
            value={value}
            onChangeText={onChange}
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity
            onPress={onVerify}
            disabled={isPending || value.trim().length !== 6}
            style={[styles.otpVerifyBtn, { opacity: value.trim().length !== 6 ? 0.5 : 1 }]}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.success, '#059669']}
              style={styles.otpVerifyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                  <Text style={styles.otpVerifyText}>Verify & Complete</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.otpCloseBtn}>
            <Text style={styles.otpCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

interface IssueModalProps {
  visible: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
  onCancelAssignment: () => void;
  onFailDelivery: () => void;
  isRejectPending: boolean;
  isFailPending: boolean;
}

export const IssueModal = ({
  visible,
  onClose,
  value,
  onChange,
  onCancelAssignment,
  onFailDelivery,
  isRejectPending,
  isFailPending,
}: IssueModalProps) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
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
            value={value}
            onChangeText={onChange}
            multiline
          />
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCancelAssignment}
              disabled={isRejectPending}
              style={[styles.modalActionBtn, { backgroundColor: '#F59E0B' }]}
            >
              {isRejectPending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={15} color={Colors.white} />
                  <Text style={styles.modalActionBtnText}>Cancel Assignment</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onFailDelivery}
              disabled={isFailPending}
              style={[styles.modalActionBtn, { backgroundColor: Colors.danger }]}
            >
              {isFailPending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="alert-circle-outline" size={15} color={Colors.white} />
                  <Text style={styles.modalActionBtnText}>Report Failure</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  otpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  otpModalCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  otpModalIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  otpModalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  otpInput: {
    width: '100%',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 16,
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 10,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  otpVerifyBtn: { width: '100%', marginTop: 6 },
  otpVerifyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  otpVerifyText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  otpCloseBtn: { marginTop: 8 },
  otpCloseText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 100,
    marginBottom: 20,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  modalCancelText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
  },
  modalActionBtnText: { color: Colors.white, fontWeight: '700', fontSize: 11 },
});
