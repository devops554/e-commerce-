"use client"

import { Providers as ReduxProvider } from '@/store/Providers'
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from './AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ReduxProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                    <Toaster position="top-center" richColors />
                </QueryClientProvider>
            </ReduxProvider>
        </AuthProvider>
    )
}
