import axiosClient from '../lib/axiosClient';

// ─────────────────────────────────────────────
// ENUMS  (mirror the backend schema enums)
// ─────────────────────────────────────────────

export enum ReturnWindowUnit {
    DAYS = 'DAYS',
    HOURS = 'HOURS',
}

export enum ReturnCondition {
    UNUSED = 'UNUSED',
    ORIGINAL_PACKAGING = 'ORIGINAL_PACKAGING',
    WITH_TAGS = 'WITH_TAGS',
    ANY = 'ANY',
}

export enum RefundMethod {
    ORIGINAL_SOURCE = 'ORIGINAL_SOURCE',
    WALLET = 'WALLET',
    BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum ExchangeAllowed {
    YES = 'YES',
    NO = 'NO',
    SIZE_ONLY = 'SIZE_ONLY',
}

export enum ReturnRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
    PICKED_UP = 'PICKED_UP',
    RECEIVED_AT_WAREHOUSE = 'RECEIVED_AT_WAREHOUSE',
    QC_PASSED = 'QC_PASSED',
    QC_FAILED = 'QC_FAILED',
    REFUND_INITIATED = 'REFUND_INITIATED',
    REFUND_COMPLETED = 'REFUND_COMPLETED',
    CLOSED = 'CLOSED',
}

export enum ReturnReason {
    DAMAGED = 'DAMAGED',
    WRONG_ITEM = 'WRONG_ITEM',
    NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
    DEFECTIVE = 'DEFECTIVE',
    SIZE_ISSUE = 'SIZE_ISSUE',
    CHANGED_MIND = 'CHANGED_MIND',
    OTHER = 'OTHER',
}

export enum QcGrade {
    RESELLABLE = 'RESELLABLE',
    REFURBISH = 'REFURBISH',
    DISPOSE = 'DISPOSE',
}

// ─────────────────────────────────────────────
// SHARED SUB-INTERFACES
// ─────────────────────────────────────────────

export interface ImageAsset {
    url: string;
    publicId: string;
}

export interface GstInfo {
    hsnCode: string;
    gstRate: number;          // 0 | 3 | 5 | 12 | 18 | 28
    includedInPrice: boolean;
}

// ─────────────────────────────────────────────
// RETURN POLICY INTERFACES (NEW)
// ─────────────────────────────────────────────

/**
 * ReturnPolicy — lives on Product.returnPolicy
 * Controls whether this product is returnable and under what terms.
 */
export interface ReturnPolicy {
    isReturnable: boolean;
    windowValue: number;
    windowUnit: ReturnWindowUnit;
    conditions: ReturnCondition[];
    requiresQcPhoto: boolean;
    doorstepQcRequired: boolean;
    refundMethods: RefundMethod[];
    exchangeAllowed: ExchangeAllowed;
    nonReturnableReasons: string[];
    excludedSkuPatterns: string[];
    internalNote: string;
}


/**
 * ReturnRequest — standalone document created when a customer
 * initiates a return. Linked to Order, Product, Variant, Shipment.
 */
export interface ReturnRequest {
    _id: string;
    orderId: string;
    orderItemId: string;
    productId: string;
    variantId: string;
    customerId: string;
    sellerId?: string;
    reason: ReturnReason;
    reasonDescription?: string;
    evidenceMedia: ImageAsset[];
    status: ReturnRequestStatus;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    returnShipmentId?: string;
    warehouseQcGrade?: QcGrade;
    warehouseQcNotes?: string;
    warehouseReceivedAt?: string;
    refundMethod?: RefundMethod;
    refundAmount?: number;
    gstReversalAmount?: number;
    refundTransactionId?: string;
    refundInitiatedAt?: string;
    refundCompletedAt?: string;
    quantity: number;
    reviewedBy?: string;
    adminNote?: string;
    createdAt: string;
    updatedAt: string;
}

// ─────────────────────────────────────────────
// PRODUCT INTERFACES
// ─────────────────────────────────────────────

export interface ProductVariant {
    _id: string;
    product: string;
    sku: string;
    price: number;
    discount: number;
    discountPrice: number;
    stock: number;
    unit?: {
        name?: string;
        value?: string;
    };
    attributes: {
        name: string;
        value: string;
    }[];
    isFeatured?: string[];
    images: ImageAsset[];
    weightKg?: number;
    dimensionsCm?: {
        length: number;
        width: number;
        height: number;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Faq {
    question: string;
    answer: string;
    isActive: boolean;
}

export interface Product {
    _id: string;
    title: string;
    slug: string;
    faqs: Faq[];
    description: string;
    shortDescription: string;
    category: any;
    subCategory?: any;
    productType?: any;
    brand: string;
    baseSku: string;
    thumbnail: ImageAsset;
    variants?: ProductVariant[];
    images: ImageAsset[];
    availableSizes: string[];
    availableColors: string[];
    availableStorage: string[];
    availableModels: string[];
    ratingsAverage: number;
    ratingsCount: number;
    keywords: string[];
    tags: string[];
    isNewArrival: boolean;
    specifications: Record<string, any>;
    highLight?: {
        materialtype?: string;
        ingredients?: string;
        nutritionalInfo?: string;
        usage?: string;
        dietryPreference?: string;
        storage?: string;
    };
    attributes?: { name: string; value: string }[];
    warranty?: string;
    disclaimer?: string;
    customerCareDetails?: {
        name?: string;
        address?: string;
        email?: string;
        phone?: string;
        profilePic?: string;
    };
    manufacturerInfo: {
        name?: string;
        address?: string;
        countryOfOrigin?: string;
        selfLife?: string;
    };
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
    };
    isActive: boolean;
    isDeleted: boolean;
    order: number;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
    updatedBy?: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
    gst?: GstInfo;
    // Return policy (NEW)
    returnPolicy?: ReturnPolicy;
}

// ─────────────────────────────────────────────
// RESPONSE INTERFACES
// ─────────────────────────────────────────────

export interface ProductResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ReturnRequestResponse {
    returnRequests: ReturnRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export const productService = {
    // ── Products ──
    getAll: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        subCategory?: string;
        brand?: string;
        isActive?: boolean;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
    }) => {
        const response = await axiosClient.get<ProductResponse>('/products', { params });
        return response.data;
    },

    getOne: async (idOrSlug: string) => {
        const response = await axiosClient.get<Product & { variants: ProductVariant[] }>(
            `/products/${idOrSlug}`,
        );
        return response.data;
    },

    create: async (data: any) => {
        const response = await axiosClient.post<Product>('/products', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await axiosClient.patch<Product>(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosClient.delete(`/products/${id}`);
        return response.data;
    },

    // ── Variants ──
    createVariant: async (data: any) => {
        const response = await axiosClient.post<ProductVariant>('/products/variants', data);
        return response.data;
    },

    updateVariant: async (id: string, data: any) => {
        const response = await axiosClient.patch<ProductVariant>(`/products/variants/${id}`, data);
        return response.data;
    },

    deleteVariant: async (id: string) => {
        const response = await axiosClient.delete(`/products/variants/${id}`);
        return response.data;
    },

    getVariants: async (productId: string) => {
        const response = await axiosClient.get<ProductVariant[]>(
            `/products/${productId}/variants`,
            { params: { _t: Date.now() } },
        );
        return response.data;
    },

    // ── Search ──
    getSuggestions: async (q: string): Promise<string[]> => {
        if (!q || q.trim().length < 1) return [];
        const response = await axiosClient.get<string[]>('/products/suggestions', { params: { q } });
        return response.data;
    },

    // ── Return requests (NEW) ──
    /**
     * Create a return request for a delivered order item.
     * POST /return-requests
     */
    createReturnRequest: async (data: {
        orderId: string;
        orderItemId: string;
        productId: string;
        variantId: string;
        reason: ReturnReason;
        reasonDescription?: string;
        evidenceMedia?: ImageAsset[];
        quantity?: number;
    }) => {
        const response = await axiosClient.post<ReturnRequest>('/return-requests', data);
        return response.data;
    },

    /**
     * Get all return requests (admin).
     * GET /return-requests
     */
    getAllReturnRequests: async (params: {
        page?: number;
        limit?: number;
        status?: ReturnRequestStatus;
        customerId?: string;
        sellerId?: string;
        productId?: string;
    }) => {
        const response = await axiosClient.get<ReturnRequestResponse>('/return-requests', { params });
        return response.data;
    },

    /**
     * Get a single return request by ID.
     * GET /return-requests/:id
     */
    getReturnRequest: async (id: string) => {
        const response = await axiosClient.get<ReturnRequest>(`/return-requests/${id}`);
        return response.data;
    },

    /**
     * Get all return requests for the current customer.
     * GET /return-requests/my
     */
    getMyReturnRequests: async (params?: { page?: number; limit?: number }) => {
        const response = await axiosClient.get<ReturnRequestResponse>('/return-requests/my', {
            params,
        });
        return response.data;
    },

    /**
     * Approve or reject a return request (admin).
     * PATCH /return-requests/:id/review
     */
    reviewReturnRequest: async (
        id: string,
        data: { approved: boolean; rejectionReason?: string; adminNote?: string },
    ) => {
        const response = await axiosClient.patch<ReturnRequest>(
            `/return-requests/${id}/review`,
            data,
        );
        return response.data;
    },

    /**
     * Update warehouse QC result after item is received.
     * PATCH /return-requests/:id/warehouse-qc
     */
    updateWarehouseQc: async (
        id: string,
        data: { warehouseQcGrade: QcGrade; warehouseQcNotes?: string },
    ) => {
        const response = await axiosClient.patch<ReturnRequest>(
            `/return-requests/${id}/warehouse-qc`,
            data,
        );
        return response.data;
    },

    /**
     * Initiate refund after QC passes.
     * PATCH /return-requests/:id/refund
     */
    initiateRefund: async (
        id: string,
        data: { refundMethod: RefundMethod; refundAmount: number },
    ) => {
        const response = await axiosClient.patch<ReturnRequest>(
            `/return-requests/${id}/refund`,
            data,
        );
        return response.data;
    },
};