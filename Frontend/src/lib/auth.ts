import Cookies from 'js-cookie';
import { UserData } from '@/types/auth';

export const getUser = (): UserData | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const clearAuthData = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
};
