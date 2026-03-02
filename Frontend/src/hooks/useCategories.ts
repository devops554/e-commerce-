import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category } from '../services/category.service';
import { toast } from 'sonner';

export const useCategories = (params: {
    page?: number;
    limit?: number;
    search?: string;
    productType?: string;
    parentId?: string | null;
    isActive?: boolean;
}) => {
    return useQuery({
        queryKey: ['categories', params],
        queryFn: () => categoryService.getAll(params),
    });
};

export const useSubcategories = (parentId: string | null | undefined, params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}) => {
    return useQuery({
        queryKey: ['subcategories', parentId, params],
        queryFn: () => {
            if (!parentId) throw new Error('parentId is required');
            return categoryService.getSubcategories(parentId, params);
        },
        enabled: !!parentId && parentId !== 'pending',
    });
};

export const useCategory = (idOrSlug: string) => {
    return useQuery({
        queryKey: ['category', idOrSlug],
        queryFn: () => categoryService.getOne(idOrSlug),
        enabled: !!idOrSlug,
    });
};

export const useCategoryActions = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Partial<Category>) => categoryService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['subcategories'] });
            toast.success('Category created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create category');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
            categoryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['subcategories'] });
            queryClient.invalidateQueries({ queryKey: ['category'] });
            toast.success('Category updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update category');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => categoryService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['subcategories'] });
            queryClient.invalidateQueries({ queryKey: ['category'] });
            toast.success('Category deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        },
    });

    return {
        createCategory: createMutation.mutateAsync,
        updateCategory: updateMutation.mutateAsync,
        deleteCategory: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};
