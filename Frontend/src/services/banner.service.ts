import axiosClient from '../lib/axiosClient';
import { User } from './user.service';

export type BannerType = 'home' | 'category' | 'search_page' | 'product_type' | 'product_detail';

export const BANNER_TYPE: Record<string, BannerType> = {
    HOME: 'home',
    CATEGORY: 'category',
    SEARCH_PAGE: 'search_page',
    PRODUCT_TYPE: 'product_type',
    PRODUCT_DETAIL: 'product_detail',
};


export enum BannerStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export interface ButtonConfig {
    text?: string;
    link?: string;
}

export interface BannerStat {
    label: string;
    value: string;
}

export interface Banner {
    _id: string;
    pages: BannerType[];
    title: string;
    subtitle?: string;
    description?: string;
    backgroundImage?: string;
    mobileImage?: string;
    primaryButton?: ButtonConfig;
    secondaryButton?: ButtonConfig;
    showSearchBar: boolean;
    showStats: boolean;
    stats: BannerStat[];
    status: BannerStatus;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    updatedBy?: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateBannerDto {
    pages?: BannerType[];
    title: string;
    subtitle?: string;
    description?: string;
    backgroundImage?: string;
    mobileImage?: string;
    primaryButton?: ButtonConfig;
    secondaryButton?: ButtonConfig;
    showSearchBar?: boolean;
    showStats?: boolean;
    stats?: BannerStat[];
    status?: BannerStatus;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> { }

export interface BannerQuery {
    page?: string;
    limit?: string;
    status?: BannerStatus;
    pages?: string;
}

export const bannerService = {
    getAll: async (params?: BannerQuery): Promise<any> => {
        const response = await axiosClient.get('/admin/banners', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Banner> => {
        const response = await axiosClient.get(`/admin/banners/${id}`);
        return response.data;
    },

    getByPage: async (page: string): Promise<Banner[]> => {
        const response = await axiosClient.get(`/banners/page/${page}`);
        return response.data;
    },

    create: async (data: CreateBannerDto): Promise<Banner> => {
        const response = await axiosClient.post('/admin/banners', data);
        return response.data;
    },

    update: async (id: string, data: UpdateBannerDto): Promise<Banner> => {
        const response = await axiosClient.put(`/admin/banners/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await axiosClient.delete(`/admin/banners/${id}`);
        return response.data;
    },
};
