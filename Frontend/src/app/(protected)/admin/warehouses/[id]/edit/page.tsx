"use client"

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { WarehouseForm } from '../../_components/WarehouseForm'
import { useWarehouse, useWarehouseActions } from '@/hooks/useWarehouses'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'

export default function EditWarehousePage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: isFetching } = useWarehouse(id)
    const { updateWarehouse, isUpdating } = useWarehouseActions()

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Warehouses', href: '/admin/warehouses' },
            { label: 'Edit Warehouse' }
        ])
    }, [setBreadcrumbs])

    const handleSubmit = async (values: any) => {
        try {
            await updateWarehouse({ id, data: values })
            router.push('/admin/warehouses')
        } catch (error) {
            // Error handled in hook
        }
    }

    if (isFetching) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
            </div>
        )
    }

    if (!warehouse) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold">Warehouse not found</h2>
                <Button onClick={() => router.push('/admin/warehouses')} className="mt-4">
                    Back to List
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Edit Warehouse</h1>
                    <p className="text-gray-500 font-medium">Update facility details for {warehouse.name}</p>
                </div>
            </div>

            <Card className="rounded-[40px] border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardContent className="p-8 sm:p-10">
                    <WarehouseForm
                        initialData={warehouse}
                        onSubmit={handleSubmit}
                        isLoading={isUpdating}
                        buttonText="Update Warehouse"
                    />
                </CardContent>
            </Card>
        </div>
    )
}
