import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, Order, OrderStatus, CreateOrderDto } from "@/services/order.service";
import { toast } from "sonner";
import { useState } from "react";
import { useRazorpay } from "./useRazorpay";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearCart } from "@/store/slices/cartSlice";
import { UseQueryResult } from "@tanstack/react-query";
import { OrdersResponse } from "@/services/order.service";

export const useWarehouseOrders = (warehouseId: string, params: { page?: number; limit?: number; search?: string } = {}) => {
    return useQuery({
        queryKey: ['warehouse-orders', warehouseId, params],
        queryFn: () => orderService.getWarehouseOrders(warehouseId, params),
        enabled: !!warehouseId,
    });
};

export const useDispatchItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, variantId, warehouseId }: { orderId: string, variantId: string, warehouseId: string }) =>
            orderService.dispatchItem(orderId, variantId, warehouseId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['warehouse-orders', variables.warehouseId] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Item confirmed successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to confirm item");
        }
    });
};

export const useBulkDispatchItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, warehouseId }: { orderId: string, warehouseId: string }) =>
            orderService.confirmBulkItemDispatch(orderId, warehouseId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['warehouse-orders', variables.warehouseId] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("All items confirmed successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to confirm items");
        }
    });
};

export const useCancelOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
            orderService.cancelOrder(orderId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['warehouse-orders'] });
            toast.success("Order cancelled successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to cancel order");
        }
    });
};

export const useReassignWarehouse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, oldWarehouseId, newWarehouseId }: { orderId: string, oldWarehouseId: string, newWarehouseId: string }) =>
            orderService.reassignWarehouse(orderId, oldWarehouseId, newWarehouseId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
            toast.success("Order reassigned successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to reassign order");
        }
    });
};

export const useOrders = (params: any = {}): UseQueryResult<OrdersResponse, Error> => {
    return useQuery({
        queryKey: ['orders', params],
        queryFn: () => orderService.getAllOrders(params),
    });
};

export const useOrderById = (orderId: string) => {
    return useQuery({
        queryKey: ['orders', orderId],
        queryFn: () => orderService.getById(orderId),
        enabled: !!orderId,
    });
};

export const useMyOrders = (params: any = {}) => {
    return useQuery({
        queryKey: ['my-orders', params],
        queryFn: () => orderService.getMyOrders(params),
    });
};

export const usePlaceOrder = () => {
    const [loading, setLoading] = useState(false);
    const { initPayment } = useRazorpay();
    const router = useRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const placeOrder = async (orderData: CreateOrderDto, userData: any) => {
        setLoading(true);
        try {
            if (orderData.paymentMethod === 'razorpay') {
                await initPayment(orderData, userData);
            } else {
                await orderService.create(orderData);

                // Clear cart from Redux + localStorage
                dispatch(clearCart());

                // Remove remote cart from React Query cache so useCart
                // doesn't re-populate the Redux store before redirect
                queryClient.removeQueries({ queryKey: ['cart'] });

                toast.success("Order placed successfully");
                router.push("/my-orders");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    return { placeOrder, loading };
};

export const useOrderAnalytics = (warehouseId: string, range: string) => {
    return useQuery({
        queryKey: ['order-analytics', warehouseId, range],
        queryFn: () => orderService.getWarehouseAnalytics(warehouseId, range),
        enabled: !!warehouseId,
    });
};

export const useWarehouseOrderHistory = (warehouseId: string, params: { page?: number; limit?: number; search?: string } = {}) => {
    return useQuery({
        queryKey: ['warehouse-history', warehouseId, params],
        queryFn: () => orderService.getWarehouseHistory(warehouseId, params),
        enabled: !!warehouseId,
    });
};

export const useGlobalOrderAnalytics = (range: string) => {
    return useQuery({
        queryKey: ['global-order-analytics', range],
        queryFn: () => orderService.getGlobalAnalytics(range),
    });
};