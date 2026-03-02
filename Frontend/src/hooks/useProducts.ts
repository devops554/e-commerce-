import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, Product, ProductVariant } from '../services/product.service';
import { toast } from 'sonner';

export const useProducts = (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    subCategory?: string;
    brand?: string;
    productType?: string;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
}, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => productService.getAll(params),
        enabled
    });
};

export const useSearchProducts = (params: {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
}, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['products', 'search', params],
        // Do NOT pass isActive — backend uses it to also filter products with no active variants,
        // which causes products that are in autocomplete to silently disappear from results.
        // Product-level active/inactive is shown via the card UI instead.
        queryFn: () => productService.getAll({ ...params }),
        enabled: enabled && !!params.search,
        staleTime: 1000 * 30,
    });
};

export const useProduct = (idOrSlug: string) => {
    return useQuery({
        queryKey: ['product', idOrSlug],
        queryFn: () => productService.getOne(idOrSlug),
        enabled: !!idOrSlug,
    });
};

export const useProductActions = () => {
    const queryClient = useQueryClient();

    const createProductMutation = useMutation({
        mutationFn: (data: any) => productService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create product');
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            productService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
            toast.success('Product updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update product');
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: string) => productService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        },
    });

    return {
        createProduct: createProductMutation.mutateAsync,
        updateProduct: updateProductMutation.mutateAsync,
        deleteProduct: deleteProductMutation.mutateAsync,
        isCreating: createProductMutation.isPending,
        isUpdating: updateProductMutation.isPending,
        isDeleting: deleteProductMutation.isPending,
    };
};

export const useProductVariantActions = () => {
    const queryClient = useQueryClient();

    const createVariantMutation = useMutation({
        mutationFn: (data: any) => productService.createVariant(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product'] });
            toast.success('Variant added successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add variant');
        },
    });

    const updateVariantMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            productService.updateVariant(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product'] });
            toast.success('Variant updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update variant');
        },
    });

    const deleteVariantMutation = useMutation({
        mutationFn: ({ id, productId }: { id: string; productId: string }) =>
            productService.deleteVariant(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product'] });
            toast.success('Variant deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete variant');
        },
    });

    return {
        createVariant: createVariantMutation.mutateAsync,
        updateVariant: updateVariantMutation.mutateAsync,
        deleteVariant: deleteVariantMutation.mutateAsync,
        isCreatingVariant: createVariantMutation.isPending,
        isUpdatingVariant: updateVariantMutation.isPending,
        isDeletingVariant: deleteVariantMutation.isPending,
    };
};
