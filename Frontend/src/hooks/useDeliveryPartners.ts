import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deliveryPartnerService, RegisterPartnerDto } from '@/services/delivery-partner.service';

export function useDeliveryPartners(params: { page?: number; limit?: number; warehouseId?: string } = {}) {
    return useQuery({
        queryKey: ['delivery-partners', params],
        queryFn: () => deliveryPartnerService.getAll(params),
    });
}

export function useDeliveryPartnerById(id: string) {
    return useQuery({
        queryKey: ['delivery-partner', id],
        queryFn: () => deliveryPartnerService.getById(id),
        enabled: !!id,
    });
}

export function useRegisterPartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: RegisterPartnerDto) => deliveryPartnerService.register(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
        },
    });
}

export function useUpdatePartnerStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: { accountStatus?: string; availabilityStatus?: string } }) =>
            deliveryPartnerService.updateStatus(id, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
            queryClient.invalidateQueries({ queryKey: ['delivery-partner', data._id] });
        },
    });
}

export function useDeletePartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deliveryPartnerService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
        },
    });
}
