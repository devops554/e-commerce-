// src/services/socketService.ts

import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { Order } from '../types';
import { useNotificationStore } from '../store/notificationStore';
import { notificationService } from './notificationService';
import { useAuthStore } from '../store/authStore';
import { QueryClient } from '@tanstack/react-query';

const SOCKET_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000';

type NewOrderCallback = (order: Order) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private listenersAttached = false; // ✅ double listener guard
  private queryClient: QueryClient | null = null;

  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) return;
    this.isConnecting = true;

    try {
      const token = await SecureStore.getItemAsync('accessToken');
      // ✅ partnerId bhejo taaki backend room mein join kar sake
      const partnerId = useAuthStore.getState().partner?._id;

      this.socket = io(SOCKET_URL, {
        auth: {
          token,
          userId: partnerId, // ✅ backend gateway userId se room join karega
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      this.setupListeners();
    } finally {
      this.isConnecting = false;
    }
  }

  setQueryClient(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  private setupListeners() {
    if (!this.socket) return;
    if (this.listenersAttached) return; // ✅ double listener nahi lagega
    this.listenersAttached = true;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    // ✅ Yeh event sirf tab aayega jab backend 'new-order' emit kare
    // Abhi backend sirf 'notification.received' emit karta hai
    // Isliye neeche 'notification.received' handle kar rahe hain
    this.socket.on('new-order', (order: Order) => {
      console.log('[Socket] New Order Received:', order._id);
      useNotificationStore.getState().addNotification({
        title: '🛵 New Order Request!',
        message: `Order #${order._id.slice(-6)} — ₹${order.totalAmount} | Tap to view`,
        type: 'NEW_ORDER',
        data: { orderId: order._id },
      });
      notificationService
        .notifyNewOrder(order._id.slice(-6), order.totalAmount)
        .catch((e) => console.log('[Socket] notifyNewOrder failed:', e));
    });

    this.socket.on('order-assigned', (order: Order) => {
      useNotificationStore.getState().addNotification({
        title: '✅ Order Assigned',
        message: `Order #${order._id.slice(-6)} is now active for you.`,
        type: 'ORDER_ASSIGNED',
        data: { orderId: order._id },
      });
      notificationService
        .notifyOrderAssigned(order._id.slice(-6))
        .catch((e) => console.log('[Socket] notifyOrderAssigned failed:', e));
    });

    this.socket.on('order-status-update', (data) => {
      useNotificationStore.getState().addNotification({
        title: '📦 Order Status Updated',
        message: `Order #${data.orderId.slice(-6)} is now ${data.status.replace(/_/g, ' ')}`,
        type: 'SYSTEM',
        data: { orderId: data.orderId },
      });
    });

    // ✅ Yeh main event hai — backend sirf is user ke room mein emit karega
    // Ab sabko nahi aayega — sirf is delivery partner ko
    this.socket.on('notification.received', (notification: any) => {
      console.log('[Socket] Notification Received:', notification.title);

      // Extra safety check
      if (notification.recipientRole !== 'delivery_partner') return;

      let type: 'NEW_ORDER' | 'ORDER_ASSIGNED' | 'SYSTEM' = 'SYSTEM';
      if (notification.title?.includes('New Delivery Assignment')) type = 'ORDER_ASSIGNED';
      if (notification.title?.includes('Pickup OTP')) type = 'SYSTEM';

      // ✅ Store mein add karo — NotificationsScreen aur tab badge reactive update honge
      useNotificationStore.getState().addNotification({
        title: notification.title,
        message: notification.message,
        type,
        data: notification.metadata,
      });

      // ✅ Local notification bhi fire karo (in-app sound/banner)
      notificationService
        .scheduleLocalNotification(
          notification.title,
          notification.message,
          notification.metadata,
        )
        .catch((err) => console.log('[Socket] Local notification failed:', err));
    });

    this.socket.on('delivery-partner-status-updated', (data: { partnerId: string, status: string }) => {
      console.log(`[Socket] Partner Status Updated via WS: ${data.status}`);
      // Only update if it pertains to the current user (which it should, but just to be safe)
      const currentPartnerId = useAuthStore.getState().partner?._id;
      if (currentPartnerId === data.partnerId) {
         useAuthStore.getState().updatePartner({ availabilityStatus: data.status as any });
      }
    });

    this.socket.on('dashboard-stats-updated', (stats: any) => {
      console.log('[Socket] Dashboard Stats Updated:', stats);
      if (this.queryClient) {
        this.queryClient.setQueryData(['dashboard', 'stats'], stats);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnect attempts reached. Giving up.');
        this.disconnect();
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.listenersAttached = false; // ✅ reset on disconnect
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  onNewOrder(callback: NewOrderCallback): () => void {
    if (!this.socket) return () => { };
    this.socket.on('new-order', callback);
    return () => {
      this.socket?.off('new-order', callback);
    };
  }

  sendLocationUpdate(latitude: number, longitude: number): void {
    if (!this.socket?.connected) return;
    this.socket.emit('location-update', { latitude, longitude });
  }

  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();