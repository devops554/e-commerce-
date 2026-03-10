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
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Colors, Spacing, FontSize, BorderRadius } from '../../utils/theme';

export default function ViewDocumentScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { uri, title } = route.params || {};
    const [loading, setLoading] = useState(true);

    const isPdf = uri?.toLowerCase().endsWith('.pdf');

    // Android WebView doesn't support PDFs natively, use Google Docs Viewer
    const displayUri = isPdf && Platform.OS === 'android'
        ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}`
        : uri;

    const handleOpenInBrowser = () => {
        Linking.openURL(uri).catch(() => {
            Alert.alert('Error', 'Could not open document.');
        });
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title || 'View Document'}</Text>
                <TouchableOpacity onPress={handleOpenInBrowser} style={styles.browserBtn}>
                    <Text style={{ fontSize: 18 }}>🌐</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {uri ? (
                    isPdf ? (
                        <View style={{ flex: 1, width: '100%' }}>
                            <WebView
                                source={{ uri: displayUri }}
                                style={{ flex: 1 }}
                                onLoadEnd={() => setLoading(false)}
                                startInLoadingState={true}
                                renderLoading={() => (
                                    <View style={styles.loader}>
                                        <ActivityIndicator size="large" color={Colors.primary} />
                                    </View>
                                )}
                            />
                        </View>
                    ) : (
                        <Image
                            source={{ uri }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    )
                ) : (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>No document available to view.</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.black },
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
    headerTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
    browserBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    container: { flex: 1 },
    image: { width: Dimensions.get('window').width, height: '100%' },
    loader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.black,
    },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    errorText: { color: Colors.white, fontSize: FontSize.md, textAlign: 'center' },
});
