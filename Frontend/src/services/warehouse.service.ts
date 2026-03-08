import axiosClient from '../lib/axiosClient';

export interface Warehouse {
    _id: string;
    code: string;
    name: string;
    managerId?: string | {
        _id: string;
        name: string;
        email: string;
    };
    contact: {
        contactPerson: string;
        phone: string;
        email: string;
    };
    address: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    };
    location: {
        latitude: number;
        longitude: number;
    };
    capacity: {
        totalCapacity: number;
        usedCapacity: number;
    };
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    isPickupAvailable: boolean;
    isDeliveryAvailable: boolean;
    isDefaultWarehouse: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export const warehouseService = {
    getAll: async () => {
        const response = await axiosClient.get('/warehouses');
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await axiosClient.get(`/warehouses/${id}`);
        return response.data;
    },

    create: async (data: Partial<Warehouse>) => {
        const response = await axiosClient.post('/warehouses', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Warehouse>) => {
        const response = await axiosClient.put(`/warehouses/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosClient.delete(`/warehouses/${id}`);
        return response.data;
    },

    setDefault: async (id: string) => {
        const response = await axiosClient.patch(`/warehouses/${id}/default`);
        return response.data;
    },

    getWarehouseByManager: async (managerId: string): Promise<Warehouse> => {
        const response = await axiosClient.get<Warehouse>(`/warehouses/manager/${managerId}`);
        return response.data;
    },
    getManagerWarehouse: async (): Promise<Warehouse> => {
        const response = await axiosClient.get<Warehouse>(`/warehouses/manager`);
        return response.data;
    },
};

