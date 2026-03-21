import axiosClient from '../lib/axiosClient';
import { DeliveryPartner } from './delivery-partner.service';

export enum ShipmentStatus {
    ORDER_PLACED = 'ORDER_PLACED',
    CONFIRMED = 'CONFIRMED',
    PACKED = 'PACKED',
    ASSIGNED_TO_DELIVERY = 'ASSIGNED_TO_DELIVERY',
    ACCEPTED = 'ACCEPTED',
    PICKED_UP = 'PICKED_UP',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    FAILED_DELIVERY = 'FAILED_DELIVERY',
    RETURNED = 'RETURNED',
    CANCELLED = 'CANCELLED',
    FAILED_PICKUP = 'FAILED_PICKUP'
}

export interface Shipment {
    _id: string;
    orderId: any;
    warehouseId: any;
    deliveryPartnerId: string | DeliveryPartner;
    trackingNumber: string;
    status: ShipmentStatus;
    assignedAt?: string;
    pickedAt?: string;
    deliveredAt?: string;
    pickupNotes?: string;
    verificationMedia?: { url: string; publicId?: string }[];
    type?: 'FORWARD' | 'REVERSE';
    createdAt: string;
    updatedAt: string;
}

export interface CreateShipmentDto {
    orderId: string;
    warehouseId: string;
    deliveryPartnerId?: string;
    type?: 'FORWARD' | 'REVERSE';
}

export interface AssignShipmentDto {
    deliveryPartnerId: string;
}

export interface UpdateShipmentStatusDto {
    status: ShipmentStatus;
}

export interface ShipmentsResponse {
    data: Shipment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const shipmentService = {
    create: async (data: CreateShipmentDto): Promise<Shipment> => {
        const response = await axiosClient.post<Shipment>('/shipments', data);
        return response.data;
    },

    assignPartner: async (id: string, data: AssignShipmentDto): Promise<Shipment> => {
        const response = await axiosClient.patch<Shipment>(`/shipments/${id}/assign`, data);
        return response.data;
    },

    updateStatus: async (id: string, data: UpdateShipmentStatusDto): Promise<Shipment> => {
        const response = await axiosClient.patch<Shipment>(`/shipments/${id}/status/admin`, data);
        return response.data;
    },

    getAll: async (params: { page?: number; limit?: number; warehouseId?: string, deliveryPartnerId?: string; status?: string }): Promise<ShipmentsResponse> => {
        const response = await axiosClient.get<ShipmentsResponse>('/shipments', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Shipment> => {
        const response = await axiosClient.get<Shipment>(`/shipments/${id}`);
        return response.data;
    },

    getTrackingHistory: async (id: string): Promise<any> => {
        const response = await axiosClient.get(`/shipments/${id}/tracking`);
        return response.data;
    },

    requestPickupOtp: async (id: string): Promise<any> => {
        const response = await axiosClient.post(`/shipments/${id}/pickup-otp`);
        return response.data;
    },

    verifyPickupOtp: async (id: string, otp: string): Promise<Shipment> => {
        const response = await axiosClient.patch<Shipment>(`/shipments/${id}/verify-pickup`, { otp });
        return response.data;
    },

    requestDeliveryOtp: async (id: string): Promise<any> => {
        const response = await axiosClient.post(`/shipments/${id}/delivery-otp`);
        return response.data;
    },

    verifyDeliveryOtp: async (id: string, otp: string): Promise<Shipment> => {
        const response = await axiosClient.patch<Shipment>(`/shipments/${id}/verify-delivery`, { otp });
        return response.data;
    }
};
