import axiosClient from '../lib/axiosClient';
import { User } from './user.service';

export interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive: boolean;
    parentId: string | null;
    productType: any;
    attributes?: { name: string }[];
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

export interface CategoryResponse {
    categories: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const categoryService = {
    getAll: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        productType?: string;
        parentId?: string | null;
        isActive?: boolean;
    }) => {
        const response = await axiosClient.get<CategoryResponse>('/categories', { params });
        return response.data;
    },

    getSubcategories: async (parentId: string, params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }) => {
        const response = await axiosClient.get<CategoryResponse>(`/categories/${parentId}/subcategories`, { params });
        return response.data;
    },

    getOne: async (idOrSlug: string) => {
        const response = await axiosClient.get<Category>(`/categories/${idOrSlug}`);
        return response.data;
    },

    create: async (data: Partial<Category>) => {
        const response = await axiosClient.post<Category>('/categories', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Category>) => {
        const response = await axiosClient.patch<Category>(`/categories/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosClient.delete(`/categories/${id}`);
        return response.data;
    },
};
