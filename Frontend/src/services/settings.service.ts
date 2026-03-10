import axiosClient from '../lib/axiosClient';

export const settingsService = {
    getStoreConfig: async () => {
        const response = await axiosClient.get('/admin/settings/store-config');
        return response.data;
    },

    updateStoreConfig: async (data: any) => {
        const response = await axiosClient.patch('/admin/settings/store-config', data);
        return response.data;
    },
};
