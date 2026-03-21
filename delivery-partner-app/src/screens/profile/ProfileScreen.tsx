// src/screens/profile/ProfileScreen.tsx

import React from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useProfile } from '../../hooks/useQueries';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api/services';
import { socketService } from '../../services/socketService';
import { locationService } from '../../services/locationService';
import { Badge, Divider, Skeleton } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { getInitials } from '../../utils/helpers';

// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Helpers ───────────────────────────────────────────────────────────────────
const vehicleIcon: Record<string, IoniconsName> = {
  BIKE: 'bicycle',
  SCOOTER: 'bicycle',
  CAR: 'car',
  VAN: 'bus',
};

const statusColor: Record<string, string> = {
  ONLINE: Colors.online,
  OFFLINE: Colors.offline,
  BUSY: Colors.busy,
  ACTIVE: Colors.success,
  INACTIVE: Colors.warning,
  BLOCKED: Colors.danger,
};

// ── Sub-components ────────────────────────────────────────────────────────────

const InfoRow = ({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: IoniconsName;
  label: string;
  value?: string;
  valueColor?: string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelRow}>
      <Ionicons name={icon} size={14} color={Colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={[styles.infoValue, valueColor ? { color: valueColor, fontWeight: '700' } : {}]}>
      {value || '—'}
    </Text>
  </View>
);

const DocumentItem = ({
  icon,
  label,
  string,
  hasImage,
}: {
  icon: IoniconsName;
  label: string;
  string?: string | null;
  hasImage: boolean;
}) => (
  <View style={styles.docItem}>
    <View style={[styles.docIconWrap, { backgroundColor: hasImage ? Colors.success + '15' : Colors.danger + '12' }]}>
      <Ionicons name={icon} size={18} color={hasImage ? Colors.success : Colors.danger} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.docLabel}>{label}</Text>
      {!!string && <Text style={styles.docNumber}>{string}</Text>}
    </View>
    <View style={[styles.docStatusBadge, { backgroundColor: hasImage ? Colors.success + '15' : Colors.danger + '12' }]}>
      <Ionicons
        name={hasImage ? 'checkmark-circle' : 'close-circle'}
        size={14}
        color={hasImage ? Colors.success : Colors.danger}
      />
      <Text style={[styles.docStatusText, { color: hasImage ? Colors.success : Colors.danger }]}>
        {hasImage ? 'Uploaded' : 'Missing'}
      </Text>
    </View>
  </View>
);

const ActionRow = ({
  icon,
  label,
  color,
  onPress,
  showDivider = true,
}: {
  icon: IoniconsName;
  label: string;
  color?: string;
  onPress?: () => void;
  showDivider?: boolean;
}) => (
  <>
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.actionIconWrap, { backgroundColor: (color || Colors.primary) + '15' }]}>
        <Ionicons name={icon} size={18} color={color || Colors.primary} />
      </View>
      <Text style={[styles.actionText, color === Colors.danger ? { color: Colors.danger } : {}]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
    {showDivider && <View style={styles.actionDivider} />}
  </>
);

// ── Section Card ──────────────────────────────────────────────────────────────
const SectionCard = ({
  icon,
  title,
  children,
}: {
  icon: IoniconsName;
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionDivider} />
    {children}
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
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
          try { await authAPI.logout(); } catch (e) { /* ignore */ }
          await clearAuth();
        },
      },
    ]);
  };

  const availStatus = displayPartner?.availabilityStatus ?? 'OFFLINE';
  const accountStatus = displayPartner?.accountStatus ?? 'ACTIVE';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight || '#818CF8']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decor circles */}
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.editBtn}
            >
              <Ionicons name="create-outline" size={16} color={Colors.white} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* ── Avatar ── */}
          <TouchableOpacity
            style={styles.avatarContainer}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.25)']}
              style={styles.avatarRing}
            >
              <View style={styles.avatarInner}>
                {displayPartner?.profileImage ? (
                  <Image source={{ uri: displayPartner.profileImage }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>
                      {getInitials(displayPartner?.name || 'DP')}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarEditOverlay}>
                  <Ionicons name="camera" size={14} color={Colors.white} />
                </View>
              </View>
            </LinearGradient>

            {/* Status dot */}
            <View style={[styles.onlineDot, { backgroundColor: statusColor[availStatus] }]} />

            {/* Edit badge */}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="pencil" size={11} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          {/* Name & phone */}
          {isLoading ? (
            <Skeleton height={24} width={160} style={{ marginBottom: 8 }} />
          ) : (
            <Text style={styles.heroName}>{displayPartner?.name}</Text>
          )}
          <Text style={styles.heroPhone}>{displayPartner?.phone}</Text>

          {/* Stats strip */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {displayPartner?.stats?.totalDeliveries ?? 0}
              </Text>
              <Text style={styles.heroStatLabel}>Deliveries</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <View style={styles.heroRatingRow}>
                <Text style={styles.heroStatValue}>
                  {displayPartner?.stats?.rating?.toFixed(1) ?? '—'}
                </Text>
                <Ionicons name="star" size={13} color="#FCD34D" />
              </View>
              <Text style={styles.heroStatLabel}>Rating</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <View style={[styles.statusPill, { backgroundColor: statusColor[availStatus] + '30' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor[availStatus] }]} />
                <Text style={[styles.statusPillText, { color: statusColor[availStatus] }]}>
                  {availStatus}
                </Text>
              </View>
              <Text style={styles.heroStatLabel}>Status</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Vehicle Details ── */}
        <SectionCard icon="car-sport" title="Vehicle Details">
          <InfoRow
            icon={vehicleIcon[displayPartner?.vehicleType ?? 'BIKE']}
            label="Vehicle Type"
            value={displayPartner?.vehicleType}
          />
          <InfoRow icon="id-card-outline" label="Vehicle Number" value={displayPartner?.vehicleNumber ?? '—'} />
          <InfoRow icon="document-text-outline" label="License Number" value={displayPartner?.licenseNumber ?? '—'} />
        </SectionCard>

        {/* ── Account ── */}
        <SectionCard icon="person-circle-outline" title="Account">
          <InfoRow icon="mail-outline" label="Email" value={displayPartner?.email ?? '—'} />
          <InfoRow
            icon="shield-checkmark-outline"
            label="Account Status"
            value={accountStatus}
            valueColor={statusColor[accountStatus]}
          />
        </SectionCard>

        {/* ── Documents ── */}
        <SectionCard icon="documents-outline" title="Documents">
          <DocumentItem
            icon="card-outline"
            label="Aadhaar Card"
            string={displayPartner?.documents?.aadhaarNumber}
            hasImage={!!displayPartner?.documents?.aadhaarImage}
          />
          <View style={styles.docDivider} />
          <DocumentItem
            icon="card-outline"
            label="PAN Card"
            string={displayPartner?.documents?.panNumber}
            hasImage={!!displayPartner?.documents?.panImage}
          />
          <View style={styles.docDivider} />
          <DocumentItem
            icon="document-outline"
            label="Driving License"
            hasImage={!!displayPartner?.documents?.drivingLicenseImage}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('UploadDocuments')}
            style={styles.uploadDocBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="cloud-upload-outline" size={16} color={Colors.primary} />
            <Text style={styles.uploadDocText}>Upload / Update Documents</Text>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Action List ── */}
        <View style={styles.actionsSection}>
          <ActionRow
            icon="create-outline"
            label="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <ActionRow
            icon="card-outline"
            label="Payout Settings"
            color={Colors.primary}
            onPress={() => navigation.navigate('PayoutSettings')}
          />
          <ActionRow
            icon="cash-outline"
            label="Earnings"
            color="#0EA5E9"
            onPress={() => navigation.navigate('Earnings')}
          />

          {/* <ActionRow
            icon="wallet-outline"
            label="Wallet"
            color="#8B5CF6"
            onPress={() => navigation.navigate('Wallet')}
          /> */}
          <ActionRow
            icon="notifications-outline"
            label="Notification Settings"
            color="#10B981"
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <ActionRow
            icon="lock-closed-outline"
            label="Change Password"
            color="#F59E0B"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <ActionRow
            icon="headset-outline"
            label="Support"
            color="#0EA5E9"
            onPress={() => navigation.navigate('Support')}
          />
          <ActionRow
            icon="log-out-outline"
            label="Logout"
            color={Colors.danger}
            onPress={handleLogout}
            showDivider={false}
          />
        </View>

        <Text style={styles.versionText}>kiranase Partner v54</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },

  // Header gradient
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -50,
  },
  headerDecor2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: 20, left: -30,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: FontSize.lg, fontWeight: '800', color: Colors.white,
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  editBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },

  // Avatar
  avatarContainer: {
    position: 'relative', marginBottom: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarRing: {
    width: 104, height: 104, borderRadius: 52, padding: 3,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 10,
  },
  avatarInner: {
    width: 98, height: 98, borderRadius: 49, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImage: { width: 98, height: 98, borderRadius: 49 },
  avatarFallback: {
    width: 98, height: 98, borderRadius: 49,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: Colors.white },
  avatarEditOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 30,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute', top: 3, right: 3,
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 3, borderColor: Colors.primary,
  },
  avatarEditBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
  },

  heroName: {
    fontSize: FontSize.xxl, fontWeight: '900',
    color: Colors.white, letterSpacing: -0.3,
  },
  heroPhone: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginBottom: Spacing.lg,
  },

  // Stats strip
  heroStatsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: Spacing.md,
    width: '100%',
  },
  heroStat: { flex: 1, alignItems: 'center', gap: 5 },
  heroRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroStatValue: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.white },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  heroStatDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  // Section cards
  section: {
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    backgroundColor: Colors.white, borderRadius: 18,
    padding: Spacing.md, ...Shadow.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  sectionDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },

  // Info rows
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 7,
  },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },

  // Document items
  docItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  docIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  docLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  docNumber: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  docStatusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  docStatusText: { fontSize: 11, fontWeight: '700' },
  docDivider: { height: 1, backgroundColor: Colors.border },
  uploadDocBtn: {
    marginTop: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary + '12',
    borderRadius: BorderRadius.md, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.primary + '25',
  },
  uploadDocText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },

  // Actions list
  actionsSection: {
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    backgroundColor: Colors.white, borderRadius: 18,
    overflow: 'hidden', ...Shadow.sm,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, gap: 12,
  },
  actionIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  actionText: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  actionDivider: { height: 1, backgroundColor: Colors.border, marginLeft: 60 },

  versionText: {
    textAlign: 'center', fontSize: FontSize.xs,
    color: Colors.textMuted, marginTop: Spacing.lg,
  },
});