import axiosClient from '../lib/axiosClient';

export interface SellerRegistrationData {
    name: string;
    email: string;
    phone: string;
    storeName: string;
    storeDescription?: string;
    businessType: string;
    panNumber: string;
    gstNumber: string;
    productTypes: string[];
    productCategories: string[];
    topCategories: string[];
    retailChannels: string[];
    monthlySales?: string;
    referenceLinks?: string[];
    socialChannels?: string[];
    socialMediaLinks?: string[];
    userCounts?: string[];
    spocDetails: {
        name: string;
        email: string;
        designation: string;
    };
    documentPaths?: {
        aadhar?: string;
        pan?: string;
        passbook?: string;
        digitalSignature?: string;
    };
    bankDetails: {
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
    };
    pickupAddress: {
        addressLine: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
}

export const sellerService = {
    register: async (data: SellerRegistrationData) => {
        const response = await axiosClient.post('/sellers/register', data);
        return response.data;
    },

    getProfile: async () => {
        const response = await axiosClient.get('/sellers/profile');
        return response.data;
    },

    getAllSellers: async () => {
        const response = await axiosClient.get('/sellers');
        return response.data;
    },

    updateStatus: async (id: string, status: string) => {
        const response = await axiosClient.patch(`/sellers/${id}/status`, { status });
        return response.data;
    },

    getSellerBySlug: async (slug: string) => {
        const response = await axiosClient.get(`/sellers/slug/${slug}`);
        return response.data;
    },
};
