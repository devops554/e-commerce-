// src/store/notificationStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../types';


interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      setNotifications: (notifs) => {
        set({
          notifications: notifs,
          unreadCount: notifs.filter((n) => !n.isRead).length,
        });
      },

      addNotification: (notif) => {
        const newNotif: Notification = {
          ...notif,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, // ✅ unique id, not just Date.now()
          timestamp: new Date().toISOString(),
          isRead: false,
        };
        set((state) => {
          const updated = [newNotif, ...state.notifications].slice(0, 50);
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.isRead).length, // ✅ always derived, never drifts
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.isRead).length, // ✅ recalculate
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // ✅ Rehydrate: recalculate unreadCount from persisted notifications
      // in case app was killed mid-update
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
        }
      },
    }
  )
);