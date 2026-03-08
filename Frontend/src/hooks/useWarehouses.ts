import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService, type Warehouse } from '../services/warehouse.service';
export type { Warehouse };
import { toast } from 'sonner';

export const useWarehouses = () => {
    return useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.getAll(),
    });
};

export const useWarehouse = (id: string) => {
    return useQuery({
        queryKey: ['warehouse', id],
        queryFn: () => warehouseService.getOne(id),
        enabled: !!id,
    });
};

export const useWarehouseActions = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Partial<Warehouse>) => warehouseService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            toast.success('Warehouse created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create warehouse');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Warehouse> }) =>
            warehouseService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['warehouse'] });
            toast.success('Warehouse updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update warehouse');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => warehouseService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            toast.success('Warehouse deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete warehouse');
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: (id: string) => warehouseService.setDefault(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            toast.success('Default warehouse updated');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to set default warehouse');
        },
    });

    return {
        createWarehouse: createMutation.mutateAsync,
        updateWarehouse: updateMutation.mutateAsync,
        deleteWarehouse: deleteMutation.mutateAsync,
        setDefaultWarehouse: setDefaultMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isSettingDefault: setDefaultMutation.isPending,
    };
};

export const useWarehouseByManager = (managerId: string) => {
    return useQuery({
        queryKey: ['warehouse-by-manager', managerId],
        queryFn: () => warehouseService.getWarehouseByManager(managerId),
        enabled: !!managerId,
    });
};


export const useManagerWarehouse = () => {
    return useQuery({
        queryKey: ['manager-warehouse'],
        queryFn: () => warehouseService.getManagerWarehouse(),
    });
};

