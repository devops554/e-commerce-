import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, AdjustStockDto, TransferStockDto } from "@/services/inventory.service";
import { toast } from "sonner";

export const useWarehouseInventory = (warehouseId: string, params: { page?: number; limit?: number; search?: string } = {}) => {
    return useQuery({
        queryKey: ['warehouse-inventory', warehouseId, params],
        queryFn: () => inventoryService.getWarehouseInventory(warehouseId, params),
        enabled: !!warehouseId,
    });
};

export const useAdjustStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AdjustStockDto) => inventoryService.adjustStock(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['warehouse-inventory', variables.warehouseId] });
            queryClient.invalidateQueries({ queryKey: ['manager-warehouse-inventory'] });
            toast.success("Stock adjusted successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to adjust stock");
        }
    });
};

export const useTransferStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TransferStockDto) => inventoryService.transferStock(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['warehouse-inventory', variables.fromWarehouseId] });
            queryClient.invalidateQueries({ queryKey: ['warehouse-inventory', variables.toWarehouseId] });
            queryClient.invalidateQueries({ queryKey: ['manager-warehouse-inventory'] });
            toast.success("Stock transferred successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to transfer stock");
        }
    });
};

export const useStockHistory = (warehouseId: string | undefined, params: { page?: number; limit?: number; search?: string; productId?: string } = {}) => {
    return useQuery({
        queryKey: ['stock-history', warehouseId, params],
        queryFn: () => inventoryService.getHistory(warehouseId as string, params),
        enabled: !!warehouseId,
    });
};

export const useStockHistoryStats = (warehouseId: string | undefined, params: { range?: string; productId?: string } = {}) => {
    return useQuery({
        queryKey: ['stock-history-stats', warehouseId, params],
        queryFn: () => inventoryService.getHistoryStats(warehouseId as string, params),
        enabled: !!warehouseId,
    });
};

export const useManagerWarehouseInventory = (params: { page?: number; limit?: number; search?: string } = {}) => {
    return useQuery({
        queryKey: ['manager-warehouse-inventory', params],
        queryFn: () => inventoryService.getManagerWarehouseInventory(params),
    });
};

export const useManagerReceiveStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { variantId: string; amount: number; source?: string }) =>
            inventoryService.managerReceiveStock(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manager-warehouse-inventory'] });
            queryClient.invalidateQueries({ queryKey: ['warehouse-inventory'] });
            toast.success('Stock received successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to receive stock');
        },
    });
};

export const useAdminReceiveStock = (warehouseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { variantId: string; amount: number; source?: string }) =>
            inventoryService.adjustStock({ ...data, warehouseId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouse-inventory', warehouseId] });
            toast.success('Stock received successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to receive stock');
        },
    });
};
