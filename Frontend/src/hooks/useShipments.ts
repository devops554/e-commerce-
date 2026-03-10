import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shipmentService, CreateShipmentDto, AssignShipmentDto, UpdateShipmentStatusDto } from '@/services/shipment.service';

export function useShipments(params: { page?: number; limit?: number; warehouseId?: string; deliveryPartnerId?: string; orderId?: string; status?: string } = {}) {
    return useQuery({
        queryKey: ['shipments', params],
        queryFn: () => shipmentService.getAll(params),
    });
}

export function useShipmentById(id: string) {
    return useQuery({
        queryKey: ['shipment', id],
        queryFn: () => shipmentService.getById(id),
        enabled: !!id,
    });
}

export function useCreateShipment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateShipmentDto) => shipmentService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
        },
    });
}

export function useAssignShipment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: AssignShipmentDto }) =>
            shipmentService.assignPartner(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['shipment', data._id] });
            queryClient.invalidateQueries({ queryKey: ['delivery-partner'] }); // Invalidate partner to refresh active shipments count if any
        },
    });
}

export function useUpdateShipmentStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateShipmentStatusDto }) =>
            shipmentService.updateStatus(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['shipment', data._id] });
        },
    });
}

export function useTrackingHistory(id: string) {
    return useQuery({
        queryKey: ['shipment-tracking', id],
        queryFn: () => shipmentService.getTrackingHistory(id),
        enabled: !!id,
    });
}
