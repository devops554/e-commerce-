// src/screens/profile/ProfileScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '../../hooks/useQueries';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api/services';
import { socketService } from '../../services/socketService';
import { locationService } from '../../services/locationService';
import { Badge, Card, Divider, Skeleton } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';

import { getInitials } from '../../utils/helpers';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const partner = useAuthStore((s) => s.partner);
  const { data: profile, isLoading } = useProfile();

  const displayPartner = profile || partner;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          locationService.stopTracking();
          socketService.disconnect();
          try {
            await authAPI.logout();
          } catch (e) {
            // ignore
          }
          await clearAuth();
        },
      },
    ]);
  };

  const vehicleIcon: Record<string, string> = {
    BIKE: '🚲',
    SCOOTER: '🛵',
    CAR: '🚗',
    VAN: '🚐',
  };

  const statusColor = {
    ONLINE: Colors.online,
    OFFLINE: Colors.offline,
    BUSY: Colors.busy,
    ACTIVE: Colors.success,
    INACTIVE: Colors.warning,
    BLOCKED: Colors.danger,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editBtn}
          >
            <Text style={styles.editText}>✏️ Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Hero */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroDecor} />
          <View style={styles.heroDecorBottom} />

          {/* ── Redesigned Profile Picture ── */}
          <TouchableOpacity
            style={styles.avatarContainer}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EditProfile')}
          >
            {/* Outer glow ring */}
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.25)']}
              style={styles.avatarRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.avatarInner}>
                {displayPartner?.profileImage ? (
                  <Image
                    source={{ uri: displayPartner.profileImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>
                      {getInitials(displayPartner?.name || 'DP')}
                    </Text>
                  </View>
                )}
                {/* Subtle dark overlay hint with camera icon */}
                <View style={styles.avatarEditOverlay}>
                  <Text style={styles.avatarCameraIcon}>📷</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Status dot */}
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: statusColor[displayPartner?.availabilityStatus ?? 'OFFLINE'] },
              ]}
            />

            {/* Small edit badge */}
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>
          {/* ── End Profile Picture ── */}

          {isLoading ? (
            <Skeleton height={24} width={160} style={{ marginBottom: 8 }} />
          ) : (
            <Text style={styles.heroName}>{displayPartner?.name}</Text>
          )}
          <Text style={styles.heroPhone}>{displayPartner?.phone}</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {displayPartner?.stats?.totalDeliveries ?? 0}
              </Text>
              <Text style={styles.heroStatLabel}>Deliveries</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {displayPartner?.stats?.rating?.toFixed(1) ?? '—'} ⭐
              </Text>
              <Text style={styles.heroStatLabel}>Rating</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Badge
                label={displayPartner?.availabilityStatus ?? 'OFFLINE'}
                backgroundColor={`${statusColor[displayPartner?.availabilityStatus ?? 'OFFLINE']}30`}
                color={statusColor[displayPartner?.availabilityStatus ?? 'OFFLINE']}
              />
              <Text style={styles.heroStatLabel}>Status</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Vehicle Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Vehicle Details</Text>
          <Divider style={{ marginVertical: 12 }} />
          <InfoRow
            label="Vehicle Type"
            value={`${vehicleIcon[displayPartner?.vehicleType ?? 'BIKE']} ${displayPartner?.vehicleType}`}
          />
          <InfoRow label="Vehicle Number" value={displayPartner?.vehicleNumber ?? '—'} />
          <InfoRow label="License Number" value={displayPartner?.licenseNumber ?? '—'} />
        </Card>

        {/* Account Status */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account</Text>
          <Divider style={{ marginVertical: 12 }} />
          <InfoRow label="Email" value={displayPartner?.email ?? '—'} />
          <InfoRow
            label="Account Status"
            value={displayPartner?.accountStatus ?? '—'}
            valueColor={statusColor[displayPartner?.accountStatus ?? 'ACTIVE']}
          />
        </Card>

        {/* Documents */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Documents</Text>
          <Divider style={{ marginVertical: 12 }} />

          <DocumentItem
            label="Aadhaar Card"
            number={displayPartner?.documents?.aadhaarNumber}
            hasImage={!!displayPartner?.documents?.aadhaarImage}
          />
          <DocumentItem
            label="PAN Card"
            number={displayPartner?.documents?.panNumber}
            hasImage={!!displayPartner?.documents?.panImage}
          />
          <DocumentItem
            label="Driving License"
            hasImage={!!displayPartner?.documents?.drivingLicenseImage}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('UploadDocuments')}
            style={styles.uploadDocBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.uploadDocText}>📤 Upload / Update Documents</Text>
          </TouchableOpacity>
        </Card>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.actionRow}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionText}>Edit Profile</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>🔔</Text>
            <Text style={styles.actionText}>Notification Settings</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>🆘</Text>
            <Text style={styles.actionText}>Support</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={handleLogout} style={styles.actionRow} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={[styles.actionText, { color: Colors.danger }]}>Logout</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>SwiftDeliver Partner v54</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value, valueColor }: { label: string; value?: string; valueColor?: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, valueColor ? { color: valueColor, fontWeight: '700' } : {}]}>
      {value || '—'}
    </Text>
  </View>
);

const DocumentItem = ({
  label,
  number,
  hasImage,
}: {
  label: string;
  number?: string;
  hasImage: boolean;
}) => (
  <View style={styles.docItem}>
    <View>
      <Text style={styles.docLabel}>{label}</Text>
      {number && <Text style={styles.docNumber}>{number}</Text>}
    </View>
    <Badge
      label={hasImage ? '✓ Uploaded' : '✗ Missing'}
      backgroundColor={hasImage ? Colors.successLight : Colors.dangerLight}
      color={hasImage ? Colors.success : Colors.danger}
    />
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.textPrimary, lineHeight: 26, textAlign: 'center', marginTop: -2 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  editBtn: { minWidth: 60, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.sm, alignItems: 'center' },
  editText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },

  heroCard: {
    margin: Spacing.md,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadow.md,
  },
  heroDecor: {
    position: 'absolute',
    right: -60,
    top: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroDecorBottom: {
    position: 'absolute',
    left: -40,
    bottom: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  // ── Profile Picture Styles ──
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,           // ring thickness
    alignItems: 'center',
    justifyContent: 'center',
    // Drop shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  avatarInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  avatarFallback: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCameraIcon: {
    fontSize: 14,
  },
  onlineDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  avatarEditBadgeText: {
    fontSize: 12,
  },
  // ── End Profile Picture Styles ──

  heroName: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, letterSpacing: -0.3 },
  heroPhone: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginBottom: Spacing.lg },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: BorderRadius.lg, paddingVertical: 12, paddingHorizontal: Spacing.md, width: '100%' },
  heroStat: { flex: 1, alignItems: 'center', gap: 4 },
  heroStatValue: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.white },
  heroStatLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  heroStatDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  section: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  docItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  docLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  docNumber: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  uploadDocBtn: { marginTop: 12, backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.md, paddingVertical: 12, alignItems: 'center' },
  uploadDocText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  actionsSection: { marginHorizontal: Spacing.md, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.sm, marginBottom: Spacing.md },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12 },
  actionIcon: { fontSize: 20, width: 28 },
  actionText: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  actionArrow: { fontSize: 20, color: Colors.textMuted },
  versionText: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm },
});