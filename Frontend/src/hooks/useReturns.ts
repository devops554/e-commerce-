import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { returnService, ReturnRequestStatus, RefundMethod } from "@/services/return.service";
import { toast } from "sonner";

export const useReturns = (params: any = {}, type: 'admin' | 'manager' | 'customer' = 'customer') => {
  return useQuery({
    queryKey: ['returns', type, params],
    queryFn: () => {
      if (type === 'admin') return returnService.getAllAdmin(params);
      if (type === 'manager') return returnService.getAllManager(params);
      return returnService.getAll(params);
    },
  });
};

export const useMyReturns = (params: any = {}) => {
  return useQuery({
    queryKey: ['my-returns', params],
    queryFn: () => returnService.getMyReturns(params),
  });
};

export const useReturnById = (id: string) => {
  return useQuery({
    queryKey: ['returns', id],
    queryFn: () => returnService.getById(id),
    enabled: !!id,
  });
};

export const useCreateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => returnService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['my-returns'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("Return request submitted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit return request");
    }
  });
};

export const useReviewReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { approved: boolean; rejectionReason?: string; adminNote?: string } }) =>
      returnService.review(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', variables.id] });
      toast.success(`Return request ${variables.data.approved ? 'approved' : 'rejected'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to review return request");
    }
  });
};

export const useUpdateReturnQc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { warehouseQcGrade: string; warehouseQcNotes?: string } }) =>
      returnService.updateQc(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', variables.id] });
      toast.success("QC status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update QC status");
    }
  });
};

export const useInitiateRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { refundMethod: RefundMethod; refundAmount: number; refundTransactionId?: string } }) =>
      returnService.initiateRefund(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', variables.id] });
      toast.success("Refund initiated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to initiate refund");
    }
  });
};

export const useResolveFailedPickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { approved: boolean; rejectionReason?: string; adminNote?: string } }) =>
      returnService.resolveFailedPickup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', variables.id] });
      toast.success(`Failed pickup ${variables.data.approved ? 'resolved (re-approved)' : 'rejected'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to resolve failed pickup");
    }
  });
};

export const useCancelReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => returnService.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', id] });
      queryClient.invalidateQueries({ queryKey: ['my-returns'] });
      toast.success("Return request cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel return request");
    }
  });
};

// ─── MANAGER HOOKS ──────────────────────────────────────────────────────────

export const useManagerStats = () => {
  return useQuery({
    queryKey: ['manager-return-stats'],
    queryFn: () => returnService.getManagerStats(),
  });
};

export const useWarehouseReturnAnalytics = (range: string = '7d') => {
  return useQuery({
    queryKey: ['manager-return-analytics', range],
    queryFn: () => returnService.getWarehouseAnalytics(range),
  });
};

export const useManagerApprove = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { adminNote?: string } }) =>
      returnService.managerApprove(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['manager-return-stats'] });
      toast.success("Return approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve return");
    }
  });
};

export const useManagerReject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rejectionReason: string; adminNote?: string } }) =>
      returnService.managerReject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['manager-return-stats'] });
      toast.success("Return rejected successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject return");
    }
  });
};

export const useManagerAssignPartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { partnerId?: string } }) =>
      returnService.managerAssignPartner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['manager-return-stats'] });
      toast.success("Partner assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to assign partner");
    }
  });
};

export const useManagerResolveFailedPickup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { approved: boolean; rejectionReason?: string; adminNote?: string } }) =>
      returnService.managerResolveFailedPickup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['manager-return-stats'] });
      toast.success(`Failed pickup ${variables.data.approved ? 'resolved (re-approved)' : 'rejected'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to resolve failed pickup");
    }
  });
};

export const useSendManagerOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => returnService.sendManagerOtp(id),
    onSuccess: (_, id) => {
      toast.success("OTP sent to delivery partner");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  });
};

// ─── ADMIN HOOKS ────────────────────────────────────────────────────────────

export const useGlobalReturnAnalytics = (range: string = '7d') => {
  return useQuery({
    queryKey: ['global-return-analytics', range],
    queryFn: () => returnService.getGlobalAnalytics(range),
  });
};
