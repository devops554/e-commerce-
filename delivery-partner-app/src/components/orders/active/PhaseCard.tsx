import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, FontSize, BorderRadius, Shadow } from '../../../utils/theme';

interface PhaseCardProps {
  isPickupPhase: boolean;
  status: string;
  isReverse: boolean;
  onNavigate: () => void;
  destinationLabel: string;
}

export const PhaseCard = ({
  isPickupPhase,
  status,
  isReverse,
  onNavigate,
  destinationLabel,
}: PhaseCardProps) => {
  const isNavDisabled = isPickupPhase && status !== 'PICKED_UP';

  return (
    <View style={styles.phaseCard}>
      <View style={styles.phaseHeaderRow}>
        <View style={styles.stepChip}>
          <Text style={styles.stepChipText}>{isPickupPhase ? 'STEP 1' : 'STEP 2'}</Text>
        </View>
        <Text style={styles.phaseTitle}>
          {isPickupPhase ? (isReverse ? 'Pick up from Customer' : 'Pick up from Warehouse') : 'Deliver Order'}
        </Text>
      </View>

      {isNavDisabled ? (
        <View style={styles.navBtnDisabledWrap}>
          <Text style={styles.navDisabledText}>
            ⚠️ Wait for {isReverse ? 'Customer' : 'warehouse manager'} to verify the OTP before navigating to {isReverse ? 'warehouse' : 'customer'}.
          </Text>
        </View>
      ) : (
        <TouchableOpacity onPress={onNavigate} activeOpacity={0.88} style={styles.navBtnWrap}>
          <LinearGradient
            colors={['#0EA5E9', '#0284C7']}
            style={styles.navBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="navigate" size={18} color={Colors.white} />
            <Text style={styles.navBtnText}>Navigate to {destinationLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  phaseCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  phaseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stepChipText: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  phaseTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  navBtnWrap: { margin: 12 },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
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
});
