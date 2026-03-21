import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import apiClient from './client';
import {
  AuthResponse,
  LoginCredentials,
  Order,
  Shipment,
  Transaction,
  WalletSummary,
  DeliveryPartner,
  AvailabilityStatus,
  TokenResponse,
  Notification,
} from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

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

  changePassword: async (payload: any): Promise<void> => {
    await apiClient.patch('/delivery/password', payload);
  },

  uploadFile: async (formData: FormData): Promise<{ url: string; publicId: string }> => {
    const token = await SecureStore.getItemAsync('accessToken');
    const response = await fetch(`${BASE_URL}/delivery/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[DIAGNOSTIC] Fetch Upload failed:', response.status, errorData);
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    return response.json();
  },
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const ordersAPI = {
  // ✅ Returns Shipment[] — backend populates orderId as nested object
  getAvailableOrders: async (): Promise<Shipment[]> => {
    const { data } = await apiClient.get<Shipment[]>('/delivery/orders/available');
    return data;
  },

  // accept/reject now use shipmentId
  acceptOrder: async (shipmentId: string, orderId?: string, latitude?: number, longitude?: number): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/shipments/${shipmentId}/accept`, { latitude, longitude });
    return data;
  },

  rejectOrder: async (shipmentId: string, orderId?: string, reason?: string): Promise<void> => {
    await apiClient.patch(`/shipments/${shipmentId}/reject`, { reason });
  },

  getActiveOrder: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ data: Shipment[]; total: number; page: number; limit: number; totalPages: number } | Shipment[]> => {
    const qs = params ? `?page=${params.page || 1}&limit=${params.limit || 10}${params.search ? `&search=${encodeURIComponent(params.search)}` : ''}` : '';
    const { data } = await apiClient.get<{ data: Shipment[]; total: number; page: number; limit: number; totalPages: number } | Shipment[]>(`/delivery/orders/active${qs}`);
    return data;
  },

  pickupOrder: async (shipmentId: string, latitude?: number, longitude?: number): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/shipments/${shipmentId}/pickup`, { latitude, longitude });
    return data;
  },

  startDelivery: async (shipmentId: string, latitude?: number, longitude?: number): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/shipments/${shipmentId}/start-delivery`, { latitude, longitude });
    return data;
  },

  completeDelivery: async (shipmentId: string, latitude?: number, longitude?: number): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/shipments/${shipmentId}/complete-delivery`, { latitude, longitude });
    return data;
  },

  failDelivery: async (shipmentId: string, reason: string, latitude?: number, longitude?: number): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/shipments/${shipmentId}/status`, { status: 'FAILED_DELIVERY', reason, latitude, longitude });
    return data;
  },

  requestPickupOtp: async (shipmentId: string): Promise<void> => {
    await apiClient.post(`/shipments/${shipmentId}/pickup-otp/partner`);
  },

  verifyPickupOtp: async (shipmentId: string, otp: string, verificationMedia?: { url: string; publicId: string }[], notes?: string, weightKg?: number, dimensionsCm?: { length: number; width: number; height: number }, latitude?: number, longitude?: number): Promise<void> => {
    await apiClient.patch(`/shipments/${shipmentId}/verify-pickup/partner`, { otp, verificationMedia, notes, weightKg, dimensionsCm, latitude, longitude });
  },

  failPickup: async (shipmentId: string, verificationMedia: { url: string; publicId: string }[], notes: string, latitude?: number, longitude?: number): Promise<void> => {
    await apiClient.patch(`/shipments/${shipmentId}/fail-pickup/partner`, { verificationMedia, notes, latitude, longitude });
  },

  requestDeliveryOtp: async (shipmentId: string): Promise<void> => {
    await apiClient.post(`/shipments/${shipmentId}/delivery-otp`);
  },

  verifyDeliveryOtp: async (shipmentId: string, otp: string, latitude?: number, longitude?: number): Promise<void> => {
    await apiClient.patch(`/shipments/${shipmentId}/verify-delivery`, { otp, latitude, longitude });
  },

  getOrderHistory: async (filter: 'today' | 'week' | 'month'): Promise<Shipment[]> => {
    const { data } = await apiClient.get<Shipment[]>(`/delivery/orders/history?filter=${filter}`);
    return data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/delivery/orders/${orderId}`);
    return data;
  },

  getShipmentById: async (shipmentId: string): Promise<Shipment> => {
    const { data } = await apiClient.get<Shipment>(`/delivery/shipments/${shipmentId}`);
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

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsAPI = {
  getAll: async (): Promise<any[]> => {
    const { data } = await apiClient.get<any[]>('/delivery-partners/me/notifications');
    return data;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/delivery-partners/me/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch('/delivery-partners/me/notifications/read-all');
  },
};

// ─── Returns ──────────────────────────────────────────────────────────────────

export const returnsAPI = {
  getAssignedReturns: async (): Promise<Shipment[]> => {
    const { data } = await apiClient.get<Shipment[]>('/delivery/returns/assigned');
    return data;
  },

  acceptReturn: async (shipmentId: string): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/delivery/returns/${shipmentId}/accept`);
    return data;
  },

  rejectReturn: async (shipmentId: string, reason: string): Promise<void> => {
    await apiClient.patch(`/delivery/returns/${shipmentId}/reject`, { rejectionReason: reason });
  },

  verifyItems: async (shipmentId: string, payload: { verificationMedia: { url: string; publicId: string }[]; notes: string; itemsCorrect: boolean }): Promise<void> => {
    await apiClient.patch(`/delivery/returns/${shipmentId}/verify-items`, payload);
  },

  verifyCustomerOtp: async (shipmentId: string, otp: string): Promise<void> => {
    await apiClient.post(`/delivery/returns/${shipmentId}/verify-customer-otp`, { otp });
  },

  sendManagerOtp: async (shipmentId: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(`/delivery/returns/${shipmentId}/send-manager-otp`);
    return data;
  },

  verifyManagerOtp: async (shipmentId: string, otp: string): Promise<void> => {
    await apiClient.post(`/delivery/returns/${shipmentId}/verify-manager-otp`, { otp });
  },

  getReturnHistory: async (params?: any): Promise<Shipment[]> => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    const { data } = await apiClient.get<Shipment[]>(`/delivery/returns/history${qs}`);
    return data;
  },
};

// ─── Earnings / Commission ─────────────────────────────────────────────────────

export const earningsAPI = {
  getSummary: async () => {
    const { data } = await apiClient.get('/delivery/earnings');
    return data;
  },

  getList: async () => {
    const { data } = await apiClient.get('/delivery/earnings');
    return data?.recentEarnings ?? [];
  },

  getOne: async (earningsId: string) => {
    const { data } = await apiClient.get(`/delivery/earnings/${earningsId}`);
    return data;
  },

  getPayoutHistory: async () => {
    const { data } = await apiClient.get('/delivery/earnings/payout-history');
    return data;
  },

  getActiveOffers: async () => {
    const { data } = await apiClient.get('/delivery/earnings');
    return data?.activeOffers ?? [];
  },

  raiseDispute: async (earningsId: string, note: string) => {
    const { data } = await apiClient.post(`/delivery/earnings/${earningsId}/dispute`, { note });
    return data;
  },

  requestPayout: async () => {
    const { data } = await apiClient.post('/delivery/earnings/request-payout');
    return data;
  },
};


