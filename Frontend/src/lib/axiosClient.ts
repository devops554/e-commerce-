import axios from 'axios';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
axiosClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

import { toast } from 'sonner';

// Add a response interceptor to handle errors globally
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get('refreshToken');
                if (!refreshToken) throw new Error('No refresh token available');

                // Use a fresh axios instance to avoid infinite loops with interceptors
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                Cookies.set('accessToken', newAccessToken, { expires: 7 });
                Cookies.set('refreshToken', newRefreshToken, { expires: 7 });

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                localStorage.removeItem('user');
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
                return Promise.reject(refreshError);
            }
        } else if (error.response?.status === 403) {
            toast.error("Access Denied: You don't have permission to perform this action.");
        } else {
            // Avoid double toasting if it's a 401 that we're trying to refresh
            // Also avoid toasting for /carts background requests to avoid "bad impression"
            const url = error.config?.url || '';
            const isCartRequest = url.includes('/carts') || url.includes('carts');
            if (error.response?.status !== 401 && !isCartRequest) {
                toast.error(errorMessage);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
