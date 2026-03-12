// src/screens/profile/EditProfileScreen.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { authAPI } from '../../api/services';
import { Address, VehicleType } from '../../types';
import worldData from '../../data/world.json';
import { AddressDropdown } from '../../components/ui/AddressDropdown';
import { getInitials } from '../../utils/helpers';

// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Vehicle type config ───────────────────────────────────────────────────────
const VEHICLE_TYPES: { type: VehicleType; icon: IoniconsName; label: string }[] = [
    { type: 'BIKE', icon: 'bicycle', label: 'Bike' },
    { type: 'SCOOTER', icon: 'bicycle', label: 'Scooter' },
    { type: 'CAR', icon: 'car', label: 'Car' },
    { type: 'VAN', icon: 'bus', label: 'Van' },
];

// ── Custom Input ──────────────────────────────────────────────────────────────
const CustomInput = ({
    label,
    icon,
    value,
    onChange,
    placeholder,
    keyboardType = 'default',
    onPress,
}: {
    label: string;
    icon: IoniconsName;
    value: string;
    onChange?: (v: string) => void;
    placeholder: string;
    keyboardType?: any;
    onPress?: () => void;
}) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        {onPress ? (
            <TouchableOpacity style={styles.input} onPress={onPress} activeOpacity={0.75}>
                <Ionicons name={icon} size={16} color={Colors.textMuted} />
                <Text style={{ flex: 1, color: value ? Colors.textPrimary : Colors.textMuted, fontSize: FontSize.md }}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
        ) : (
            <View style={styles.input}>
                <Ionicons name={icon} size={16} color={Colors.textMuted} />
                <TextInput
                    style={styles.inputText}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType={keyboardType}
                />
            </View>
        )}
    </View>
);

// ── Section Header (accordion) ────────────────────────────────────────────────
const SectionHeader = ({
    icon,
    title,
    isOpen,
    onToggle,
    color = Colors.primary,
}: {
    icon: IoniconsName;
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    color?: string;
}) => (
    <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.8}>
        <View style={[styles.sectionIconWrap, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.textMuted}
        />
    </TouchableOpacity>
);

// ── Address Fields ────────────────────────────────────────────────────────────
const AddressFields = ({
    address,
    onChange,
}: {
    address: Address;
    onChange: (a: Address) => void;
}) => {
    const [dropdown, setDropdown] = useState<{
        visible: boolean;
        type: 'country' | 'state' | 'city';
        data: string[];
        title: string;
    }>({ visible: false, type: 'country', data: [], title: '' });

    const countries = (worldData as any[]).map(c => c.name);
    const selectedCountryData = (worldData as any[]).find(c => c.name === address.country);
    const states = selectedCountryData?.states || [];
    const selectedStateData = states.find((s: any) => s.name === address.state);
    const cities = selectedStateData?.cities || [];

    const openDropdown = (type: 'country' | 'state' | 'city') => {
        if (type === 'state' && !states.length) {
            Alert.alert('Info', 'No states found for ' + address.country); return;
        }
        if (type === 'city' && !cities.length) {
            Alert.alert('Info', 'No cities found for ' + address.state); return;
        }
        setDropdown({
            visible: true, type,
            data: type === 'country' ? countries : type === 'state' ? states.map((s: any) => s.name) : cities,
            title: `Select ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        });
    };

    const onSelect = (item: string) => {
        if (dropdown.type === 'country') onChange({ ...address, country: item, state: '', city: '' });
        else if (dropdown.type === 'state') onChange({ ...address, state: item, city: '' });
        else onChange({ ...address, city: item });
    };

    return (
        <View style={{ gap: 0 }}>
            <CustomInput
                label="Address Line"
                icon="location-outline"
                value={address.addressLine || ''}
                onChange={(v) => onChange({ ...address, addressLine: v })}
                placeholder="House, Street, Area"
            />
            <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                    <CustomInput label="Country" icon="globe-outline" value={address.country} placeholder="Select" onPress={() => openDropdown('country')} />
                </View>
                <View style={{ flex: 1 }}>
                    <CustomInput label="State" icon="map-outline" value={address.state || ''} placeholder="Select" onPress={() => openDropdown('state')} />
                </View>
            </View>
            <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                    <CustomInput label="City" icon="business-outline" value={address.city || ''} placeholder="Select" onPress={() => openDropdown('city')} />
                </View>
                <View style={{ flex: 1 }}>
                    <CustomInput label="Pincode" icon="keypad-outline" value={address.pincode || ''} onChange={(v) => onChange({ ...address, pincode: v })} placeholder="6 digits" keyboardType="numeric" />
                </View>
            </View>
            <AddressDropdown
                visible={dropdown.visible}
                onClose={() => setDropdown(prev => ({ ...prev, visible: false }))}
                onSelect={onSelect}
                data={dropdown.data}
                title={dropdown.title}
            />
        </View>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function EditProfileScreen() {
    const navigation = useNavigation<any>();
    const partner = useAuthStore((s) => s.partner);
    const updatePartnerData = useAuthStore((s) => s.updatePartner);

    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(partner?.profileImage || null);
    const [name, setName] = useState(partner?.name || '');
    const [email, setEmail] = useState(partner?.email || '');
    const [phone, setPhone] = useState(partner?.phone || '');
    const [bloodGroup, setBloodGroup] = useState(partner?.bloodGroup || '');

    const [vehicle, setVehicle] = useState({
        type: (partner?.vehicleType || 'BIKE') as VehicleType,
        number: partner?.vehicleNumber || '',
        license: partner?.licenseNumber || '',
    });

    const [currentAddress, setCurrentAddress] = useState<Address>(
        partner?.currentAddress || { addressLine: '', city: '', state: '', country: 'India', pincode: '' }
    );
    const [permanentAddress, setPermanentAddress] = useState<Address>(
        partner?.permanentAddress || { addressLine: '', city: '', state: '', country: 'India', pincode: '' }
    );

    const [sections, setSections] = useState({ personal: true, vehicle: false, address: false });

    const toggleSection = (s: keyof typeof sections) =>
        setSections(prev => ({ ...prev, [s]: !prev[s] }));

    const pickImage = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permissions are required.'); return;
        }
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
        if (!result.canceled) setProfileImage(result.assets[0].uri);
    };

    const uploadFile = async (uri: string): Promise<string | null> => {
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop() || 'profile.jpg';
            const extension = filename.split('.').pop()?.toLowerCase();
            const type = extension === 'png' ? 'image/png' : 'image/jpeg';
            // @ts-ignore
            formData.append('file', { uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''), name: filename, type });
            const response = await authAPI.uploadFile(formData);
            return response.url;
        } catch { return null; }
    };

    const handleUpdate = async () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Error', 'Name and Phone are required'); return;
        }
        setLoading(true);
        try {
            let finalProfileImage = profileImage;
            if (profileImage && (profileImage.startsWith('file://') || profileImage.includes('ExponentExperienceData'))) {
                const uploadedUrl = await uploadFile(profileImage);
                if (!uploadedUrl) {
                    Alert.alert('Error', 'Failed to upload profile image. Please try again.');
                    setLoading(false); return;
                }
                finalProfileImage = uploadedUrl;
            }
            const payload = { name, email, phone, bloodGroup, profileImage: finalProfileImage || undefined, vehicleType: vehicle.type, vehicleNumber: vehicle.number, licenseNumber: vehicle.license, currentAddress, permanentAddress };
            const updated = await authAPI.updateProfile(payload);
            updatePartnerData(updated);
            Alert.alert('Success', 'Profile updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>

            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.primary, Colors.primaryLight || '#818CF8']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerDecor1} />
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color={Colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 38 }} />
                </View>

                {/* ── Avatar picker ── */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarWrap} activeOpacity={0.85}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.2)']}
                            style={styles.avatarRing}
                        >
                            <View style={styles.avatarInner}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarFallback}>
                                        <Text style={styles.avatarInitials}>
                                            {getInitials(name || 'DP')}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.avatarOverlay}>
                                    <Ionicons name="camera" size={16} color={Colors.white} />
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Camera badge */}
                        <View style={styles.cameraBadge}>
                            <Ionicons name="camera" size={12} color={Colors.white} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>Tap to change photo</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* ── Personal Details ── */}
                <SectionHeader
                    icon="person-outline"
                    title="Personal Details"
                    isOpen={sections.personal}
                    onToggle={() => toggleSection('personal')}
                />
                {sections.personal && (
                    <View style={styles.sectionBody}>
                        <CustomInput label="Full Name" icon="person-outline" value={name} onChange={setName} placeholder="Your name" />
                        <CustomInput label="Email Address" icon="mail-outline" value={email} onChange={setEmail} placeholder="Email" keyboardType="email-address" />
                        <CustomInput label="Phone Number" icon="call-outline" value={phone} onChange={setPhone} placeholder="Phone" keyboardType="phone-pad" />
                        <CustomInput label="Blood Group" icon="water-outline" value={bloodGroup} onChange={setBloodGroup} placeholder="e.g. O+" />
                    </View>
                )}

                {/* ── Vehicle Details ── */}
                <SectionHeader
                    icon="car-outline"
                    title="Vehicle Details"
                    isOpen={sections.vehicle}
                    onToggle={() => toggleSection('vehicle')}
                    color="#10B981"
                />
                {sections.vehicle && (
                    <View style={styles.sectionBody}>
                        <Text style={styles.subLabel}>Vehicle Type</Text>
                        <View style={styles.typeRow}>
                            {VEHICLE_TYPES.map(({ type, icon, label }) => {
                                const active = vehicle.type === type;
                                return (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.typeBtn, active && styles.typeBtnActive]}
                                        onPress={() => setVehicle({ ...vehicle, type })}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons
                                            name={icon}
                                            size={18}
                                            color={active ? Colors.white : Colors.textSecondary}
                                        />
                                        <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>
                                            {label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <CustomInput label="Vehicle Number" icon="id-card-outline" value={vehicle.number} onChange={(v) => setVehicle({ ...vehicle, number: v })} placeholder="e.g. KA 01 AB 1234" />
                        <CustomInput label="License Number" icon="document-text-outline" value={vehicle.license} onChange={(v) => setVehicle({ ...vehicle, license: v })} placeholder="Driving license no." />
                    </View>
                )}

                {/* ── Addresses ── */}
                <SectionHeader
                    icon="location-outline"
                    title="Addresses"
                    isOpen={sections.address}
                    onToggle={() => toggleSection('address')}
                    color="#F59E0B"
                />
                {sections.address && (
                    <View style={styles.sectionBody}>
                        <View style={styles.addressSubHeader}>
                            <View style={[styles.addressSubDot, { backgroundColor: Colors.primary }]} />
                            <Text style={[styles.subLabel, { color: Colors.primary, marginBottom: 0 }]}>Current Address</Text>
                        </View>
                        <AddressFields address={currentAddress} onChange={setCurrentAddress} />

                        <View style={styles.addressDivider} />

                        <View style={styles.addressSubHeader}>
                            <View style={[styles.addressSubDot, { backgroundColor: '#F59E0B' }]} />
                            <Text style={[styles.subLabel, { color: '#F59E0B', marginBottom: 0 }]}>Permanent Address</Text>
                        </View>
                        <AddressFields address={permanentAddress} onChange={setPermanentAddress} />
                    </View>
                )}

                {/* ── Submit ── */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleUpdate}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                            <Text style={styles.submitBtnText}>Update Profile</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },

    // Header
    header: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xl,
        overflow: 'hidden',
        alignItems: 'center',
    },
    headerDecor1: {
        position: 'absolute', width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -50,
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

    // Avatar
    avatarSection: { alignItems: 'center', gap: 8 },
    avatarWrap: { position: 'relative' },
    avatarRing: {
        width: 96, height: 96, borderRadius: 48, padding: 3,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 10,
    },
    avatarInner: {
        width: 90, height: 90, borderRadius: 45, overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarImage: { width: 90, height: 90, borderRadius: 45 },
    avatarFallback: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarInitials: { fontSize: 28, fontWeight: '900', color: Colors.white },
    avatarOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 28,
        backgroundColor: 'rgba(0,0,0,0.38)',
        alignItems: 'center', justifyContent: 'center',
    },
    cameraBadge: {
        position: 'absolute', bottom: 0, right: -2,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2.5, borderColor: Colors.white,
    },
    avatarHint: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

    // Content
    content: { padding: Spacing.md, paddingBottom: 40, gap: 0 },

    // Section accordion
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: Colors.white, padding: Spacing.md,
        borderRadius: 14, marginTop: Spacing.md,
        ...Shadow.sm,
    },
    sectionIconWrap: {
        width: 34, height: 34, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    sectionTitle: { flex: 1, fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },

    sectionBody: {
        backgroundColor: Colors.white,
        borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
        paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
        borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1,
        borderColor: Colors.border,
        marginTop: -6, paddingTop: Spacing.sm,
    },

    subLabel: {
        fontSize: FontSize.sm, fontWeight: '700',
        color: Colors.textSecondary, marginBottom: 10, marginTop: 4,
    },

    // Inputs
    inputGroup: { marginBottom: Spacing.sm },
    label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
    input: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: Colors.background, borderWidth: 1,
        borderColor: Colors.border, borderRadius: BorderRadius.sm,
        paddingHorizontal: 12, paddingVertical: 10,
        minHeight: 44,
    },
    inputText: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, padding: 0 },

    rowInputs: { flexDirection: 'row', gap: 12 },

    // Vehicle type buttons
    typeRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
    typeBtn: {
        flex: 1, paddingVertical: 10, alignItems: 'center', gap: 4,
        borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border,
        backgroundColor: Colors.background,
    },
    typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    typeBtnText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
    typeBtnTextActive: { color: Colors.white },

    // Address subsections
    addressSubHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 4 },
    addressSubDot: { width: 8, height: 8, borderRadius: 4 },
    addressDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },

    // Submit
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
        padding: 16, marginTop: Spacing.xl, ...Shadow.md,
    },
    submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
});