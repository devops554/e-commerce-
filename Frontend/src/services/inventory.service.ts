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

export const inventoryService = {
    getWarehouseInventory: async (warehouseId: string): Promise<InventoryItem[]> => {
        const response = await axiosClient.get<InventoryItem[]>(`/inventory/warehouse/${warehouseId}`);
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

    getHistory: async (warehouseId: string): Promise<any[]> => {
        const response = await axiosClient.get<any[]>(`/inventory/warehouse/${warehouseId}/history`);
        return response.data;
    },

    // Manager-scoped: receive stock into their assigned warehouse
    managerReceiveStock: async (data: { variantId: string; amount: number; source?: string }): Promise<InventoryItem> => {
        const response = await axiosClient.post<InventoryItem>('/inventory/manager/receive', data);
        return response.data;
    },

    // Manager-scoped: get their own warehouse inventory
    getManagerWarehouseInventory: async (): Promise<InventoryItem[]> => {
        const response = await axiosClient.get<InventoryItem[]>('/inventory/manager/my-warehouse');
        return response.data;
    },
};

