"use client"
import React from 'react'
import DeliveryPartnerRegistrationForm from '../_components/DeliveryPartnerRegistrationForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const RegisterPartnerPage = () => {
    const router = useRouter()

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-8">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-12 w-12 rounded-2xl hover:bg-slate-100 border border-slate-100"
                >
                    <ArrowLeft className="h-6 w-6 text-slate-600" />
                </Button>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">Fleet Expansion</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Add New Delivery Partner</p>
                </div>
            </div>

            <DeliveryPartnerRegistrationForm />
        </div>
    )
}

export default RegisterPartnerPage
