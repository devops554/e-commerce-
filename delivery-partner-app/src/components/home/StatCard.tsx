// src/components/home/StatCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Shadow } from '../../utils/theme';
import { Skeleton } from '../ui';

interface StatCardProps {
    label: string;
    value: string | null;
    icon: string;
    color: string;
}

export const StatCard = ({
    label,
    value,
    icon,
    color,
}: StatCardProps) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
        <Text style={styles.statIcon}>{icon}</Text>
        {value === null ? (
            <Skeleton height={20} width={60} style={{ marginVertical: 2 }} />
        ) : (
            <Text style={[styles.statValue, { color }]}>{value}</Text>
        )}
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: 14,
        borderTopWidth: 3,
        alignItems: 'center',
        ...Shadow.sm,
    },
    statIcon: { fontSize: 22, marginBottom: 4 },
    statValue: { fontSize: FontSize.lg, fontWeight: '800', letterSpacing: -0.3 },
    statLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2, textAlign: 'center', fontWeight: '600' },
});
