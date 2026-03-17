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
    const response = await axiosClient.post<ReturnRequest>('/return-requests', data);
    return response.data;
  },

  getAll: async (params: any = {}): Promise<ReturnsResponse> => {
    const response = await axiosClient.get<ReturnsResponse>('/return-requests', { params });
    return response.data;
  },

  getMyReturns: async (params: any = {}): Promise<ReturnsResponse> => {
    const response = await axiosClient.get<ReturnsResponse>('/return-requests/my', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ReturnRequest> => {
    const response = await axiosClient.get<ReturnRequest>(`/return-requests/${id}`);
    return response.data;
  },

  review: async (id: string, data: { approved: boolean; rejectionReason?: string; adminNote?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/return-requests/${id}/review`, data);
    return response.data;
  },

  updateQc: async (id: string, data: { warehouseQcGrade: string; warehouseQcNotes?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/return-requests/${id}/warehouse-qc`, data);
    return response.data;
  },

  initiateRefund: async (id: string, data: { refundMethod: RefundMethod; refundAmount: number; refundTransactionId?: string }): Promise<ReturnRequest> => {
    const response = await axiosClient.patch<ReturnRequest>(`/return-requests/${id}/refund`, data);
    return response.data;
  },
};
