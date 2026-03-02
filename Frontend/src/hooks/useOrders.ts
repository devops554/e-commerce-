"use client"

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { orderService, CreateOrderDto, VerifyPaymentDto } from '../services/order.service';
import { clearCart } from '@/store/slices/cartSlice';

// --- useMyOrders: fetch authenticated user's orders ---
export const useMyOrders = (params?: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['orders', 'my', params],
        queryFn: () => orderService.getMyOrders(params),
    });
};

// --- useAllOrders: admin - fetch all orders with filters ---
export const useAllOrders = (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    // userId?: string;
}) => {
    return useQuery({
        queryKey: ['orders', 'all', params],
        queryFn: () => orderService.getAllOrders(params),
    });
};

// --- useCreateOrder mutation hook ---

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: (data: CreateOrderDto) => orderService.create(data),
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to place order');
        },
    });
};

// --- useVerifyPayment mutation hook ---

export const useVerifyPayment = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (data: VerifyPaymentDto) => orderService.verifyPayment(data),
        onSuccess: () => {
            toast.success('Payment successful! Your order is confirmed.');
            dispatch(clearCart());
        },
        onError: () => {
            toast.error('Payment verification failed.');
        },
    });
};

export const useOrderById = (id: string) => {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => orderService.getById(id),
    });
};

// --- usePlaceOrder: high-level hook that orchestrates the full checkout flow ---

export function usePlaceOrder() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const createOrder = useCreateOrder();
    const verifyPayment = useVerifyPayment();

    const loadRazorpayScript = (): Promise<boolean> =>
        new Promise((resolve) => {
            if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const placeOrder = async (
        orderData: CreateOrderDto,
        userData: { fullName: string; email?: string; phone?: string }
    ) => {
        setLoading(true);
        try {
            // 1. Create the order on the backend
            const order = await createOrder.mutateAsync(orderData);

            if (orderData.paymentMethod === 'razorpay') {
                // 2. Load Razorpay SDK
                const loaded = await loadRazorpayScript();
                if (!loaded) {
                    toast.error('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }

                // 3. Open Razorpay checkout
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.totalAmount * 100,
                    currency: 'INR',
                    name: 'BivhaShop.',
                    description: 'Order Payment',
                    order_id: order.razorpayOrderId,
                    handler: async (response: any) => {
                        await verifyPayment.mutateAsync({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        router.push('/orders');
                    },
                    prefill: {
                        name: userData.fullName,
                        email: userData.email,
                        contact: userData.phone,
                    },
                    theme: { color: '#15803d' },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } else {
                // COD flow
                toast.success('Order placed successfully (Cash on Delivery)!');
                dispatch(clearCart());
                router.push('/my-orders');
            }
        } catch {
            // errors are handled in the mutations themselves
        } finally {
            setLoading(false);
        }
    };

    return { placeOrder, loading };
}


