import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { authAPI } from '../../api/services';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword === currentPassword) {
            Alert.alert('Error', 'New password cannot be the same as current password');
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.changePassword({
                currentPassword,
                newPassword,
            });
            Alert.alert('Success', 'Password updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Change password failed:', error);
            const msg = error.response?.data?.message || 'Failed to update password. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.lockIconWrap}>
                    <LinearGradient

                        colors={[Colors.primary + '20', Colors.primary + '05']}
                        style={styles.lockIconCircle}
                    >
                        <Ionicons name="lock-closed" size={40} color={Colors.primary} />
                    </LinearGradient>
                </View>

                <View style={styles.form}>
                    <Text style={styles.formTitle}>Protect your account</Text>
                    <Text style={styles.formSubtitle}>Enter your current and new password below to update.</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Current Password</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="key-outline" size={18} color={Colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                secureTextEntry={!showCurrent}
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                <Ionicons
                                    name={showCurrent ? "eye-off-outline" : "eye-outline"}
                                    size={18}
                                    color={Colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>New Password</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="lock-open-outline" size={18} color={Colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                secureTextEntry={!showNew}
                                placeholder="Min. 6 characters"
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                <Ionicons
                                    name={showNew ? "eye-off-outline" : "eye-outline"}
                                    size={18}
                                    color={Colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm New Password</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                secureTextEntry={!showConfirm}
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Ionicons
                                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                                    size={18}
                                    color={Colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                        onPress={handleUpdate}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <>
                                <Text style={styles.submitBtnText}>Update Password</Text>
                                <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.tipBox}>
                    <Ionicons name="bulb-outline" size={18} color={Colors.warning} />
                    <Text style={styles.tipText}>
                        Tip: Strong passwords use a mix of letters, numbers, and symbols.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.white },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.md, height: 56,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
    content: { padding: Spacing.lg },

    lockIconWrap: { alignItems: 'center', marginVertical: 32 },
    lockIconCircle: {
        width: 100, height: 100, borderRadius: 50,
        alignItems: 'center', justifyContent: 'center',
    },

    form: { gap: 24 },
    formTitle: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
    formSubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: -16, lineHeight: 18 },

    inputGroup: { gap: 8 },
    inputLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginLeft: 4 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#F8FAFC', paddingHorizontal: 16,
        height: 52, borderRadius: 14,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    input: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },

    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: Colors.primary, height: 56, borderRadius: 16,
        marginTop: 12, ...Shadow.md,
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },

    tipBox: {
        flexDirection: 'row', gap: 10, marginTop: 40,
        padding: 16, borderRadius: 14, backgroundColor: '#FEF3C7',
    },
    tipText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18, fontWeight: '500' },
});
