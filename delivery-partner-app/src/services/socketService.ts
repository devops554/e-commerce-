// src/services/socketService.ts

import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { Order } from '../types';

const SOCKET_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000';

type NewOrderCallback = (order: Order) => void;
type OrderAssignedCallback = (order: Order) => void;
type OrderStatusUpdateCallback = (data: { orderId: string; status: string }) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(): Promise<void> {
    if (this.socket?.connected) return;

    const token = await SecureStore.getItemAsync('accessToken');

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.reconnectAttempts++;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ─── Emit ──────────────────────────────────────────────────────────────────

  sendLocationUpdate(latitude: number, longitude: number): void {
    if (!this.socket?.connected) return;
    this.socket.emit('location-update', { latitude, longitude });
  }

  // ─── Listen ────────────────────────────────────────────────────────────────

  onNewOrder(callback: NewOrderCallback): () => void {
    this.socket?.on('new-order', callback);
    return () => this.socket?.off('new-order', callback);
  }

  onOrderAssigned(callback: OrderAssignedCallback): () => void {
    this.socket?.on('order-assigned', callback);
    return () => this.socket?.off('order-assigned', callback);
  }

  onOrderStatusUpdate(callback: OrderStatusUpdateCallback): () => void {
    this.socket?.on('order-status-update', callback);
    return () => this.socket?.off('order-status-update', callback);
  }

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();