"use client"

import React, { useEffect, useState } from 'react'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import DeliveryPartnerTable from '@/components/delivery-partners/DeliveryPartnerTable'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bike, Loader2 } from 'lucide-react'

const ManagerDeliveryPartnersPage = () => {
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: isWarehouseLoading } = useManagerWarehouse()

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Manager Dashboard', href: '/manager' },
            { label: 'Delivery Partners' }
        ])
    }, [setBreadcrumbs])

    if (isWarehouseLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        )
    }

    if (!warehouse) {
        return (
            <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-20">
                    <Bike className="h-16 w-16 text-slate-300 mb-4" />
                    <CardTitle className="text-xl font-bold text-slate-700">No Warehouse Assigned</CardTitle>
                    <CardDescription className="text-center mt-2 max-w-sm">
                        You need an assigned warehouse to manage delivery partners.
                    </CardDescription>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Delivery Partners</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Fleet for {warehouse.name}
                    </p>
                </div>
            </div>

            <DeliveryPartnerTable
                warehouseId={warehouse._id}
                basePath="/manager/delivery-partners"
            />
        </div>
    )
}

export default ManagerDeliveryPartnersPage
