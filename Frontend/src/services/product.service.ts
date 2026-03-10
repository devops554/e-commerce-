import axiosClient from '../lib/axiosClient';
import { User } from './user.service';

export interface Product {
    _id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    category: any;
    subCategory?: any;
    productType?: any;
    brand: string;
    baseSku: string;
    thumbnail: {
        url: string;
        publicId: string;
    };
    variants?: ProductVariant[];
    images: {
        url: string;
        publicId: string;
    }[];
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
    gst?: {
        hsnCode: string;
        gstRate: number;
        includedInPrice: boolean;
    };
}

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
    images: {
        url: string;
        publicId: string;
    }[];

    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const productService = {
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
        const response = await axiosClient.get<Product & { variants: ProductVariant[] }>(`/products/${idOrSlug}`);
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

    // Variants
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
        const response = await axiosClient.get<ProductVariant[]>(`/products/${productId}/variants`, {
            params: { _t: Date.now() }
        });
        return response.data;
    },

    getSuggestions: async (q: string): Promise<string[]> => {
        if (!q || q.trim().length < 1) return [];
        const response = await axiosClient.get<string[]>('/products/suggestions', { params: { q } });
        return response.data;
    },
};
