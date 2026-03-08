import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, AdjustStockDto, TransferStockDto } from "@/services/inventory.service";
import { toast } from "sonner";

export const useWarehouseInventory = (warehouseId: string) => {
    return useQuery({
        queryKey: ['warehouse-inventory', warehouseId],
        queryFn: () => inventoryService.getWarehouseInventory(warehouseId),
        enabled: !!warehouseId,
    });
};

export const useAdjustStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AdjustStockDto) => inventoryService.adjustStock(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['warehouse-inventory', variables.warehouseId] });
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
            toast.success("Stock transferred successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to transfer stock");
        }
    });
};

export const useStockHistory = (warehouseId: string | undefined) => {
    return useQuery({
        queryKey: ['stock-history', warehouseId],
        queryFn: () => inventoryService.getHistory(warehouseId as string),
        enabled: !!warehouseId,
    });
};

export const useManagerWarehouseInventory = () => {
    return useQuery({
        queryKey: ['manager-warehouse-inventory'],
        queryFn: () => inventoryService.getManagerWarehouseInventory(),
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
