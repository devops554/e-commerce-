import axiosClient from '../lib/axiosClient';

export enum ReviewStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface ImageAsset {
    url: string;
    publicId?: string;
}

export interface Review {
    _id: string;
    rating: number;
    comment: string;
    images?: ImageAsset[];
    productId: any;
    orderId: any;
    customerId: any;
    deliveryRating: number;
    deliveryComment?: string;
    status: ReviewStatus;
    moderatedBy?: string;
    moderatedAt?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewResponse {
    data: Review[];
    total: number;
    page: number;
    totalPages: number;
}

export const reviewService = {
    create: async (data: {
        orderId: string;
        productId: string;
        rating: number;
        comment: string;
        deliveryRating: number;
        deliveryComment?: string;
        images?: ImageAsset[];
    }) => {
        const response = await axiosClient.post<Review>('/reviews', data);
        return response.data;
    },

    getAll: async (params: {
        productId?: string;
        customerId?: string;
        orderId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }) => {
        const response = await axiosClient.get<ReviewResponse>('/reviews', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await axiosClient.get<Review>(`/reviews/${id}`);
        return response.data;
    },

    moderate: async (id: string, data: { status: ReviewStatus; rejectionReason?: string }) => {
        const response = await axiosClient.put<Review>(`/reviews/${id}/moderate`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosClient.delete(`/reviews/${id}`);
        return response.data;
    },
};
