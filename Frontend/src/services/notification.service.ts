import axiosClient from '../lib/axiosClient';
export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'order' | 'stock' | 'system';
    isRead: boolean;
    recipientRole: string;
    recipientId?: string;
    link?: string;
    createdAt: string;
    metadata?: any;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const notificationService = {
    getNotifications: async (params?: { page?: number; limit?: number }) => {
        const response = await axiosClient.get<NotificationsResponse>('/notifications', { params });
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await axiosClient.patch<Notification>(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await axiosClient.patch<{ message: string }>('/notifications/read-all');
        return response.data;
    },
};
