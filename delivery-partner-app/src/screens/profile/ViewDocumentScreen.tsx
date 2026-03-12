// src/screens/profile/ViewDocumentScreen.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Linking,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

export default function ViewDocumentScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { uri, title } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const isPdf = uri?.toLowerCase().endsWith('.pdf');

    const displayUri = isPdf && Platform.OS === 'android'
        ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}`
        : uri;

    const handleOpenInBrowser = () => {
        Linking.openURL(uri).catch(() => Alert.alert('Error', 'Could not open document.'));
    };

    return (
        <SafeAreaView style={styles.safe}>

            {/* ── Header ── */}
            <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={20} color={Colors.white} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    {/* Doc type chip */}
                    <View style={styles.docTypeChip}>
                        <Ionicons
                            name={isPdf ? 'document-text' : 'image'}
                            size={11}
                            color="rgba(255,255,255,0.7)"
                        />
                        <Text style={styles.docTypeText}>{isPdf ? 'PDF' : 'IMAGE'}</Text>
                    </View>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {title || 'View Document'}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleOpenInBrowser}
                    style={styles.browserBtn}
                    activeOpacity={0.8}
                >
                    <Ionicons name="open-outline" size={18} color={Colors.white} />
                </TouchableOpacity>
            </LinearGradient>

            {/* ── Content ── */}
            <View style={styles.container}>
                {uri ? (
                    isPdf ? (
                        <View style={{ flex: 1, width: '100%' }}>
                            {loading && (
                                <View style={styles.loader}>
                                    <View style={styles.loaderCard}>
                                        <ActivityIndicator size="large" color={Colors.primary} />
                                        <Text style={styles.loaderText}>Loading document...</Text>
                                    </View>
                                </View>
                            )}
                            <WebView
                                source={{ uri: displayUri }}
                                style={{ flex: 1 }}
                                onLoadEnd={() => setLoading(false)}
                                startInLoadingState={false}
                            />
                        </View>
                    ) : imageError ? (
                        <View style={styles.errorContainer}>
                            <View style={styles.errorIconWrap}>
                                <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.3)" />
                            </View>
                            <Text style={styles.errorTitle}>Failed to load image</Text>
                            <Text style={styles.errorSubtitle}>The document could not be displayed.</Text>
                            <TouchableOpacity
                                style={styles.openBrowserBtn}
                                onPress={handleOpenInBrowser}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="open-outline" size={16} color={Colors.white} />
                                <Text style={styles.openBrowserText}>Open in Browser</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <Image
                                source={{ uri }}
                                style={styles.image}
                                resizeMode="contain"
                                onLoadEnd={() => setLoading(false)}
                                onError={() => { setLoading(false); setImageError(true); }}
                            />
                            {loading && (
                                <View style={styles.loader}>
                                    <View style={styles.loaderCard}>
                                        <ActivityIndicator size="large" color={Colors.primary} />
                                        <Text style={styles.loaderText}>Loading image...</Text>
                                    </View>
                                </View>
                            )}
                        </>
                    )
                ) : (
                    <View style={styles.errorContainer}>
                        <View style={styles.errorIconWrap}>
                            <Ionicons name="document-outline" size={48} color="rgba(255,255,255,0.3)" />
                        </View>
                        <Text style={styles.errorTitle}>No document found</Text>
                        <Text style={styles.errorSubtitle}>No document is available to view.</Text>
                    </View>
                )}
            </View>

            {/* ── Bottom action bar ── */}
            {uri && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.bottomBtn}
                        onPress={handleOpenInBrowser}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="open-outline" size={16} color={Colors.white} />
                        <Text style={styles.bottomBtnText}>Open in Browser</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.bottomBtn, styles.bottomBtnSecondary]}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="arrow-back-outline" size={16} color={Colors.textPrimary} />
                        <Text style={styles.bottomBtnTextSecondary}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0f0f1a' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerCenter: {
        flex: 1, alignItems: 'center', gap: 2,
    },
    docTypeChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 999,
    },
    docTypeText: {
        fontSize: 9, fontWeight: '800',
        color: 'rgba(255,255,255,0.7)', letterSpacing: 1,
    },
    headerTitle: {
        fontSize: FontSize.md, fontWeight: '800',
        color: Colors.white, letterSpacing: -0.2,
    },
    browserBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },

    // Content
    container: { flex: 1, backgroundColor: '#0f0f1a' },
    image: { width, height: height * 0.78 },

    // Loader
    loader: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#0f0f1a', zIndex: 10,
    },
    loaderCard: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 20, padding: 28,
        alignItems: 'center', gap: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    loaderText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: FontSize.sm, fontWeight: '600',
    },

    // Error
    errorContainer: {
        flex: 1, justifyContent: 'center',
        alignItems: 'center', padding: 40, gap: 12,
    },
    errorIconWrap: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
    },
    errorTitle: {
        fontSize: FontSize.lg, fontWeight: '800',
        color: 'rgba(255,255,255,0.85)',
    },
    errorSubtitle: {
        fontSize: FontSize.sm, color: 'rgba(255,255,255,0.4)',
        textAlign: 'center', lineHeight: 20,
    },
    openBrowserBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: Colors.primary,
        paddingHorizontal: 24, paddingVertical: 12,
        borderRadius: BorderRadius.md, marginTop: 8,
    },
    openBrowserText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },

    // Bottom bar
    bottomBar: {
        flexDirection: 'row', gap: 10,
        paddingHorizontal: Spacing.md, paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
    },
    bottomBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8,
        backgroundColor: Colors.primary,
        paddingVertical: 13, borderRadius: 14,
    },
    bottomBtnSecondary: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    },
    bottomBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
    bottomBtnTextSecondary: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: FontSize.sm },
});