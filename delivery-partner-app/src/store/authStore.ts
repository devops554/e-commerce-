// src/store/authStore.ts

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { DeliveryPartner } from '../types';

interface AuthState {
  partner: DeliveryPartner | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (partner: DeliveryPartner, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  updatePartner: (partner: Partial<DeliveryPartner>) => void;
  loadStoredAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  partner: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (partner, accessToken, refreshToken) => {
    await SecureStore.setItemAsync('accessToken', String(accessToken));
    await SecureStore.setItemAsync('refreshToken', String(refreshToken));
    await SecureStore.setItemAsync('partnerId', String(partner._id));
    set({ partner, accessToken, isAuthenticated: true });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('partnerId');
    set({ partner: null, accessToken: null, isAuthenticated: false });
  },

  updatePartner: (updatedFields) => {
    const current = get().partner;
    if (current) {
      const mergedPartner = { ...current, ...updatedFields };
      // Deep merge documents if present
      if (updatedFields.documents && current.documents) {
        mergedPartner.documents = {
          ...current.documents,
          ...updatedFields.documents,
        };
      }
      set({ partner: mergedPartner });
    } else {
      set({ partner: updatedFields as DeliveryPartner });
    }
  },

  loadStoredAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        set({ isLoading: false });
        return false;
      }
      set({ accessToken: token, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },
}));