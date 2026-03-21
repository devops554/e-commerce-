import axiosClient from '../lib/axiosClient';

export enum UserRole {
    ADMIN = 'admin',
    SUB_ADMIN = 'subadmin',
    SELLER = 'seller',
    CUSTOMER = 'customer',
    MANAGER = 'manager',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BLOCKED = 'blocked',
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    profilePic?: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UserAddress {
    _id: string;
    label: string; // "Home", "Office", etc.
    fullName: string;
    phone: string;
    UserStatus: UserStatus;
    UserRole: UserRole;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    location?: {
        latitude: number;
        longitude: number;
    };
}

export type CreateUserAddressDto = Omit<UserAddress, '_id' | 'isDefault'> & {
    isDefault?: boolean;
};

export type UpdateUserAddressDto = Partial<CreateUserAddressDto> & {
    _id: string;
};

export interface BankAccount {
    _id: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    isDefault: boolean;
}

export type CreateBankAccountDto = Omit<BankAccount, '_id' | 'isDefault'> & {
    isDefault?: boolean;
};

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    profilePic?: string;
    status: UserStatus;
    addresses: UserAddress[];
    bankAccounts?: BankAccount[];
    createdAt: string;
    updatedAt: string;
}

export const userService = {
    getProfile: async (): Promise<UserProfile> => {
        const response = await axiosClient.get<UserProfile>('/users/profile');
        return response.data;
    },

    updateProfile: async (data: { name?: string; phone?: string; profilePic?: string }): Promise<UserProfile> => {
        const response = await axiosClient.patch<UserProfile>('/users/profile', data);
        return response.data;
    },

    changePassword: async (data: any): Promise<any> => {
        const response = await axiosClient.post('/users/change-password', data);
        return response.data;
    },

    addAddress: async (addressData: CreateUserAddressDto): Promise<any> => {
        const response = await axiosClient.post('/users/address', addressData);
        return response.data;
    },

    updateAddress: async (addressData: UpdateUserAddressDto): Promise<any> => {
        const response = await axiosClient.post('/users/address', addressData);
        return response.data;
    },

    removeAddress: async (addressId: string): Promise<any> => {
        const response = await axiosClient.delete(`/users/address/${addressId}`);
        return response.data;
    },

    addBankAccount: async (bankAccountData: CreateBankAccountDto): Promise<any> => {
        const response = await axiosClient.post('/users/bank-account', bankAccountData);
        return response.data;
    },

    removeBankAccount: async (accountId: string): Promise<any> => {
        const response = await axiosClient.delete(`/users/bank-account/${accountId}`);
        return response.data;
    },

    getAllUsers: async (page?: string, limit?: string, role?: string, status?: string, search?: string): Promise<{ users: UserProfile[]; total: number; page: number; limit: number; totalPages: number }> => {
        const response = await axiosClient.get('/users/all', { params: { page, limit, role, status, search } });
        return response.data;
    },

    getUserById: async (id: string): Promise<UserProfile> => {
        const response = await axiosClient.get<UserProfile>(`/users/${id}`);
        return response.data;
    },

    updateStatus: async (id: string, status: string): Promise<any> => {
        const response = await axiosClient.patch(`/users/${id}/status`, { status });
        return response.data;
    },

    registerManager: async (managerData: any): Promise<any> => {
        const response = await axiosClient.post('/auth/register-manager', managerData);
        return response.data;
    },
};
