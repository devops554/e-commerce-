// src/components/home/NoActiveOrderCard.tsx

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card } from '../ui';
import { Colors, Spacing, FontSize } from '../../utils/theme';

interface NoActiveOrderCardProps {
    isOnline: boolean;
}

export const NoActiveOrderCard = ({ isOnline }: NoActiveOrderCardProps) => (
    <Card style={styles.noActiveCard}>
        <Text style={styles.noActiveIcon}>🛵</Text>
        <Text style={styles.noActiveTitle}>No Active Delivery</Text>
        <Text style={styles.noActiveText}>
            {isOnline ? 'Waiting for new order requests...' : 'Go online to receive orders'}
        </Text>
    </Card>
);

const styles = StyleSheet.create({
    noActiveCard: { marginBottom: Spacing.lg, alignItems: 'center', paddingVertical: 28 },
    noActiveIcon: { fontSize: 42, marginBottom: 10 },
    noActiveTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
    noActiveText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
});
