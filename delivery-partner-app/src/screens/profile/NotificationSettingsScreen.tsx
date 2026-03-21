import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useProfile } from '../../hooks/useQueries';
import { authAPI } from '../../api/services';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';

const SettingRow = ({ icon, label, description, value, onValueChange, disabled }: any) => (
    <View style={styles.settingRow}>
        <View style={styles.settingIconWrap}>
            <Ionicons name={icon} size={20} color={Colors.primary} />
        </View>
        <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{label}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{ false: '#CBD5E1', true: Colors.primary + '80' }}
            thumbColor={value ? Colors.primary : '#F1F5F9'}
        />
    </View>
);

export default function NotificationSettingsScreen() {
    const navigation = useNavigation();
    const { data: profile, isLoading, refetch } = useProfile();
    const updateStorePartner = useAuthStore((s) => s.updatePartner);

    const [settings, setSettings] = useState({
        push: true,
        sms: true,
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (profile?.notificationSettings) {
            setSettings(profile.notificationSettings);
        }
    }, [profile]);

    const handleToggle = async (key: 'push' | 'sms', value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        setIsUpdating(true);
        try {
            const updatedProfile = await authAPI.updateProfile({
                notificationSettings: newSettings,
            } as any);
            updateStorePartner(updatedProfile);
            // Optional: show a small toast or subtle feedback
        } catch (error) {
            setSettings(settings); // Rollback
            Alert.alert('Error', 'Failed to update settings. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notification Settings</Text>
                {isUpdating ? <ActivityIndicator size="small" color={Colors.primary} /> : <View style={{ width: 24 }} />}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <Text style={styles.sectionSubtitle}>Choose how you want to be notified about orders and updates.</Text>

                    <View style={styles.card}>
                        <SettingRow
                            icon="notifications-outline"
                            label="Push Notifications"
                            description="New orders, status updates and important alerts"
                            value={settings.push}
                            onValueChange={(val: boolean) => handleToggle('push', val)}
                            disabled={isUpdating}
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon="chatbox-ellipses-outline"
                            label="SMS Alerts"
                            description="Receive critical updates via SMS when offline"
                            value={settings.sms}
                            onValueChange={(val: boolean) => handleToggle('sms', val)}
                            disabled={isUpdating}
                        />
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} />
                    <Text style={styles.infoText}>
                        Turning off notifications might cause you to miss new order assignments and urgent updates from the hub.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.md, height: 56,
        backgroundColor: Colors.white, ...Shadow.sm,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
    content: { padding: Spacing.md },
    section: { gap: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
    sectionSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
    card: {
        backgroundColor: Colors.white, borderRadius: 20,
        paddingHorizontal: 16, ...Shadow.sm,
    },
    settingRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 18, gap: 14,
    },
    settingIconWrap: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: Colors.primary + '12',
        alignItems: 'center', justifyContent: 'center',
    },
    settingInfo: { flex: 1, gap: 2 },
    settingLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    settingDescription: { fontSize: 12, color: Colors.textMuted },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    infoBox: {
        flexDirection: 'row', gap: 10, marginTop: 24,
        backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16,
    },
    infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});
