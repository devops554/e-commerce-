import axiosClient from '../lib/axiosClient';
import { Product, ProductVariant } from './product.service';
import { User } from './user.service';

// --- Types ---

export type PaymentMethod = 'razorpay' | 'cod';
export type OrderStatus = 'created' | 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'failed' | 'cancelled' | 'returned' | 'failed_delivery' | 'PENDING_REASSIGNMENT';
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
    latitude?: number;
    longitude?: number;
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
    warehouse?: any;
}

// Fully-populated item returned by GET /orders/:id
export interface OrderItemDetail {
    _id?: string;
    product: Product;       // full product document
    variant: ProductVariant; // full variant document
    quantity: number;
    price: number;
    title?: string;
    image?: string;
    status?: OrderStatus;
    cancelReason?: string;
    warehouse?: any;
    // GST snapshot
    hsnCode?: string;
    gstRate?: number;
    basePrice?: number;
    gstAmountPerUnit?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    lineTotal?: number;
    lineTaxableValue?: number;
    lineCgst?: number;
    lineSgst?: number;
    lineIgst?: number;
    lineTotalGst?: number;
}

export interface OrderHistory {
    actor: User | string;
    actorRole: string;
    action: string;
    status: OrderStatus;
    note?: string;
    timestamp: string;
}

// Fully-populated order returned by GET /orders/:id
export interface OrderDetail extends Omit<Order, 'items'> {
    items: OrderItemDetail[];
    cancelReason?: string;
    cancelBy?: string;
    cancelAt?: string;
    isDeleted?: boolean;
    history?: OrderHistory[];
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
    history?: OrderHistory[];
    // GST totals
    subTotal?: number;
    totalCgst?: number;
    totalSgst?: number;
    totalIgst?: number;
    totalGstAmount?: number;
    shippingCharge?: number;
    isInterState?: boolean;
    invoiceNumber?: string;
    invoiceDate?: string;
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

export interface InvoiceItem {
    title: string;
    sku?: string;
    attributes?: { name: string; value: string }[];
    hsnCode?: string;
    thumbnail?: string;
    gstRate: number;
    quantity: number;
    unitPrice: number;
    basePrice: number;
    cgst: number;
    sgst: number;
    igst: number;
    gstAmountPerUnit: number;
    lineTotal: number;
    lineTaxableValue: number;
    lineCgst: number;
    lineSgst: number;
    lineIgst: number;
    lineTotalGst: number;
}

export interface InvoiceData {
    seller: {
        legalName: string;
        gstin: string;
        stateCode: string;
        address: string;
        email: string;
        phone: string;
    };
    buyer: {
        fullName: string;
        phone: string;
        address: ShippingAddress;
        gstin: string | null;
    };
    invoice: {
        invoiceNumber: string;
        invoiceDate: string;
        orderId: string;
    };
    isInterState: boolean;
    items: InvoiceItem[];
    totals: {
        subTotal: number;
        totalCgst: number;
        totalSgst: number;
        totalIgst: number;
        totalGstAmount: number;
        shippingCharge: number;
        totalAmount: number;
    };
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

    getWarehouseOrders: async (warehouseId: string): Promise<Order[]> => {
        const response = await axiosClient.get<Order[]>(`/orders/warehouse/${warehouseId}`);
        return response.data;
    },

    dispatchItem: (orderId: string, variantId: string, warehouseId: string) =>
        axiosClient.post(`/orders/${orderId}/dispatch`, { variantId, warehouseId }),

    confirmBulkItemDispatch: (orderId: string, warehouseId: string) =>
        axiosClient.post(`/orders/${orderId}/bulk-dispatch`, { warehouseId }),

    reassignWarehouse: (orderId: string, oldWarehouseId: string, newWarehouseId: string) =>
        axiosClient.post(`/orders/${orderId}/reassign-warehouse`, { oldWarehouseId, newWarehouseId }),

    getInvoice: async (id: string): Promise<InvoiceData> => {
        const response = await axiosClient.get<InvoiceData>(`/orders/${id}/invoice`);
        return response.data;
    },

    getPackingSlip: async (id: string): Promise<any> => {
        const response = await axiosClient.get(`/orders/${id}/packing-slip`);
        return response.data;
    },
};

