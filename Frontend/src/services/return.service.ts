import axiosClient from '../lib/axiosClient';

export interface ReturnPolicy {
  isReturnable: boolean;
  windowValue: number;
  windowUnit: 'DAYS' | 'HOURS';
  conditions: string[];
  requiresQcPhoto: boolean;
  doorstepQcRequired: boolean;
  refundMethods: string[];
  exchangeAllowed: 'YES' | 'NO' | 'SIZE_ONLY';
  nonReturnableReasons: string[];
  internalNote?: string;
}

export enum ReturnRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  RECEIVED_AT_WAREHOUSE = 'RECEIVED_AT_WAREHOUSE',
  QC_PASSED = 'QC_PASSED',
  QC_FAILED = 'QC_FAILED',
  QC_COMPLETED = 'QC_COMPLETED', // Keeping this if used elsewhere, though backend has QC_PASSED/FAILED
  REFUND_INITIATED = 'REFUND_INITIATED',
  REFUND_COMPLETED = 'REFUND_COMPLETED',
  FAILED_PICKUP = 'FAILED_PICKUP',
  PICKUP_OTP_PENDING = 'PICKUP_OTP_PENDING',
  CLOSED = 'CLOSED',
}

export enum RefundMethod {
  ORIGINAL_SOURCE = 'ORIGINAL_SOURCE',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export interface ReturnRequest {
  _id: string;
  orderId: any;
  orderItemId: any;
  quantity: number;
  reason: string;
  reasonDescription?: string;
  evidenceMedia?: { url: string; publicId?: string }[];
  status: ReturnRequestStatus;
  refundMethod?: RefundMethod;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  warehouseId?: {
    _id: string;
    name: string;
    location?: { latitude: number; longitude: number };
  };
  sellerId?: any;
  productId: {
    _id: string;
    title: string;
    images: { url: string; publicId: string }[];
    returnPolicy?: ReturnPolicy;
    salePrice?: number;
  };
  variantId: {
    _id: string;
    sku: string;
    attributes: { name: string; value: string }[];
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  adminNote?: string;
  warehouseQcGrade?: string;
  warehouseQcNotes?: string;
  warehouseReceivedAt?: string;
  refundAmount?: number;
  refundTransactionId?: string;
  refundInitiatedAt?: string;
  refundCompletedAt?: string;
  returnId?: string;
  pickedAt?: string;
  returnShipmentId?: string;
  pickupNotes?: string;
  verificationMedia?: { url: string; publicId?: string }[];
  assignedPartnerId?: any;
  assignedAt?: string;
  qcCompletedAt?: string;
  customerOtp?: string;
  partnerAcceptedAt?: string;
  partnerRejectedAt?: string;
  partnerRejectionReason?: string;
  assignmentAttempts?: number;
  reviewedBy?: string;
  qcDoneBy?: string;
  customerOtpVerifiedAt?: string;
  managerOtp?: string;
  managerOtpSentAt?: string;
  managerOtpVerifiedAt?: string;
}

export interface ReturnsResponse {
  data: ReturnRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const returnService = {
  create: async (data: any): Promise<ReturnRequest> => {
    const response = await axiosClient.post<ReturnRequest>('/returns', data);
    return response.data;
  },

  getAll: async (params: any = {}): Promise<ReturnsResponse> => {
    const response = await axiosClient.get<ReturnsResponse>('/returns', { params });
    return response.data;
  },

  getMyReturns: async (params: any = {}): Promise<ReturnsResponse> => {
    const response = await axiosClient.get<ReturnsResponse>('/returns', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ReturnRequest> => {
    const response = await axiosClient.get<ReturnRequest>(`/returns/${id}`);
    return response.data;
  },

  review: async (id: string, data: { approved: boolean; rejectionReason?: string; adminNote?: string }): Promise<ReturnRequest> => {
    if (data.approved) {
      const response = await axiosClient.patch<ReturnRequest>(`/admin/returns/${id}/approve`, { adminNote: data.adminNote });
      return response.data;
    } else {
      const response = await axiosClient.patch<ReturnRequest>(`/admin/returns/${id}/reject`, { rejectionReason: data.rejectionReason, adminNote: data.adminNote });
      return response.data;
    }
  },

  updateQc: async (id: string, data: { warehouseQcGrade: string; warehouseQcNotes?: string }): Promise<ReturnRequest> => {
    const payload = {
      qcGrade: data.warehouseQcGrade,
      qcNotes: data.warehouseQcNotes
    };
    const response = await axiosClient.patch<ReturnRequest>(`/warehouse/returns/${id}/qc`, payload);
    return response.data;
  },

  initiateRefund: async (id: string, data: { refundMethod: RefundMethod; refundAmount: number; refundTransactionId?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/admin/returns/${id}/refund`, data);
    return response.data;
  },

  resolveFailedPickup: async (id: string, data: { approved: boolean; rejectionReason?: string; adminNote?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/warehouse/returns/${id}/resolve-failed-pickup`, data);
    return response.data;
  },

  cancel: async (id: string): Promise<ReturnRequest> => {
    const response = await axiosClient.delete<ReturnRequest>(`/returns/${id}/cancel`);
    return response.data;
  },

  // ─── MANAGER ENDPOINTS ──────────────────────────────────────────────────────

  getAllManager: async (params: any = {}): Promise<ReturnsResponse> => {
    const response = await axiosClient.get<ReturnsResponse>('/warehouse/returns', { params });
    return response.data;
  },

  getManagerStats: async (): Promise<any[]> => {
    const response = await axiosClient.get<any[]>('/warehouse/returns/stats');
    return response.data;
  },

  getWarehouseAnalytics: async (range: string): Promise<any> => {
    const response = await axiosClient.get<any>('/warehouse/returns/analytics', { params: { range } });
    return response.data;
  },

  managerApprove: async (id: string, data: { adminNote?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/warehouse/returns/${id}/approve`, data);
    return response.data;
  },

  managerReject: async (id: string, data: { rejectionReason: string; adminNote?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/warehouse/returns/${id}/reject`, data);
    return response.data;
  },

  managerAssignPartner: async (id: string, data: { partnerId?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/warehouse/returns/${id}/assign-partner`, data);
    return response.data;
  },

  managerResolveFailedPickup: async (id: string, data: { approved: boolean; rejectionReason?: string; adminNote?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/warehouse/returns/${id}/resolve-failed-pickup`, data);
    return response.data;
  },

  sendManagerOtp: async (id: string): Promise<{ message: string }> => {
    const response = await axiosClient.post<{ message: string }>(`/warehouse/returns/${id}/send-manager-otp`);
    return response.data;
  },

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────

  getAllAdmin: async (params: any = {}): Promise<ReturnsResponse> => {
    const response = await axiosClient.get<ReturnsResponse>('/admin/returns', { params });
    return response.data;
  },

  getAdminStats: async (): Promise<any[]> => {
    const response = await axiosClient.get<any[]>('/admin/returns/stats');
    return response.data;
  },

  getGlobalAnalytics: async (range: string): Promise<any> => {
    const response = await axiosClient.get<any>('/admin/returns/analytics/global', { params: { range } });
    return response.data;
  },

  getFinanceReport: async (): Promise<any[]> => {
    const response = await axiosClient.get<any[]>('/admin/returns/finance-report');
    return response.data;
  },

  adminApprove: async (id: string, data: { adminNote?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/admin/returns/${id}/approve`, data);
    return response.data;
  },

  adminReject: async (id: string, data: { rejectionReason: string; adminNote?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/admin/returns/${id}/reject`, data);
    return response.data;
  },

  adminAssignPartner: async (id: string, data: { deliveryPartnerId: string }): Promise<ReturnRequest> => {
    // The controller uses POST /admin/returns/:id/assign-partner
    const response = await axiosClient.post<ReturnRequest>(`/admin/returns/${id}/assign-partner`, data);
    return response.data;
  },

  adminRefund: async (id: string, data: { refundMethod: string; refundAmount: number; refundTransactionId?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/admin/returns/${id}/refund`, data);
    return response.data;
  },

  forceClose: async (id: string, data: { reason: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/admin/returns/${id}/force-close`, data);
    return response.data;
  },
};
