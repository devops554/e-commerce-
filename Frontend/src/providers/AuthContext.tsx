"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserRole } from '@/services/user.service';

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (accessToken: string, refreshToken: string, user: User, redirectTo?: string) => void;
    logout: () => void;
    isLoaded: boolean;
    mutate: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isProduction = process.env.NODE_ENV === 'production';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedToken = Cookies.get('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setAccessToken(storedToken);
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setIsLoaded(true);
    }, []);

    const login = async (
        newAccessToken: string,
        newRefreshToken: string,
        newUser: User,
        redirectTo: string = '/'
    ) => {
        // 1. Set tokens and auth header immediately
        setAccessToken(newAccessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // ✅ secure + sameSite flags — production mein cookie sahi se send hogi
        Cookies.set('accessToken', newAccessToken, {
            expires: 7,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
        });
        Cookies.set('refreshToken', newRefreshToken, {
            expires: 7,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
        });

        // 2. Sync cart
        const savedCartStr = localStorage.getItem('cart');
        if (savedCartStr) {
            try {
                const savedCart = JSON.parse(savedCartStr);
                if (savedCart.items && savedCart.items.length > 0) {
                    const syncItems = savedCart.items.map((item: any) => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        title: item.title,
                        price: item.price,
                        image: item.image,
                    }));
                    const { cartService } = await import('@/services/cart.service');
                    await cartService.syncCart(syncItems);
                }
            } catch (err) {
                console.error('Failed to sync cart after login', err);
            }
        }

        // 3. Update user state
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        router.push(redirectTo);
    };

    const logout = () => {
        setAccessToken(null);
        setUser(null);
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        router.push('/auth/login');
    };

    const mutate = async () => {
        try {
            const { userService } = await import('@/services/user.service');
            const profile = await userService.getProfile();
            const updatedUser: User = {
                id: profile._id,
                email: profile.email,
                name: profile.name,
                role: profile.role,
                avatar: profile.profilePic,
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Failed to mutate user:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, isLoaded, mutate }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};