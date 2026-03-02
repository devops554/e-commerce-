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
        const token = Cookies.get('token');
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
    (error) => {
        const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';

        if (error.response?.status === 401) {
            // Handle unauthorized - maybe clear cookies and redirect
            Cookies.remove('token');
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        } else if (error.response?.status === 403) {
            toast.error("Access Denied: You don't have permission to perform this action.");
        } else {
            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
