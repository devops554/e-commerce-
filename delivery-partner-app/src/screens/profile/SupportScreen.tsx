import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';

const FAQ_DATA = {
    en: [
        {
            q: 'How to change my password?',
            a: 'Go to Profile > Change Password and enter your current and new password.',
        },
        {
            q: 'When do I get my earnings?',
            a: 'Payouts are processed weekly on Mondays directly to your linked bank account or UPI.',
        },
        {
            q: 'How to report a delivery issue?',
            a: 'You can call support immediately or use the "Report Issue" option in the order details screen.',
        },
        {
            q: 'What if the customer is not available?',
            a: 'Try calling the customer at least twice. If they are still unavailable, mark the order as "Failed Delivery" with the appropriate reason.',
        },
    ],
    hi: [
        {
            q: 'अपना पासवर्ड कैसे बदलें?',
            a: 'प्रोफ़ाइल > पासवर्ड बदलें पर जाएं और अपना वर्तमान और नया पासवर्ड दर्ज करें।',
        },
        {
            q: 'मुझे अपनी कमाई कब मिलेगी?',
            a: 'भुगतान सीधे आपके लिंक किए गए बैंक खाते या UPI में हर सोमवार को साप्ताहिक रूप से संसाधित किया जाता है।',
        },
        {
            q: 'डिलीवरी की समस्या की रिपोर्ट कैसे करें?',
            a: 'आप तुरंत सपोर्ट को कॉल कर सकते हैं या ऑर्डर विवरण स्क्रीन में "समस्या की रिपोर्ट करें" विकल्प का उपयोग कर सकते हैं।',
        },
        {
            q: 'यदि ग्राहक उपलब्ध नहीं है तो क्या करें?',
            a: 'ग्राहक को कम से कम दो बार कॉल करने का प्रयास करें। यदि वे अभी भी अनुपलब्ध हैं, तो उचित कारण के साथ ऑर्डर को "डिलीवरी विफल" के रूप में चिह्नित करें।',
        },
    ],
};

const ContactCard = ({ icon, label, value, onPress, color }: any) => (
    <TouchableOpacity style={styles.contactCard} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.contactIconWrap, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>{label}</Text>
            <Text style={styles.contactValue}>{value}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
);

const AccordionItem = ({ question, answer, expanded, onPress }: any) => (
    <TouchableOpacity style={styles.faqItem} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.faqHeader}>
            <Text style={styles.faqQuestion}>{question}</Text>
            <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.primary}
            />
        </View>
        {expanded && (
            <View style={styles.faqAnswerContainer}>
                <Text style={styles.faqAnswer}>{answer}</Text>
            </View>
        )}
    </TouchableOpacity>
);

export default function SupportScreen() {
    const navigation = useNavigation();
    const [lang, setLang] = useState<'en' | 'hi'>('en');
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const faqs = FAQ_DATA[lang].filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
    );

    const handleCall = () => Linking.openURL('tel:+919128801802');
    const handleEmail = () => Linking.openURL('mailto:care@kiranase.com');

    return (
        <SafeAreaView style={styles.safe}>
            {/* ── Header ── */}
            <LinearGradient
                colors={[Colors.primary, '#818CF8']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color={Colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Help & Support</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.headerSubtitle}>How can we help you today?</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* ── Contact Section ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Get In Touch</Text>
                    <Text style={styles.sectionSubtitle}>Available 9AM – 9PM</Text>

                    <ContactCard
                        icon="call-outline"
                        label="Call Us"
                        value="+91 9128 801 802"
                        onPress={handleCall}
                        color={Colors.primary}
                    />
                    <ContactCard
                        icon="mail-outline"
                        label="Email Support"
                        value="care@kiranase.com"
                        onPress={handleEmail}
                        color="#0EA5E9"
                    />
                </View>

                {/* ── FAQ Section ── */}
                <View style={styles.section}>
                    <View style={styles.faqHeaderRow}>
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                        <View style={styles.langToggle}>
                            <TouchableOpacity
                                onPress={() => setLang('en')}
                                style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
                            >
                                <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>EN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setLang('hi')}
                                style={[styles.langBtn, lang === 'hi' && styles.langBtnActive]}
                            >
                                <Text style={[styles.langText, lang === 'hi' && styles.langTextActive]}>HI</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color={Colors.textMuted} />
                        <TextInput
                            placeholder="Search FAQs..."
                            style={styles.searchInput}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>

                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            question={faq.q}
                            answer={faq.a}
                            expanded={expandedIndex === index}
                            onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        />
                    ))}

                    {faqs.length === 0 && (
                        <View style={styles.emptyFaq}>
                            <Text style={styles.emptyFaqText}>No FAQs found for your search.</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>kiranase Partner Support</Text>
                    <Text style={styles.footerSub}>v54 • Made with care</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xl,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.white },
    headerSubtitle: {
        textAlign: 'center', fontSize: 22, fontWeight: '900',
        color: Colors.white, marginTop: 24, letterSpacing: -0.5,
    },
    content: { padding: Spacing.md, gap: Spacing.lg },
    section: { gap: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
    sectionSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: -8, marginBottom: 4 },

    // Contact Cards
    contactCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: Colors.white, padding: 16, borderRadius: 16,
        ...Shadow.sm,
    },
    contactIconWrap: {
        width: 48, height: 48, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    contactLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
    contactValue: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },

    // Language Toggle
    faqHeaderRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 4,
    },
    langToggle: {
        flexDirection: 'row', backgroundColor: '#E2E8F0',
        padding: 3, borderRadius: 8,
    },
    langBtn: {
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    },
    langBtnActive: { backgroundColor: Colors.white, ...Shadow.sm },
    langText: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
    langTextActive: { color: Colors.primary },

    // Search Bar
    searchBar: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: Colors.white, paddingHorizontal: 14,
        height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0',
        marginBottom: 8,
    },
    searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },

    // FAQ Items
    faqItem: {
        backgroundColor: Colors.white, borderRadius: 16,
        overflow: 'hidden', marginBottom: 2, ...Shadow.sm,
    },
    faqHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', padding: 16,
    },
    faqQuestion: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.textPrimary, paddingRight: 10 },
    faqAnswerContainer: {
        paddingHorizontal: 16, paddingBottom: 16,
        backgroundColor: '#F8FAFC',
    },
    faqAnswer: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

    emptyFaq: { padding: 40, alignItems: 'center' },
    emptyFaqText: { color: Colors.textMuted, fontSize: 14 },

    footer: { alignItems: 'center', marginTop: 10, paddingBottom: 20 },
    footerText: { fontSize: 14, fontWeight: '800', color: Colors.textMuted },
    footerSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
});
