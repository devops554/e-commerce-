// src/api/services.ts

import apiClient from './client';
import {
  AuthResponse,
  LoginCredentials,
  Order,
  Transaction,
  WalletSummary,
  DeliveryPartner,
  AvailabilityStatus,
  TokenResponse,
} from '../types';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/delivery-partners/login', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  getProfile: async (): Promise<DeliveryPartner> => {
    const { data } = await apiClient.get<DeliveryPartner>('/delivery/profile');
    return data;
  },

  updateProfile: async (payload: Partial<DeliveryPartner>): Promise<DeliveryPartner> => {
    const { data } = await apiClient.patch<DeliveryPartner>('/delivery/profile', payload);
    return data;
  },
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const ordersAPI = {
  getAvailableOrders: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>('/delivery/orders/available');
    return data;
  },

  getActiveOrder: async (): Promise<Order | null> => {
    const { data } = await apiClient.get<Order | null>('/delivery/orders/active');
    return data;
  },

  acceptOrder: async (orderId: string): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/delivery/orders/accept', { orderId });
    return data;
  },

  rejectOrder: async (orderId: string): Promise<void> => {
    await apiClient.post('/delivery/orders/reject', { orderId });
  },

  startDelivery: async (orderId: string): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/delivery/orders/start', { orderId });
    return data;
  },

  completeDelivery: async (orderId: string): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/delivery/orders/complete', { orderId });
    return data;
  },

  failDelivery: async (orderId: string, reason: string): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/delivery/orders/fail', { orderId, reason });
    return data;
  },

  getOrderHistory: async (filter: 'today' | 'week' | 'month'): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>(`/delivery/orders/history?filter=${filter}`);
    return data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/delivery/orders/${orderId}`);
    return data;
  },
};

// ─── Location ─────────────────────────────────────────────────────────────────

export const locationAPI = {
  updateLocation: async (latitude: number, longitude: number): Promise<void> => {
    await apiClient.post('/delivery/location/update', { latitude, longitude });
  },

  updateAvailability: async (status: AvailabilityStatus): Promise<DeliveryPartner> => {
    const { data } = await apiClient.patch<DeliveryPartner>('/delivery/availability', { status });
    return data;
  },
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const walletAPI = {
  getWalletSummary: async (): Promise<WalletSummary> => {
    const { data } = await apiClient.get<WalletSummary>('/delivery/wallet/summary');
    return data;
  },

  getTransactions: async (page = 1, limit = 20): Promise<Transaction[]> => {
    const { data } = await apiClient.get<Transaction[]>(
      `/delivery/wallet/transactions?page=${page}&limit=${limit}`
    );
    return data;
  },
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  todayEarnings: number;
  todayDeliveries: number;
  totalDeliveries: number;
  rating: number;
}

export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/delivery/dashboard/stats');
    return data;
  },
};