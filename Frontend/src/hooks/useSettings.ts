"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { toast } from 'sonner';

export const useStoreConfig = () => {
    return useQuery({
        queryKey: ['settings', 'store-config'],
        queryFn: () => settingsService.getStoreConfig(),
    });
};

export const useSettingsActions = () => {
    const queryClient = useQueryClient();

    const updateStoreConfigMutation = useMutation({
        mutationFn: (data: any) => settingsService.updateStoreConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Store configuration updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update store configuration');
        },
    });

    return {
        updateStoreConfig: updateStoreConfigMutation.mutateAsync,
        isUpdating: updateStoreConfigMutation.isPending,
    };
};
