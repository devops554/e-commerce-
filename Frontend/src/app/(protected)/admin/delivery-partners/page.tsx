"use client"
import React from 'react'
import DeliveryPartnerTable from './_components/DeliveryPartnerTable'
import { Button } from '@/components/ui/button'
import { Plus, Bike, Users2 } from 'lucide-react'
import Link from 'next/link'

const DeliveryPartnersPage = () => {
    return (
        <div className="space-y-8 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Bike className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Delivery Fleet</h1>
                    </div>
                    <p className="text-slate-500 font-bold ml-1.5">Manage and monitor your decentralized delivery network.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/admin/delivery-partners/register">
                        <Button className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                            <Plus className="mr-2 h-5 w-5" />
                            Register Partner
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stats cards could go here */}
            </div>

            {/* Main Content */}
            <DeliveryPartnerTable />
        </div>
    )
}

export default DeliveryPartnersPage
