import axiosClient from '../lib/axiosClient';

export interface InventoryItem {
    _id: string;
    product: any;
    variant: any;
    warehouse: string;
    quantity: number;
    totalReceived: number;
    totalDispatched: number;
    reserved: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdjustStockDto {
    variantId: string;
    warehouseId: string;
    amount: number;
    source?: string;
}

export interface TransferStockDto {
    variantId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    amount: number;
    source?: string;
}

export interface PaginatedInventory {
    items: InventoryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedHistory {
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const inventoryService = {
    getWarehouseInventory: async (warehouseId: string, params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedInventory> => {
        const response = await axiosClient.get<PaginatedInventory>(`/inventory/warehouse/${warehouseId}`, { params });
        return response.data;
    },

    adjustStock: async (data: AdjustStockDto): Promise<InventoryItem> => {
        const response = await axiosClient.post<InventoryItem>('/inventory/adjust', data);
        return response.data;
    },

    transferStock: async (data: TransferStockDto): Promise<any> => {
        const response = await axiosClient.post('/inventory/transfer', data);
        return response.data;
    },

    getHistory: async (warehouseId: string, params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedHistory> => {
        const response = await axiosClient.get<PaginatedHistory>(`/inventory/warehouse/${warehouseId}/history`, { params });
        return response.data;
    },

    // Manager-scoped: receive stock into their assigned warehouse
    managerReceiveStock: async (data: { variantId: string; amount: number; source?: string }): Promise<InventoryItem> => {
        const response = await axiosClient.post<InventoryItem>('/inventory/manager/receive', data);
        return response.data;
    },

    // Manager-scoped: get their own warehouse inventory
    getManagerWarehouseInventory: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedInventory> => {
        const response = await axiosClient.get<PaginatedInventory>('/inventory/manager/my-warehouse', { params });
        return response.data;
    },
};

