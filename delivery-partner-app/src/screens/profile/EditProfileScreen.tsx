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
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { authAPI } from '../../api/services';
import { Address, VehicleType } from '../../types';
import worldData from '../../data/world.json';
import { AddressDropdown } from '../../components/ui/AddressDropdown';

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
        type: partner?.vehicleType || 'BIKE' as VehicleType,
        number: partner?.vehicleNumber || '',
        license: partner?.licenseNumber || '',
    });

    const [currentAddress, setCurrentAddress] = useState<Address>(partner?.currentAddress || {
        addressLine: '', city: '', state: '', country: 'India', pincode: ''
    });

    const [permanentAddress, setPermanentAddress] = useState<Address>(partner?.permanentAddress || {
        addressLine: '', city: '', state: '', country: 'India', pincode: ''
    });

    const [sections, setSections] = useState({
        personal: true,
        vehicle: false,
        address: false,
    });

    const pickImage = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permissions are required for this action.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const uploadFile = async (uri: string): Promise<string | null> => {
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop() || 'profile.jpg';
            const extension = filename.split('.').pop()?.toLowerCase();
            const type = extension === 'png' ? 'image/png' : 'image/jpeg';

            // @ts-ignore
            formData.append('file', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: filename,
                type,
            });

            const response = await authAPI.uploadFile(formData);
            return response.url;
        } catch (error) {
            console.error('[DIAGNOSTIC] EditProfile Upload error:', error);
            return null;
        }
    };

    const handleUpdate = async () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Error', 'Name and Phone are required');
            return;
        }

        setLoading(true);
        try {
            let finalProfileImage = profileImage;

            // If profileImage is a local URI, upload it
            if (profileImage && (profileImage.startsWith('file://') || profileImage.includes('ExponentExperienceData'))) {
                const uploadedUrl = await uploadFile(profileImage);
                if (!uploadedUrl) {
                    Alert.alert('Error', 'Failed to upload profile image. Please try again.');
                    setLoading(false);
                    return;
                }
                finalProfileImage = uploadedUrl;
            }

            const payload = {
                name,
                email,
                phone,
                bloodGroup,
                profileImage: finalProfileImage || undefined,
                vehicleType: vehicle.type,
                vehicleNumber: vehicle.number,
                licenseNumber: vehicle.license,
                currentAddress,
                permanentAddress,
            };

            const updated = await authAPI.updateProfile(payload);
            updatePartnerData(updated);
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: keyof typeof sections) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Image Section */}
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.profileImg} />
                        ) : (
                            <View style={styles.placeholderImg}>
                                <Text style={{ fontSize: 40 }}>👤</Text>
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Text style={{ fontSize: 14 }}>📷</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.imageInfo}>Tap to change (Camera Only)</Text>
                </View>

                {/* Personal Details Section */}
                <SectionHeader title="Personal Details" isOpen={sections.personal} onToggle={() => toggleSection('personal')} />
                {sections.personal && (
                    <View style={styles.sectionBody}>
                        <CustomInput label="Full Name" value={name} onChange={setName} placeholder="Your name" />
                        <CustomInput label="Email Address" value={email} onChange={setEmail} placeholder="Email" keyboardType="email-address" />
                        <CustomInput label="Phone Number" value={phone} onChange={setPhone} placeholder="Phone" keyboardType="phone-pad" />
                        <CustomInput label="Blood Group" value={bloodGroup} onChange={setBloodGroup} placeholder="e.g. O+" />
                    </View>
                )}

                {/* Vehicle Details Section */}
                <SectionHeader title="Vehicle Details" isOpen={sections.vehicle} onToggle={() => toggleSection('vehicle')} />
                {sections.vehicle && (
                    <View style={styles.sectionBody}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Vehicle Type</Text>
                            <View style={styles.typeRow}>
                                {['BIKE', 'SCOOTER', 'CAR', 'VAN'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.typeBtn, vehicle.type === type && styles.typeBtnActive]}
                                        onPress={() => setVehicle({ ...vehicle, type: type as VehicleType })}
                                    >
                                        <Text style={[styles.typeBtnText, vehicle.type === type && styles.typeBtnTextActive]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <CustomInput label="Vehicle Number" value={vehicle.number} onChange={(v) => setVehicle({ ...vehicle, number: v })} placeholder="e.g. KA 01 AB 1234" />
                        <CustomInput label="License Number" value={vehicle.license} onChange={(v) => setVehicle({ ...vehicle, license: v })} placeholder="Driving license no." />
                    </View>
                )}

                {/* Addresses Section */}
                <SectionHeader title="Addresses" isOpen={sections.address} onToggle={() => toggleSection('address')} />
                {sections.address && (
                    <View style={styles.sectionBody}>
                        <Text style={styles.subHeader}>Current Address</Text>
                        <AddressFields address={currentAddress} onChange={setCurrentAddress} />

                        <View style={styles.divider} />

                        <Text style={styles.subHeader}>Permanent Address</Text>
                        <AddressFields address={permanentAddress} onChange={setPermanentAddress} />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitBtnText}>Update Profile</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const SectionHeader = ({ title, isOpen, onToggle }: { title: string; isOpen: boolean; onToggle: () => void }) => (
    <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.chevron}>{isOpen ? '▼' : '▶'}</Text>
    </TouchableOpacity>
);

const CustomInput = ({ label, value, onChange, placeholder, keyboardType = 'default', onPress }: { label: string; value: string; onChange?: (v: string) => void; placeholder: string; keyboardType?: any; onPress?: () => void }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        {onPress ? (
            <TouchableOpacity style={styles.input} onPress={onPress}>
                <Text style={{ color: value ? Colors.textPrimary : Colors.textMuted }}>
                    {value || placeholder}
                </Text>
            </TouchableOpacity>
        ) : (
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                keyboardType={keyboardType}
            />
        )}
    </View>
);

const AddressFields = ({ address, onChange }: { address: Address; onChange: (a: Address) => void }) => {
    const [dropdown, setDropdown] = useState<{
        visible: boolean;
        type: 'country' | 'state' | 'city';
        data: string[];
        title: string;
    }>({
        visible: false,
        type: 'country',
        data: [],
        title: '',
    });

    const countries = (worldData as any[]).map(c => c.name);
    const selectedCountryData = (worldData as any[]).find(c => c.name === address.country);
    const states = selectedCountryData?.states || [];
    const selectedStateData = states.find((s: any) => s.name === address.state);
    const cities = selectedStateData?.cities || [];

    const handleSelectCountry = () => {
        setDropdown({
            visible: true,
            type: 'country',
            data: countries,
            title: 'Select Country',
        });
    };

    const handleSelectState = () => {
        if (!states.length) {
            Alert.alert('Info', 'No states found for ' + address.country);
            return;
        }
        setDropdown({
            visible: true,
            type: 'state',
            data: states.map((s: any) => s.name),
            title: 'Select State',
        });
    };

    const handleSelectCity = () => {
        if (!cities.length) {
            Alert.alert('Info', 'No cities found for ' + address.state);
            return;
        }
        setDropdown({
            visible: true,
            type: 'city',
            data: cities,
            title: 'Select City',
        });
    };

    const onSelect = (item: string) => {
        if (dropdown.type === 'country') {
            onChange({ ...address, country: item, state: '', city: '' });
        } else if (dropdown.type === 'state') {
            onChange({ ...address, state: item, city: '' });
        } else if (dropdown.type === 'city') {
            onChange({ ...address, city: item });
        }
    };

    return (
        <View>
            <CustomInput label="Address Line" value={address.addressLine || ''} onChange={(v: string) => onChange({ ...address, addressLine: v })} placeholder="House, Street, Area" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <CustomInput label="Country" value={address.country} placeholder="Select Country" onPress={handleSelectCountry} />
                </View>
                <View style={{ flex: 1 }}>
                    <CustomInput label="State" value={address.state || ''} placeholder="Select State" onPress={handleSelectState} />
                </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <CustomInput label="City" value={address.city || ''} placeholder="Select City" onPress={handleSelectCity} />
                </View>
                <View style={{ flex: 1 }}>
                    <CustomInput label="Pincode" value={address.pincode || ''} onChange={(v: string) => onChange({ ...address, pincode: v })} placeholder="6 digits" keyboardType="numeric" />
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

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
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
    backArrow: { fontSize: 24, color: Colors.textPrimary },
    headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
    content: { padding: Spacing.md, paddingBottom: 40 },
    imageSection: { alignItems: 'center', marginVertical: Spacing.lg },
    imageWrapper: { width: 100, height: 100, borderRadius: 50, position: 'relative' },
    profileImg: { width: 100, height: 100, borderRadius: 50 },
    placeholderImg: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.white },
    imageInfo: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surfaceAlt, padding: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.md },
    sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
    chevron: { fontSize: 14, color: Colors.textMuted },
    sectionBody: { padding: Spacing.md, backgroundColor: Colors.white, borderBottomLeftRadius: BorderRadius.md, borderBottomRightRadius: BorderRadius.md, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
    subHeader: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.primary, marginBottom: 12, marginTop: 4 },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
    inputGroup: { marginBottom: Spacing.md },
    label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
    input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.sm, padding: 10, fontSize: FontSize.md, color: Colors.textPrimary },
    typeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    typeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
    typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    typeBtnText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
    typeBtnTextActive: { color: Colors.white },
    submitBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, padding: 16, alignItems: 'center', marginTop: Spacing.xl, ...Shadow.md },
    submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
});
