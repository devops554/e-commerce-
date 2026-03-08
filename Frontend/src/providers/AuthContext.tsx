"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (accessToken: string, refreshToken: string, user: User, redirectTo?: string) => void;
    logout: () => void;
    isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

            // Set default auth header for axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setIsLoaded(true);
    }, []);

    const login = async (newAccessToken: string, newRefreshToken: string, newUser: User, redirectTo: string = '/') => {
        // 1. Set tokens and auth header immediately
        setAccessToken(newAccessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        Cookies.set('accessToken', newAccessToken, { expires: 7 });
        Cookies.set('refreshToken', newRefreshToken, { expires: 7 });

        // 2. Sync cart while still "guest-ish" in state but authorized in headers
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
                        image: item.image
                    }));

                    const { cartService } = await import('@/services/cart.service');
                    await cartService.syncCart(syncItems);
                    // Clear local guest cart after sync to avoid double merging later
                    // Or keep it as Redux will be updated by useCart's remote fetch soon
                }
            } catch (err) {
                console.error("Failed to sync cart after login", err);
            }
        }

        // 3. Finally update user state and finish login
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        router.push(redirectTo);
    };

    const logout = () => {
        setAccessToken(null);
        setUser(null);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, isLoaded }}>
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
