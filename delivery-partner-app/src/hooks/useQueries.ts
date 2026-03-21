// src/hooks/useQueries.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, ordersAPI, locationAPI, walletAPI, dashboardAPI, returnsAPI } from '../api/services';
import { useAuthStore } from '../store/authStore';
import { DeliveryPartner, LoginCredentials, Order, Shipment } from '../types';
import { socketService } from '../services/socketService';

export const QUERY_KEYS = {
  profile: ['profile'],
  availableOrders: ['orders', 'available'],
  activeOrder: ['orders', 'active'],
  orderHistory: (filter: string) => ['orders', 'history', filter],
  orderDetail: (id: string) => ['orders', id],
  walletSummary: ['wallet', 'summary'],
  transactions: ['wallet', 'transactions'],
  dashboardStats: ['dashboard', 'stats'],
  returns: {
    assigned: ['returns', 'assigned'],
    history: (filter: string) => ['returns', 'history', filter]
  }
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const useLoginMutation = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    onSuccess: async (data) => {
      await setAuth(data.partner, data.accessToken, data.refreshToken);
      // ✅ Connect socket AFTER setAuth so partner._id is in store
      socketService.connect();
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

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const updatePartner = useAuthStore((s) => s.updatePartner);
  return useMutation({
    mutationFn: (payload: Partial<DeliveryPartner>) => authAPI.updateProfile(payload),
    onSuccess: (data) => {
      updatePartner(data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const useAvailableOrders = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.availableOrders,
    queryFn: ordersAPI.getAvailableOrders,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 10_000 : false, // Poll every 10s only when logged in
    staleTime: 5_000,
  });
};

export const useActiveOrder = (params?: { page?: number; limit?: number; search?: string }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery<{ data: Shipment[]; total: number; page: number; limit: number; totalPages: number } | Shipment[]>({
    queryKey: [...QUERY_KEYS.activeOrder, params],
    queryFn: () => ordersAPI.getActiveOrder(params),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 15_000 : false,
  });
};

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, orderId, latitude, longitude }: { shipmentId: string; orderId?: string; latitude?: number; longitude?: number }) =>
      ordersAPI.acceptOrder(shipmentId, orderId, latitude, longitude),
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
    mutationFn: ({ shipmentId, latitude, longitude }: { shipmentId: string; latitude?: number; longitude?: number }) =>
      ordersAPI.pickupOrder(shipmentId, latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useStartDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, latitude, longitude }: { shipmentId: string; latitude?: number; longitude?: number }) =>
      ordersAPI.startDelivery(shipmentId, latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useCompleteDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, latitude, longitude }: { shipmentId: string; latitude?: number; longitude?: number }) =>
      ordersAPI.completeDelivery(shipmentId, latitude, longitude),
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
    mutationFn: ({ orderId, reason, latitude, longitude }: { orderId: string; reason: string; latitude?: number; longitude?: number }) =>
      ordersAPI.failDelivery(orderId, reason, latitude, longitude),
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
    mutationFn: ({ shipmentId, otp, verificationMedia, notes, weightKg, dimensionsCm, latitude, longitude }: { shipmentId: string; otp: string; verificationMedia?: { url: string; publicId: string }[]; notes?: string; weightKg?: number; dimensionsCm?: { length: number; width: number; height: number }; latitude?: number; longitude?: number }) =>
      ordersAPI.verifyPickupOtp(shipmentId, otp, verificationMedia, notes, weightKg, dimensionsCm, latitude, longitude),
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
    mutationFn: ({ shipmentId, otp, latitude, longitude }: { shipmentId: string; otp: string; latitude?: number; longitude?: number }) =>
      ordersAPI.verifyDeliveryOtp(shipmentId, otp, latitude, longitude),
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


export const useShipmentById = (shipmentId: string) => {
  return useQuery({
    queryKey: ['shipment', shipmentId],
    queryFn: () => ordersAPI.getShipmentById(shipmentId),
    enabled: !!shipmentId,
  });
};

export const useFailPickup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, verificationMedia, notes, latitude, longitude }: { shipmentId: string; verificationMedia?: { url: string; publicId: string }[]; notes?: string; latitude?: number; longitude?: number }) =>
      ordersAPI.failPickup(shipmentId, verificationMedia || [], notes || '', latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};
// The list screen uses useActiveOrders() which returns an array of shipments.
// Add this to your hooks/useQueries.ts:

export const useActiveOrders = (params?: { page?: number; limit?: number; search?: string }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['activeOrders', params],
    queryFn: () => ordersAPI.getActiveOrder(params),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 15_000 : false,
  });
};

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

// ─── Returns ──────────────────────────────────────────────────────────────────

export const useAssignedReturns = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.returns.assigned,
    queryFn: returnsAPI.getAssignedReturns,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 15_000 : false,
  });
};

export const useAcceptReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) => returnsAPI.acceptReturn(shipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.returns.assigned });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useRejectReturnRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, reason }: { shipmentId: string; reason: string }) =>
      returnsAPI.rejectReturn(shipmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.returns.assigned });
    },
  });
};

export const useVerifyReturnItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, verificationMedia, notes, itemsCorrect }: { shipmentId: string; verificationMedia: any[]; notes: string; itemsCorrect: boolean }) =>
      returnsAPI.verifyItems(shipmentId, { verificationMedia, notes, itemsCorrect }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useVerifyReturnCustomerOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, otp }: { shipmentId: string; otp: string }) =>
      returnsAPI.verifyCustomerOtp(shipmentId, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
    },
  });
};

export const useSendReturnManagerOtp = () => {
  return useMutation({
    mutationFn: (shipmentId: string) => returnsAPI.sendManagerOtp(shipmentId),
  });
};

export const useVerifyReturnManagerOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, otp }: { shipmentId: string; otp: string }) =>
      returnsAPI.verifyManagerOtp(shipmentId, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeOrder });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.returns.assigned });
    },
  });
};

export const useReturnHistory = (filter: string) =>
  useQuery({
    queryKey: QUERY_KEYS.returns.history(filter),
    queryFn: () => returnsAPI.getReturnHistory({ filter }),
    staleTime: 2 * 60 * 1000,
  });

