import axiosClient from '../lib/axiosClient';
import { DeliveryPartner } from './delivery-partner.service';

export enum ShipmentStatus {
    ORDER_PLACED = 'ORDER_PLACED',
    CONFIRMED = 'CONFIRMED',
    PACKED = 'PACKED',
    ASSIGNED_TO_DELIVERY = 'ASSIGNED_TO_DELIVERY',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    FAILED_DELIVERY = 'FAILED_DELIVERY',
    RETURNED = 'RETURNED',
    CANCELLED = 'CANCELLED'
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
    createdAt: string;
    updatedAt: string;
}

export interface CreateShipmentDto {
    orderId: string;
    warehouseId: string;
    deliveryPartnerId?: string;
}

export interface AssignShipmentDto {
    deliveryPartnerId: string;
}

export interface UpdateShipmentStatusDto {
    status: ShipmentStatus;
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

    getAll: async (params: { page?: number; limit?: number; warehouseId?: string, deliveryPartnerId?: string; status?: string }) => {
        const response = await axiosClient.get('/shipments', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Shipment> => {
        const response = await axiosClient.get<Shipment>(`/shipments/${id}`);
        return response.data;
    },

    getTrackingHistory: async (id: string) => {
        const response = await axiosClient.get(`/shipments/${id}/tracking`);
        return response.data;
    }
};
