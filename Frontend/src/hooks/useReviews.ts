"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, ReviewStatus } from '../services/review.service';
import { toast } from 'react-hot-toast';

export const useReviews = (params: {
    productId?: string;
    customerId?: string;
    orderId?: string;
    status?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: ['reviews', params],
        queryFn: () => reviewService.getAll(params),
        enabled: !!params.productId || !!params.customerId || !!params.status || !!params.orderId,
    });
};

export const useReviewActions = () => {
    const queryClient = useQueryClient();

    const createReviewMutation = useMutation({
        mutationFn: (payload: any) => reviewService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success('Review submitted successfully! It will appear after moderation.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    });

    const moderateReviewMutation = useMutation({
        mutationFn: ({ id, status, rejectionReason }: { id: string; status: ReviewStatus; rejectionReason?: string }) => 
            reviewService.moderate(id, { status, rejectionReason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success('Review moderated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to moderate review');
        }
    });

    return {
        createReview: createReviewMutation.mutateAsync,
        moderateReview: moderateReviewMutation.mutateAsync,
        isCreating: createReviewMutation.isPending,
        isModerating: moderateReviewMutation.isPending,
    };
};
