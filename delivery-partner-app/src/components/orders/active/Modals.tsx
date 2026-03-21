import React from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
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
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.otpModalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.otpModalCard}>
          {/* Icon */}
          <View style={styles.otpModalIconWrap}>
            <Ionicons name={icon} size={32} color={Colors.primary} />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.otpModalSubtitle}>{subtitle}</Text>

          {/* OTP Input */}
          <View style={styles.otpInputWrapper}>
            <TextInput
              style={styles.otpInput}
              placeholder="• • • • • •"
              keyboardType="number-pad"
              maxLength={6}
              value={value}
              onChangeText={onChange}
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Verify Button */}
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

          {/* Close */}
          <TouchableOpacity onPress={onClose} style={styles.otpCloseBtn} activeOpacity={0.7}>
            <Text style={styles.otpCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalCard}>
          {/* Handle bar */}
          <View style={styles.modalHandle} />

          {/* Title Row */}
          <View style={styles.modalTitleRow}>
            <Ionicons name="warning-outline" size={22} color={Colors.danger} />
            <Text style={styles.modalTitle}>Report Issue</Text>
          </View>

          {/* Text Input */}
          <TextInput
            style={styles.modalInput}
            placeholder="Describe the issue..."
            placeholderTextColor={Colors.textMuted}
            value={value}
            onChangeText={onChange}
            multiline
            textAlignVertical="top"
          />

          {/* Actions — stacked vertically to prevent cut-off */}
          <View style={styles.modalActions}>
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={onCancelAssignment}
                disabled={isRejectPending}
                style={[styles.modalActionBtn, { backgroundColor: '#F59E0B' }]}
                activeOpacity={0.85}
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
                activeOpacity={0.85}
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

            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCancelBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ─── OTP Modal ────────────────────────────────────────────────
  otpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  otpModalCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    // No gap — use marginBottom on individual elements for predictable spacing
  },
  otpModalIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  otpModalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Wrapper ensures input never clips on small screens
  otpInputWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  otpInput: {
    width: '100%',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 10,
    fontWeight: '900',
    color: Colors.textPrimary,
  },

  otpVerifyBtn: {
    width: '100%',
    marginBottom: 12,
  },
  otpVerifyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  otpVerifyText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: FontSize.md,
  },
  otpCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  otpCloseText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // ─── Issue Modal ──────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
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
  modalActions: {
    gap: 10,
  },
  // Two action buttons side by side
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    minHeight: 46,
  },
  modalActionBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
    flexShrink: 1,
  },
  // Cancel full width at bottom
  modalCancelBtn: {
    width: '100%',
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  modalCancelText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});