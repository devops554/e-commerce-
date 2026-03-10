"use client"
import React from 'react'
import { useParams } from 'next/navigation'
import DeliveryPartnerForm from '@/components/delivery-partners/DeliveryPartnerForm'
import { useDeliveryPartnerById } from '@/hooks/useDeliveryPartners'
import { Loader2 } from 'lucide-react'

export default function EditPartnerPage() {
    const { id } = useParams()
    const { data: partner, isLoading } = useDeliveryPartnerById(id as string)

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin" />
                    <Loader2 className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 text-slate-900 animate-pulse" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading partner data...</p>
            </div>
        )
    }

    if (!partner) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-600">Partner not found</h1>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Partner</h1>
                    <p className="text-slate-500 font-bold text-lg">Update details for {partner.name}</p>
                </div>
            </div>

            <DeliveryPartnerForm initialData={partner} mode="update" />
        </div>
    )
}
