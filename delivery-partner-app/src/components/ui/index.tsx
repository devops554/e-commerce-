import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadow, FontSize } from '../../utils/theme';

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
    label: string;
    backgroundColor?: string;
    color?: string;
    style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
    label,
    backgroundColor = Colors.surfaceAlt,
    color = Colors.textPrimary,
    style
}) => (
    <View style={[styles.badge, { backgroundColor }, style]}>
        <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
);

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => (
    <View style={[styles.card, style]}>
        {children}
    </View>
);

// ─── Divider ──────────────────────────────────────────────────────────────────

interface DividerProps {
    style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({ style }) => (
    <View style={[styles.divider, style]} />
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style
}) => (
    <View
        style={[
            styles.skeleton,
            { width: width as any, height: height as any, borderRadius },
            style
        ]}
    />
);

// ─── StatusDot ────────────────────────────────────────────────────────────────

interface StatusDotProps {
    status: 'ONLINE' | 'OFFLINE' | 'BUSY' | string;
    size?: number;
    style?: ViewStyle;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, size = 10, style }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'ONLINE': return Colors.success;
            case 'OFFLINE': return Colors.textSecondary;
            case 'BUSY': return Colors.warning;
            default: return Colors.textSecondary;
        }
    };

    return (
        <View
            style={[
                styles.statusDot,
                { width: size, height: size, borderRadius: size / 2, backgroundColor: getStatusColor() },
                style
            ]}
        />
    );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
    icon: string;
    title: string;
    subtitle?: string;
    style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, style }) => (
    <View style={[styles.emptyState, style]}>
        <Text style={styles.emptyIcon}>{icon}</Text>
        <Text style={styles.emptyTitle}>{title}</Text>
        {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
);

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        ...Shadow.sm,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        width: '100%',
    },
    skeleton: {
        backgroundColor: Colors.surfaceAlt,
    },
    statusDot: {
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    emptyState: {
        padding: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
});
