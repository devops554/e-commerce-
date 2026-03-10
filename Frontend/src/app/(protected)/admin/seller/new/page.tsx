"use client"

import React from 'react'
import SellerForm from '@/components/admin/seller/SellerForm'
import { useRouter } from 'next/navigation'
import { useSellersActions } from '@/hooks/useSellers'
import { toast } from 'sonner'

export default function AddSellerPage() {
    const router = useRouter()
    const { registerSeller, isRegistering } = useSellersActions()

    const handleSubmit = async (data: any) => {
        try {
            await registerSeller(data)
            router.push('/admin/seller')
        } catch (error: any) {
            console.error('Registration failed:', error)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-10">
            <SellerForm
                title="Register New Seller"
                onSubmit={handleSubmit}
                isLoading={isRegistering}
            />
        </div>
    )
}
