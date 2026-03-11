// src/hooks/useQueries.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, ordersAPI, locationAPI, walletAPI, dashboardAPI } from '../api/services';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials, Order, Shipment } from '../types';

export const QUERY_KEYS = {
  profile: ['profile'],
  availableOrders: ['orders', 'available'],
  activeOrder: ['orders', 'active'],
  orderHistory: (filter: string) => ['orders', 'history', filter],
  orderDetail: (id: string) => ['orders', id],
  walletSummary: ['wallet', 'summary'],
  transactions: ['wallet', 'transactions'],
  dashboardStats: ['dashboard', 'stats'],
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const useLoginMutation = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    onSuccess: async (data) => {
      await setAuth(data.partner, data.accessToken, data.refreshToken);
    },
  });
};

export const useProfile = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: authAPI.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const useAvailableOrders = () =>
  useQuery({
    queryKey: QUERY_KEYS.availableOrders,
    queryFn: ordersAPI.getAvailableOrders,
    refetchInterval: 10_000, // Poll every 10s
    staleTime: 5_000,
  });

export const useActiveOrder = () =>
  useQuery<Shipment | null>({
    queryKey: QUERY_KEYS.activeOrder,
    queryFn: ordersAPI.getActiveOrder,
    refetchInterval: 15_000,
  });

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, orderId }: { shipmentId: string; orderId?: string }) =>
      ordersAPI.acceptOrder(shipmentId, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.availableOrders });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useRejectOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, orderId }: { shipmentId: string; orderId?: string }) =>
      ordersAPI.rejectOrder(shipmentId, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.availableOrders });
    },
  });
};

export const usePickupOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) => ordersAPI.pickupOrder(shipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useStartDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) => ordersAPI.startDelivery(shipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useCompleteDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) => ordersAPI.completeDelivery(shipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletSummary });
    },
  });
};

export const useFailDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      ordersAPI.failDelivery(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useRequestPickupOtp = () => {
  return useMutation({
    mutationFn: (shipmentId: string) => ordersAPI.requestPickupOtp(shipmentId),
  });
};

export const useVerifyPickupOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, otp }: { shipmentId: string; otp: string }) =>
      ordersAPI.verifyPickupOtp(shipmentId, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useRequestDeliveryOtp = () => {
  return useMutation({
    mutationFn: (shipmentId: string) => ordersAPI.requestDeliveryOtp(shipmentId),
  });
};

export const useVerifyDeliveryOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, otp }: { shipmentId: string; otp: string }) =>
      ordersAPI.verifyDeliveryOtp(shipmentId, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useOrderHistory = (filter: 'today' | 'week' | 'month') =>
  useQuery({
    queryKey: QUERY_KEYS.orderHistory(filter),
    queryFn: () => ordersAPI.getOrderHistory(filter),
    staleTime: 2 * 60 * 1000,
  });

export const useOrderDetail = (orderId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.orderDetail(orderId),
    queryFn: () => ordersAPI.getOrderById(orderId),
    enabled: !!orderId,
  });

// ─── Location ─────────────────────────────────────────────────────────────────

export const useUpdateLocation = () =>
  useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      locationAPI.updateLocation(latitude, longitude),
  });

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  const updatePartner = useAuthStore((s) => s.updatePartner);
  return useMutation({
    mutationFn: locationAPI.updateAvailability,
    onSuccess: (partner) => {
      updatePartner({ availabilityStatus: partner.availabilityStatus });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const useWalletSummary = () =>
  useQuery({
    queryKey: QUERY_KEYS.walletSummary,
    queryFn: walletAPI.getWalletSummary,
    staleTime: 60 * 1000,
  });

export const useTransactions = () =>
  useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: () => walletAPI.getTransactions(),
    staleTime: 60 * 1000,
  });

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export const useDashboardStats = () =>
  useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: dashboardAPI.getStats,
    refetchInterval: 30_000,
  });