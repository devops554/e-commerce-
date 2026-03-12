// src/screens/profile/UploadDocumentsScreen.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
    TextInput,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { authAPI } from '../../api/services';
import { useAuthStore } from '../../store/authStore';

// ── Types ─────────────────────────────────────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface DocumentState {
    uri: string;
    name: string;
    type: 'image' | 'pdf';
}

const getDocumentType = (uri: string): 'image' | 'pdf' => {
    if (!uri) return 'image';
    if (uri.toLowerCase().endsWith('.pdf')) return 'pdf';
    return 'image';
};

// ── Doc Upload Card ───────────────────────────────────────────────────────────
const DocUploadCard = ({
    icon,
    iconColor,
    title,
    subtitle,
    doc,
    onPress,
    onView,
    documentNumber,
    onDocumentNumberChange,
    documentNumberPlaceholder,
    numberIcon,
}: {
    icon: IoniconsName;
    iconColor: string;
    title: string;
    subtitle: string;
    doc: DocumentState | null;
    onPress: () => void;
    onView: () => void;
    documentNumber?: string;
    onDocumentNumberChange?: (val: string) => void;
    documentNumberPlaceholder?: string;
    numberIcon?: IoniconsName;
}) => (
    <View style={styles.docCard}>
        {/* Card Header */}
        <View style={styles.docCardHeader}>
            <View style={[styles.docCardIconWrap, { backgroundColor: iconColor + '18' }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.docTitle}>{title}</Text>
                <Text style={styles.docSubtitle}>{subtitle}</Text>
            </View>
            {/* Uploaded status badge */}
            <View style={[
                styles.docStatusBadge,
                { backgroundColor: doc ? Colors.success + '15' : Colors.border }
            ]}>
                <Ionicons
                    name={doc ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={doc ? Colors.success : Colors.textMuted}
                />
                <Text style={[
                    styles.docStatusText,
                    { color: doc ? Colors.success : Colors.textMuted }
                ]}>
                    {doc ? 'Uploaded' : 'Pending'}
                </Text>
            </View>
        </View>

        {/* Document Number Input */}
        {onDocumentNumberChange && (
            <View style={styles.numberInputWrap}>
                <Ionicons name={numberIcon || 'keypad-outline'} size={15} color={Colors.textMuted} />
                <TextInput
                    style={styles.numberInput}
                    placeholder={documentNumberPlaceholder || 'Enter Document Number'}
                    value={documentNumber}
                    onChangeText={onDocumentNumberChange}
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="characters"
                />
            </View>
        )}

        {/* File area */}
        {doc ? (
            <View style={styles.previewRow}>
                {/* Thumbnail */}
                <TouchableOpacity onPress={onView} style={styles.thumbWrap} activeOpacity={0.85}>
                    {doc.type === 'image' ? (
                        <Image source={{ uri: doc.uri }} style={styles.previewThumb} />
                    ) : (
                        <View style={styles.pdfThumb}>
                            <Ionicons name="document-text" size={28} color={Colors.primary} />
                            <Text style={styles.pdfLabel}>PDF</Text>
                        </View>
                    )}
                    {/* View overlay */}
                    <View style={styles.thumbOverlay}>
                        <Ionicons name="eye" size={14} color={Colors.white} />
                    </View>
                </TouchableOpacity>

                <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.fileName} numberOfLines={1}>{doc.name}</Text>
                    {doc.type === 'pdf' && (
                        <View style={styles.pdfNote}>
                            <Ionicons name="information-circle-outline" size={12} color={Colors.textMuted} />
                            <Text style={styles.pdfNoteText}>Converts to image on save</Text>
                        </View>
                    )}
                    <View style={styles.fileActions}>
                        <TouchableOpacity style={styles.fileActionBtn} onPress={onPress}>
                            <Ionicons name="refresh-outline" size={13} color={Colors.textSecondary} />
                            <Text style={styles.changeText}>Replace</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.fileActionBtn, styles.fileActionBtnPrimary]} onPress={onView}>
                            <Ionicons name="eye-outline" size={13} color={Colors.primary} />
                            <Text style={styles.viewText}>View</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        ) : (
            <TouchableOpacity style={styles.uploadBtn} onPress={onPress} activeOpacity={0.8}>
                <View style={[styles.uploadIconCircle, { backgroundColor: iconColor + '15' }]}>
                    <Ionicons name="cloud-upload-outline" size={24} color={iconColor} />
                </View>
                <Text style={[styles.uploadBtnTitle, { color: iconColor }]}>Upload File</Text>
                <Text style={styles.uploadBtnSub}>Image or PDF supported</Text>
            </TouchableOpacity>
        )}
    </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function UploadDocumentsScreen() {
    const navigation = useNavigation<any>();
    const partner = useAuthStore((s) => s.partner);
    const updatePartnerData = useAuthStore((s) => s.updatePartner);

    const [docs, setDocs] = useState<{
        aadhaar: DocumentState | null;
        pan: DocumentState | null;
        license: DocumentState | null;
    }>({
        aadhaar: partner?.documents?.aadhaarImage
            ? { uri: partner.documents.aadhaarImage, name: 'Aadhaar Card', type: 'image' }
            : null,
        pan: partner?.documents?.panImage
            ? { uri: partner.documents.panImage, name: 'PAN Card', type: 'image' }
            : null,
        license: partner?.documents?.drivingLicenseImage
            ? { uri: partner.documents.drivingLicenseImage, name: 'Driving License', type: 'image' }
            : null,
    });

    const [documentNumbers, setDocumentNumbers] = useState({
        aadhaarNumber: partner?.documents?.aadhaarNumber || '',
        panNumber: partner?.documents?.panNumber || '',
    });
    const [loading, setLoading] = useState(false);

    const pickImage = async (docKey: keyof typeof docs) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera roll permissions are required.'); return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, quality: 0.7,
        });
        if (!result.canceled) {
            const asset = result.assets[0];
            setDocs(prev => ({
                ...prev,
                [docKey]: { uri: asset.uri, name: asset.fileName || `image_${Date.now()}.jpg`, type: 'image' },
            }));
        }
    };

    const pickDocument = async (docKey: keyof typeof docs) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });
            if (!result.canceled) {
                const asset = result.assets[0];
                const isPdf = asset.mimeType?.includes('pdf') ?? false;
                setDocs(prev => ({
                    ...prev,
                    [docKey]: { uri: asset.uri, name: asset.name, type: isPdf ? 'pdf' : 'image' },
                }));
            }
        } catch { Alert.alert('Error', 'Failed to pick document'); }
    };

    const handleSelectSource = (docKey: keyof typeof docs) => {
        Alert.alert('Upload Document', 'Choose a file type', [
            { text: 'Image from Gallery', onPress: () => pickImage(docKey) },
            { text: 'PDF File', onPress: () => pickDocument(docKey) },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleView = (doc: DocumentState | null, title: string) => {
        if (!doc) return;
        navigation.navigate('ViewDocument', { uri: doc.uri, title });
    };

    const uploadFile = async (uri: string, filename: string): Promise<string | null> => {
        try {
            const formData = new FormData();
            const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = extension === 'pdf' ? 'application/pdf'
                : extension === 'png' ? 'image/png' : 'image/jpeg';
            // @ts-ignore
            formData.append('file', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: filename || `file_${Date.now()}.${extension}`,
                type: mimeType,
            });
            const response = await authAPI.uploadFile(formData);
            return response.url;
        } catch { return null; }
    };

    const isLocalUri = (uri: string) =>
        uri.startsWith('file://') || uri.includes('ExponentExperienceData');

    const uploadedCount = [docs.aadhaar, docs.pan, docs.license].filter(Boolean).length;

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updatedDocs = { ...docs };
            for (const key of ['aadhaar', 'pan', 'license'] as const) {
                const doc = docs[key];
                if (doc && isLocalUri(doc.uri)) {
                    const uploadedUrl = await uploadFile(doc.uri, doc.name);
                    if (!uploadedUrl) {
                        Alert.alert('Error', `Failed to upload ${doc.name}. Please try again.`);
                        setLoading(false); return;
                    }
                    updatedDocs[key] = { ...doc, uri: uploadedUrl, type: 'image' };
                }
            }
            const payload = {
                documents: {
                    aadhaarNumber: documentNumbers.aadhaarNumber || '',
                    panNumber: documentNumbers.panNumber || '',
                    aadhaarImage: updatedDocs.aadhaar?.uri || '',
                    panImage: updatedDocs.pan?.uri || '',
                    drivingLicenseImage: updatedDocs.license?.uri || '',
                },
            };
            const updated = await authAPI.updateProfile(payload);
            updatePartnerData(updated);
            if (updated?.documents) {
                setDocs({
                    aadhaar: updated.documents.aadhaarImage
                        ? { uri: updated.documents.aadhaarImage, name: 'Aadhaar Card', type: 'image' }
                        : updatedDocs.aadhaar,
                    pan: updated.documents.panImage
                        ? { uri: updated.documents.panImage, name: 'PAN Card', type: 'image' }
                        : updatedDocs.pan,
                    license: updated.documents.drivingLicenseImage
                        ? { uri: updated.documents.drivingLicenseImage, name: 'Driving License', type: 'image' }
                        : updatedDocs.license,
                });
                setDocumentNumbers({
                    aadhaarNumber: updated.documents.aadhaarNumber || '',
                    panNumber: updated.documents.panNumber || '',
                });
            }
            Alert.alert('Success', 'Documents updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to update documents');
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
                <View style={styles.headerDecor2} />

                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color={Colors.white} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerLabel}>PROFILE</Text>
                        <Text style={styles.headerTitle}>Upload Documents</Text>
                    </View>
                    <View style={{ width: 38 }} />
                </View>

                {/* Progress strip */}
                <View style={styles.progressStrip}>
                    <View style={styles.progressLeft}>
                        <Ionicons name="documents-outline" size={16} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.progressText}>
                            {uploadedCount} of 3 documents uploaded
                        </Text>
                    </View>
                    {/* Progress bar */}
                    <View style={styles.progressBarWrap}>
                        <View style={[styles.progressBarFill, { width: `${(uploadedCount / 3) * 100}%` }]} />
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Info banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
                    <Text style={styles.infoText}>
                        Upload clear images or PDFs for verification. All documents are securely stored.
                    </Text>
                </View>

                {/* Aadhaar Card */}
                <DocUploadCard
                    icon="card-outline"
                    iconColor={Colors.primary}
                    title="Aadhaar Card"
                    subtitle="Front and Back view required"
                    doc={docs.aadhaar}
                    onPress={() => handleSelectSource('aadhaar')}
                    onView={() => handleView(docs.aadhaar, 'Aadhaar Card')}
                    documentNumber={documentNumbers.aadhaarNumber}
                    onDocumentNumberChange={(val) =>
                        setDocumentNumbers(prev => ({ ...prev, aadhaarNumber: val }))
                    }
                    documentNumberPlaceholder="12-digit Aadhaar Number"
                    numberIcon="keypad-outline"
                />

                {/* PAN Card */}
                <DocUploadCard
                    icon="card-outline"
                    iconColor="#F59E0B"
                    title="PAN Card"
                    subtitle="Front view only"
                    doc={docs.pan}
                    onPress={() => handleSelectSource('pan')}
                    onView={() => handleView(docs.pan, 'PAN Card')}
                    documentNumber={documentNumbers.panNumber}
                    onDocumentNumberChange={(val) =>
                        setDocumentNumbers(prev => ({ ...prev, panNumber: val }))
                    }
                    documentNumberPlaceholder="10-character PAN Number"
                    numberIcon="text-outline"
                />

                {/* Driving License */}
                <DocUploadCard
                    icon="document-text-outline"
                    iconColor="#10B981"
                    title="Driving License"
                    subtitle="Clear view of all details"
                    doc={docs.license}
                    onPress={() => handleSelectSource('license')}
                    onView={() => handleView(docs.license, 'Driving License')}
                />

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload" size={20} color={Colors.white} />
                            <Text style={styles.submitBtnText}>Save Documents</Text>
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
        paddingBottom: Spacing.lg,
        overflow: 'hidden',
    },
    headerDecor1: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40,
    },
    headerDecor2: {
        position: 'absolute', width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.05)', bottom: 0, right: 110,
    },
    headerRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.md,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerLabel: {
        fontSize: 10, color: 'rgba(255,255,255,0.65)',
        fontWeight: '700', letterSpacing: 1.2,
    },
    headerTitle: {
        fontSize: FontSize.xl, fontWeight: '900',
        color: Colors.white, letterSpacing: -0.3, marginTop: 2,
    },

    // Progress strip
    progressStrip: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 14, padding: 12, gap: 8,
    },
    progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    progressText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
    progressBarWrap: {
        height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999,
    },
    progressBarFill: {
        height: 4, backgroundColor: '#4ADE80', borderRadius: 999,
    },

    // Content
    content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },

    // Info banner
    infoBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: Colors.primary + '10',
        borderRadius: 14, padding: 12,
        borderWidth: 1, borderColor: Colors.primary + '25',
    },
    infoText: {
        flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20,
    },

    // Doc Card
    docCard: {
        backgroundColor: Colors.white, borderRadius: 18,
        padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm,
    },
    docCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    docCardIconWrap: {
        width: 42, height: 42, borderRadius: 13,
        alignItems: 'center', justifyContent: 'center',
    },
    docTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
    docSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    docStatusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    docStatusText: { fontSize: 10, fontWeight: '700' },

    // Number input
    numberInputWrap: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: Colors.background,
        borderWidth: 1, borderColor: Colors.border,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: 12, paddingVertical: 10,
    },
    numberInput: {
        flex: 1, fontSize: FontSize.md,
        color: Colors.textPrimary, padding: 0,
    },

    // Upload placeholder
    uploadBtn: {
        borderWidth: 1.5, borderColor: Colors.border,
        borderStyle: 'dashed', borderRadius: 14,
        paddingVertical: 20, paddingHorizontal: 16,
        alignItems: 'center', gap: 6,
        backgroundColor: Colors.background,
    },
    uploadIconCircle: {
        width: 52, height: 52, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    },
    uploadBtnTitle: { fontSize: FontSize.md, fontWeight: '800' },
    uploadBtnSub: { fontSize: FontSize.xs, color: Colors.textMuted },

    // Preview row
    previewRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: Colors.background,
        padding: 10, borderRadius: 12,
    },
    thumbWrap: { position: 'relative' },
    previewThumb: {
        width: 64, height: 64, borderRadius: 10, backgroundColor: Colors.border,
    },
    pdfThumb: {
        width: 64, height: 64, borderRadius: 10,
        backgroundColor: Colors.primary + '10',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: Colors.border, gap: 2,
    },
    pdfLabel: { fontSize: 9, fontWeight: '900', color: Colors.primary },
    thumbOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 22,
        backgroundColor: 'rgba(0,0,0,0.38)',
        borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    fileName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
    pdfNote: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pdfNoteText: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },
    fileActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
    fileActionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 5,
        backgroundColor: Colors.background,
        borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
    },
    fileActionBtnPrimary: {
        borderColor: Colors.primary + '40',
        backgroundColor: Colors.primary + '08',
    },
    changeText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },
    viewText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },

    // Submit
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
        padding: 16, marginTop: Spacing.sm, ...Shadow.md,
    },
    submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
});