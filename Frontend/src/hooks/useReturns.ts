import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { returnService, ReturnRequestStatus, RefundMethod } from "@/services/return.service";
import { toast } from "sonner";

export const useReturns = (params: any = {}) => {
  return useQuery({
    queryKey: ['returns', params],
    queryFn: () => returnService.getAll(params),
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
