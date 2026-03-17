import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, FontSize, Shadow } from '../../../utils/theme';

interface ReturnVerificationProps {
  items: any[];
  isItemVerified: boolean;
  onToggleVerify: () => void;
}

const SectionLabel = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.sectionLabelRow}>
    <Ionicons name={icon} size={13} color={Colors.textSecondary} />
    <Text style={styles.sectionLabel}>{text}</Text>
  </View>
);

export const ReturnVerification = ({ items, isItemVerified, onToggleVerify }: ReturnVerificationProps) => {
  return (
    <View style={styles.detailCard}>
      <SectionLabel icon="shield-checkmark-outline" text="ITEM VERIFICATION" />

      {items.map((item, idx) => {
        const product: any = item.product;
        const returnPolicy = product?.returnPolicy;
        const productImages = product?.images || [];
        const productThumbnail = productImages[0]?.url || product?.thumbnail?.url;

        return (
          <View key={item._id || idx} style={styles.verificationItem}>
            <View style={styles.itemHeader}>
              {productThumbnail && (
                <Image source={{ uri: productThumbnail }} style={styles.itemImage} resizeMode="cover" />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.detailSub}>Qty: {item.quantity}</Text>
              </View>
            </View>

            {returnPolicy && (
              <View style={styles.policyBox}>
                <Text style={styles.policyTitle}>Return Policy:</Text>
                <View style={styles.policyTagRow}>
                  <View
                    style={[
                      styles.policyPill,
                      { backgroundColor: returnPolicy.isReturnable ? '#D1FAE5' : '#FEE2E2' },
                    ]}
                  >
                    <Text
                      style={[styles.policyPillText, { color: returnPolicy.isReturnable ? '#059669' : '#DC2626' }]}
                    >
                      {returnPolicy.isReturnable ? 'Returnable' : 'Non-Returnable'}
                    </Text>
                  </View>
                  {returnPolicy.windowValue > 0 && (
                    <View style={styles.policyPill}>
                      <Text style={styles.policyPillText}>
                        {returnPolicy.windowValue} {returnPolicy.windowUnit} Window
                      </Text>
                    </View>
                  )}
                </View>
                {returnPolicy.conditions?.length > 0 && (
                  <View style={{ marginTop: 6 }}>
                    <Text style={styles.policyLabel}>Conditions:</Text>
                    <Text style={styles.policyValue}>• {returnPolicy.conditions.join('\n• ')}</Text>
                  </View>
                )}
              </View>
            )}

            {productImages.length > 1 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.policyLabel}>Reference Gallery:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 5 }}>
                  {productImages.map((img: any, i: number) => (
                    <Image key={i} source={{ uri: img.url }} style={styles.galleryImage} />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        );
      })}

      <TouchableOpacity onPress={onToggleVerify} style={styles.verifyToggleRow} activeOpacity={0.8}>
        <View style={[styles.checkbox, isItemVerified && styles.checkboxActive]}>
          {isItemVerified && <Ionicons name="checkmark" size={14} color={Colors.white} />}
        </View>
        <Text style={styles.verifyToggleText}>I have verified the items and images</Text>
      </TouchableOpacity>
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
  detailSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  verificationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: Colors.background },
  itemTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  policyBox: {
    marginTop: 10,
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 8,
  },
  policyTitle: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary, marginBottom: 5 },
  policyPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  policyPillText: { fontSize: 9, fontWeight: '800', color: Colors.textPrimary, textTransform: 'uppercase' },
  policyTagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  policyLabel: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, marginTop: 4 },
  policyValue: { fontSize: 10, color: Colors.textPrimary, lineHeight: 14 },
  galleryImage: { width: 80, height: 80, borderRadius: 6, marginRight: 8, backgroundColor: Colors.background },
  verifyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  verifyToggleText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#0369A1',
  },
});
