"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService, Notification } from '@/services/notification.service'
import { useSocket } from './useSocket'
import { useCallback } from 'react'
import { useAuth } from '@/providers/AuthContext'

export function useNotifications() {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationService.getNotifications,
        refetchOnWindowFocus: true,
    });

    const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

    const { user } = useAuth();

    // Real-time update via Socket.io
    const handleNewNotification = useCallback((newNotification: Notification) => {
        const isForMe = newNotification.recipientId === user?.id?.toString();
        const isForMyRole = newNotification.recipientRole === user?.role;

        // Strict filtering: If recipientId exists, it MUST match the current user.
        // If no recipientId, it must match the user's role.
        if (newNotification.recipientId) {
            if (!isForMe) return;
        } else {
            if (!isForMyRole) return;
        }

        // Optimistically update the cache
        queryClient.setQueryData(['notifications'], (old: Notification[] = []) => {
            // Check if already exists to avoid duplicates
            if (old.some((n: Notification) => n._id === newNotification._id)) return old;
            return [newNotification, ...old];
        });
    }, [queryClient]);

    useSocket('notification.received', handleNewNotification);

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: (updated: Notification) => {
            queryClient.setQueryData(['notifications'], (old: Notification[] = []) =>
                old.map((n: Notification) => n._id === updated._id ? updated : n)
            );
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.setQueryData(['notifications'], (old: Notification[] = []) =>
                old.map((n: Notification) => ({ ...n, isRead: true }))
            );
        }
    });

    return {
        notifications,
        unreadCount,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
        isLoading
    }
}
