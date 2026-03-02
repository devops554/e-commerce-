import axiosClient from '../lib/axiosClient';
import { User } from './user.service';

export interface ProductType {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive: boolean;
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
}

export interface ProductTypeResponse {
    productTypes: ProductType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const productTypeService = {
    getAll: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }) => {
        const response = await axiosClient.get<ProductTypeResponse>('/product-types', { params });
        return response.data;
    },

    getOne: async (idOrSlug: string) => {
        const response = await axiosClient.get<ProductType>(`/product-types/${idOrSlug}`);
        return response.data;
    },

    create: async (data: Partial<ProductType>) => {
        const response = await axiosClient.post<ProductType>('/product-types', data);
        return response.data;
    },

    update: async (id: string, data: Partial<ProductType>) => {
        const response = await axiosClient.patch<ProductType>(`/product-types/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosClient.delete(`/product-types/${id}`);
        return response.data;
    },
};
