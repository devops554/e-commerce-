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
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { Card } from '../../components/ui';
import { authAPI } from '../../api/services';
import { useAuthStore } from '../../store/authStore';

interface DocumentState {
    uri: string;
    name: string;
    type: 'image' | 'pdf';
}

// ── Since backend now converts all PDFs → JPG, every stored URL is an image ──
// Only local files picked from device need the 'pdf' type for UI display.
const getDocumentType = (uri: string): 'image' | 'pdf' => {
    if (!uri) return 'image';
    // Local file picked as PDF before upload
    if (uri.toLowerCase().endsWith('.pdf')) return 'pdf';
    // Remote cloudinary URL — always image (backend converts PDF→JPG)
    return 'image';
};

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
            Alert.alert('Permission Denied', 'Camera roll permissions are required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setDocs((prev) => ({
                ...prev,
                [docKey]: {
                    uri: asset.uri,
                    name: asset.fileName || `image_${Date.now()}.jpg`,
                    type: 'image',
                },
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
                setDocs((prev) => ({
                    ...prev,
                    [docKey]: {
                        uri: asset.uri,
                        name: asset.name,
                        // PDF locally — shown as PDF icon before upload
                        // After upload backend converts it to JPG
                        type: isPdf ? 'pdf' : 'image',
                    },
                }));
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleSelectSource = (docKey: keyof typeof docs) => {
        Alert.alert(
            'Upload Document',
            'Choose a file type',
            [
                { text: 'Image from Gallery', onPress: () => pickImage(docKey) },
                { text: 'PDF File', onPress: () => pickDocument(docKey) },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleView = (doc: DocumentState | null, title: string) => {
        if (!doc) return;
        navigation.navigate('ViewDocument', { uri: doc.uri, title });
    };

    const uploadFile = async (uri: string, filename: string): Promise<string | null> => {
        try {
            const formData = new FormData();
            const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';

            let mimeType: string;
            if (extension === 'pdf') {
                mimeType = 'application/pdf';
            } else if (['jpg', 'jpeg'].includes(extension)) {
                mimeType = 'image/jpeg';
            } else if (extension === 'png') {
                mimeType = 'image/png';
            } else {
                mimeType = 'image/jpeg'; // safe default
            }

            // @ts-ignore — RN FormData accepts object with uri/name/type
            formData.append('file', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: filename || `file_${Date.now()}.${extension}`,
                type: mimeType,
            });

            const response = await authAPI.uploadFile(formData);
            return response.url;
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        }
    };

    const isLocalUri = (uri: string) =>
        uri.startsWith('file://') || uri.includes('ExponentExperienceData');

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
                        setLoading(false);
                        return;
                    }
                    // After upload, always treat as image (backend converted PDF→JPG)
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Documents</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.infoText}>
                    Upload clear images or PDF files for verification.
                </Text>

                <DocUploadCard
                    title="Aadhaar Card"
                    subtitle="Front and Back view"
                    doc={docs.aadhaar}
                    onPress={() => handleSelectSource('aadhaar')}
                    onView={() => handleView(docs.aadhaar, 'Aadhaar Card')}
                    documentNumber={documentNumbers.aadhaarNumber}
                    onDocumentNumberChange={(val) =>
                        setDocumentNumbers((prev) => ({ ...prev, aadhaarNumber: val }))
                    }
                    documentNumberPlaceholder="Enter 12-digit Aadhaar Number"
                />

                <DocUploadCard
                    title="PAN Card"
                    subtitle="Front view only"
                    doc={docs.pan}
                    onPress={() => handleSelectSource('pan')}
                    onView={() => handleView(docs.pan, 'PAN Card')}
                    documentNumber={documentNumbers.panNumber}
                    onDocumentNumberChange={(val) =>
                        setDocumentNumbers((prev) => ({ ...prev, panNumber: val }))
                    }
                    documentNumberPlaceholder="Enter 10-character PAN Number"
                />

                <DocUploadCard
                    title="Driving License"
                    subtitle="Clear view of details"
                    doc={docs.license}
                    onPress={() => handleSelectSource('license')}
                    onView={() => handleView(docs.license, 'Driving License')}
                />

                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitBtnText}>Save Documents</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

const DocUploadCard = ({
    title,
    subtitle,
    doc,
    onPress,
    onView,
    documentNumber,
    onDocumentNumberChange,
    documentNumberPlaceholder,
}: {
    title: string;
    subtitle: string;
    doc: DocumentState | null;
    onPress: () => void;
    onView: () => void;
    documentNumber?: string;
    onDocumentNumberChange?: (val: string) => void;
    documentNumberPlaceholder?: string;
}) => (
    <Card style={styles.docCard}>
        <View style={styles.docInfo}>
            <Text style={styles.docTitle}>{title}</Text>
            <Text style={styles.docSubtitle}>{subtitle}</Text>

            {onDocumentNumberChange && (
                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder={documentNumberPlaceholder || 'Enter Document Number'}
                        value={documentNumber}
                        onChangeText={onDocumentNumberChange}
                        placeholderTextColor={Colors.textMuted}
                        autoCapitalize="characters"
                    />
                </View>
            )}

            {doc ? (
                <View style={styles.previewRow}>
                    <TouchableOpacity onPress={onView}>
                        {/* 
                          doc.type === 'pdf' only for locally picked PDFs not yet uploaded.
                          Once uploaded, backend converts to JPG so type becomes 'image'.
                        */}
                        {doc.type === 'image' ? (
                            <Image source={{ uri: doc.uri }} style={styles.previewThumb} />
                        ) : (
                            <View style={styles.pdfThumb}>
                                <Text style={{ fontSize: 28 }}>📄</Text>
                                <Text style={styles.pdfLabel}>PDF</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.fileName} numberOfLines={1}>
                            {doc.name}
                        </Text>
                        {doc.type === 'pdf' && (
                            <Text style={styles.pdfNote}>Will convert to image on save</Text>
                        )}
                        <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
                            <TouchableOpacity onPress={onPress}>
                                <Text style={styles.changeText}>Change File</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onView}>
                                <Text style={styles.viewText}>View</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={onPress}>
                    <Text style={styles.uploadBtnText}>📤 Upload File (IMG / PDF)</Text>
                </TouchableOpacity>
            )}
        </View>
    </Card>
);

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
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: { fontSize: 24, color: Colors.textPrimary },
    headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
    content: { padding: Spacing.md, paddingBottom: 40 },
    infoText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    docCard: { marginBottom: Spacing.md, padding: Spacing.md },
    docInfo: { flex: 1 },
    docTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
    docSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4, marginBottom: 12 },
    inputGroup: { marginBottom: 16 },
    input: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.sm,
        padding: 12,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
    },
    uploadBtn: {
        borderWidth: 1,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
        borderRadius: BorderRadius.md,
        padding: 16,
        alignItems: 'center',
        backgroundColor: Colors.surfaceAlt,
    },
    uploadBtnText: { color: Colors.primary, fontWeight: '700' },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.background,
        padding: 8,
        borderRadius: BorderRadius.md,
    },
    previewThumb: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.border,
    },
    pdfThumb: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    pdfLabel: { fontSize: 9, fontWeight: '800', color: Colors.textMuted, marginTop: 2 },
    pdfNote: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' },
    fileName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
    changeText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '700' },
    viewText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
    submitBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        padding: 16,
        alignItems: 'center',
        marginTop: Spacing.xl,
        ...Shadow.md,
    },
    submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
});