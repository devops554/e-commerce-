import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, FontSize, Shadow } from '../../../utils/theme';
import { formatCurrency, isCOD } from '../../../utils/helpers';

interface PaymentItemsProps {
  items: any[];
  paymentMethod: string;
  totalAmount: number;
}

const SectionLabel = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.sectionLabelRow}>
    <Ionicons name={icon} size={13} color={Colors.textSecondary} />
    <Text style={styles.sectionLabel}>{text}</Text>
  </View>
);

export const PaymentItems = ({ items, paymentMethod, totalAmount }: PaymentItemsProps) => {
  const cod = isCOD(paymentMethod);

  return (
    <View style={styles.detailCard}>
      <View style={styles.paymentRow}>
        <View style={{ flex: 1 }}>
          <SectionLabel icon="card-outline" text="PAYMENT" />
          <View style={styles.paymentBadgeRow}>
            <View style={[styles.paymentBadge, { backgroundColor: cod ? '#FEF3C7' : '#D1FAE5' }]}>
              <Ionicons
                name={cod ? 'cash' : 'checkmark-circle'}
                size={14}
                color={cod ? '#D97706' : '#059669'}
              />
              <Text style={[styles.paymentBadgeText, { color: cod ? '#D97706' : '#059669' }]}>
                {cod ? 'Cash on Delivery — Collect' : 'Prepaid'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.amountText}>{formatCurrency(totalAmount)}</Text>
      </View>

      <View style={styles.cardDivider} />

      <SectionLabel icon="cube-outline" text={`ITEMS (${items.length})`} />
      <View style={{ gap: 6, marginTop: 6 }}>
        {items.length > 0 ? (
          items.map((item, idx) => (
            <View key={item?._id ?? idx} style={styles.itemRow}>
              <View style={styles.itemDot} />
              <Text style={styles.itemText} numberOfLines={1}>
                {item?.quantity ?? 1}× {item?.title || 'Product'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.detailSub}>No items found</Text>
        )}
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
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  paymentBadgeRow: { flexDirection: 'row', marginTop: 4 },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  paymentBadgeText: { fontSize: 12, fontWeight: '800' },
  amountText: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textPrimary },
  cardDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  itemText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  detailSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
