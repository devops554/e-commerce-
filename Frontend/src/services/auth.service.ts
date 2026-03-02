import axiosClient from '../lib/axiosClient';

export interface RegisterSubAdminDto {
    email: string;
    name: string;
    password: string;
    phone?: string;
}

export const authService = {
    registerSubAdmin: async (data: RegisterSubAdminDto) => {
        const response = await axiosClient.post('/auth/register-subadmin', data);
        return response.data;
    },
};
