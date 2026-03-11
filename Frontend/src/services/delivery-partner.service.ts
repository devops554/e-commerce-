import axiosClient from '../lib/axiosClient';
import { Warehouse } from './warehouse.service';

export interface DeliveryPartner {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    vehicleType: 'BIKE' | 'SCOOTER' | 'CAR' | 'VAN';
    vehicleNumber?: string;
    licenseNumber?: string;
    warehouseIds?: (string | Warehouse)[];
    bloodGroup?: string;
    permanentAddress?: {
        addressLine?: string;
        city?: string;
        state?: string;
        country: string;
        pincode?: string;
    };
    currentAddress?: {
        addressLine?: string;
        city?: string;
        state?: string;
        country: string;
        pincode?: string;
    };
    availabilityStatus: 'ONLINE' | 'OFFLINE' | 'BUSY';
    accountStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    currentLocation?: {
        latitude: number;
        longitude: number;
        lastUpdated: string;
    };
    totalDeliveries: number;
    rating: number;
    documents?: {
        aadhaarNumber?: string;
        aadhaarImage?: string;
        panNumber?: string;
        panImage?: string;
        drivingLicenseImage?: string;
    };
    createdAt: string;
    updatedAt: string;
    blockReason?: string;
}

export interface RegisterPartnerDto {
    name: string;
    phone: string;
    email?: string;
    password: string;
    vehicleType?: string;
    vehicleNumber?: string;
    licenseNumber?: string;
    warehouseIds?: string[];
    bloodGroup?: string;
    permanentAddress?: {
        addressLine?: string;
        city?: string;
        state?: string;
        country: string;
        pincode?: string;
    };
    currentAddress?: {
        addressLine?: string;
        city?: string;
        state?: string;
        country: string;
        pincode?: string;
    };
}

export interface PartnersResponse {
    data: DeliveryPartner[];
    total: number;
    page: number;
    totalPages: number;
}

export const deliveryPartnerService = {
    register: async (data: RegisterPartnerDto): Promise<DeliveryPartner> => {
        const response = await axiosClient.post<DeliveryPartner>('/delivery-partners/register', data);
        return response.data;
    },

    getAll: async (params: { page?: number; limit?: number; warehouseId?: string }): Promise<PartnersResponse> => {
        const response = await axiosClient.get<PartnersResponse>('/delivery-partners', { params });
        return response.data;
    },

    getById: async (id: string): Promise<DeliveryPartner> => {
        const response = await axiosClient.get<DeliveryPartner>(`/delivery-partners/${id}`);
        return response.data;
    },

    updateStatus: async (id: string, status: { accountStatus?: string; availabilityStatus?: string; blockReason?: string; documents?: any }): Promise<DeliveryPartner> => {
        const response = await axiosClient.patch<DeliveryPartner>(`/delivery-partners/${id}/status`, status);
        return response.data;
    },

    update: async (id: string, data: Partial<RegisterPartnerDto>): Promise<DeliveryPartner> => {
        const response = await axiosClient.patch<DeliveryPartner>(`/delivery-partners/${id}`, data);
        return response.data;
    },

    remove: async (id: string): Promise<void> => {
        await axiosClient.delete(`/delivery-partners/${id}`);
    },
};
