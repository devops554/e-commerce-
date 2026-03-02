import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productTypeService, ProductType } from '../services/productType.service';
import { toast } from 'sonner';

export const useProductTypes = (params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
} = {}) => {
    return useQuery({
        queryKey: ['product-types', params],
        queryFn: () => productTypeService.getAll(params),
    });
};

export const useProductType = (idOrSlug: string) => {
    return useQuery({
        queryKey: ['product-type', idOrSlug],
        queryFn: () => productTypeService.getOne(idOrSlug),
        enabled: !!idOrSlug,
    });
};

export const useProductTypeActions = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Partial<ProductType>) => productTypeService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-types'] });
            toast.success('Product Type created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create product type');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ProductType> }) =>
            productTypeService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-types'] });
            queryClient.invalidateQueries({ queryKey: ['product-type'] });
            toast.success('Product Type updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update product type');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => productTypeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-types'] });
            toast.success('Product Type deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete product type');
        },
    });

    return {
        createProductType: createMutation.mutateAsync,
        updateProductType: updateMutation.mutateAsync,
        deleteProductType: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};
