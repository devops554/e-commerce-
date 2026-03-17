import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, FontSize } from '../../../utils/theme';

interface DeliveryHeaderProps {
  orderId: string;
  statusLabel: string;
  statusColor: string;
  onBack: () => void;
}

export const DeliveryHeader = ({ orderId, statusLabel, statusColor, onBack }: DeliveryHeaderProps) => {
  return (
    <LinearGradient
      colors={[Colors.primary, '#818CF8']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerDecor} />
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={20} color={Colors.white} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerLabel}>ORDER DETAIL</Text>
        <Text style={styles.headerOrderId}>#{orderId}</Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={styles.statusPillText}>{statusLabel}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -40,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headerOrderId: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusPillText: { color: Colors.white, fontSize: 11, fontWeight: '800' },
});
