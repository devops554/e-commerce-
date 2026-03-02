import axiosClient from '../lib/axiosClient';
import { Product, ProductVariant } from './product.service';
import { User } from './user.service';

// --- Types ---

export type PaymentMethod = 'razorpay' | 'cod';
export type OrderStatus = 'created' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'failed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ShippingAddress {
    fullName: string;
    phone: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface OrderItem {
    _id?: string;
    product: Product;
    variant: ProductVariant;
    quantity: number;
    price?: number;
    title?: string;
    status?: OrderStatus;
    cancelReason?: string;
}

// Fully-populated item returned by GET /orders/:id
export interface OrderItemDetail {
    _id?: string;
    product: Product;       // full product document
    variant: ProductVariant; // full variant document
    quantity: number;
    price: number;
    title?: string;
    status?: OrderStatus;
    cancelReason?: string;
}

// Fully-populated order returned by GET /orders/:id
export interface OrderDetail extends Omit<Order, 'items'> {
    items: OrderItemDetail[];
    cancelReason?: string;
    cancelBy?: string;
    cancelAt?: string;
    isDeleted?: boolean;
}

export interface Order {
    _id: string;
    orderId: string;
    user: User;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    isStockDeducted?: boolean;
    cancelReason?: string;
    cancelBy?: string;
    cancelAt?: string;
    isDeleted?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderDto {
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
}

export interface VerifyPaymentDto {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface OrdersResponse {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// --- Service ---

export const orderService = {
    create: async (data: CreateOrderDto): Promise<Order> => {
        const response = await axiosClient.post<Order>('/orders', data);
        return response.data;
    },

    getMyOrders: async (params?: { page?: number; limit?: number }): Promise<OrdersResponse> => {
        const response = await axiosClient.get<OrdersResponse>('/orders/my', { params });
        return response.data;
    },

    getAllOrders: async (params: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        userId?: string;
    }): Promise<OrdersResponse> => {
        const response = await axiosClient.get<OrdersResponse>('/orders', { params });
        return response.data;
    },

    verifyPayment: (data: VerifyPaymentDto) =>
        axiosClient.post('/orders/verify-payment', data),

    updateStatus: (id: string, status: OrderStatus) =>
        axiosClient.patch(`/orders/${id}/status`, { status }),

    cancelOrder: (id: string, reason: string) =>
        axiosClient.post(`/orders/${id}/cancel`, { reason }),

    cancelOrderItem: (id: string, variantId: string, reason: string) =>
        axiosClient.post(`/orders/${id}/cancel-item`, { variantId, reason }),

    getById: async (id: string): Promise<OrderDetail> => {
        const response = await axiosClient.get<OrderDetail>(`/orders/${id}`);
        return response.data;
    },
};
