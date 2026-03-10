// src/components/home/QuickAction.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing, Shadow } from '../../utils/theme';

interface QuickActionProps {
    icon: string;
    label: string;
    count?: number;
    color: string;
    onPress: () => void;
}

export const QuickAction = ({
    icon,
    label,
    count,
    color,
    onPress,
}: QuickActionProps) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.quickAction}>
        <View style={[styles.quickIconBg, { backgroundColor: `${color}18` }]}>
            <Text style={styles.quickIcon}>{icon}</Text>
            {count !== undefined && count > 0 && (
                <View style={[styles.quickBadge, { backgroundColor: Colors.danger }]}>
                    <Text style={styles.quickBadgeText}>{count}</Text>
                </View>
            )}
        </View>
        <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    quickAction: {
        width: '47.5%',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        ...Shadow.sm,
    },
    quickIconBg: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    quickIcon: { fontSize: 26 },
    quickLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
    quickBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
});
