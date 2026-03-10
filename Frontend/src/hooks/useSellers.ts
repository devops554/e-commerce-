"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerService } from '@/services/seller.service';
import { toast } from 'sonner';

// --- useAllSellers: admin - fetch all sellers ---
export const useAllSellers = () => {
    return useQuery({
        queryKey: ['sellers', 'all'],
        queryFn: () => sellerService.getAllSellers(),
    });
};

// --- useSellerBySlug: admin - fetch a specific seller's profile ---
export const useSellerBySlug = (slug: string) => {
    return useQuery({
        queryKey: ['sellers', 'slug', slug],
        queryFn: () => sellerService.getSellerBySlug(slug),
        enabled: !!slug,
    });
};

// --- useUpdateSellerStatus: admin - approve or reject a seller ---
export const useUpdateSellerStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            sellerService.updateStatus(id, status),
        onSuccess: (_, variables) => {
            toast.success(`Seller registration ${variables.status} successfully`);
            queryClient.invalidateQueries({ queryKey: ['sellers'] });
        },
        onError: () => {
            toast.error('Failed to update seller status');
        },
    });
};

// --- useSellersActions: admin/seller - registration and management ---
export const useSellersActions = () => {
    const queryClient = useQueryClient();

    const registerSellerMutation = useMutation({
        mutationFn: (data: any) => sellerService.register(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sellers'] });
            toast.success('Seller registered successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to register seller');
        },
    });

    return {
        registerSeller: registerSellerMutation.mutateAsync,
        isRegistering: registerSellerMutation.isPending,
    };
};
