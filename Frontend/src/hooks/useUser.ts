import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UserAddress, UserProfile } from "@/services/user.service";

export const useUserProfile = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: () => userService.getProfile(),
        enabled,
    });
};

export const useAddAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (addressData: any) => userService.addAddress(addressData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useUpdateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (addressData: any) => userService.updateAddress(addressData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useDeleteAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (addressId: string) => userService.removeAddress(addressId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useAllUsers = (page?: string, limit?: string, role?: string, status?: string, search?: string) => {
    return useQuery({
        queryKey: ['all-users', page, limit, role, status, search],
        queryFn: () => userService.getAllUsers(page, limit, role, status, search),
    });
};

export const useUser = (id: string) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => userService.getUserById(id),
        enabled: !!id,
    });
};

export const useUpdateStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => userService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-users'] });
        },
    });
};

export const useRegisterManager = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (managerData: any) => userService.registerManager(managerData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-users'] });
        },
    });
};
