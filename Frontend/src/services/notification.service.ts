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

export const notificationService = {
    getNotifications: async () => {
        const response = await axiosClient.get<Notification[]>('/notifications');
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
