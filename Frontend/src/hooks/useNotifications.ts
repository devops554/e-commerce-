"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService, Notification } from '@/services/notification.service'
import { useSocket } from './useSocket'
import { useCallback } from 'react'
import { useAuth } from '@/providers/AuthContext'

export function useNotifications(params: { page?: number; limit?: number } = {}) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['notifications', params],
        queryFn: () => notificationService.getNotifications(params),
        refetchOnWindowFocus: true,
    });

    const notifications = data?.notifications || [];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 0;

    // Use a separate query for unread count to keep it accurate regardless of pagination
    const { data: unreadData } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => notificationService.getNotifications({ limit: 100 }), // Fetch more to count unread
        select: (data) => data.notifications.filter(n => !n.isRead).length
    });

    const unreadCount = unreadData ?? 0;

    const { user } = useAuth();

    // Real-time update via Socket.io
    const handleNewNotification = useCallback((newNotification: Notification) => {
        const isForMe = newNotification.recipientId === user?.id?.toString();
        const isForMyRole = newNotification.recipientRole === user?.role;

        if (newNotification.recipientId) {
            if (!isForMe) return;
        } else {
            if (!isForMyRole) return;
        }

        // Invalidate both current page and unread count
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }, [queryClient, user]);

    useSocket('notification.received', handleNewNotification);

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    return {
        notifications,
        total,
        totalPages,
        unreadCount,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
        isLoading
    }
}
