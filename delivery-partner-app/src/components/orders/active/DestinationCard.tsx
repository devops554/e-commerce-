import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, FontSize, Shadow } from '../../../utils/theme';

interface DestinationCardProps {
  label: string;
  title: string;
  address: string;
  phone?: string;
  onCall: () => void;
  icon: any;
}

const SectionLabel = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.sectionLabelRow}>
    <Ionicons name={icon} size={13} color={Colors.textSecondary} />
    <Text style={styles.sectionLabel}>{text}</Text>
  </View>
);

export const DestinationCard = ({ label, title, address, phone, onCall, icon }: DestinationCardProps) => {
  return (
    <View style={styles.detailCard}>
      <View style={styles.customerRow}>
        <View style={{ flex: 1 }}>
          <SectionLabel icon={icon} text={label} />
          <Text style={styles.detailTitle}>{title}</Text>
          <View style={styles.detailAddrRow}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.detailSub}>{address}</Text>
          </View>
        </View>
        {phone ? (
          <TouchableOpacity onPress={onCall} style={styles.callBtn} activeOpacity={0.85}>
            <LinearGradient colors={[Colors.success, '#059669']} style={styles.callGradient}>
              <Ionicons name="call" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    ...Shadow.sm,
  },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.8 },
  detailTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  detailAddrRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
  detailSub: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  callBtn: { borderRadius: 24, overflow: 'hidden' },
  callGradient: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
});
