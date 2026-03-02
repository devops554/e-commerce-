import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannerService, CreateBannerDto, UpdateBannerDto, BannerQuery } from "@/services/banner.service";
import { toast } from "sonner";


export const useBanners = (params?: BannerQuery) => {
    return useQuery({
        queryKey: ['banners', params],
        queryFn: () => bannerService.getAll(params),
    });
};

export const usePublicBanners = (page: string) => {
    return useQuery({
        queryKey: ['banners', 'public', page],
        queryFn: () => bannerService.getByPage(page),
        enabled: !!page,
    });
};

export const useBanner = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['banner', id],
        queryFn: () => bannerService.getById(id),
        enabled: enabled && !!id,
    });
};

export const useCreateBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBannerDto) => bannerService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            toast.success("Banner created successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create banner");
        }
    });
};

export const useUpdateBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBannerDto }) =>
            bannerService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            queryClient.invalidateQueries({ queryKey: ['banner'] });
            toast.success("Banner updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update banner");
        }
    });
};

export const useDeleteBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => bannerService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            toast.success("Banner deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete banner");
        }
    });
};
